/**
 * amapCategoryMap.ts
 *
 * Maps Amap (高德) POI classification codes and names to internal route categories.
 *
 * Strategy:
 * - Code prefix matching (e.g. 0501xx → meal, 0505xx → drink)
 * - Name-based keyword matching for fields without codes
 * - All mappings are partial — only cover categories that matter for route quality
 *
 * Internal categories:
 *   meal, drink, culture, outdoor, photo, entertainment, local_food, shopping, other
 */

export type RouteCategory =
  | "meal"
  | "drink"
  | "culture"
  | "outdoor"
  | "photo"
  | "entertainment"
  | "local_food"
  | "shopping"
  | "other";

/**
 * Maps Amap mid-category name keywords → internal route category.
 * Used when amapCategoryCode is unavailable but amapCategoryName or path text is present.
 */
const MID_CATEGORY_NAME_MAP: Array<[RegExp, RouteCategory]> = [
  // --- 餐饮 (050000) ---
  [/^中餐厅/, "meal"],
  [/^外国餐厅/, "meal"],
  [/^快餐厅/, "meal"],
  [/^休闲餐饮场所/, "drink"],
  [/^咖啡厅/, "drink"],
  [/^茶艺馆/, "drink"],
  [/^冷饮店/, "drink"],
  [/^糕饼店/, "drink"],
  [/^甜品店/, "drink"],

  // --- 体育休闲 (080000) ---
  [/^运动场馆/, "outdoor"],
  [/^高尔夫/, "outdoor"],
  [/^娱乐场所/, "entertainment"],
  [/^度假疗养/, "outdoor"],
  [/^休闲场所/, "entertainment"],
  [/^影剧院/, "entertainment"],

  // --- 风景名胜 (110000) ---
  [/^公园广场/, "outdoor"],
  [/^风景名胜/, "outdoor"],

  // --- 科教文化 (140000) ---
  [/^博物馆/, "culture"],
  [/^展览馆/, "culture"],
  [/^会展中心/, "culture"],
  [/^美术馆/, "culture"],
  [/^图书馆/, "culture"],
  [/^科技馆/, "culture"],
  [/^天文馆/, "culture"],
  [/^文化宫/, "culture"],
  [/^档案馆/, "culture"],
  [/^文艺团体/, "culture"],
  [/^传媒机构/, "culture"],

  // --- 购物 (060000) — 文化类购物 ---
  [/^文化用品店/, "culture"],
  [/^特色商业街/, "outdoor"],
];

/**
 * Maps Amap 小类 (sub-category) name keywords → internal route category.
 * Overrides mid-category when a more specific match is available.
 */
const SUB_CATEGORY_NAME_MAP: Array<[RegExp, RouteCategory]> = [
  [/^书店$/, "culture"],
  [/^古玩字画/, "culture"],
  [/^步行街/, "outdoor"],
  [/^老字号/, "local_food"],
  [/^土特产专卖/, "local_food"],
  [/^花卉市场/, "outdoor"],
  [/^综?合市?场/, "shopping"],
  [/^小商品市场/, "shopping"],
  [/^农副产品市场/, "shopping"],
  [/^果品市场/, "shopping"],
  [/^水产海鲜市场/, "shopping"],
  [/^家居建材/, "shopping"],
  [/^花鸟鱼虫/, "outdoor"],
  [/^公园$/, "outdoor"],
  [/^城市广场/, "outdoor"],
  [/^海滩/, "outdoor"],
  [/^观景点/, "photo"],
  [/^世界遗产/, "photo"],
  [/^国家级景点/, "photo"],
  [/^纪念馆/, "culture"],
  [/^寺庙道观/, "culture"],
  [/^教堂/, "culture"],
  [/^红色景区/, "culture"],
  [/^运动场所/, "outdoor"],
  [/^综合体育馆/, "outdoor"],
  [/^海滨浴场/, "outdoor"],
  [/^户外健身场所/, "outdoor"],
  [/^度假村/, "outdoor"],
  [/^水上活动中心/, "outdoor"],
  [/^露营地/, "outdoor"],
  [/^采摘园/, "entertainment"],
  [/^垂钓园/, "outdoor"],
  [/^游乐场/, "entertainment"],
  [/^电影院/, "entertainment"],
  [/^音乐厅/, "entertainment"],
  [/^剧场/, "entertainment"],
  [/^KTV/, "entertainment"],
  [/^酒吧/, "entertainment"],
  [/^游戏厅/, "entertainment"],
  [/^网吧/, "entertainment"],
  [/^迪厅/, "entertainment"],
  [/^棋牌室/, "entertainment"],
];

/**
 * Amap 大类 name → internal category (broad fallback).
 */
const BIG_CATEGORY_NAME_MAP: Array<[RegExp, RouteCategory]> = [
  [/^餐饮服务/, "meal"],
  [/^体育休闲服务/, "entertainment"],
  [/^风景名胜/, "outdoor"],
  [/^科教文化服务/, "culture"],
];

/**
 * Map an Amap mid/small category name to internal route category.
 * Tries small → mid → big in order.
 */
function mapByName(
  bigCategoryName: string,
  midCategoryName: string,
  subCategoryName?: string,
): RouteCategory | undefined {
  // Try sub-category first (most specific)
  if (subCategoryName) {
    for (const [pattern, cat] of SUB_CATEGORY_NAME_MAP) {
      if (pattern.test(subCategoryName)) return cat;
    }
  }

  // Try mid-category
  for (const [pattern, cat] of MID_CATEGORY_NAME_MAP) {
    if (pattern.test(midCategoryName)) return cat;
  }

  // Fall back to big-category
  for (const [pattern, cat] of BIG_CATEGORY_NAME_MAP) {
    if (pattern.test(bigCategoryName)) return cat;
  }

  return undefined;
}

/**
 * Amap 6-digit code prefix → internal route category.
 * First 2 digits = big category, first 4 digits = mid+small granularity.
 *
 * Longer (more specific) prefixes are checked FIRST.
 */
const CODE_PREFIX_MAP: Array<[string, RouteCategory]> = [
  // --- 餐饮 050000 — 最具体的子类优先 ---
  ["050116", "local_food"],   // 老字号 (specific sub-category)
  ["050117", "meal"],         // 火锅店
  ["050118", "meal"],         // 特色/地方风味
  ["050305", "meal"],         // 茶餐厅 (fast food but still meal)
  // 中餐厅/外国餐厅/快餐厅 → meal
  ["0501", "meal"],
  ["0502", "meal"],
  ["0503", "meal"],
  ["0504", "drink"],   // 休闲餐饮场所
  ["0505", "drink"],   // 咖啡厅
  ["0506", "drink"],   // 茶艺馆
  ["0507", "drink"],   // 冷饮店
  ["0508", "drink"],   // 糕饼店
  ["0509", "drink"],   // 甜品店

  // --- 体育休闲 080000 ---
  ["0800", "entertainment"], // 体育休闲服务(通用)
  ["0801", "outdoor"],   // 运动场馆
  ["0802", "outdoor"],   // 高尔夫相关
  ["0803", "entertainment"], // 娱乐场所
  ["0804", "outdoor"],   // 度假疗养场所
  ["0805", "entertainment"], // 休闲场所(游乐场)
  ["0806", "entertainment"], // 影剧院

  // --- 风景名胜 110000 ---
  ["1101", "outdoor"],   // 公园广场
  ["110101", "outdoor"], // 公园
  ["110102", "outdoor"], // 动物园
  ["110103", "outdoor"], // 植物园
  ["110105", "outdoor"], // 城市广场
  ["1102", "outdoor"],   // 风景名胜

  // --- 科教文化 140000 ---
  ["1401", "culture"],   // 博物馆
  ["1402", "culture"],   // 展览馆
  ["1403", "culture"],   // 会展中心
  ["1404", "culture"],   // 美术馆
  ["1405", "culture"],   // 图书馆
  ["1406", "culture"],   // 科技馆
  ["1407", "culture"],   // 天文馆
  ["1408", "culture"],   // 文化宫

  // --- 购物 060000 — 特定文化/户外子类 ---
  ["061205", "culture"],  // 书店
  ["061201", "culture"],  // 古玩字画
  ["061214", "local_food"], // 土特产专卖
  ["061001", "outdoor"],  // 步行街
  ["0610", "outdoor"],   // 特色商业街
  ["0601", "shopping"],  // 商场/购物中心
  ["0600", "shopping"],  // 购物服务(通用)
  ["0607", "shopping"],  // 综合市场(含农贸/果品/水产) — 文本兜底识别夜市/小吃

  // --- 生活服务 / 住宿 070000/100000 — 通常不作路线核心 ---
  ["1001", "other"],     // 宾馆酒店

  // --- 体育休闲 080000 — 更多子类 ---
  ["080108", "outdoor"], // 户外健身场所
  ["080111", "entertainment"], // 健身中心
  ["080501", "entertainment"], // 游乐场
  ["080504", "outdoor"], // 露营地

  // --- 风景名胜 110000 — 更多子类 ---
  ["110208", "photo"],   // 观景点/海滩
  ["110209", "photo"],   // 观景点

  // --- 科教文化 140000 — 更多子类 ---
  ["1400", "culture"],   // 科教文化服务(通用)
];

/**
 * Main entry: map an Amap category to internal route category.
 *
 * Priority:
 * 1. Try code prefix match (amapCategoryCode)
 * 2. Try name-based match (amapCategoryPath → split into big/mid/small)
 * 3. Try single amapCategoryName match
 *
 * @returns internal category, or undefined if no Amap mapping applies
 */
export function mapAmapCategoryToRouteCategory(poi: {
  amapCategoryName?: string;
  amapCategoryCode?: string;
  amapCategoryPath?: string;
}): RouteCategory | undefined {
  const { amapCategoryCode, amapCategoryPath, amapCategoryName } = poi;

  // 1. Code prefix matching (most reliable) — sorted by length descending so specific codes match first
  if (amapCategoryCode) {
    const code = amapCategoryCode.replace(/\s/g, "");
    for (const [prefix, cat] of CODE_PREFIX_MAP.sort((a, b) => b[0].length - a[0].length)) {
      if (code.startsWith(prefix)) return cat;
    }
  }

  // 2. Name-based matching from amapCategoryPath (hierarchical)
  if (amapCategoryPath) {
    const parts = amapCategoryPath.split(/[>;/]/).map((p) => p.trim()).filter(Boolean);
    const big = parts[0] ?? "";
    const mid = parts[1] ?? "";
    const small = parts.slice(2).join(">");
    const result = mapByName(big, mid, small);
    if (result) return result;
  }

  // 3. Name-based matching from amapCategoryName (flat)
  if (amapCategoryName) {
    const result = mapByName(amapCategoryName, amapCategoryName);
    if (result) return result;
  }

  return undefined;
}

/**
 * Maps Amap mid-category code (4 digits) to an experience sub-key.
 * Used for finer-grained same-experience stacking detection.
 */
const MID_CODE_EXPERIENCE_MAP: Array<[string, string]> = [
  ["0505", "coffee"],
  ["0506", "tea"],
  ["0507", "cold_drink"],
  ["0508", "bakery"],
  ["0509", "dessert"],
  ["0501", "meal"],
  ["0502", "meal"],
  ["0503", "fast_food"],
  ["0504", "casual_eat"],
  ["1101", "park"],
  ["1102", "scenery"],
  ["1401", "museum"],
  ["1402", "exhibition"],
  ["1404", "gallery"],
  ["1405", "library"],
  ["1406", "science"],
  ["1408", "culture_center"],
  ["0801", "sports"],
  ["0803", "nightlife"],
  ["0805", "playground"],
  ["0806", "cinema"],
  ["0601", "shopping_mall"],
  ["0607", "market"],
  ["1400", "culture"],
];

/**
 * Get a granular experience sub-key from Amap category data.
 * Returns undefined when Amap data is unavailable (falls back to categoryKey).
 */
export function getExperienceSubKey(poi: {
  amapCategoryCode?: string;
  amapCategoryName?: string;
  amapCategoryPath?: string;
}): string | undefined {
  if (poi.amapCategoryCode) {
    const code = poi.amapCategoryCode.replace(/\s/g, "");
    for (const [prefix, subKey] of MID_CODE_EXPERIENCE_MAP) {
      if (code.startsWith(prefix)) return subKey;
    }
  }

  if (poi.amapCategoryPath) {
    const parts = poi.amapCategoryPath.split(/[>;/]/).map((p) => p.trim()).filter(Boolean);
    const mid = parts[1] || "";
    if (mid === "咖啡厅") return "coffee";
    if (mid === "甜品店") return "dessert";
    if (mid === "博物馆") return "museum";
    if (mid === "美术馆") return "gallery";
    if (mid === "图书馆") return "library";
    if (mid === "公园广场") return "park";
    if (mid === "运动场馆") return "sports";
    if (mid === "影剧院") return "cinema";
    if (mid === "娱乐场所") return "nightlife";
  }

  return undefined;
}
