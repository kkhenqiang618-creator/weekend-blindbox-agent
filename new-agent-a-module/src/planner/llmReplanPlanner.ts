import type { LlmReplanConfig, PlanBChange, PlanBResult, Poi, Requirements, ReplanEvent, Route, RouteStep } from "../agent/types.ts";
import {
  estimateRouteMinutes,
  normalizePoiForPlanning,
} from "./routeQualityRules.ts";
import { extractAmapPoiDetails } from "./amapPoiDetails.ts";

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

const DEFAULT_MODEL = "deepseek-v4-flash";
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

  const candidates = await buildCandidatePool(event, targetStep, currentRoute, pois, requirements);
  if (candidates.length === 0) return null;

  const apiKey = config.apiKey || getLlmApiKey();
  if (!apiKey) {
    return buildLocalReplacementResult(event, currentRoute, requirements, targetStep, candidates[0], "当前未配置模型 Key，已按距离、预算和类型本地选择替代点。");
  }

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
  }).catch(() => null);

  if (!decision?.replacementPoiId) {
    return buildLocalReplacementResult(event, currentRoute, requirements, targetStep, candidates[0], "模型没有返回明确候选，已按本地排序选择最合适的替代点。");
  }
  const replacement = candidates.find((poi) => poi.id === decision.replacementPoiId);
  if (!replacement) {
    return buildLocalReplacementResult(event, currentRoute, requirements, targetStep, candidates[0], "模型返回的候选不在候选池中，已按本地排序选择替代点。");
  }
  const decisionReason = cleanReplacementReason(decision.reason, replacement.reason);

  const afterSteps = currentRoute.steps.map((step) => {
    if (step.poi.id !== targetStep.poi.id) return step;
    return {
      ...step,
      poi: replacement,
      note: `${decisionReason}（LLM Plan B 替换）`,
    };
  });
  const afterRoute = summarizeRoute(afterSteps, getRequestedReplacementTypes(event, targetStep.poi));
  const changes: PlanBChange[] = [{
    action: "replace",
    from: targetStep.poi.name,
    to: replacement.name,
    reason: decisionReason,
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
            "replacementPoiId 必须来自候选 POI 的 id；除非候选池为空，否则必须选择一个最可执行的候选，不要返回空字符串。",
            "选择优先级：先满足用户 message/customPreference 的明确要求；其次选离目标节点或路线最近、预算接近、类型合理的地点；如果没有完美同类点，也要选择附近可执行场所兜底。",
            "如果 customPreference 包含“搜索类型=餐饮正餐/轻食甜饮/休闲娱乐/文化体验/拍照地标/户外散步”，必须优先选择这个类型。",
            "如果用户明确要“玩、好玩、娱乐、体验、活动”，优先选择休闲娱乐、文化体验、拍照地标或户外散步；只有候选池没有这些类型时，才用餐饮/甜饮兜底。",
            "如果用户明确要“聚餐、正餐、吃饭、餐厅、餐馆”，必须优先选择餐饮正餐；只要候选池有餐饮正餐，就不要选择台球厅、桌游、电玩城、商场娱乐等玩乐点。",
            "reason 用中文说明候选地点本身有什么特色，以及为什么适合替换目标节点。",
            "reason 不要复述系统规则、搜索指令、API 调用要求或用户原话；不要出现“请联网”“高德 API”“不要返回”“按照距离”等提示词。",
            "impact 用中文说明对路线的影响。",
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
    .filter((poi) => matchesRouteArea(poi, targetStep.poi, routeCluster, routeArea));
  const sameType = pois
    .filter((poi) => !usedIds.has(poi.id))
    .filter((poi) => matchesRequestedType(poi, requestedTypes))
    .filter((poi) => matchesIndoorIntent(poi, requireIndoor))
    .filter((poi) => poi.fitPeople.includes(requirements.peopleType))
    .filter((poi) => poi.price <= Math.max(requirements.budgetMax, targetStep.poi.price + 80))
    .filter((poi) => matchesRouteArea(poi, targetStep.poi, routeCluster, routeArea))
    .filter((poi) => {
      if (isNearbyByCoordinate(poi, targetStep.poi, 8)) return true;
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
    .filter((poi) => matchesRouteArea(poi, targetStep.poi, routeCluster, routeArea) || isNearbyByCoordinate(poi, targetStep.poi, 10));

  const nearbyFallback = pois
    .filter((poi) => !usedIds.has(poi.id))
    .filter((poi) => matchesIndoorIntent(poi, requireIndoor))
    .filter((poi) => poi.fitPeople.includes(requirements.peopleType))
    .filter((poi) => poi.price <= Math.max(requirements.budgetMax + 80, targetStep.poi.price + 160))
    .filter((poi) => matchesRouteArea(poi, targetStep.poi, routeCluster, routeArea) || isNearbyByCoordinate(poi, targetStep.poi, 12));

  const liveCandidates = await searchLivePoiCandidates(event, targetStep, requirements, currentRoute);
  const strictTypeMatch = shouldUseStrictTypeMatch(event, requestedTypes);

  const sortedCandidates = uniquePois([...liveCandidates, ...direct, ...sameType, ...broad, ...nearbyFallback])
    .sort((a, b) =>
      scoreCandidateReplacement(b, targetStep.poi, requestedTypes, routeCluster, routeArea) -
      scoreCandidateReplacement(a, targetStep.poi, requestedTypes, routeCluster, routeArea)
    );
  const typeMatchedCandidates = sortedCandidates.filter((poi) => matchesRequestedType(poi, requestedTypes));
  if (strictTypeMatch && typeMatchedCandidates.length > 0) {
    return typeMatchedCandidates.slice(0, 24);
  }
  return sortedCandidates.slice(0, 24);
}

async function searchLivePoiCandidates(
  event: ReplanEvent,
  targetStep: RouteStep,
  requirements: Requirements,
  currentRoute: Route
): Promise<Poi[]> {
  const keywords = buildLiveSearchKeywords(event, targetStep, requirements);
  const amapKey = process.env.AMAP_API_KEY || process.env.AMAP_WEB_SERVICE_KEY;
  if (!amapKey) {
    console.error('[AMap] API Key 未配置，请在环境变量中设置 AMAP_API_KEY 或 AMAP_WEB_SERVICE_KEY');
    return [];
  }
  const usedIds = new Set(currentRoute.steps.map((step) => step.poi.id));
  const usedNames = new Set(currentRoute.steps.map((step) => normalizeName(step.poi.name)));

  try {
    const results: AmapPoiItem[][] = [];
    for (const keyword of keywords) {
      results.push(await queryAmapText(amapKey, keyword, requirements));
      if (hasCoordinate(targetStep.poi)) {
        results.push(await queryAmapAround(amapKey, keyword, targetStep.poi));
      }
    }

    const requestedTypes = getRequestedReplacementTypes(event, targetStep.poi);
    const candidates = results.flat()
      .filter((item) => isUsableAmapPoi(item))
      .filter((item) => isPeopleAppropriateAmapPoi(item, requirements))
      .map((item, index) => poiFromAmap(item, index, event, targetStep, requirements))
      .filter((poi): poi is Poi => Boolean(poi && poi.id !== targetStep.poi.id && poi.name !== targetStep.poi.name))
      .filter((poi) => !usedIds.has(poi.id) && !usedNames.has(normalizeName(poi.name)));

    const strictTypeMatch = shouldUseStrictTypeMatch(event, requestedTypes);
    const uniqueCandidates = uniquePois(candidates);
    const matched = uniqueCandidates.filter((poi) => matchesRequestedType(poi, requestedTypes));
    const fallback = uniqueCandidates.filter((poi) => !matchesRequestedType(poi, requestedTypes));
    if (strictTypeMatch && matched.length > 0) return matched.slice(0, 18);
    return [...matched, ...fallback].slice(0, 18);
  } catch {
    return [];
  }
}

function isPeopleAppropriateAmapPoi(item: AmapPoiItem, requirements: Requirements): boolean {
  const text = `${item.name || ""} ${item.type || ""}`;
  if (requirements.peopleType === "亲子") return true;
  return !/儿童乐园|亲子|儿童|早教|少儿|母婴/.test(text);
}

interface AmapPoiItem {
  id?: string;
  name?: string;
  type?: string;
  address?: string | string[];
  adname?: string;
  business_area?: string;
  location?: string;
  photos?: Array<{
    url?: string;
  }>;
  biz_ext?: {
    rating?: string | number;
    cost?: string | number;
    open_time?: string;
    opentime?: string;
  };
}

async function queryAmapText(amapKey: string, keyword: string, requirements: Requirements): Promise<AmapPoiItem[]> {
  return fetchAmapPois(buildAmapTextSearchUrl(amapKey, keyword, requirements));
}

export function buildAmapTextSearchUrl(amapKey: string, keyword: string, requirements: Requirements): URL {
  const url = new URL("https://restapi.amap.com/v3/place/text");
  url.searchParams.set("key", amapKey);
  url.searchParams.set("keywords", keyword);
  if (requirements.city?.trim()) {
    url.searchParams.set("city", requirements.city.trim());
    url.searchParams.set("citylimit", "true");
  }
  url.searchParams.set("offset", "10");
  url.searchParams.set("page", "1");
  url.searchParams.set("extensions", "all");
  return url;
}

async function queryAmapAround(amapKey: string, keyword: string, targetPoi: Poi): Promise<AmapPoiItem[]> {
  const url = new URL("https://restapi.amap.com/v3/place/around");
  url.searchParams.set("key", amapKey);
  url.searchParams.set("keywords", keyword);
  url.searchParams.set("location", `${targetPoi.lng},${targetPoi.lat}`);
  url.searchParams.set("radius", "5000");
  url.searchParams.set("sortrule", "distance");
  url.searchParams.set("offset", "10");
  url.searchParams.set("page", "1");
  url.searchParams.set("extensions", "all");
  return fetchAmapPois(url);
}

async function fetchAmapPois(url: URL): Promise<AmapPoiItem[]> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`AMap search failed: ${response.status}`);
  const data = await response.json() as { status?: string; pois?: AmapPoiItem[] };
  if (data.status !== "1" || !Array.isArray(data.pois)) return [];
  return data.pois;
}

function buildLiveSearchKeywords(event: ReplanEvent, targetStep: RouteStep, requirements: Requirements): string[] {
  const prompt = event.customPreference?.trim();
  const area = requirements.district || targetStep.poi.area || targetStep.poi.businessDistrict || requirements.city;
  const explicitSearchType = getExplicitSearchType(event);
  const keywords: string[] = [];

  if (explicitSearchType === "餐饮正餐") {
    keywords.push(`${area} 聚餐 餐厅 美食`);
    keywords.push(`${area} 正餐 餐厅 少排队`);
    keywords.push(`${area} 特色餐厅 老字号 本地美食`);
  }
  if (explicitSearchType === "轻食甜饮") {
    keywords.push(`${area} 咖啡 茶饮 甜品 下午茶`);
    keywords.push(`${area} 安静 咖啡 甜品 轻食`);
  }
  if (explicitSearchType === "休闲娱乐") {
    keywords.push(`${area} 室内娱乐 商场 桌游 密室 电玩城 影院`);
    keywords.push(`${area} 休闲娱乐 周末好去处`);
  }
  if (explicitSearchType === "文化体验") {
    keywords.push(`${area} 书店 艺术空间 展览 博物馆 美术馆 手作`);
    keywords.push(`${area} 文化体验 小众展览`);
  }
  if (explicitSearchType === "拍照地标") {
    keywords.push(`${area} 拍照打卡 艺术空间 咖啡 商场`);
    keywords.push(`${area} 地标 夜景 打卡`);
  }
  if (explicitSearchType === "户外散步") {
    keywords.push(`${area} 公园 绿道 海边 广场 散步`);
    keywords.push(`${area} citywalk 周末好去处`);
  }

  if (prompt && /拍照|打卡|出片/.test(prompt)) keywords.push(`${area} 拍照打卡 艺术空间 咖啡 商场`);
  if (prompt && /聚餐|正餐|吃饭|吃个饭|餐厅|餐馆|火锅|烧烤|烤肉|粤菜|湘菜|川菜|料理|bistro/i.test(prompt)) {
    keywords.push(`${area} 聚餐 餐厅 美食`);
    keywords.push(`${area} 正餐 餐厅 少排队`);
    keywords.push(`${area} 特色餐厅 老字号 本地美食`);
  }
  if ((prompt && /室内|下雨|雨天/.test(prompt)) || hasIndoorIntent(event, requirements)) keywords.push(`${area} 室内 娱乐 商场 展览 书店`);
  if (prompt && /玩|好玩|玩的地方|能玩的地方|吃喝玩乐|娱乐|体验|活动/.test(prompt)) {
    keywords.push(`${area} 好玩 室内娱乐 商场 桌游 密室 电玩城`);
    keywords.push(`${area} 休闲娱乐 周末好去处`);
    keywords.push(`${area} 吃喝玩乐 商场 美食 娱乐`);
  }
  if (prompt && /diy|DIY|手工|手作|陶艺|银饰|烘焙|画画/.test(prompt)) keywords.push(`${area} DIY手工 陶艺 烘焙`);
  if (prompt && /亲子|孩子|儿童/.test(prompt)) keywords.push(`${area} 亲子 儿童 乐园 公园`);
  if (prompt && /省钱|便宜|平价|预算/.test(prompt)) keywords.push(`${area} 免费 平价 本地小吃 夜市`);
  if (prompt && /朋友|聚会|聊天|桌游|互动/.test(prompt) && !/聚餐|正餐|吃饭|餐厅|餐馆/.test(prompt)) keywords.push(`${area} 朋友聚会 桌游 本地小吃 休闲娱乐`);
  if (prompt && /小吃|夜市|老字号|美食街|本地/.test(prompt)) keywords.push(`${area} 本地小吃 夜市 老字号 美食街`);
  if (prompt && /安静|一个人|单人|书店|放空/.test(prompt)) keywords.push(`${area} 安静 书店 咖啡 公园`);
  if (prompt && /夜景|微醺|酒|清吧|livehouse/i.test(prompt)) keywords.push(`${area} 夜景 清吧 bistro 简餐`);
  if (prompt && /看海|海边|栈道|沙滩/.test(prompt)) keywords.push(`${area} 看海 海滨栈道 咖啡 公园`);
  if (prompt) keywords.push(`${area} ${prompt}`);

  const corePreference = requirements.preferences[0] || targetStep.poi.type;
  keywords.push(`${area} ${corePreference} ${targetStep.poi.type}`);
  keywords.push(`${area} 周末 好去处`);
  keywords.push(`${targetStep.poi.businessDistrict || area} 附近 ${targetStep.poi.type}`);
  return [...new Set(keywords)].slice(0, 5);
}

function isUsableAmapPoi(item: {
  name?: string;
  type?: string;
}): boolean {
  const text = `${item.name || ""} ${item.type || ""}`;
  if (!item.name) return false;
  if (/节点$|NEXUS节点|导航点|途经点|定位点|打卡点$|集合点$|服务点$|入口$|出入口$|^出入口/.test(item.name)) return false;
  if (/会所|棋牌|麻将|网吧|网咖|足浴|按摩|水疗|养生|电竞酒店|桌球游泳网泳|烟草|香烟|雪茄|电子烟|烟酒/.test(text)) return false;
  if (/政府|委员会|办事处|派出所|停车场|收费站|公交站|地铁站|道路|路口|出入口|住宅|小区|写字楼|公寓|宿舍|酒店|宾馆|旅馆|住宿|民宿|公司|银行|医院|药房|诊所|学校|培训|教育机构|幼儿园|托管|售楼|营销中心|产业园办公|工业园|物流|仓库|广告|印刷|图文|快印|复印|招牌|维修|装修|洗车|汽修|驾校|中介|房产|照相|摄影|婚纱|写真|证件照|儿童摄影|汉服体验|旅拍/.test(text)) return false;
  if (/沙县小吃|兰州拉面|黄焖鸡|隆江猪脚饭|华莱士|正新鸡排|蜜雪冰城|益禾堂|古茗|一点点|绝味鸭脖|便利店/.test(text)) return false;
  if (/地名地址信息|道路附属设施|交通设施服务|政府机构|公司企业|商务住宅|医疗保健服务|生活服务;摄影冲印店|生活服务;生活服务场所|科教文化服务;培训机构/.test(text)) return false;
  return /餐饮|购物|商场|娱乐|体育休闲|影剧院|风景名胜|科教文化|咖啡|茶艺|甜品|美术馆|博物馆|书店|公园|生活服务/.test(text);
}

function poiFromAmap(
  item: AmapPoiItem,
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
  const type = inferPoiTypeFromAmap(item, event, targetStep);
  const details = extractAmapPoiDetails(item);

  return normalizePoiForPlanning({
    id: `live_amap_${item.id || index}`,
    name: item.name,
    type,
    subType: item.type?.split(";").at(-1) || targetStep.poi.subType || "实时推荐",
    address: Array.isArray(item.address) ? item.address.join("") : item.address,
    area: item.adname || requirements.district || targetStep.poi.area || requirements.city,
    businessDistrict: item.business_area || targetStep.poi.businessDistrict || item.adname || requirements.city,
    routeCluster: targetStep.poi.routeCluster || inferRouteClusterFromPoi(targetStep.poi),
    price: Math.min(Math.max(30, targetStep.poi.price || 60), requirements.budgetMax),
    priceLevel: targetStep.poi.priceLevel,
    meituanRating: details.meituanRating,
    ratingSource: details.ratingSource,
    tags,
    limits: ["可实时检索"],
    fitPeople: [requirements.peopleType],
    stayMinutes: targetStep.poi.stayMinutes,
    queueLevel: "low",
    distanceLevel: targetStep.poi.distanceLevel || "3-10km",
    mockMeituanUrl: `mock://amap/${item.id || index}`,
    reason: buildLiveReplacementReason(item, type, targetStep, requirements),
    photoUrl: details.photoUrl,
    photoUrls: details.photoUrls,
    openTime: details.openTime,
    blindBoxThemes: [requirements.preferences.includes("拍照") ? "小众拍照吃货盒" : "周末轻松探索盒"],
    availableTools: ["amapPlaceSearch", "queueCheck", "availabilityCheck"],
    bookingRequired: false,
    weatherSensitive: false,
    priorityScore: 86 - index,
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
  }, requirements);
}

function buildLiveReplacementReason(
  item: AmapPoiItem,
  type: string,
  targetStep: RouteStep,
  requirements: Requirements
): string {
  const name = item.name || "这个地点";
  const area = item.business_area || item.adname || targetStep.poi.businessDistrict || targetStep.poi.area || requirements.city || "附近";
  const subType = item.type?.split(";").at(-1);
  const address = Array.isArray(item.address) ? item.address.join("") : item.address;
  const locationText = address ? `${area}的${subType || "真实地点"}` : `${area}附近`;
  const targetName = targetStep.poi.name;

  if (type === "休闲娱乐") {
    return `${name} 是${locationText}，更适合补上可停留、可体验的玩乐感，替换「${targetName}」后路线还能继续在周边衔接。`;
  }
  if (type === "餐饮正餐") {
    return `${name} 是${locationText}，适合把这一站换成吃饭休整节点，让后续行程节奏更稳。`;
  }
  if (type === "轻食甜饮") {
    return `${name} 是${locationText}，适合中途坐下喝点东西、聊天休息，替换「${targetName}」不会打断路线节奏。`;
  }
  if (type === "文化体验") {
    return `${name} 带有${subType || "文化体验"}属性，比普通路过点更有停留理由，适合替换成一站有内容的体验点。`;
  }
  if (type === "户外散步") {
    return `${name} 位于${area}，适合作为散步、看景或收尾节点，能让路线保持轻松连贯。`;
  }
  if (type === "拍照地标") {
    return `${name} 位于${area}，适合拍照打卡和短暂停留，能把这一站换成更有记忆点的节点。`;
  }
  return `${name} 是${locationText}，和原路线距离、预算与停留时长更容易衔接，适合作为这一站的实时替代点。`;
}

function cleanReplacementReason(reason: string | undefined, fallback: string): string {
  const text = reason?.trim();
  if (!text) return fallback;
  if (/请联网|高德\s*API|用户要替换|原节点类型|不要返回|按照距离|系统规则|搜索指令|customPreference|message/.test(text)) {
    return fallback;
  }
  return text;
}

function getRequestedReplacementTypes(event: ReplanEvent, targetPoi: Poi): string[] {
  const text = event.customPreference || event.message || "";
  const explicitSearchType = getExplicitSearchType(event);
  if (explicitSearchType) return [explicitSearchType];
  const types: string[] = [];

  if (/室内.*(娱乐|玩|活动)|娱乐.*室内|电玩城|桌游|密室|KTV|电影|游戏|剧本/.test(text)) {
    types.push("休闲娱乐");
  }
  if (/玩|好玩|玩的地方|能玩的地方|吃喝玩乐|娱乐|体验|活动/.test(text)) {
    types.push("休闲娱乐", "文化体验", "拍照地标");
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

function shouldUseStrictTypeMatch(event: ReplanEvent, requestedTypes: string[]): boolean {
  const text = event.customPreference || event.message || "";
  if (getExplicitSearchType(event)) return requestedTypes.length === 1;
  if (requestedTypes.length !== 1) return false;
  if (requestedTypes[0] === "餐饮正餐") {
    return /聚餐|正餐|吃饭|吃个饭|餐厅|餐馆|火锅|烧烤|烤肉|粤菜|湘菜|川菜|料理|bistro/i.test(text);
  }
  if (requestedTypes[0] === "轻食甜饮") {
    return /咖啡|奶茶|甜品|茶饮|饮品|下午茶/.test(text);
  }
  return false;
}

function getExplicitSearchType(event: ReplanEvent): string | undefined {
  const text = event.customPreference || "";
  const match = text.match(/搜索类型\s*=\s*(餐饮正餐|轻食甜饮|休闲娱乐|文化体验|拍照地标|户外散步)/);
  return match?.[1];
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

function matchesRouteArea(poi: Poi, targetPoi: Poi, routeCluster?: string, routeArea?: string): boolean {
  if (isNearbyByCoordinate(poi, targetPoi, 8)) return true;
  if (routeCluster && poi.routeCluster) return poi.routeCluster === routeCluster;
  if (routeArea && poi.area) return poi.area === routeArea;
  return true;
}

function scoreCandidateLocality(poi: Poi, routeCluster?: string, routeArea?: string): number {
  let score = 0;
  if (routeArea && poi.area !== routeArea) score -= 3;
  if (routeCluster && poi.routeCluster === routeCluster) score += 40;
  if (routeArea && poi.area === routeArea) score += 20;
  if (poi.distanceLevel === "3km内" || poi.distanceLevel === "3km以内" || poi.distanceLevel === "near" || poi.distanceLevel === "近" || poi.distanceLevel === "附近") score += 10;
  if (poi.distanceLevel === "10km以上" || poi.distanceLevel === "far") score -= 30;
  return score;
}

function scoreCandidateReplacement(
  poi: Poi,
  targetPoi: Poi,
  requestedTypes: string[],
  routeCluster?: string,
  routeArea?: string
): number {
  let score = scoreCandidateLocality(poi, routeCluster, routeArea);
  if (matchesRequestedType(poi, requestedTypes)) score += 45;
  if (poi.type === targetPoi.type) score += 16;
  if (poi.queueLevel === "low") score += 8;
  if (poi.price <= Math.max(targetPoi.price + 80, 120)) score += 6;
  if (poi.availableTools?.includes("amapPlaceSearch")) score += 10;
  if (hasCoordinate(poi) && hasCoordinate(targetPoi)) {
    const km = distanceKm(poi, targetPoi);
    if (km <= 1.5) score += 36;
    else if (km <= 3) score += 28;
    else if (km <= 5) score += 18;
    else if (km <= 8) score += 8;
    else score -= Math.min(35, km * 2);
  }
  return score;
}

function isNearbyByCoordinate(a: Poi, b: Poi, maxKm: number): boolean {
  if (!hasCoordinate(a) || !hasCoordinate(b)) return false;
  return distanceKm(a, b) <= maxKm;
}

function inferRouteClusterFromPoi(poi: Poi): string | undefined {
  return poi.routeCluster || poi.businessDistrict || poi.area;
}

function inferPoiType(event: ReplanEvent, targetStep: RouteStep): string {
  const text = event.customPreference || "";
  const explicitSearchType = getExplicitSearchType(event);
  if (explicitSearchType) return explicitSearchType;
  if (/玩|好玩|玩的地方|能玩的地方|娱乐|活动|电玩城|桌游|密室|KTV|电影|游戏|剧本/.test(text)) return "休闲娱乐";
  if (/咖啡|奶茶|甜|饮|茶/.test(text)) return "轻食甜饮";
  if (/吃|饭|餐|火锅|烧烤|菜/.test(text)) return "餐饮正餐";
  if (/展|书|文化|美术|博物/.test(text)) return "文化体验";
  if (/拍|打卡|地标|夜景/.test(text)) return "拍照地标";
  if (/公园|散步|户外|citywalk/i.test(text)) return "户外散步";
  return targetStep.poi.type;
}

function inferPoiTypeFromAmap(item: AmapPoiItem, event: ReplanEvent, targetStep: RouteStep): string {
  const explicitType = inferPoiType(event, targetStep);

  const text = `${item.name || ""} ${item.type || ""}`;
  if (/餐饮|中餐|西餐|火锅|烧烤|小吃|快餐|餐厅|酒楼|素食|菜馆|bistro/i.test(text)) return "餐饮正餐";
  if (/咖啡|茶艺|甜品|面包|饮品|奶茶/.test(text)) return "轻食甜饮";
  if (/美术馆|博物馆|书店|展览|艺术|文化|科教文化/.test(text)) return "文化体验";
  if (/公园|风景名胜|海滨|绿道|广场|景点/.test(text)) return "户外散步";
  if (/商场|购物中心|影剧院|电影院|娱乐|休闲|体育/.test(text)) return "休闲娱乐";
  if (getExplicitSearchType(event)) return explicitType;
  return explicitType;
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

function buildLocalReplacementResult(
  event: ReplanEvent,
  currentRoute: Route,
  requirements: Requirements,
  targetStep: RouteStep,
  replacement: Poi,
  fallbackReason: string
): PlanBResult {
  const afterSteps = currentRoute.steps.map((step) => {
    if (step.poi.id !== targetStep.poi.id) return step;
    return {
      ...step,
      poi: replacement,
      note: `${replacement.reason}（本地 Plan B 替换）`,
    };
  });
  const afterRoute = summarizeRoute(afterSteps, getRequestedReplacementTypes(event, targetStep.poi));
  const reason = `${replacement.name} 更符合当前替换方向，且与原路线距离和预算更容易衔接。`;

  return {
    event,
    impact: fallbackReason,
    beforeRoute: currentRoute,
    afterRoute,
    changes: [{
      action: "replace",
      from: targetStep.poi.name,
      to: replacement.name,
      reason,
    }],
    keptPreferences: requirements.preferences.slice(0, 3),
    sacrificed: [targetStep.poi.name],
    message: `已将「${targetStep.poi.name}」替换为「${replacement.name}」。`,
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
    totalMinutes: estimateRouteMinutes(orderedSteps),
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
