import {
  type ApiRequest,
  handleOptions,
  replanWeekendRoute,
  sendError,
  setCors,
} from "./_agent.ts";

export default async function handler(req: ApiRequest, res: any) {
  if (handleOptions(req, res)) return;
  setCors(res);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const plan = await replanWeekendRoute((req.body ?? {}) as Record<string, unknown>);
    res.status(200).json(plan);
  } catch (err) {
    sendError(res, err);
  }
}

