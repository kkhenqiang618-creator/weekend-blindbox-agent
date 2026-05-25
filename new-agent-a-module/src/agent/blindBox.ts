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
  return THEME_RULES.find((rule) => rule.match(requirements))?.theme ?? "周末轻松探索盒";
}

export function composeBlindBox(
  theme: string,
  route: Route,
  requirements: Requirements,
  toolResults: ToolResult[]
): BlindBox {
  const rule = THEME_RULES.find((item) => item.theme === theme);
  const routeNames = route.steps.map((step) => step.poi.name).join(" -> ");
  const hasQueueSafe = toolResults.some((result) => /排队|高排队/.test(result.message));
  const title = `${requirements.timeText}${theme}`;

  return {
    theme,
    title,
    tags: rule?.tags ?? requirements.preferences.slice(0, 3),
    story: `${rule?.storyPrefix ?? "根据你的目标生成一条半日路线。"}本次路线为：${routeNames}。`,
    unlockText: hasQueueSafe
      ? "已检查排队风险，并准备可替换节点。"
      : "已匹配主题、时间和预算，可以解锁路线。"
  };
}

function hasAny(values: string[], targets: string[]): boolean {
  return targets.some((target) => values.includes(target));
}
