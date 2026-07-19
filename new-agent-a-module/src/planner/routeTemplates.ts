import type { Requirements } from "../agent/types.ts";

export type RouteTemplateId =
  | "relaxed_half_day"
  | "photo_afternoon_tea"
  | "low_budget"
  | "rainy_indoor"
  | "friends_gathering"
  | "date"
  | "family";

export interface RouteTemplate {
  id: RouteTemplateId;
  name: string;
  description: string;
  targetRoles: string[];
  idealDurationHours: number;
  idealStopCount: number;
  matchedSignals: string[];
  matchedReasons: string[];
}

type TemplateBase = Omit<RouteTemplate, "matchedSignals" | "matchedReasons">;

const ROUTE_TEMPLATES: TemplateBase[] = [
  {
    id: "relaxed_half_day",
    name: "轻松半日",
    description: "以一个轻量主目的地展开，搭配吃喝休息，控制移动成本。",
    targetRoles: ["anchor", "break", "meal", "ending"],
    idealDurationHours: 4,
    idealStopCount: 4,
  },
  {
    id: "photo_afternoon_tea",
    name: "拍照下午茶",
    description: "围绕好拍、好逛、适合聊天的主锚点，搭配轻食甜饮和收尾点。",
    targetRoles: ["anchor", "photo", "break", "ending"],
    idealDurationHours: 4,
    idealStopCount: 4,
  },
  {
    id: "low_budget",
    name: "低预算快乐",
    description: "优先免费公共空间、本地小吃、市集街区和低消费文化体验。",
    targetRoles: ["anchor", "free_space", "local_food", "ending"],
    idealDurationHours: 4,
    idealStopCount: 4,
  },
  {
    id: "rainy_indoor",
    name: "室内雨天",
    description: "以室内文化、展览、书店或娱乐空间作为核心，减少天气影响。",
    targetRoles: ["anchor", "indoor_activity", "break", "meal"],
    idealDurationHours: 4,
    idealStopCount: 4,
  },
  {
    id: "friends_gathering",
    name: "朋友聚会",
    description: "以适合多人聊天互动的核心点展开，兼顾吃喝和轻活动。",
    targetRoles: ["anchor", "interactive", "meal", "break"],
    idealDurationHours: 4,
    idealStopCount: 4,
  },
  {
    id: "date",
    name: "约会路线",
    description: "围绕氛围、拍照、散步或文化体验，减少硬核排队和奔波。",
    targetRoles: ["anchor", "atmosphere", "break", "ending"],
    idealDurationHours: 4,
    idealStopCount: 4,
  },
  {
    id: "family",
    name: "亲子路线",
    description: "优先亲子友好、少走路、自然教育或室内安全空间。",
    targetRoles: ["anchor", "family_activity", "break", "meal"],
    idealDurationHours: 4,
    idealStopCount: 4,
  },
];

export function selectRouteTemplate(requirements: Requirements, theme?: string): RouteTemplate {
  const text = getSignalText(requirements, theme);
  const scored = ROUTE_TEMPLATES.map((template) => {
    const signals = matchTemplateSignals(template.id, text, requirements, theme);
    const score = signals.reduce((sum, signal) => sum + signal.score, 0);
    return { template, score, signals };
  }).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return templatePriority(b.template.id) - templatePriority(a.template.id);
  });

  const best = scored[0];
  const template = best && best.score > 0
    ? best
    : {
      template: ROUTE_TEMPLATES[0],
      score: 0,
      signals: [{ key: "default_relaxed_half_day", reason: "没有强主题信号，使用轻松半日模板。", score: 1 }],
    };

  return {
    ...template.template,
    matchedSignals: template.signals.map((signal) => signal.key),
    matchedReasons: template.signals.map((signal) => signal.reason),
  };
}

export function getTargetStopCount(requirements: Requirements, template: RouteTemplate): number {
  const durationMinutes = requirements.durationHours * 60;
  const pace = requirements.userProfile?.preferredRoutePace;
  if (durationMinutes <= 150) return Math.min(3, template.idealStopCount);
  if (pace === "packed" && durationMinutes >= 240) return Math.min(5, template.idealStopCount + 1);
  if (pace === "relaxed") return Math.max(3, template.idealStopCount - 1);
  return template.idealStopCount;
}

export function getMinimumStopCount(requirements: Requirements, template: RouteTemplate): number {
  const durationMinutes = requirements.durationHours * 60;
  if (durationMinutes <= 150) return 2;
  if (template.id === "low_budget") return 3;
  return 3;
}

function matchTemplateSignals(
  templateId: RouteTemplateId,
  text: string,
  requirements: Requirements,
  theme?: string
): Array<{ key: string; reason: string; score: number }> {
  const signals: Array<{ key: string; reason: string; score: number }> = [];
  const add = (condition: boolean, key: string, reason: string, score: number) => {
    if (condition) signals.push({ key, reason, score });
  };

  if (templateId === "photo_afternoon_tea") {
    add(/拍照|出片|打卡|小众|citywalk/i.test(text), "photo_signal", "用户表达了拍照、打卡或小众出片需求。", 30);
    add(/下午茶|咖啡|甜品|茶饮|轻食/i.test(text), "afternoon_tea_signal", "用户表达了下午茶、咖啡或甜品需求。", 24);
    add(Boolean(theme && /拍照|吃货|下午茶|小众/.test(theme)), "theme_photo_food", "盲盒主题偏拍照或吃货。", 22);
  }

  if (templateId === "low_budget") {
    add(requirements.budgetMax <= 150, "low_budget_cap", `预算上限为 ¥${requirements.budgetMax}，适合低预算路线。`, 30);
    add(/省钱|低预算|预算友好|便宜|免费|小吃|夜市|市集|美食街/i.test(text), "budget_value_signal", "用户提到省钱、小吃、市集或免费空间。", 34);
    add(Boolean(theme && /省钱|低预算|小吃/.test(theme)), "theme_low_budget", "盲盒主题偏低预算。", 18);
  }

  if (templateId === "rainy_indoor") {
    add(/雨|下雨|雨天|室内|不晒|太热|避暑/i.test(text), "weather_indoor_signal", "用户表达了雨天、室内或避开天气影响的需求。", 46);
    add(requirements.constraints.some((item) => /室内|雨天/.test(item)), "constraint_indoor", "约束中包含室内或雨天优先。", 22);
  }

  if (templateId === "friends_gathering") {
    add(requirements.peopleType === "朋友", "people_friends", "出行人群为朋友。", 20);
    add(/朋友|聚会|聊天|多人|互动|桌游|KTV|密室|剧本杀|棋牌|台球|羽毛球|运动|健身|电竞|DIY|手作|团建|酒吧|露营|采摘|轰趴/.test(text), "friends_gathering_signal", "用户表达了朋友聚会或互动需求。", 24);
  }

  if (templateId === "date") {
    add(requirements.peopleType === "情侣", "people_date", "出行人群为情侣。", 32);
    add(/约会|情侣|氛围|浪漫|夜景/i.test(text), "date_signal", "用户表达了约会、氛围或夜景需求。", 30);
  }

  if (templateId === "family") {
    add(requirements.peopleType === "亲子", "people_family", "出行人群为亲子。", 34);
    add(/亲子|小朋友|孩子|儿童|自然教育|少走路/i.test(text), "family_signal", "用户表达了亲子、儿童或少走路需求。", 30);
  }

  if (templateId === "relaxed_half_day") {
    add(/轻松|随便逛|休闲|半日|不累|少走路/i.test(text), "relaxed_signal", "用户表达了轻松休闲需求。", 18);
  }

  return signals;
}

function templatePriority(id: RouteTemplateId): number {
  const priorities: Record<RouteTemplateId, number> = {
    rainy_indoor: 7,
    photo_afternoon_tea: 6,
    low_budget: 5,
    family: 4,
    date: 3,
    friends_gathering: 2,
    relaxed_half_day: 1,
  };
  return priorities[id];
}

function getSignalText(requirements: Requirements, theme?: string): string {
  return [
    requirements.rawText,
    theme,
    requirements.blindBoxTheme,
    requirements.peopleType,
    ...requirements.preferences,
    ...requirements.constraints,
    ...(requirements.userProfile?.likedTags ?? []),
    ...(requirements.userProfile?.favoriteRouteThemes ?? []),
  ].filter(Boolean).join(" ");
}
