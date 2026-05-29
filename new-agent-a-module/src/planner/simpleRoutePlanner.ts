import type { PlanBChange, PlanBResult, Poi, Requirements, ReplanEvent, Route, RouteStep } from "../agent/types.ts";

export function buildRoute(requirements: Requirements, pois: Poi[], theme: string): Route {
  const allCandidates = filterPois(requirements, pois, theme);
  const routeCluster = selectRouteCluster(allCandidates, requirements, theme);
  const clusteredCandidates = routeCluster
    ? allCandidates.filter((poi) => poi.routeCluster === routeCluster)
    : allCandidates;
  const candidates = clusteredCandidates.length >= 2 ? clusteredCandidates : allCandidates;
  const steps: RouteStep[] = [];
  const targetMinutes = Math.max(180, Math.min(360, requirements.durationHours * 60));
  const maxMinutes = targetMinutes + 30;

  const firstActivity = pickFirst(candidates, ["拍照地标", "户外散步", "文化体验", "休闲娱乐"]);
  addStepIfFits(steps, firstActivity, maxMinutes);

  const breakStop = pickFirst(candidates, ["轻食甜饮"], usedIds(steps));
  addStepIfFits(steps, breakStop, maxMinutes);

  const meal = pickFirst(candidates, ["餐饮正餐"], usedIds(steps));
  addStepIfFits(steps, meal, maxMinutes);

  const ending = pickFirst(candidates, ["拍照地标", "户外散步", "文化体验", "休闲娱乐"], usedIds(steps));
  addStepIfFits(steps, ending, maxMinutes);

  for (const candidate of candidates) {
    if (steps.length >= 4) break;
    if (usedIds(steps).includes(candidate.id)) continue;
    addStepIfFits(steps, candidate, maxMinutes);
  }

  const selected = steps.length >= 2
    ? steps.map((step) => step.poi)
    : candidates.slice(0, Math.min(3, candidates.length));

  steps.length = 0;
  selected.forEach((poi, index) => {
    steps.push({
      order: index + 1,
      role: inferRole(poi, index),
      poi,
      note: poi.reason
    });
  });

  return summarizeRoute(steps);
}

export function filterPois(requirements: Requirements, pois: Poi[], theme?: string): Poi[] {
  return pois
    .filter((poi) => poi.price <= requirements.budgetMax)
    .filter((poi) => poi.fitPeople.includes(requirements.peopleType))
    .filter((poi) => {
      if (isFarDistance(poi.distanceLevel) && requirements.distanceLevel !== "10km以上") return false;
      if (!requirements.distanceLevel || !poi.distanceLevel) return true;
      if (requirements.distanceLevel === "3-10km") return isNearOrMediumDistance(poi.distanceLevel);
      return poi.distanceLevel === requirements.distanceLevel;
    })
    .filter((poi) => {
      if (requirements.constraints.includes("不想排队")) return poi.queueLevel !== "high";
      return true;
    })
    .filter((poi) => {
      if (requirements.constraints.includes("室内优先")) {
        return poi.limits.includes("室内") || poi.limits.includes("雨天可去") || poi.weatherSensitive === false;
      }
      return true;
    })
    .sort((a, b) => scorePoi(b, requirements, theme) - scorePoi(a, requirements, theme));
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

function pickFirst(candidates: Poi[], types: string[], excludedIds: Array<string | undefined> = []): Poi | undefined {
  return candidates.find((poi) => types.includes(poi.type) && !excludedIds.includes(poi.id));
}

function addStepIfFits(steps: RouteStep[], poi: Poi | undefined, maxMinutes: number): void {
  if (!poi) return;
  const currentMinutes = steps.reduce((sum, step) => sum + step.poi.stayMinutes, 0);
  if (currentMinutes + poi.stayMinutes > maxMinutes && steps.length >= 2) return;

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

function inferRole(poi: Poi, index: number): RouteStep["role"] {
  if (poi.type === "餐饮正餐") return "meal";
  if (poi.type === "轻食甜饮") return "break";
  if (index >= 3) return "ending";
  return "activity";
}

function summarizeRoute(steps: RouteStep[]): Route {
  return {
    totalMinutes: steps.reduce((sum, step) => sum + step.poi.stayMinutes, 0),
    totalBudget: steps.reduce((sum, step) => sum + step.poi.price, 0),
    steps: steps.map((step, index) => ({ ...step, order: index + 1 }))
  };
}

function scorePoi(poi: Poi, requirements: Requirements, theme?: string): number {
  let score = poi.priorityScore ?? 50;
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

  return score;
}

function selectRouteCluster(candidates: Poi[], requirements: Requirements, theme?: string): string | undefined {
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
    .sort(([, a], [, b]) => {
      const scoreA = a.score + a.types.size * 35 + Math.min(a.count, 6) * 8;
      const scoreB = b.score + b.types.size * 35 + Math.min(b.count, 6) * 8;
      return scoreB - scoreA;
    })[0]?.[0];
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
  const directReplacement = pois.find((poi) =>
    replaceableIds.includes(poi.id)
    && !usedIds.has(poi.id)
    && isNearEnoughForReplacement(poi, targetPoi)
  );
  if (directReplacement && matchesEvent(event, directReplacement)) return directReplacement;

  return pois
    .filter((poi) => !usedIds.has(poi.id))
    .filter((poi) => poi.fitPeople.includes(requirements.peopleType))
    .filter((poi) => poi.price <= Math.max(requirements.budgetMax, targetPoi.price + 40))
    .filter((poi) => poi.type === targetPoi.type || event.type === "rain")
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

function isNearEnoughForReplacement(candidate: Poi, targetPoi: Poi): boolean {
  if (isFarDistance(candidate.distanceLevel)) return false;
  if (targetPoi.routeCluster && candidate.routeCluster) return candidate.routeCluster === targetPoi.routeCluster;
  if (targetPoi.area && candidate.area) return candidate.area === targetPoi.area;
  return true;
}

function isNearDistance(distanceLevel?: string): boolean {
  return distanceLevel === "3km内" || distanceLevel === "3km以内" || distanceLevel === "near";
}

function isMediumDistance(distanceLevel?: string): boolean {
  return distanceLevel === "3-10km" || distanceLevel === "medium" || !distanceLevel;
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
  if (event.type === "unavailable" || event.type === "closed") return poi.bookingRequired !== true || poi.availableTools?.includes("bookingMock");
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
