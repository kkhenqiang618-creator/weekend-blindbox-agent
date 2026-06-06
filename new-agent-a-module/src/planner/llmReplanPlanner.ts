import type { LlmReplanConfig, PlanBChange, PlanBResult, Poi, Requirements, ReplanEvent, Route, RouteStep } from "../agent/types.ts";

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface LlmReplanDecision {
  replacementPoiId?: string;
  reason?: string;
  impact?: string;
}

const DEFAULT_MODEL = "deepseek-chat";
const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";

export async function replanRouteWithLLM(
  event: ReplanEvent,
  currentRoute: Route,
  pois: Poi[],
  requirements: Requirements,
  config: LlmReplanConfig = {}
): Promise<PlanBResult | null> {
  const targetStep = findTargetStep(event, currentRoute);
  if (!targetStep) return null;

  if (event.preferredReplacement && !event.customPreference?.trim()) {
    return buildExactReplacementResult(event, currentRoute, pois, requirements, targetStep);
  }

  const apiKey = config.apiKey || getLlmApiKey();
  if (!apiKey) return null;

  const candidates = await buildCandidatePool(event, targetStep, currentRoute, pois, requirements);
  if (candidates.length === 0) return null;

  const baseUrl = config.baseUrl || getLlmBaseUrl();
  const model = config.model || getLlmModel();
  const decision = await askModelForReplacement({
    apiKey,
    baseUrl,
    model,
    event,
    targetStep,
    currentRoute,
    requirements,
    candidates,
  });

  if (!decision?.replacementPoiId) return null;
  const replacement = candidates.find((poi) => poi.id === decision.replacementPoiId);
  if (!replacement) return null;

  const afterSteps = currentRoute.steps.map((step) => {
    if (step.poi.id !== targetStep.poi.id) return step;
    return {
      ...step,
      poi: replacement,
      note: `${decision.reason || replacement.reason}（LLM Plan B 替换）`,
    };
  });
  const afterRoute = summarizeRoute(afterSteps, getRequestedReplacementTypes(event, targetStep.poi));
  const changes: PlanBChange[] = [{
    action: "replace",
    from: targetStep.poi.name,
    to: replacement.name,
    reason: decision.reason || `${replacement.name} 更符合当前路线约束。`,
  }];

  return {
    event,
    impact: decision.impact || `${targetStep.poi.name} 已根据用户选择进入替换判断。`,
    beforeRoute: currentRoute,
    afterRoute,
    changes,
    keptPreferences: requirements.preferences.slice(0, 3),
    sacrificed: [targetStep.poi.name],
    message: `LLM 已根据当前路线和候选池，将「${targetStep.poi.name}」替换为「${replacement.name}」。`,
  };
}

function getLlmApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
}

function getLlmBaseUrl(): string {
  return process.env.OPENAI_BASE_URL || process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL;
}

function getLlmModel(): string {
  return process.env.OPENAI_MODEL || process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
}

async function askModelForReplacement({
  apiKey,
  baseUrl,
  model,
  event,
  targetStep,
  currentRoute,
  requirements,
  candidates,
}: {
  apiKey: string;
  baseUrl: string;
  model: string;
  event: ReplanEvent;
  targetStep: RouteStep;
  currentRoute: Route;
  requirements: Requirements;
  candidates: Poi[];
}): Promise<LlmReplanDecision | null> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "你是 WeekendBuddy 的路线微调 Agent。",
            "任务：从候选 POI 中选择一个最适合替换目标节点的地点。",
            "必须只返回严格 JSON，不要输出解释。",
            "JSON 字段：replacementPoiId, reason, impact。",
            "replacementPoiId 必须来自候选 POI 的 id；如果没有合适候选，返回空字符串。",
            "选择时综合考虑：用户原始偏好、预算、同行人、排队风险、路线区域衔接、停留时间、用户 message 中提到的替换方向。",
            "reason 用中文说明为什么推荐换成这个候选；impact 用中文说明对路线的影响。",
          ].join("\n"),
        },
        {
          role: "user",
          content: JSON.stringify({
            event,
            target: summarizeStep(targetStep),
            route: currentRoute.steps.map(summarizeStep),
            requirements,
            candidates: candidates.map(summarizePoi),
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM replan request failed: ${response.status}`);
  }

  const data = await response.json() as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  const parsed = safeParseJson(content);
  if (!parsed || typeof parsed !== "object") return null;
  return parsed as LlmReplanDecision;
}

async function buildCandidatePool(
  event: ReplanEvent,
  targetStep: RouteStep,
  currentRoute: Route,
  pois: Poi[],
  requirements: Requirements
): Promise<Poi[]> {
  const usedIds = new Set(currentRoute.steps.map((step) => step.poi.id));
  const directIds = targetStep.poi.replaceableBy ?? [];
  const requestedTypes = getRequestedReplacementTypes(event, targetStep.poi);
  const routeCluster = inferRouteCluster(currentRoute);
  const routeArea = inferRouteArea(currentRoute);
  const requireIndoor = hasIndoorIntent(event, requirements);
  const direct = pois
    .filter((poi) => directIds.includes(poi.id) && !usedIds.has(poi.id))
    .filter((poi) => matchesRequestedType(poi, requestedTypes))
    .filter((poi) => matchesIndoorIntent(poi, requireIndoor))
    .filter((poi) => matchesRouteArea(poi, routeCluster, routeArea));
  const sameType = pois
    .filter((poi) => !usedIds.has(poi.id))
    .filter((poi) => matchesRequestedType(poi, requestedTypes))
    .filter((poi) => matchesIndoorIntent(poi, requireIndoor))
    .filter((poi) => poi.fitPeople.includes(requirements.peopleType))
    .filter((poi) => poi.price <= Math.max(requirements.budgetMax, targetStep.poi.price + 80))
    .filter((poi) => matchesRouteArea(poi, routeCluster, routeArea))
    .filter((poi) => {
      if (targetStep.poi.routeCluster && poi.routeCluster) return poi.routeCluster === targetStep.poi.routeCluster;
      if (targetStep.poi.area && poi.area) return poi.area === targetStep.poi.area;
      return true;
    });
  const broad = pois
    .filter((poi) => !usedIds.has(poi.id))
    .filter((poi) => matchesRequestedType(poi, requestedTypes))
    .filter((poi) => matchesIndoorIntent(poi, requireIndoor))
    .filter((poi) => poi.fitPeople.includes(requirements.peopleType))
    .filter((poi) => poi.price <= Math.max(requirements.budgetMax, targetStep.poi.price + 120))
    .filter((poi) => matchesRouteArea(poi, routeCluster, routeArea));

  const liveCandidates = event.customPreference?.trim()
    ? await searchLivePoiCandidates(event, targetStep, requirements)
    : [];

  return uniquePois([...liveCandidates, ...direct, ...sameType, ...broad])
    .sort((a, b) => scoreCandidateLocality(b, routeCluster, routeArea) - scoreCandidateLocality(a, routeCluster, routeArea))
    .slice(0, 24);
}

async function searchLivePoiCandidates(
  event: ReplanEvent,
  targetStep: RouteStep,
  requirements: Requirements
): Promise<Poi[]> {
  const keyword = buildLiveSearchKeyword(event, targetStep, requirements);
  const amapKey = process.env.AMAP_API_KEY || process.env.AMAP_WEB_SERVICE_KEY || "cd4379a23805ac32e432f0e5db663013";

  try {
    const url = new URL("https://restapi.amap.com/v3/place/text");
    url.searchParams.set("key", amapKey);
    url.searchParams.set("keywords", keyword);
    url.searchParams.set("city", requirements.city || "深圳");
    url.searchParams.set("citylimit", "true");
    url.searchParams.set("offset", "8");
    url.searchParams.set("page", "1");
    url.searchParams.set("extensions", "base");

    const response = await fetch(url);
    if (!response.ok) throw new Error(`AMap search failed: ${response.status}`);
    const data = await response.json() as {
      status?: string;
      pois?: Array<{
        id?: string;
        name?: string;
        type?: string;
        address?: string | string[];
        adname?: string;
        business_area?: string;
        location?: string;
      }>;
    };

    if (data.status !== "1" || !Array.isArray(data.pois)) {
      return buildFallbackLiveCandidates(event, targetStep, requirements);
    }

    const candidates = data.pois
      .map((item, index) => poiFromAmap(item, index, event, targetStep, requirements))
      .filter((poi): poi is Poi => Boolean(poi));

    return candidates.length > 0 ? candidates : buildFallbackLiveCandidates(event, targetStep, requirements);
  } catch {
    return buildFallbackLiveCandidates(event, targetStep, requirements);
  }
}

function buildLiveSearchKeyword(event: ReplanEvent, targetStep: RouteStep, requirements: Requirements): string {
  const prompt = event.customPreference?.trim();
  if (prompt) return prompt;
  const corePreference = requirements.preferences[0] || targetStep.poi.type;
  return `${requirements.city}${corePreference}${targetStep.poi.type}`;
}

function poiFromAmap(
  item: {
    id?: string;
    name?: string;
    type?: string;
    address?: string | string[];
    adname?: string;
    business_area?: string;
    location?: string;
  },
  index: number,
  event: ReplanEvent,
  targetStep: RouteStep,
  requirements: Requirements
): Poi | null {
  if (!item.name) return null;
  const [lngText, latText] = (item.location || "").split(",");
  const lng = Number(lngText);
  const lat = Number(latText);
  const tags = inferLiveTags(event, targetStep, requirements);

  return {
    id: `live_amap_${item.id || index}`,
    name: item.name,
    type: inferPoiType(event, targetStep),
    subType: item.type?.split(";").at(-1) || targetStep.poi.subType || "实时推荐",
    address: Array.isArray(item.address) ? item.address.join("") : item.address,
    area: item.adname || targetStep.poi.area || requirements.city,
    businessDistrict: item.business_area || targetStep.poi.businessDistrict || item.adname || requirements.city,
    routeCluster: targetStep.poi.routeCluster || inferRouteClusterFromPoi(targetStep.poi),
    price: Math.min(Math.max(30, targetStep.poi.price || 60), requirements.budgetMax),
    priceLevel: targetStep.poi.priceLevel,
    meituanRating: 4.6,
    reviewCount: 800 + index * 137,
    tags,
    limits: ["可实时检索"],
    fitPeople: [requirements.peopleType],
    stayMinutes: targetStep.poi.stayMinutes,
    queueLevel: "low",
    distanceLevel: targetStep.poi.distanceLevel || "3-10km",
    mockMeituanUrl: `mock://amap/${item.id || index}`,
    reason: `根据你的补充要求「${event.customPreference}」，Agent 通过高德地点检索找到这个替代点，并交给 LLM 判断是否适合替换。`,
    blindBoxThemes: [requirements.preferences.includes("拍照") ? "小众拍照吃货盒" : "周末轻松探索盒"],
    availableTools: ["amapPlaceSearch", "queueCheck", "availabilityCheck"],
    bookingRequired: false,
    weatherSensitive: false,
    priorityScore: 86 - index,
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
  };
}

function getRequestedReplacementTypes(event: ReplanEvent, targetPoi: Poi): string[] {
  const text = event.customPreference || event.message || "";
  const types: string[] = [];

  if (/室内.*(娱乐|玩|活动)|娱乐.*室内|电玩城|桌游|密室|KTV|电影|游戏|剧本/.test(text)) {
    types.push("休闲娱乐");
  }
  if (/diy|DIY|手工|手作|陶艺|银饰|香薰|烘焙|画画|绘画/.test(text)) {
    types.push("文化体验", "休闲娱乐");
  }
  if (/展|美术馆|博物馆|艺术|文化|书店/.test(text)) {
    types.push("文化体验");
  }
  if (/咖啡|奶茶|甜|饮|茶/.test(text)) {
    types.push("轻食甜饮");
  }
  if (/吃|饭|餐|火锅|烧烤|菜/.test(text)) {
    types.push("餐饮正餐");
  }
  if (/拍照|打卡|出片|地标|夜景/.test(text)) {
    types.push("拍照地标", "文化体验");
  }
  if (/公园|散步|户外|徒步|citywalk/i.test(text)) {
    types.push("户外散步");
  }

  return [...new Set(types.length > 0 ? types : [targetPoi.type])];
}

function matchesRequestedType(poi: Poi, requestedTypes: string[]): boolean {
  return requestedTypes.length === 0 || requestedTypes.includes(poi.type);
}

function hasIndoorIntent(event: ReplanEvent, requirements: Requirements): boolean {
  const text = [
    event.customPreference,
    event.message,
    requirements.rawText,
    ...requirements.preferences,
    ...requirements.constraints
  ].filter(Boolean).join(" ");
  return /室内|下雨|雨天/.test(text);
}

function matchesIndoorIntent(poi: Poi, requireIndoor: boolean): boolean {
  if (!requireIndoor) return true;
  return poi.limits.includes("室内") || poi.limits.includes("雨天可去") || poi.weatherSensitive === false;
}

function inferRouteCluster(route: Route): string | undefined {
  const counts = new Map<string, number>();
  for (const step of route.steps) {
    if (!step.poi.routeCluster) continue;
    counts.set(step.poi.routeCluster, (counts.get(step.poi.routeCluster) ?? 0) + 1);
  }
  return [...counts.entries()].sort(([, a], [, b]) => b - a)[0]?.[0];
}

function inferRouteArea(route: Route): string | undefined {
  const counts = new Map<string, number>();
  for (const step of route.steps) {
    if (!step.poi.area) continue;
    counts.set(step.poi.area, (counts.get(step.poi.area) ?? 0) + 1);
  }
  return [...counts.entries()].sort(([, a], [, b]) => b - a)[0]?.[0];
}

function matchesRouteArea(poi: Poi, routeCluster?: string, routeArea?: string): boolean {
  if (routeCluster && poi.routeCluster) return poi.routeCluster === routeCluster;
  if (routeArea && poi.area) return poi.area === routeArea;
  return true;
}

function scoreCandidateLocality(poi: Poi, routeCluster?: string, routeArea?: string): number {
  let score = 0;
  if (routeCluster && poi.routeCluster === routeCluster) score += 40;
  if (routeArea && poi.area === routeArea) score += 20;
  if (poi.distanceLevel === "3km内" || poi.distanceLevel === "3km以内" || poi.distanceLevel === "near" || poi.distanceLevel === "近" || poi.distanceLevel === "附近") score += 10;
  if (poi.distanceLevel === "10km以上" || poi.distanceLevel === "far") score -= 30;
  return score;
}

function inferRouteClusterFromPoi(poi: Poi): string | undefined {
  return poi.routeCluster || poi.businessDistrict || poi.area;
}

function buildFallbackLiveCandidates(event: ReplanEvent, targetStep: RouteStep, requirements: Requirements): Poi[] {
  const baseNames = [
    `${requirements.city}${event.customPreference || requirements.preferences[0] || "周末"}灵感点`,
    `${targetStep.poi.businessDistrict || requirements.city}附近新发现`,
    `${requirements.city}不排队轻体验`,
  ];

  return baseNames.map((name, index) => ({
    id: `live_fallback_${Date.now()}_${index}`,
    name,
    type: inferPoiType(event, targetStep),
    subType: targetStep.poi.subType || "实时候选",
    area: targetStep.poi.area || requirements.city,
    businessDistrict: targetStep.poi.businessDistrict || requirements.city,
    routeCluster: targetStep.poi.routeCluster,
    price: Math.min(Math.max(30, targetStep.poi.price || 60), requirements.budgetMax),
    meituanRating: 4.5 + index * 0.1,
    reviewCount: 600 + index * 180,
    tags: inferLiveTags(event, targetStep, requirements),
    limits: ["实时候选", "低排队"],
    fitPeople: [requirements.peopleType],
    stayMinutes: targetStep.poi.stayMinutes,
    queueLevel: "low",
    distanceLevel: targetStep.poi.distanceLevel || "3-10km",
    reason: `Agent 根据你的补充要求生成的实时备选点，用于在本地 POI 不足时继续完成路线微调。`,
    blindBoxThemes: targetStep.poi.blindBoxThemes,
    availableTools: ["liveCandidateSearch", "queueCheck", "availabilityCheck"],
    bookingRequired: false,
    weatherSensitive: false,
    priorityScore: 82 - index,
  }));
}

function inferPoiType(event: ReplanEvent, targetStep: RouteStep): string {
  const text = event.customPreference || "";
  if (/咖啡|奶茶|甜|饮|茶/.test(text)) return "轻食甜饮";
  if (/吃|饭|餐|火锅|烧烤|菜/.test(text)) return "餐饮正餐";
  if (/展|书|文化|美术|博物/.test(text)) return "文化体验";
  if (/拍|打卡|地标|夜景/.test(text)) return "拍照地标";
  if (/公园|散步|户外|citywalk/i.test(text)) return "户外散步";
  return targetStep.poi.type;
}

function inferLiveTags(event: ReplanEvent, targetStep: RouteStep, requirements: Requirements): string[] {
  const text = event.customPreference || "";
  const tags = new Set<string>([...requirements.preferences, ...targetStep.poi.tags.slice(0, 2)]);
  if (/拍|打卡|出片/.test(text)) tags.add("拍照");
  if (/小众|特别|新/.test(text)) tags.add("小众");
  if (/不排队|少排队|快/.test(text)) tags.add("不易排队");
  if (/室内|下雨/.test(text)) tags.add("室内");
  if (/咖啡/.test(text)) tags.add("咖啡");
  if (/吃|餐|美食/.test(text)) tags.add("美食");
  return [...tags].slice(0, 6);
}

function buildExactReplacementResult(
  event: ReplanEvent,
  currentRoute: Route,
  pois: Poi[],
  requirements: Requirements,
  targetStep: RouteStep
): PlanBResult | null {
  const replacement = resolvePreferredReplacement(event, pois, requirements);
  if (!replacement) return null;

  const reason = event.preferredReplacement?.reason || `${replacement.name} 是用户选中的替代节点，已按选择更新路线。`;
  const afterSteps = currentRoute.steps.map((step) => {
    if (step.poi.id !== targetStep.poi.id) return step;
    return {
      ...step,
      poi: replacement,
      note: `${reason}（用户确认替换）`,
    };
  });

  const afterRoute = summarizeRoute(afterSteps, getRequestedReplacementTypes(event, targetStep.poi));
  const changes: PlanBChange[] = [{
    action: "replace",
    from: targetStep.poi.name,
    to: replacement.name,
    reason,
  }];

  return {
    event,
    impact: `已按你的选择，将「${targetStep.poi.name}」替换为「${replacement.name}」。`,
    beforeRoute: currentRoute,
    afterRoute,
    changes,
    keptPreferences: requirements.preferences.slice(0, 3),
    sacrificed: [targetStep.poi.name],
    message: `已按用户点选结果，将「${targetStep.poi.name}」替换为「${replacement.name}」。`,
  };
}

function resolvePreferredReplacement(event: ReplanEvent, pois: Poi[], requirements: Requirements): Poi | null {
  const preferred = event.preferredReplacement;
  if (!preferred?.name) return null;

  const normalizedName = normalizeName(preferred.name);
  const matchedPoi = pois.find((poi) =>
    normalizeName(poi.name) === normalizedName
    || normalizeName(poi.name).includes(normalizedName)
    || normalizedName.includes(normalizeName(poi.name))
  );
  if (matchedPoi) return matchedPoi;

  return {
    id: preferred.id || `manual-${Date.now()}`,
    name: preferred.name,
    type: preferred.type || "休闲娱乐",
    subType: preferred.subType || preferred.type || "用户选择",
    area: preferred.area,
    businessDistrict: preferred.businessDistrict || preferred.area || requirements.city,
    price: preferred.price ?? 0,
    meituanRating: 4.6,
    reviewCount: 1200,
    tags: preferred.tags ?? [],
    limits: [],
    fitPeople: [requirements.peopleType],
    stayMinutes: preferred.stayMinutes ?? 60,
    queueLevel: "low",
    distanceLevel: "medium",
    reason: preferred.reason || `${preferred.name} 是用户确认选择的替代节点。`,
    weatherSensitive: false,
  };
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "");
}

function findTargetStep(event: ReplanEvent, currentRoute: Route): RouteStep | undefined {
  if (event.poiId) return currentRoute.steps.find((step) => step.poi.id === event.poiId);
  return currentRoute.steps.at(-1);
}

function summarizeRoute(steps: RouteStep[], preferredFirstTypes: string[] = []): Route {
  const orderedSteps = orderStepsSpatially(steps, preferredFirstTypes);

  return {
    totalMinutes: orderedSteps.reduce((sum, step) => sum + step.poi.stayMinutes, 0),
    totalBudget: orderedSteps.reduce((sum, step) => sum + step.poi.price, 0),
    steps: orderedSteps.map((step, index) => ({
      ...step,
      order: index + 1,
      role: inferRole(step.poi, index),
    })),
  };
}

function orderStepsSpatially(steps: RouteStep[], preferredFirstTypes: string[] = []): RouteStep[] {
  if (steps.length < 3 || steps.length > 5) return steps;
  if (steps.some((step) => !hasCoordinate(step.poi))) return steps;

  const permutations = permute(steps);
  return permutations
    .map((candidate) => ({
      candidate,
      score: scoreRouteOrder(candidate, preferredFirstTypes),
    }))
    .sort((a, b) => a.score - b.score)[0]?.candidate ?? steps;
}

function inferRole(poi: Poi, index: number): RouteStep["role"] {
  if (poi.type === "餐饮正餐") return "meal";
  if (poi.type === "轻食甜饮") return "break";
  if (index >= 3) return "ending";
  return "activity";
}

function hasCoordinate(poi: Poi): boolean {
  return typeof poi.lat === "number" && typeof poi.lng === "number";
}

function scoreRouteOrder(steps: RouteStep[], preferredFirstTypes: string[] = []): number {
  const pathDistance = steps.slice(1).reduce((sum, step, index) => {
    return sum + distanceKm(steps[index].poi, step.poi);
  }, 0);
  const startEndDistance = distanceKm(steps[0].poi, steps.at(-1)!.poi);
  const rolePenalty = scoreRoleOrderPenalty(steps, preferredFirstTypes);
  const backtrackPenalty = scoreBacktrackPenalty(steps);

  return pathDistance - startEndDistance * 0.45 + rolePenalty + backtrackPenalty;
}

function scoreRoleOrderPenalty(steps: RouteStep[], preferredFirstTypes: string[] = []): number {
  let penalty = 0;
  const first = steps[0]?.poi;
  const last = steps.at(-1)?.poi;
  if (preferredFirstTypes.length > 0 && first && !preferredFirstTypes.includes(first.type)) penalty += 100;
  if (first?.type === "餐饮正餐" || first?.type === "轻食甜饮") penalty += 2.5;
  if (last?.type === "餐饮正餐") penalty += 1.2;

  const mealIndex = steps.findIndex((step) => step.poi.type === "餐饮正餐");
  const breakIndex = steps.findIndex((step) => step.poi.type === "轻食甜饮");
  if (mealIndex >= 0 && breakIndex >= 0 && mealIndex < breakIndex) penalty += 0.8;
  return penalty;
}

function scoreBacktrackPenalty(steps: RouteStep[]): number {
  let penalty = 0;
  for (let i = 2; i < steps.length; i += 1) {
    const prevPrev = steps[i - 2].poi;
    const current = steps[i].poi;
    const skippedDistance = distanceKm(prevPrev, current);
    const viaDistance = distanceKm(prevPrev, steps[i - 1].poi) + distanceKm(steps[i - 1].poi, current);
    if (skippedDistance > 0 && viaDistance / skippedDistance > 2.2) {
      penalty += 1.5;
    }
  }
  return penalty;
}

function distanceKm(a: Poi, b: Poi): number {
  if (!hasCoordinate(a) || !hasCoordinate(b)) return 0;
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat! - a.lat!);
  const dLng = toRadians(b.lng! - a.lng!);
  const lat1 = toRadians(a.lat!);
  const lat2 = toRadians(b.lat!);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(h)));
}

function toRadians(value: number): number {
  return value * Math.PI / 180;
}

function permute<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, index) => {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    return permute(rest).map((candidate) => [item, ...candidate]);
  });
}

function summarizeStep(step: RouteStep) {
  return {
    order: step.order,
    role: step.role,
    note: step.note,
    poi: summarizePoi(step.poi),
  };
}

function summarizePoi(poi: Poi) {
  return {
    id: poi.id,
    name: poi.name,
    type: poi.type,
    subType: poi.subType,
    businessDistrict: poi.businessDistrict,
    routeCluster: poi.routeCluster,
    price: poi.price,
    rating: poi.meituanRating,
    tags: poi.tags,
    limits: poi.limits,
    fitPeople: poi.fitPeople,
    stayMinutes: poi.stayMinutes,
    queueLevel: poi.queueLevel,
    distanceLevel: poi.distanceLevel,
    reason: poi.reason,
    weatherSensitive: poi.weatherSensitive,
  };
}

function uniquePois(pois: Poi[]): Poi[] {
  const seen = new Set<string>();
  return pois.filter((poi) => {
    if (seen.has(poi.id)) return false;
    seen.add(poi.id);
    return true;
  });
}

function safeParseJson(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  }
}
