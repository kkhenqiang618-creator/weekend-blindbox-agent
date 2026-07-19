import type { Poi, Requirements, RouteStep } from "../agent/types.ts";
import type { AnchorSelection } from "./anchorSelector.ts";
import type { RouteTemplate } from "./routeTemplates.ts";
import { getMinimumStopCount, getTargetStopCount } from "./routeTemplates.ts";
import {
  estimateRouteMinutes,
  estimateTravelMinutesBetweenPois,
  estimateTravelMinutesFromCurrentLocation,
  getDurationWindow,
  getVenueComplexKey,
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

export interface RouteDraft {
  steps: RouteStep[];
  template: RouteTemplate;
  anchor: AnchorSelection | null;
  warnings: string[];
  debugReasons: string[];
}

export interface ComposeRouteInput {
  candidates: Poi[];
  requirements: Requirements;
  theme: string;
  template: RouteTemplate;
  anchor: AnchorSelection | null;
  excludedPoiIds?: string[];
  excludedVenueKeys?: string[];
  excludedBrandKeys?: string[];
  forbiddenCategories?: string[];
  preferredRoles?: string[];
}

export function composeRouteFromTemplate(input: ComposeRouteInput): RouteDraft {
  const { requirements, template, anchor } = input;
  const warnings: string[] = [];
  const debugReasons: string[] = [`composer_template=${template.id}`, `composer_theme=${input.theme || "none"}`];
  const targetStopCount = getTargetStopCount(requirements, template);
  const minStopCount = getMinimumStopCount(requirements, template);
  const maxMinutes = getDurationWindow(requirements).max;
  const normalizedCandidates = input.candidates
    .map((poi) => normalizePoiForRecommendation(poi, requirements))
    .filter((poi) => isUsablePoi(poi, requirements, warnings, debugReasons));

  const selected: RouteStep[] = [];
  const normalizedAnchor = anchor?.poi
    ? normalizePoiForRecommendation(anchor.poi, requirements)
    : null;

  if (normalizedAnchor && isUsableAnchor(normalizedAnchor, requirements)) {
    addStep(selected, normalizedAnchor, "anchor", anchor?.reason);
    debugReasons.push(`composer_anchor_selected:${normalizedAnchor.id}:${normalizedAnchor.name}`);
  } else if (normalizedAnchor) {
    warnings.push(`候选锚点「${normalizedAnchor.name}」质量不足，已跳过模板锚点。`);
    debugReasons.push(`composer_anchor_rejected:${normalizedAnchor.id}:${normalizedAnchor.name}`);
  } else {
    warnings.push("模板组装未找到可用主锚点。");
    debugReasons.push("composer_missing_anchor");
  }

  const slots = getTemplateSlots(template);
  for (const slot of slots) {
    if (selected.length >= targetStopCount) break;
    if (slot === "anchor" && selected.some((step) => step.templateRole === "anchor")) continue;

    const candidate = pickSlotCandidate(normalizedCandidates, selected, slot, input);
    if (!candidate) {
      debugReasons.push(`composer_slot_missing:${slot}`);
      continue;
    }

    const preview = buildPreview(selected, candidate, slot);
    if (estimateRouteMinutes(preview) > maxMinutes && selected.length >= minStopCount) {
      warnings.push(`已跳过「${candidate.name}」：作为第 ${selected.length + 1} 个点会让路线超过时长上限。`);
      debugReasons.push(`composer_skip_over_duration:${slot}:${candidate.id}`);
      continue;
    }

    addStep(selected, candidate, slot, buildRoleReason(candidate, slot, template));
  }

  fillSupportStops(selected, normalizedCandidates, input, targetStopCount, maxMinutes, debugReasons);

  if (selected.length < targetStopCount) {
    warnings.push(`模板目标为 ${targetStopCount} 个点，但只找到 ${selected.length} 个高质量可衔接节点；不为凑数加入低质量地点。`);
    debugReasons.push(`composer_under_target:${selected.length}<${targetStopCount}`);
  }

  if (selected.length < minStopCount) {
    warnings.push(`模板组装低于最低 ${minStopCount} 个点，将回退到旧路线生成逻辑。`);
    debugReasons.push(`composer_below_minimum:${selected.length}<${minStopCount}`);
  }

  return {
    steps: selected.map((step, index) => ({ ...step, order: index + 1 })),
    template,
    anchor,
    warnings: uniqueMessages(warnings),
    debugReasons: uniqueMessages(debugReasons),
  };
}

function getTemplateSlots(template: RouteTemplate): string[] {
  const byTemplate: Record<RouteTemplate["id"], string[]> = {
    relaxed_half_day: ["anchor", "support", "break", "meal", "ending"],
    photo_afternoon_tea: ["anchor", "break", "support", "ending", "meal"],
    low_budget: ["anchor", "local_food", "free_space", "support", "ending"],
    rainy_indoor: ["anchor", "indoor_activity", "break", "meal", "support"],
    friends_gathering: ["anchor", "interactive", "meal", "break", "ending"],
    date: ["anchor", "atmosphere", "break", "ending", "meal"],
    family: ["anchor", "family_activity", "break", "meal", "ending"],
  };
  return byTemplate[template.id] ?? template.targetRoles;
}

function pickSlotCandidate(
  candidates: Poi[],
  selected: RouteStep[],
  slot: string,
  input: ComposeRouteInput
): Poi | undefined {
  const usableCandidates = candidates
    .filter((candidate) => canUseCandidate(candidate, selected, slot, input));
  const pool = slot === "break" && prefersQuietBookishBreak(input.requirements) && usableCandidates.some(isBookishBreak)
    ? usableCandidates.filter(isBookishBreak)
    : usableCandidates;
  const preferredRoles = new Set(input.preferredRoles ?? []);

  return pool
    .map((candidate) => ({
      candidate,
      score: scoreCandidateForSlot(candidate, selected, slot, input)
        + (preferredRoles.has(slot) ? 28 : 0),
    }))
    .sort((a, b) => b.score - a.score)[0]?.candidate;
}

function fillSupportStops(
  selected: RouteStep[],
  candidates: Poi[],
  input: ComposeRouteInput,
  targetStopCount: number,
  maxMinutes: number,
  debugReasons: string[]
): void {
  const roles = buildFillRolePriority(input.preferredRoles);
  for (const role of roles) {
    if (selected.length >= targetStopCount) return;
    const candidate = pickSlotCandidate(candidates, selected, role, input);
    if (!candidate) continue;
    const preview = buildPreview(selected, candidate, role);
    if (estimateRouteMinutes(preview) > maxMinutes) {
      debugReasons.push(`composer_fill_skip_over_duration:${role}:${candidate.id}`);
      continue;
    }
    addStep(selected, candidate, role, buildRoleReason(candidate, role, input.template));
  }
}

function buildFillRolePriority(preferredRoles?: string[]): string[] {
  const fillableRoles = [
    "support",
    "ending",
    "break",
    "meal",
    "local_food",
    "free_space",
    "indoor_activity",
    "interactive",
    "atmosphere",
    "family_activity",
  ];
  return [...new Set([...(preferredRoles ?? []).filter((role) => fillableRoles.includes(role)), ...fillableRoles])];
}

function canUseCandidate(candidate: Poi, selected: RouteStep[], slot: string, input: ComposeRouteInput): boolean {
  const { requirements, template } = input;
  if (selected.some((step) => step.poi.id === candidate.id)) return false;
  if (input.excludedPoiIds?.includes(candidate.id)) return false;
  const candidateVenueKey = candidate.venueKey || getVenueKey(candidate.name, candidate.area || candidate.businessDistrict);
  if (candidateVenueKey.length >= 3 && normalizeKeyList(input.excludedVenueKeys).includes(candidateVenueKey.toLowerCase())) return false;
  const candidateBrandKey = candidate.brandKey || getBrandKey(buildPoiText(candidate));
  if (candidateBrandKey && normalizeKeyList(input.excludedBrandKeys).includes(candidateBrandKey.toLowerCase())) return false;
  if (hasDuplicateVenue(selected, candidate)) return false;
  if (hasDuplicateLowValueBrand(selected, candidate)) return false;
  if (wouldRepeatCategoryConsecutively(selected, candidate) && !(slot === "break" && isBookishBreak(candidate))) return false;
  if (exceedsTemplateCategoryLimit(selected, candidate, slot, template)) return false;
  const category = candidate.categoryKey || getCategoryKey(candidate);
  if (input.forbiddenCategories?.includes(category)) return false;
  if (!isRealNavigablePoi(candidate)) return false;
  if (!isExecutablePoi(candidate)) return false;
  if (!matchesRequestedDistrict(candidate, requirements)) return false;
  if (!isRoleCompatibleForSlot(candidate, slot)) return false;
  if (isCoreSlot(slot) && isLowValueAnchorPoi(candidate)) return false;
  if (isCoreSlot(slot) && isLowValueChainPoi(candidate, requirements)) return false;
  if (isRejectedPoi(candidate, requirements)) return false;
  if (!canConnectToSelected(selected, candidate, requirements)) return false;
  return true;
}

function isUsablePoi(poi: Poi, requirements: Requirements, warnings: string[], debugReasons: string[]): boolean {
  if (!isRealNavigablePoi(poi) || !isExecutablePoi(poi)) {
    debugReasons.push(`composer_filter_not_real:${poi.id}:${poi.name}`);
    return false;
  }
  if (!matchesRequestedDistrict(poi, requirements)) {
    debugReasons.push(`composer_filter_district_mismatch:${poi.id}:${poi.name}`);
    return false;
  }
  if (isRejectedPoi(poi, requirements)) {
    warnings.push(`已过滤用户明确排斥的地点：「${poi.name}」。`);
    debugReasons.push(`composer_filter_rejected:${poi.id}:${poi.name}`);
    return false;
  }
  return true;
}

function isUsableAnchor(poi: Poi, requirements: Requirements): boolean {
  return isRealNavigablePoi(poi)
    && isExecutablePoi(poi)
    && matchesRequestedDistrict(poi, requirements)
    && !isLowValueAnchorPoi(poi)
    && !isLowValueChainPoi(poi, requirements)
    && !isRejectedPoi(poi, requirements);
}

function scoreCandidateForSlot(candidate: Poi, selected: RouteStep[], slot: string, input: ComposeRouteInput): number {
  const text = buildPoiText(candidate);
  const category = candidate.categoryKey || getCategoryKey(candidate);
  let score = 45 + (candidate.priorityScore ?? 0) * 0.25 + (candidate.qualityScore ?? 0) * 0.25;
  if (candidate.meituanRating) score += candidate.meituanRating * 2;
  if (candidate.price === 0 || candidate.price <= 50) score += input.requirements.budgetMax <= 150 ? 12 : 4;
  if (input.requirements.district && matchesDistrictText(candidate, input.requirements.district)) score += 10;
  if (candidate.blindBoxThemes?.includes(input.theme)) score += 8;

  score += scoreSlotFit(slot, category, text, candidate, input.template);
  if (slot === "break" && isBookishBreak(candidate) && prefersQuietBookishBreak(input.requirements)) score += 24;
  score -= selected.length > 0 ? Math.min(24, estimateTravelMinutesBetweenPois(selected.at(-1)!.poi, candidate) * 0.35) : 0;
  if (selected.length === 0) score -= Math.min(20, estimateTravelMinutesFromCurrentLocation(candidate, input.requirements.currentLocation) * 0.25);
  if (isLowValueChainPoi(candidate, input.requirements)) score -= isCoreSlot(slot) ? 80 : 20;
  if (isLowValueAnchorPoi(candidate) && isCoreSlot(slot)) score -= 100;
  return score;
}

function scoreSlotFit(slot: string, category: string, text: string, candidate: Poi, template: RouteTemplate): number {
  const subKey = getExperienceSubKey(candidate);
  if (slot === "anchor") return ["culture", "outdoor", "photo", "entertainment"].includes(category) ? 35 : -20;
  if (slot === "break") {
    // Sub-key differentiation for food/drink: coffee > tea > bakery > dessert > casual
    if (category === "drink" || /咖啡|下午茶|甜品|茶饮|面包|休息/i.test(text)) {
      if (subKey === "coffee") return 46;
      if (subKey === "tea") return 44;
      if (subKey === "bakery") return 42;
      if (subKey === "dessert") return 40;
      return 42;
    }
    if (isBookishBreak(candidate)) return 46;
    return -10;
  }
  if (slot === "meal") {
    // Sub-key: proper meal > local food > fast food
    if (subKey === "meal") return 44;
    if (category === "local_food") return 38;
    if (subKey === "fast_food") return 30;
    if (subKey === "casual_eat") return 26;
    return category === "meal" || /正餐|小吃|饭|餐|美食|茶餐厅|夜市|美食街/i.test(text) ? 40 : -14;
  }
  if (slot === "local_food") return /本地|老字号|小吃|夜市|市集|美食街|茶餐厅|客家|潮汕/i.test(text) ? 45 : category === "meal" ? 18 : -16;
  if (slot === "free_space") return candidate.price === 0 || /免费|公园|绿道|街区|古镇|图书馆|博物馆|美术馆|文化馆/i.test(text) ? 42 : -18;
  if (slot === "indoor_activity") return candidate.limits.includes("室内") || candidate.limits.includes("雨天可去") || /室内|书店|书吧|美术馆|博物馆|展览|桌游|手作|密室|剧本杀|影院|DIY|棋牌|台球|健身|电竞|网吧|儿童乐园|游泳馆/i.test(text) ? 42 : -22;
  if (slot === "interactive") return category === "entertainment" || /互动|桌游|KTV|密室|剧本杀|棋牌|台球|运动|健身|电竞|DIY|手作|团建|酒吧|露营|采摘|轰趴|市集|夜市|聚会|聊天|体验|足浴|按摩|洗浴|汗蒸|网吧|私人影院|游泳|羽毛球|儿童乐园/i.test(text) ? 38 : -8;
  if (slot === "atmosphere") return /氛围|夜景|约会|艺术|书店|书吧|公园|海滨|街区|古镇|拍照|酒吧|私人影院|展览|茶馆|手工|DIY/i.test(text) ? 38 : -8;
  if (slot === "family_activity") return /亲子|儿童|自然教育|公园|博物馆|图书馆|少走路|雨天可去/i.test(text) ? 40 : -10;
  if (slot === "ending") return ["outdoor", "photo", "culture", "entertainment"].includes(category) || /散步|公园|绿道|海滨|街区|书店|书吧|美术馆|艺术馆|夜景/i.test(text) ? 32 : -4;
  if (slot === "support") {
    if (template.id === "low_budget" && /本地|市集|小吃|免费|公园|文化|街区|古镇/i.test(text)) return 34;
    if (["photo_afternoon_tea", "date"].includes(template.id)) {
      if (["culture", "photo"].includes(category)) return 82;
      if (category === "entertainment") return 26;
      if (category === "meal") return -18;
      if (category === "outdoor") return 4;
    }
    // Support: prefer diverse non-meal categories to improve 4-stop structural quality
    if (["culture", "outdoor", "photo"].includes(category)) return 30;
    if (category === "entertainment") return 24;
    if (category === "meal") return 12;
    if (category === "local_food") return 16;
    return 0;
  }
  return 0;
}

function isRoleCompatibleForSlot(candidate: Poi, slot: string): boolean {
  const category = candidate.categoryKey || getCategoryKey(candidate);
  const text = buildPoiText(candidate);
  if (slot === "anchor") return ["culture", "outdoor", "photo", "entertainment"].includes(category);
  if (slot === "break") return category === "drink" || /咖啡|下午茶|甜品|茶饮|面包|休息/i.test(text) || isBookishBreak(candidate);
  if (slot === "meal" || slot === "local_food") return ["meal", "local_food"].includes(category) || /正餐|小吃|饭|餐|美食|茶餐厅|夜市|美食街/i.test(text);
  if (slot === "free_space") return ["local_food"].includes(category) || candidate.price === 0 || /免费|公园|绿道|街区|古镇|图书馆|博物馆|美术馆|文化馆/i.test(text);
  if (slot === "indoor_activity") return ["culture", "entertainment"].includes(category) && (candidate.limits.includes("室内") || candidate.limits.includes("雨天可去") || /室内|书店|书吧|美术馆|博物馆|展览|桌游|手作|密室|剧本杀|影院|DIY|棋牌|台球|健身|电竞|网吧|儿童乐园|游泳馆/i.test(text));
  if (slot === "interactive") return category === "entertainment" || /互动|桌游|KTV|密室|剧本杀|棋牌|台球|运动|健身|电竞|DIY|手作|团建|酒吧|露营|采摘|轰趴|市集|夜市|聚会|聊天|体验|足浴|按摩|洗浴|汗蒸|网吧|私人影院|游泳|羽毛球|儿童乐园/i.test(text);
  if (slot === "atmosphere") return ["culture", "outdoor", "photo", "drink"].includes(category) || /氛围|夜景|约会|艺术|书店|书吧|公园|海滨|街区|古镇|拍照|酒吧|私人影院|展览|茶馆|手工|DIY/i.test(text);
  if (slot === "family_activity") return ["culture", "outdoor", "entertainment"].includes(category) && /亲子|儿童|自然教育|公园|博物馆|图书馆|少走路|雨天可去/i.test(text);
  if (slot === "ending") return ["outdoor", "photo", "culture", "entertainment"].includes(category) || /散步|公园|绿道|海滨|街区|书店|书吧|美术馆|艺术馆/i.test(text);
  if (slot === "support") return ["culture", "outdoor", "photo", "entertainment", "meal", "local_food"].includes(category);
  return true;
}

function addStep(selected: RouteStep[], poi: Poi, templateRole: string, roleReason?: string): void {
  selected.push({
    order: selected.length + 1,
    role: inferRouteRole(poi, templateRole),
    poi,
    note: poi.reason,
    templateRole,
    isAnchor: templateRole === "anchor",
    roleReason,
  });
}

function buildPreview(selected: RouteStep[], candidate: Poi, slot: string): RouteStep[] {
  return [
    ...selected,
    {
      order: selected.length + 1,
      role: inferRouteRole(candidate, slot),
      poi: candidate,
      note: candidate.reason,
      templateRole: slot,
    },
  ];
}

function inferRouteRole(poi: Poi, templateRole: string): RouteStep["role"] {
  if (templateRole === "meal" || templateRole === "local_food" || poi.type === "餐饮正餐") return "meal";
  if (templateRole === "break" || poi.type === "轻食甜饮") return "break";
  if (templateRole === "ending") return "ending";
  return "activity";
}

function buildRoleReason(poi: Poi, slot: string, template: RouteTemplate): string {
  const roleName = roleLabel(slot);
  return `「${poi.name}」匹配「${template.name}」中的${roleName}节点。`;
}

function roleLabel(slot: string): string {
  const labels: Record<string, string> = {
    anchor: "主锚点",
    break: "休息/下午茶",
    meal: "正餐",
    support: "补充体验",
    ending: "轻松收尾",
    local_food: "本地吃食",
    free_space: "免费/低价空间",
    indoor_activity: "室内活动",
    interactive: "朋友互动",
    atmosphere: "氛围体验",
    family_activity: "亲子活动",
  };
  return labels[slot] ?? slot;
}

function isCoreSlot(slot: string): boolean {
  return slot === "anchor" || slot === "support" || slot === "indoor_activity" || slot === "interactive" || slot === "atmosphere" || slot === "family_activity";
}

function hasDuplicateVenue(selected: RouteStep[], candidate: Poi): boolean {
  const candidateKey = candidate.venueKey || getVenueKey(candidate.name, candidate.area || candidate.businessDistrict);
  if (candidateKey.length < 3) return false;
  // 精确 venueKey 匹配
  if (selected.some((step) => {
    const key = step.poi.venueKey || getVenueKey(step.poi.name, step.poi.area || step.poi.businessDistrict);
    return key.length >= 3 && candidateKey === key;
  })) return true;
  // 广度 venue 前缀匹配：同一个地标综合体内的不同点位只取一次
  const candidateVenue = getVenueComplexKey(candidate.name);
  if (candidateVenue) {
    return selected.some((step) => getVenueComplexKey(step.poi.name) === candidateVenue);
  }
  return false;
}

function hasDuplicateLowValueBrand(selected: RouteStep[], candidate: Poi): boolean {
  const brand = getBrandKey(buildPoiText(candidate));
  if (!brand) return false;
  return selected.some((step) => getBrandKey(buildPoiText(step.poi))?.toLowerCase() === brand.toLowerCase());
}

function wouldRepeatCategoryConsecutively(selected: RouteStep[], candidate: Poi): boolean {
  const previous = selected.at(-1)?.poi;
  if (!previous) return false;
  return (previous.categoryKey || getCategoryKey(previous)) === (candidate.categoryKey || getCategoryKey(candidate));
}

function exceedsTemplateCategoryLimit(
  selected: RouteStep[],
  candidate: Poi,
  slot: string,
  template: RouteTemplate
): boolean {
  const category = candidate.categoryKey || getCategoryKey(candidate);
  const existingCategoryCount = selected.filter((step) => (step.poi.categoryKey || getCategoryKey(step.poi)) === category).length;
  const existingBreakCount = selected.filter((step) => step.templateRole === "break").length;
  if (slot === "break" && existingBreakCount >= 1) return true;
  if (["photo_afternoon_tea", "date"].includes(template.id) && isDrinkLike(candidate) && selected.some((step) => isDrinkLike(step.poi))) return true;
  if (["photo_afternoon_tea", "date"].includes(template.id) && isFoodOrDrinkLike(candidate)) {
    const existingFoodDrinkCount = selected.filter((step) => isFoodOrDrinkLike(step.poi)).length;
    if (existingFoodDrinkCount >= 2) return true;
  }
  if (template.id === "photo_afternoon_tea" && (slot === "ending" || slot === "support") && category === "meal" && existingCategoryCount >= 1) return true;
  return false;
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

function isBookishBreak(poi: Poi): boolean {
  return /书店|书吧|书房|图书|阅读/i.test(buildPoiText(poi));
}

function prefersQuietBookishBreak(requirements: Requirements): boolean {
  return /书店|书吧|书房|图书|阅读|安静|轻松|聊天/i.test([
    requirements.rawText,
    ...requirements.preferences,
    ...requirements.constraints,
  ].filter(Boolean).join(" "));
}

function canConnectToSelected(selected: RouteStep[], candidate: Poi, requirements: Requirements): boolean {
  if (selected.length === 0) {
    const firstLeg = estimateTravelMinutesFromCurrentLocation(candidate, requirements.currentLocation);
    return firstLeg === 0 || firstLeg <= 60;
  }
  const previous = selected.at(-1)?.poi;
  return !previous || estimateTravelMinutesBetweenPois(previous, candidate) <= 60;
}

function matchesRequestedDistrict(poi: Poi, requirements: Requirements): boolean {
  if (!requirements.district || requirements.allowCrossDistrict) return true;
  return matchesDistrictText(poi, requirements.district);
}

function isRejectedPoi(poi: Poi, requirements: Requirements): boolean {
  const text = buildPoiText(poi);
  const brand = getBrandKey(text);
  if (brand && isExplicitlyRejectedBrand(brand, requirements)) return true;
  return getExplicitlyRejectedTypes(requirements).some((type) =>
    poi.type.includes(type)
    || poi.subType.includes(type)
    || (poi.categoryKey || getCategoryKey(poi)).includes(type)
    || text.includes(type)
  );
}

function normalizeKeyList(values?: string[]): string[] {
  return (values ?? []).map((value) => value.toLowerCase());
}

function getExplicitlyRejectedTypes(requirements: Requirements): string[] {
  const text = [
    requirements.rawText,
    ...requirements.constraints,
    ...(requirements.userProfile?.rejectedKeywords ?? []),
    ...(requirements.userProfile?.dislikedPoiTypes ?? []),
  ].filter(Boolean).join(" ");
  const knownTypes = ["餐饮正餐", "轻食甜饮", "文化体验", "户外散步", "拍照地标", "休闲娱乐", "咖啡", "奶茶", "甜品", "火锅", "商场", "桌游", "密室", "公园"];
  return knownTypes.filter((type) =>
    new RegExp(`(不要|不想去|不去|别去|避开|少推荐|拒绝).{0,12}${type}`, "i").test(text)
  );
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

function matchesDistrictText(poi: Poi, district: string): boolean {
  const normalized = district.replace(/区$/, "");
  return [poi.area, poi.businessDistrict, poi.routeCluster, poi.address]
    .filter(Boolean)
    .some((value) => String(value).includes(normalized));
}

function uniqueMessages(messages: string[]): string[] {
  return [...new Set(messages.filter((message) => message.trim().length > 0))];
}
