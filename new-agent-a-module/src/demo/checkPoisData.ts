import { pois } from "../data/pois.ts";

const validTypes = new Set(["餐饮正餐", "轻食甜饮", "文化体验", "户外散步", "休闲娱乐", "拍照地标"]);
const validPeople = new Set(["单人", "情侣", "朋友", "亲子"]);
const validQueue = new Set(["low", "medium", "high"]);

const idCount = new Map<string, number>();
const issues: string[] = [];

for (const poi of pois) {
  idCount.set(poi.id, (idCount.get(poi.id) ?? 0) + 1);

  if (!validTypes.has(poi.type)) issues.push(`${poi.id} ${poi.name}: type 不合法：${poi.type}`);
  if (typeof poi.price !== "number") issues.push(`${poi.id} ${poi.name}: price 不是数字`);
  if (!Array.isArray(poi.tags)) issues.push(`${poi.id} ${poi.name}: tags 不是数组`);
  if (!Array.isArray(poi.limits)) issues.push(`${poi.id} ${poi.name}: limits 不是数组`);
  if (!Array.isArray(poi.fitPeople)) {
    issues.push(`${poi.id} ${poi.name}: fitPeople 不是数组`);
  } else {
    for (const person of poi.fitPeople) {
      if (!validPeople.has(person)) issues.push(`${poi.id} ${poi.name}: fitPeople 不合法：${person}`);
    }
  }
  if (!validQueue.has(poi.queueLevel)) issues.push(`${poi.id} ${poi.name}: queueLevel 不合法：${poi.queueLevel}`);
  if (!poi.reason) issues.push(`${poi.id} ${poi.name}: 缺少 reason`);
}

for (const [id, count] of idCount) {
  if (count > 1) issues.push(`重复 id：${id} 出现 ${count} 次`);
}

const byType = new Map<string, number>();
for (const poi of pois) {
  byType.set(poi.type, (byType.get(poi.type) ?? 0) + 1);
}

const highMeals = pois.filter((poi) => poi.type === "餐饮正餐" && poi.queueLevel === "high");
const lowMeals = pois.filter((poi) => poi.type === "餐饮正餐" && poi.queueLevel === "low");
const outdoor = pois.filter((poi) => poi.weatherSensitive || poi.limits.includes("室外"));
const indoor = pois.filter((poi) => poi.weatherSensitive === false || poi.limits.includes("室内") || poi.limits.includes("雨天可去"));
const byRouteCluster = new Map<string, number>();
const farPois = pois.filter((poi) => poi.distanceLevel === "10km以上" || poi.distanceLevel === "far");
for (const poi of pois) {
  if (!poi.routeCluster) issues.push(`${poi.id} ${poi.name}: 缺少 routeCluster`);
  byRouteCluster.set(poi.routeCluster ?? "未分圈", (byRouteCluster.get(poi.routeCluster ?? "未分圈") ?? 0) + 1);
}

console.log("\nPOI 数据检查结果");
console.log(`总数：${pois.length}`);
console.log("类型分布：");
for (const [type, count] of byType) {
  console.log(`- ${type}: ${count}`);
}

console.log(`高排队餐饮：${highMeals.length}`);
console.log(`低排队餐饮：${lowMeals.length}`);
console.log(`室外/天气敏感点：${outdoor.length}`);
console.log(`室内/雨天可去点：${indoor.length}`);
console.log(`远距离点：${farPois.length}`);
console.log("路线圈分布：");
for (const [cluster, count] of byRouteCluster) {
  console.log(`- ${cluster}: ${count}`);
}

if (issues.length === 0) {
  console.log("\n基础字段检查通过。");
} else {
  console.log(`\n发现 ${issues.length} 个问题：`);
  for (const issue of issues.slice(0, 50)) {
    console.log(`- ${issue}`);
  }
}

if (highMeals.length > 0 && lowMeals.length > 0) {
  console.log("\nPlan B 排队替换数据：可用。");
  console.log(`示例：${highMeals[0].name} -> ${lowMeals[0].name}`);
} else {
  console.log("\nPlan B 排队替换数据：不足，需要 high 餐饮和 low 餐饮。");
}
