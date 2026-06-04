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
  const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const targetStep = findTargetStep(event, currentRoute);
  if (!targetStep) return null;

  const candidates = buildCandidatePool(event, targetStep, currentRoute, pois, requirements);
  if (candidates.length === 0) return null;

  const baseUrl = config.baseUrl || process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL;
  const model = config.model || process.env.OPENAI_MODEL || DEFAULT_MODEL;
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
  const afterRoute = summarizeRoute(afterSteps);
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

function buildCandidatePool(
  event: ReplanEvent,
  targetStep: RouteStep,
  currentRoute: Route,
  pois: Poi[],
  requirements: Requirements
): Poi[] {
  const usedIds = new Set(currentRoute.steps.map((step) => step.poi.id));
  const directIds = targetStep.poi.replaceableBy ?? [];
  const direct = pois.filter((poi) => directIds.includes(poi.id) && !usedIds.has(poi.id));
  const sameType = pois
    .filter((poi) => !usedIds.has(poi.id))
    .filter((poi) => poi.type === targetStep.poi.type || event.type === "rain")
    .filter((poi) => poi.fitPeople.includes(requirements.peopleType))
    .filter((poi) => poi.price <= Math.max(requirements.budgetMax, targetStep.poi.price + 80))
    .filter((poi) => {
      if (targetStep.poi.routeCluster && poi.routeCluster) return poi.routeCluster === targetStep.poi.routeCluster;
      if (targetStep.poi.area && poi.area) return poi.area === targetStep.poi.area;
      return true;
    });
  const broad = pois
    .filter((poi) => !usedIds.has(poi.id))
    .filter((poi) => poi.fitPeople.includes(requirements.peopleType))
    .filter((poi) => poi.price <= Math.max(requirements.budgetMax, targetStep.poi.price + 120));

  return uniquePois([...direct, ...sameType, ...broad]).slice(0, 24);
}

function findTargetStep(event: ReplanEvent, currentRoute: Route): RouteStep | undefined {
  if (event.poiId) return currentRoute.steps.find((step) => step.poi.id === event.poiId);
  return currentRoute.steps.at(-1);
}

function summarizeRoute(steps: RouteStep[]): Route {
  return {
    totalMinutes: steps.reduce((sum, step) => sum + step.poi.stayMinutes, 0),
    totalBudget: steps.reduce((sum, step) => sum + step.poi.price, 0),
    steps: steps.map((step, index) => ({ ...step, order: index + 1 })),
  };
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
