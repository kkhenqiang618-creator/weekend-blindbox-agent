import { type ApiRequest, handleOptions, setCors } from "./agent-shared";

export default function handler(req: ApiRequest, res: any) {
  if (handleOptions(req, res)) return;
  setCors(res);
  res.status(200).json({ status: "ok" });
}

