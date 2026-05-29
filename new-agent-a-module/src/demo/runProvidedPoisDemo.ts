import { executePlan, generatePlan, handleReplan } from "../agent/orchestrator.ts";
import { pois } from "../data/pois.ts";

const userInput = {
  rawText:  "现在有点无聊，有没有什么可以打卡拍照的地方？",
  // quickSelections 会覆盖 rawText 解析结果。测试一句话理解时，可以先留空。
  quickSelections: {}
};

console.log("\n用户输入：");
console.log(userInput.rawText);

const plan = await generatePlan(userInput, { pois });

console.log("\nStep 1｜Agent 解析需求");
console.log(`城市：${plan.requirements.city}`);
console.log(`解析方式：${plan.requirements.intentSource === "llm" ? "LLM解析" : "规则兜底"}`);
if (plan.requirements.intentFallbackReason) {
  console.log(`兜底原因：${plan.requirements.intentFallbackReason}`);
}
console.log(`时长：${plan.requirements.durationHours} 小时`);
console.log(`预算：${plan.requirements.budgetMax} 元以内`);
console.log(`同行人：${plan.requirements.peopleType}`);
console.log(`偏好：${plan.requirements.preferences.join(" / ")}`);
console.log(`限制：${plan.requirements.constraints.length > 0 ? plan.requirements.constraints.join(" / ") : "无"}`);

console.log("\nStep 2｜匹配周末盲盒主题");
console.log(`主题：${plan.blindBox.theme}`);
console.log(`标题：${plan.blindBox.title}`);
console.log(`故事：${plan.blindBox.story}`);

console.log("\nStep 3｜生成路线");
for (const step of plan.route.steps) {
  console.log(`${step.order}. ${step.poi.name}｜${step.poi.type}｜${step.poi.subType}｜${step.poi.routeCluster ?? "未分圈"}｜停留 ${step.poi.stayMinutes} 分钟｜排队 ${step.poi.queueLevel}`);
}
console.log(`总耗时：${plan.route.totalMinutes} 分钟`);
console.log(`预计预算：${plan.route.totalBudget} 元`);

console.log("\nStep 4｜并行调用 Mock Tools");
const queueResults = plan.toolStatus.filter((tool) => tool.toolName === "checkQueue");
const availabilityResults = plan.toolStatus.filter((tool) => tool.toolName === "checkAvailability");

console.log("checkQueue：");
for (const tool of queueResults) {
  console.log(`- ${tool.message}`);
}

console.log("checkAvailability：");
for (const tool of availabilityResults) {
  console.log(`- ${tool.message}`);
}

console.log("\nStep 5｜Agent 代预订辅助工具");
const executedPlan = await executePlan(plan);
const reservationTasks = executedPlan.executionTasks.filter((task) => task.toolName === "reservationAssist");
if (reservationTasks.length === 0) {
  console.log("本路线没有需要提前确认座位的节点，所有地点已加入行程。");
} else {
  for (const task of reservationTasks) {
    console.log(`- ${task.message}`);
    console.log(`  原因：${task.result?.reason}`);
    console.log(`  话术：${task.result?.script}`);
    console.log("  说明：不声明真实预订成功，只生成话术、拨号/平台入口，等待用户确认执行。");
  }
}

console.log("\nStep 6｜模拟异常事件");
const currentCluster = plan.route.steps[0]?.poi.routeCluster;
const busyMeal = pois.find((poi) =>
  poi.type === "餐饮正餐"
  && poi.routeCluster === currentCluster
  && poi.queueLevel !== "low"
) ?? pois.find((poi) => poi.type === "餐饮正餐" && poi.routeCluster === currentCluster)
  ?? pois.find((poi) => poi.type === "餐饮正餐" && poi.queueLevel === "high");
if (!busyMeal) {
  console.log("没有找到可模拟排队异常的餐饮点。");
} else {
  console.log(`${busyMeal.name} 当前排队约 45 分钟`);

  const routeWithBusyMeal = {
    ...plan.route,
    steps: plan.route.steps.map((step, index) =>
      step.poi.type === "餐饮正餐" || index === Math.min(2, plan.route.steps.length - 1)
        ? { ...step, poi: busyMeal, note: busyMeal.reason }
        : step
    )
  };
  const planWithBusyMeal = { ...plan, route: routeWithBusyMeal };

  const replanned = await handleReplan(
    {
      type: "queue",
      poiId: busyMeal.id,
      waitMinutes: 45,
      message: "餐饮点当前排队约45分钟"
    },
    planWithBusyMeal,
    { pois }
  );

  console.log("\nStep 7｜Agent 生成 Plan B");
  console.log(`影响：${replanned.planB?.impact}`);
  console.log(`说明：${replanned.planB?.message}`);
  console.log("调整：");
  for (const change of replanned.planB?.changes ?? []) {
    console.log(`- ${change.from} -> ${change.to}：${change.reason}`);
  }

  console.log("\n调整后路线：");
  for (const step of replanned.route.steps) {
    console.log(`${step.order}. ${step.poi.name}｜${step.poi.type}｜${step.poi.routeCluster ?? "未分圈"}｜排队 ${step.poi.queueLevel}`);
  }
}

console.log("\n提示：你可以修改本文件顶部的 rawText，模拟不同用户输入。");
