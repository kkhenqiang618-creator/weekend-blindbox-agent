import type { Poi, Route, RouteStep, ToolResult } from "../agent/types.ts";

export async function reserveOrJoinPlan(route: Route): Promise<ToolResult[]> {
  return route.steps.map((step) => {
    const reservation = buildReservationAssist(step);

    if (!reservation.shouldReserve) {
      return {
        toolName: "reserveOrJoinPlan",
        status: "success",
        poiId: step.poi.id,
        message: `${step.poi.name} 已加入行程`,
        result: {
          joined: true,
          reservationNeeded: false
        }
      };
    }

    return {
      toolName: "reservationAssist",
      status: "success",
      poiId: step.poi.id,
      message: `${step.poi.name} 建议提前确认座位，已生成预订话术和行动入口`,
      result: {
        joined: true,
        reservationNeeded: true,
        reason: reservation.reason,
        visitTimeText: reservation.visitTimeText,
        script: reservation.script,
        actions: {
          copyScript: true,
          callPhone: Boolean(step.poi.phone),
          openMeituan: Boolean(step.poi.mockMeituanUrl)
        },
        phone: step.poi.phone ?? null,
        meituanUrl: step.poi.mockMeituanUrl ?? null,
        disclaimer: "当前版本不声明真实预订成功，只辅助用户完成预订前的信息整理和最后一步操作。"
      }
    };
  });
}

function buildReservationAssist(step: RouteStep) {
  const poi = step.poi;
  const visitTimeText = estimateVisitTimeText(step);

  return {
    shouldReserve: shouldPrepareReservation(poi),
    visitTimeText,
    reason: getReservationReason(poi),
    script: [
      "你好，我想确认一下是否可以预约/预留座位。",
      `我们预计${visitTimeText}到店，人数按当前行程同行人数确认。`,
      "如果可以的话，麻烦帮忙备注尽量少等待；如果不支持预留，也想确认一下当前大概排队时长。"
    ].join("")
  };
}

function shouldPrepareReservation(poi: Poi): boolean {
  if (poi.bookingRequired) return true;
  if (poi.availableTools?.includes("reservationAssist")) return true;

  const isMeal = poi.type === "餐饮正餐" || /餐|饭|火锅|烧烤|粤菜|正餐|简餐/.test(poi.subType);
  const isBusy = poi.queueLevel === "high" || poi.queueLevel === "medium";
  const isPopular = (poi.reviewCount ?? 0) >= 1000 || (poi.meituanRating ?? 0) >= 4.7;

  return isMeal && (isBusy || isPopular);
}

function getReservationReason(poi: Poi): string {
  if (poi.bookingRequired) return "该地点标记为需要提前预约。";
  if (poi.queueLevel === "high") return "该餐饮点排队风险较高，建议提前电话或平台确认座位。";
  if (poi.queueLevel === "medium") return "该餐饮点可能需要等待，提前确认能降低到店不确定性。";
  return "该地点适合提前确认营业和接待情况。";
}

function estimateVisitTimeText(step: RouteStep): string {
  if (step.startTimeText) return step.startTimeText;
  if (step.role === "meal") return "18:30左右";
  if (step.role === "break") return "下午茶时段";
  return "到达前";
}
