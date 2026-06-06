"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api-src/execute-plan.ts
var execute_plan_exports = {};
__export(execute_plan_exports, {
  default: () => handler
});
module.exports = __toCommonJS(execute_plan_exports);

// new-agent-a-module/src/tools/reserveOrJoinPlan.ts
async function reserveOrJoinPlan(route) {
  return route.steps.map((step) => {
    const reservation = buildReservationAssist(step);
    if (reservation.isReservationRelevant && !reservation.shouldReserve) {
      return {
        toolName: "reservationAssist",
        status: "success",
        poiId: step.poi.id,
        message: `${step.poi.name} \u5DF2\u68C0\u67E5\u9884\u8BA2\u9700\u6C42\uFF0C\u5F53\u524D\u65E0\u9700\u63D0\u524D\u9884\u8BA2`,
        result: {
          joined: true,
          reservationNeeded: false,
          reason: reservation.reason,
          visitTimeText: reservation.visitTimeText,
          script: null,
          actions: {
            copyScript: false,
            callPhone: false,
            openMeituan: Boolean(step.poi.mockMeituanUrl)
          },
          phone: step.poi.phone ?? null,
          meituanUrl: step.poi.mockMeituanUrl ?? null,
          disclaimer: "Agent \u5DF2\u5224\u65AD\u8BE5\u6B63\u9910\u8282\u70B9\u5F53\u524D\u4E0D\u9700\u8981\u63D0\u524D\u9884\u8BA2\uFF0C\u4ECD\u4F1A\u4FDD\u7559\u7F8E\u56E2\u5165\u53E3\u4F9B\u7528\u6237\u67E5\u770B\u3002"
        }
      };
    }
    if (!reservation.shouldReserve) {
      return {
        toolName: "reserveOrJoinPlan",
        status: "success",
        poiId: step.poi.id,
        message: `${step.poi.name} \u5DF2\u52A0\u5165\u884C\u7A0B`,
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
      message: `${step.poi.name} \u5EFA\u8BAE\u63D0\u524D\u786E\u8BA4\u5EA7\u4F4D\uFF0C\u5DF2\u751F\u6210\u9884\u8BA2\u8BDD\u672F\u548C\u884C\u52A8\u5165\u53E3`,
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
        disclaimer: "\u5F53\u524D\u7248\u672C\u4E0D\u58F0\u660E\u771F\u5B9E\u9884\u8BA2\u6210\u529F\uFF0C\u53EA\u8F85\u52A9\u7528\u6237\u5B8C\u6210\u9884\u8BA2\u524D\u7684\u4FE1\u606F\u6574\u7406\u548C\u6700\u540E\u4E00\u6B65\u64CD\u4F5C\u3002"
      }
    };
  });
}
function buildReservationAssist(step) {
  const poi = step.poi;
  const visitTimeText = estimateVisitTimeText(step);
  return {
    isReservationRelevant: isReservationRelevant(poi),
    shouldReserve: shouldPrepareReservation(poi),
    visitTimeText,
    reason: getReservationReason(poi),
    script: [
      "\u4F60\u597D\uFF0C\u6211\u60F3\u786E\u8BA4\u4E00\u4E0B\u662F\u5426\u53EF\u4EE5\u9884\u7EA6/\u9884\u7559\u5EA7\u4F4D\u3002",
      `\u6211\u4EEC\u9884\u8BA1${visitTimeText}\u5230\u5E97\uFF0C\u4EBA\u6570\u6309\u5F53\u524D\u884C\u7A0B\u540C\u884C\u4EBA\u6570\u786E\u8BA4\u3002`,
      "\u5982\u679C\u53EF\u4EE5\u7684\u8BDD\uFF0C\u9EBB\u70E6\u5E2E\u5FD9\u5907\u6CE8\u5C3D\u91CF\u5C11\u7B49\u5F85\uFF1B\u5982\u679C\u4E0D\u652F\u6301\u9884\u7559\uFF0C\u4E5F\u60F3\u786E\u8BA4\u4E00\u4E0B\u5F53\u524D\u5927\u6982\u6392\u961F\u65F6\u957F\u3002"
    ].join("")
  };
}
function shouldPrepareReservation(poi) {
  if (poi.bookingRequired) return true;
  const isBusy = poi.queueLevel === "high" || poi.queueLevel === "medium";
  return isReservationRelevant(poi) && isBusy;
}
function isReservationRelevant(poi) {
  return poi.type === "\u9910\u996E\u6B63\u9910" || /餐|饭|火锅|烧烤|粤菜|正餐|简餐/.test(poi.subType);
}
function getReservationReason(poi) {
  if (poi.bookingRequired) return "\u8BE5\u5730\u70B9\u6807\u8BB0\u4E3A\u9700\u8981\u63D0\u524D\u9884\u7EA6\u3002";
  if (poi.queueLevel === "high") return "\u8BE5\u9910\u996E\u70B9\u6392\u961F\u98CE\u9669\u8F83\u9AD8\uFF0C\u5EFA\u8BAE\u63D0\u524D\u7535\u8BDD\u6216\u5E73\u53F0\u786E\u8BA4\u5EA7\u4F4D\u3002";
  if (poi.queueLevel === "medium") return "\u8BE5\u9910\u996E\u70B9\u53EF\u80FD\u9700\u8981\u7B49\u5F85\uFF0C\u63D0\u524D\u786E\u8BA4\u80FD\u964D\u4F4E\u5230\u5E97\u4E0D\u786E\u5B9A\u6027\u3002";
  if (isReservationRelevant(poi)) return "\u8BE5\u6B63\u9910\u8282\u70B9\u6392\u961F\u98CE\u9669\u8F83\u4F4E\uFF0C\u5F53\u524D\u53EF\u76F4\u63A5\u52A0\u5165\u884C\u7A0B\uFF0C\u65E0\u9700\u63D0\u524D\u9884\u8BA2\u3002";
  return "\u8BE5\u5730\u70B9\u9002\u5408\u63D0\u524D\u786E\u8BA4\u8425\u4E1A\u548C\u63A5\u5F85\u60C5\u51B5\u3002";
}
function estimateVisitTimeText(step) {
  if (step.startTimeText) return step.startTimeText;
  if (step.role === "meal") return "18:30\u5DE6\u53F3";
  if (step.role === "break") return "\u4E0B\u5348\u8336\u65F6\u6BB5";
  return "\u5230\u8FBE\u524D";
}

// new-agent-a-module/src/agent/orchestrator.ts
async function executePlan(plan) {
  const executionTasks = await reserveOrJoinPlan(plan.route);
  return {
    ...plan,
    executionTasks
  };
}

// api-src/execute-plan.ts
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
function handleOptions(req, res) {
  if (req.method !== "OPTIONS") return false;
  setCors(res);
  res.status(204).json({});
  return true;
}
function sendError(res, err) {
  const message = err instanceof Error ? err.message : "Unknown server error";
  res.status(500).json({ error: message });
}
async function handler(req, res) {
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
