import { executePlan, generatePlan, handleReplan } from "../agent/orchestrator";

const userInput = {
  rawText: "周六下午想和朋友在深圳玩4小时，想拍照喝咖啡吃点东西，不想排队",
  quickSelections: {
    peopleType: "朋友" as const
  }
};

const plan = await generatePlan(userInput);
console.log("=== generatePlan ===");
console.log(JSON.stringify(plan, null, 2));

const executedPlan = await executePlan(plan);
console.log("=== executePlan ===");
console.log(JSON.stringify(executedPlan.executionTasks, null, 2));

const mealStep = plan.route.steps.find((step) => step.poi.type === "餐饮正餐");
if (mealStep) {
  const replanned = await handleReplan(
    {
      type: "queue",
      poiId: mealStep.poi.id,
      waitMinutes: 45,
      message: "餐饮点当前排队约45分钟"
    },
    plan
  );
  console.log("=== handleReplan ===");
  console.log(JSON.stringify(replanned.planB, null, 2));
}
