import { generatePlan } from "../new-agent-a-module/src/agent/orchestrator.ts";
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

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  setCors(res);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body ?? {};
    const userInput = {
      rawText: typeof body.rawText === "string" ? body.rawText : "",
      quickSelections: body.quickSelections && typeof body.quickSelections === "object" ? body.quickSelections : {},
    };
    const plan = await generatePlan(userInput, { pois });
    res.status(200).json(plan);
  } catch (err) {
    sendError(res, err);
  }
}
