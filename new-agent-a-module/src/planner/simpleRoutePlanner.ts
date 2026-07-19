import type { PlanBChange, PlanBResult, Poi, Requirements, ReplanEvent, Route, RouteStep } from "../agent/types.ts";
import {
  estimateRouteMinutes,
  estimateTravelMinutesBetweenPois,
  estimateTravelMinutesFromCurrentLocation,
  estimateTravelMinutesFromRequestedDistrict,
  getDurationWindow,
  isPoiNearRequestedDistrict,
  stretchStepsToDuration,
} from "./routeQualityRules.ts";
import { normalizePoiForRecommendation } from "./poiNormalizer.ts";
import { isExecutablePoi } from "./poiNormalizer.ts";
import { evaluateRouteQuality, type RouteQualityIssue } from "./routeQualityCheck.ts";
import { selectRouteTemplate, getMinimumStopCount, getTargetStopCount, type RouteTemplate } from "./routeTemplates.ts";
import { selectAnchor, type AnchorSelection } from "./anchorSelector.ts";
import { composeRouteFromTemplate, type RouteDraft } from "./routeComposer.ts";

interface RouteAttemptResult {
  route: Route;
  draft: RouteDraft;
  issues: RouteQualityIssue[];
  fatalCount: number;
  warningCount: number;
  qualityScore: number;
}

interface RouteRepairPlan {
  excludedPoiIds: string[];
  excludedVenueKeys: string[];
  excludedBrandKeys: string[];
  forbiddenCategories: string[];
  preferredRoles: string[];
  forceReselectAnchor: boolean;
  debugReasons: string[];
}

interface RouteRecommendationContext {
  template?: RouteTemplate;
  anchorSelection?: AnchorSelection | null;
  draft?: RouteDraft;
  route?: Route;
  qualityIssues?: RouteQualityIssue[];
  warnings?: string[];
  debugReasons?: string[];
  usedFallback?: boolean;
}

export function buildRoute(requirements: Requirements, pois: Poi[], theme: string): Route {
  const normalizedPois = pois.map((poi) => normalizePoiForRecommendation(poi, requirements));
  const routeTemplate = selectRouteTemplate(requirements, theme);
  const filteredCandidates = filterPois(requirements, normalizedPois, theme);
  const districtCandidates = requirements.district
    ? filteredCandidates.filter((poi) => matchesDistrict(poi, requirements.district!))
    : [];
  const viableCandidates = ensureViableCandidates(requirements, normalizedPois, filteredCandidates, theme);
  const allCandidates = selectGeographicCandidates(viableCandidates, districtCandidates, requirements);
  const explicitActivityTypes = getExplicitActivityTypes(requirements);
  const routeCluster = selectRouteCluster(allCandidates, requirements, theme, explicitActivityTypes);
  const clusteredCandidates = routeCluster
    ? selectClusterAndNearbyCandidates(allCandidates, routeCluster)
    : allCandidates;
  const candidatesBeforeHardFilters = clusteredCandidates.length >= 2 ? clusteredCandidates : allCandidates;
  const candidates = applyHardRouteCandidateFilters(candidatesBeforeHardFilters, requirements);
  const anchorSelection = selectAnchor(candidates, routeTemplate, requirements);
  const minStepCount = getMinimumStopCount(requirements, routeTemplate);
  const targetStepCount = getTargetStopCount(requirements, routeTemplate);
  const composedAttempt = buildComposedRouteWithQualityRetries(
    candidates,
    requirements,
    theme,
    routeTemplate,
    anchorSelection,
    explicitActivityTypes
  );

  if (
    composedAttempt
    && composedAttempt.route.steps.length >= Math.min(targetStepCount, minStepCount + 1)
    && composedAttempt.fatalCount === 0
    && !hasTooManySameCategoryIssue(composedAttempt.issues)
  ) {
    return composedAttempt.route;
  }

  // Fallback / legacy path
  const steps: RouteStep[] = [];
  const durationWindow = getDurationWindow(requirements);
  const maxMinutes = durationWindow.max;
  const routePattern = buildRoutePattern(requirements, theme, explicitActivityTypes);
  addStepIfFits(steps, anchorSelection?.poi, maxMinutes, requirements);

  const firstActivity = pickFirst(
    candidates,
    routePattern.activity,
    steps
  );
  addStepIfFits(steps, firstActivity, maxMinutes, requirements);

  const breakStop = pickFirst(candidates, routePattern.breakStop, steps);
  addStepIfFits(steps, breakStop, maxMinutes, requirements);

  const meal = routePattern.includeMeal ? pickFirst(candidates, ["餐饮正餐"], steps) : undefined;
  addStepIfFits(steps, meal, maxMinutes, requirements);

  const ending = pickFirst(candidates, routePattern.ending, steps);
  addStepIfFits(steps, ending, maxMinutes, requirements);

  for (const candidate of candidates) {
    if (steps.length >= 5) break;
    if (usedIds(steps).includes(candidate.id)) continue;
    if (hasSimilarExperience(steps.map((step) => step.poi), candidate)) continue;
    addStepIfFits(steps, candidate, maxMinutes, requirements);
  }

  const selected = steps.length >= minStepCount
    ? steps.map((step) => step.poi)
    : selectBestFallbackCandidates(candidates, minStepCount, durationWindow, requirements);

  for (const candidate of candidates) {
    if (selected.length >= minStepCount) break;
    if (selected.some((poi) => poi.id === candidate.id)) continue;
    if (hasSimilarExperience(selected, candidate)) continue;
    if (!canConnectPois(selected, candidate, requirements)) continue;
    selected.push(candidate);
  }

  for (const candidate of candidates) {
    if (selected.length >= 5) break;
    if (selected.some((poi) => poi.id === candidate.id)) continue;
    if (hasSimilarExperience(selected, candidate)) continue;
    if (!canConnectPois(selected, candidate, requirements)) continue;
    const previewSteps = selected.map((poi, index) => ({
      order: index + 1,
      role: inferRole(poi, index),
      poi,
      note: poi.reason
    }));
    previewSteps.push({
      order: previewSteps.length + 1,
      role: inferRole(candidate, previewSteps.length),
      poi: candidate,
      note: candidate.reason
    });
    if (estimateRouteMinutes(previewSteps) <= maxMinutes) selected.push(candidate);
    if (selected.length >= targetStepCount && estimateRouteMinutes(previewSteps) >= durationWindow.min) break;
  }

  fillRouteIfTooShort(selected, candidates, minStepCount, requirements);
  fillRouteTowardTarget(selected, candidates, targetStepCount, durationWindow.max, requirements);
  const finalSelected = improveRouteDiversity(selected, candidates, minStepCount, requirements);

  steps.length = 0;
  finalSelected.forEach((poi, index) => {
    steps.push({
      order: index + 1,
      role: inferRole(poi, index),
      poi,
      note: poi.reason
    });
  });

  const route = decorateRouteTemplateAndAnchor(
    summarizeRoute(stretchStepsToDuration(steps, requirements), explicitActivityTypes, requirements),
    routeTemplate,
    anchorSelection
  );
  const quality = evaluateRouteQuality(route, requirements, routeTemplate);
  const mergedWarnings = mergeMessages(quality.warnings);
  const mergedDebugReasons = mergeMessages([
    ...(composedAttempt?.route.debugReasons ?? []),
    "composer_fallback_to_legacy",
    ...quality.debugReasons,
  ]);
  const recommendationReasons = buildRouteRecommendationReasons(route, requirements, {
    template: routeTemplate,
    anchorSelection,
    qualityIssues: quality.issues,
    warnings: mergedWarnings,
    debugReasons: mergedDebugReasons,
    usedFallback: true,
  });
  return {
    ...route,
    recommendationReasons,
    qualityScore: quality.score,
    warnings: mergedWarnings,
    debugReasons: mergedDebugReasons,
    qualityIssues: quality.issues,
  };
}

function buildComposedRouteWithQualityRetries(
  candidates: Poi[],
  requirements: Requirements,
  theme: string,
  template: RouteTemplate,
  initialAnchor: AnchorSelection | null,
  explicitActivityTypes: string[]
): RouteAttemptResult | null {
  const attempts: RouteAttemptResult[] = [];
  let repairPlan: RouteRepairPlan = emptyRepairPlan();
  let anchorSelection = initialAnchor;

  for (let attemptIndex = 0; attemptIndex <= 2; attemptIndex += 1) {
    const filteredCandidates = applyRepairPlanToCandidates(candidates, repairPlan);
    if (filteredCandidates.length === 0) break;
    if (repairPlan.forceReselectAnchor) {
      anchorSelection = selectAnchor(filteredCandidates, template, requirements);
    }

    const draft = composeRouteFromTemplate({
      candidates: filteredCandidates,
      requirements,
      theme,
      template,
      anchor: anchorSelection,
      excludedPoiIds: repairPlan.excludedPoiIds,
      excludedVenueKeys: repairPlan.excludedVenueKeys,
      excludedBrandKeys: repairPlan.excludedBrandKeys,
      forbiddenCategories: repairPlan.forbiddenCategories,
      preferredRoles: repairPlan.preferredRoles,
    });

    const enhancedDraft: RouteDraft = {
      ...draft,
      debugReasons: mergeMessages([
        ...draft.debugReasons,
        `quality_retry_attempt:${attemptIndex}`,
        ...repairPlan.debugReasons,
      ]),
    };
    const evaluated = finalizeRouteDraft(enhancedDraft, explicitActivityTypes, requirements);
    attempts.push(evaluated);

    if (!shouldRetryForQualityIssues(evaluated.issues, attemptIndex)) {
      break;
    }

    const nextPlan = deriveRepairPlanFromIssues(evaluated.issues, evaluated.route);
    if (!hasRepairActions(nextPlan)) {
      break;
    }

    repairPlan = mergeRepairPlans(repairPlan, nextPlan);
  }

  if (attempts.length === 0) return null;
  return selectBestRouteAttempt(attempts);
}

function finalizeRouteDraft(
  draft: RouteDraft,
  explicitActivityTypes: string[],
  requirements: Requirements
): RouteAttemptResult {
  const preferredFirstTypes = [
    draft.anchor?.poi.type,
    ...explicitActivityTypes,
  ].filter((type): type is string => Boolean(type));
  const route = decorateRouteTemplateAndAnchor(
    summarizeRoute(stretchStepsToDuration(draft.steps, requirements), preferredFirstTypes, requirements),
    draft.template,
    draft.anchor
  );
  const quality = evaluateRouteQuality(route, requirements, draft.template);
  const mergedWarnings = mergeMessages([...draft.warnings, ...quality.warnings]);
  const mergedDebugReasons = mergeMessages([...draft.debugReasons, ...quality.debugReasons]);
  const recommendationReasons = buildRouteRecommendationReasons(route, requirements, {
    template: draft.template,
    anchorSelection: draft.anchor,
    draft,
    qualityIssues: quality.issues,
    warnings: mergedWarnings,
    debugReasons: mergedDebugReasons,
  });
  return {
    route: {
      ...route,
      recommendationReasons,
      qualityScore: quality.score,
      warnings: mergedWarnings,
      debugReasons: mergedDebugReasons,
      qualityIssues: quality.issues,
    },
    draft,
    issues: quality.issues,
    fatalCount: quality.fatalReasons.length,
    warningCount: mergedWarnings.length,
    qualityScore: quality.score,
  };
}

function shouldRetryForQualityIssues(issues: RouteQualityIssue[], attemptIndex: number): boolean {
  if (attemptIndex >= 2) return false;
  const repairableIssueCodes = new Set([
    "duplicate_venue",
    "duplicate_brand",
    "not_executable_poi",
    "not_real_navigable_poi",
    "rejected_brand",
    "rejected_type",
    "missing_anchor",
    "low_value_anchor",
    "missing_template_role",
    "template_role_mismatch",
    "too_many_food_drink",
    "too_many_drink",
    "too_many_same_category",
    "low_budget_missing_local_value",
    "cross_district_without_permission",
  ]);
  return issues.some((issue) => repairableIssueCodes.has(issue.code));
}

function deriveRepairPlanFromIssues(issues: RouteQualityIssue[], route: Route): RouteRepairPlan {
  const plan = emptyRepairPlan();
  const anchorPoiId = route.steps.find((step) => step.isAnchor)?.poi.id;

  for (const issue of issues) {
    if (["not_executable_poi", "not_real_navigable_poi", "rejected_brand", "rejected_type", "template_role_mismatch"].includes(issue.code)) {
      plan.excludedPoiIds.push(...(issue.poiIds ?? []));
      plan.debugReasons.push(`quality_repair_applied:${issue.code}`);
    }

    if (issue.code === "cross_district_without_permission") {
      plan.excludedPoiIds.push(...(issue.poiIds ?? []));
      plan.preferredRoles.push("support", "ending");
      plan.debugReasons.push("quality_repair_applied:cross_district_without_permission");
    }

    if (issue.code === "duplicate_venue") {
      plan.excludedPoiIds.push(...(issue.poiIds ?? []).slice(1));
      const venueKey = typeof issue.meta?.venueKey === "string" ? issue.meta.venueKey : undefined;
      if (venueKey) plan.excludedVenueKeys.push(venueKey.toLowerCase());
      plan.debugReasons.push("quality_repair_applied:duplicate_venue");
    }

    if (issue.code === "duplicate_brand") {
      plan.excludedPoiIds.push(...(issue.poiIds ?? []).slice(1));
      const brandKey = typeof issue.meta?.brandKey === "string" ? issue.meta.brandKey : undefined;
      if (brandKey) plan.excludedBrandKeys.push(brandKey.toLowerCase());
      plan.debugReasons.push("quality_repair_applied:duplicate_brand");
    }

    if (issue.code === "low_value_anchor" || issue.code === "missing_anchor") {
      plan.forceReselectAnchor = true;
      if (anchorPoiId) plan.excludedPoiIds.push(anchorPoiId);
      plan.excludedPoiIds.push(...(issue.poiIds ?? []));
      plan.debugReasons.push(`quality_repair_applied:${issue.code}`);
    }

    if (issue.code === "missing_template_role" && issue.role) {
      plan.preferredRoles.push(issue.role);
      if (issue.role === "break") {
        plan.preferredRoles.push("support");
      }
      if (issue.role === "support") {
        plan.preferredRoles.push("ending");
      }
      plan.debugReasons.push(`quality_repair_applied:prefer_role:${issue.role}`);
    }

    if (issue.code === "too_many_drink") {
      plan.forbiddenCategories.push("drink");
      plan.preferredRoles.push("support", "ending");
      plan.debugReasons.push("quality_repair_applied:too_many_drink");
    }

    if (issue.code === "too_many_food_drink") {
      plan.forbiddenCategories.push("drink");
      plan.preferredRoles.push("support", "ending");
      plan.debugReasons.push("quality_repair_applied:too_many_food_drink");
    }

    if (issue.code === "too_many_same_category") {
      const category = typeof issue.meta?.category === "string" ? issue.meta.category : undefined;
      if (category) {
        plan.forbiddenCategories.push(category);
        plan.preferredRoles.push("support", "ending");
        plan.debugReasons.push(`quality_repair_applied:forbid_category:${category}`);
      }
    }

    if (issue.code === "low_budget_missing_local_value") {
      plan.preferredRoles.push("local_food", "free_space", "support");
      plan.debugReasons.push("quality_repair_applied:low_budget_missing_local_value");
    }
  }

  return normalizeRepairPlan(plan);
}

function emptyRepairPlan(): RouteRepairPlan {
  return {
    excludedPoiIds: [],
    excludedVenueKeys: [],
    excludedBrandKeys: [],
    forbiddenCategories: [],
    preferredRoles: [],
    forceReselectAnchor: false,
    debugReasons: [],
  };
}

function normalizeRepairPlan(plan: RouteRepairPlan): RouteRepairPlan {
  return {
    excludedPoiIds: [...new Set(plan.excludedPoiIds.filter(Boolean))],
    excludedVenueKeys: [...new Set(plan.excludedVenueKeys.filter(Boolean).map((value) => value.toLowerCase()))],
    excludedBrandKeys: [...new Set(plan.excludedBrandKeys.filter(Boolean).map((value) => value.toLowerCase()))],
    forbiddenCategories: [...new Set(plan.forbiddenCategories.filter(Boolean))],
    preferredRoles: [...new Set(plan.preferredRoles.filter(Boolean))],
    forceReselectAnchor: plan.forceReselectAnchor,
    debugReasons: [...new Set(plan.debugReasons.filter(Boolean))],
  };
}

function mergeRepairPlans(current: RouteRepairPlan, next: RouteRepairPlan): RouteRepairPlan {
  return normalizeRepairPlan({
    excludedPoiIds: [...current.excludedPoiIds, ...next.excludedPoiIds],
    excludedVenueKeys: [...current.excludedVenueKeys, ...next.excludedVenueKeys],
    excludedBrandKeys: [...current.excludedBrandKeys, ...next.excludedBrandKeys],
    forbiddenCategories: [...current.forbiddenCategories, ...next.forbiddenCategories],
    preferredRoles: [...current.preferredRoles, ...next.preferredRoles],
    forceReselectAnchor: current.forceReselectAnchor || next.forceReselectAnchor,
    debugReasons: [...current.debugReasons, ...next.debugReasons],
  });
}

function hasRepairActions(plan: RouteRepairPlan): boolean {
  return plan.forceReselectAnchor
    || plan.excludedPoiIds.length > 0
    || plan.excludedVenueKeys.length > 0
    || plan.excludedBrandKeys.length > 0
    || plan.forbiddenCategories.length > 0
    || plan.preferredRoles.length > 0;
}

function applyRepairPlanToCandidates(candidates: Poi[], plan: RouteRepairPlan): Poi[] {
  return candidates.filter((poi) => {
    if (plan.excludedPoiIds.includes(poi.id)) return false;
    const venueKey = poi.venueKey?.toLowerCase();
    if (venueKey && plan.excludedVenueKeys.includes(venueKey)) return false;
    const brandKey = poi.brandKey?.toLowerCase();
    if (brandKey && plan.excludedBrandKeys.includes(brandKey)) return false;
    const category = poi.categoryKey;
    if (category && plan.forbiddenCategories.includes(category)) return false;
    return true;
  });
}

function selectBestRouteAttempt(attempts: RouteAttemptResult[]): RouteAttemptResult {
  const best = attempts.slice().sort((left, right) => {
    if (left.fatalCount !== right.fatalCount) return left.fatalCount - right.fatalCount;
    if (left.qualityScore !== right.qualityScore) return right.qualityScore - left.qualityScore;
    if (left.warningCount !== right.warningCount) return left.warningCount - right.warningCount;
    return right.route.steps.length - left.route.steps.length;
  })[0];
  if (best) {
    best.route = {
      ...best.route,
      debugReasons: mergeMessages([
        ...(best.route.debugReasons ?? []),
        `quality_selected_best_attempt:${attempts.findIndex((a) => a === best)}`,
      ]),
    };
  }
  return best;
}

function selectBestFallbackCandidates(
  candidates: Poi[],
  count: number,
  durationWindow: { target: number; min: number; max: number },
  requirements: Requirements
): Poi[] {
  const pool = candidates.slice(0, 12);
  const combos = combinations(pool, Math.min(count, pool.length));
  const ranked = combos
    .filter((combo) => !hasDuplicateExperience(combo))
    .filter((combo) => canConnectCombo(combo, requirements))
    .map((combo) => {
      const steps = combo.map((poi, index) => ({
        order: index + 1,
        role: inferRole(poi, index),
        poi,
        note: poi.reason
      }));
      const total = estimateRouteMinutes(steps);
      const overPenalty = total > durationWindow.max ? (total - durationWindow.max) * 3 : 0;
      const underPenalty = total < durationWindow.min ? (durationWindow.min - total) * 1.4 : 0;
      return {
        combo,
        score: Math.abs(total - durationWindow.target) + overPenalty + underPenalty
      };
    })
    .sort((a, b) => a.score - b.score);
  return ranked[0]?.combo
    ?? pickDiverseFallback(pool.filter((poi) => canConnectCombo([poi], requirements)), count)
    ?? pickDiverseFallback(pool, count);
}

function canConnectCombo(pois: Poi[], requirements: Requirements): boolean {
  if (pois.length === 0) return false;
  if (requirements.district && !requirements.allowCrossDistrict && pois.some((poi) => !matchesDistrict(poi, requirements.district!))) {
    return false;
  }
  const firstLeg = estimateTravelMinutesFromCurrentLocation(pois[0], requirements.currentLocation);
  if (firstLeg > 60) return false;
  for (let index = 1; index < pois.length; index += 1) {
    if (estimateTravelMinutesBetweenPois(pois[index - 1], pois[index]) > 60) return false;
  }
  return true;
}

function canConnectPois(selected: Poi[], candidate: Poi, requirements: Requirements): boolean {
  return canConnectCombo([...selected, candidate], requirements);
}

function combinations<T>(items: T[], count: number): T[][] {
  if (count <= 0) return [[]];
  if (items.length < count) return [];
  if (count === 1) return items.map((item) => [item]);
  return items.flatMap((item, index) =>
    combinations(items.slice(index + 1), count - 1).map((rest) => [item, ...rest])
  );
}

function hasDuplicateExperience(pois: Poi[]): boolean {
  const keys = pois.map(getExperienceKey);
  return new Set(keys).size !== keys.length;
}

function pickDiverseFallback(candidates: Poi[], count: number): Poi[] {
  const selected: Poi[] = [];
  for (const candidate of candidates) {
    if (selected.length >= count) break;
    if (selected.some((poi) => poi.id === candidate.id)) continue;
    if (hasSimilarExperience(selected, candidate)) continue;
    selected.push(candidate);
  }
  for (const candidate of candidates) {
    if (selected.length >= count) break;
    if (selected.some((poi) => poi.id === candidate.id)) continue;
    selected.push(candidate);
  }
  return selected;
}

function selectGeographicCandidates(
  filteredCandidates: Poi[],
  districtCandidates: Poi[],
  requirements: Requirements
): Poi[] {
  if (!requirements.district) return filteredCandidates;
  if (requirements.allowCrossDistrict) {
    const nearby = filteredCandidates.filter((poi) =>
      isPoiNearRequestedDistrict(poi, requirements.district, 18)
      || (Boolean(requirements.currentLocation) && estimateTravelMinutesFromCurrentLocation(poi, requirements.currentLocation) <= 60)
    );
    return nearby.length >= 2 ? nearby : filteredCandidates;
  }
  if (districtCandidates.length >= 2) return districtCandidates;
  const nearby = filteredCandidates.filter((poi) => isPoiNearRequestedDistrict(poi, requirements.district, 12));
  return nearby.length >= 2 ? nearby : filteredCandidates;
}

export function filterPois(requirements: Requirements, pois: Poi[], theme?: string): Poi[] {
  return pois
    .filter((poi) => isExecutablePoi(poi))
    .filter((poi) => !isLowValueChain(buildPoiText(poi), requirements))
    .filter((poi) => poi.price <= requirements.budgetMax)
    .filter((poi) => poi.fitPeople.includes(requirements.peopleType))
    .filter((poi) => {
      if (isFarDistance(poi.distanceLevel) && requirements.distanceLevel !== "10km以上") return false;
      if (!requirements.distanceLevel || !poi.distanceLevel) return true;
      if (isNearOrMediumDistance(requirements.distanceLevel)) return isNearOrMediumDistance(poi.distanceLevel);
      return poi.distanceLevel === requirements.distanceLevel;
    })
    .filter((poi) => {
      if (requirements.constraints.includes("不想排队")) return poi.queueLevel !== "high";
      return true;
    })
    .filter((poi) => {
      if (requirements.constraints.includes("室内优先") || hasIndoorIntent(requirements)) {
        return poi.limits.includes("室内") || poi.limits.includes("雨天可去") || poi.weatherSensitive === false;
      }
      return true;
    })
    .sort((a, b) => scorePoi(b, requirements, theme) - scorePoi(a, requirements, theme));
}

function ensureViableCandidates(requirements: Requirements, pois: Poi[], strictCandidates: Poi[], theme?: string): Poi[] {
  const minViable = getDurationWindow(requirements).target <= 150 ? 2 : 3;
  if (strictCandidates.length >= minViable) return strictCandidates;

  const strictIds = new Set(strictCandidates.map((poi) => poi.id));
  const budgetCeiling = Math.max(requirements.budgetMax + 80, Math.round(requirements.budgetMax * 1.35), 120);
  const relaxed = pois
    .filter((poi) => !strictIds.has(poi.id))
    .filter((poi) => isExecutablePoi(poi))
    .filter((poi) => !isLowValueChain(buildPoiText(poi), requirements))
    .filter((poi) => poi.price <= budgetCeiling)
    .filter((poi) => {
      if (requirements.constraints.includes("不想排队")) return poi.queueLevel !== "high";
      return true;
    })
    .sort((a, b) => scorePoi(b, requirements, theme) - scorePoi(a, requirements, theme));

  return uniquePoiList([...strictCandidates, ...relaxed]);
}

function applyHardRouteCandidateFilters(candidates: Poi[], requirements: Requirements): Poi[] {
  if (!requirements.district || requirements.allowCrossDistrict) return candidates.filter((poi) => isExecutablePoi(poi));
  // 先按区域过滤
  const district = candidates.filter((poi) => matchesDistrict(poi, requirements.district!));
  if (district.length >= 2) return district.filter((poi) => isExecutablePoi(poi));
  // 区域内候选不足时放宽限制，避免"没有合适点位"
  const nearby = candidates.filter((poi) => isPoiNearRequestedDistrict(poi, requirements.district, 18));
  if (nearby.length >= 2) return nearby.filter((poi) => isExecutablePoi(poi));
  // 实在没有候选时返回全部可执行 POI
  return candidates.filter((poi) => isExecutablePoi(poi));
}

function fillRouteIfTooShort(selected: Poi[], candidates: Poi[], minStepCount: number, requirements: Requirements): void {
  if (selected.length >= minStepCount) return;

  for (const candidate of candidates) {
    if (selected.length >= minStepCount) break;
    if (selected.some((poi) => poi.id === candidate.id)) continue;
    if (!canConnectPois(selected, candidate, requirements)) continue;
    selected.push(candidate);
  }

  for (const candidate of candidates) {
    if (selected.length >= minStepCount) break;
    if (selected.some((poi) => poi.id === candidate.id)) continue;
    selected.push(candidate);
  }
}

function fillRouteTowardTarget(
  selected: Poi[],
  candidates: Poi[],
  targetStepCount: number,
  maxMinutes: number,
  requirements: Requirements
): void {
  for (const candidate of candidates) {
    if (selected.length >= targetStepCount) break;
    if (selected.some((poi) => poi.id === candidate.id || hasSimilarVenueName(poi, candidate))) continue;
    if (hasSimilarExperience(selected, candidate)) continue;
    if (!canConnectPois(selected, candidate, requirements)) continue;
    const previewSteps = [...selected, candidate].map((poi, index) => ({
      order: index + 1,
      role: inferRole(poi, index),
      poi,
      note: poi.reason
    }));
    if (estimateRouteMinutes(previewSteps) <= maxMinutes + 35) {
      selected.push(candidate);
    }
  }

  for (const candidate of candidates) {
    if (selected.length >= targetStepCount) break;
    if (selected.some((poi) => poi.id === candidate.id || hasSimilarVenueName(poi, candidate))) continue;
    if (!canConnectPois(selected, candidate, requirements)) continue;
    const previewSteps = [...selected, candidate].map((poi, index) => ({
      order: index + 1,
      role: inferRole(poi, index),
      poi,
      note: poi.reason
    }));
    if (estimateRouteMinutes(previewSteps) <= maxMinutes + 50) {
      selected.push(candidate);
    }
  }
}

function improveRouteDiversity(selected: Poi[], candidates: Poi[], minStepCount: number, requirements: Requirements): Poi[] {
  const result: Poi[] = [];
  for (const poi of selected) {
    if (result.some((item) => item.id === poi.id || hasSimilarVenueName(item, poi) || hasSimilarExperience(result.filter((item) => item.id !== poi.id), poi))) {
      const replacement = candidates.find((candidate) =>
        !result.some((item) => item.id === candidate.id || hasSimilarVenueName(item, candidate))
        && !selected.some((item) => item.id === candidate.id && item.id !== poi.id)
        && !hasSimilarExperience(result, candidate)
        && canConnectPois(result, candidate, requirements)
      );
      if (replacement) {
        result.push(replacement);
        continue;
      }
    }
    result.push(poi);
  }

  for (const candidate of candidates) {
    if (result.length >= minStepCount) break;
    if (result.some((poi) => poi.id === candidate.id || hasSimilarVenueName(poi, candidate))) continue;
    if (hasSimilarExperience(result, candidate)) continue;
    result.push(candidate);
  }

  return result;
}

function uniquePoiList(pois: Poi[]): Poi[] {
  const seen = new Set<string>();
  return pois.filter((poi) => {
    const key = poi.id || poi.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function rerollRoute(requirements: Requirements, previousRoute: Route, pois: Poi[], theme: string): Route {
  const previousIds = new Set(previousRoute.steps.map((step) => step.poi.id));
  const remainingPois = pois.filter((poi) => !previousIds.has(poi.id));
  return buildRoute(requirements, remainingPois.length > 0 ? remainingPois : pois, theme);
}

export function replanRoute(
  event: ReplanEvent,
  currentRoute: Route,
  pois: Poi[],
  requirements: Requirements
): PlanBResult {
  const targetStep = findTargetStep(event, currentRoute);
  const changes: PlanBChange[] = [];

  if (!targetStep) {
    return {
      event,
      impact: "当前路线没有找到需要调整的节点。",
      beforeRoute: currentRoute,
      afterRoute: currentRoute,
      changes,
      keptPreferences: requirements.preferences,
      sacrificed: [],
      message: "当前异常没有影响路线，暂不需要调整。"
    };
  }

  if (event.type === "timeout") {
    const afterSteps = currentRoute.steps.map((step) => {
      if (step.poi.id !== targetStep.poi.id) return step;
      const shortenedPoi = {
        ...step.poi,
        stayMinutes: Math.max(30, step.poi.stayMinutes - (event.delayMinutes ?? 30))
      };
      changes.push({
        action: "shorten",
        from: step.poi.name,
        to: step.poi.name,
        reason: `将停留时间压缩到 ${shortenedPoi.stayMinutes} 分钟，尽量保留原路线。`
      });
      return { ...step, poi: shortenedPoi };
    });
    const afterRoute = summarizeRoute(afterSteps);
    return buildPlanBResult(event, currentRoute, afterRoute, changes, requirements, "上一站停留超时，可能压缩后续行程。");
  }

  if (event.preferredReplacement && !event.customPreference?.trim()) {
    const exactReplacement = resolvePreferredReplacement(event, pois, requirements);
    if (exactReplacement) {
      const reason = event.preferredReplacement.reason || `${exactReplacement.name} 是用户选中的替代节点，已按选择更新路线。`;
      const afterSteps = currentRoute.steps.map((step) => {
        if (step.poi.id !== targetStep.poi.id) return step;
        return {
          ...step,
          poi: exactReplacement,
          note: `${reason}（用户确认替换）`
        };
      });
      const afterRoute = summarizeRoute(afterSteps);
      changes.push({
        action: "replace",
        from: targetStep.poi.name,
        to: exactReplacement.name,
        reason
      });

      return buildPlanBResult(
        event,
        currentRoute,
        afterRoute,
        changes,
        requirements,
        `已按你的选择，将「${targetStep.poi.name}」替换为「${exactReplacement.name}」。`
      );
    }
  }

  const replacement = findReplacement(event, targetStep.poi, pois, requirements, currentRoute);
  if (!replacement) {
    return {
      event,
      impact: `${targetStep.poi.name} 出现异常，但暂未找到合适替代点。`,
      beforeRoute: currentRoute,
      afterRoute: currentRoute,
      changes,
      keptPreferences: requirements.preferences,
      sacrificed: [],
      message: "暂时保留原路线，建议稍后重试或手动重开盲盒。"
    };
  }

  const afterSteps = currentRoute.steps.map((step) => {
    if (step.poi.id !== targetStep.poi.id) return step;
    return {
      ...step,
      poi: replacement,
      note: `${replacement.reason}（Plan B 替换）`
    };
  });
  const afterRoute = summarizeRoute(afterSteps);
  changes.push({
    action: "replace",
    from: targetStep.poi.name,
    to: replacement.name,
    reason: buildReplacementReason(event, replacement)
  });

  return buildPlanBResult(
    event,
    currentRoute,
    afterRoute,
    changes,
    requirements,
    buildImpact(event, targetStep.poi.name)
  );
}

function resolvePreferredReplacement(event: ReplanEvent, pois: Poi[], requirements: Requirements): Poi | null {
  const preferred = event.preferredReplacement;
  if (!preferred?.name) return null;

  const normalizedName = normalizeName(preferred.name);
  const matchedPoi = pois.find((poi) =>
    normalizeName(poi.name) === normalizedName
    || normalizeName(poi.name).includes(normalizedName)
    || normalizedName.includes(normalizeName(poi.name))
  );
  if (matchedPoi) return matchedPoi;

  return {
    id: preferred.id || `manual-${Date.now()}`,
    name: preferred.name,
    type: preferred.type || "休闲娱乐",
    subType: preferred.subType || preferred.type || "用户选择",
    area: preferred.area,
    businessDistrict: preferred.businessDistrict || preferred.area || requirements.city,
    price: preferred.price ?? 0,
    meituanRating: 4.6,
    reviewCount: 1200,
    tags: preferred.tags ?? [],
    limits: [],
    fitPeople: [requirements.peopleType],
    stayMinutes: preferred.stayMinutes ?? 60,
    queueLevel: "low",
    distanceLevel: "medium",
    reason: preferred.reason || `${preferred.name} 是用户确认选择的替代节点。`,
    weatherSensitive: false
  };
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "");
}

function pickFirst(candidates: Poi[], types: string[], existingSteps: RouteStep[] = []): Poi | undefined {
  const existingPois = existingSteps.map((step) => step.poi);
  return candidates.find((poi) =>
    types.includes(poi.type)
    && !existingPois.some((existing) => existing.id === poi.id)
    && !hasSimilarExperience(existingPois, poi)
  );
}

function addStepIfFits(steps: RouteStep[], poi: Poi | undefined, maxMinutes: number, requirements: Requirements): void {
  if (!poi) return;
  if (!canConnectToRoute(steps, poi, requirements)) return;
  const previewSteps = [
    ...steps,
    {
      order: steps.length + 1,
      role: inferRole(poi, steps.length),
      poi,
      note: poi.reason
    }
  ];
  if (estimateRouteMinutes(previewSteps) > maxMinutes && steps.length >= 1) return;

  steps.push({
    order: steps.length + 1,
    role: inferRole(poi, steps.length),
    poi,
    note: poi.reason
  });
}

function usedIds(steps: RouteStep[]): string[] {
  return steps.map((step) => step.poi.id);
}

function hasSimilarExperience(existingPois: Poi[], candidate: Poi): boolean {
  const candidateKey = getExperienceKey(candidate);
  return existingPois.some((poi) => getExperienceKey(poi) === candidateKey);
}

function hasSimilarVenueName(a: Poi, b: Poi): boolean {
  const left = getVenueNameKey(a.name);
  const right = getVenueNameKey(b.name);
  return left.length >= 3 && right.length >= 3 && (left.includes(right) || right.includes(left));
}

function getVenueNameKey(name: string): string {
  return name
    .replace(/[（(].*?[）)]/g, "")
    .replace(/旗舰店|总店|分店|东区|西区|南区|北区|一期|二期|三期|店|馆|体验|沉浸式|沉浸|实景|剧场|RPG|密室|咖啡|餐厅|书店|中心|购物|公园/gi, "")
    .replace(/[·\s\-_/]/g, "")
    .trim()
    .toLowerCase();
}

function getExperienceKey(poi: Poi): string {
  const text = `${poi.name} ${poi.type} ${poi.subType} ${poi.tags.join(" ")} ${poi.reason}`;
  const brand = getLowValueChainBrand(text);
  if (brand) return `连锁品牌:${brand}`;
  if (/DIY|diy|手作|手工|陶艺|银饰|香薰|烘焙|画画|绘画|手办|Tufting/i.test(text)) return "DIY手作";
  if (poi.type === "轻食甜饮") return "轻食甜饮";
  if (poi.type === "餐饮正餐") return "餐饮正餐";
  if (poi.type === "文化体验") return "文化看展";
  if (poi.type === "户外散步") return "户外散步";
  if (poi.type === "休闲娱乐") return "室内娱乐";
  if (poi.type === "拍照地标") return "拍照地标";
  if (/咖啡|奶茶|甜品|茶|饮品|面包|下午茶/.test(text)) return "轻食甜饮";
  if (/餐|饭|火锅|烧烤|小吃|bistro|酒馆|清吧|简餐/.test(text)) return "餐饮正餐";
  if (/展|美术馆|博物馆|书店|文化|艺术空间/.test(text)) return "文化看展";
  if (/公园|栈道|海滨|沙滩|绿道|散步|徒步|citywalk/i.test(text)) return "户外散步";
  if (/商场|购物中心|密室|桌游|KTV|电影|影院|电玩城|乐园/.test(text)) return "室内娱乐";
  if (/拍照|打卡|地标|夜景|广场/.test(text)) return "拍照地标";
  return poi.type;
}

function isLowValueChain(text: string, requirements: Requirements): boolean {
  const brand = getLowValueChainBrand(text);
  if (!brand) return false;
  const explicitText = `${requirements.rawText} ${requirements.preferences.join(" ")} ${requirements.constraints.join(" ")}`;
  if (new RegExp(`(不要|不想去|不去|别去|避开|少推荐).{0,12}${brand}`, "i").test(explicitText)) return true;
  return !explicitText.includes(brand);
}

function getLowValueChainBrand(text: string): string | undefined {
  const brands = ["瑞幸", "luckin", "星巴克", "starbucks", "麦当劳", "肯德基", "KFC", "必胜客", "汉堡王", "蜜雪冰城", "益禾堂", "古茗", "一点点", "茶百道", "奈雪", "喜茶", "霸王茶姬", "CoCo", "沪上阿姨", "绝味鸭脖", "正新鸡排", "华莱士"];
  return brands.find((brand) => new RegExp(brand, "i").test(text));
}

function inferRole(poi: Poi, index: number): RouteStep["role"] {
  if (poi.type === "餐饮正餐") return "meal";
  if (poi.type === "轻食甜饮") return "break";
  if (index >= 3) return "ending";
  return "activity";
}

function summarizeRoute(
  steps: RouteStep[],
  preferredFirstTypes: string[] = [],
  requirements?: Requirements,
  context?: RouteRecommendationContext
): Route {
  const orderedSteps = orderStepsSpatially(steps, preferredFirstTypes, requirements);

  const route: Route = {
    totalMinutes: estimateRouteMinutes(orderedSteps),
    totalBudget: orderedSteps.reduce((sum, step) => sum + step.poi.price, 0),
    steps: orderedSteps.map((step, index) => ({
      ...step,
      order: index + 1,
      role: inferRole(step.poi, index)
    })),
    recommendationReasons: [],
    personalizationSummary: buildPersonalizationSummary(orderedSteps, requirements)
  };

  route.recommendationReasons = buildRouteRecommendationReasons(route, requirements, context);
  return route;
}

function decorateRouteTemplateAndAnchor(
  route: Route,
  template: RouteTemplate,
  anchorSelection: AnchorSelection | null
): Route {
  const usedRoles = new Set<string>();
  return {
    ...route,
    templateId: template.id,
    templateName: template.name,
    steps: route.steps.map((step, index) => {
      if (anchorSelection && step.poi.id === anchorSelection.poi.id) {
        usedRoles.add("anchor");
        return {
          ...step,
          isAnchor: true,
          templateRole: "anchor",
          roleReason: anchorSelection.reason,
        };
      }
      const templateRole = step.templateRole ?? inferTemplateRoleForLegacyStep(step, index, template, usedRoles);
      usedRoles.add(templateRole);
      return {
        ...step,
        templateRole,
        roleReason: step.roleReason ?? buildLegacyRoleReason(step.poi, templateRole, template),
      };
    }),
  };
}

function inferTemplateRoleForLegacyStep(
  step: RouteStep,
  index: number,
  template: RouteTemplate,
  usedRoles: Set<string>
): string {
  const text = buildPoiText(step.poi);
  const category = getExperienceKey(step.poi);
  const preferred = template.targetRoles.find((role) => role !== "anchor" && !usedRoles.has(role));
  if (step.poi.type === "餐饮正餐" || /餐|饭|小吃|美食|夜市|茶餐厅/.test(text)) {
    if (template.targetRoles.includes("local_food") && !usedRoles.has("local_food")) return "local_food";
    if (template.targetRoles.includes("meal") && !usedRoles.has("meal")) return "meal";
  }
  if (step.poi.type === "轻食甜饮" || /咖啡|甜品|下午茶|茶饮/.test(text)) {
    if (template.targetRoles.includes("break") && !usedRoles.has("break")) return "break";
  }
  if (/户外|散步|公园|绿道|海滨|街区/.test(category + text)) {
    if (template.targetRoles.includes("ending") && !usedRoles.has("ending") && index >= 2) return "ending";
    if (template.targetRoles.includes("free_space") && !usedRoles.has("free_space")) return "free_space";
  }
  if (/文化|展|美术馆|博物馆|书店|艺术/.test(category + text)) {
    if (template.targetRoles.includes("indoor_activity") && !usedRoles.has("indoor_activity")) return "indoor_activity";
    if (template.targetRoles.includes("support") && !usedRoles.has("support")) return "support";
  }
  return preferred ?? (index >= 3 ? "ending" : "support");
}

function buildLegacyRoleReason(poi: Poi, role: string, template: RouteTemplate): string {
  return `「${poi.name}」适合放在「${template.name}」里的${labelTemplateRole(role)}位置。`;
}

function mergeMessages(messages: string[]): string[] {
  return [...new Set(messages.filter((message) => message.trim().length > 0))];
}

function getExplicitActivityTypes(requirements: Requirements): string[] {
  const text = [
    requirements.rawText,
    ...requirements.preferences,
    ...requirements.constraints
  ].join(" ");
  const types: string[] = [];

  if (/室内.*(娱乐|玩|活动)|娱乐.*室内|电玩城|桌游|密室|KTV|电影|游戏|剧本/.test(text)) {
    types.push("休闲娱乐");
  }
  if (/diy|DIY|手工|手作|陶艺|银饰|香薰|烘焙|画画|绘画/.test(text)) {
    types.push("文化体验", "休闲娱乐");
  }
  if (/展|美术馆|博物馆|艺术|文化|书店/.test(text)) {
    types.push("文化体验");
  }
  if (/拍照|打卡|出片|地标|夜景/.test(text)) {
    types.push("拍照地标", "文化体验");
  }
  if (/公园|散步|户外|徒步|citywalk/i.test(text)) {
    types.push("户外散步");
  }

  return [...new Set(types)];
}

function buildRoutePattern(requirements: Requirements, theme: string, explicitActivityTypes: string[]) {
  const activity = explicitActivityTypes.length > 0
    ? explicitActivityTypes
    : ["拍照地标", "文化体验", "休闲娱乐", "户外散步"];
  const base = {
    activity,
    breakStop: ["轻食甜饮"],
    ending: ["户外散步", "拍照地标", "文化体验", "休闲娱乐"],
    includeMeal: true
  };

  if (requirements.peopleType === "亲子" || theme === "亲子轻松放电盒") {
    return {
      activity: explicitActivityTypes.length > 0 ? explicitActivityTypes : ["休闲娱乐", "户外散步", "文化体验"],
      breakStop: ["轻食甜饮", "餐饮正餐"],
      ending: ["户外散步", "休闲娱乐", "轻食甜饮"],
      includeMeal: true
    };
  }

  if (theme === "雨天室内回血盒" || hasIndoorIntent(requirements)) {
    return {
      activity: explicitActivityTypes.length > 0 ? explicitActivityTypes : ["休闲娱乐", "文化体验", "拍照地标"],
      breakStop: ["轻食甜饮", "餐饮正餐"],
      ending: ["文化体验", "休闲娱乐", "轻食甜饮"],
      includeMeal: true
    };
  }

  if (requirements.peopleType === "单人" || theme === "城市散步疗愈盒") {
    return {
      activity: explicitActivityTypes.length > 0 ? explicitActivityTypes : ["户外散步", "文化体验", "拍照地标"],
      breakStop: ["轻食甜饮", "文化体验"],
      ending: ["户外散步", "文化体验", "轻食甜饮", "拍照地标"],
      includeMeal: requirements.budgetMax > 150
    };
  }

  if (theme === "小众拍照吃货盒") {
    return {
      activity: explicitActivityTypes.length > 0 ? explicitActivityTypes : ["拍照地标", "文化体验", "户外散步"],
      breakStop: ["轻食甜饮"],
      ending: ["餐饮正餐", "拍照地标", "文化体验"],
      includeMeal: true
    };
  }

  if (theme === "夜景微醺盒") {
    return {
      activity: explicitActivityTypes.length > 0 ? explicitActivityTypes : ["拍照地标", "文化体验", "休闲娱乐"],
      breakStop: ["餐饮正餐", "轻食甜饮"],
      ending: ["拍照地标", "户外散步", "休闲娱乐"],
      includeMeal: true
    };
  }

  if (theme === "省钱快乐盒" || requirements.budgetMax <= 150) {
    return {
      activity: explicitActivityTypes.length > 0 ? explicitActivityTypes : ["户外散步", "拍照地标", "文化体验", "休闲娱乐"],
      breakStop: ["轻食甜饮", "餐饮正餐"],
      ending: ["户外散步", "拍照地标", "文化体验", "休闲娱乐"],
      includeMeal: true
    };
  }

  return base;
}

function hasIndoorIntent(requirements: Requirements): boolean {
  const text = [
    requirements.rawText,
    ...requirements.preferences,
    ...requirements.constraints
  ].join(" ");
  return /室内|下雨|雨天/.test(text);
}

function orderStepsSpatially(steps: RouteStep[], preferredFirstTypes: string[] = [], requirements?: Requirements): RouteStep[] {
  if (steps.length < 3 || steps.length > 5) return steps;
  if (steps.some((step) => !hasCoordinate(step.poi))) return steps;

  const permutations = permute(steps)
    .filter((candidate) => !requirements || canConnectCombo(candidate.map((step) => step.poi), requirements));
  return permutations
    .map((candidate) => ({
      candidate,
      score: scoreRouteOrder(candidate, preferredFirstTypes)
    }))
    .sort((a, b) => a.score - b.score)[0]?.candidate ?? steps;
}

function hasCoordinate(poi: Poi): boolean {
  return typeof poi.lat === "number" && typeof poi.lng === "number";
}

function scoreRouteOrder(steps: RouteStep[], preferredFirstTypes: string[] = []): number {
  const pathDistance = steps.slice(1).reduce((sum, step, index) => {
    return sum + distanceKm(steps[index].poi, step.poi);
  }, 0);
  const startEndDistance = distanceKm(steps[0].poi, steps.at(-1)!.poi);
  const rolePenalty = scoreRoleOrderPenalty(steps, preferredFirstTypes);
  const backtrackPenalty = scoreBacktrackPenalty(steps);

  return pathDistance - startEndDistance * 0.45 + rolePenalty + backtrackPenalty;
}

function scoreRoleOrderPenalty(steps: RouteStep[], preferredFirstTypes: string[] = []): number {
  let penalty = 0;
  const first = steps[0]?.poi;
  const last = steps.at(-1)?.poi;
  if (preferredFirstTypes.length > 0 && first && !preferredFirstTypes.includes(first.type)) penalty += 100;
  if (first?.type === "餐饮正餐" || first?.type === "轻食甜饮") penalty += 2.5;
  if (last?.type === "餐饮正餐") penalty += 1.2;

  const mealIndex = steps.findIndex((step) => step.poi.type === "餐饮正餐");
  const breakIndex = steps.findIndex((step) => step.poi.type === "轻食甜饮");
  if (mealIndex >= 0 && breakIndex >= 0 && mealIndex < breakIndex) penalty += 0.8;
  for (let index = 1; index < steps.length; index += 1) {
    const previous = steps[index - 1];
    const current = steps[index];
    if (getRouteCategoryKey(previous.poi) === getRouteCategoryKey(current.poi)) penalty += 80;
    if (previous.templateRole && previous.templateRole === current.templateRole) penalty += 70;
    if (isFoodOrDrink(previous.poi) && isFoodOrDrink(current.poi)) penalty += 55;
  }
  const drinkCount = steps.filter((step) => getRouteCategoryKey(step.poi) === "drink").length;
  const foodDrinkCount = steps.filter((step) => isFoodOrDrink(step.poi)).length;
  if (drinkCount > 1) penalty += (drinkCount - 1) * 90;
  if (foodDrinkCount > 2) penalty += (foodDrinkCount - 2) * 75;
  return penalty;
}

function getRouteCategoryKey(poi: Poi): string {
  const text = buildPoiText(poi);
  if (poi.type === "餐饮正餐" || /餐|饭|菜馆|火锅|烧烤|小吃|夜市|美食街|茶餐厅|bistro/i.test(text)) return "meal";
  if (poi.type === "轻食甜饮" || /咖啡|茶|甜品|奶茶|饮品|面包|下午茶/i.test(text)) return "drink";
  if (poi.type === "文化体验" || /展|美术馆|博物馆|书店|文化|艺术|手作|陶艺|DIY/i.test(text)) return "culture";
  if (poi.type === "户外散步" || /公园|绿道|栈道|海滨|沙滩|街区|古城|散步|citywalk/i.test(text)) return "outdoor";
  if (poi.type === "拍照地标" || /拍照|打卡|地标|夜景|广场/i.test(text)) return "photo";
  if (poi.type === "休闲娱乐" || /娱乐|电影|影院|KTV|密室|桌游|电玩城|乐园|运动/i.test(text)) return "entertainment";
  return "other";
}

function isFoodOrDrink(poi: Poi): boolean {
  return ["meal", "drink"].includes(getRouteCategoryKey(poi));
}

function scoreBacktrackPenalty(steps: RouteStep[]): number {
  let penalty = 0;
  for (let i = 2; i < steps.length; i += 1) {
    const prevPrev = steps[i - 2].poi;
    const current = steps[i].poi;
    const skippedDistance = distanceKm(prevPrev, current);
    const viaDistance = distanceKm(prevPrev, steps[i - 1].poi) + distanceKm(steps[i - 1].poi, current);
    if (skippedDistance > 0 && viaDistance / skippedDistance > 2.2) {
      penalty += 1.5;
    }
  }
  return penalty;
}

function distanceKm(a: Poi, b: Poi): number {
  if (!hasCoordinate(a) || !hasCoordinate(b)) return 0;
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat! - a.lat!);
  const dLng = toRadians(b.lng! - a.lng!);
  const lat1 = toRadians(a.lat!);
  const lat2 = toRadians(b.lat!);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(h)));
}

function toRadians(value: number): number {
  return value * Math.PI / 180;
}

function permute<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, index) => {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    return permute(rest).map((candidate) => [item, ...candidate]);
  });
}

function canConnectToRoute(steps: RouteStep[], poi: Poi, requirements: Requirements): boolean {
  if (!requirements.allowCrossDistrict && requirements.district && !matchesDistrict(poi, requirements.district)) {
    return false;
  }
  if (steps.length === 0) {
    const firstLegMinutes = estimateTravelMinutesFromCurrentLocation(poi, requirements.currentLocation);
    return firstLegMinutes === 0 || firstLegMinutes <= 60;
  }
  const previous = steps.at(-1)?.poi;
  if (!previous) return true;
  return estimateTravelMinutesBetweenPois(previous, poi) <= 60;
}

function scorePoi(poi: Poi, requirements: Requirements, theme?: string): number {
  let score = poi.priorityScore ?? 50;
  const profile = requirements.userProfile;
  const poiText = buildPoiText(poi);
  if (isLowValueChain(poiText, requirements)) score -= 90;
  if (!poi.fitPeople.includes(requirements.peopleType)) score -= 26;
  score += (poi.meituanRating ?? 4) * 10;
  score += Math.min(10, Math.log10((poi.reviewCount ?? 0) + 1) * 2);

  for (const preference of requirements.preferences) {
    if (poi.tags.includes(preference)) score += 12;
    if (poi.reason.includes(preference)) score += 4;
  }
  for (const constraint of requirements.constraints) {
    if (poi.limits.includes(constraint) || poi.tags.includes(constraint)) score += 10;
  }

  if (theme && poi.blindBoxThemes?.includes(theme)) score += 14;
  if (requirements.district && matchesDistrict(poi, requirements.district)) score += 24;
  if (requirements.district && !isPoiNearRequestedDistrict(poi, requirements.district, 12)) score -= 80;
  if (requirements.district) {
    const startTravel = estimateTravelMinutesFromRequestedDistrict(poi, requirements.district);
    if (startTravel > 70) score -= 60;
    else if (startTravel > 45) score -= 25;
    else if (startTravel > 0 && startTravel <= 30) score += 12;
  }
  if (requirements.currentLocation) {
    const fromCurrent = estimateTravelMinutesFromCurrentLocation(poi, requirements.currentLocation);
    if (fromCurrent > 90) score -= 100;
    else if (fromCurrent > 60) score -= 55;
    else if (fromCurrent > 40) score -= 18;
    else if (fromCurrent > 0 && fromCurrent <= 25) score += 24;
    else if (fromCurrent > 0 && fromCurrent <= 40) score += 12;
  }
  if (requirements.peopleType === "亲子" && (poi.tags.includes("亲子") || poi.tags.includes("自然教育") || poi.limits.includes("少走路") || /儿童|亲子|公园/.test(poi.reason))) score += 14;
  if (requirements.peopleType === "情侣" && (poi.tags.includes("氛围") || poi.tags.includes("拍照") || poi.tags.includes("夜景") || /约会|清吧|安静/.test(poi.reason))) score += 12;
  if (requirements.peopleType === "朋友" && (poi.tags.includes("互动") || poi.tags.includes("美食") || poi.type === "休闲娱乐" || /桌游|聚会|小吃|聊天/.test(poi.reason))) score += 12;
  if (requirements.peopleType === "单人" && (poi.tags.includes("安静") || poi.tags.includes("咖啡") || poi.type === "文化体验" || poi.type === "户外散步" || /书店|美术馆|公园/.test(poi.reason))) score += 12;
  if (requirements.budgetMax <= 150 && (poi.price === 0 || poi.price <= 50 || poi.tags.includes("性价比") || poi.tags.includes("免费"))) score += 14;
  if (requirements.budgetMax <= 150 && poi.price > 120) score -= 18;
  if (requirements.budgetMax >= 350 && (poi.type === "文化体验" || poi.type === "餐饮正餐" || poi.tags.includes("小众") || poi.tags.includes("手作") || poi.tags.includes("夜景"))) score += 8;
  if (requirements.budgetMax > 150 && requirements.budgetMax < 350 && (poi.tags.includes("性价比") || poi.type === "轻食甜饮")) score += 5;
  if (poi.queueLevel === "low") score += 10;
  if (poi.queueLevel === "medium") score -= 2;
  if (poi.queueLevel === "high") score -= 25;
  if (poi.limits.includes("室内") || poi.limits.includes("雨天可去") || poi.weatherSensitive === false) score += 5;
  if (poi.price <= 50) score += 5;
  if (isNearDistance(poi.distanceLevel)) score += 15;
  if (isMediumDistance(poi.distanceLevel)) score += 5;
  if (isFarDistance(poi.distanceLevel)) score -= 18;
  if (poi.stayMinutes > requirements.durationHours * 60) score -= 30;
  if (poi.stayMinutes > 150) score -= 8;

  if (profile) {
    score += scoreProfilePreference(poi, poiText, profile);
  }

  return score;
}

function scoreProfilePreference(poi: Poi, poiText: string, profile: NonNullable<Requirements["userProfile"]>): number {
  let score = 0;
  if (profile.likedPoiTypes?.includes(poi.type)) score += 28;
  if (profile.favoritePoiNames?.some((name) => poi.name.includes(name) || name.includes(poi.name))) score += 35;
  if (profile.likedDistricts?.some((district) => matchesDistrict(poi, district))) score += 16;

  const likedTagHits = (profile.likedTags ?? []).filter((tag) => poi.tags.includes(tag) || poiText.includes(tag));
  score += Math.min(24, likedTagHits.length * 7);

  if (profile.favoriteRouteThemes?.some((theme) => poi.blindBoxThemes?.includes(theme) || poiText.includes(theme))) score += 10;
  if (profile.dislikedPoiTypes?.includes(poi.type)) score -= 42;

  const rejectedHits = (profile.rejectedKeywords ?? []).filter((keyword) => poiText.includes(keyword.replace(/^少推荐/, "")));
  score -= Math.min(30, rejectedHits.length * 10);

  const budgetRange = profile.budgetRange;
  if (budgetRange) {
    const [minBudget, maxBudget] = budgetRange;
    if (poi.price >= minBudget && poi.price <= maxBudget) score += 10;
    if (poi.price > maxBudget) score -= Math.min(28, Math.round((poi.price - maxBudget) / 8));
  }

  if (profile.preferredRoutePace === "relaxed") {
    if (poi.stayMinutes <= 85 || poi.type === "轻食甜饮" || poi.type === "户外散步") score += 6;
    if (poi.stayMinutes >= 120) score -= 8;
  }
  if (profile.preferredRoutePace === "packed") {
    if (poi.stayMinutes <= 80) score += 5;
    if (poi.stayMinutes >= 120) score -= 5;
  }

  return score;
}

function buildRouteRecommendationReasons(
  route: Route,
  requirements?: Requirements,
  context?: RouteRecommendationContext
): string[] {
  const steps = route.steps ?? [];
  if (steps.length === 0) return [];

  const reasons: string[] = [];
  reasons.push(...collectTemplateReason(context?.template));
  reasons.push(...collectAnchorReason(route, context?.anchorSelection));
  reasons.push(...collectFallbackReason(context));
  reasons.push(...collectRoleCoverageReason(route, context));
  reasons.push(...collectRepairReason(route, context));
  reasons.push(...collectBaseRecommendationReasons(route, requirements));
  return finalizeRecommendationReasons(reasons);
}

function collectTemplateReason(template?: RouteTemplate): string[] {
  if (!template) return [];
  const matchedReason = template.matchedReasons.find((reason) => reason.trim().length > 0);
  if (!matchedReason) return [];
  return [`这次按「${template.name}」的节奏来安排，原因是：${toUserFacingReason(matchedReason)}`];
}

function collectAnchorReason(route: Route, anchorSelection?: AnchorSelection | null): string[] {
  const anchorStep = route.steps.find((step) => step.isAnchor);
  const anchorName = anchorStep?.poi.name ?? anchorSelection?.poi.name;
  const anchorReason = anchorStep?.roleReason ?? anchorSelection?.reason;
  if (!anchorName || !anchorReason) return [];
  return [`先选「${anchorName}」作为核心停留点，再围绕它安排吃喝、散步或收尾。`];
}

function collectRoleCoverageReason(route: Route, context?: RouteRecommendationContext): string[] {
  const warnings = context?.warnings ?? [];
  const debugReasons = context?.debugReasons ?? [];
  const roles = route.steps
    .map((step) => step.templateRole)
    .filter((role): role is string => Boolean(role) && role !== "anchor");
  const uniqueRoles = [...new Set(roles)];
  const shortRouteWarning = warnings.find((warning) => /不为凑数|只找到|少于目标|低质量地点/.test(warning));

  if (shortRouteWarning || debugReasons.some((reason) => /composer_under_target|composer_slot_missing|composer_below_minimum/.test(reason))) {
    return [`这次只保留 ${route.steps.length} 站，是因为附近更合适的补点不够稳定。`];
  }

  if (uniqueRoles.length === 0) return [];
  return [`路线里补了${uniqueRoles.slice(0, 3).map(labelTemplateRole).join("、")}，不是只堆同一种店。`];
}

function collectRepairReason(route: Route, context?: RouteRecommendationContext): string[] {
  const issues = context?.qualityIssues ?? [];
  const debugReasons = context?.debugReasons ?? [];
  const issueCodes = new Set(issues.map((issue) => issue.code));
  const hasRepairSignals = debugReasons.some((reason) => /quality_retry_attempt:|quality_repair_applied:|quality_selected_best_attempt:/.test(reason));
  if (!hasRepairSignals && issueCodes.size === 0) return [];

  if (
    debugReasons.some((reason) => /quality_repair_applied:duplicate_brand|quality_repair_applied:duplicate_venue/.test(reason))
    || issueCodes.has("duplicate_brand")
    || issueCodes.has("duplicate_venue")
  ) {
    return ["已避开重复店和普通连锁扎堆，尽量让每一站都有不同作用。"];
  }
  if (
    debugReasons.some((reason) => /quality_repair_applied:low_value_anchor|quality_repair_applied:missing_anchor|quality_repair_applied:not_executable_poi|quality_repair_applied:not_real_navigable_poi/.test(reason))
    || issueCodes.has("low_value_anchor")
    || issueCodes.has("missing_anchor")
    || issueCodes.has("not_executable_poi")
    || issueCodes.has("not_real_navigable_poi")
  ) {
    return ["已尽量避开低价值或不可执行地点，优先保留能真正成线的节点。"];
  }
  if (
    debugReasons.some((reason) => /quality_repair_applied:too_many_drink|quality_repair_applied:too_many_food_drink|quality_repair_applied:forbid_category:/.test(reason))
    || issueCodes.has("too_many_drink")
    || issueCodes.has("too_many_food_drink")
    || issueCodes.has("too_many_same_category")
  ) {
    return ["已压低吃喝或同类节点占比，优先保留更均衡的路线节奏。"];
  }
  if (
    debugReasons.some((reason) => /quality_repair_applied:cross_district_without_permission/.test(reason))
    || issueCodes.has("cross_district_without_permission")
  ) {
    return ["已尽量把路线压回目标区域内，减少跨区折返和移动消耗。"];
  }
  if (
    debugReasons.some((reason) => /quality_repair_applied:prefer_role:/.test(reason))
    || issueCodes.has("missing_template_role")
    || issueCodes.has("template_role_mismatch")
    || issueCodes.has("too_few_stops_without_reason")
  ) {
    return ["当前候选不足时优先保留核心角色，没有为了补满点数牺牲路线质量。"];
  }
  if (hasRepairSignals) {
    return ["系统已经筛掉一轮不够顺的组合，保留当前更容易执行的一版。"];
  }
  return [];
}

function collectFallbackReason(context?: RouteRecommendationContext): string[] {
  if (!context?.usedFallback && !(context?.debugReasons ?? []).includes("composer_fallback_to_legacy")) {
    return [];
  }
  return ["如果标准组合不够顺，会改用更稳的拼法，优先保证真实可去、少绕路。"];
}

function collectBaseRecommendationReasons(route: Route, requirements?: Requirements): string[] {
  const steps = route.steps ?? [];
  const reasons: string[] = [];
  const profile = requirements?.userProfile;
  const pois = steps.map((step) => step.poi);
  const types = [...new Set(pois.map((poi) => poi.type))];
  const districts = [...new Set(pois.map((poi) => poi.area || poi.businessDistrict).filter(Boolean))];
  const profileTypeHits = profile?.likedPoiTypes?.filter((type) => types.includes(type)) ?? [];
  const profileDistrictHits = profile?.likedDistricts?.filter((district) => pois.some((poi) => matchesDistrict(poi, district))) ?? [];
  const profileTagHits = profile?.likedTags?.filter((tag) => pois.some((poi) => poi.tags.includes(tag) || buildPoiText(poi).includes(tag))) ?? [];

  if (requirements?.district) {
    const inDistrictCount = pois.filter((poi) => matchesDistrict(poi, requirements.district!)).length;
    if (inDistrictCount === pois.length) {
      reasons.push(`路线节点均在${requirements.district}内，减少第一站和中途移动成本。`);
    } else if (requirements.allowCrossDistrict) {
      reasons.push(`以${requirements.district}为核心，并允许相邻商圈补点；当前有 ${pois.length - inDistrictCount} 个跨区节点。`);
    } else {
      reasons.push(`目标区域${requirements.district}的可执行候选不足，当前路线未能完全压在该区内。`);
    }
  }

  if (profileTypeHits.length > 0 || profileDistrictHits.length > 0 || profileTagHits.length > 0) {
    reasons.push(`参考了你的历史偏好：${[
      profileTypeHits.slice(0, 2).join("、"),
      profileDistrictHits.slice(0, 2).join("、"),
      profileTagHits.slice(0, 2).join("、")
    ].filter(Boolean).join("；")}。`);
  }

  const avoidedTypes = profile?.dislikedPoiTypes?.filter((type) => !types.includes(type)).slice(0, 2) ?? [];
  if (avoidedTypes.length > 0) {
    reasons.push(`已尽量避开你最近替换或删除过的「${avoidedTypes.join("、")}」。`);
  }

  if (types.length >= Math.min(3, steps.length)) {
    reasons.push(`节点类型覆盖${types.slice(0, 4).join("、")}，避免整条路线只重复同一种体验。`);
  }

  if (requirements?.budgetMax) {
    reasons.push(`预算按每站人均区间估算，并控制在你选择的 ¥${requirements.budgetMax} 以内。`);
  }

  if (districts.length > 0 && steps.length >= 2) {
    reasons.push(`路线从${districts[0]}展开，顺序会按空间距离和吃喝玩休节奏重新排序。`);
  }

  return reasons;
}

function toUserFacingReason(reason: string): string {
  return reason
    .replace(/用户表达了/g, "你提到了")
    .replace(/用户提到/g, "你提到了")
    .replace(/出行人群为/g, "同行人是")
    .replace(/盲盒主题偏/g, "选择的风格偏")
    .replace(/预算上限为/g, "预算是")
    .replace(/没有强主题信号，使用轻松半日模板。/g, "没有特别限定风格，适合走轻松半日路线。");
}

function finalizeRecommendationReasons(reasons: string[]): string[] {
  return [...new Set(reasons.map((reason) => reason.trim()).filter((reason) => reason.length > 0))].slice(0, 4);
}

function labelTemplateRole(role: string): string {
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
  return labels[role] ?? role;
}

function buildPersonalizationSummary(steps: RouteStep[], requirements?: Requirements): string | undefined {
  if (steps.length === 0) return undefined;
  const profile = requirements?.userProfile;
  if (!profile) return undefined;
  const signalCount = (profile.confirmedRouteCount ?? 0) + (profile.favoritePoiCount ?? 0) + (profile.favoriteRouteCount ?? 0);
  const routeTypes = new Set(steps.map((step) => step.poi.type));
  const matchedTypes = (profile.likedPoiTypes ?? []).filter((type) => routeTypes.has(type));
  const matchedDistrict = (profile.likedDistricts ?? []).find((district) => steps.some((step) => matchesDistrict(step.poi, district)));
  const parts = [
    signalCount > 0 ? `${signalCount} 条历史行为` : "",
    matchedTypes.length ? `偏好类型 ${matchedTypes.slice(0, 2).join("、")}` : "",
    matchedDistrict ? `常去区域 ${matchedDistrict}` : "",
  ].filter(Boolean);
  return parts.length ? `已参考${parts.join("；")}` : undefined;
}

function buildPoiText(poi: Poi): string {
  return `${poi.name} ${poi.type} ${poi.subType} ${poi.area || ""} ${poi.businessDistrict} ${poi.tags.join(" ")} ${poi.limits.join(" ")} ${poi.reason}`;
}

function matchesDistrict(poi: Poi, district: string): boolean {
  const normalized = district.replace(/区$/, "");
  return [poi.area, poi.businessDistrict, poi.routeCluster, poi.address]
    .filter(Boolean)
    .some((value) => String(value).includes(normalized));
}

function selectRouteCluster(candidates: Poi[], requirements: Requirements, theme?: string, requiredTypes: string[] = []): string | undefined {
  const clusters = new Map<string, { score: number; types: Set<string>; count: number }>();

  for (const poi of candidates) {
    if (!poi.routeCluster) continue;
    const bucket = clusters.get(poi.routeCluster) ?? { score: 0, types: new Set<string>(), count: 0 };
    bucket.score += scorePoi(poi, requirements, theme);
    bucket.types.add(poi.type);
    bucket.count += 1;
    clusters.set(poi.routeCluster, bucket);
  }

  return [...clusters.entries()]
    .filter(([, bucket]) => bucket.count >= 2)
    .filter(([, bucket]) => requiredTypes.length === 0 || requiredTypes.some((type) => bucket.types.has(type)))
    .sort(([, a], [, b]) => {
      const scoreA = a.score + a.types.size * 35 + Math.min(a.count, 6) * 8;
      const scoreB = b.score + b.types.size * 35 + Math.min(b.count, 6) * 8;
      return scoreB - scoreA;
    })[0]?.[0];
}

function selectClusterAndNearbyCandidates(candidates: Poi[], routeCluster: string): Poi[] {
  const anchors = candidates.filter((poi) => poi.routeCluster === routeCluster);
  return candidates.filter((poi) =>
    poi.routeCluster === routeCluster
    || anchors.some((anchor) => hasCoordinate(anchor) && hasCoordinate(poi) && distanceKm(anchor, poi) <= 8)
  );
}

function findTargetStep(event: ReplanEvent, currentRoute: Route): RouteStep | undefined {
  if (event.poiId) return currentRoute.steps.find((step) => step.poi.id === event.poiId);
  if (event.type === "rain") {
    return currentRoute.steps.find((step) => step.poi.weatherSensitive || step.poi.limits.includes("室外"));
  }
  if (event.type === "queue") {
    return currentRoute.steps.find((step) => step.poi.type === "餐饮正餐");
  }
  return currentRoute.steps.at(-1);
}

function findReplacement(
  event: ReplanEvent,
  targetPoi: Poi,
  pois: Poi[],
  requirements: Requirements,
  currentRoute: Route
): Poi | undefined {
  const usedIds = new Set(currentRoute.steps.map((step) => step.poi.id));
  const replaceableIds = targetPoi.replaceableBy ?? [];
  const requestedTypes = getRequestedReplacementTypes(event, targetPoi);
  const directReplacement = pois.find((poi) =>
    replaceableIds.includes(poi.id)
    && !usedIds.has(poi.id)
    && isNearEnoughForReplacement(poi, targetPoi)
    && matchesRequestedType(poi, requestedTypes)
  );
  if (directReplacement && matchesEvent(event, directReplacement)) return directReplacement;

  return pois
    .filter((poi) => !usedIds.has(poi.id))
    .filter((poi) => poi.fitPeople.includes(requirements.peopleType))
    .filter((poi) => poi.price <= Math.max(requirements.budgetMax, targetPoi.price + 40))
    .filter((poi) => matchesRequestedType(poi, requestedTypes) || (!event.customPreference?.trim() && (poi.type === targetPoi.type || event.type === "rain")))
    .filter((poi) => isNearEnoughForReplacement(poi, targetPoi))
    .filter((poi) => matchesEvent(event, poi))
    .sort((a, b) => {
      const sameClusterA = a.routeCluster && a.routeCluster === targetPoi.routeCluster ? 35 : 0;
      const sameClusterB = b.routeCluster && b.routeCluster === targetPoi.routeCluster ? 35 : 0;
      const sameDistrictA = a.businessDistrict === targetPoi.businessDistrict ? 20 : 0;
      const sameDistrictB = b.businessDistrict === targetPoi.businessDistrict ? 20 : 0;
      return sameClusterB + sameDistrictB + scorePoi(b, requirements) - (sameClusterA + sameDistrictA + scorePoi(a, requirements));
    })[0];
}

function getRequestedReplacementTypes(event: ReplanEvent, targetPoi: Poi): string[] {
  const text = event.customPreference || event.message || "";
  const types: string[] = [];

  if (/室内.*(娱乐|玩|活动)|娱乐.*室内|电玩城|桌游|密室|KTV|电影|游戏|剧本/.test(text)) {
    types.push("休闲娱乐");
  }
  if (/diy|DIY|手工|手作|陶艺|银饰|香薰|烘焙|画画|绘画/.test(text)) {
    types.push("文化体验", "休闲娱乐");
  }
  if (/展|美术馆|博物馆|艺术|文化|书店/.test(text)) {
    types.push("文化体验");
  }
  if (/咖啡|奶茶|甜|饮|茶/.test(text)) {
    types.push("轻食甜饮");
  }
  if (/吃|饭|餐|火锅|烧烤|菜/.test(text)) {
    types.push("餐饮正餐");
  }
  if (/拍照|打卡|出片|地标|夜景/.test(text)) {
    types.push("拍照地标", "文化体验");
  }
  if (/公园|散步|户外|徒步|citywalk/i.test(text)) {
    types.push("户外散步");
  }

  return [...new Set(types.length > 0 ? types : [targetPoi.type])];
}

function matchesRequestedType(poi: Poi, requestedTypes: string[]): boolean {
  return requestedTypes.length === 0 || requestedTypes.includes(poi.type);
}

function isNearEnoughForReplacement(candidate: Poi, targetPoi: Poi): boolean {
  if (isFarDistance(candidate.distanceLevel)) return false;
  if (hasCoordinate(candidate) && hasCoordinate(targetPoi) && distanceKm(candidate, targetPoi) <= 8) return true;
  if (targetPoi.routeCluster && candidate.routeCluster) return candidate.routeCluster === targetPoi.routeCluster;
  if (targetPoi.area && candidate.area) return candidate.area === targetPoi.area;
  return !hasCoordinate(candidate) || !hasCoordinate(targetPoi);
}

function isNearDistance(distanceLevel?: string): boolean {
  return distanceLevel === "3km内" || distanceLevel === "3km以内" || distanceLevel === "near" || distanceLevel === "近" || distanceLevel === "附近" || distanceLevel === "不要太远";
}

function isMediumDistance(distanceLevel?: string): boolean {
  return distanceLevel === "3-10km" || distanceLevel === "medium" || distanceLevel === "中等" || !distanceLevel;
}

function isNearOrMediumDistance(distanceLevel?: string): boolean {
  return isNearDistance(distanceLevel) || isMediumDistance(distanceLevel);
}

function isFarDistance(distanceLevel?: string): boolean {
  return distanceLevel === "10km以上" || distanceLevel === "far";
}

function matchesEvent(event: ReplanEvent, poi: Poi): boolean {
  if (event.type === "queue") return poi.queueLevel === "low";
  if (event.type === "rain") return poi.weatherSensitive === false || poi.limits.includes("室内") || poi.limits.includes("雨天可去");
  if (event.type === "unavailable" || event.type === "closed") return poi.bookingRequired !== true || Boolean(poi.availableTools?.includes("bookingMock"));
  return true;
}

function buildReplacementReason(event: ReplanEvent, replacement: Poi): string {
  if (event.type === "queue") return `${replacement.name} 排队风险更低，且价格和类型接近。`;
  if (event.type === "rain") return `${replacement.name} 更适合室内或雨天场景。`;
  if (event.type === "closed") return `${replacement.name} 和原节点类型相近，当前可替换闭店节点。`;
  if (event.type === "unavailable") return `${replacement.name} 当前更容易加入行程。`;
  return `${replacement.name} 更适合当前路线约束。`;
}

function buildImpact(event: ReplanEvent, poiName: string): string {
  if (event.type === "queue") return `${poiName} 当前排队约 ${event.waitMinutes ?? 45} 分钟，可能影响后续节点。`;
  if (event.type === "rain") return `${poiName} 受天气影响，继续前往体验不稳定。`;
  if (event.type === "closed") return `${poiName} 当前闭店或不可前往，需要替换同类节点。`;
  if (event.type === "unavailable") return `${poiName} 当前不可预约或不可加入行程。`;
  return `${poiName} 出现超时，可能压缩后续路线。`;
}

function buildPlanBResult(
  event: ReplanEvent,
  beforeRoute: Route,
  afterRoute: Route,
  changes: PlanBChange[],
  requirements: Requirements,
  impact: string
): PlanBResult {
  const sacrificed = changes.flatMap((change) => change.from ? [change.from] : []);
  return {
    event,
    impact,
    beforeRoute,
    afterRoute,
    changes,
    keptPreferences: requirements.preferences.slice(0, 3),
    sacrificed,
    message: `${impact} 已为你调整路线，尽量保留「${requirements.preferences.slice(0, 2).join("、") || "核心体验"}」。`
  };
}

/** 检查路线是否有"同类点过多"的结构性问题，用于决定是否拒绝模板路线并回退到 legacy 路径 */
function hasTooManySameCategoryIssue(issues: RouteQualityIssue[]): boolean {
  return issues.some((issue) =>
    ["too_many_same_category", "too_many_food_drink", "too_many_drink"].includes(issue.code)
  );
}
