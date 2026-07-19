import type { BlindBox, Requirements, Route, ToolResult } from "./types.ts";

interface ThemeRule {
  theme: string;
  tags: string[];
  match: (requirements: Requirements) => boolean;
  storyPrefix: string;
}

const THEME_RULES: ThemeRule[] = [
  {
    theme: "亲子轻松放电盒",
    tags: ["亲子", "少走路", "轻松"],
    match: (req) => req.peopleType === "亲子",
    storyPrefix: "先安排低强度体验，再接一站轻松补给，让带娃半日行程不赶不累。"
  },
  {
    theme: "雨天室内回血盒",
    tags: ["室内", "雨天", "解压"],
    match: (req) => req.constraints.includes("室内优先"),
    storyPrefix: "避开户外不确定性，用室内体验和甜饮休息串起一条稳定路线。"
  },
  {
    theme: "小众拍照吃货盒",
    tags: ["拍照", "咖啡", "美食"],
    match: (req) => hasAny(req.preferences, ["拍照", "咖啡", "美食"]),
    storyPrefix: "先找适合出片的地点，再用咖啡和美食把半日节奏接住。"
  },
  {
    theme: "夜景微醺盒",
    tags: ["夜景", "微醺", "简餐"],
    match: (req) => hasAny(req.preferences, ["夜景", "微醺", "简餐"]) || /晚上|夜景|小酌|微醺/.test(req.rawText),
    storyPrefix: "把晚间活动、夜景氛围和轻松简餐串起来，适合朋友或情侣不赶路地收尾。"
  },
  {
    theme: "省钱快乐盒",
    tags: ["预算友好", "性价比"],
    match: (req) => req.budgetMax <= 150 || req.constraints.includes("预算友好"),
    storyPrefix: "用预算友好的点位组成轻松路线，把钱花在更值得停留的地方。"
  },
  {
    theme: "城市散步疗愈盒",
    tags: ["散步", "疗愈", "安静"],
    match: (req) => hasAny(req.preferences, ["户外", "解压"]) || req.peopleType === "单人",
    storyPrefix: "用散步、安静休息和轻体验组成一条不用做太多选择的城市路线。"
  }
];

export function selectBlindBoxTheme(requirements: Requirements): string {
  if (requirements.blindBoxTheme) return requirements.blindBoxTheme;
  return THEME_RULES.find((rule) => rule.match(requirements))?.theme ?? "周末轻松探索盒";
}

export function composeBlindBox(
  theme: string,
  route: Route,
  requirements: Requirements,
  toolResults: ToolResult[]
): BlindBox {
  const rule = THEME_RULES.find((item) => item.theme === theme);
  const hasQueueSafe = toolResults.some((result) => /排队|高排队/.test(result.message));
  const title = `${requirements.timeText}${theme}`;
  const firstName = route.steps[0]?.poi.name || "第一站";
  const lastName = route.steps.at(-1)?.poi.name || "收尾站";
  const selectionStories = [
    `这次随机开出「${theme}」：从${firstName}出发，到${lastName}收尾，中间少走回头路。`,
    `本次盲盒落在「${theme}」，${route.steps.length} 站从${firstName}一路串到${lastName}。`,
    `本次开出「${theme}」：先去${firstName}，最后在${lastName}结束这趟周末路线。`,
    `随机组合完成：${firstName}负责开场，${lastName}负责收尾，共安排 ${route.steps.length} 站。`,
  ];
  const selectionStory = selectionStories[Math.floor(Math.random() * selectionStories.length)];

  return {
    theme,
    title,
    tags: rule?.tags ?? requirements.preferences.slice(0, 3),
    story: requirements.inputMode === "natural"
      ? "正在根据你的原话和本次路线生成个性化反馈。"
      : `${selectionStory}${rule?.storyPrefix ?? ""}`,
    unlockText: hasQueueSafe
      ? "已检查排队风险，并准备可替换节点。"
      : "已完成本次随机匹配，可以解锁路线。",
    copySource: "system",
  };
}

function hasAny(values: string[], targets: string[]): boolean {
  return targets.some((target) => values.includes(target));
}
