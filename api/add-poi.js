"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../api-src/add-poi.ts
var add_poi_exports = {};
__export(add_poi_exports, {
  buildAddedPoiReason: () => buildAddedPoiReason,
  buildPoiSearchQueries: () => buildPoiSearchQueries,
  default: () => handler
});
module.exports = __toCommonJS(add_poi_exports);

// ../new-agent-a-module/src/planner/amapPoiDetails.ts
function extractAmapPoiDetails(item) {
  const photoUrls = [...new Set((item.photos ?? []).map((photo) => photo.url?.trim()).filter((url) => Boolean(url)))];
  const rating = parseRangeNumber(item.biz_ext?.rating, 0, 5);
  const cost = parseRangeNumber(item.biz_ext?.cost, 0, Number.MAX_SAFE_INTEGER);
  const openTime = [item.biz_ext?.open_time, item.biz_ext?.opentime].find((value) => typeof value === "string" && value.trim())?.trim();
  return {
    photoUrl: photoUrls[0],
    photoUrls: photoUrls.length ? photoUrls : void 0,
    meituanRating: rating,
    ratingSource: rating === void 0 ? void 0 : "amap",
    cost,
    openTime
  };
}
function parseRangeNumber(value, min, max) {
  if (value === void 0 || value === null || value === "") return void 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : void 0;
}

// ../api-src/add-poi.ts
var AMAP_PLACE_URL = "https://restapi.amap.com/v3/place/text";
var TYPE_KEYWORDS = {
  "\u6587\u5316\u4F53\u9A8C": ["\u7F8E\u672F\u9986", "\u535A\u7269\u9986", "\u4E66\u5E97", "\u5C55\u89C8", "\u624B\u4F5C"],
  "\u4F11\u95F2\u5A31\u4E50": ["\u5BA4\u5185\u4F53\u9A8C", "\u684C\u6E38", "\u5BC6\u5BA4", "VR\u4F53\u9A8C", "\u7535\u5F71\u9662"],
  "\u9910\u996E\u6B63\u9910": ["\u672C\u5730\u5C0F\u5403", "\u7279\u8272\u9910\u5385", "\u7B80\u9910", "\u8336\u9910\u5385"],
  "\u8F7B\u98DF\u751C\u996E": ["\u5496\u5561", "\u751C\u54C1", "\u8336\u9986", "\u9762\u5305\u5E97"],
  "\u6237\u5916\u6563\u6B65": ["\u516C\u56ED", "\u7EFF\u9053", "citywalk", "\u6EE8\u6D77\u6B65\u9053"],
  "\u62CD\u7167\u5730\u6807": ["\u62CD\u7167\u6253\u5361", "\u521B\u610F\u56ED", "\u8857\u533A", "\u5730\u6807"]
};
var LOW_VALUE_CHAIN_PATTERN = /瑞幸|luckin|星巴克|starbucks|麦当劳|肯德基|KFC|必胜客|汉堡王|蜜雪冰城|益禾堂|古茗|一点点|茶百道|奈雪|喜茶|霸王茶姬|CoCo|沪上阿姨|绝味鸭脖|正新鸡排|华莱士/i;
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
function handleOptions(req, res) {
  if (req.method !== "OPTIONS") return false;
  setCors(res);
  res.status(204).json({});
  return true;
}
async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const body = req.body ?? {};
    const route = body.route;
    const type = typeof body.type === "string" ? body.type : "\u6587\u5316\u4F53\u9A8C";
    const customPrompt = typeof body.customPrompt === "string" ? body.customPrompt.trim() : "";
    const location = body.location && typeof body.location === "object" ? body.location : void 0;
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
function buildPoiSearchQueries(type, customPrompt, city, district) {
  const normalizedType = type === "\u6B63\u9910" ? "\u9910\u996E\u6B63\u9910" : type;
  const defaults = TYPE_KEYWORDS[normalizedType] ?? TYPE_KEYWORDS["\u6587\u5316\u4F53\u9A8C"];
  const keywords = [...new Set([customPrompt.trim(), ...defaults].filter(Boolean))];
  return keywords.map((keyword) => ({ keyword, city: city.trim(), district: district.trim() }));
}
async function findPois(type, route, customPrompt = "", location, limit = 1) {
  const amapKey = process.env.AMAP_API_KEY || process.env.AMAP_WEB_SERVICE_KEY;
  if (!amapKey) return [];
  const city = location?.city?.trim() || "";
  const district = location?.district?.trim() || inferDistrict(route);
  const usedNames = new Set((route?.steps ?? []).map((step) => normalizeName(step.poi.name)));
  const queries = buildPoiSearchQueries(type, customPrompt, city, district);
  const results = [];
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
    const data = await response.json();
    if (data.status !== "1" || !Array.isArray(data.pois)) continue;
    const matched = data.pois.filter((item) => isUsablePoi(item)).filter((item) => !LOW_VALUE_CHAIN_PATTERN.test(`${item.name ?? ""} ${item.type ?? ""}`)).filter((item) => item.name && !usedNames.has(normalizeName(item.name)));
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
function mapAmapPoi(item, requestedType, keyword, district, customPrompt) {
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
    priceLevel: price === 0 ? "\u514D\u8D39/\u73B0\u573A\u4E3A\u51C6" : `\u7EA6\xA5${price}/\u4EBA`,
    meituanRating: details.meituanRating,
    ratingSource: details.ratingSource,
    tags: [requestedType, keyword].filter(Boolean),
    limits: type === "\u6237\u5916\u6563\u6B65" || type === "\u62CD\u7167\u5730\u6807" ? ["\u9884\u7B97\u53CB\u597D"] : ["\u5BA4\u5185", "\u73B0\u573A\u4E3A\u51C6"],
    fitPeople: ["\u5355\u4EBA", "\u60C5\u4FA3", "\u670B\u53CB", "\u4EB2\u5B50"],
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
    weatherSensitive: type === "\u6237\u5916\u6563\u6B65" || type === "\u62CD\u7167\u5730\u6807",
    lat,
    lng
  };
}
function buildAddedPoiReason(name, type, area, businessArea, customPrompt = "") {
  const place = businessArea && businessArea !== area ? `${area}${businessArea}\u4E00\u5E26` : area;
  const activity = type === "\u6237\u5916\u6563\u6B65" ? "\u9002\u5408\u653E\u6162\u8282\u594F\u6563\u6B65" : type === "\u8F7B\u98DF\u751C\u996E" ? "\u9002\u5408\u5728\u884C\u7A0B\u4E2D\u9014\u505C\u4E0B\u6765\u4F11\u606F" : type === "\u9910\u996E\u6B63\u9910" ? "\u53EF\u4EE5\u4F5C\u4E3A\u8FD9\u6761\u8DEF\u7EBF\u7684\u6B63\u9910\u5B89\u6392" : type === "\u62CD\u7167\u5730\u6807" ? "\u9002\u5408\u7559\u51FA\u65F6\u95F4\u62CD\u7167\u548C\u6162\u901B" : "\u9002\u5408\u4F5C\u4E3A\u8DEF\u7EBF\u91CC\u7684\u4E00\u6BB5\u4E3B\u9898\u4F53\u9A8C";
  const preference = customPrompt ? `\uFF0C\u4E5F\u8D34\u5408\u4F60\u60F3\u8981\u7684\u201C${customPrompt}\u201D` : "";
  return `${name}\u4F4D\u4E8E${place}\uFF0C${activity}${preference}\u3002`;
}
function isUsablePoi(item) {
  const text = `${item.name ?? ""} ${item.type ?? ""}`;
  if (!item.name) return false;
  if (/出入口|停车场|公交站|地铁站|公司|住宅|小区|酒店|医院|学校|培训|银行|厕所|政府|派出所/.test(text)) return false;
  return /餐饮|购物|商场|娱乐|体育休闲|影剧院|风景名胜|科教文化|咖啡|茶艺|甜品|美术馆|博物馆|书店|公园|生活服务/.test(text);
}
function inferDistrict(route) {
  const first = route?.steps?.find((step) => step.poi.area || step.poi.businessDistrict)?.poi;
  return first?.area || first?.businessDistrict || "";
}
function inferPoiType(item, requestedType) {
  const text = `${item.name ?? ""} ${item.type ?? ""}`;
  if (/咖啡|甜品|茶馆|茶室|奶茶|饮品|面包|下午茶/.test(text)) return "\u8F7B\u98DF\u751C\u996E";
  if (/DIY|diy|手作|陶艺|烘焙|展|美术馆|博物馆|书店|文化|艺术/.test(text)) return "\u6587\u5316\u4F53\u9A8C";
  if (/餐饮|美食|饭|火锅|烧烤|餐厅|小吃|酒楼|菜馆/.test(text)) return "\u9910\u996E\u6B63\u9910";
  if (/公园|步道|绿道|海滨|散步|citywalk/i.test(text)) return "\u6237\u5916\u6563\u6B65";
  if (/拍照|打卡|地标|夜景|创意园|街区/.test(text)) return "\u62CD\u7167\u5730\u6807";
  if (/娱乐|商场|电影|KTV|密室|桌游|电玩城|乐园|VR/i.test(text)) return "\u4F11\u95F2\u5A31\u4E50";
  return requestedType;
}
function estimatePrice(type) {
  if (type === "\u6237\u5916\u6563\u6B65" || type === "\u62CD\u7167\u5730\u6807") return 0;
  if (type === "\u8F7B\u98DF\u751C\u996E") return 42;
  if (type === "\u9910\u996E\u6B63\u9910") return 88;
  return 68;
}
function estimateStay(type) {
  if (type === "\u9910\u996E\u6B63\u9910") return 80;
  if (type === "\u8F7B\u98DF\u751C\u996E") return 45;
  if (type === "\u6587\u5316\u4F53\u9A8C") return 75;
  if (type === "\u4F11\u95F2\u5A31\u4E50") return 90;
  return 60;
}
function parseLocation(location) {
  const [lngText, latText] = (location || "").split(",");
  const lng = Number(lngText);
  const lat = Number(latText);
  return [Number.isFinite(lng) ? lng : void 0, Number.isFinite(lat) ? lat : void 0];
}
function normalizeBusinessArea(value, area) {
  if (!value || value === "[]") return area;
  return value;
}
function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildAddedPoiReason,
  buildPoiSearchQueries
});
