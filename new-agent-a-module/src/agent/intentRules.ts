import type { PeopleType, Requirements, UserInput } from "./types";

const DEFAULT_CITY = "深圳";
const DEFAULT_DURATION_HOURS = 4;
const DEFAULT_BUDGET_MAX = 300;
const DEFAULT_PEOPLE_TYPE: PeopleType = "朋友";

const KNOWN_CITIES = ["深圳", "上海", "北京", "广州", "杭州", "成都", "武汉", "南京"];

export function parseIntentWithRules(userInput: UserInput): Requirements {
  const rawText = userInput.rawText || "";
  const quick = userInput.quickSelections ?? {};
  const preferences = unique([
    ...extractPreferences(rawText),
    ...(quick.preferences ?? [])
  ]);
  const constraints = unique([
    ...extractConstraints(rawText),
    ...(quick.constraints ?? [])
  ]);

  return {
    city: quick.city ?? extractCity(rawText) ?? DEFAULT_CITY,
    durationHours: quick.durationHours ?? extractDurationHours(rawText) ?? DEFAULT_DURATION_HOURS,
    budgetMax: normalizeBudget(quick.budget) ?? extractBudget(rawText) ?? DEFAULT_BUDGET_MAX,
    distanceLevel: quick.distanceLevel ?? extractDistanceLevel(rawText) ?? undefined,
    peopleType: quick.peopleType ?? extractPeopleType(rawText) ?? DEFAULT_PEOPLE_TYPE,
    preferences: preferences.length > 0 ? preferences : ["美食", "休闲"],
    constraints,
    timeText: extractTimeText(rawText),
    rawText,
    intentSource: "rules"
  };
}

export function applyQuickSelections(requirements: Requirements, userInput: UserInput): Requirements {
  const quick = userInput.quickSelections ?? {};
  return {
    ...requirements,
    city: quick.city ?? requirements.city,
    durationHours: quick.durationHours ?? requirements.durationHours,
    budgetMax: normalizeBudget(quick.budget) ?? requirements.budgetMax,
    distanceLevel: quick.distanceLevel ?? requirements.distanceLevel,
    peopleType: quick.peopleType ?? requirements.peopleType,
    preferences: unique([...(requirements.preferences ?? []), ...(quick.preferences ?? [])]),
    constraints: unique([...(requirements.constraints ?? []), ...(quick.constraints ?? [])])
  };
}

export function normalizeRequirements(input: Partial<Requirements>, userInput: UserInput): Requirements {
  const ruleFallback = parseIntentWithRules(userInput);
  const normalized: Requirements = {
    city: typeof input.city === "string" && input.city ? input.city : ruleFallback.city,
    durationHours: toPositiveNumber(input.durationHours) ?? ruleFallback.durationHours,
    budgetMax: toPositiveNumber(input.budgetMax) ?? ruleFallback.budgetMax,
    distanceLevel: typeof input.distanceLevel === "string" && input.distanceLevel ? input.distanceLevel : ruleFallback.distanceLevel,
    peopleType: isPeopleType(input.peopleType) ? input.peopleType : ruleFallback.peopleType,
    preferences: normalizeStringArray(input.preferences, ruleFallback.preferences),
    constraints: normalizeStringArray(input.constraints, ruleFallback.constraints),
    timeText: typeof input.timeText === "string" && input.timeText ? input.timeText : ruleFallback.timeText,
    rawText: userInput.rawText || "",
    intentSource: input.intentSource ?? "llm"
  };

  return applyQuickSelections(normalized, userInput);
}

function extractCity(text: string): string | null {
  return KNOWN_CITIES.find((city) => text.includes(city)) ?? null;
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
