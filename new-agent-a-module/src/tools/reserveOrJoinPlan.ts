import type { Route, ToolResult } from "../agent/types";

export async function reserveOrJoinPlan(route: Route): Promise<ToolResult[]> {
  return route.steps.map((step) => ({
    toolName: "reserveOrJoinPlan",
    status: "success",
    poiId: step.poi.id,
    message: step.poi.bookingRequired
      ? `${step.poi.name} 已完成预约模拟`
      : `${step.poi.name} 已加入行程`,
    result: {
      joined: true,
      reserved: step.poi.bookingRequired ?? false
    }
  }));
}
