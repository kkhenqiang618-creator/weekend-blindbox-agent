import type { Poi, Requirements } from "../agent/types.ts";
import type { RouteTemplate } from "./routeTemplates.ts";
import {
  getBrandKey,
  getCategoryKey,
  getVenueKey,
  isExecutablePoi,
  isLowValueAnchorPoi,
  isLowValueChainPoi,
  isRealNavigablePoi,
  normalizePoiForRecommendation,
} from "./poiNormalizer.ts";
import { getExperienceSubKey } from "./amapCategoryMap.ts";

export interface AnchorSelection {
  poi: Poi;
  score: number;
  reason: string;
  debugReasons: string[];
}

const STRONG_ANCHOR_PATTERN =
  /古镇|古城|公园|美术馆|艺术馆|博物馆|书吧|书店|文化街区|特色街区|创意园|文创|市集|夜市|美食街|老街|绿道|海滨|栈道|艺术空间|文化空间/;

const INDOOR_ANCHOR_PATTERN = /美术馆|艺术馆|博物馆|书店|书吧|文化馆|展览|艺术空间|文化空间|剧场|影院|桌游|手作|陶艺|DIY/i;
const LOCAL_FOOD_PATTERN = /本地|老字号|小吃|夜市|美食街|市集|茶餐厅|客家|潮汕|蛇口|盐田|甘坑|大鹏/;

export function selectAnchor(candidates: Poi[], template: RouteTemplate, requirements: Requirements): AnchorSelection | null {
  const ranked = candidates
    .map((poi) => normalizePoiForRecommendation(poi, requirements))
    .filter((poi) => isEligibleAnchor(poi, requirements))
    .map((poi) => scoreAnchor(poi, template, requirements))
    .sort((a, b) => b.score - a.score);

  return ranked[0] ?? null;
}

function isEligibleAnchor(poi: Poi, requirements: Requirements): boolean {
  return isRealNavigablePoi(poi)
    && isExecutablePoi(poi)
    && matchesRequestedDistrict(poi, requirements)
    && !isLowValueChainPoi(poi, requirements)
    && !isLowValueAnchorPoi(poi);
}

function scoreAnchor(poi: Poi, template: RouteTemplate, requirements: Requirements): AnchorSelection {
  const text = buildPoiText(poi);
  const category = poi.categoryKey || getCategoryKey(poi);
  const debugReasons: string[] = [];
  let score = 50 + Math.min(25, Math.max(0, poi.qualityScore ?? 0) / 4);

  const add = (condition: boolean, value: number, reason: string) => {
    if (!condition) return;
    score += value;
    debugReasons.push(reason);
  };

  add(STRONG_ANCHOR_PATTERN.test(text), 42, "strong_local_or_culture_anchor");
  add(LOCAL_FOOD_PATTERN.test(text), 12, "local_feature_anchor");
  add(poi.price === 0 || poi.price <= 50, 8, "budget_friendly_anchor");
  add(Boolean(requirements.district && matchesDistrictText(poi, requirements.district)), 12, "district_matched_anchor");
  add(typeof poi.lat === "number" && typeof poi.lng === "number", 4, "has_coordinates");
  add((poi.meituanRating ?? 0) >= 4.6, 4, "high_rating");

  // Amap classification bonus: code-confirmed culture/outdoor/anchor-relevant categories
  const experienceSubKey = getExperienceSubKey(poi);
  add(
    experienceSubKey === "museum" || experienceSubKey === "gallery"
    || experienceSubKey === "park" || experienceSubKey === "scenery"
    || experienceSubKey === "library",
    14,
    `amap_confirmed_anchor:${experienceSubKey}`
  );

  if (template.id === "photo_afternoon_tea") {
    add(["photo", "culture", "outdoor"].includes(category), 28, "photo_template_core_category");
    add(/拍照|打卡|出片|街区|古镇|艺术|美术馆|公园|书店|书吧/i.test(text), 18, "photo_template_scene");
    add(category === "drink", -16, "drink_is_supporting_not_anchor");
  }

  if (template.id === "low_budget") {
    add(["outdoor", "culture", "photo", "meal"].includes(category), 24, "low_budget_core_category");
    add(/免费|预算友好|公园|绿道|街区|古镇|市集|小吃|美食街|博物馆|美术馆|图书馆|书吧/i.test(text), 22, "low_budget_value_scene");
  }

  if (template.id === "rainy_indoor") {
    add(["culture", "entertainment"].includes(category), 28, "rainy_indoor_core_category");
    add(INDOOR_ANCHOR_PATTERN.test(text) || poi.limits.includes("室内") || poi.limits.includes("雨天可去"), 22, "rainy_indoor_scene");
    add(poi.weatherSensitive === true, -18, "weather_sensitive_anchor");
  }

  if (template.id === "friends_gathering") {
    add(["entertainment", "culture", "outdoor", "meal"].includes(category), 18, "friends_core_category");
    add(/互动|桌游|市集|夜市|美食街|街区|公园|聊天|聚会|小吃/i.test(text), 18, "friends_gathering_scene");
  }

  if (template.id === "date") {
    add(["photo", "culture", "outdoor"].includes(category), 22, "date_core_category");
    add(/氛围|约会|夜景|艺术|美术馆|书店|书吧|公园|海滨|街区|古镇/i.test(text), 20, "date_scene");
  }

  if (template.id === "family") {
    add(["outdoor", "culture", "entertainment"].includes(category), 22, "family_core_category");
    add(/亲子|儿童|自然教育|公园|博物馆|图书馆|少走路|雨天可去/i.test(text), 20, "family_scene");
  }

  if (template.id === "relaxed_half_day") {
    add(["outdoor", "culture", "photo", "entertainment"].includes(category), 18, "relaxed_core_category");
  }

  const venueKey = poi.venueKey || getVenueKey(poi.name, poi.area || poi.businessDistrict);
  const brandKey = poi.brandKey || getBrandKey(text);
  if (venueKey) debugReasons.push(`venue:${venueKey}`);
  if (brandKey) debugReasons.push(`brand:${brandKey}`);
  debugReasons.push(`category:${category}`);

  return {
    poi,
    score,
    reason: buildAnchorReason(poi, template, debugReasons),
    debugReasons,
  };
}

function buildAnchorReason(poi: Poi, template: RouteTemplate, debugReasons: string[]): string {
  const text = buildPoiText(poi);
  if (/古镇|古城|文化街区|特色街区/.test(text)) {
    return `「${poi.name}」有完整街区游逛内容，适合作为「${template.name}」的主锚点。`;
  }
  if (/公园|绿道|海滨|栈道/.test(text)) {
    return `「${poi.name}」能提供稳定的低成本停留和散步空间，适合作为「${template.name}」核心。`;
  }
  if (/美术馆|艺术馆|博物馆|书店|书吧|文化空间|艺术空间/.test(text)) {
    return `「${poi.name}」具备明确文化体验内容，能撑起「${template.name}」的核心体验。`;
  }
  if (/市集|夜市|美食街|老街|小吃/.test(text)) {
    return `「${poi.name}」有本地烟火气和可逛性，适合作为「${template.name}」主线。`;
  }
  if (debugReasons.includes("rainy_indoor_scene")) {
    return `「${poi.name}」更适合室内停留，可作为「${template.name}」的核心点。`;
  }
  return `「${poi.name}」比普通补充点更能承载「${template.name}」的核心体验。`;
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

function matchesRequestedDistrict(poi: Poi, requirements: Requirements): boolean {
  if (!requirements.district || requirements.allowCrossDistrict) return true;
  return matchesDistrictText(poi, requirements.district);
}
