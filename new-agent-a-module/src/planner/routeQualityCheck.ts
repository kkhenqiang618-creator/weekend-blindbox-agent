import type { Poi, Requirements, Route, RouteStep } from "../agent/types.ts";
import {
  estimateTravelMinutesBetweenPois,
  estimateTravelMinutesFromCurrentLocation,
  getDurationWindow,
} from "./routeQualityRules.ts";
import {
  getBrandKey,
  getCategoryKey,
  getVenueKey,
  isExplicitlyRejectedBrand,
  isExecutablePoi,
  isLowValueAnchorPoi,
  isLowValueChainPoi,
  isRealNavigablePoi,
  normalizePoiForRecommendation,
} from "./poiNormalizer.ts";
import { getExperienceSubKey } from "./amapCategoryMap.ts";

export type RouteQualityIssueSeverity = "fatal" | "warning" | "info";
export type RouteQualityIssueMetaValue = string | number | boolean;

export interface RouteQualityIssue {
  code: string;
  severity: RouteQualityIssueSeverity;
  message: string;
  poiIds?: string[];
  role?: string;
  meta?: Record<string, RouteQualityIssueMetaValue>;
}

export interface RouteQualityResult {
  passed: boolean;
  score: number;
  warnings: string[];
  fatalReasons: string[];
  debugReasons: string[];
  issues: RouteQualityIssue[];
}

export function evaluateRouteQuality(
  route: Route,
  requirements: Requirements,
  template?: unknown
): RouteQualityResult {
  const normalizedSteps = route.steps.map((step) => ({
    ...step,
    poi: normalizePoiForRecommendation(step.poi, requirements),
  }));
  const warnings: string[] = [];
  const fatalReasons: string[] = [];
  const debugReasons: string[] = [];
  const issues: RouteQualityIssue[] = [];

  checkRealPois(normalizedSteps, fatalReasons, debugReasons, issues);
  checkExecutablePois(normalizedSteps, fatalReasons, debugReasons, issues);
  checkDistrictConsistency(normalizedSteps, requirements, fatalReasons, debugReasons, issues);
  checkDuplicateVenues(normalizedSteps, fatalReasons, debugReasons, issues);
  checkDuplicateBrands(normalizedSteps, fatalReasons, debugReasons, issues);
  checkRejectedBrands(normalizedSteps, requirements, fatalReasons, debugReasons, issues);
  checkRejectedTypes(normalizedSteps, requirements, fatalReasons, debugReasons, issues);
  checkAnchor(normalizedSteps, warnings, fatalReasons, debugReasons, issues);
  checkTemplateRoleCoverage(normalizedSteps, template, warnings, debugReasons, issues);
  checkTemplateRoleCompatibility(normalizedSteps, fatalReasons, debugReasons, issues);
  checkCategoryDiversity(normalizedSteps, warnings, debugReasons, issues);
  checkExperienceStacking(normalizedSteps, warnings, debugReasons, issues);
  checkFoodDrinkBalance(normalizedSteps, template, warnings, debugReasons, issues);
  checkLowValueChainLoad(normalizedSteps, warnings, debugReasons, issues);
  checkBudgetRouteValue(normalizedSteps, requirements, warnings, debugReasons, issues);
  checkDuration(route, requirements, warnings, debugReasons, issues);
  checkTravel(normalizedSteps, requirements, warnings, debugReasons, issues);

  if (route.steps.length < getTargetStopCount(requirements)) {
    const targetStopCount = getTargetStopCount(requirements);
    const message = `当前路线为 ${route.steps.length} 站，少于目标 ${targetStopCount} 站；如果候选质量不足，短路线比硬凑点更稳。`;
    addWarning(warnings, issues, {
      code: "too_few_stops_without_reason",
      message,
      meta: {
        currentStops: route.steps.length,
        targetStops: targetStopCount,
      },
    });
  }

  const normalizedTemplateId = normalizeTemplateId(template);
  if (normalizedTemplateId) debugReasons.push(`quality_template=${normalizedTemplateId}`);

  const uniqueWarnings = uniqueMessages(warnings);
  const uniqueFatalReasons = uniqueMessages(fatalReasons);
  const uniqueDebugReasons = uniqueMessages(debugReasons);
  const uniqueIssueList = uniqueIssues(issues);
  const score = calculateRouteQualityScore(route, uniqueWarnings, uniqueFatalReasons);

  return {
    passed: uniqueFatalReasons.length === 0 && score >= 60,
    score,
    warnings: [...uniqueFatalReasons, ...uniqueWarnings],
    fatalReasons: uniqueFatalReasons,
    debugReasons: uniqueDebugReasons,
    issues: uniqueIssueList,
  };
}

function checkExecutablePois(
  steps: RouteStep[],
  fatalReasons: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  for (const step of steps) {
    if (!isExecutablePoi(step.poi)) {
      const message = `「${step.poi.name}」疑似抽象兜底或不可执行地点，不能直接导航/搜索。`;
      addFatal(fatalReasons, issues, {
        code: "not_executable_poi",
        message,
        poiIds: [step.poi.id],
      });
      debugReasons.push(`not_executable:${step.poi.id}:${step.poi.name}`);
    }
  }
}

function checkDistrictConsistency(
  steps: RouteStep[],
  requirements: Requirements,
  fatalReasons: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  if (!requirements.district || requirements.allowCrossDistrict) return;
  for (const step of steps) {
    if (matchesDistrictText(step.poi, requirements.district)) continue;
    const message = `用户指定「${requirements.district}」且未允许跨区，但路线包含「${step.poi.name}」（${step.poi.area || step.poi.businessDistrict}）。`;
    addFatal(fatalReasons, issues, {
      code: "cross_district_without_permission",
      message,
      poiIds: [step.poi.id],
      meta: {
        district: requirements.district,
        poiDistrict: step.poi.area || step.poi.businessDistrict,
      },
    });
    debugReasons.push(`district_mismatch:${step.poi.id}:${step.poi.name}:${step.poi.area || step.poi.businessDistrict}`);
  }
}

function checkRealPois(
  steps: RouteStep[],
  fatalReasons: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  for (const step of steps) {
    if (!isRealNavigablePoi(step.poi)) {
      const message = `「${step.poi.name}」缺少可导航信息或疑似泛化地点。`;
      addFatal(fatalReasons, issues, {
        code: "not_real_navigable_poi",
        message,
        poiIds: [step.poi.id],
      });
      debugReasons.push(`not_real_navigable:${step.poi.id}:${step.poi.name}`);
    }
  }
}

function checkDuplicateVenues(
  steps: RouteStep[],
  fatalReasons: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  const seen = new Map<string, Poi>();
  for (const step of steps) {
    const key = step.poi.venueKey || getVenueKey(step.poi.name, step.poi.area || step.poi.businessDistrict);
    if (key.length < 3) continue;
    const existing = seen.get(key);
    if (existing) {
      const message = `路线重复出现相同或高度相似地点：「${existing.name}」和「${step.poi.name}」。`;
      addFatal(fatalReasons, issues, {
        code: "duplicate_venue",
        message,
        poiIds: [existing.id, step.poi.id],
        meta: { venueKey: key },
      });
      debugReasons.push(`duplicate_venue:${key}`);
      continue;
    }
    seen.set(key, step.poi);
  }
}

function checkDuplicateBrands(
  steps: RouteStep[],
  fatalReasons: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  const seen = new Map<string, Poi>();
  for (const step of steps) {
    const brand = step.poi.brandKey && getBrandKey(step.poi.brandKey)
      ? step.poi.brandKey
      : getBrandKey(buildPoiText(step.poi));
    if (!brand) continue;
    const normalizedBrand = brand.toLowerCase();
    const existing = seen.get(normalizedBrand);
    if (existing) {
      const message = `普通连锁品牌重复出现：「${existing.name}」和「${step.poi.name}」。`;
      addFatal(fatalReasons, issues, {
        code: "duplicate_brand",
        message,
        poiIds: [existing.id, step.poi.id],
        meta: { brandKey: normalizedBrand },
      });
      debugReasons.push(`duplicate_low_value_brand:${brand}`);
      continue;
    }
    seen.set(normalizedBrand, step.poi);
  }
}

function checkRejectedBrands(
  steps: RouteStep[],
  requirements: Requirements,
  fatalReasons: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  for (const step of steps) {
    const brand = getBrandKey(buildPoiText(step.poi));
    if (!brand || !isExplicitlyRejectedBrand(brand, requirements)) continue;
    const message = `用户明确排斥「${brand}」，但路线中仍包含「${step.poi.name}」。`;
    addFatal(fatalReasons, issues, {
      code: "rejected_brand",
      message,
      poiIds: [step.poi.id],
      meta: { brandKey: brand.toLowerCase() },
    });
    debugReasons.push(`rejected_brand:${brand}:${step.poi.id}`);
  }
}

function checkRejectedTypes(
  steps: RouteStep[],
  requirements: Requirements,
  fatalReasons: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  const rejectedTypes = getExplicitlyRejectedTypes(requirements);
  if (rejectedTypes.length === 0) return;

  for (const step of steps) {
    const category = step.poi.categoryKey || getCategoryKey(step.poi);
    const text = buildPoiText(step.poi);
    const matched = rejectedTypes.find((type) =>
      step.poi.type.includes(type)
      || step.poi.subType.includes(type)
      || category.includes(type)
      || text.includes(type)
    );
    if (!matched) continue;
    const message = `用户明确排斥「${matched}」，但路线中仍包含「${step.poi.name}」。`;
    addFatal(fatalReasons, issues, {
      code: "rejected_type",
      message,
      poiIds: [step.poi.id],
      meta: { rejectedType: matched },
    });
    debugReasons.push(`rejected_type:${matched}:${step.poi.id}`);
  }
}

function checkAnchor(
  steps: RouteStep[],
  warnings: string[],
  fatalReasons: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  const anchorStep = inferAnchorStep(steps);
  if (!anchorStep) {
    addWarning(warnings, issues, {
      code: "missing_anchor",
      message: "路线缺少明确核心锚点。",
    });
    debugReasons.push("missing_anchor");
    return;
  }

  if (isLowValueAnchorPoi(anchorStep.poi)) {
    const message = `「${anchorStep.poi.name}」不适合作为路线核心锚点。`;
    addFatal(fatalReasons, issues, {
      code: "low_value_anchor",
      message,
      poiIds: [anchorStep.poi.id],
    });
    debugReasons.push(`low_value_anchor:${anchorStep.poi.id}:${anchorStep.poi.name}`);
    return;
  }

  if (!isMeaningfulAnchorPoi(anchorStep.poi)) {
    addWarning(warnings, issues, {
      code: "weak_anchor",
      message: "路线缺少明显核心锚点，第一站更像普通衔接点。",
      poiIds: [anchorStep.poi.id],
    });
    debugReasons.push(`weak_anchor:${anchorStep.poi.id}:${anchorStep.poi.name}`);
  }
}

function checkCategoryDiversity(
  steps: RouteStep[],
  warnings: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  if (steps.length < 3) return;
  const categoryCounts = new Map<string, number>();
  for (const step of steps) {
    const key = step.poi.categoryKey || getCategoryKey(step.poi);
    categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
  }
  const repeated = [...categoryCounts.entries()]
    .filter(([, count]) => count >= 3);
  if (repeated.length > 0) {
    addWarning(warnings, issues, {
      code: "too_many_same_category",
      message: `路线中同类节点偏多：${repeated.map(([key]) => key).join("、")}。`,
      meta: { repeatedCategoryCount: repeated.length },
    });
    for (const [category, count] of repeated) {
      issues.push({
        code: "too_many_same_category",
        severity: "warning",
        message: `路线中同类节点偏多：${category}。`,
        meta: {
          category,
          count,
        },
      });
    }
    debugReasons.push(`repeated_categories:${repeated.map(([key]) => key).join(",")}`);
  }
}

function checkExperienceStacking(
  steps: RouteStep[],
  warnings: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  if (steps.length < 3) return;
  // Use Amap experience sub-key to detect finer-grained stacking
  // e.g., two coffee shops with different names → same "coffee" sub-key
  const subKeyCounts = new Map<string, Poi[]>();
  for (const step of steps) {
    const subKey = getExperienceSubKey(step.poi);
    if (!subKey) continue;
    const group = subKeyCounts.get(subKey) ?? [];
    group.push(step.poi);
    subKeyCounts.set(subKey, group);
  }

  for (const [subKey, group] of subKeyCounts) {
    if (group.length < 2) continue;
    const names = group.map((poi) => poi.name).join("、");
    addWarning(warnings, issues, {
      code: "same_experience_stacking",
      message: `路线中「${names}」属于同类体验（${labelExperienceSubKey(subKey)}）。`,
      poiIds: group.map((poi) => poi.id),
      meta: { experienceSubKey: subKey, count: group.length },
    });
    debugReasons.push(`experience_stacking:${subKey}:${group.length}`);
  }
}

function labelExperienceSubKey(key: string): string {
  const labels: Record<string, string> = {
    coffee: "咖啡厅", tea: "茶饮", cold_drink: "冷饮",
    bakery: "面包糕饼", dessert: "甜品",
    meal: "正餐", fast_food: "快餐厅", casual_eat: "休闲餐饮",
    park: "公园广场", scenery: "风景名胜",
    museum: "博物馆", exhibition: "展览", gallery: "美术馆",
    library: "图书馆", science: "科技馆", culture_center: "文化空间",
    sports: "运动", cinema: "影剧院", nightlife: "娱乐场所", playground: "游乐场",
  };
  return labels[key] ?? key;
}

function checkFoodDrinkBalance(
  steps: RouteStep[],
  template: unknown,
  warnings: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  const templateId = normalizeTemplateId(template);
  if (!["photo_afternoon_tea", "date"].includes(templateId ?? "")) return;

  const drinkSteps = steps.filter((step) => isDrinkLike(step.poi));
  const foodDrinkSteps = steps.filter((step) => isFoodOrDrinkLike(step.poi));

  if (drinkSteps.length > 1) {
    addWarning(warnings, issues, {
      code: "too_many_drink",
      message: `拍照/约会路线中咖啡甜品类节点偏多：${drinkSteps.map((step) => step.poi.name).join("、")}。`,
      poiIds: drinkSteps.map((step) => step.poi.id),
      meta: { count: drinkSteps.length },
    });
    debugReasons.push(`too_many_drink_nodes:${drinkSteps.map((step) => step.poi.id).join(",")}`);
  }

  if (foodDrinkSteps.length > 2) {
    addWarning(warnings, issues, {
      code: "too_many_food_drink",
      message: `拍照/约会路线中吃喝类节点占比偏高：${foodDrinkSteps.map((step) => step.poi.name).join("、")}。`,
      poiIds: foodDrinkSteps.map((step) => step.poi.id),
      meta: { count: foodDrinkSteps.length },
    });
    debugReasons.push(`too_many_food_drink_nodes:${foodDrinkSteps.map((step) => step.poi.id).join(",")}`);
  }
}

function checkTemplateRoleCoverage(
  steps: RouteStep[],
  template: unknown,
  warnings: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  const templateId = normalizeTemplateId(template);
  if (!templateId) return;

  const requiredRoles = getRequiredTemplateRoles(templateId);
  if (requiredRoles.length === 0) return;

  const presentRoles = new Set(steps.flatMap((step) => normalizeTemplateRole(step)));
  const missingRoles = requiredRoles.filter((role) => !presentRoles.has(role));
  if (missingRoles.length === 0) return;

  addWarning(warnings, issues, {
    code: "missing_template_role",
    message: `路线模板缺少关键角色：${missingRoles.map(labelTemplateRole).join("、")}。`,
    meta: {
      templateId,
      missingCount: missingRoles.length,
    },
  });
  for (const role of missingRoles) {
    issues.push({
      code: "missing_template_role",
      severity: "warning",
      message: `路线模板缺少关键角色：${labelTemplateRole(role)}。`,
      role,
      meta: { templateId },
    });
  }
  debugReasons.push(`missing_template_roles:${templateId}:${missingRoles.join(",")}`);
}

function checkTemplateRoleCompatibility(
  steps: RouteStep[],
  fatalReasons: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  for (const step of steps) {
    if (!step.templateRole) continue;
    if (isTemplateRoleCompatible(step)) continue;
    const message = `「${step.poi.name}」的模板角色「${labelTemplateRole(step.templateRole)}」与地点类型「${step.poi.type}」不匹配。`;
    addFatal(fatalReasons, issues, {
      code: "template_role_mismatch",
      message,
      poiIds: [step.poi.id],
      role: step.templateRole,
    });
    debugReasons.push(`template_role_mismatch:${step.templateRole}:${step.poi.id}:${step.poi.name}`);
  }
}

function checkLowValueChainLoad(
  steps: RouteStep[],
  warnings: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  const chainSteps = steps.filter((step) => isLowValueChainPoi(step.poi));
  if (chainSteps.length >= 2) {
    addWarning(warnings, issues, {
      code: "too_many_low_value_chains",
      message: `普通连锁节点偏多：${chainSteps.map((step) => step.poi.name).join("、")}。`,
      poiIds: chainSteps.map((step) => step.poi.id),
      meta: { count: chainSteps.length },
    });
    debugReasons.push(`too_many_low_value_chains:${chainSteps.map((step) => step.poi.id).join(",")}`);
  }
}

function checkBudgetRouteValue(
  steps: RouteStep[],
  requirements: Requirements,
  warnings: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  if (requirements.budgetMax > 150) return;
  const hasLowBudgetValue = steps.some((step) => {
    const text = buildPoiText(step.poi);
    return step.poi.price === 0
      || /本地|老字号|夜市|美食街|市集|小吃|茶餐厅|公园|绿道|栈道|街区|古城|博物馆|美术馆|图书馆|文化馆/.test(text);
  });
  if (!hasLowBudgetValue) {
    addWarning(warnings, issues, {
      code: "low_budget_missing_local_value",
      message: "低预算路线缺少本地小吃、夜市市集、免费公共空间或文化空间，可能显得普通。",
    });
    debugReasons.push("low_budget_missing_local_or_free_value");
  }
}

function getRequiredTemplateRoles(templateId: string): string[] {
  const roles: Record<string, string[]> = {
    relaxed_half_day: ["anchor", "support", "break"],
    photo_afternoon_tea: ["anchor", "break", "support", "ending"],
    low_budget: ["anchor", "meal", "support"],
    rainy_indoor: ["anchor", "support", "break"],
    friends_gathering: ["anchor", "support", "meal"],
    date: ["anchor", "break", "ending"],
    family: ["anchor", "support", "break"],
  };
  return roles[templateId] ?? [];
}

function normalizeTemplateRole(step: RouteStep): string[] {
  const roles = new Set<string>();
  if (step.isAnchor || step.templateRole === "anchor") roles.add("anchor");
  const rawRole = step.templateRole ?? step.role;
  if (rawRole === "break") roles.add("break");
  if (rawRole === "meal" || rawRole === "local_food") roles.add("meal");
  if (rawRole === "ending") roles.add("ending");
  if (["support", "free_space", "indoor_activity", "interactive", "atmosphere", "family_activity"].includes(rawRole)) {
    roles.add("support");
  }

  const category = step.poi.categoryKey || getCategoryKey(step.poi);
  if (category === "drink") roles.add("break");
  if (category === "meal") roles.add("meal");
  if (category === "local_food") { roles.add("meal"); roles.add("support"); }
  if (["culture", "outdoor", "photo", "entertainment"].includes(category)) roles.add("support");
  return [...roles];
}

function labelTemplateRole(role: string): string {
  const labels: Record<string, string> = {
    anchor: "主锚点",
    break: "休息/下午茶",
    meal: "正餐/本地吃食",
    support: "补充体验",
    ending: "收尾点",
  };
  return labels[role] ?? role;
}

function isTemplateRoleCompatible(step: RouteStep): boolean {
  const role = step.templateRole;
  const category = step.poi.categoryKey || getCategoryKey(step.poi);
  const text = buildPoiText(step.poi);
  if (!role) return true;
  if (role === "anchor") return ["culture", "outdoor", "photo", "entertainment"].includes(category);
  if (role === "break") return category === "drink" || /咖啡|下午茶|甜品|茶饮|面包|休息|书店|书吧|书房|图书|阅读/i.test(text);
  if (role === "meal" || role === "local_food") return ["meal", "local_food"].includes(category) || /正餐|小吃|饭|餐|美食|茶餐厅|夜市|美食街/i.test(text);
  if (role === "free_space") return ["local_food"].includes(category) || step.poi.price === 0 || /免费|公园|绿道|街区|古镇|图书馆|博物馆|美术馆|文化馆/i.test(text);
  if (role === "indoor_activity") return ["culture", "entertainment"].includes(category) && (step.poi.limits.includes("室内") || step.poi.limits.includes("雨天可去") || /室内|书店|书吧|美术馆|博物馆|展览|桌游|手作|密室|剧本杀|影院|DIY|棋牌|台球|健身|电竞|网吧|儿童乐园|游泳馆/i.test(text));
  if (role === "interactive") return category === "entertainment" || /互动|桌游|KTV|密室|剧本杀|棋牌|台球|运动|健身|电竞|DIY|手作|团建|酒吧|露营|采摘|轰趴|市集|夜市|聚会|聊天|体验|足浴|按摩|洗浴|汗蒸|网吧|私人影院|游泳|羽毛球|儿童乐园/i.test(text);
  if (role === "atmosphere") return ["culture", "outdoor", "photo", "drink"].includes(category) || /氛围|夜景|约会|艺术|书店|书吧|公园|海滨|街区|古镇|拍照|酒吧|私人影院|展览|茶馆|手工|DIY/i.test(text);
  if (role === "family_activity") return ["culture", "outdoor", "entertainment"].includes(category) && /亲子|儿童|自然教育|公园|博物馆|图书馆|少走路|雨天可去|儿童乐园/i.test(text);
  if (role === "ending") return ["outdoor", "photo", "culture", "entertainment"].includes(category) || /散步|公园|绿道|海滨|街区|书店|书吧|美术馆|艺术馆/i.test(text);
  if (role === "support") return ["culture", "outdoor", "photo", "entertainment", "meal", "local_food"].includes(category);
  return true;
}

function matchesDistrictText(poi: Poi, district: string): boolean {
  const normalized = district.replace(/区$/, "");
  return [poi.area, poi.businessDistrict, poi.routeCluster, poi.address]
    .filter(Boolean)
    .some((value) => String(value).includes(normalized));
}

function checkDuration(
  route: Route,
  requirements: Requirements,
  warnings: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  const window = getDurationWindow(requirements);
  if (route.totalMinutes < window.min) {
    const message = `路线总时长 ${route.totalMinutes} 分钟低于预期下限 ${window.min} 分钟。`;
    addWarning(warnings, issues, {
      code: "duration_under",
      message,
      meta: {
        totalMinutes: route.totalMinutes,
        minMinutes: window.min,
      },
    });
    debugReasons.push(`duration_under:${route.totalMinutes}<${window.min}`);
  }
  if (route.totalMinutes > window.max) {
    const message = `路线总时长 ${route.totalMinutes} 分钟超过预期上限 ${window.max} 分钟。`;
    addWarning(warnings, issues, {
      code: "duration_over",
      message,
      meta: {
        totalMinutes: route.totalMinutes,
        maxMinutes: window.max,
      },
    });
    debugReasons.push(`duration_over:${route.totalMinutes}>${window.max}`);
  }
}

function checkTravel(
  steps: RouteStep[],
  requirements: Requirements,
  warnings: string[],
  debugReasons: string[],
  issues: RouteQualityIssue[]
): void {
  const first = steps[0]?.poi;
  if (first && requirements.currentLocation) {
    const firstLeg = estimateTravelMinutesFromCurrentLocation(first, requirements.currentLocation);
    if (firstLeg > 60) {
      const message = `第一站预计路程约 ${firstLeg} 分钟，可能偏远。`;
      addWarning(warnings, issues, {
        code: "first_leg_too_long",
        message,
        poiIds: [first.id],
        meta: { minutes: firstLeg },
      });
      debugReasons.push(`first_leg_over_60:${firstLeg}:${first.name}`);
    }
  }

  for (let index = 1; index < steps.length; index += 1) {
    const previous = steps[index - 1].poi;
    const current = steps[index].poi;
    const minutes = estimateTravelMinutesBetweenPois(previous, current);
    if (minutes > 60) {
      const message = `「${previous.name}」到「${current.name}」预计约 ${minutes} 分钟，单段交通偏长。`;
      addWarning(warnings, issues, {
        code: "segment_too_long",
        message,
        poiIds: [previous.id, current.id],
        meta: { minutes },
      });
      debugReasons.push(`segment_over_60:${minutes}:${previous.id}->${current.id}`);
    }
  }
}

function inferAnchorStep(steps: RouteStep[]): RouteStep | undefined {
  return steps.find((step) => step.isAnchor)
    ?? steps.find((step) => step.role === "activity" && !isLowValueChainPoi(step.poi) && isMeaningfulAnchorPoi(step.poi))
    ?? steps.find((step) => step.role === "activity" && !isLowValueChainPoi(step.poi))
    ?? steps[0];
}

function isMeaningfulAnchorPoi(poi: Poi): boolean {
  const category = poi.categoryKey || getCategoryKey(poi);
  const text = buildPoiText(poi);
  if (["culture", "outdoor", "photo", "entertainment"].includes(category)) return true;
  return /本地|老字号|夜市|美食街|市集|特色街区|古城|古镇|文创|创意园|公园|绿道|栈道|海滨|博物馆|美术馆|艺术馆|图书馆|书店|书吧|文化馆/.test(text);
}

function isFoodOrDrinkLike(poi: Poi): boolean {
  return isDrinkLike(poi) || isMealLike(poi);
}

function isDrinkLike(poi: Poi): boolean {
  const category = poi.categoryKey || getCategoryKey(poi);
  return category === "drink" || /咖啡|下午茶|甜品|茶饮|奶茶|面包|饮品/i.test(buildPoiText(poi));
}

function isMealLike(poi: Poi): boolean {
  const category = poi.categoryKey || getCategoryKey(poi);
  return category === "meal" || /正餐|小吃|饭|餐|美食|茶餐厅|夜市|美食街|火锅|烧烤/i.test(buildPoiText(poi));
}

function getExplicitlyRejectedTypes(requirements: Requirements): string[] {
  const text = [
    requirements.rawText,
    ...requirements.constraints,
    ...(requirements.userProfile?.rejectedKeywords ?? []),
    ...(requirements.userProfile?.dislikedPoiTypes ?? []),
  ].filter(Boolean).join(" ");
  const knownTypes = [
    "餐饮正餐",
    "轻食甜饮",
    "文化体验",
    "户外散步",
    "拍照地标",
    "休闲娱乐",
    "咖啡",
    "奶茶",
    "甜品",
    "火锅",
    "商场",
    "桌游",
    "密室",
    "公园",
  ];
  return knownTypes.filter((type) =>
    new RegExp(`(不要|不想去|不去|别去|避开|少推荐|拒绝).{0,12}${type}`, "i").test(text)
  );
}

function getTargetStopCount(requirements: Requirements): number {
  const targetMinutes = requirements.durationHours * 60;
  if (targetMinutes <= 150) return 3;
  if (targetMinutes >= 330) return 4;
  return 4;
}

function calculateRouteQualityScore(route: Route, warnings: string[], fatalReasons: string[]): number {
  let score = 86;
  score -= fatalReasons.length * 24;
  score -= warnings.length * 8;
  if (route.steps.length >= 4) score += 4;
  if (route.steps.length <= 1) score -= 30;
  return Math.max(0, Math.min(100, score));
}

function normalizeTemplateId(template: unknown): string | undefined {
  if (!template) return undefined;
  if (typeof template === "string") return template;
  if (typeof template === "object" && "id" in template) {
    const id = (template as { id?: unknown }).id;
    return typeof id === "string" ? id : undefined;
  }
  return undefined;
}

function uniqueMessages(messages: string[]): string[] {
  return [...new Set(messages.filter((message) => message.trim().length > 0))];
}

function uniqueIssues(issues: RouteQualityIssue[]): RouteQualityIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = [
      issue.severity,
      issue.code,
      issue.message,
      issue.role ?? "",
      issue.poiIds?.join(",") ?? "",
      issue.meta ? JSON.stringify(issue.meta) : "",
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function addFatal(
  fatalReasons: string[],
  issues: RouteQualityIssue[],
  issue: Omit<RouteQualityIssue, "severity">
): void {
  fatalReasons.push(issue.message);
  issues.push({ ...issue, severity: "fatal" });
}

function addWarning(
  warnings: string[],
  issues: RouteQualityIssue[],
  issue: Omit<RouteQualityIssue, "severity">
): void {
  warnings.push(issue.message);
  issues.push({ ...issue, severity: "warning" });
}

function buildPoiText(poi: Poi): string {
  return [
    poi.name,
    poi.type,
    poi.subType,
    poi.address,
    poi.area,
    poi.businessDistrict,
    poi.routeCluster,
    poi.tags.join(" "),
    poi.limits.join(" "),
    poi.reason,
    poi.amapCategoryPath,
    poi.amapCategoryName,
  ].filter(Boolean).join(" ");
}
