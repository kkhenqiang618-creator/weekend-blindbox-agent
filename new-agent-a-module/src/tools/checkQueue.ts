import type { Route, ToolResult } from "../agent/types.ts";

export async function checkQueue(route: Route): Promise<ToolResult[]> {
  return route.steps.map((step) => {
    const waitMinutes = step.poi.queueLevel === "high" ? 45 : step.poi.queueLevel === "medium" ? 18 : 8;
    return {
      toolName: "checkQueue",
      status: "success",
      poiId: step.poi.id,
      message: step.poi.queueLevel === "high"
        ? `${step.poi.name} 当前排队较久`
        : `${step.poi.name} 排队风险可接受`,
      result: {
        queueLevel: step.poi.queueLevel,
        estimatedWaitMinutes: waitMinutes
      }
    };
  });
}
