import { handleReplan } from "../new-agent-a-module/src/agent/orchestrator.ts";
import { pois } from "../new-agent-a-module/src/data/pois.ts";

function setCors(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function handleOptions(req: any, res: any) {
  if (req.method !== "OPTIONS") return false;
  setCors(res);
  res.status(204).json({});
  return true;
}

function sendError(res: any, err: unknown) {
  const message = err instanceof Error ? err.message : "Unknown server error";
  res.status(500).json({ error: message });
}

function sanitizeLlmConfig(config: unknown) {
  if (!config || typeof config !== "object") return undefined;
  const candidate = config as Record<string, unknown>;
  const apiKey = typeof candidate.apiKey === "string" ? candidate.apiKey.trim() : "";
  const baseUrl = typeof candidate.baseUrl === "string" ? candidate.baseUrl.trim() : "";
  const model = typeof candidate.model === "string" ? candidate.model.trim() : "";
  const intentModel = typeof candidate.intentModel === "string" ? candidate.intentModel.trim() : "";
  if (!apiKey && !baseUrl && !model && !intentModel) return undefined;
  return {
    apiKey: apiKey || undefined,
    baseUrl: baseUrl || undefined,
    model: model || undefined,
    intentModel: intentModel || undefined,
  };
}

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  setCors(res);
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body ?? {};
    const event = body.event;
    const plan = body.plan;
    if (!event || !plan) {
      res.status(400).json({ error: "event and plan are required" });
      return;
    }

    const replanned = await handleReplan(event, plan, {
      pois,
      llm: sanitizeLlmConfig(body.llmConfig),
    });
    res.status(200).json(replanned);
  } catch (err) {
    sendError(res, err);
  }
}
