import type { Poi, Route } from "../new-agent-a-module/src/agent/types.ts";
import { extractAmapPoiDetails } from "../new-agent-a-module/src/planner/amapPoiDetails.ts";

type AmapPoi = {
  id?: string;
  name?: string;
  type?: string;
  address?: string | string[];
  adname?: string;
  business_area?: string;
  location?: string;
  photos?: Array<{ url?: string }>;
  biz_ext?: {
    rating?: string | number;
    cost?: string | number;
    open_time?: string;
    opentime?: string;
  };
};

type AddPoiLocation = {
  city?: string;
  district?: string;
  lng?: number;
  lat?: number;
};

export type PoiSearchQuery = {
  keyword: string;
  city: string;
  district: string;
};

const AMAP_PLACE_URL = "https://restapi.amap.com/v3/place/text";
const TYPE_KEYWORDS: Record<string, string[]> = {
  "文化体验": ["美术馆", "博物馆", "书店", "展览", "手作"],
  "休闲娱乐": ["室内体验", "桌游", "密室", "VR体验", "电影院"],
  "餐饮正餐": ["本地小吃", "特色餐厅", "简餐", "茶餐厅"],
  "轻食甜饮": ["咖啡", "甜品", "茶馆", "面包店"],
  "户外散步": ["公园", "绿道", "citywalk", "滨海步道"],
  "拍照地标": ["拍照打卡", "创意园", "街区", "地标"],
};
const LOW_VALUE_CHAIN_PATTERN = /瑞幸|luckin|星巴克|starbucks|麦当劳|肯德基|KFC|必胜客|汉堡王|蜜雪冰城|益禾堂|古茗|一点点|茶百道|奈雪|喜茶|霸王茶姬|CoCo|沪上阿姨|绝味鸭脖|正新鸡排|华莱士/i;

function setCors(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function handleOptions(req: any, res: any) {
  if (req.method !== "OPTIONS") return false;
  setCors(res);
  res.status(204).json({});
  return true;
}

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  setCors(res);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body ?? {};
    const route = body.route as Route | undefined;
    const type = typeof body.type === "string" ? body.type : "文化体验";
    const customPrompt = typeof body.customPrompt === "string" ? body.customPrompt.trim() : "";
    const location = body.location && typeof body.location === "object" ? body.location as AddPoiLocation : undefined;
    const requestedLimit = Number(body.limit);
    const limit = Number.isInteger(requestedLimit) ? Math.min(3, Math.max(1, requestedLimit)) : 1;
    const pois = await findPois(type, route, customPrompt, location, limit);
    if (!pois.length) {
      res.status(404).json({ error: "No live poi found" });
      return;
    }
    res.status(200).json(limit > 1 ? { pois } : { poi: pois[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    res.status(500).json({ error: message });
  }
}

export function buildPoiSearchQueries(type: string, customPrompt: string, city: string, district: string): PoiSearchQuery[] {
  const normalizedType = type === "正餐" ? "餐饮正餐" : type;
  const defaults = TYPE_KEYWORDS[normalizedType] ?? TYPE_KEYWORDS["文化体验"];
  const keywords = [...new Set([customPrompt.trim(), ...defaults].filter(Boolean))];
  return keywords.map((keyword) => ({ keyword, city: city.trim(), district: district.trim() }));
}

async function findPois(type: string, route?: Route, customPrompt = "", location?: AddPoiLocation, limit = 1): Promise<Poi[]> {
  const amapKey = process.env.AMAP_API_KEY || process.env.AMAP_WEB_SERVICE_KEY;
  if (!amapKey) return [];

  const city = location?.city?.trim() || "";
  const district = location?.district?.trim() || inferDistrict(route);
  const usedNames = new Set((route?.steps ?? []).map((step) => normalizeName(step.poi.name)));
  const queries = buildPoiSearchQueries(type, customPrompt, city, district);
  const results: Poi[] = [];

  for (const query of queries) {
    const url = new URL(AMAP_PLACE_URL);
    url.searchParams.set("key", amapKey);
    url.searchParams.set("keywords", [query.district, query.keyword].filter(Boolean).join(" "));
    if (query.city) {
      url.searchParams.set("city", query.city);
      url.searchParams.set("citylimit", "true");
    }
    if (Number.isFinite(location?.lng) && Number.isFinite(location?.lat)) {
      url.searchParams.set("location", `${location?.lng},${location?.lat}`);
      url.searchParams.set("sortrule", "distance");
    }
    url.searchParams.set("offset", "20");
    url.searchParams.set("page", "1");
    url.searchParams.set("extensions", "all");

    const response = await fetch(url);
    if (!response.ok) continue;
    const data = await response.json() as { status?: string; pois?: AmapPoi[] };
    if (data.status !== "1" || !Array.isArray(data.pois)) continue;

    const matched = data.pois
      .filter((item) => isUsablePoi(item))
      .filter((item) => !LOW_VALUE_CHAIN_PATTERN.test(`${item.name ?? ""} ${item.type ?? ""}`))
      .filter((item) => item.name && !usedNames.has(normalizeName(item.name)));

    for (const item of matched) {
      if (!item.name) continue;
      const normalizedName = normalizeName(item.name);
      if (usedNames.has(normalizedName)) continue;
      const poi = mapAmapPoi(item, type, query.keyword, district, customPrompt);
      if (!poi) continue;
      usedNames.add(normalizedName);
      results.push(poi);
      if (results.length >= limit) return results;
    }
  }

  return results;
}

function mapAmapPoi(item: AmapPoi, requestedType: string, keyword: string, district: string, customPrompt: string): Poi | null {
  if (!item.name) return null;
  const [lng, lat] = parseLocation(item.location);
  const type = inferPoiType(item, requestedType);
  const details = extractAmapPoiDetails(item);
  const price = details.cost ?? estimatePrice(type);
  const area = item.adname || district;
  const businessArea = normalizeBusinessArea(item.business_area, area);
  return {
    id: `live_added_${item.id || Date.now()}`,
    name: item.name,
    type,
    subType: item.type?.split(";").at(-1) || type,
    address: Array.isArray(item.address) ? item.address.join("") : item.address,
    area,
    businessDistrict: businessArea,
    routeCluster: `live:${area}`,
    price,
    priceLevel: price === 0 ? "免费/现场为准" : `约¥${price}/人`,
    meituanRating: details.meituanRating,
    ratingSource: details.ratingSource,
    tags: [requestedType, keyword].filter(Boolean),
    limits: type === "户外散步" || type === "拍照地标" ? ["预算友好"] : ["室内", "现场为准"],
    fitPeople: ["单人", "情侣", "朋友", "亲子"],
    stayMinutes: estimateStay(type),
    queueLevel: "low",
    distanceLevel: "3-10km",
    mockMeituanUrl: `mock://amap/${item.id || item.name}`,
    reason: buildAddedPoiReason(item.name, type, area, businessArea, customPrompt),
    photoUrl: details.photoUrl,
    photoUrls: details.photoUrls,
    openTime: details.openTime,
    availableTools: ["amapPlaceSearch", "queueCheck", "availabilityCheck"],
    bookingRequired: false,
    weatherSensitive: type === "户外散步" || type === "拍照地标",
    lat,
    lng,
  };
}

export function buildAddedPoiReason(name: string, type: string, area: string, businessArea: string, customPrompt = ""): string {
  const place = businessArea && businessArea !== area ? `${area}${businessArea}一带` : area;
  const activity = type === "户外散步"
    ? "适合放慢节奏散步"
    : type === "轻食甜饮"
      ? "适合在行程中途停下来休息"
      : type === "餐饮正餐"
        ? "可以作为这条路线的正餐安排"
        : type === "拍照地标"
          ? "适合留出时间拍照和慢逛"
          : "适合作为路线里的一段主题体验";
  const preference = customPrompt ? `，也贴合你想要的“${customPrompt}”` : "";
  return `${name}位于${place}，${activity}${preference}。`;
}

function isUsablePoi(item: AmapPoi): boolean {
  const text = `${item.name ?? ""} ${item.type ?? ""}`;
  if (!item.name) return false;
  if (/出入口|停车场|公交站|地铁站|公司|住宅|小区|酒店|医院|学校|培训|银行|厕所|政府|派出所/.test(text)) return false;
  return /餐饮|购物|商场|娱乐|体育休闲|影剧院|风景名胜|科教文化|咖啡|茶艺|甜品|美术馆|博物馆|书店|公园|生活服务/.test(text);
}

function inferDistrict(route?: Route): string {
  const first = route?.steps?.find((step) => step.poi.area || step.poi.businessDistrict)?.poi;
  return first?.area || first?.businessDistrict || "";
}

function inferPoiType(item: AmapPoi, requestedType: string): string {
  const text = `${item.name ?? ""} ${item.type ?? ""}`;
  if (/咖啡|甜品|茶馆|茶室|奶茶|饮品|面包|下午茶/.test(text)) return "轻食甜饮";
  if (/DIY|diy|手作|陶艺|烘焙|展|美术馆|博物馆|书店|文化|艺术/.test(text)) return "文化体验";
  if (/餐饮|美食|饭|火锅|烧烤|餐厅|小吃|酒楼|菜馆/.test(text)) return "餐饮正餐";
  if (/公园|步道|绿道|海滨|散步|citywalk/i.test(text)) return "户外散步";
  if (/拍照|打卡|地标|夜景|创意园|街区/.test(text)) return "拍照地标";
  if (/娱乐|商场|电影|KTV|密室|桌游|电玩城|乐园|VR/i.test(text)) return "休闲娱乐";
  return requestedType;
}

function estimatePrice(type: string): number {
  if (type === "户外散步" || type === "拍照地标") return 0;
  if (type === "轻食甜饮") return 42;
  if (type === "餐饮正餐") return 88;
  return 68;
}

function estimateStay(type: string): number {
  if (type === "餐饮正餐") return 80;
  if (type === "轻食甜饮") return 45;
  if (type === "文化体验") return 75;
  if (type === "休闲娱乐") return 90;
  return 60;
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

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "");
}
