import { composeBlindBox, selectBlindBoxTheme } from "./blindBox.ts";
import { parseIntent } from "./intentParser.ts";
import type { LlmReplanConfig, Plan, Poi, ReplanEvent, UserInput } from "./types.ts";
import { mockPois } from "../mock/mockPois.ts";
import { buildRoute, replanRoute } from "../planner/simpleRoutePlanner.ts";
import { replanRouteWithLLM } from "../planner/llmReplanPlanner.ts";
import { checkAvailability } from "../tools/checkAvailability.ts";
import { checkQueue } from "../tools/checkQueue.ts";
import { reserveOrJoinPlan } from "../tools/reserveOrJoinPlan.ts";

export interface GeneratePlanOptions {
  executeImmediately?: boolean;
  pois?: Poi[];
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
  const requirements = await parseIntent(userInput);
  const theme = selectBlindBoxTheme(requirements);
  const route = buildRoute(requirements, pois, theme);
  const [queueResults, availabilityResults] = await Promise.all([
    checkQueue(route),
    checkAvailability(route)
  ]);
  const toolStatus = [...queueResults, ...availabilityResults];
  const executionTasks = options.executeImmediately ? await reserveOrJoinPlan(route) : [];
  const blindBox = composeBlindBox(theme, route, requirements, toolStatus);

  return {
    requirements,
    blindBox,
    route,
    toolStatus,
    executionTasks,
    planB: null
  };
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
  const blindBox = composeBlindBox(
    currentPlan.blindBox.theme,
    planB.afterRoute,
    currentPlan.requirements,
    toolStatus
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
