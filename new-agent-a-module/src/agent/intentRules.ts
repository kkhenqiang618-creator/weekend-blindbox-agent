import type { PeopleType, Requirements, UserInput, UserPreferenceProfile } from "./types.ts";

const DEFAULT_CITY = "";
const DEFAULT_DURATION_HOURS = 4;
const DEFAULT_BUDGET_MAX = 300;
const DEFAULT_PEOPLE_TYPE: PeopleType = "朋友";

const DISTRICT_SUFFIX_PATTERN = /[\u4e00-\u9fff]{2,6}?(?:区|县|旗)/;
const COMMON_CITY_NAMES = [
  "北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京",
  "重庆", "天津", "苏州", "西安", "长沙", "青岛", "郑州", "大连",
  "厦门", "福州", "合肥", "济南", "沈阳", "昆明", "贵阳", "南宁",
  "海口", "三亚", "哈尔滨", "长春", "太原", "石家庄", "兰州", "乌鲁木齐",
  "拉萨", "呼和浩特", "银川", "西宁", "南昌", "宁波", "无锡", "东莞",
  "佛山", "珠海", "惠州", "温州", "绍兴", "嘉兴", "常州", "南通",
] as const;

export function parseIntentWithRules(userInput: UserInput): Requirements {
  const rawText = userInput.rawText || "";
  const quick = userInput.quickSelections ?? {};
  const naturalMode = quick.inputMode !== "selection";
  const explicitCity = extractCity(rawText);
  const explicitDistrict = extractDistrict(rawText);
  const preferences = unique([
    ...extractPreferences(rawText),
    ...(quick.preferences ?? []),
    ...extractProfilePreferences(quick.userProfile)
  ]);
  const constraints = unique([
    ...extractConstraints(rawText),
    ...(quick.constraints ?? []),
    ...extractProfileConstraints(quick.userProfile)
  ]);

  return {
    city: naturalMode ? explicitCity ?? quick.city ?? DEFAULT_CITY : quick.city ?? explicitCity ?? DEFAULT_CITY,
    district: naturalMode
      ? explicitDistrict ?? normalizeDistrict(quick.district)
      : normalizeDistrict(quick.district) ?? explicitDistrict,
    durationHours: quick.durationHours ?? extractDurationHours(rawText) ?? DEFAULT_DURATION_HOURS,
    budgetMax: normalizeBudget(quick.budget) ?? extractBudget(rawText) ?? DEFAULT_BUDGET_MAX,
    distanceLevel: quick.distanceLevel ?? extractDistanceLevel(rawText) ?? undefined,
    peopleType: quick.peopleType ?? extractPeopleType(rawText) ?? DEFAULT_PEOPLE_TYPE,
    preferences: preferences.length > 0 ? preferences : ["美食", "休闲"],
    constraints,
    timeText: extractTimeText(rawText),
    rawText,
    inputMode: quick.inputMode ?? (Object.keys(quick).length > 0 ? "selection" : "natural"),
    blindBoxTheme: normalizeTheme(quick.blindBoxTheme),
    allowCrossDistrict: quick.allowCrossDistrict === true,
    currentLocation: normalizeLocation(quick.currentLocation),
    userProfile: normalizeUserProfile(quick.userProfile),
    intentSource: "rules"
  };
}

export function applyQuickSelections(requirements: Requirements, userInput: UserInput): Requirements {
  const quick = userInput.quickSelections ?? {};
  const inputMode = quick.inputMode ?? requirements.inputMode;
  const naturalMode = inputMode === "natural";
  const quickDistrict = normalizeDistrict(quick.district);
  return {
    ...requirements,
    city: naturalMode ? requirements.city || quick.city || DEFAULT_CITY : quick.city ?? requirements.city,
    district: naturalMode ? requirements.district ?? quickDistrict : quickDistrict ?? requirements.district,
    durationHours: quick.durationHours ?? requirements.durationHours,
    budgetMax: normalizeBudget(quick.budget) ?? requirements.budgetMax,
    distanceLevel: quick.distanceLevel ?? requirements.distanceLevel,
    peopleType: quick.peopleType ?? requirements.peopleType,
    preferences: unique([...(requirements.preferences ?? []), ...(quick.preferences ?? [])]),
    constraints: unique([...(requirements.constraints ?? []), ...(quick.constraints ?? [])]),
    blindBoxTheme: normalizeTheme(quick.blindBoxTheme) ?? requirements.blindBoxTheme,
    allowCrossDistrict: typeof quick.allowCrossDistrict === "boolean"
      ? quick.allowCrossDistrict
      : requirements.allowCrossDistrict,
    currentLocation: normalizeLocation(quick.currentLocation) ?? requirements.currentLocation,
    inputMode,
    userProfile: normalizeUserProfile(quick.userProfile) ?? requirements.userProfile
  };
}

export function normalizeRequirements(input: Partial<Requirements>, userInput: UserInput): Requirements {
  const ruleFallback = parseIntentWithRules(userInput);
  const normalized: Requirements = {
    city: typeof input.city === "string" && input.city ? input.city : ruleFallback.city,
    district: normalizeDistrict(input.district) ?? ruleFallback.district,
    durationHours: toPositiveNumber(input.durationHours) ?? ruleFallback.durationHours,
    budgetMax: toPositiveNumber(input.budgetMax) ?? ruleFallback.budgetMax,
    distanceLevel: typeof input.distanceLevel === "string" && input.distanceLevel ? input.distanceLevel : ruleFallback.distanceLevel,
    peopleType: isPeopleType(input.peopleType) ? input.peopleType : ruleFallback.peopleType,
    preferences: normalizeStringArray(input.preferences, ruleFallback.preferences),
    constraints: normalizeStringArray(input.constraints, ruleFallback.constraints),
    timeText: typeof input.timeText === "string" && input.timeText ? input.timeText : ruleFallback.timeText,
    rawText: userInput.rawText || "",
    inputMode: input.inputMode === "natural" || input.inputMode === "selection" ? input.inputMode : ruleFallback.inputMode,
    blindBoxTheme: normalizeTheme(input.blindBoxTheme) ?? ruleFallback.blindBoxTheme,
    allowCrossDistrict: typeof input.allowCrossDistrict === "boolean" ? input.allowCrossDistrict : ruleFallback.allowCrossDistrict,
    currentLocation: normalizeLocation(input.currentLocation) ?? ruleFallback.currentLocation,
    userProfile: normalizeUserProfile((userInput.quickSelections ?? {}).userProfile) ?? ruleFallback.userProfile,
    intentSource: input.intentSource ?? "llm"
  };

  return applyQuickSelections(normalized, userInput);
}

function extractCity(text: string): string | null {
  for (const start of getLocationStarts(text)) {
    const tail = text.slice(start);
    const commonCity = COMMON_CITY_NAMES.find((city) => tail.startsWith(city));
    if (commonCity) return commonCity;
    const suffixed = tail.match(/^([\u4e00-\u9fff]{2,7}?)市(?=[\u4e00-\u9fff]|$)/)?.[1];
    if (suffixed && !containsPlanningPhrase(suffixed)) return suffixed;
  }
  return null;
}

function extractDistrict(text: string): string | undefined {
  for (const start of getLocationStarts(text)) {
    let tail = text.slice(start);
    const commonCity = COMMON_CITY_NAMES.find((city) => tail.startsWith(city));
    if (commonCity) tail = tail.slice(commonCity.length).replace(/^市/, "");
    else tail = tail.replace(/^[\u4e00-\u9fff]{2,7}?市/, "");
    const match = tail.match(new RegExp(`^(${DISTRICT_SUFFIX_PATTERN.source})`));
    if (match?.[1] && !containsPlanningPhrase(match[1])) return match[1];
  }
  return undefined;
}

function getLocationStarts(text: string): number[] {
  const starts = new Set<number>([0]);
  const pattern = /(?:在|去|到|从|位于)/g;
  for (const match of text.matchAll(pattern)) starts.add((match.index ?? 0) + match[0].length);
  return [...starts].sort((a, b) => a - b);
}

function containsPlanningPhrase(value: string): boolean {
  return /周末|今天|明天|后天|上午|中午|下午|晚上|想去|想在|找个|地方|附近/.test(value);
}

function extractDurationHours(text: string): number | null {
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:个)?小时/);
  if (hourMatch?.[1]) return Number(hourMatch[1]);
  if (/半天|半日/.test(text)) return 4;
  return null;
}

function extractBudget(text: string): number | null {
  const budgetMatch = text.match(/(?:预算|人均|控制在|不超过|以内)[^\d]*(\d+)/);
  if (budgetMatch?.[1]) return Number(budgetMatch[1]);
  if (/省钱|性价比|便宜/.test(text)) return 150;
  return null;
}

function normalizeBudget(value: string | number | undefined): number | null {
  if (typeof value === "number") return value;
  if (!value) return null;
  const numbers = value.match(/\d+/g)?.map(Number) ?? [];
  if (numbers.length === 0) return null;
  return Math.max(...numbers);
}

function extractDistanceLevel(text: string): string | null {
  if (/少走路|别太累|近一点/.test(text)) return "3km内";
  if (/远一点|远也可以|10km/.test(text)) return "10km以上";
  return null;
}

function extractPeopleType(text: string): PeopleType | null {
  if (/带娃|孩子|亲子|小朋友|宝宝/.test(text)) return "亲子";
  if (/情侣|对象|约会|男朋友|女朋友/.test(text)) return "情侣";
  if (/朋友|同学|团建|多人/.test(text)) return "朋友";
  if (/一个人|单人|自己|我想|我现在|我有点|我想找|我想去|现在有点无聊|有点无聊|无聊/.test(text)) return "单人";
  return null;
}

function extractPreferences(text: string): string[] {
  const preferences: string[] = [];
  const mapping: Array<[RegExp, string]> = [
    [/拍照|出片|打卡/, "拍照"],
    [/咖啡|拿铁|美式/, "咖啡"],
    [/甜品|蛋糕|冰品/, "甜品"],
    [/美食|吃饭|吃点东西|小吃|餐厅|简餐/, "美食"],
    [/简餐|轻食/, "简餐"],
    [/夜景|夜晚|晚上|灯光|看海夜景/, "夜景"],
    [/微醺|小酌|喝一杯|酒吧|精酿|鸡尾酒|bistro/i, "微醺"],
    [/文化|看展|展览|书店|博物馆/, "文化"],
    [/户外|公园|散步|citywalk|徒步/, "户外"],
    [/运动|健身/, "运动"],
    [/解压|疗愈|放松|回血/, "解压"],
    [/小众|宝藏|人少/, "小众"],
    [/省钱|性价比|便宜/, "性价比"]
  ];

  for (const [pattern, label] of mapping) {
    if (pattern.test(text)) preferences.push(label);
  }

  return preferences;
}

function extractConstraints(text: string): string[] {
  const constraints: string[] = [];
  const mapping: Array<[RegExp, string]> = [
    [/不排队|不想排队|少排队|别排队/, "不想排队"],
    [/少走路|别太累|轻松/, "少走路"],
    [/室内|下雨|雨天/, "室内优先"],
    [/宠物/, "宠物友好"],
    [/预算|省钱|便宜|性价比/, "预算友好"]
  ];

  for (const [pattern, label] of mapping) {
    if (pattern.test(text)) constraints.push(label);
  }

  return constraints;
}

function extractTimeText(text: string): string {
  const match = text.match(/(周[一二三四五六日天]|明天|后天|今天|下午|晚上|上午|中午)/g);
  return match?.join("") || "周末下午";
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function toPositiveNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const normalized = unique(value.filter((item): item is string => typeof item === "string" && item.trim().length > 0));
  return normalized.length > 0 ? normalized : fallback;
}

function isPeopleType(value: unknown): value is PeopleType {
  return value === "单人" || value === "情侣" || value === "朋友" || value === "亲子";
}

function normalizeTheme(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const theme = value.trim();
  if (!theme || theme === "惊喜盲盒") return undefined;
  return theme;
}

function normalizeDistrict(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const raw = value.trim();
  if (!raw) return undefined;
  const withoutCity = raw.includes("市") ? raw.slice(raw.lastIndexOf("市") + 1) : raw;
  const match = withoutCity.match(new RegExp(`^(${DISTRICT_SUFFIX_PATTERN.source})$`));
  return match?.[1];
}

function normalizeLocation(value: unknown): { lng: number; lat: number } | undefined {
  if (!value || typeof value !== "object") return undefined;
  const location = value as { lng?: unknown; lat?: unknown };
  const lng = typeof location.lng === "number" ? location.lng : Number(location.lng);
  const lat = typeof location.lat === "number" ? location.lat : Number(location.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return undefined;
  return { lng, lat };
}

function extractProfilePreferences(profile: unknown): string[] {
  if (!profile || typeof profile !== "object") return [];
  const data = profile as {
    likedPoiTypes?: unknown;
    likedTags?: unknown;
    likedDistricts?: unknown;
    favoriteRouteThemes?: unknown;
    favoritePoiNames?: unknown;
  };
  return unique([
    ...normalizeProfileArray(data.likedPoiTypes).slice(0, 4),
    ...normalizeProfileArray(data.likedTags).slice(0, 5),
    ...normalizeProfileArray(data.favoriteRouteThemes).slice(0, 2),
    ...normalizeProfileArray(data.favoritePoiNames).slice(0, 2).map((name) => `喜欢${name}`)
  ]);
}

function extractProfileConstraints(profile: unknown): string[] {
  if (!profile || typeof profile !== "object") return [];
  const data = profile as { dislikedPoiTypes?: unknown; rejectedKeywords?: unknown; preferredRoutePace?: unknown };
  const constraints = [
    ...normalizeProfileArray(data.dislikedPoiTypes).slice(0, 3).map((type) => `少推荐${type}`),
    ...normalizeProfileArray(data.rejectedKeywords).slice(0, 3),
  ];
  if (data.preferredRoutePace === "relaxed") constraints.push("偏好松弛路线");
  if (data.preferredRoutePace === "packed") constraints.push("偏好丰富紧凑路线");
  return unique(constraints);
}

function normalizeProfileArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return unique(value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()));
}

function normalizeUserProfile(value: unknown): UserPreferenceProfile | undefined {
  if (!value || typeof value !== "object") return undefined;
  const data = value as Partial<UserPreferenceProfile>;
  const pace = data.preferredRoutePace;
  const budgetRange = Array.isArray(data.budgetRange) &&
    data.budgetRange.length === 2 &&
    data.budgetRange.every((item) => typeof item === "number" && Number.isFinite(item))
      ? data.budgetRange as [number, number]
      : undefined;

  const profile: UserPreferenceProfile = {
    likedPoiTypes: normalizeProfileArray(data.likedPoiTypes),
    likedTags: normalizeProfileArray(data.likedTags),
    likedDistricts: normalizeProfileArray(data.likedDistricts),
    favoritePoiNames: normalizeProfileArray(data.favoritePoiNames),
    favoriteRouteThemes: normalizeProfileArray(data.favoriteRouteThemes),
    dislikedPoiTypes: normalizeProfileArray(data.dislikedPoiTypes),
    rejectedKeywords: normalizeProfileArray(data.rejectedKeywords),
    budgetRange,
    preferredRoutePace: pace === "relaxed" || pace === "balanced" || pace === "packed" ? pace : undefined,
    confirmedRouteCount: typeof data.confirmedRouteCount === "number" ? data.confirmedRouteCount : 0,
    favoritePoiCount: typeof data.favoritePoiCount === "number" ? data.favoritePoiCount : 0,
    favoriteRouteCount: typeof data.favoriteRouteCount === "number" ? data.favoriteRouteCount : 0,
  };

  const hasSignal = [
    profile.likedPoiTypes,
    profile.likedTags,
    profile.likedDistricts,
    profile.favoritePoiNames,
    profile.favoriteRouteThemes,
    profile.dislikedPoiTypes,
    profile.rejectedKeywords,
  ].some((items) => (items?.length ?? 0) > 0) || Boolean(profile.budgetRange || profile.preferredRoutePace);

  return hasSignal ? profile : undefined;
}
