import { executePlan } from "../new-agent-a-module/src/agent/orchestrator.ts";

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

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  setCors(res);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body ?? {};
    if (!body.plan) {
      res.status(400).json({ error: "plan is required" });
      return;
    }
    const executed = await executePlan(body.plan);
    res.status(200).json(executed);
  } catch (err) {
    sendError(res, err);
  }
}
