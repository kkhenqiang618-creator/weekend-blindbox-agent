import type { Route, ToolResult } from "../agent/types.ts";

export async function checkAvailability(route: Route): Promise<ToolResult[]> {
  return route.steps.map((step) => ({
    toolName: "checkAvailability",
    status: "success",
    poiId: step.poi.id,
    message: step.poi.bookingRequired
      ? `${step.poi.name} 需要预约，已模拟确认可加入行程`
      : `${step.poi.name} 可直接加入行程`,
    result: {
      available: true,
      bookingRequired: step.poi.bookingRequired ?? false
    }
  }));
}
