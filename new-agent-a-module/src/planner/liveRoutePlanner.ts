import type { Poi, Requirements, Route } from "../agent/types.ts";
import { buildRoute } from "./simpleRoutePlanner.ts";
import { estimateRouteMinutes, estimateTravelMinutesFromCurrentLocation, getDurationWindow, getVenueComplexKey, isPoiNearRequestedDistrict, normalizePoiForPlanning } from "./routeQualityRules.ts";
import { evaluateRouteQuality } from "./routeQualityCheck.ts";
import { getCategoryKey } from "./poiNormalizer.ts";
import { extractAmapPoiDetails } from "./amapPoiDetails.ts";

interface LiveRouteOptions {
  excludeIds?: string[];
  timeoutMs?: number;
}

interface AmapPoi {
  id?: string;
  name?: string;
  type?: string;
  typecode?: string;
  address?: string | string[];
  adname?: string;
  business_area?: string;
  location?: string;
  photos?: Array<{
    url?: string;
  }>;
  biz_ext?: {
    rating?: string | number;
    cost?: string | number;
    open_time?: string;
    opentime?: string;
  };
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const DEFAULT_TIMEOUT_MS = 15000;
const AMAP_PLACE_URL = "https://restapi.amap.com/v3/place/text";
const LOW_VALUE_CHAIN_PATTERN = /瑞幸|luckin|星巴克|starbucks|麦当劳|肯德基|KFC|必胜客|汉堡王|蜜雪冰城|益禾堂|古茗|一点点|茶百道|奈雪|喜茶|霸王茶姬|CoCo|沪上阿姨|绝味鸭脖|正新鸡排|华莱士/i;

const DISTRICT_PATTERN = /([\u4e00-\u9fff]{2,6}(?:区|县|市))/g;
const DEFAULT_MODEL = "deepseek-v4-flash";
const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";

export async function buildLiveRoute(
  requirements: Requirements,
  theme: string,
  options: LiveRouteOptions = {}
): Promise<{ route: Route; candidates: Poi[]; keywords: string[] } | null> {
  return withTimeout(buildLiveRouteInner(requirements, theme, options), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
}

async function buildLiveRouteInner(
  requirements: Requirements,
  theme: string,
  options: LiveRouteOptions
): Promise<{ route: Route; candidates: Poi[]; keywords: string[] } | null> {
  const keywords = buildSearchKeywords(requirements, theme);
  const excludeIds = new Set(options.excludeIds ?? []);
  const results = await Promise.all(keywords.map((keyword) => searchAmap(keyword, requirements)));
  const allResults = [...results];

  // 如果第一次搜索候选太少，用通用兜底关键词再搜一轮
  const merged = uniquePois(allResults.flat());
  if (merged.length < 3 && requirements.district) {
    const fallbackKeywords = buildFallbackSearchKeywords(requirements);
    const fallbackResults = await Promise.all(fallbackKeywords.map((kw) => searchAmap(kw, requirements)));
    allResults.push(...fallbackResults);
  }

  const candidates = diversifyCandidates(uniquePois(allResults.flat()), requirements)
    .filter((poi) => !excludeIds.has(poi.id))
    .slice(0, 48);

  // 如果候选池中吃喝类过多（>60%），补充搜索非吃喝类关键词
  const foodDrinkRatio = candidates.filter((p) => isFoodOrDrinkLike(p)).length / Math.max(1, candidates.length);
  if (candidates.length >= 4 && foodDrinkRatio > 0.6 && requirements.district) {
    const balanceKeywords = buildBalancedSearchKeywords(requirements);
    const balanceResults = await Promise.all(balanceKeywords.map((kw) => searchAmap(kw, requirements)));
    const balanceCandidates = uniquePois(balanceResults.flat()).filter((poi) => !excludeIds.has(poi.id) && !isFoodOrDrinkLike(poi));
    // 把非吃喝候选混入原候选池
    const existingIds = new Set(candidates.map((p) => p.id));
    for (const p of balanceCandidates) {
      if (!existingIds.has(p.id)) candidates.push(p);
    }
  }

  if (candidates.length < 2) return null;
  const route = ensureLiveRouteHasTargetStops(buildRoute(requirements, candidates, theme), candidates, requirements);
  if (route.steps.length < 2) return null;
  if (!isRouteGoodEnough(route)) {
    route.recommendationReasons = [
      "这次优先使用实时地点结果来组路线；如果区域或预算比较窄，会先保证路线真实可去、顺路好执行。",
      ...(route.recommendationReasons ?? []).slice(0, 3)
    ];
  }
  await enrichRouteReasons(route, requirements, theme);
  return { route, candidates, keywords };
}

function ensureLiveRouteHasTargetStops(route: Route, candidates: Poi[], requirements: Requirements): Route {
  const targetStops = requirements.durationHours <= 2.5 ? 3 : 4;
  if (route.steps.length >= targetStops) return route;

  const selected = rebalanceLiveSelectedStops([...route.steps], candidates, requirements);
  fillLiveSupplementStops(selected, candidates, requirements, targetStops, false);
  fillLiveSupplementStops(selected, candidates, requirements, targetStops, true);

  if (selected.length === route.steps.length) return route;

  const nextRoute: Route = compactLiveRouteToWindow({
    ...route,
    steps: selected.map((step, index) => ({
      ...step,
      order: index + 1,
      role: inferLiveRouteRole(step.poi, index),
    })),
  }, requirements);
  nextRoute.totalMinutes = estimateRouteMinutes(nextRoute.steps);
  nextRoute.totalBudget = nextRoute.steps.reduce((sum, step) => sum + step.poi.price, 0);
  const quality = evaluateRouteQuality(nextRoute, requirements);
  nextRoute.qualityScore = quality.score;
  nextRoute.warnings = quality.warnings;
  nextRoute.debugReasons = [...(route.debugReasons ?? []), ...quality.debugReasons, "live_route_extended_to_target"];
  nextRoute.qualityIssues = quality.issues;
  nextRoute.recommendationReasons = [
    `本次优先排成 ${nextRoute.steps.length} 站，让行程更完整。`,
    ...(route.recommendationReasons ?? []),
  ].slice(0, 4);
  return nextRoute;
}

function fillLiveSupplementStops(
  selected: Route["steps"],
  candidates: Poi[],
  requirements: Requirements,
  targetStops: number,
  allowFoodDrinkOverflow: boolean
): void {
  const maxMinutes = getDurationWindow(requirements).max;
  const rankedCandidates = [...candidates].sort((a, b) => scoreLiveSupplementCandidate(b, selected, requirements) - scoreLiveSupplementCandidate(a, selected, requirements));
  for (const candidate of rankedCandidates) {
    if (selected.length >= targetStops) break;
    if (selected.some((step) => step.poi.id === candidate.id || isSameLiveVenue(step.poi, candidate))) continue;
    if (!requirements.allowCrossDistrict && requirements.district && !matchesDistrictText(candidate, requirements.district)) continue;
    if (wouldRepeatLowValueBrand(selected.map((step) => step.poi), candidate)) continue;
    // 避免同类体验点连续出现（如两个公园挨着）
    if (!allowFoodDrinkOverflow && selected.length > 0) {
      const lastCat = selected.at(-1)!.poi.categoryKey || getCategoryKey(selected.at(-1)!.poi);
      const candCat = candidate.categoryKey || getCategoryKey(candidate);
      if (lastCat === candCat) continue;
    }
    if (!allowFoodDrinkOverflow && isFoodOrDrinkLike(candidate) && selected.filter((step) => isFoodOrDrinkLike(step.poi)).length >= 2) continue;
    const preview = [...selected, buildLiveSupplementStep(candidate, selected.length, targetStops)];
    if (!allowFoodDrinkOverflow && estimateRouteMinutes(preview) > maxMinutes + 45) continue;
    selected.push({
      ...preview.at(-1)!,
    });
  }
}

function buildLiveSupplementStep(candidate: Poi, index: number, targetStops: number): Route["steps"][number] {
  return {
    order: index + 1,
    role: inferLiveRouteRole(candidate, index),
    templateRole: index >= targetStops - 1 ? "ending" : "support",
    poi: candidate,
    note: candidate.reason,
    roleReason: `「${candidate.name}」作为补充停留点，让路线接近 ${targetStops} 站。`,
  };
}

function compactLiveRouteToWindow(route: Route, requirements: Requirements): Route {
  const maxMinutes = getDurationWindow(requirements).max;
  let steps = route.steps;
  let total = estimateRouteMinutes(steps);
  if (total <= maxMinutes) return route;

  steps = steps.map((step) => {
    if (total <= maxMinutes) return step;
    const minStay = getMinimumLiveStayMinutes(step.poi);
    const reducible = Math.max(0, step.poi.stayMinutes - minStay);
    const reduction = Math.min(reducible, total - maxMinutes);
    total -= reduction;
    return {
      ...step,
      poi: {
        ...step.poi,
        stayMinutes: step.poi.stayMinutes - reduction,
      },
    };
  });

  return { ...route, steps };
}

function getMinimumLiveStayMinutes(poi: Poi): number {
  if (poi.type === "餐饮正餐") return 45;
  if (poi.type === "轻食甜饮") return 20;
  if (poi.type === "休闲娱乐") return 45;
  if (poi.type === "文化体验") return 30;
  return 20;
}

function scoreLiveSupplementCandidate(candidate: Poi, selected: Route["steps"], requirements: Requirements): number {
  let score = candidate.qualityScore ?? 50;
  const preview = [...selected, buildLiveSupplementStep(candidate, selected.length, 4)];
  const routeMinutes = estimateRouteMinutes(preview);
  const maxMinutes = getDurationWindow(requirements).max;
  score -= Math.max(0, routeMinutes - maxMinutes) * 0.8;
  if (requirements.district && matchesDistrictText(candidate, requirements.district)) score += 20;
  if (!isFoodOrDrinkLike(candidate)) score += 18;
  if (selected.some((step) => isSameLiveVenue(step.poi, candidate))) score -= 100;
  if (isFoodOrDrinkLike(candidate) && selected.filter((step) => isFoodOrDrinkLike(step.poi)).length >= 2) score -= 80;
  // 商场餐厅加分（名字带商场名表示不是街边小店）
  if (/万象城|COCO Park|cocopark|壹方城|海岸城|海雅缤纷|卓悦|领展|皇庭|KK one|KK ONE|万科里|万科广场|天虹|星河|宝能|益田|京基|茂业|华强北|九方/i.test(candidate.name)) score += 24;
  return score;
}

function rebalanceLiveSelectedStops(
  steps: Route["steps"],
  candidates: Poi[],
  requirements: Requirements
): Route["steps"] {
  const result: Route["steps"] = [];
  for (const step of steps) {
    const foodDrinkCount = result.filter((item) => isFoodOrDrinkLike(item.poi)).length;
    const shouldReplace = result.some((item) => isSameLiveVenue(item.poi, step.poi))
      || (isFoodOrDrinkLike(step.poi) && foodDrinkCount >= 2);
    if (!shouldReplace) {
      result.push(step);
      continue;
    }
    const replacement = candidates.find((candidate) =>
      !isFoodOrDrinkLike(candidate)
      && !result.some((item) => item.poi.id === candidate.id || isSameLiveVenue(item.poi, candidate))
      && (!requirements.district || requirements.allowCrossDistrict || matchesDistrictText(candidate, requirements.district))
    );
    result.push(replacement ? { ...step, poi: replacement, note: replacement.reason } : step);
  }
  return result;
}

function inferLiveRouteRole(poi: Poi, index: number): Route["steps"][number]["role"] {
  if (poi.type === "餐饮正餐") return "meal";
  if (poi.type === "轻食甜饮") return "break";
  if (index >= 3) return "ending";
  return "activity";
}

function wouldRepeatLowValueBrand(existing: Poi[], candidate: Poi): boolean {
  const brand = getLowValueChainBrand(`${candidate.name} ${candidate.type} ${candidate.subType}`);
  if (!brand) return false;
  return existing.some((poi) => {
    const existingBrand = getLowValueChainBrand(`${poi.name} ${poi.type} ${poi.subType}`);
    return existingBrand?.toLowerCase() === brand.toLowerCase();
  });
}

function isFoodOrDrinkLike(poi: Poi): boolean {
  const text = `${poi.name} ${poi.type} ${poi.subType} ${poi.tags.join(" ")}`;
  return /餐饮正餐|轻食甜饮|咖啡|甜品|茶饮|奶茶|饮品|餐|饭|美食|小吃|火锅|烧烤|bistro|酒馆/i.test(text);
}

function isSameLiveVenue(left: Poi, right: Poi): boolean {
  if (left.id === right.id) return true;
  const leftKey = getVenueNameKey(left.name);
  const rightKey = getVenueNameKey(right.name);
  if (leftKey.length >= 3 && rightKey.length >= 3 && (leftKey === rightKey || leftKey.includes(rightKey) || rightKey.includes(leftKey))) return true;
  return getVenueComplexKey(left.name) === getVenueComplexKey(right.name);
}

function getLowValueChainBrand(text: string): string | undefined {
  const brands = ["瑞幸", "luckin", "星巴克", "starbucks", "麦当劳", "肯德基", "KFC", "必胜客", "汉堡王", "蜜雪冰城", "益禾堂", "古茗", "一点点", "茶百道", "奈雪", "喜茶", "霸王茶姬", "CoCo", "沪上阿姨", "绝味鸭脖", "正新鸡排", "华莱士"];
  return brands.find((brand) => new RegExp(brand, "i").test(text));
}

function buildSearchKeywords(requirements: Requirements, theme: string): string[] {
  const district = normalizeDistrict(requirements.district) ?? extractDistrict(requirements.rawText);
  const areaPrefix = district ? `${district} ` : `${requirements.city || ""} `;
  const themeKeywords: Record<string, string[]> = {
    "小众拍照吃货盒": ["小众咖啡", "拍照打卡", "甜品咖啡", "创意餐厅", "艺术空间", "文创园", "本地小吃", "夜市"],
    "夜景微醺盒": ["夜景餐厅", "bistro", "精酿酒馆", "简餐", "夜景打卡", "露台酒吧", "livehouse", "清吧"],
    "雨天室内回血盒": ["购物中心", "密室逃脱", "电影院", "DIY手工", "咖啡馆", "展览", "桌游", "陶艺"],
    "亲子轻松放电盒": ["亲子乐园", "儿童体验", "亲子餐厅", "室内游乐场", "公园", "自然教育", "儿童书店", "科学馆"],
    "城市散步疗愈盒": ["书店咖啡", "公园散步", "美术馆", "创意园", "citywalk", "海滨栈道", "安静咖啡", "绿道"],
    "省钱快乐盒": ["夜市", "美食街", "本地小吃", "市集", "免费公园", "平价美食", "老字号", "博物馆", "街区散步"],
    "周末轻松探索盒": ["休闲娱乐", "咖啡馆", "美食", "拍照打卡", "购物中心", "公园", "轻体验", "散步"]
  };
  const fromTheme = themeKeywords[theme] ?? themeKeywords["周末轻松探索盒"];
  const fromPrefs = requirements.preferences.slice(0, 4).map((preference) => `${preference} 周末`);
  const fromProfile = buildProfileKeywords(requirements);
  const fromPeople = buildPeopleKeywords(requirements);
  const fromBudget = buildBudgetKeywords(requirements);
  const mustHave = [
    ...fromProfile.slice(0, 3),
    ...fromTheme.slice(0, 4),
    ...fromPrefs,
    ...fromPeople.slice(0, 2),
    ...fromBudget.slice(0, 1),
  ];
  const weighted = [...mustHave, ...fromProfile, ...fromPeople, ...fromBudget, ...fromTheme];
  return [...new Set(weighted.map((keyword) => `${areaPrefix}${keyword}`))].slice(0, 12);
}

/** 兜底搜索关键词：当日标关键词搜不到结果时使用 */
function buildFallbackSearchKeywords(requirements: Requirements): string[] {
  const district = normalizeDistrict(requirements.district) ?? extractDistrict(requirements.rawText);
  const areaPrefix = district ? `${district} ` : `${requirements.city || ""} `;
  const fallbacks = [
    "休闲娱乐", "散步", "公园", "咖啡馆", "美食",
    "购物中心", "创意园", "景点", "网红打卡", "书店",
  ];
  // 根据人群追加
  if (requirements.peopleType === "亲子") fallbacks.push("亲子乐园", "儿童公园");
  if (requirements.peopleType === "情侣") fallbacks.push("约会", "氛围");
  if (requirements.preferences.includes("拍照") || requirements.preferences.includes("咖啡")) fallbacks.push("拍照打卡");
  return [...new Set(fallbacks.map((kw) => `${areaPrefix}${kw}`))].slice(0, 6);
}

/** 平衡搜索：当候选池吃喝过多时，补充非吃喝类候选 */
function buildBalancedSearchKeywords(requirements: Requirements): string[] {
  const district = normalizeDistrict(requirements.district) ?? extractDistrict(requirements.rawText);
  const areaPrefix = district ? `${district} ` : `${requirements.city || ""} `;
  const keywords = [
    "公园", "博物馆", "美术馆", "书店", "创意园", "展览",
    "步行街", "城市广场", "图书馆", "文化馆",
  ];
  if (requirements.peopleType === "亲子") keywords.push("儿童公园", "科学馆");
  if (requirements.peopleType === "情侣") keywords.push("夜景", "约会圣地");
  if (requirements.preferences.includes("拍照")) keywords.push("网红打卡", "地标");
  return [...new Set(keywords.map((kw) => `${areaPrefix}${kw}`))].slice(0, 5);
}

async function searchAmap(keyword: string, requirements: Requirements): Promise<Poi[]> {
  const amapKey = process.env.AMAP_API_KEY || process.env.AMAP_WEB_SERVICE_KEY;
  if (!amapKey) {
    console.error('[AMap] API Key 未配置，请在环境变量中设置 AMAP_API_KEY 或 AMAP_WEB_SERVICE_KEY');
    return [];
  }
  const url = new URL(AMAP_PLACE_URL);
  url.searchParams.set("key", amapKey);
  url.searchParams.set("keywords", keyword);
  if (requirements.city) {
    url.searchParams.set("city", requirements.city);
    url.searchParams.set("citylimit", "true");
  } else if (requirements.currentLocation) {
    url.searchParams.set("location", `${requirements.currentLocation.lng},${requirements.currentLocation.lat}`);
    url.searchParams.set("sortrule", "distance");
  }
  url.searchParams.set("offset", "15");
  url.searchParams.set("page", "1");
  url.searchParams.set("extensions", "all");

  try {
    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(fetchTimeout);
    if (!response.ok) return [];
    const data = await response.json() as { status?: string; pois?: AmapPoi[] };
    if (data.status !== "1" || !Array.isArray(data.pois)) return [];
    const mapped = data.pois
      .filter((item) => isUsableAmapPoi(item))
      .filter((item) => isNotLowValueChain(item, requirements))
      .map((item, index) => poiFromAmap(item, index, keyword, requirements))
      .filter((poi): poi is Poi => Boolean(poi))
      .filter((poi) => isPeopleAppropriatePoi(poi, requirements));
    const strict = mapped.filter((poi) => matchesGeoIntent(poi, requirements));
    const relaxed = mapped.filter((poi) => !strict.some((item) => item.id === poi.id) && matchesRelaxedGeoIntent(poi, requirements));
    return uniquePois([...strict, ...relaxed]);
  } catch {
    return [];
  }
}

function matchesGeoIntent(poi: Poi, requirements: Requirements): boolean {
  if (!requirements.district) return true;
  if (!requirements.allowCrossDistrict) return matchesDistrictText(poi, requirements.district);
  return isPoiNearRequestedDistrict(poi, requirements.district, 18)
    || (Boolean(requirements.currentLocation) && estimateTravelMinutesFromCurrentLocation(poi, requirements.currentLocation) <= 60);
}

function matchesRelaxedGeoIntent(poi: Poi, requirements: Requirements): boolean {
  if (!requirements.district) return true;
  if (matchesDistrictText(poi, requirements.district)) return true;
  const nearbyKm = requirements.allowCrossDistrict ? 28 : 14;
  return isPoiNearRequestedDistrict(poi, requirements.district, nearbyKm)
    || (Boolean(requirements.currentLocation) && estimateTravelMinutesFromCurrentLocation(poi, requirements.currentLocation) <= 75);
}

function matchesDistrictText(poi: Poi, district: string): boolean {
  const short = district.replace(/区$/, "");
  return [poi.area, poi.businessDistrict, poi.routeCluster, poi.address]
    .filter(Boolean)
    .some((value) => String(value).includes(short));
}

function isPeopleAppropriateAmapPoi(item: AmapPoi, requirements: Requirements): boolean {
  const text = `${item.name || ""} ${item.type || ""}`;
  if (requirements.peopleType === "亲子") return true;
  return !/儿童乐园|亲子|儿童|早教|少儿|母婴/.test(text);
}

function isPeopleAppropriatePoi(poi: Poi, requirements: Requirements): boolean {
  const text = `${poi.name} ${poi.type} ${poi.subType} ${poi.tags.join(" ")} ${poi.reason}`;
  if (requirements.peopleType === "亲子") return true;
  return !/儿童乐园|亲子|儿童|早教|少儿|母婴/.test(text);
}

function isUsableAmapPoi(item: AmapPoi): boolean {
  const text = `${item.name || ""} ${item.type || ""}`;
  if (!item.name) return false;
  // 过滤掉纯导航点、出入口等非消费场所
  if (/节点$|NEXUS节点|导航点|途经点|定位点|打卡点$|集合点$|服务点$|入口$|出入口$|^出入口/.test(item.name)) return false;
  // 过滤掉烟草/赌博等不适宜场所
  if (/烟草|香烟|雪茄|电子烟|烟酒|赌博/.test(text)) return false;
  // 过滤掉街边低端快餐/小吃店
  if (/快餐|盒饭|便当|外卖|大排档|路边摊|小吃摊|食堂|饭堂|小档口|小炒/.test(text)) return false;
  // 过滤掉街边早餐/面食/麻辣烫等低端小馆
  if (/肠粉|米粉|米线|螺蛳粉|刀削面|热干面|炸酱面|包子|馒头|饺子馆|馄饨|粥店|卤味|卤肉|麻辣烫|冒菜|串串香/.test(text)) return false;
  // 过滤掉政府机构、基础设施、住宅办公等
  if (/政府|派出所|停车场|收费站|公交站|地铁站|道路|路口|出入口|住宅|小区|写字楼|公寓|宿舍|医院|药房|诊所|学校|幼儿园|培训机构|驾校|维修|洗车|汽修|物流|仓库|中介|房产|殡仪|陵园/.test(text)) return false;
  // 过滤掉照相馆/婚纱摄影等非出游点，但保留汉服体验
  if (/照相|摄影|写真|证件照|婚纱/.test(text) && !/汉服/.test(text)) return false;
  // 过滤掉印刷/快印/广告等非出游场所
  if (/快印|印刷|广告|图文/.test(text)) return false;
  // 过滤掉低端快餐/便利店
  if (/沙县小吃|兰州拉面|黄焖鸡|隆江猪脚饭|华莱士|正新鸡排|蜜雪冰城|益禾堂|古茗|一点点|绝味鸭脖|便利店/.test(text)) return false;
  // 过滤掉系统类目
  if (/地名地址信息|道路附属设施|交通设施服务|政府机构/.test(text)) return false;
  // 只要不是明显不适合出游的，都放进来
  return true;
}

function isNotLowValueChain(item: AmapPoi, requirements: Requirements): boolean {
  const text = `${item.name || ""} ${item.type || ""}`;
  if (!LOW_VALUE_CHAIN_PATTERN.test(text)) return true;
  const explicitText = `${requirements.rawText} ${requirements.preferences.join(" ")} ${requirements.constraints.join(" ")}`;
  // 连锁品牌默认过滤（在哪儿都能喝/吃，出去玩没必要）
  if (/(想去|要去|就去|指定|喜欢|可以|来杯).{0,12}(瑞幸|luckin|星巴克|starbucks|麦当劳|肯德基|KFC|必胜客|汉堡王|蜜雪冰城|益禾堂|古茗|一点点|茶百道|奈雪|喜茶|霸王茶姬|CoCo|沪上阿姨|绝味鸭脖|正新鸡排|华莱士)/i.test(explicitText)) {
    return true;
  }
  return false;
}

function poiFromAmap(item: AmapPoi, index: number, keyword: string, requirements: Requirements): Poi | null {
  if (!item.name) return null;
  const [lng, lat] = parseLocation(item.location);
  const type = inferPoiType(item, keyword);
  const area = item.adname || normalizeDistrict(requirements.district) || extractDistrict(requirements.rawText) || requirements.city || "";

  // Extract Amap category fields from raw API response
  const amapCategoryPath = item.type || undefined;
  const categorySegments = (item.type || "").split(";").filter(Boolean);
  const codeSegments = (item.typecode || "").split(";").filter(Boolean);
  const amapCategoryName = categorySegments.length > 1 ? categorySegments.at(-1) : undefined;
  const amapCategoryCode = codeSegments.length > 1 ? codeSegments.at(-1) : (codeSegments[0] || undefined);
  const details = extractAmapPoiDetails(item);

  return normalizePoiForPlanning({
    id: `live_route_${item.id || `${Date.now()}_${index}`}`,
    name: item.name,
    type,
    subType: inferSubType(item, type),
    address: Array.isArray(item.address) ? item.address.join("") : item.address,
    area,
    businessDistrict: normalizeBusinessArea(item.business_area, area),
    routeCluster: `live:${area}`,
    price: simulatePrice(type, requirements),
    meituanRating: details.meituanRating,
    ratingSource: details.ratingSource,
    tags: buildTags(type, keyword, requirements),
    limits: buildLimits(type, keyword),
    fitPeople: buildFitPeople(type, keyword),
    stayMinutes: simulateStayMinutes(type),
    queueLevel: index % 4 === 0 ? "medium" : "low",
    distanceLevel: "3-10km",
    mockMeituanUrl: `mock://amap/${item.id || index}`,
    reason: buildFallbackReason(item, type, keyword, requirements),
    photoUrl: details.photoUrl,
    photoUrls: details.photoUrls,
    openTime: details.openTime,
    blindBoxThemes: requirements.blindBoxTheme ? [requirements.blindBoxTheme] : undefined,
    availableTools: ["amapPlaceSearch", "queueCheck", "availabilityCheck"],
    bookingRequired: false,
    weatherSensitive: !buildLimits(type, keyword).includes("室内"),
    priorityScore: buildPriorityScore(type, keyword, requirements, index),
    lat,
    lng,
    amapCategoryPath,
    amapCategoryName,
    amapCategoryCode
  }, requirements);
}

async function enrichRouteReasons(route: Route, requirements: Requirements, theme: string): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return;

  try {
    const descriptions = await withTimeout(
      askModelForPoiDescriptions(route, requirements, theme, apiKey),
      8000
    );
    if (!descriptions) return;

    for (const step of route.steps) {
      const description = descriptions[step.poi.id];
      if (!description) continue;
      step.poi.reason = description;
      step.note = description;
    }
  } catch {
    return;
  }
}

async function askModelForPoiDescriptions(
  route: Route,
  requirements: Requirements,
  theme: string,
  apiKey: string
): Promise<Record<string, string>> {
  const baseUrl = process.env.OPENAI_BASE_URL || process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.OPENAI_MODEL || process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "你是 WeekendBuddy 的本地生活路线文案助手。",
            "请基于高德地点检索结果，为每个 POI 写一句适合展示在路线卡片上的中文简介。",
            "只返回严格 JSON，对象 key 必须是 POI id，value 是 20-35 字中文简介。",
            "不要编造具体优惠、排队、评价排名或未给出的事实。",
            "简介要结合盲盒风格、地点类型、区域和用户偏好，说明为什么适合这一站。"
          ].join("\n")
        },
        {
          role: "user",
          content: JSON.stringify({
            theme,
            requirements: {
              rawText: requirements.rawText,
              preferences: requirements.preferences,
              constraints: requirements.constraints,
              peopleType: requirements.peopleType
            },
            route: route.steps.map((step) => ({
              id: step.poi.id,
              name: step.poi.name,
              type: step.poi.type,
              subType: step.poi.subType,
              area: step.poi.area,
              businessDistrict: step.poi.businessDistrict,
              tags: step.poi.tags,
              fallbackReason: step.poi.reason
            }))
          })
        }
      ]
    })
  });

  if (!response.ok) return {};
  const data = await response.json() as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) return {};
  const parsed = safeParseJson(content);
  if (!parsed || typeof parsed !== "object") return {};

  return Object.fromEntries(
    Object.entries(parsed as Record<string, unknown>)
      .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
      .map(([key, value]) => [key, String(value).trim()])
  );
}

function buildFallbackReason(item: AmapPoi, type: string, keyword: string, requirements: Requirements): string {
  const area = item.adname || normalizeDistrict(requirements.district) || extractDistrict(requirements.rawText) || requirements.city || "";
  if (type === "轻食甜饮") return `${area}中途休息的咖啡甜点店。`;
  if (type === "餐饮正餐") return `${area}的餐饮选择。`;
  if (type === "文化体验") return `${area}的文化体验点，适合看展、逛书店或手作体验。`;
  if (type === "户外散步") return `${area}的散步好去处。`;
  if (type === "拍照地标") return `${area}的拍照打卡点。`;
  if (/电影|IMAX|影城/.test(item.name || item.type || keyword)) return `${area}的影院，适合室内休闲。`;
  return `${area}的休闲去处。`;
}

function safeParseJson(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  }
}

function inferPoiType(item: AmapPoi, keyword: string): string {
  const placeText = `${item.type || ""} ${item.name || ""}`;
  const nameText = item.name || "";
  // 只用 placeText（高德类型+名字），不加搜索关键词，避免关键词干扰分类
  if (/酒吧|清吧|lounge|club|bistro|精酿|livehouse/i.test(placeText)) return "休闲娱乐";
  if (/DIY|diy|手作|手工|陶艺|银饰|香薰|烘焙|画画|绘画|Tufting/i.test(placeText)) return "文化体验";
  if (/咖啡|甜品|茶馆|茶室|奶茶|饮品|面包|下午茶/.test(nameText)) return "轻食甜饮";
  if (/餐饮|美食|饭|火锅|烧烤|餐厅|小吃|酒楼|素食|菜馆/.test(placeText)) return "餐饮正餐";
  if (/咖啡|甜品|茶|奶茶|饮品|面包/.test(placeText)) return "轻食甜饮";
  if (/展览|展馆|会展|展厅|美术馆|博物馆|书店|文化|手作|手工|DIY|diy|陶艺/.test(placeText)) return "文化体验";
  // 注意：必须排除"购物公园"这种名字带公园但不是公园的
  if (/(?<!购物)公园|步道|绿地|海滨|散步|citywalk|体育中心|体育馆|体育场/i.test(placeText)) return "户外散步";
  if (/娱乐|商场|乐园|电影|KTV|密室|桌游|电玩城|亲子|棋牌|台球|健身|电竞|网吧|网咖|足浴|按摩|洗浴|汗蒸|剧本杀|私人影院|轰趴|游泳|羽毛球|露营|采摘/.test(placeText)) return "休闲娱乐";
  if (/拍照|打卡|地标|夜景|广场/.test(placeText)) return "拍照地标";
  return "休闲娱乐";
}

function inferSubType(item: AmapPoi, type: string): string {
  const rawType = item.type?.split(";").at(-1);
  return rawType || type;
}

function simulatePrice(type: string, requirements: Requirements): number {
  const budgetFactor = requirements.budgetMax <= 150 ? 0.75 : requirements.budgetMax >= 350 ? 1.15 : 1;
  if (type === "餐饮正餐") return Math.round(90 * budgetFactor);
  if (type === "轻食甜饮") return Math.round(38 * budgetFactor);
  if (type === "休闲娱乐") return Math.round(80 * budgetFactor);
  return 0;
}

function simulateStayMinutes(type: string): number {
  if (type === "餐饮正餐") return 80;
  if (type === "轻食甜饮") return 45;
  if (type === "文化体验") return 90;
  if (type === "休闲娱乐") return 100;
  return 70;
}

function buildTags(type: string, keyword: string, requirements: Requirements): string[] {
  const tags = new Set<string>(requirements.preferences.slice(0, 4));
  if (type === "餐饮正餐") tags.add("美食");
  if (type === "轻食甜饮") tags.add(keyword.includes("咖啡") ? "咖啡" : "甜品");
  if (type === "文化体验") tags.add("文化");
  if (type === "户外散步") tags.add("户外");
  if (type === "休闲娱乐") tags.add("解压");
  if (/拍照|打卡/.test(keyword)) tags.add("拍照");
  if (/小众/.test(keyword)) tags.add("小众");
  if (/海|滨海|栈道|沙滩/.test(keyword)) tags.add("看海");
  if (/亲子|儿童|自然教育/.test(keyword)) tags.add("亲子");
  if (requirements.peopleType === "情侣") tags.add("氛围");
  if (requirements.peopleType === "朋友") tags.add("互动");
  if (requirements.peopleType === "单人") tags.add("安静");
  return [...tags].slice(0, 6);
}

function buildLimits(type: string, keyword: string): string[] {
  const limits = new Set<string>(["预算友好"]);
  if (/室内|商场|展览|咖啡|娱乐|书店|美术馆|博物馆/.test(keyword) || ["餐饮正餐", "轻食甜饮", "文化体验", "休闲娱乐"].includes(type)) {
    limits.add("室内");
    limits.add("雨天可去");
  } else {
    limits.add("室外");
  }
  return [...limits];
}

function parseLocation(location?: string): [number | undefined, number | undefined] {
  const [lngText, latText] = (location || "").split(",");
  const lng = Number(lngText);
  const lat = Number(latText);
  return [Number.isFinite(lng) ? lng : undefined, Number.isFinite(lat) ? lat : undefined];
}

function normalizeBusinessArea(value: string | undefined, area: string): string {
  if (!value || value === "[]") return area;
  return value;
}

function extractDistrict(text: string): string | undefined {
  const match = text.match(DISTRICT_PATTERN);
  return match?.[0];
}

function normalizeDistrict(value?: string): string | undefined {
  if (!value) return undefined;
  const match = value.match(DISTRICT_PATTERN);
  return match?.[0];
}

function buildPeopleKeywords(requirements: Requirements): string[] {
  if (requirements.peopleType === "亲子") return ["亲子", "儿童友好", "少走路", "自然教育", "亲子餐厅"];
  if (requirements.peopleType === "情侣") return ["约会", "氛围感", "拍照", "安静咖啡", "夜景"];
  if (requirements.peopleType === "朋友") return ["朋友聚会", "互动体验", "好聊天", "桌游", "本地小吃"];
  return ["安静", "书店咖啡", "一个人散步", "美术馆", "公园"];
}

function buildBudgetKeywords(requirements: Requirements): string[] {
  if (requirements.budgetMax <= 150) return ["夜市", "美食街", "本地小吃", "平价", "市集", "免费", "博物馆"];
  if (requirements.budgetMax >= 350) return ["特色体验", "精致餐厅", "小众", "手作", "酒馆"];
  return ["性价比", "咖啡", "轻体验", "商圈"];
}

function buildProfileKeywords(requirements: Requirements): string[] {
  const profile = requirements.userProfile;
  if (!profile) return [];
  const positive = [
    ...(profile.favoritePoiNames ?? []).slice(0, 2),
    ...(profile.likedPoiTypes ?? []).slice(0, 3),
    ...(profile.likedTags ?? []).slice(0, 4),
    ...(profile.favoriteRouteThemes ?? []).slice(0, 2),
  ];
  const negative = new Set([
    ...(profile.dislikedPoiTypes ?? []),
    ...(profile.rejectedKeywords ?? []).map((keyword) => keyword.replace(/^少推荐/, "")),
  ]);
  const pace = profile.preferredRoutePace === "relaxed"
    ? ["轻松", "少走路", "好聊天"]
    : profile.preferredRoutePace === "packed"
      ? ["多点位", "轻体验", "顺路"]
      : [];

  return [...new Set([...positive, ...pace])]
    .filter((keyword) => keyword && !negative.has(keyword))
    .slice(0, 8);
}

function buildFitPeople(type: string, keyword: string) {
  if (/亲子|儿童|乐园|自然教育/.test(keyword)) return ["亲子" as const, "朋友" as const];
  if (/酒|微醺|bistro|夜景/.test(keyword)) return ["单人" as const, "情侣" as const, "朋友" as const];
  if (type === "户外散步" || type === "文化体验" || type === "轻食甜饮") return ["单人" as const, "情侣" as const, "朋友" as const, "亲子" as const];
  if (type === "餐饮正餐") return ["单人" as const, "情侣" as const, "朋友" as const, "亲子" as const];
  return ["单人" as const, "情侣" as const, "朋友" as const, "亲子" as const];
}

function buildPriorityScore(type: string, keyword: string, requirements: Requirements, index: number): number {
  let score = 82 - index;
  const profile = requirements.userProfile;
  if (requirements.budgetMax <= 150 && /免费|平价|公园|本地小吃|夜市|老字号|美食街/.test(keyword)) score += 10;
  if (requirements.peopleType === "亲子" && /亲子|儿童|公园|自然/.test(keyword)) score += 12;
  if (requirements.peopleType === "情侣" && /约会|氛围|夜景|拍照/.test(keyword)) score += 10;
  if (requirements.peopleType === "朋友" && /互动|聚会|体验|桌游|密室/.test(keyword)) score += 10;
  if (requirements.peopleType === "单人" && /安静|书店|咖啡|散步|公园/.test(keyword)) score += 10;
  if (type === "餐饮正餐" && requirements.budgetMax <= 150) score -= 6;
  if (profile?.likedPoiTypes?.includes(type)) score += 16;
  if (profile?.likedTags?.some((tag) => keyword.includes(tag))) score += 10;
  if (profile?.dislikedPoiTypes?.includes(type)) score -= 28;
  if (LOW_VALUE_CHAIN_PATTERN.test(keyword)) score -= 50;
  return score;
}

function diversifyCandidates(pois: Poi[], requirements: Requirements): Poi[] {
  const buckets = new Map<string, Poi[]>();
  for (const poi of pois) {
    const key = `${poi.area || ""}:${poi.type}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(poi);
    buckets.set(key, bucket);
  }

  const salt = Date.now() + Math.round(Math.random() * 10000);
  const rotatedBuckets = [...buckets.values()].map((bucket, bucketIndex) => {
    const offset = bucket.length ? (salt + bucketIndex + hashText(requirements.rawText)) % bucket.length : 0;
    return [...bucket.slice(offset), ...bucket.slice(0, offset)];
  });

  const interleaved: Poi[] = [];
  const maxLength = Math.max(...rotatedBuckets.map((bucket) => bucket.length), 0);
  for (let index = 0; index < maxLength; index += 1) {
    for (const bucket of rotatedBuckets) {
      const poi = bucket[index];
      if (poi) {
        interleaved.push({
          ...poi,
          priorityScore: (poi.priorityScore ?? 50) + Math.random() * 10
        });
      }
    }
  }

  return interleaved;
}

function hashText(text: string): number {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function isRouteGoodEnough(route: Route): boolean {
  const steps = route.steps;
  if (steps.length < 2) return false;
  const venueKeys = steps.map((step) => getVenueNameKey(step.poi.name)).filter((key) => key.length >= 3);
  if (new Set(venueKeys).size !== venueKeys.length) return false;
  if (steps.length >= 3) {
    const uniqueTypes = new Set(steps.map((step) => step.poi.type));
    if (uniqueTypes.size < Math.min(3, steps.length)) return false;
  }
  return true;
}

function uniquePois(pois: Poi[]): Poi[] {
  const seen = new Set<string>();
  return pois.filter((poi) => {
    const keys = [
      poi.name.trim().toLowerCase(),
      getVenueNameKey(poi.name)
    ].filter((key) => key.length >= 3);
    if (keys.some((key) => seen.has(key))) return false;
    keys.forEach((key) => seen.add(key));
    return true;
  });
}

function getVenueNameKey(name: string): string {
  return name
    .replace(/[（(].*?[）)]/g, "")
    .replace(/旗舰店|总店|分店|东区|西区|南区|北区|一期|二期|三期|店|馆|体验|沉浸式|沉浸|实景|剧场|RPG|密室|咖啡|餐厅|书店|中心|购物|公园/gi, "")
    .replace(/[·\s\-_/]/g, "")
    .trim()
    .toLowerCase();
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        timeout = setTimeout(() => resolve(null), timeoutMs);
      })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
