import { composeBlindBox, selectBlindBoxTheme } from "./blindBox.ts";
import { personalizeBlindBoxCopy } from "./blindBoxCopywriter.ts";
import { parseIntent } from "./intentParser.ts";
import type { LlmReplanConfig, Plan, PlanBResult, Poi, ReplanEvent, Requirements, UserInput } from "./types.ts";
import { mockPois } from "../mock/mockPois.ts";
import { buildRoute, replanRoute, rerollRoute } from "../planner/simpleRoutePlanner.ts";
import { buildLiveRoute } from "../planner/liveRoutePlanner.ts";
import { replanRouteWithLLM } from "../planner/llmReplanPlanner.ts";
import { checkAvailability } from "../tools/checkAvailability.ts";
import { checkQueue } from "../tools/checkQueue.ts";
import { reserveOrJoinPlan } from "../tools/reserveOrJoinPlan.ts";

export interface GeneratePlanOptions {
  executeImmediately?: boolean;
  pois?: Poi[];
  llm?: LlmReplanConfig;
}

export interface ReplanOptions {
  pois?: Poi[];
  llm?: LlmReplanConfig;
}

export async function generatePlan(
  userInput: UserInput,
  options: GeneratePlanOptions = {}
): Promise<Plan> {
  const pois = options.pois ?? mockPois;
  const requirements = await parseIntent(userInput, options.llm);
  const theme = selectBlindBoxTheme(requirements);
  const liveResult = await buildLiveRoute(requirements, theme);
  assertLiveRouteOrLocalFallback(liveResult, requirements);
  const route = liveResult?.route ?? buildRoute(requirements, pois, theme);
  const [queueResults, availabilityResults] = await Promise.all([
    checkQueue(route),
    checkAvailability(route)
  ]);
  const toolStatus = [
    buildLiveRouteToolStatus(liveResult, requirements.blindBoxTheme),
    ...queueResults,
    ...availabilityResults
  ];
  const executionTasks = options.executeImmediately ? await reserveOrJoinPlan(route) : [];
  const blindBox = await personalizeBlindBoxCopy(
    composeBlindBox(theme, route, requirements, toolStatus),
    requirements,
    route,
    options.llm
  );

  return {
    requirements,
    blindBox,
    route,
    toolStatus,
    executionTasks,
    planB: null
  };
}

function isShenzhenCity(city: string): boolean {
  return city.replace(/市$/, "").trim() === "深圳";
}

function assertLiveRouteOrLocalFallback(liveResult: unknown, requirements: Requirements): void {
  if (liveResult || isShenzhenCity(requirements.city)) return;
  const location = requirements.city.trim();
  if (!location) throw new Error("请先选择城市，再生成真实路线。");
  throw new Error(`暂时无法在${location}生成真实路线，请稍后重试或更换区域。`);
}

export async function executePlan(plan: Plan): Promise<Plan> {
  const executionTasks = await reserveOrJoinPlan(plan.route);
  return {
    ...plan,
    executionTasks
  };
}

export async function handleReplan(
  event: ReplanEvent,
  currentPlan: Plan,
  options: ReplanOptions = {}
): Promise<Plan> {
  const pois = options.pois ?? mockPois;

  if (event.type === "reroll") {
    return handleReroll(event, currentPlan, pois, options.llm);
  }

  let planB = null;
  try {
    planB = await replanRouteWithLLM(event, currentPlan.route, pois, currentPlan.requirements, options.llm);
  } catch {
    planB = null;
  }
  if (!planB) {
    planB = replanRoute(event, currentPlan.route, pois, currentPlan.requirements);
  }
  const [queueResults, availabilityResults] = await Promise.all([
    checkQueue(planB.afterRoute),
    checkAvailability(planB.afterRoute)
  ]);
  const toolStatus = [...queueResults, ...availabilityResults];
  const blindBox = await personalizeBlindBoxCopy(
    composeBlindBox(
      currentPlan.blindBox.theme,
      planB.afterRoute,
      currentPlan.requirements,
      toolStatus
    ),
    currentPlan.requirements,
    planB.afterRoute,
    options.llm
  );

  return {
    ...currentPlan,
    blindBox,
    route: planB.afterRoute,
    toolStatus,
    executionTasks: [],
    planB
  };
}

async function handleReroll(
  event: ReplanEvent,
  currentPlan: Plan,
  pois: Poi[],
  llm?: LlmReplanConfig
): Promise<Plan> {
  const requirements = await refineRerollRequirements(event, currentPlan);
  const theme = selectBlindBoxTheme(requirements);
  const liveResult = await buildLiveRoute(requirements, theme, {
    excludeIds: currentPlan.route.steps.map((step) => step.poi.id),
    timeoutMs: 8000
  });
  assertLiveRouteOrLocalFallback(liveResult, requirements);
  const route = liveResult?.route ?? rerollRoute(requirements, currentPlan.route, pois, theme);
  const [queueResults, availabilityResults] = await Promise.all([
    checkQueue(route),
    checkAvailability(route)
  ]);
  const toolStatus = [
    buildLiveRouteToolStatus(liveResult, requirements.blindBoxTheme),
    ...queueResults,
    ...availabilityResults
  ];
  const blindBox = await personalizeBlindBoxCopy(
    composeBlindBox(theme, route, requirements, toolStatus),
    requirements,
    route,
    llm
  );
  const planB = buildRerollResult(event, currentPlan, route, requirements);

  return {
    ...currentPlan,
    requirements,
    blindBox,
    route,
    toolStatus,
    executionTasks: [],
    planB
  };
}

function buildLiveRouteToolStatus(
  liveResult: Awaited<ReturnType<typeof buildLiveRoute>>,
  selectedTheme?: string
) {
  return {
    toolName: "amapLiveRouteSearch",
    status: liveResult ? "success" as const : "failed" as const,
    message: liveResult
      ? `已按${selectedTheme || "本次风格"}找到 ${liveResult.candidates.length} 个候选点。`
      : "实时地点检索超时或候选不足，已先用本地地点库生成可测试路线。",
    result: liveResult
      ? {
          keywords: liveResult.keywords,
          candidateCount: liveResult.candidates.length,
          routeNames: liveResult.route.steps.map((step) => step.poi.name)
        }
      : undefined
  };
}

async function refineRerollRequirements(event: ReplanEvent, currentPlan: Plan): Promise<Requirements> {
  const previousNames = currentPlan.route.steps.map((step) => step.poi.name).join("、");
  const rerollText = [
    currentPlan.requirements.rawText,
    event.message,
    event.customPreference,
    previousNames ? `避开当前路线里的这些地点：${previousNames}` : ""
  ].filter(Boolean).join("；");

  try {
    return await parseIntent({
      rawText: rerollText,
      quickSelections: {
        city: currentPlan.requirements.city,
        district: currentPlan.requirements.district,
        durationHours: currentPlan.requirements.durationHours,
        budget: currentPlan.requirements.budgetMax,
        peopleType: currentPlan.requirements.peopleType,
        preferences: currentPlan.requirements.preferences,
        constraints: currentPlan.requirements.constraints,
        distanceLevel: currentPlan.requirements.distanceLevel,
        blindBoxTheme: currentPlan.requirements.blindBoxTheme,
        inputMode: currentPlan.requirements.inputMode
      }
    });
  } catch {
    return currentPlan.requirements;
  }
}

function buildRerollResult(
  event: ReplanEvent,
  currentPlan: Plan,
  afterRoute: Plan["route"],
  requirements: Requirements
): PlanBResult {
  const beforeNames = new Set(currentPlan.route.steps.map((step) => step.poi.name));
  const changes = afterRoute.steps.map((step, index) => {
    const beforeStep = currentPlan.route.steps[index];
    return {
      action: "replace" as const,
      from: beforeStep?.poi.name,
      to: step.poi.name,
      reason: beforeNames.has(step.poi.name)
        ? "这一站与新路线仍然匹配，所以保留在新的顺序里。"
        : "已避开上一条路线的核心点，重新匹配一条新路线。"
    };
  });

  return {
    event,
    impact: "你选择重新更换整条路线，系统已按当前需求重新生成。",
    beforeRoute: currentPlan.route,
    afterRoute,
    changes,
    keptPreferences: requirements.preferences.slice(0, 3),
    sacrificed: currentPlan.route.steps
      .map((step) => step.poi.name)
      .filter((name) => !afterRoute.steps.some((afterStep) => afterStep.poi.name === name)),
    message: `已基于「${requirements.preferences.slice(0, 2).join("、") || "当前偏好"}」重新生成完整路线，并尽量避开上一条路线的核心节点。`
  };
}
