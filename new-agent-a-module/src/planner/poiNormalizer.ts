import type { Poi, Requirements } from "../agent/types.ts";
import { normalizePoiForPlanning } from "./routeQualityRules.ts";
import { mapAmapCategoryToRouteCategory } from "./amapCategoryMap.ts";

const LOW_VALUE_CHAIN_BRANDS = [
  "瑞幸",
  "luckin",
  "星巴克",
  "starbucks",
  "麦当劳",
  "肯德基",
  "KFC",
  "必胜客",
  "汉堡王",
  "蜜雪冰城",
  "益禾堂",
  "古茗",
  "一点点",
  "茶百道",
  "奈雪",
  "喜茶",
  "霸王茶姬",
  "CoCo",
  "沪上阿姨",
  "绝味鸭脖",
  "正新鸡排",
  "华莱士",
];

const GENERIC_SERVICE_PATTERN =
  /游客中心|服务中心|停车场|收费站|公交站|地铁站|道路|路口|出入口|入口|出口|卫生间|厕所|派出所|办事处|委员会|政府|银行|医院|药房|学校|培训|写字楼|公寓|住宅|小区|酒店|宾馆|公司|物流|仓库|售楼|营销中心|维修|洗车|汽修|中介|房产/;

const FAKE_GENERAL_PLACE_PATTERN =
  /附近|周边|顺路|推荐点|休息点|聚餐点|咖啡点|玩乐点|体验点|路线节点|占位|待定|某某|目的地/;

const ABSTRACT_UNEXECUTABLE_NAME_PATTERN =
  /附近|周边|顺路|推荐点|休息点|聚餐点|咖啡点|玩乐点|体验点|路线节点|占位|待定|某某/;

const FAKE_ADDRESS_PATTERN =
  /附近/;

const LOCAL_FEATURE_PATTERN =
  /本地|老字号|夜市|美食街|市集|街区|特色街区|古城|古镇|茶餐厅|小吃|文创|创意园|公园|绿道|栈道|海滨|博物馆|美术馆|艺术馆|图书馆|书店|书吧|文化馆/;

export function normalizePoiForRecommendation(poi: Poi, requirements: Requirements): Poi {
  const planned = normalizePoiForPlanning(poi, requirements);
  const text = buildPoiText(planned);
  const venueKey = getVenueKey(planned.name, planned.area || planned.businessDistrict);
  const brandKey = getBrandKey(text) || venueKey;
  const categoryKey = getCategoryKey(planned);
  const source = inferPoiSource(planned);
  const qualityTags = buildQualityTags(planned, requirements);
  const qualityWarnings = buildQualityWarnings(planned, requirements);

  return {
    ...planned,
    source,
    venueKey,
    brandKey,
    categoryKey,
    qualityTags,
    qualityWarnings,
    qualityScore: scorePoiQuality(planned, qualityTags, qualityWarnings),
  };
}

export function isLowValueChainPoi(poi: Poi, requirements?: Requirements): boolean {
  const text = buildPoiText(poi);
  const brand = getBrandKey(text);
  if (!brand) return false;
  if (!requirements) return true;
  return !isExplicitlyRequestedBrand(brand, requirements);
}

export function isLowValueAnchorPoi(poi: Poi): boolean {
  const text = buildPoiText(poi);
  return Boolean(getBrandKey(text))
    || GENERIC_SERVICE_PATTERN.test(text)
    || /游客中心|停车场|出入口|入口|服务中心/.test(text);
}

export function isRealNavigablePoi(poi: Poi): boolean {
  const text = buildPoiText(poi);
  if (!poi.name || poi.name.trim().length < 2) return false;
  if (FAKE_GENERAL_PLACE_PATTERN.test(poi.name)) return false;
  if (GENERIC_SERVICE_PATTERN.test(text)) return false;
  return Boolean(
    poi.address
    || poi.mockMeituanUrl
    || poi.lat !== undefined
    || poi.lng !== undefined
    || hasConcreteSource(poi)
  );
}

export function isExecutablePoi(poi: Poi): boolean {
  if (!isRealNavigablePoi(poi)) return false;
  const text = buildPoiText(poi);
  if (ABSTRACT_UNEXECUTABLE_NAME_PATTERN.test(poi.name)) return false;
  if (FAKE_ADDRESS_PATTERN.test(poi.address || "") && !hasConcreteSource(poi)) return false;
  if (/mock:\/\/local/i.test(poi.mockMeituanUrl || "") && !poi.address && (poi.lat === undefined || poi.lng === undefined)) return false;
  return true;
}

export function getVenueKey(name: string, area?: string): string {
  const cleanedName = name
    .replace(/[（(].*?[）)]/g, "")
    .replace(/旗舰店|总店|分店|东区|西区|南区|北区|一期|二期|三期|店|馆|中心/gi, "")
    .replace(/[·\s\-_/｜|]/g, "")
    .trim()
    .toLowerCase();
  const cleanedArea = (area || "")
    .replace(/街道|附近/g, "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
  return [cleanedName || name.trim().toLowerCase(), cleanedArea].filter(Boolean).join("@");
}

export function getBrandKey(text: string): string | undefined {
  return LOW_VALUE_CHAIN_BRANDS.find((brand) => new RegExp(escapeRegExp(brand), "i").test(text));
}

export function getCategoryKey(poi: Poi): string {
  // 1. If categoryKey is already set (explicit upstream assignment), prefer it
  if (poi.categoryKey) return poi.categoryKey;

  // 2. Try Amap category code/name mapping (more reliable than text rules)
  const amapCategory = mapAmapCategoryToRouteCategory(poi);
  if (amapCategory) return amapCategory;

  // 3. Fall back to existing text-based rules
  const text = buildPoiText(poi);
  if (poi.type === "餐饮正餐" || /餐|饭|菜馆|火锅|烧烤|小吃|夜市|美食街|茶餐厅|bistro/i.test(text)) return "meal";
  if (poi.type === "轻食甜饮" || /咖啡|茶|甜品|奶茶|饮品|面包|下午茶/i.test(text)) return "drink";
  if (poi.type === "文化体验" || /展|美术馆|博物馆|书店|文化|艺术|手作|陶艺|DIY/i.test(text)) return "culture";
  if (poi.type === "户外散步" || /公园|绿道|栈道|海滨|沙滩|街区|古城|散步|citywalk/i.test(text)) return "outdoor";
  if (poi.type === "拍照地标" || /拍照|打卡|地标|夜景|广场/i.test(text)) return "photo";
  if (poi.type === "休闲娱乐" || /娱乐|电影|影院|KTV|密室|桌游|电玩城|乐园|运动/i.test(text)) return "entertainment";
  return "other";
}

export function inferPoiSource(poi: Poi): "amap" | "local" | "manual" {
  if (poi.source) return poi.source;
  const id = poi.id || "";
  const url = poi.mockMeituanUrl || "";
  if (/^live_|^amap_|mock:\/\/amap/i.test(`${id} ${url}`) || poi.availableTools?.includes("amapPlaceSearch")) return "amap";
  if (/^manual-|^custom-/i.test(id)) return "manual";
  return "local";
}

function buildQualityTags(poi: Poi, requirements: Requirements): string[] {
  const tags = new Set<string>();
  const text = buildPoiText(poi);
  if (getBrandKey(text)) tags.add("low_value_chain");
  if (GENERIC_SERVICE_PATTERN.test(text)) tags.add("generic_service");
  if (isLowValueAnchorPoi(poi)) tags.add("bad_anchor_candidate");
  if (LOCAL_FEATURE_PATTERN.test(text)) tags.add("local_feature");
  if (poi.price === 0 || poi.price <= 50 || poi.limits.includes("预算友好") || poi.tags.includes("免费")) tags.add("budget_friendly");
  if (poi.lat !== undefined && poi.lng !== undefined) tags.add("has_coordinates");
  if (requirements.budgetMax <= 150 && /夜市|小吃|美食街|市集|老字号|公园|博物馆|美术馆|艺术馆|图书馆|绿道|街区|古镇|古城/.test(text)) {
    tags.add("low_budget_value");
  }
  return [...tags];
}

function buildQualityWarnings(poi: Poi, requirements: Requirements): string[] {
  const warnings: string[] = [];
  const text = buildPoiText(poi);
  const brand = getBrandKey(text);
  if (!isRealNavigablePoi(poi)) warnings.push("地点缺少可导航信息或疑似泛化占位点");
  if (brand && isExplicitlyRejectedBrand(brand, requirements)) warnings.push(`命中用户明确排斥品牌：${brand}`);
  if (brand && !isExplicitlyRequestedBrand(brand, requirements)) warnings.push(`普通连锁品牌：${brand}`);
  if (GENERIC_SERVICE_PATTERN.test(text)) warnings.push("低价值服务型地点，不适合作为路线核心");
  if (!isExecutablePoi(poi)) warnings.push("地点疑似抽象兜底或不可执行，不能直接导航/搜索");
  return warnings;
}

function scorePoiQuality(poi: Poi, tags: string[], warnings: string[]): number {
  let score = 72;
  if (tags.includes("local_feature")) score += 12;
  if (tags.includes("budget_friendly")) score += 6;
  if (tags.includes("has_coordinates")) score += 4;
  if ((poi.meituanRating ?? 0) >= 4.6) score += 4;
  if (tags.includes("low_value_chain")) score -= 24;
  if (tags.includes("generic_service")) score -= 35;
  if (!isExecutablePoi(poi)) score -= 45;
  score -= warnings.length * 10;
  return Math.max(0, Math.min(100, score));
}

function isExplicitlyRequestedBrand(brand: string, requirements: Requirements): boolean {
  const text = getRequirementText(requirements);
  return new RegExp(`(想去|要去|就去|指定|喜欢|可以).{0,12}${escapeRegExp(brand)}`, "i").test(text);
}

export function isExplicitlyRejectedBrand(brand: string, requirements: Requirements): boolean {
  const text = getRequirementText(requirements);
  return new RegExp(`(不要|不想去|不去|别去|避开|少推荐|拒绝).{0,12}${escapeRegExp(brand)}`, "i").test(text);
}

function getRequirementText(requirements: Requirements): string {
  return [
    requirements.rawText,
    ...requirements.preferences,
    ...requirements.constraints,
    ...(requirements.userProfile?.rejectedKeywords ?? []),
    ...(requirements.userProfile?.dislikedPoiTypes ?? []),
  ].filter(Boolean).join(" ");
}

function hasConcreteSource(poi: Poi): boolean {
  return inferPoiSource(poi) === "amap" || inferPoiSource(poi) === "local";
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
