import type { Poi, Requirements, Route } from "../agent/types.ts";
import { buildRoute } from "./simpleRoutePlanner.ts";

interface LiveRouteOptions {
  excludeIds?: string[];
  timeoutMs?: number;
}

interface AmapPoi {
  id?: string;
  name?: string;
  type?: string;
  address?: string | string[];
  adname?: string;
  business_area?: string;
  location?: string;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const DEFAULT_TIMEOUT_MS = 6500;
const AMAP_PLACE_URL = "https://restapi.amap.com/v3/place/text";
const SHENZHEN_DISTRICTS = ["福田", "南山", "罗湖", "宝安", "龙岗", "龙华", "盐田", "坪山", "光明", "大鹏"];
const DEFAULT_MODEL = "deepseek-chat";
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
  const candidates = uniquePois(results.flat())
    .filter((poi) => !excludeIds.has(poi.id))
    .slice(0, 36);

  if (candidates.length < 2) return null;
  const route = buildRoute(requirements, candidates, theme);
  if (route.steps.length < 2) return null;
  await enrichRouteReasons(route, requirements, theme);
  return { route, candidates, keywords };
}

function buildSearchKeywords(requirements: Requirements, theme: string): string[] {
  const district = extractDistrict(requirements.rawText);
  const areaPrefix = district ? `${district} ` : `${requirements.city || "深圳"} `;
  const themeKeywords: Record<string, string[]> = {
    "小众拍照吃货盒": ["小众咖啡", "拍照打卡", "甜品咖啡", "创意餐厅", "艺术空间"],
    "夜景微醺盒": ["夜景餐厅", "bistro", "精酿酒馆", "简餐", "夜景打卡"],
    "雨天室内回血盒": ["购物中心", "密室逃脱", "电影院", "DIY手工", "咖啡馆"],
    "亲子轻松放电盒": ["亲子乐园", "儿童体验", "亲子餐厅", "室内游乐场", "公园"],
    "城市散步疗愈盒": ["书店咖啡", "公园散步", "美术馆", "创意园", "citywalk"],
    "省钱快乐盒": ["免费公园", "平价美食", "咖啡馆", "小吃", "购物中心"],
    "周末轻松探索盒": ["休闲娱乐", "咖啡馆", "美食", "拍照打卡", "购物中心"]
  };
  const fromTheme = themeKeywords[theme] ?? themeKeywords["周末轻松探索盒"];
  const fromPrefs = requirements.preferences.slice(0, 3).map((preference) => `${preference} 周末`);
  return [...new Set([...fromTheme, ...fromPrefs].map((keyword) => `${areaPrefix}${keyword}`))].slice(0, 5);
}

async function searchAmap(keyword: string, requirements: Requirements): Promise<Poi[]> {
  const amapKey = process.env.AMAP_API_KEY || process.env.AMAP_WEB_SERVICE_KEY || "cd4379a23805ac32e432f0e5db663013";
  const url = new URL(AMAP_PLACE_URL);
  url.searchParams.set("key", amapKey);
  url.searchParams.set("keywords", keyword);
  url.searchParams.set("city", requirements.city || "深圳");
  url.searchParams.set("citylimit", "true");
  url.searchParams.set("offset", "8");
  url.searchParams.set("page", "1");
  url.searchParams.set("extensions", "base");

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json() as { status?: string; pois?: AmapPoi[] };
    if (data.status !== "1" || !Array.isArray(data.pois)) return [];
    return data.pois
      .filter((item) => isUsableAmapPoi(item))
      .map((item, index) => poiFromAmap(item, index, keyword, requirements))
      .filter((poi): poi is Poi => Boolean(poi));
  } catch {
    return [];
  }
}

function isUsableAmapPoi(item: AmapPoi): boolean {
  const text = `${item.name || ""} ${item.type || ""}`;
  if (!item.name) return false;
  if (/政府|委员会|办事处|派出所|停车场|收费站|公交站|地铁站|道路|路口|出入口|住宅|小区|写字楼|公司|银行|医院|学校|照相|摄影|婚纱|写真|证件照|儿童摄影|汉服体验|旅拍/.test(text)) return false;
  if (/地名地址信息|道路附属设施|交通设施服务|政府机构|公司企业|商务住宅|生活服务;摄影冲印店/.test(text)) return false;
  return /餐饮|购物|商场|娱乐|体育休闲|影剧院|风景名胜|科教文化|咖啡|茶艺|甜品|美术馆|博物馆|书店|公园|生活服务/.test(text);
}

function poiFromAmap(item: AmapPoi, index: number, keyword: string, requirements: Requirements): Poi | null {
  if (!item.name) return null;
  const [lng, lat] = parseLocation(item.location);
  const type = inferPoiType(item, keyword);
  const price = simulatePrice(type);
  const area = item.adname || extractDistrict(requirements.rawText) || requirements.city || "深圳";

  return {
    id: `live_route_${item.id || `${Date.now()}_${index}`}`,
    name: item.name,
    type,
    subType: inferSubType(item, type),
    address: Array.isArray(item.address) ? item.address.join("") : item.address,
    area,
    businessDistrict: normalizeBusinessArea(item.business_area, area),
    routeCluster: `live:${area}`,
    price,
    meituanRating: 4.5,
    reviewCount: 800 + index * 137,
    tags: buildTags(type, keyword, requirements),
    limits: buildLimits(type, keyword),
    fitPeople: ["单人", "情侣", "朋友", "亲子"],
    stayMinutes: simulateStayMinutes(type),
    queueLevel: index % 4 === 0 ? "medium" : "low",
    distanceLevel: "3-10km",
    mockMeituanUrl: `mock://amap/${item.id || index}`,
    reason: buildFallbackReason(item, type, keyword, requirements),
    blindBoxThemes: requirements.blindBoxTheme ? [requirements.blindBoxTheme] : undefined,
    availableTools: ["amapPlaceSearch", "queueCheck", "availabilityCheck"],
    bookingRequired: false,
    weatherSensitive: !buildLimits(type, keyword).includes("室内"),
    priorityScore: 78 - index,
    lat,
    lng
  };
}

async function enrichRouteReasons(route: Route, requirements: Requirements, theme: string): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return;

  try {
    const descriptions = await withTimeout(
      askModelForPoiDescriptions(route, requirements, theme, apiKey),
      3200
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
  const area = item.adname || extractDistrict(requirements.rawText) || requirements.city || "深圳";
  if (type === "轻食甜饮") return `${area}的咖啡甜饮候选，适合作为路线中途休息和轻松聊天的一站。`;
  if (type === "餐饮正餐") return `${area}的餐饮候选，适合补上正餐节点，让半日路线更完整。`;
  if (type === "文化体验") return `${area}的文化体验点，适合拍照、看展或增加一点小众探索感。`;
  if (type === "户外散步") return `${area}的散步停留点，适合放慢节奏并自然衔接后续行程。`;
  if (type === "拍照地标") return `${area}的拍照打卡候选，适合作为「${requirements.blindBoxTheme || "惊喜盲盒"}」里的出片节点。`;
  if (/电影|IMAX|影城/.test(item.name || item.type || keyword)) return `${area}的影院娱乐点，适合室内休闲和雨天稳定执行。`;
  return `${area}的休闲娱乐候选，适合按当前盲盒风格加入周末路线。`;
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
  const text = `${item.type || ""} ${keyword} ${item.name || ""}`;
  if (/咖啡|甜品|茶|奶茶|饮品|面包/.test(text)) return "轻食甜饮";
  if (/餐饮|美食|饭|火锅|烧烤|餐厅|小吃/.test(text)) return "餐饮正餐";
  if (/展|美术馆|博物馆|书店|文化|手作|手工|DIY|diy|陶艺/.test(text)) return "文化体验";
  if (/公园|步道|绿地|海滨|散步|citywalk/i.test(text)) return "户外散步";
  if (/娱乐|商场|乐园|电影|KTV|密室|桌游|电玩城|亲子/.test(text)) return "休闲娱乐";
  if (/拍照|打卡|地标|夜景|广场/.test(text)) return "拍照地标";
  return "休闲娱乐";
}

function inferSubType(item: AmapPoi, type: string): string {
  const rawType = item.type?.split(";").at(-1);
  return rawType || type;
}

function simulatePrice(type: string): number {
  if (type === "餐饮正餐") return 90;
  if (type === "轻食甜饮") return 38;
  if (type === "休闲娱乐") return 80;
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
  const district = SHENZHEN_DISTRICTS.find((name) => text.includes(name));
  return district ? `${district}区` : undefined;
}

function uniquePois(pois: Poi[]): Poi[] {
  const seen = new Set<string>();
  return pois.filter((poi) => {
    const key = poi.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
