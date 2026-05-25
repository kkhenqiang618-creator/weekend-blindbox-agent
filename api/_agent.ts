import { generatePlan, executePlan, handleReplan } from "../new-agent-a-module/src/agent/orchestrator.ts";
import { pois } from "../new-agent-a-module/src/data/pois.ts";

type JsonResponse = {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

export type ApiRequest = {
  method?: string;
  body?: unknown;
};

export function setCors(res: JsonResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export function handleOptions(req: ApiRequest, res: JsonResponse) {
  if (req.method !== "OPTIONS") {
    return false;
  }

  setCors(res);
  res.status(204).json({});
  return true;
}

export function sendError(res: JsonResponse, err: unknown) {
  const message = err instanceof Error ? err.message : "Unknown server error";
  res.status(500).json({ error: message });
}

export async function generateWeekendPlan(body: Record<string, unknown>) {
  const userInput = {
    rawText: typeof body.rawText === "string" ? body.rawText : "",
    quickSelections:
      body.quickSelections && typeof body.quickSelections === "object"
        ? body.quickSelections
        : {},
  };

  return generatePlan(userInput, { pois });
}

export async function executeWeekendPlan(body: Record<string, unknown>) {
  return executePlan(body.plan as Parameters<typeof executePlan>[0]);
}

export async function replanWeekendRoute(body: Record<string, unknown>) {
  return handleReplan(
    body.event as Parameters<typeof handleReplan>[0],
    body.plan as Parameters<typeof handleReplan>[1],
    { pois },
  );
}

