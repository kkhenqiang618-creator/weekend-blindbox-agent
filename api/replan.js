"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
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

// new-agent-a-module/src/agent/blindBox.ts
function selectBlindBoxTheme(requirements) {
  return THEME_RULES.find((rule) => rule.match(requirements))?.theme ?? "\u5468\u672B\u8F7B\u677E\u63A2\u7D22\u76D2";
}
function composeBlindBox(theme, route, requirements, toolResults) {
  const rule = THEME_RULES.find((item) => item.theme === theme);
  const routeNames = route.steps.map((step) => step.poi.name).join(" -> ");
  const hasQueueSafe = toolResults.some((result) => /排队|高排队/.test(result.message));
  const title = `${requirements.timeText}${theme}`;
  return {
    theme,
    title,
    tags: rule?.tags ?? requirements.preferences.slice(0, 3),
    story: `${rule?.storyPrefix ?? "\u6839\u636E\u4F60\u7684\u76EE\u6807\u751F\u6210\u4E00\u6761\u534A\u65E5\u8DEF\u7EBF\u3002"}\u672C\u6B21\u8DEF\u7EBF\u4E3A\uFF1A${routeNames}\u3002`,
    unlockText: hasQueueSafe ? "\u5DF2\u68C0\u67E5\u6392\u961F\u98CE\u9669\uFF0C\u5E76\u51C6\u5907\u53EF\u66FF\u6362\u8282\u70B9\u3002" : "\u5DF2\u5339\u914D\u4E3B\u9898\u3001\u65F6\u95F4\u548C\u9884\u7B97\uFF0C\u53EF\u4EE5\u89E3\u9501\u8DEF\u7EBF\u3002"
  };
}
function hasAny(values, targets) {
  return targets.some((target) => values.includes(target));
}
var THEME_RULES;
var init_blindBox = __esm({
  "new-agent-a-module/src/agent/blindBox.ts"() {
    "use strict";
    THEME_RULES = [
      {
        theme: "\u4EB2\u5B50\u8F7B\u677E\u653E\u7535\u76D2",
        tags: ["\u4EB2\u5B50", "\u5C11\u8D70\u8DEF", "\u8F7B\u677E"],
        match: (req) => req.peopleType === "\u4EB2\u5B50",
        storyPrefix: "\u5148\u5B89\u6392\u4F4E\u5F3A\u5EA6\u4F53\u9A8C\uFF0C\u518D\u63A5\u4E00\u7AD9\u8F7B\u677E\u8865\u7ED9\uFF0C\u8BA9\u5E26\u5A03\u534A\u65E5\u884C\u7A0B\u4E0D\u8D76\u4E0D\u7D2F\u3002"
      },
      {
        theme: "\u96E8\u5929\u5BA4\u5185\u56DE\u8840\u76D2",
        tags: ["\u5BA4\u5185", "\u96E8\u5929", "\u89E3\u538B"],
        match: (req) => req.constraints.includes("\u5BA4\u5185\u4F18\u5148"),
        storyPrefix: "\u907F\u5F00\u6237\u5916\u4E0D\u786E\u5B9A\u6027\uFF0C\u7528\u5BA4\u5185\u4F53\u9A8C\u548C\u751C\u996E\u4F11\u606F\u4E32\u8D77\u4E00\u6761\u7A33\u5B9A\u8DEF\u7EBF\u3002"
      },
      {
        theme: "\u5C0F\u4F17\u62CD\u7167\u5403\u8D27\u76D2",
        tags: ["\u62CD\u7167", "\u5496\u5561", "\u7F8E\u98DF"],
        match: (req) => hasAny(req.preferences, ["\u62CD\u7167", "\u5496\u5561", "\u7F8E\u98DF"]),
        storyPrefix: "\u5148\u627E\u9002\u5408\u51FA\u7247\u7684\u5730\u70B9\uFF0C\u518D\u7528\u5496\u5561\u548C\u7F8E\u98DF\u628A\u534A\u65E5\u8282\u594F\u63A5\u4F4F\u3002"
      },
      {
        theme: "\u7701\u94B1\u5FEB\u4E50\u76D2",
        tags: ["\u9884\u7B97\u53CB\u597D", "\u6027\u4EF7\u6BD4"],
        match: (req) => req.budgetMax <= 150 || req.constraints.includes("\u9884\u7B97\u53CB\u597D"),
        storyPrefix: "\u7528\u9884\u7B97\u53CB\u597D\u7684\u70B9\u4F4D\u7EC4\u6210\u8F7B\u677E\u8DEF\u7EBF\uFF0C\u628A\u94B1\u82B1\u5728\u66F4\u503C\u5F97\u505C\u7559\u7684\u5730\u65B9\u3002"
      },
      {
        theme: "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2",
        tags: ["\u6563\u6B65", "\u7597\u6108", "\u5B89\u9759"],
        match: (req) => hasAny(req.preferences, ["\u6237\u5916", "\u89E3\u538B"]) || req.peopleType === "\u5355\u4EBA",
        storyPrefix: "\u7528\u6563\u6B65\u3001\u5B89\u9759\u4F11\u606F\u548C\u8F7B\u4F53\u9A8C\u7EC4\u6210\u4E00\u6761\u4E0D\u7528\u505A\u592A\u591A\u9009\u62E9\u7684\u57CE\u5E02\u8DEF\u7EBF\u3002"
      }
    ];
  }
});

// new-agent-a-module/src/agent/intentRules.ts
function parseIntentWithRules(userInput) {
  const rawText = userInput.rawText || "";
  const quick = userInput.quickSelections ?? {};
  const preferences = unique([
    ...extractPreferences(rawText),
    ...quick.preferences ?? []
  ]);
  const constraints = unique([
    ...extractConstraints(rawText),
    ...quick.constraints ?? []
  ]);
  return {
    city: quick.city ?? extractCity(rawText) ?? DEFAULT_CITY,
    durationHours: quick.durationHours ?? extractDurationHours(rawText) ?? DEFAULT_DURATION_HOURS,
    budgetMax: normalizeBudget(quick.budget) ?? extractBudget(rawText) ?? DEFAULT_BUDGET_MAX,
    distanceLevel: quick.distanceLevel ?? extractDistanceLevel(rawText),
    peopleType: quick.peopleType ?? extractPeopleType(rawText) ?? DEFAULT_PEOPLE_TYPE,
    preferences: preferences.length > 0 ? preferences : ["\u7F8E\u98DF", "\u4F11\u95F2"],
    constraints,
    timeText: extractTimeText(rawText),
    rawText,
    intentSource: "rules"
  };
}
function applyQuickSelections(requirements, userInput) {
  const quick = userInput.quickSelections ?? {};
  return {
    ...requirements,
    city: quick.city ?? requirements.city,
    durationHours: quick.durationHours ?? requirements.durationHours,
    budgetMax: normalizeBudget(quick.budget) ?? requirements.budgetMax,
    distanceLevel: quick.distanceLevel ?? requirements.distanceLevel,
    peopleType: quick.peopleType ?? requirements.peopleType,
    preferences: unique([...requirements.preferences ?? [], ...quick.preferences ?? []]),
    constraints: unique([...requirements.constraints ?? [], ...quick.constraints ?? []])
  };
}
function normalizeRequirements(input, userInput) {
  const ruleFallback = parseIntentWithRules(userInput);
  const normalized = {
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
function extractCity(text) {
  return KNOWN_CITIES.find((city) => text.includes(city)) ?? null;
}
function extractDurationHours(text) {
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:个)?小时/);
  if (hourMatch?.[1]) return Number(hourMatch[1]);
  if (/半天|半日/.test(text)) return 4;
  return null;
}
function extractBudget(text) {
  const budgetMatch = text.match(/(?:预算|人均|控制在|不超过|以内)[^\d]*(\d+)/);
  if (budgetMatch?.[1]) return Number(budgetMatch[1]);
  if (/省钱|性价比|便宜/.test(text)) return 150;
  return null;
}
function normalizeBudget(value) {
  if (typeof value === "number") return value;
  if (!value) return null;
  const numbers = value.match(/\d+/g)?.map(Number) ?? [];
  if (numbers.length === 0) return null;
  return Math.max(...numbers);
}
function extractDistanceLevel(text) {
  if (/少走路|别太累|近一点/.test(text)) return "3km\u5185";
  if (/远一点|远也可以|10km/.test(text)) return "10km\u4EE5\u4E0A";
  return null;
}
function extractPeopleType(text) {
  if (/带娃|孩子|亲子|小朋友|宝宝/.test(text)) return "\u4EB2\u5B50";
  if (/情侣|对象|约会|男朋友|女朋友/.test(text)) return "\u60C5\u4FA3";
  if (/朋友|同学|团建|多人/.test(text)) return "\u670B\u53CB";
  if (/一个人|单人|自己|我想|我现在|我有点|我想找|我想去|现在有点无聊|有点无聊|无聊/.test(text)) return "\u5355\u4EBA";
  return null;
}
function extractPreferences(text) {
  const preferences = [];
  const mapping = [
    [/拍照|出片|打卡/, "\u62CD\u7167"],
    [/咖啡|拿铁|美式/, "\u5496\u5561"],
    [/甜品|蛋糕|冰品/, "\u751C\u54C1"],
    [/美食|吃饭|吃点东西|小吃|餐厅|简餐/, "\u7F8E\u98DF"],
    [/文化|看展|展览|书店|博物馆/, "\u6587\u5316"],
    [/户外|公园|散步|citywalk|徒步/, "\u6237\u5916"],
    [/运动|健身/, "\u8FD0\u52A8"],
    [/解压|疗愈|放松|回血/, "\u89E3\u538B"],
    [/小众|宝藏|人少/, "\u5C0F\u4F17"],
    [/省钱|性价比|便宜/, "\u6027\u4EF7\u6BD4"]
  ];
  for (const [pattern, label] of mapping) {
    if (pattern.test(text)) preferences.push(label);
  }
  return preferences;
}
function extractConstraints(text) {
  const constraints = [];
  const mapping = [
    [/不排队|不想排队|少排队|别排队/, "\u4E0D\u60F3\u6392\u961F"],
    [/少走路|别太累|轻松/, "\u5C11\u8D70\u8DEF"],
    [/室内|下雨|雨天/, "\u5BA4\u5185\u4F18\u5148"],
    [/宠物/, "\u5BA0\u7269\u53CB\u597D"],
    [/预算|省钱|便宜|性价比/, "\u9884\u7B97\u53CB\u597D"]
  ];
  for (const [pattern, label] of mapping) {
    if (pattern.test(text)) constraints.push(label);
  }
  return constraints;
}
function extractTimeText(text) {
  const match = text.match(/(周[一二三四五六日天]|明天|后天|今天|下午|晚上|上午|中午)/g);
  return match?.join("") || "\u5468\u672B\u4E0B\u5348";
}
function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
function toPositiveNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return value;
}
function normalizeStringArray(value, fallback) {
  if (!Array.isArray(value)) return fallback;
  const normalized = unique(value.filter((item) => typeof item === "string" && item.trim().length > 0));
  return normalized.length > 0 ? normalized : fallback;
}
function isPeopleType(value) {
  return value === "\u5355\u4EBA" || value === "\u60C5\u4FA3" || value === "\u670B\u53CB" || value === "\u4EB2\u5B50";
}
var DEFAULT_CITY, DEFAULT_DURATION_HOURS, DEFAULT_BUDGET_MAX, DEFAULT_PEOPLE_TYPE, KNOWN_CITIES;
var init_intentRules = __esm({
  "new-agent-a-module/src/agent/intentRules.ts"() {
    "use strict";
    DEFAULT_CITY = "\u6DF1\u5733";
    DEFAULT_DURATION_HOURS = 4;
    DEFAULT_BUDGET_MAX = 300;
    DEFAULT_PEOPLE_TYPE = "\u670B\u53CB";
    KNOWN_CITIES = ["\u6DF1\u5733", "\u4E0A\u6D77", "\u5317\u4EAC", "\u5E7F\u5DDE", "\u676D\u5DDE", "\u6210\u90FD", "\u6B66\u6C49", "\u5357\u4EAC"];
  }
});

// new-agent-a-module/src/agent/llmIntentParser.ts
async function parseIntentWithLLM(userInput) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const baseUrl = process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "\u4F60\u662F\u672C\u5730\u751F\u6D3B\u5468\u672B\u51FA\u6E38 Agent \u7684\u610F\u56FE\u89E3\u6790\u5668\u3002",
            "\u8BF7\u628A\u7528\u6237\u7684\u4E00\u53E5\u8BDD\u76EE\u6807\u89E3\u6790\u4E3A\u4E25\u683C JSON\uFF0C\u4E0D\u8981\u8F93\u51FA\u89E3\u91CA\u3002",
            "\u5B57\u6BB5\u5FC5\u987B\u5305\u542B\uFF1Acity, durationHours, budgetMax, distanceLevel, peopleType, preferences, constraints, timeText\u3002",
            "peopleType \u53EA\u80FD\u662F\uFF1A\u5355\u4EBA\u3001\u60C5\u4FA3\u3001\u670B\u53CB\u3001\u4EB2\u5B50\u3002",
            "preferences \u548C constraints \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u6570\u7EC4\u3002",
            "\u8BF7\u4F18\u5148\u6839\u636E\u7528\u6237\u539F\u8BDD\u505A\u8BED\u4E49\u5224\u65AD\uFF0C\u4E0D\u8981\u673A\u68B0\u5957\u7528\u9ED8\u8BA4\u503C\u3002",
            "\u57CE\u5E02\uFF1A\u7528\u6237\u6CA1\u8BF4\u65F6\u9ED8\u8BA4\u6DF1\u5733\u3002",
            "\u65F6\u957F\uFF1A\u7528\u6237\u6CA1\u8BF4\u65F6\uFF0C\u6839\u636E\u201C\u73B0\u5728\u3001\u534A\u5929\u3001\u4E0B\u5348\u3001\u665A\u4E0A\u3001\u5468\u672B\u201D\u7B49\u8BED\u5883\u63A8\u65AD\uFF1B\u4ECD\u65E0\u6CD5\u5224\u65AD\u65F6\u75284\u5C0F\u65F6\u3002",
            "\u9884\u7B97\uFF1A\u7528\u6237\u6CA1\u8BF4\u65F6\uFF0C\u6839\u636E\u8BED\u6C14\u548C\u6D3B\u52A8\u7C7B\u578B\u63A8\u65AD\u5408\u7406\u9884\u7B97\uFF1B\u4ECD\u65E0\u6CD5\u5224\u65AD\u65F6\u7528300\u3002",
            "\u540C\u884C\u4EBA\uFF1A\u8BF7\u6839\u636E\u8BED\u4E49\u5224\u65AD\u3002\u5E26\u5A03/\u5B69\u5B50/\u4EB2\u5B50\u901A\u5E38\u662F\u4EB2\u5B50\uFF1B\u5BF9\u8C61/\u60C5\u4FA3/\u7EA6\u4F1A\u901A\u5E38\u662F\u60C5\u4FA3\uFF1B\u670B\u53CB/\u540C\u5B66/\u540C\u4E8B/\u56E2\u5EFA/\u591A\u4EBA\u901A\u5E38\u662F\u670B\u53CB\uFF1B\u5982\u679C\u7528\u6237\u4EE5\u7B2C\u4E00\u4EBA\u79F0\u8868\u8FBE\u81EA\u5DF1\u60F3\u51FA\u53BB\uFF0C\u5982\u201C\u6211\u73B0\u5728\u6709\u70B9\u65E0\u804A\u201D\u201C\u6211\u60F3\u627E\u4E2A\u5730\u65B9\u201D\uFF0C\u4E14\u6CA1\u6709\u63D0\u5230\u540C\u884C\u4EBA\uFF0C\u901A\u5E38\u662F\u5355\u4EBA\u3002\u82E5\u6CA1\u6709\u660E\u786E\u5173\u952E\u8BCD\uFF0C\u4E5F\u8BF7\u7ED3\u5408\u6574\u53E5\u8BDD\u9009\u62E9\u6700\u5408\u7406\u7684 peopleType\uFF0C\u4E0D\u8981\u56FA\u5B9A\u9ED8\u8BA4\u670B\u53CB\u3002",
            "preferences\uFF1A\u4ECE\u8BED\u4E49\u4E2D\u62BD\u53D6\u7528\u6237\u771F\u6B63\u60F3\u8981\u7684\u4F53\u9A8C\uFF0C\u5982\u62CD\u7167\u3001\u5496\u5561\u3001\u7F8E\u98DF\u3001\u6587\u5316\u3001\u6237\u5916\u3001\u8FD0\u52A8\u3001\u89E3\u538B\u3001\u5C0F\u4F17\u3001\u6027\u4EF7\u6BD4\u3001\u4F11\u95F2\u7B49\u3002",
            "constraints\uFF1A\u62BD\u53D6\u9650\u5236\u6761\u4EF6\uFF0C\u5982\u4E0D\u60F3\u6392\u961F\u3001\u5C11\u8D70\u8DEF\u3001\u5BA4\u5185\u4F18\u5148\u3001\u9884\u7B97\u53CB\u597D\u3001\u96E8\u5929\u53EF\u53BB\u7B49\u3002",
            "timeText\uFF1A\u4FDD\u7559\u7528\u6237\u63D0\u5230\u7684\u65F6\u95F4\u8868\u8FBE\uFF0C\u5982\u73B0\u5728\u3001\u5468\u516D\u4E0B\u5348\u3001\u660E\u5929\u4E0B\u5348\u3001\u5468\u672B\u665A\u4E0A\uFF1B\u5982\u679C\u6CA1\u8BF4\uFF0C\u7ED3\u5408\u8BED\u5883\u7ED9\u51FA\u81EA\u7136\u65F6\u95F4\uFF0C\u5982\u73B0\u5728\u6216\u5468\u672B\u4E0B\u5348\u3002",
            "distanceLevel\uFF1A\u5982\u679C\u7528\u6237\u6CA1\u660E\u786E\u8BF4\u8DDD\u79BB\uFF0C\u8FD4\u56DE\u7A7A\u5B57\u7B26\u4E32\u3002"
          ].join("\n")
        },
        {
          role: "user",
          content: JSON.stringify({
            rawText: userInput.rawText,
            quickSelections: userInput.quickSelections ?? {}
          })
        }
      ]
    })
  });
  if (!response.ok) {
    throw new Error(`LLM intent parsing request failed: ${response.status}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM intent parsing returned empty content");
  }
  const parsed = safeParseJson(content);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("LLM intent parsing returned invalid JSON");
  }
  return normalizeRequirements(
    {
      ...parsed,
      intentSource: "llm"
    },
    userInput
  );
}
function safeParseJson(content) {
  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  }
}
var DEFAULT_MODEL, DEFAULT_BASE_URL;
var init_llmIntentParser = __esm({
  "new-agent-a-module/src/agent/llmIntentParser.ts"() {
    "use strict";
    init_intentRules();
    DEFAULT_MODEL = "deepseek-chat";
    DEFAULT_BASE_URL = "https://api.deepseek.com/v1";
  }
});

// new-agent-a-module/src/agent/intentParser.ts
async function parseIntent(userInput) {
  try {
    const llmRequirements = await parseIntentWithLLM(userInput);
    if (llmRequirements) return llmRequirements;
  } catch (error) {
    return {
      ...parseIntentWithRules(userInput),
      intentSource: "rules",
      intentFallbackReason: error instanceof Error ? error.message : "LLM intent parsing failed"
    };
  }
  return {
    ...parseIntentWithRules(userInput),
    intentSource: "rules",
    intentFallbackReason: "LLM is not configured"
  };
}
var init_intentParser = __esm({
  "new-agent-a-module/src/agent/intentParser.ts"() {
    "use strict";
    init_llmIntentParser();
    init_intentRules();
  }
});

// new-agent-a-module/src/mock/mockPois.ts
var mockPois;
var init_mockPois = __esm({
  "new-agent-a-module/src/mock/mockPois.ts"() {
    "use strict";
    mockPois = [
      {
        id: "poi_001",
        name: "\u6D2A\u6E56\u516C\u56ED",
        type: "\u6237\u5916\u6563\u6B65",
        subType: "\u516C\u56ED",
        address: "\u6DF1\u5733\u5E02\u7F57\u6E56\u533A\u6587\u9526\u5317\u8DEF2023\u53F7",
        area: "\u7F57\u6E56\u533A",
        businessDistrict: "\u7B0B\u5C97\u5546\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 4.1,
        reviewCount: 536,
        tags: ["\u62CD\u7167", "\u6237\u5916", "\u4EB2\u5B50", "\u7597\u6108", "\u5F92\u6B65"],
        limits: ["\u5BA4\u5916", "\u9884\u7B97\u53CB\u597D"],
        fitPeople: ["\u5355\u4EBA", "\u4EB2\u5B50", "\u670B\u53CB", "\u60C5\u4FA3"],
        stayMinutes: 60,
        openTime: "06:00-23:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_001",
        reason: "\u9002\u5408\u6563\u6B65\u548C\u62CD\u7167\uFF0C\u4EB2\u5B50\u4E0E\u670B\u53CB\u51FA\u884C\u90FD\u6BD4\u8F83\u8F7B\u677E",
        blindBoxThemes: ["\u4EB2\u5B50\u8F7B\u677E\u653E\u7535\u76D2", "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2", "\u5C0F\u4F17\u62CD\u7167\u5403\u8D27\u76D2"],
        availableTools: ["queueCheck", "availabilityCheck"],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: ["poi_006"],
        priorityScore: 82
      },
      {
        id: "poi_002",
        name: "\u767D\u65E5\u68A6\u8857\u89D2\u5496\u5561",
        type: "\u8F7B\u98DF\u751C\u996E",
        subType: "\u5496\u5561\u9986",
        address: "\u6DF1\u5733\u5E02\u798F\u7530\u533A\u56ED\u5CAD\u8857\u9053\u67D0\u8DEF88\u53F7",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u56ED\u5CAD\u5546\u5708",
        price: 42,
        priceLevel: "price_le_50",
        meituanRating: 4.7,
        reviewCount: 428,
        tags: ["\u5496\u5561", "\u62CD\u7167", "\u5B89\u9759", "\u5C0F\u4F17"],
        limits: ["\u5BA4\u5185", "\u9884\u7B97\u53CB\u597D", "\u96E8\u5929\u53EF\u53BB"],
        fitPeople: ["\u5355\u4EBA", "\u670B\u53CB", "\u60C5\u4FA3"],
        stayMinutes: 50,
        openTime: "10:00-22:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_002",
        reason: "\u73AF\u5883\u5B89\u9759\uFF0C\u9002\u5408\u62CD\u7167\u548C\u4E2D\u9014\u4F11\u606F",
        blindBoxThemes: ["\u5C0F\u4F17\u62CD\u7167\u5403\u8D27\u76D2", "\u96E8\u5929\u5BA4\u5185\u56DE\u8840\u76D2", "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2"],
        availableTools: ["queueCheck", "availabilityCheck"],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: ["poi_007"],
        priorityScore: 88
      },
      {
        id: "poi_003",
        name: "\u7B0B\u5C97\u4EBA\u6C14\u5C0F\u5403\u5E97",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u5C0F\u5403",
        address: "\u6DF1\u5733\u5E02\u7F57\u6E56\u533A\u7B0B\u5C97\u5546\u5708\u67D0\u885712\u53F7",
        area: "\u7F57\u6E56\u533A",
        businessDistrict: "\u7B0B\u5C97\u5546\u5708",
        price: 58,
        priceLevel: "price_50_150",
        meituanRating: 4.6,
        reviewCount: 1390,
        tags: ["\u7F8E\u98DF", "\u6027\u4EF7\u6BD4", "\u5C0F\u4F17"],
        limits: ["\u9884\u7B97\u53CB\u597D"],
        fitPeople: ["\u5355\u4EBA", "\u670B\u53CB", "\u60C5\u4FA3"],
        stayMinutes: 60,
        openTime: "11:00-22:00",
        queueLevel: "medium",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_003",
        reason: "\u9002\u5408\u4F5C\u4E3A\u8DEF\u7EBF\u91CC\u7684\u6B63\u9910\u8282\u70B9\uFF0C\u4EF7\u683C\u4E0D\u9AD8\u4E14\u53E3\u7891\u7A33\u5B9A",
        blindBoxThemes: ["\u5C0F\u4F17\u62CD\u7167\u5403\u8D27\u76D2", "\u7701\u94B1\u5FEB\u4E50\u76D2"],
        availableTools: ["queueCheck", "availabilityCheck", "bookingMock"],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: ["poi_004"],
        priorityScore: 78
      },
      {
        id: "poi_004",
        name: "\u540C\u5546\u5708\u4F4E\u6392\u961F\u7B80\u9910",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u7B80\u9910",
        address: "\u6DF1\u5733\u5E02\u7F57\u6E56\u533A\u7B0B\u5C97\u5546\u5708\u90BB\u91CC\u4E2D\u5FC32\u697C",
        area: "\u7F57\u6E56\u533A",
        businessDistrict: "\u7B0B\u5C97\u5546\u5708",
        price: 52,
        priceLevel: "price_50_150",
        meituanRating: 4.4,
        reviewCount: 618,
        tags: ["\u7F8E\u98DF", "\u6027\u4EF7\u6BD4", "\u5C11\u8D70\u8DEF"],
        limits: ["\u5BA4\u5185", "\u4E0D\u6613\u6392\u961F", "\u9884\u7B97\u53CB\u597D", "\u96E8\u5929\u53EF\u53BB"],
        fitPeople: ["\u5355\u4EBA", "\u670B\u53CB", "\u60C5\u4FA3", "\u4EB2\u5B50"],
        stayMinutes: 50,
        openTime: "10:30-21:30",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_004",
        reason: "\u540C\u5546\u5708\u3001\u4F4E\u6392\u961F\u3001\u4EF7\u683C\u63A5\u8FD1\uFF0C\u9002\u5408\u66FF\u4EE3\u70ED\u95E8\u9910\u996E",
        blindBoxThemes: ["\u5C0F\u4F17\u62CD\u7167\u5403\u8D27\u76D2", "\u4EB2\u5B50\u8F7B\u677E\u653E\u7535\u76D2", "\u7701\u94B1\u5FEB\u4E50\u76D2"],
        availableTools: ["queueCheck", "availabilityCheck", "bookingMock"],
        bookingRequired: false,
        weatherSensitive: false,
        priorityScore: 84
      },
      {
        id: "poi_005",
        name: "\u57CE\u5E02\u827A\u672F\u4E66\u623F",
        type: "\u6587\u5316\u4F53\u9A8C",
        subType: "\u4E66\u5E97",
        address: "\u6DF1\u5733\u5E02\u798F\u7530\u533A\u4E2D\u5FC3\u4E66\u57CE\u9644\u8FD1",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u4E2D\u5FC3\u4E66\u57CE\u5546\u5708",
        price: 35,
        priceLevel: "price_le_50",
        meituanRating: 4.5,
        reviewCount: 805,
        tags: ["\u6587\u5316", "\u5B89\u9759", "\u4EB2\u5B50", "\u5C0F\u4F17"],
        limits: ["\u5BA4\u5185", "\u96E8\u5929\u53EF\u53BB", "\u5C11\u8D70\u8DEF"],
        fitPeople: ["\u5355\u4EBA", "\u4EB2\u5B50", "\u670B\u53CB", "\u60C5\u4FA3"],
        stayMinutes: 70,
        openTime: "10:00-21:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_005",
        reason: "\u5BA4\u5185\u8F7B\u4F53\u9A8C\uFF0C\u9002\u5408\u4EB2\u5B50\u6216\u96E8\u5929\u8DEF\u7EBF",
        blindBoxThemes: ["\u4EB2\u5B50\u8F7B\u677E\u653E\u7535\u76D2", "\u96E8\u5929\u5BA4\u5185\u56DE\u8840\u76D2"],
        availableTools: ["queueCheck", "availabilityCheck"],
        bookingRequired: false,
        weatherSensitive: false,
        priorityScore: 86
      },
      {
        id: "poi_006",
        name: "\u5BA4\u5185\u4EB2\u5B50\u4E92\u52A8\u9986",
        type: "\u4F11\u95F2\u5A31\u4E50",
        subType: "\u4EB2\u5B50\u4E92\u52A8",
        address: "\u6DF1\u5733\u5E02\u7F57\u6E56\u533A\u7B0B\u5C97\u5546\u5708\u5546\u4E1A\u4E2D\u5FC33\u697C",
        area: "\u7F57\u6E56\u533A",
        businessDistrict: "\u7B0B\u5C97\u5546\u5708",
        price: 88,
        priceLevel: "price_50_150",
        meituanRating: 4.3,
        reviewCount: 392,
        tags: ["\u4EB2\u5B50", "\u89E3\u538B", "\u9002\u5408\u5E26\u5A03"],
        limits: ["\u5BA4\u5185", "\u96E8\u5929\u53EF\u53BB", "\u5C11\u8D70\u8DEF"],
        fitPeople: ["\u4EB2\u5B50"],
        stayMinutes: 80,
        openTime: "10:00-21:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_006",
        reason: "\u5BA4\u5185\u4F4E\u5F3A\u5EA6\u6D3B\u52A8\uFF0C\u9002\u5408\u4E0B\u96E8\u6216\u5E26\u5A03\u573A\u666F",
        blindBoxThemes: ["\u4EB2\u5B50\u8F7B\u677E\u653E\u7535\u76D2", "\u96E8\u5929\u5BA4\u5185\u56DE\u8840\u76D2"],
        availableTools: ["availabilityCheck", "bookingMock"],
        bookingRequired: true,
        weatherSensitive: false,
        priorityScore: 80
      },
      {
        id: "poi_007",
        name: "\u96E8\u5929\u751C\u54C1\u5C0F\u7AD9",
        type: "\u8F7B\u98DF\u751C\u996E",
        subType: "\u751C\u54C1",
        address: "\u6DF1\u5733\u5E02\u798F\u7530\u533A\u56ED\u5CAD\u5546\u5708\u67D0\u5DF76\u53F7",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u56ED\u5CAD\u5546\u5708",
        price: 38,
        priceLevel: "price_le_50",
        meituanRating: 4.4,
        reviewCount: 512,
        tags: ["\u751C\u54C1", "\u5B89\u9759", "\u5C0F\u4F17"],
        limits: ["\u5BA4\u5185", "\u96E8\u5929\u53EF\u53BB", "\u9884\u7B97\u53CB\u597D"],
        fitPeople: ["\u5355\u4EBA", "\u670B\u53CB", "\u60C5\u4FA3", "\u4EB2\u5B50"],
        stayMinutes: 45,
        openTime: "11:00-22:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_007",
        reason: "\u96E8\u5929\u53EF\u53BB\uFF0C\u9002\u5408\u66FF\u4EE3\u5496\u5561\u6216\u6237\u5916\u4F11\u606F\u8282\u70B9",
        blindBoxThemes: ["\u96E8\u5929\u5BA4\u5185\u56DE\u8840\u76D2", "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2"],
        availableTools: ["queueCheck", "availabilityCheck"],
        bookingRequired: false,
        weatherSensitive: false,
        priorityScore: 79
      },
      {
        id: "poi_008",
        name: "\u56ED\u5CAD\u8F7B\u98DF\u9762\u9986",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u7B80\u9910",
        address: "\u6DF1\u5733\u5E02\u798F\u7530\u533A\u56ED\u5CAD\u5546\u5708\u751F\u6D3B\u5E7F\u573A1\u697C",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u56ED\u5CAD\u5546\u5708",
        price: 48,
        priceLevel: "price_le_50",
        meituanRating: 4.2,
        reviewCount: 356,
        tags: ["\u7F8E\u98DF", "\u6027\u4EF7\u6BD4", "\u5C11\u8D70\u8DEF"],
        limits: ["\u5BA4\u5185", "\u4E0D\u6613\u6392\u961F", "\u9884\u7B97\u53CB\u597D", "\u96E8\u5929\u53EF\u53BB"],
        fitPeople: ["\u5355\u4EBA", "\u670B\u53CB", "\u60C5\u4FA3", "\u4EB2\u5B50"],
        stayMinutes: 45,
        openTime: "10:00-21:30",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_008",
        reason: "\u4F4E\u6392\u961F\u3001\u4EF7\u683C\u53CB\u597D\uFF0C\u9002\u5408\u4F5C\u4E3A\u9910\u996E Plan B",
        blindBoxThemes: ["\u5C0F\u4F17\u62CD\u7167\u5403\u8D27\u76D2", "\u7701\u94B1\u5FEB\u4E50\u76D2", "\u96E8\u5929\u5BA4\u5185\u56DE\u8840\u76D2"],
        availableTools: ["queueCheck", "availabilityCheck", "bookingMock"],
        bookingRequired: false,
        weatherSensitive: false,
        priorityScore: 77
      }
    ];
  }
});

// new-agent-a-module/src/planner/simpleRoutePlanner.ts
function buildRoute(requirements, pois2, theme) {
  const allCandidates = filterPois(requirements, pois2, theme);
  const routeCluster = selectRouteCluster(allCandidates, requirements, theme);
  const clusteredCandidates = routeCluster ? allCandidates.filter((poi) => poi.routeCluster === routeCluster) : allCandidates;
  const candidates = clusteredCandidates.length >= 2 ? clusteredCandidates : allCandidates;
  const steps = [];
  const targetMinutes = Math.max(180, Math.min(360, requirements.durationHours * 60));
  const maxMinutes = targetMinutes + 30;
  const firstActivity = pickFirst(candidates, ["\u62CD\u7167\u5730\u6807", "\u6237\u5916\u6563\u6B65", "\u6587\u5316\u4F53\u9A8C", "\u4F11\u95F2\u5A31\u4E50"]);
  addStepIfFits(steps, firstActivity, maxMinutes);
  const breakStop = pickFirst(candidates, ["\u8F7B\u98DF\u751C\u996E"], usedIds(steps));
  addStepIfFits(steps, breakStop, maxMinutes);
  const meal = pickFirst(candidates, ["\u9910\u996E\u6B63\u9910"], usedIds(steps));
  addStepIfFits(steps, meal, maxMinutes);
  const ending = pickFirst(candidates, ["\u62CD\u7167\u5730\u6807", "\u6237\u5916\u6563\u6B65", "\u6587\u5316\u4F53\u9A8C", "\u4F11\u95F2\u5A31\u4E50"], usedIds(steps));
  addStepIfFits(steps, ending, maxMinutes);
  for (const candidate of candidates) {
    if (steps.length >= 4) break;
    if (usedIds(steps).includes(candidate.id)) continue;
    addStepIfFits(steps, candidate, maxMinutes);
  }
  const selected = steps.length >= 2 ? steps.map((step) => step.poi) : candidates.slice(0, Math.min(3, candidates.length));
  steps.length = 0;
  selected.forEach((poi, index) => {
    steps.push({
      order: index + 1,
      role: inferRole(poi, index),
      poi,
      note: poi.reason
    });
  });
  return summarizeRoute(steps);
}
function filterPois(requirements, pois2, theme) {
  return pois2.filter((poi) => poi.price <= requirements.budgetMax).filter((poi) => poi.fitPeople.includes(requirements.peopleType)).filter((poi) => {
    if (isFarDistance(poi.distanceLevel) && requirements.distanceLevel !== "10km\u4EE5\u4E0A") return false;
    if (!requirements.distanceLevel || !poi.distanceLevel) return true;
    if (requirements.distanceLevel === "3-10km") return isNearOrMediumDistance(poi.distanceLevel);
    return poi.distanceLevel === requirements.distanceLevel;
  }).filter((poi) => {
    if (requirements.constraints.includes("\u4E0D\u60F3\u6392\u961F")) return poi.queueLevel !== "high";
    return true;
  }).filter((poi) => {
    if (requirements.constraints.includes("\u5BA4\u5185\u4F18\u5148")) {
      return poi.limits.includes("\u5BA4\u5185") || poi.limits.includes("\u96E8\u5929\u53EF\u53BB") || poi.weatherSensitive === false;
    }
    return true;
  }).sort((a, b) => scorePoi(b, requirements, theme) - scorePoi(a, requirements, theme));
}
function replanRoute(event, currentRoute, pois2, requirements) {
  const targetStep = findTargetStep(event, currentRoute);
  const changes = [];
  if (!targetStep) {
    return {
      event,
      impact: "\u5F53\u524D\u8DEF\u7EBF\u6CA1\u6709\u627E\u5230\u9700\u8981\u8C03\u6574\u7684\u8282\u70B9\u3002",
      beforeRoute: currentRoute,
      afterRoute: currentRoute,
      changes,
      keptPreferences: requirements.preferences,
      sacrificed: [],
      message: "\u5F53\u524D\u5F02\u5E38\u6CA1\u6709\u5F71\u54CD\u8DEF\u7EBF\uFF0C\u6682\u4E0D\u9700\u8981\u8C03\u6574\u3002"
    };
  }
  if (event.type === "timeout") {
    const afterSteps2 = currentRoute.steps.map((step) => {
      if (step.poi.id !== targetStep.poi.id) return step;
      const shortenedPoi = {
        ...step.poi,
        stayMinutes: Math.max(30, step.poi.stayMinutes - (event.delayMinutes ?? 30))
      };
      changes.push({
        action: "shorten",
        from: step.poi.name,
        to: step.poi.name,
        reason: `\u5C06\u505C\u7559\u65F6\u95F4\u538B\u7F29\u5230 ${shortenedPoi.stayMinutes} \u5206\u949F\uFF0C\u5C3D\u91CF\u4FDD\u7559\u539F\u8DEF\u7EBF\u3002`
      });
      return { ...step, poi: shortenedPoi };
    });
    const afterRoute2 = summarizeRoute(afterSteps2);
    return buildPlanBResult(event, currentRoute, afterRoute2, changes, requirements, "\u4E0A\u4E00\u7AD9\u505C\u7559\u8D85\u65F6\uFF0C\u53EF\u80FD\u538B\u7F29\u540E\u7EED\u884C\u7A0B\u3002");
  }
  const replacement = findReplacement(event, targetStep.poi, pois2, requirements, currentRoute);
  if (!replacement) {
    return {
      event,
      impact: `${targetStep.poi.name} \u51FA\u73B0\u5F02\u5E38\uFF0C\u4F46\u6682\u672A\u627E\u5230\u5408\u9002\u66FF\u4EE3\u70B9\u3002`,
      beforeRoute: currentRoute,
      afterRoute: currentRoute,
      changes,
      keptPreferences: requirements.preferences,
      sacrificed: [],
      message: "\u6682\u65F6\u4FDD\u7559\u539F\u8DEF\u7EBF\uFF0C\u5EFA\u8BAE\u7A0D\u540E\u91CD\u8BD5\u6216\u624B\u52A8\u91CD\u5F00\u76F2\u76D2\u3002"
    };
  }
  const afterSteps = currentRoute.steps.map((step) => {
    if (step.poi.id !== targetStep.poi.id) return step;
    return {
      ...step,
      poi: replacement,
      note: `${replacement.reason}\uFF08Plan B \u66FF\u6362\uFF09`
    };
  });
  const afterRoute = summarizeRoute(afterSteps);
  changes.push({
    action: "replace",
    from: targetStep.poi.name,
    to: replacement.name,
    reason: buildReplacementReason(event, replacement)
  });
  return buildPlanBResult(
    event,
    currentRoute,
    afterRoute,
    changes,
    requirements,
    buildImpact(event, targetStep.poi.name)
  );
}
function pickFirst(candidates, types, excludedIds = []) {
  return candidates.find((poi) => types.includes(poi.type) && !excludedIds.includes(poi.id));
}
function addStepIfFits(steps, poi, maxMinutes) {
  if (!poi) return;
  const currentMinutes = steps.reduce((sum, step) => sum + step.poi.stayMinutes, 0);
  if (currentMinutes + poi.stayMinutes > maxMinutes && steps.length >= 2) return;
  steps.push({
    order: steps.length + 1,
    role: inferRole(poi, steps.length),
    poi,
    note: poi.reason
  });
}
function usedIds(steps) {
  return steps.map((step) => step.poi.id);
}
function inferRole(poi, index) {
  if (poi.type === "\u9910\u996E\u6B63\u9910") return "meal";
  if (poi.type === "\u8F7B\u98DF\u751C\u996E") return "break";
  if (index >= 3) return "ending";
  return "activity";
}
function summarizeRoute(steps) {
  return {
    totalMinutes: steps.reduce((sum, step) => sum + step.poi.stayMinutes, 0),
    totalBudget: steps.reduce((sum, step) => sum + step.poi.price, 0),
    steps: steps.map((step, index) => ({ ...step, order: index + 1 }))
  };
}
function scorePoi(poi, requirements, theme) {
  let score = poi.priorityScore ?? 50;
  score += (poi.meituanRating ?? 4) * 10;
  score += Math.min(10, Math.log10((poi.reviewCount ?? 0) + 1) * 2);
  for (const preference of requirements.preferences) {
    if (poi.tags.includes(preference)) score += 12;
    if (poi.reason.includes(preference)) score += 4;
  }
  for (const constraint of requirements.constraints) {
    if (poi.limits.includes(constraint) || poi.tags.includes(constraint)) score += 10;
  }
  if (theme && poi.blindBoxThemes?.includes(theme)) score += 14;
  if (poi.queueLevel === "low") score += 10;
  if (poi.queueLevel === "medium") score -= 2;
  if (poi.queueLevel === "high") score -= 25;
  if (poi.limits.includes("\u5BA4\u5185") || poi.limits.includes("\u96E8\u5929\u53EF\u53BB") || poi.weatherSensitive === false) score += 5;
  if (poi.price <= 50) score += 5;
  if (isNearDistance(poi.distanceLevel)) score += 15;
  if (isMediumDistance(poi.distanceLevel)) score += 5;
  if (isFarDistance(poi.distanceLevel)) score -= 18;
  if (poi.stayMinutes > requirements.durationHours * 60) score -= 30;
  if (poi.stayMinutes > 150) score -= 8;
  return score;
}
function selectRouteCluster(candidates, requirements, theme) {
  const clusters = /* @__PURE__ */ new Map();
  for (const poi of candidates) {
    if (!poi.routeCluster) continue;
    const bucket = clusters.get(poi.routeCluster) ?? { score: 0, types: /* @__PURE__ */ new Set(), count: 0 };
    bucket.score += scorePoi(poi, requirements, theme);
    bucket.types.add(poi.type);
    bucket.count += 1;
    clusters.set(poi.routeCluster, bucket);
  }
  return [...clusters.entries()].filter(([, bucket]) => bucket.count >= 2).sort(([, a], [, b]) => {
    const scoreA = a.score + a.types.size * 35 + Math.min(a.count, 6) * 8;
    const scoreB = b.score + b.types.size * 35 + Math.min(b.count, 6) * 8;
    return scoreB - scoreA;
  })[0]?.[0];
}
function findTargetStep(event, currentRoute) {
  if (event.poiId) return currentRoute.steps.find((step) => step.poi.id === event.poiId);
  if (event.type === "rain") {
    return currentRoute.steps.find((step) => step.poi.weatherSensitive || step.poi.limits.includes("\u5BA4\u5916"));
  }
  if (event.type === "queue") {
    return currentRoute.steps.find((step) => step.poi.type === "\u9910\u996E\u6B63\u9910");
  }
  return currentRoute.steps.at(-1);
}
function findReplacement(event, targetPoi, pois2, requirements, currentRoute) {
  const usedIds2 = new Set(currentRoute.steps.map((step) => step.poi.id));
  const replaceableIds = targetPoi.replaceableBy ?? [];
  const directReplacement = pois2.find(
    (poi) => replaceableIds.includes(poi.id) && !usedIds2.has(poi.id) && isNearEnoughForReplacement(poi, targetPoi)
  );
  if (directReplacement && matchesEvent(event, directReplacement)) return directReplacement;
  return pois2.filter((poi) => !usedIds2.has(poi.id)).filter((poi) => poi.fitPeople.includes(requirements.peopleType)).filter((poi) => poi.price <= Math.max(requirements.budgetMax, targetPoi.price + 40)).filter((poi) => poi.type === targetPoi.type || event.type === "rain").filter((poi) => isNearEnoughForReplacement(poi, targetPoi)).filter((poi) => matchesEvent(event, poi)).sort((a, b) => {
    const sameClusterA = a.routeCluster && a.routeCluster === targetPoi.routeCluster ? 35 : 0;
    const sameClusterB = b.routeCluster && b.routeCluster === targetPoi.routeCluster ? 35 : 0;
    const sameDistrictA = a.businessDistrict === targetPoi.businessDistrict ? 20 : 0;
    const sameDistrictB = b.businessDistrict === targetPoi.businessDistrict ? 20 : 0;
    return sameClusterB + sameDistrictB + scorePoi(b, requirements) - (sameClusterA + sameDistrictA + scorePoi(a, requirements));
  })[0];
}
function isNearEnoughForReplacement(candidate, targetPoi) {
  if (isFarDistance(candidate.distanceLevel)) return false;
  if (targetPoi.routeCluster && candidate.routeCluster) return candidate.routeCluster === targetPoi.routeCluster;
  if (targetPoi.area && candidate.area) return candidate.area === targetPoi.area;
  return true;
}
function isNearDistance(distanceLevel) {
  return distanceLevel === "3km\u5185" || distanceLevel === "3km\u4EE5\u5185" || distanceLevel === "near";
}
function isMediumDistance(distanceLevel) {
  return distanceLevel === "3-10km" || distanceLevel === "medium" || !distanceLevel;
}
function isNearOrMediumDistance(distanceLevel) {
  return isNearDistance(distanceLevel) || isMediumDistance(distanceLevel);
}
function isFarDistance(distanceLevel) {
  return distanceLevel === "10km\u4EE5\u4E0A" || distanceLevel === "far";
}
function matchesEvent(event, poi) {
  if (event.type === "queue") return poi.queueLevel === "low";
  if (event.type === "rain") return poi.weatherSensitive === false || poi.limits.includes("\u5BA4\u5185") || poi.limits.includes("\u96E8\u5929\u53EF\u53BB");
  if (event.type === "unavailable" || event.type === "closed") return poi.bookingRequired !== true || poi.availableTools?.includes("bookingMock");
  return true;
}
function buildReplacementReason(event, replacement) {
  if (event.type === "queue") return `${replacement.name} \u6392\u961F\u98CE\u9669\u66F4\u4F4E\uFF0C\u4E14\u4EF7\u683C\u548C\u7C7B\u578B\u63A5\u8FD1\u3002`;
  if (event.type === "rain") return `${replacement.name} \u66F4\u9002\u5408\u5BA4\u5185\u6216\u96E8\u5929\u573A\u666F\u3002`;
  if (event.type === "closed") return `${replacement.name} \u548C\u539F\u8282\u70B9\u7C7B\u578B\u76F8\u8FD1\uFF0C\u5F53\u524D\u53EF\u66FF\u6362\u95ED\u5E97\u8282\u70B9\u3002`;
  if (event.type === "unavailable") return `${replacement.name} \u5F53\u524D\u66F4\u5BB9\u6613\u52A0\u5165\u884C\u7A0B\u3002`;
  return `${replacement.name} \u66F4\u9002\u5408\u5F53\u524D\u8DEF\u7EBF\u7EA6\u675F\u3002`;
}
function buildImpact(event, poiName) {
  if (event.type === "queue") return `${poiName} \u5F53\u524D\u6392\u961F\u7EA6 ${event.waitMinutes ?? 45} \u5206\u949F\uFF0C\u53EF\u80FD\u5F71\u54CD\u540E\u7EED\u8282\u70B9\u3002`;
  if (event.type === "rain") return `${poiName} \u53D7\u5929\u6C14\u5F71\u54CD\uFF0C\u7EE7\u7EED\u524D\u5F80\u4F53\u9A8C\u4E0D\u7A33\u5B9A\u3002`;
  if (event.type === "closed") return `${poiName} \u5F53\u524D\u95ED\u5E97\u6216\u4E0D\u53EF\u524D\u5F80\uFF0C\u9700\u8981\u66FF\u6362\u540C\u7C7B\u8282\u70B9\u3002`;
  if (event.type === "unavailable") return `${poiName} \u5F53\u524D\u4E0D\u53EF\u9884\u7EA6\u6216\u4E0D\u53EF\u52A0\u5165\u884C\u7A0B\u3002`;
  return `${poiName} \u51FA\u73B0\u8D85\u65F6\uFF0C\u53EF\u80FD\u538B\u7F29\u540E\u7EED\u8DEF\u7EBF\u3002`;
}
function buildPlanBResult(event, beforeRoute, afterRoute, changes, requirements, impact) {
  const sacrificed = changes.flatMap((change) => change.from ? [change.from] : []);
  return {
    event,
    impact,
    beforeRoute,
    afterRoute,
    changes,
    keptPreferences: requirements.preferences.slice(0, 3),
    sacrificed,
    message: `${impact} \u5DF2\u4E3A\u4F60\u8C03\u6574\u8DEF\u7EBF\uFF0C\u5C3D\u91CF\u4FDD\u7559\u300C${requirements.preferences.slice(0, 2).join("\u3001") || "\u6838\u5FC3\u4F53\u9A8C"}\u300D\u3002`
  };
}
var init_simpleRoutePlanner = __esm({
  "new-agent-a-module/src/planner/simpleRoutePlanner.ts"() {
    "use strict";
  }
});

// new-agent-a-module/src/tools/checkAvailability.ts
async function checkAvailability(route) {
  return route.steps.map((step) => ({
    toolName: "checkAvailability",
    status: "success",
    poiId: step.poi.id,
    message: step.poi.bookingRequired ? `${step.poi.name} \u9700\u8981\u9884\u7EA6\uFF0C\u5DF2\u6A21\u62DF\u786E\u8BA4\u53EF\u52A0\u5165\u884C\u7A0B` : `${step.poi.name} \u53EF\u76F4\u63A5\u52A0\u5165\u884C\u7A0B`,
    result: {
      available: true,
      bookingRequired: step.poi.bookingRequired ?? false
    }
  }));
}
var init_checkAvailability = __esm({
  "new-agent-a-module/src/tools/checkAvailability.ts"() {
    "use strict";
  }
});

// new-agent-a-module/src/tools/checkQueue.ts
async function checkQueue(route) {
  return route.steps.map((step) => {
    const waitMinutes = step.poi.queueLevel === "high" ? 45 : step.poi.queueLevel === "medium" ? 18 : 8;
    return {
      toolName: "checkQueue",
      status: "success",
      poiId: step.poi.id,
      message: step.poi.queueLevel === "high" ? `${step.poi.name} \u5F53\u524D\u6392\u961F\u8F83\u4E45` : `${step.poi.name} \u6392\u961F\u98CE\u9669\u53EF\u63A5\u53D7`,
      result: {
        queueLevel: step.poi.queueLevel,
        estimatedWaitMinutes: waitMinutes
      }
    };
  });
}
var init_checkQueue = __esm({
  "new-agent-a-module/src/tools/checkQueue.ts"() {
    "use strict";
  }
});

// new-agent-a-module/src/tools/reserveOrJoinPlan.ts
async function reserveOrJoinPlan(route) {
  return route.steps.map((step) => {
    const reservation = buildReservationAssist(step);
    if (!reservation.shouldReserve) {
      return {
        toolName: "reserveOrJoinPlan",
        status: "success",
        poiId: step.poi.id,
        message: `${step.poi.name} \u5DF2\u52A0\u5165\u884C\u7A0B`,
        result: {
          joined: true,
          reservationNeeded: false
        }
      };
    }
    return {
      toolName: "reservationAssist",
      status: "success",
      poiId: step.poi.id,
      message: `${step.poi.name} \u5EFA\u8BAE\u63D0\u524D\u786E\u8BA4\u5EA7\u4F4D\uFF0C\u5DF2\u751F\u6210\u9884\u8BA2\u8BDD\u672F\u548C\u884C\u52A8\u5165\u53E3`,
      result: {
        joined: true,
        reservationNeeded: true,
        reason: reservation.reason,
        visitTimeText: reservation.visitTimeText,
        script: reservation.script,
        actions: {
          copyScript: true,
          callPhone: Boolean(step.poi.phone),
          openMeituan: Boolean(step.poi.mockMeituanUrl)
        },
        phone: step.poi.phone ?? null,
        meituanUrl: step.poi.mockMeituanUrl ?? null,
        disclaimer: "\u5F53\u524D\u7248\u672C\u4E0D\u58F0\u660E\u771F\u5B9E\u9884\u8BA2\u6210\u529F\uFF0C\u53EA\u8F85\u52A9\u7528\u6237\u5B8C\u6210\u9884\u8BA2\u524D\u7684\u4FE1\u606F\u6574\u7406\u548C\u6700\u540E\u4E00\u6B65\u64CD\u4F5C\u3002"
      }
    };
  });
}
function buildReservationAssist(step) {
  const poi = step.poi;
  const visitTimeText = estimateVisitTimeText(step);
  return {
    shouldReserve: shouldPrepareReservation(poi),
    visitTimeText,
    reason: getReservationReason(poi),
    script: [
      "\u4F60\u597D\uFF0C\u6211\u60F3\u786E\u8BA4\u4E00\u4E0B\u662F\u5426\u53EF\u4EE5\u9884\u7EA6/\u9884\u7559\u5EA7\u4F4D\u3002",
      `\u6211\u4EEC\u9884\u8BA1${visitTimeText}\u5230\u5E97\uFF0C\u4EBA\u6570\u6309\u5F53\u524D\u884C\u7A0B\u540C\u884C\u4EBA\u6570\u786E\u8BA4\u3002`,
      "\u5982\u679C\u53EF\u4EE5\u7684\u8BDD\uFF0C\u9EBB\u70E6\u5E2E\u5FD9\u5907\u6CE8\u5C3D\u91CF\u5C11\u7B49\u5F85\uFF1B\u5982\u679C\u4E0D\u652F\u6301\u9884\u7559\uFF0C\u4E5F\u60F3\u786E\u8BA4\u4E00\u4E0B\u5F53\u524D\u5927\u6982\u6392\u961F\u65F6\u957F\u3002"
    ].join("")
  };
}
function shouldPrepareReservation(poi) {
  if (poi.bookingRequired) return true;
  if (poi.availableTools?.includes("reservationAssist")) return true;
  const isMeal = poi.type === "\u9910\u996E\u6B63\u9910" || /餐|饭|火锅|烧烤|粤菜|正餐|简餐/.test(poi.subType);
  const isBusy = poi.queueLevel === "high" || poi.queueLevel === "medium";
  const isPopular = (poi.reviewCount ?? 0) >= 1e3 || (poi.meituanRating ?? 0) >= 4.7;
  return isMeal && (isBusy || isPopular);
}
function getReservationReason(poi) {
  if (poi.bookingRequired) return "\u8BE5\u5730\u70B9\u6807\u8BB0\u4E3A\u9700\u8981\u63D0\u524D\u9884\u7EA6\u3002";
  if (poi.queueLevel === "high") return "\u8BE5\u9910\u996E\u70B9\u6392\u961F\u98CE\u9669\u8F83\u9AD8\uFF0C\u5EFA\u8BAE\u63D0\u524D\u7535\u8BDD\u6216\u5E73\u53F0\u786E\u8BA4\u5EA7\u4F4D\u3002";
  if (poi.queueLevel === "medium") return "\u8BE5\u9910\u996E\u70B9\u53EF\u80FD\u9700\u8981\u7B49\u5F85\uFF0C\u63D0\u524D\u786E\u8BA4\u80FD\u964D\u4F4E\u5230\u5E97\u4E0D\u786E\u5B9A\u6027\u3002";
  return "\u8BE5\u5730\u70B9\u9002\u5408\u63D0\u524D\u786E\u8BA4\u8425\u4E1A\u548C\u63A5\u5F85\u60C5\u51B5\u3002";
}
function estimateVisitTimeText(step) {
  if (step.startTimeText) return step.startTimeText;
  if (step.role === "meal") return "18:30\u5DE6\u53F3";
  if (step.role === "break") return "\u4E0B\u5348\u8336\u65F6\u6BB5";
  return "\u5230\u8FBE\u524D";
}
var init_reserveOrJoinPlan = __esm({
  "new-agent-a-module/src/tools/reserveOrJoinPlan.ts"() {
    "use strict";
  }
});

// new-agent-a-module/src/agent/orchestrator.ts
var orchestrator_exports = {};
__export(orchestrator_exports, {
  executePlan: () => executePlan,
  generatePlan: () => generatePlan,
  handleReplan: () => handleReplan
});
async function generatePlan(userInput, options = {}) {
  const pois2 = options.pois ?? mockPois;
  const requirements = await parseIntent(userInput);
  const theme = selectBlindBoxTheme(requirements);
  const route = buildRoute(requirements, pois2, theme);
  const [queueResults, availabilityResults] = await Promise.all([
    checkQueue(route),
    checkAvailability(route)
  ]);
  const toolStatus = [...queueResults, ...availabilityResults];
  const executionTasks = options.executeImmediately ? await reserveOrJoinPlan(route) : [];
  const blindBox = composeBlindBox(theme, route, requirements, toolStatus);
  return {
    requirements,
    blindBox,
    route,
    toolStatus,
    executionTasks,
    planB: null
  };
}
async function executePlan(plan) {
  const executionTasks = await reserveOrJoinPlan(plan.route);
  return {
    ...plan,
    executionTasks
  };
}
async function handleReplan(event, currentPlan, options = {}) {
  const pois2 = options.pois ?? mockPois;
  const planB = replanRoute(event, currentPlan.route, pois2, currentPlan.requirements);
  const [queueResults, availabilityResults] = await Promise.all([
    checkQueue(planB.afterRoute),
    checkAvailability(planB.afterRoute)
  ]);
  const toolStatus = [...queueResults, ...availabilityResults];
  const blindBox = composeBlindBox(
    currentPlan.blindBox.theme,
    planB.afterRoute,
    currentPlan.requirements,
    toolStatus
  );
  return {
    ...currentPlan,
    blindBox,
    route: planB.afterRoute,
    toolStatus,
    executionTasks: [],
    planB
  };
}
var init_orchestrator = __esm({
  "new-agent-a-module/src/agent/orchestrator.ts"() {
    "use strict";
    init_blindBox();
    init_intentParser();
    init_mockPois();
    init_simpleRoutePlanner();
    init_checkAvailability();
    init_checkQueue();
    init_reserveOrJoinPlan();
  }
});

// new-agent-a-module/src/data/pois.json
var pois_default;
var init_pois = __esm({
  "new-agent-a-module/src/data/pois.json"() {
    pois_default = [
      {
        id: "poi_001",
        name: "\u6D2A\u6E56\u516C\u56ED",
        type: "\u6237\u5916\u6563\u6B65",
        subType: "\u516C\u56ED",
        address: "\u7F57\u6E56\u533A\u7B0B\u5C97\u8857\u9053\u6587\u9526\u5317\u8DEF2023\u53F7",
        area: "\u7F57\u6E56\u533A",
        businessDistrict: "\u7F57\u6E56\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u7F57\u6E56\u6162\u901B\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 4.1,
        reviewCount: 536,
        tags: [
          "\u7597\u6108",
          "\u5F92\u6B65",
          "\u8FD0\u52A8",
          "\u89E3\u538B",
          "\u9002\u5408\u5E26\u5A03",
          "\u56E2\u5EFA"
        ],
        limits: [
          "\u5BA4\u5916",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 60,
        openTime: "06:00-23:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_001",
        reason: "6\u6708\u8377\u82B1\u76DB\u653E\uFF0C\u9002\u5408\u4EB2\u5B50\u548C\u60C5\u4FA3\u6563\u6B65\u62CD\u7167",
        blindBoxThemes: [
          "\u4EB2\u5B50\u8F7B\u677E\u653E\u7535\u76D2",
          "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: [
          "poi_002",
          "poi_003"
        ],
        priorityScore: 82
      },
      {
        id: "poi_002",
        name: "\u4E5D\u56F4\u6E7F\u5730\u516C\u56ED",
        type: "\u6237\u5916\u6563\u6B65",
        subType: "\u516C\u56ED",
        address: "\u5B9D\u5B89\u533A\u897F\u4E61\u8857\u9053\u5F69\u7ED8\u8DEF\u4E0E\u6D32\u77F3\u8DEF\u4EA4\u53C9\u53E3\u4E1C200\u7C73\u8DEF\u5357",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 4,
        reviewCount: 536,
        tags: [
          "\u62CD\u7167",
          "\u7597\u6108",
          "\u5F92\u6B65",
          "\u8FD0\u52A8",
          "\u89E3\u538B",
          "\u9002\u5408\u5E26\u5A03",
          "\u56E2\u5EFA"
        ],
        limits: [
          "\u5BA4\u5916",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 120,
        openTime: "06:00-23:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_002",
        reason: "\u57CE\u5E02\u7EFF\u6D32\uFF0C\u5C0F\u4F17\u5B89\u9759\uFF0C\u62CD\u7167\u51FA\u7247",
        blindBoxThemes: [
          "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2",
          "\u5C0F\u4F17\u6E05\u51C0\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: [
          "poi_001",
          "poi_004"
        ],
        priorityScore: 80
      },
      {
        id: "poi_003",
        name: "\u8354\u9999\u516C\u56ED",
        type: "\u6237\u5916\u6563\u6B65",
        subType: "\u516C\u56ED",
        address: "\u5357\u5C71\u533A\u5357\u5934\u8857\u9053\u5357\u5149\u8DEF\u4E0E\u5357\u5934\u8857\u4EA4\u754C\u5904",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 5,
        reviewCount: 536,
        tags: [
          "\u7597\u6108",
          "\u5F92\u6B65",
          "\u8FD0\u52A8",
          "\u89E3\u538B",
          "\u5C0F\u4F17",
          "\u9002\u5408\u5E26\u5A03",
          "\u56E2\u5EFA"
        ],
        limits: [
          "\u5BA4\u5916",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 60,
        openTime: "06:00-23:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_003",
        reason: "\u53E4\u8354\u679D\u6811\u591A\uFF0C\u7EFF\u610F\u6CBB\u6108",
        blindBoxThemes: [
          "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2",
          "\u81EA\u7136\u653E\u677E\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: [
          "poi_001",
          "poi_004"
        ],
        priorityScore: 85
      },
      {
        id: "poi_004",
        name: "\u4E2D\u5FC3\u516C\u56ED",
        type: "\u6237\u5916\u6563\u6B65",
        subType: "\u516C\u56ED",
        address: "\u798F\u7530\u533A\u534E\u5BCC\u8857\u9053\u632F\u534E\u897F\u8DEF1\u53F7",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 3.9,
        reviewCount: 536,
        tags: [
          "\u7597\u6108",
          "\u5F92\u6B65",
          "\u8FD0\u52A8",
          "\u89E3\u538B",
          "\u9002\u5408\u5E26\u5A03",
          "\u56E2\u5EFA"
        ],
        limits: [
          "\u5BA4\u5916",
          "\u9884\u7B97\u53CB\u597D",
          "\u5BA0\u7269\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 120,
        openTime: "06:00-23:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_004",
        reason: "\u798F\u7530\u5E02\u4E2D\u5FC3\u91CE\u9910\u7EFF\u5730\uFF0C\u95F9\u4E2D\u53D6\u9759",
        blindBoxThemes: [
          "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2",
          "\u5BA0\u7269\u53CB\u597D\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: [
          "poi_003",
          "poi_008"
        ],
        priorityScore: 79
      },
      {
        id: "poi_005",
        name: "\u6DD8\u91D1\u5C71\u7EFF\u9053-\u98CE\u94C3\u6EAA\u8C37",
        type: "\u6237\u5916\u6563\u6B65",
        subType: "\u6808\u9053\u3001\u8349\u5730",
        address: "\u7F57\u6E56\u533A\u4E1C\u6E56\u8857\u9053\u6C99\u6E7E\u8DEF\u4E0E\u6DD8\u91D1\u5C71\u7EFF\u9053\u4EA4\u53C9\u53E3\u897F160\u7C73",
        area: "\u7F57\u6E56\u533A",
        businessDistrict: "\u7F57\u6E56\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u7F57\u6E56\u6162\u901B\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 3.5,
        reviewCount: 536,
        tags: [
          "\u7597\u6108",
          "\u5F92\u6B65",
          "\u8FD0\u52A8",
          "\u5C0F\u4F17",
          "\u9002\u5408\u5E26\u5A03"
        ],
        limits: [
          "\u5BA4\u5916",
          "\u9884\u7B97\u53CB\u597D",
          "\u5BA0\u7269\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 180,
        openTime: "06:00-23:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_005",
        reason: "\u5C71\u666F\u6E56\u666F\uFF0C\u665A\u971E\u8D85\u7F8E\uFF0C\u905B\u5A03\u905B\u72D7\u7686\u5B9C",
        blindBoxThemes: [
          "\u5C71\u91CE\u8F7B\u5F92\u6B65\u76D2",
          "\u4EB2\u5B50\u8F7B\u677E\u653E\u7535\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: [
          "poi_006",
          "poi_008"
        ],
        priorityScore: 78
      },
      {
        id: "poi_006",
        name: "\u4E1C\u6E56\u516C\u56ED",
        type: "\u6237\u5916\u6563\u6B65",
        subType: "\u516C\u56ED",
        address: "\u7F57\u6E56\u533A\u9EC4\u8D1D\u8857\u9053\u7231\u56FD\u8DEF1\u885711\u53F7",
        area: "\u7F57\u6E56\u533A",
        businessDistrict: "\u7F57\u6E56\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u7F57\u6E56\u6162\u901B\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 4.3,
        reviewCount: 536,
        tags: [
          "\u5F92\u6B65",
          "\u89E3\u538B",
          "\u9002\u5408\u5E26\u5A03"
        ],
        limits: [
          "\u5BA4\u5916",
          "\u9884\u7B97\u53CB\u597D",
          "\u9700\u8981\u9884\u7EA6"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 120,
        openTime: "06:00-23:00",
        queueLevel: "medium",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_006",
        reason: "\u83CA\u82B1\u5C55\u3001\u52A8\u7269\u82D1\u3001\u6C34\u5E93\u89C2\u666F\u53F0",
        blindBoxThemes: [
          "\u4EB2\u5B50\u8F7B\u677E\u653E\u7535\u76D2",
          "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: true,
        weatherSensitive: true,
        replaceableBy: [
          "poi_001",
          "poi_005"
        ],
        priorityScore: 83
      },
      {
        id: "poi_007",
        name: "\u6CF0\u534E\xB7\u68A7\u6850\u6751",
        type: "\u6237\u5916\u6563\u6B65",
        subType: "\u4F4F\u5B85\u697C",
        address: "\u5B9D\u5B89\u533A\u65B0\u5B89\u8857\u9053\u65B0\u6E56\u533A\u4E0E\u5174\u534E\u4E00\u8DEF\u4EA4\u6C47\u5904",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 5,
        reviewCount: 536,
        tags: [
          "\u751C\u54C1",
          "\u5496\u5561",
          "\u62CD\u7167",
          "\u7597\u6108"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u5BA4\u5916",
          "\u96E8\u5929\u53EF\u53BB",
          "\u665A\u4E0A"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u670B\u53CB",
          "\u60C5\u4FA3",
          "\u540C\u4E8B"
        ],
        stayMinutes: 120,
        openTime: "06:00-23:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_007",
        reason: "\u6EE1\u5C4F\u7EFF\u610F\uFF0C\u6CBB\u6108\u6253\u5DE5\u4EBA\uFF0C\u62CD\u7167\u5723\u5730",
        blindBoxThemes: [
          "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2",
          "\u62CD\u7167\u51FA\u7247\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_002",
          "poi_003"
        ],
        priorityScore: 86
      },
      {
        id: "poi_008",
        name: "\u71D5\u6657\u5C71\u90CA\u91CE\u516C\u56ED",
        type: "\u6237\u5916\u6563\u6B65",
        subType: "\u516C\u56ED",
        address: "\u5357\u5C71\u533A\u6C99\u6CB3\u8857\u9053\u6865\u57CE\u4E1C\u88576\u53F7",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 4,
        reviewCount: 536,
        tags: [
          "\u7597\u6108",
          "\u5F92\u6B65",
          "\u8FD0\u52A8",
          "\u89E3\u538B"
        ],
        limits: [
          "\u5BA4\u5916",
          "\u9884\u7B97\u53CB\u597D",
          "\u5BA0\u7269\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 60,
        openTime: "06:00-23:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_008",
        reason: "\u7EFF\u91CE\u4ED9\u8E2A\uFF0C\u6D6E\u6865\u7011\u5E03\uFF0C\u5149\u5F71\u6811\u6D1E",
        blindBoxThemes: [
          "\u5C71\u91CE\u8F7B\u5F92\u6B65\u76D2",
          "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: [
          "poi_003",
          "poi_004"
        ],
        priorityScore: 81
      },
      {
        id: "poi_009",
        name: "\u6E05\u6C34\u6CB3\u94C1\u8DEF\u516C\u56ED",
        type: "\u62CD\u7167\u5730\u6807",
        subType: "\u516C\u56ED",
        address: "\u7F57\u6E56\u533A\u6E05\u6C34\u6CB3\u8857\u9053\u6E05\u6C34\u6CB3\u4E00\u8DEF112\u53F7",
        area: "\u7F57\u6E56\u533A",
        businessDistrict: "\u7F57\u6E56\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u7F57\u6E56\u6162\u901B\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 3.9,
        reviewCount: 536,
        tags: [
          "\u62CD\u7167",
          "\u6587\u5316",
          "\u5C0F\u4F17"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u5BA4\u5916",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 60,
        openTime: "06:00-23:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_009",
        reason: "\u590D\u53E4\u5DE5\u4E1A\u98CE\uFF0C\u591A\u8F86\u9648\u65E7\u706B\u8F66\uFF0C\u6444\u5F71\u53D1\u70E7\u53CB\u62CD\u6444\u7684\u7406\u60F3\u4E4B\u5730\uFF0C\u9634\u5929\u9508\u8272\u94C1\u8F68\u4E0E\u7070\u8499\u8499\u5929\u7A7A\u78B0\u649E\u51FA\u7535\u5F71\u8D28\u611F",
        blindBoxThemes: [
          "\u5C0F\u4F17\u6E05\u51C0\u76D2",
          "\u62CD\u7167\u51FA\u7247\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: [
          "poi_010",
          "poi_011"
        ],
        priorityScore: 78
      },
      {
        id: "poi_010",
        name: "\u6DF1\u5733\u6587\u548C\u53CB",
        type: "\u62CD\u7167\u5730\u6807",
        subType: "\u5546\u573A",
        address: "\u7F57\u6E56\u533A\u4E1C\u95E8\u8857\u9053\u89E3\u653E\u8DEF3002\u53F7",
        area: "\u7F57\u6E56\u533A",
        businessDistrict: "\u7F57\u6E56\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u7F57\u6E56\u6162\u901B\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 4.3,
        reviewCount: 536,
        tags: [
          "\u62CD\u7167",
          "\u6587\u5316",
          "\u5C0F\u4F17",
          "\u591C\u666F"
        ],
        limits: [
          "\u5BA4\u5916",
          "\u665A\u4E0A\u53EF\u53BB",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 60,
        openTime: "06:00-23:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_010",
        reason: "\u9002\u5408\u62CD\u7167\u7684\u590D\u53E4\u7F8E\u98DF\u57CE\uFF0C\u706F\u5149\u4EA4\u7EC7\u4E0B\u66F4\u50CF\u4E00\u4E2A\u5F02\u6B21\u5143\u7A7A\u95F4\uFF0C\u8D5B\u535A\u670B\u514B\u98CE",
        blindBoxThemes: [
          "\u62CD\u7167\u51FA\u7247\u76D2",
          "\u591C\u751F\u6D3B\u6C1B\u56F4\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_009",
          "poi_012"
        ],
        priorityScore: 80
      },
      {
        id: "poi_011",
        name: "\u949F\u4E66\u9601\uFF08\u6B22\u4E50\u6E2F\u6E7E\u5E97\uFF09",
        type: "\u62CD\u7167\u5730\u6807",
        subType: "\u4E66\u5E97",
        address: "\u5B9D\u5B89\u533A\u65B0\u5B89\u8857\u9053\u6D77\u5E9C\u8DEF\u6B22\u4E50\u6E2F\u6E7E2\u53F7\u4E1C\u5CB8\u697CL1-021",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 3,
        reviewCount: 536,
        tags: [
          "\u62CD\u7167",
          "\u6587\u5316"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u96E8\u5929\u53EF\u53BB",
          "\u665A\u4E0A\u53EF\u53BB",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 60,
        openTime: "10:00-21:30",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_011",
        reason: "\u5E97\u5185\u6700\u663E\u8457\u7684\u6807\u5FD7\u662F\u5DE8\u578B\u7EA2\u8272\u87BA\u65CB\u4E66\u67B6\uFF0C\u8D2F\u7A7F\u6982\u5FF5\u533A\uFF0C\u4FA7\u770B\u50CF\u9F7F\u8F6E\uFF0C\u6B63\u770B\u5982\u65F6\u949F\u8868\u76D8\uFF0C\u4F3C\u65F6\u95F4\u4E0E\u77E5\u8BC6\u7684\u6C38\u6052",
        blindBoxThemes: [
          "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2",
          "\u62CD\u7167\u51FA\u7247\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_010",
          "poi_013"
        ],
        priorityScore: 77
      },
      {
        id: "poi_012",
        name: "\u901A\u65B0\u5CAD\uFF08\u5730\u94C1\u7AD9\uFF09",
        type: "\u62CD\u7167\u5730\u6807",
        subType: "\u5929\u6865",
        address: "\u798F\u7530\u533A\u901A\u65B0\u5CAD\u5730\u94C1\u7AD9F\u53E3\uFF0C\u4E0A\u6B65\u4E2D\u8DEF\u5929\u6865",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 3.5,
        reviewCount: 536,
        tags: [
          "\u62CD\u7167",
          "\u6587\u5316",
          "\u5C0F\u4F17"
        ],
        limits: [
          "\u5BA4\u5916",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 30,
        openTime: "06:00-23:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_012",
        reason: "\u5EFA\u8BAE\u6674\u6717\u591A\u4E91\u7684\u65E5\u51FA\u6216\u65E5\u843D\u524D1\u5C0F\u65F6\u65F6\u95F4\u53BB\uFF0C\u6B64\u65F6\u662F\u62CD\u7167\u9EC4\u91D1\u65F6\u523B\uFF0C\u5149\u7EBF\u67D4\u548C\uFF0C\u89D2\u5EA6\u503E\u659C\uFF0C\u80FD\u62C9\u957F\u9634\u5F71\uFF0C\u589E\u5F3A\u753B\u9762\u6C1B\u56F4\u3001\u7ACB\u4F53\u611F\uFF0C\u6355\u6349\u5230\u6E29\u6696\u8272\u8C03",
        blindBoxThemes: [
          "\u5C0F\u4F17\u6E05\u51C0\u76D2",
          "\u62CD\u7167\u51FA\u7247\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: [
          "poi_009",
          "poi_014"
        ],
        priorityScore: 76
      },
      {
        id: "poi_013",
        name: "\u6DF1\u5733\u81F3\u7F8E\u672F\u9986",
        type: "\u62CD\u7167\u5730\u6807",
        subType: "\u7F8E\u672F\u9986",
        address: "\u5B9D\u5B89\u533A\u6C99\u4E95\u8857\u9053\u677E\u5B89\u8DEF\u5B9D\u5B89\u5168\u81F3\u79D1\u6280\u521B\u65B0\u56ED2\u53F7\u697C1\u697C",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 3.7,
        reviewCount: 536,
        tags: [
          "\u62CD\u7167",
          "\u6587\u5316",
          "\u5C0F\u4F17"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u96E8\u5929\u53EF\u53BB",
          "\u665A\u4E0A\u53EF\u53BB",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 120,
        openTime: "10:00-18:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_013",
        reason: "\u6DF1\u5733\u5C0F\u800C\u7F8E\u7684\u7F8E\u672F\u9986\uFF0C\u4E0E\u5973\u6027\u8BAE\u9898\u76F8\u5173\uFF0C\u6781\u7B80\u7684\u7A7A\u95F4\u8BBE\u8BA1\u4E0E\u5C55\u51FA\u7684\u827A\u672F\u4F5C\u54C1\u9002\u914D\u5EA6\u5F88\u9AD8\uFF0C\u9002\u5408\u5408\u62CD\u62CD\u7167",
        blindBoxThemes: [
          "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2",
          "\u62CD\u7167\u51FA\u7247\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_011",
          "poi_015"
        ],
        priorityScore: 79
      },
      {
        id: "poi_014",
        name: "\u77F3\u9F13\u82B1\u56ED",
        type: "\u62CD\u7167\u5730\u6807",
        subType: "\u4F4F\u5B85\u697C",
        address: "\u5357\u5C71\u533A\u897F\u4E3D\u8857\u9053\u77F3\u9F13\u8DEF2019\u53F7",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 3.5,
        reviewCount: 536,
        tags: [
          "\u62CD\u7167",
          "\u6587\u5316",
          "\u591C\u666F"
        ],
        limits: [
          "\u5BA4\u5916",
          "\u665A\u4E0A\u53EF\u53BB",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 30,
        openTime: "06:00-23:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_014",
        reason: "\u5730\u7406\u4F4D\u7F6E\u8F83\u597D\uFF0C\u5468\u8FB9\u5F88\u591A\u516C\u53F8\u603B\u90E8\uFF0C\u5C0F\u533A13\u680B\u697C\u7684\u5DF7\u5B50\u662F\u7F51\u7EA2\u6253\u5361\u70B9",
        blindBoxThemes: [
          "\u5C0F\u4F17\u6E05\u51C0\u76D2",
          "\u62CD\u7167\u51FA\u7247\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: [
          "poi_012",
          "poi_016"
        ],
        priorityScore: 75
      },
      {
        id: "poi_015",
        name: "\u91D1\u4E2D\u73AF\u56FD\u9645\u5546\u52A1\u5927\u53A6",
        type: "\u62CD\u7167\u5730\u6807",
        subType: "\u9AD8\u7AEF\u5199\u5B57\u697C",
        address: "\u798F\u7530\u533A\u798F\u7530\u8857\u9053\u91D1\u7530\u8DEF3037\u53F7",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 4,
        reviewCount: 536,
        tags: [
          "\u62CD\u7167",
          "\u6587\u5316",
          "\u591C\u666F"
        ],
        limits: [
          "\u5BA4\u5916",
          "\u665A\u4E0A\u53EF\u53BB",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 30,
        openTime: "06:00-23:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_015",
        reason: "\u9732\u53F0\u9762\u671D\u897F\u8FB9\uFF0C\u53EF\u4EE5\u8F7B\u677E\u773A\u671B\u5E73\u5B89\u91D1\u878D\u4E2D\u5FC3\u3001\u7687\u5EAD\u3001\u5353\u8D8A\u3001\u661F\u6CB3\u7B49\u5E02\u4E2D\u5FC3\u6807\u5FD7\u6027\u5927\u53A6\u3002\u7B49\u5230\u84DD\u8C03\u65F6\u523B\uFF0C\u9713\u8679\u706F\u5149\u95EA\u70C1\uFF0C\u50CF\u6781\u4E86\u5C0F\u8BF4\u91CC\u7684A\u5E02",
        blindBoxThemes: [
          "\u591C\u751F\u6D3B\u6C1B\u56F4\u76D2",
          "\u62CD\u7167\u51FA\u7247\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: [
          "poi_014",
          "poi_017"
        ],
        priorityScore: 81
      },
      {
        id: "poi_016",
        name: "\u5353\u60A6\u4E2D\u5FC3",
        type: "\u62CD\u7167\u5730\u6807",
        subType: "\u5546\u573A",
        address: "\u798F\u7530\u533A\u798F\u7530\u8857\u9053\u798F\u534E\u4E00\u8DEF348\u53F7",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 3,
        reviewCount: 536,
        tags: [
          "\u62CD\u7167",
          "\u6587\u5316",
          "\u591C\u666F"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u5BA4\u5916",
          "\u96E8\u5929\u53EF\u53BB",
          "\u665A\u4E0A\u53EF\u53BB",
          "\u9884\u7B97\u53CB\u597D",
          "\u4E0D\u6613\u6392\u961F"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 60,
        openTime: "10:00-22:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_016",
        reason: "\u5546\u5708\u5185\u9AD8\u697C\u6797\u7ACB\uFF0C\u6709\u7687\u5EAD\u4E2D\u5FC3\u3001\u5927\u4E2D\u534E\u3001\u91D1\u4E2D\u73AF\u3001\u6DF1\u5733\u4E4B\u773C\u3001\u5E02\u6C11\u4E2D\u5FC3\u7B49CBD\u5730\u6807\u6027\u5EFA\u7B51\uFF0C\u5728\u706F\u5149\u79C0\u7684\u6C1B\u56F4\u70D8\u6258\u4E0B\uFF0C\u4EFF\u4F5B\u95EF\u5165\u4E86\u8D5B\u535A\u670B\u514B\u4E16\u754C",
        blindBoxThemes: [
          "\u591C\u751F\u6D3B\u6C1B\u56F4\u76D2",
          "\u62CD\u7167\u51FA\u7247\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_015",
          "poi_018"
        ],
        priorityScore: 77
      },
      {
        id: "poi_017",
        name: "\u6E7E\u533A\u4E4B\u773C\u56FE\u4E66\u9986",
        type: "\u62CD\u7167\u5730\u6807",
        subType: "\u56FE\u4E66\u9986",
        address: "\u5B9D\u5B89\u533A\u65B0\u5B89\u8857\u9053\u6D77\u79C0\u8DEF\u4E0E\u5B9D\u534E\u8DEF\u4EA4\u53C9\u53E3\u897F\u5357140\u7C73",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 3,
        reviewCount: 536,
        tags: [
          "\u62CD\u7167",
          "\u6587\u5316",
          "\u9002\u5408\u5E26\u5A03"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u96E8\u5929\u53EF\u53BB",
          "\u665A\u4E0A\u53EF\u53BB",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 60,
        openTime: "06:00-23:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_017",
        reason: "\u6DF1\u5733\u65B0\u5F00\u7684\u56FE\u4E66\u9986\uFF0C\u9762\u79EF\u5F88\u5927\uFF0C\u5317\u533A\u4E8C\u697C\u667A\u6167\u6811\u3001\u5916\u4FA7\u7535\u68AF\u7B49\u90FD\u662F\u8457\u540D\u7684\u62CD\u7167\u6253\u5361\u70B9",
        blindBoxThemes: [
          "\u4EB2\u5B50\u8F7B\u677E\u653E\u7535\u76D2",
          "\u62CD\u7167\u51FA\u7247\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_011",
          "poi_013"
        ],
        priorityScore: 78
      },
      {
        id: "poi_018",
        name: "\u6DF1\u5733\u5F53\u4EE3\u827A\u672F\u4E0E\u57CE\u5E02\u89C4\u5212\u9986",
        type: "\u62CD\u7167\u5730\u6807",
        subType: "\u535A\u7269\u9986",
        address: "\u798F\u7530\u533A\u83B2\u82B1\u8857\u9053\u798F\u4E2D\u8DEF184\u53F7\u6DF1\u5733\u5F53\u4EE3\u827A\u672F\u4E0E\u57CE\u5E02\u89C4\u5212\u9986",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 0,
        priceLevel: "price_le_150",
        meituanRating: 3,
        reviewCount: 536,
        tags: [
          "\u62CD\u7167",
          "\u6587\u5316",
          "\u9002\u5408\u5E26\u5A03"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u96E8\u5929\u53EF\u53BB",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 120,
        openTime: "06:00-23:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_018",
        reason: "\u5EFA\u7B51\u9020\u578B\u72EC\u7279\uFF0C\u878D\u5408\u503E\u659C\u3001\u626D\u66F2\u7B49\u5F02\u578B\u94A2\u7ED3\u6784\u4E0E\u8282\u80FD\u6280\u672F\uFF0C\u5185\u5916\u5145\u6EE1\u67D4\u7F8E\u66F2\u7EBF\u4E0E\u4E0D\u89C4\u5219\u5149\u5F71\u7684\u78B0\u649E\uFF0C\u79D1\u6280\u611F\u5341\u8DB3\uFF0C\u9002\u5408\u62CD\u7167\u6253\u5361",
        blindBoxThemes: [
          "\u4EB2\u5B50\u8F7B\u677E\u653E\u7535\u76D2",
          "\u62CD\u7167\u51FA\u7247\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_013",
          "poi_016"
        ],
        priorityScore: 79
      },
      {
        id: "poi_029",
        name: "\u6DF1\u5733\u6B22\u4E50\u8C37",
        type: "\u4F11\u95F2\u5A31\u4E50",
        subType: "\u4E3B\u9898\u4E50\u56ED",
        address: "\u5357\u5C71\u533A\u4FA8\u57CE\u897F\u8857 18 \u53F7",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 0,
        priceLevel: "price_100_plus",
        meituanRating: 4.9,
        reviewCount: 18752,
        tags: [
          "\u62CD\u7167",
          "\u6237\u5916",
          "\u9002\u5408\u5E26\u5A03",
          "\u56E2\u5EFA"
        ],
        limits: [
          "\u5BA4\u5916",
          "\u665A\u4E0A\u53EF\u53BB"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 300,
        openTime: "\u5468\u4E00\u81F3\u5468\u65E5 09:30-21:00",
        queueLevel: "high",
        distanceLevel: "10km\u4EE5\u4E0A",
        mockMeituanUrl: "mock://meituan/poi_029",
        reason: "\u6DF1\u5733\u8001\u724C\u5927\u578B\u7EFC\u5408\u6E38\u4E50\u56ED\uFF0C\u673A\u52A8\u9879\u76EE\u9F50\u5168\uFF0C\u8282\u5047\u65E5\u591C\u6E38\u6C1B\u56F4\u6D53\u539A\u3002",
        blindBoxThemes: [
          "\u4EB2\u5B50\u8F7B\u677E\u653E\u7535\u76D2",
          "\u56E2\u5EFA\u72C2\u6B22\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: [
          "poi_030",
          "poi_031"
        ],
        priorityScore: 88
      },
      {
        id: "poi_030",
        name: "\u4E16\u754C\u4E4B\u7A97",
        type: "\u4F11\u95F2\u5A31\u4E50",
        subType: "\u4E3B\u9898\u4E50\u56ED",
        address: "\u5357\u5C71\u533A\u6DF1\u5357\u5927\u9053 9037 \u53F7",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 0,
        priceLevel: "price_100_plus",
        meituanRating: 4.9,
        reviewCount: 106850,
        tags: [
          "\u62CD\u7167",
          "\u6587\u5316",
          "\u6237\u5916",
          "\u56E2\u5EFA"
        ],
        limits: [
          "\u5BA4\u5916",
          "\u665A\u4E0A\u53EF\u53BB"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 240,
        openTime: "9:00-22:00",
        queueLevel: "high",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_030",
        reason: "\u5FAE\u7F29\u4E16\u754C\u540D\u80DC\u666F\u533A\uFF0C\u591C\u666F\u706F\u5149\u7EDD\u7F8E\uFF0C\u6B4C\u821E\u8868\u6F14\u4E30\u5BCC\u3002",
        blindBoxThemes: [
          "\u4EB2\u5B50\u8F7B\u677E\u653E\u7535\u76D2",
          "\u62CD\u7167\u51FA\u7247\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: [
          "poi_029",
          "poi_032"
        ],
        priorityScore: 87
      },
      {
        id: "poi_031",
        name: "\u6DF1\u5733\u6B22\u4E50\u6D77\u5CB8",
        type: "\u4F11\u95F2\u5A31\u4E50",
        subType: "\u4F11\u95F2\u7EFC\u5408\u4F53",
        address: "\u5357\u5C71\u533A\u767D\u77F3\u8DEF\u4E1C 8 \u53F7",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 0,
        priceLevel: "price_le_150",
        meituanRating: 4.9,
        reviewCount: 10153,
        tags: [
          "\u7F8E\u98DF",
          "\u751C\u54C1",
          "\u5496\u5561",
          "\u62CD\u7167"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u5BA4\u5916",
          "\u665A\u4E0A\u53EF\u53BB",
          "\u5BA0\u7269\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 150,
        openTime: "\u5168\u5929\u5F00\u653E\uFF0C\u5546\u94FA 10:00-23:00",
        queueLevel: "medium",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_031",
        reason: "\u96C6\u6E38\u73A9\u3001\u9910\u996E\u3001\u6C34\u79C0\u8868\u6F14\u4E00\u4F53\u7684\u6EE8\u6D77\u4F11\u95F2\u805A\u96C6\u5730\u3002",
        blindBoxThemes: [
          "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2",
          "\u7F8E\u98DF\u6253\u5361\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_032",
          "poi_033"
        ],
        priorityScore: 84
      },
      {
        id: "poi_032",
        name: "\u4E1C\u95E8\u8001\u8857",
        type: "\u4F11\u95F2\u5A31\u4E50",
        subType: "\u6B65\u884C\u8857",
        address: "\u7F57\u6E56\u533A\u5EFA\u8BBE\u8DEF\u4E0E\u4E1C\u95E8\u8001\u8857\u4EA4\u53C9\u8DEF\u53E3\u4E1C\u4FA7",
        area: "\u7F57\u6E56\u533A",
        businessDistrict: "\u7F57\u6E56\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u7F57\u6E56\u6162\u901B\u5708",
        price: 0,
        priceLevel: "price_le_150",
        meituanRating: 4.9,
        reviewCount: 6417,
        tags: [
          "\u7F8E\u98DF",
          "\u751C\u54C1",
          "\u5496\u5561",
          "\u62CD\u7167"
        ],
        limits: [
          "\u5BA4\u5916",
          "\u665A\u4E0A\u53EF\u53BB"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 180,
        openTime: "10:00-23:00",
        queueLevel: "high",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_032",
        reason: "\u6DF1\u5733\u8001\u724C\u7F51\u7EA2\u8001\u8857\uFF0C\u7F8E\u98DF\u670D\u9970\u9F50\u5168\uFF0C\u70DF\u706B\u6C14\u5341\u8DB3\u3002",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_031",
          "poi_034"
        ],
        priorityScore: 82
      },
      {
        id: "poi_033",
        name: "\u4ED9\u6E56\u690D\u7269\u56ED",
        type: "\u4F11\u95F2\u5A31\u4E50",
        subType: "\u751F\u6001\u4F11\u95F2\u666F\u533A",
        address: "\u7F57\u6E56\u533A\u83B2\u5858\u4ED9\u6E56\u8DEF 160 \u53F7",
        area: "\u7F57\u6E56\u533A",
        businessDistrict: "\u7F57\u6E56\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u7F57\u6E56\u6162\u901B\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 4.9,
        reviewCount: 10354,
        tags: [
          "\u7597\u6108",
          "\u6587\u5316",
          "\u6237\u5916",
          "\u89E3\u538B"
        ],
        limits: [
          "\u5BA4\u5916",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 240,
        openTime: "08:00-18:00",
        queueLevel: "medium",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_033",
        reason: "\u57CE\u5E02\u5929\u7136\u6C27\u5427\uFF0C\u7EFF\u690D\u7E41\u591A\uFF0C\u517C\u5177\u4F11\u95F2\u4E0E\u7948\u798F\u529F\u80FD\u3002",
        blindBoxThemes: [
          "\u81EA\u7136\u653E\u677E\u76D2",
          "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: [
          "poi_034",
          "poi_035"
        ],
        priorityScore: 86
      },
      {
        id: "poi_034",
        name: "\u6D77\u4E0A\u7530\u56ED",
        type: "\u4F11\u95F2\u5A31\u4E50",
        subType: "\u751F\u6001\u4F11\u95F2\u666F\u533A",
        address: "\u5B9D\u5B89\u533A\u6C99\u4E95\u8857\u9053\u6C11\u4E3B\u5927\u9053",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 0,
        priceLevel: "price_le_150",
        meituanRating: 4.5,
        reviewCount: 17230,
        tags: [
          "\u62CD\u7167",
          "\u7597\u6108",
          "\u6237\u5916",
          "\u8FD0\u52A8"
        ],
        limits: [
          "\u5BA4\u5916"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 210,
        openTime: "9:00-18:00",
        queueLevel: "low",
        distanceLevel: "10km\u4EE5\u4E0A",
        mockMeituanUrl: "mock://meituan/poi_034",
        reason: "\u6EE8\u6D77\u751F\u6001\u7530\u56ED\u666F\u533A\uFF0C\u8FDC\u79BB\u95F9\u5E02\uFF0C\u9002\u5408\u6162\u8282\u594F\u653E\u677E\u3002",
        blindBoxThemes: [
          "\u81EA\u7136\u653E\u677E\u76D2",
          "\u5C0F\u4F17\u6E05\u51C0\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: [
          "poi_033",
          "poi_036"
        ],
        priorityScore: 80
      },
      {
        id: "poi_035",
        name: "\u661F\u6CB3 COCO Park",
        type: "\u4F11\u95F2\u5A31\u4E50",
        subType: "\u4F11\u95F2\u7EFC\u5408\u4F53",
        address: "\u798F\u7530\u533A\u798F\u534E\u4E09\u8DEF 269 \u53F7",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 0,
        priceLevel: "price_le_150",
        meituanRating: 4.8,
        reviewCount: 8222,
        tags: [
          "\u7F8E\u98DF",
          "\u751C\u54C1",
          "\u5496\u5561",
          "\u62CD\u7167"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u665A\u4E0A\u53EF\u53BB"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 150,
        openTime: "10:00 - \u6B21\u65E5 02:00",
        queueLevel: "medium",
        distanceLevel: "3km\u5185",
        mockMeituanUrl: "mock://meituan/poi_035",
        reason: "\u798F\u7530\u6838\u5FC3\u6F6E\u6D41\u4F11\u95F2\u5730\uFF0C\u5A31\u4E50\u805A\u9910\u805A\u4F1A\u4E00\u7AD9\u5F0F\u89E3\u51B3\u3002",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u591C\u751F\u6D3B\u6C1B\u56F4\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_031",
          "poi_037"
        ],
        priorityScore: 83
      },
      {
        id: "poi_036",
        name: "\u58F9\u65B9\u57CE",
        type: "\u4F11\u95F2\u5A31\u4E50",
        subType: "\u4F11\u95F2\u7EFC\u5408\u4F53",
        address: "\u5B9D\u5B89\u533A\u65B0\u5B89\u8857\u9053\u65B0\u6E56\u8DEF 99 \u53F7",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 0,
        priceLevel: "price_le_150",
        meituanRating: 4.9,
        reviewCount: 12163,
        tags: [
          "\u7F8E\u98DF",
          "\u751C\u54C1",
          "\u5496\u5561",
          "\u62CD\u7167"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u665A\u4E0A\u53EF\u53BB"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 180,
        openTime: "10:00-22:00",
        queueLevel: "medium",
        distanceLevel: "10km\u4EE5\u4E0A",
        mockMeituanUrl: "mock://meituan/poi_036",
        reason: "\u5B9D\u5B89\u8D85\u5927\u5546\u5708\uFF0C\u5403\u559D\u73A9\u4E50\u4E00\u7AD9\u5F0F\u4F11\u95F2\u5A31\u4E50\u805A\u96C6\u5730\u3002",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_035",
          "poi_038"
        ],
        priorityScore: 84
      },
      {
        id: "poi_037",
        name: "\u6DF1\u5733\u6E7E\u516C\u56ED",
        type: "\u4F11\u95F2\u5A31\u4E50",
        subType: "\u4F11\u95F2\u516C\u56ED",
        address: "\u5357\u5C71\u533A\u6EE8\u6D77\u5927\u9053\uFF08\u798F\u7530-\u5357\u5C71\u4EA4\u754C\uFF09",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 0,
        priceLevel: "price_le_50",
        meituanRating: 4.9,
        reviewCount: 15564,
        tags: [
          "\u62CD\u7167",
          "\u7597\u6108",
          "\u6587\u5316",
          "\u6237\u5916"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u665A\u4E0A\u53EF\u53BB",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 120,
        openTime: "6:00-23:00",
        queueLevel: "high",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_037",
        reason: "\u6DF1\u5733\u201C\u57CE\u5E02\u7EFF\u80BA\u201D\uFF0C\u7EA2\u6811\u6797 + \u6D77\u5CB8\u7EBF\uFF0C\u9A91\u884C\u3001\u770B\u65E5\u843D\u3001\u89C2\u9E1F\u7EDD\u4F73\u5730\u3002",
        blindBoxThemes: [
          "\u81EA\u7136\u653E\u677E\u76D2",
          "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: true,
        replaceableBy: [
          "poi_033",
          "poi_039"
        ],
        priorityScore: 87
      },
      {
        id: "poi_038",
        name: "\u5927\u60A6\u57CE",
        type: "\u4F11\u95F2\u5A31\u4E50",
        subType: "\u4F11\u95F2\u7EFC\u5408\u4F53",
        address: "\u5B9D\u5B89\u533A\u524D\u8FDB\u4E00\u8DEF\u4E0E\u521B\u4E1A\u4E8C\u8DEF\u4EA4\u6C47\u5904",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 0,
        priceLevel: "price_le_150",
        meituanRating: 4.8,
        reviewCount: 2230,
        tags: [
          "\u7F8E\u98DF",
          "\u751C\u54C1",
          "\u5496\u5561",
          "\u62CD\u7167"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u96E8\u5929\u53EF\u53BB",
          "\u665A\u4E0A\u53EF\u53BB"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 180,
        openTime: "10:00-22:00",
        queueLevel: "medium",
        distanceLevel: "10km\u4EE5\u4E0A",
        mockMeituanUrl: "mock://meituan/poi_038",
        reason: "\u5B9D\u5B89\u5927\u578B\u5546\u573A\uFF0C\u53CC\u5DE8\u5E55\u5F71\u57CE + \u6F6E\u73A9 + \u9910\u996E\uFF0C\u4E00\u7AD9\u5F0F\u4F11\u95F2\u3002",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_036",
          "poi_035"
        ],
        priorityScore: 82
      },
      {
        id: "poi_039",
        name: "\u987A\u5FB7\u516C\xB7\u732A\u809A\u9E21",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u7CA4\u83DC",
        address: "\u798F\u7530\u533A\u8F66\u516C\u5E99\u6CF0\u7136\u56DB\u8DEF\u6CF0\u7136\u79D1\u6280\u56ED210\u680B",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 100,
        priceLevel: "price_le_150",
        meituanRating: 4.3,
        reviewCount: 381,
        tags: [
          "\u7F8E\u98DF"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u540C\u4E8B"
        ],
        stayMinutes: 110,
        openTime: "11:00-23:00",
        queueLevel: "high",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_039",
        reason: "\u88AB\u8A89\u4E3A\u201C\u6DF1\u5733\u732A\u809A\u9E21\u7B2C1\u540D\u201D\uFF0C\u6C64\u5E95\u7528\u732A\u7B52\u9AA8\u71AC\u5236\uFF0C\u9E21\u8089\u9C9C\u5AE9\u5165\u5473",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u670B\u53CB\u5C0F\u805A\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_040",
          "poi_041"
        ],
        priorityScore: 82
      },
      {
        id: "poi_040",
        name: "\u5FA1\u725B\u7EAA\u5CA9\u70E4\u725B\u6392",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u897F\u9910/\u725B\u6392",
        address: "\u5357\u5C71\u533A\u6D77\u5CB8\u57CE\u5546\u5708\uFF08\u4FDD\u5229\u6587\u5316\u5E7F\u573A\uFF09",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 120,
        priceLevel: "price_le_150",
        meituanRating: 4.8,
        reviewCount: 536,
        tags: [
          "\u7F8E\u98DF"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 80,
        openTime: "11:00-22:30",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_040",
        reason: "\u5CA9\u70E4\u725B\u6392\u642D\u914D\u521B\u610F\u610F\u9762\u9E21\u7FC5\uFF0C\u6C1B\u56F4\u6D6A\u6F2B\uFF0C\u662F\u7EA6\u4F1A\u805A\u9910\u7684\u597D\u53BB\u5904",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u60C5\u4FA3\u7EA6\u4F1A\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_039",
          "poi_042"
        ],
        priorityScore: 85
      },
      {
        id: "poi_041",
        name: "\u897F\u5854\u8001\u592A\u592A\u6CE5\u7089\u70E4\u8089",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u5DDD\u83DC",
        address: "\u5357\u5C71\u533A\u62DB\u5546\u8857\u9053\u6843\u82B1\u56ED\u793E\u533A\u7F8E\u5E74\u5E7F\u573A1\u680B",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 80,
        priceLevel: "price_le_100",
        meituanRating: 3.9,
        reviewCount: 536,
        tags: [
          "\u6027\u4EF7\u6BD4"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB"
        ],
        stayMinutes: 60,
        openTime: "10:00-22:00",
        queueLevel: "medium",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_041",
        reason: "\u6CE5\u7089\u70E4\u8089\u70ED\u95E8\u54C1\u724C\uFF0C\u7279\u8272\u9EBB\u9171\u642D\u914D\u70AD\u70E4\uFF0C\u8089\u9999\u6D53\u90C1\uFF0C\u6027\u4EF7\u6BD4\u9AD8",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u670B\u53CB\u5C0F\u805A\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_040",
          "poi_043"
        ],
        priorityScore: 78
      },
      {
        id: "poi_042",
        name: "\u6765\u83DC\xB7\u6E56\u5317\u5934\u724C\u85D5\u6C64",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u6E56\u5317\u83DC",
        address: "\u798F\u7530\u533A\u798F\u534E\u4E00\u8DEF348\u53F7\u5353\u60A6\u4E2D\u5FC3\u897FB2\u5C42B2",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 90,
        priceLevel: "price_le_150",
        meituanRating: 4.5,
        reviewCount: 2678,
        tags: [
          "\u7F8E\u98DF"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 60,
        openTime: "10:30-21:30",
        queueLevel: "high",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_042",
        reason: "\u73B0\u7168\u85D5\u6C64\u9C9C\u6D53\u5165\u5473\uFF0C\u70ED\u83DC\u73B0\u7092\u5F88\u4E0B\u996D\uFF0C\u6E56\u5317\u98CE\u5473\u5730\u9053",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u5BB6\u5EAD\u805A\u9910\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_041",
          "poi_044"
        ],
        priorityScore: 83
      },
      {
        id: "poi_043",
        name: "\u674E\u5C0F\u592A\xB7\u70E7\u70E4",
        type: "\u8F7B\u98DF\u751C\u996E",
        subType: "\u70E7\u70E4",
        address: "\u798F\u7530\u533A\u6C99\u5934\u8857\u9053\u6C99\u5C3E\u793E\u533A\u6C99\u5C3E\u4E1C\u675144-1\u53F7",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 80,
        priceLevel: "price_le_150",
        meituanRating: 4.7,
        reviewCount: 381,
        tags: [
          "\u7F8E\u98DF"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u665A\u4E0A\u53EF\u53BB"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u540C\u4E8B"
        ],
        stayMinutes: 110,
        openTime: "10:00-04:00",
        queueLevel: "medium",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_043",
        reason: "\u9547\u5E97\u70E4\u4E32\u548C\u5C0F\u9F99\u867E\u53E3\u7891\u62C9\u6EE1\uFF0C\u6027\u4EF7\u6BD4\u9AD8\uFF0C\u591C\u5BB5\u6C1B\u56F4\u597D",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u591C\u751F\u6D3B\u6C1B\u56F4\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_044",
          "poi_045"
        ],
        priorityScore: 81
      },
      {
        id: "poi_044",
        name: "\u8521\u697C",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u7CA4\u83DC\u3001\u5E7F\u5F0F\u65E9\u8336",
        address: "\u7F57\u6E56\u533A\u6842\u56ED\u8857\u9053\u5B9D\u5B89\u5357\u8DEF2078\u53F7\u6DF1\u6E2F\u8C6A\u82D1",
        area: "\u7F57\u6E56\u533A",
        businessDistrict: "\u7F57\u6E56\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u7F57\u6E56\u6162\u901B\u5708",
        price: 60,
        priceLevel: "price_le_150",
        meituanRating: 4.6,
        reviewCount: 52574,
        tags: [
          "\u7F8E\u98DF"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB"
        ],
        stayMinutes: 80,
        openTime: "10:00-22:00",
        queueLevel: "high",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_044",
        reason: "\u6DF1\u5733\u65E9\u8336\u754C\u7684\u201C\u6392\u961F\u738B\u201D\uFF0C\u73AF\u5883\u590D\u53E4\uFF0C\u575A\u6301\u5373\u70B9\u5373\u84B8\uFF0C\u70B9\u5FC3\u65B0\u9C9C",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u4EB2\u5B50\u8F7B\u677E\u653E\u7535\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_043",
          "poi_046"
        ],
        priorityScore: 84
      },
      {
        id: "poi_045",
        name: "\u5E84\u5468\u8FC7\u6C34\u9C7C",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u5DDD\u83DC\u9986",
        address: "\u5357\u5C71\u533A\u8BE6\u7EC6\u5730\u5740",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 70,
        priceLevel: "price_le_150",
        meituanRating: 3.9,
        reviewCount: 536,
        tags: [
          "\u6027\u4EF7\u6BD4"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3",
          "\u540C\u4E8B"
        ],
        stayMinutes: 60,
        openTime: "10:00-22:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_045",
        reason: "\u4E3B\u6253\u8FC7\u6C34\u9C7C\uFF0C\u9C7C\u8089\u9C9C\u5AE9\uFF0C\u9EBB\u8FA3\u5165\u5473\uFF0C\u5DDD\u5473\u5730\u9053",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u670B\u53CB\u5C0F\u805A\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_044",
          "poi_047"
        ],
        priorityScore: 79
      },
      {
        id: "poi_046",
        name: "\u9E1F\u9E4F\u70E7\u9E1F\u5C45\u9152\u5C4B",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u65E5\u6599",
        address: "\u5357\u5C71\u533A\u8BE6\u7EC6\u5730\u5740",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 120,
        priceLevel: "price_le_150",
        meituanRating: 4.8,
        reviewCount: 536,
        tags: [
          "\u7F8E\u98DF"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 120,
        openTime: "10:00-22:00",
        queueLevel: "medium",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_046",
        reason: "\u70AD\u706B\u73B0\u70E4\u70E7\u9E1F+\u6C1B\u56F4\u611F\u5C45\u9152\u5C4B\uFF0C\u662F\u4E0B\u73ED\u5C0F\u914C\u7684\u597D\u53BB\u5904",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u591C\u751F\u6D3B\u6C1B\u56F4\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_045",
          "poi_048"
        ],
        priorityScore: 83
      },
      {
        id: "poi_047",
        name: "\u94C1\u61A8\u61A8\u91CD\u5E86\u5730\u644A\u8001\u706B\u9505",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u706B\u9505",
        address: "\u5B9D\u5B89\u533A\u9EC4\u7530\u8DEF\u897F11\u5DF71\u53F7",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 100,
        priceLevel: "price_le_100",
        meituanRating: 4.7,
        reviewCount: 2914,
        tags: [
          "\u7F8E\u98DF"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u665A\u4E0A\u53EF\u53BB"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u540C\u4E8B"
        ],
        stayMinutes: 110,
        openTime: "11:30-00:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_047",
        reason: "\u4E3B\u6253\u91CD\u5E86\u5730\u644A\u98CE\u5473\u8001\u706B\u9505\uFF0C\u9505\u5E95\u70ED\u83DC\u73B0\u7092\u73B0\u5236\uFF0C\u5730\u9053\u5DDD\u6E1D\u9EBB\u8FA3\u53E3\u5473\uFF0C\u8FD1\u671F\u597D\u8BC4\u7387\u9AD8",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u670B\u53CB\u5C0F\u805A\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_048",
          "poi_049"
        ],
        priorityScore: 82
      },
      {
        id: "poi_048",
        name: "\u6B63\u80FD\u91CF\u8106\u8089\u9CA9\u706B\u9505",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u706B\u9505",
        address: "\u7F57\u6E56\u533A\u7231\u56FD\u8DEF3058-1\u53F7",
        area: "\u7F57\u6E56\u533A",
        businessDistrict: "\u7F57\u6E56\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u7F57\u6E56\u6162\u901B\u5708",
        price: 100,
        priceLevel: "price_le_100",
        meituanRating: 4.6,
        reviewCount: 52574,
        tags: [
          "\u7F8E\u98DF"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB"
        ],
        stayMinutes: 90,
        openTime: "10:00-22:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_048",
        reason: "\u4E3B\u6253\u4E13\u5229\u8106\u8089\u9CA9\uFF0C\u9C7C\u8089\u8106\u723DQ\u5F39\uFF0C\u662F\u7F57\u6E56\u8857\u574A\u591A\u5E74\u7684\u5473\u89C9\u8BB0\u5FC6",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u5BB6\u5EAD\u805A\u9910\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_047",
          "poi_050"
        ],
        priorityScore: 83
      },
      {
        id: "poi_049",
        name: "\u725B\u767E\u9C9C\u725B\u8169\u7172\u725B\u8089\u706B\u9505",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u706B\u9505",
        address: "\u5357\u5C71\u533A\u5357\u5934\u8857307\u53F7",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 100,
        priceLevel: "price_le_100",
        meituanRating: 3.9,
        reviewCount: 536,
        tags: [
          "\u7F8E\u98DF",
          "\u6027\u4EF7\u6BD4"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u60C5\u4FA3",
          "\u540C\u4E8B"
        ],
        stayMinutes: 90,
        openTime: "10:00-22:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_049",
        reason: "\u725B\u8089\u8D28\u91CF\u5F88\u9AD8\uFF0C\u725B\u8089\u5F88\u5AE9\u5F88\u9C9C\uFF0C\u6027\u4EF7\u6BD4\u5F88\u9AD8",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u670B\u53CB\u5C0F\u805A\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_048",
          "poi_051"
        ],
        priorityScore: 80
      },
      {
        id: "poi_050",
        name: "\u539F\u77F3\u725B\u6252",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u897F\u9910",
        address: "\u798F\u7530\u533A\u798F\u4E2D\u4E00\u8DEF\u6DF1\u5733\u4E66\u57CE\u4E2D\u5FC3\u57CE\u5317\u533A\u4E8C\u697CN229-2",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 130,
        priceLevel: "price_le_150",
        meituanRating: 4.8,
        reviewCount: 11536,
        tags: [
          "\u7F8E\u98DF",
          "\u62CD\u7167"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 80,
        openTime: "11:00-21:30",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_050",
        reason: "\u83DC\u54C1\u5473\u9053\u5F88\u597D\uFF0C\u6C99\u62C9\u5F88\u6E05\u723D\uFF0C\u6C64\u4E5F\u5F88\u597D\u559D\uFF0C\u9002\u5408\u7EA6\u4F1A\u805A\u9910",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u60C5\u4FA3\u7EA6\u4F1A\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_046",
          "poi_049"
        ],
        priorityScore: 84
      },
      {
        id: "poi_068",
        name: "Tamkoko\u6CF0\u67EF\u8336\u56ED",
        type: "\u8F7B\u98DF\u751C\u996E",
        subType: "\u6CF0\u56FD\u8336",
        address: "\u798F\u7530\u533A\u798F\u7530\u8857\u9053\u5353\u60A6\u4E2D\u5FC3\u4E1C\u533A\u8D1F1\u5C42185\u53F7",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 25,
        priceLevel: "price_le_50",
        meituanRating: 4.5,
        reviewCount: 1857,
        tags: [
          "\u7F8E\u98DF"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u670B\u53CB",
          "\u4EB2\u5B50"
        ],
        stayMinutes: 10,
        openTime: "10:00-22:00",
        queueLevel: "medium",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_068",
        reason: "\u8336\u5E95\u5F88\u7279\u522B\uFF0C\u6CF0\u56FD\u5976\u8336\u5473\u5F88\u6D53\u70C8\uFF0C\u9002\u5408\u65E5\u5E38\u6253\u5361\u548C\u670B\u53CB\u5C0F\u805A",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u901B\u8857\u8865\u7ED9\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_069",
          "poi_070"
        ],
        priorityScore: 77
      },
      {
        id: "poi_069",
        name: "\u559C\u8336 lab",
        type: "\u8F7B\u98DF\u751C\u996E",
        subType: "\u5976\u8336",
        address: "\u5357\u5C71\u533A\u6EE8\u6D77\u5927\u90532008\u53F7\u6B22\u4E50\u6D77\u5CB8\u66F2\u6C34\u6E7E",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 35,
        priceLevel: "price_le_50",
        meituanRating: 4.8,
        reviewCount: 11698,
        tags: [
          "\u7F8E\u98DF",
          "\u751C\u54C1"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 10,
        openTime: "11:00-22:30",
        queueLevel: "high",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_069",
        reason: "\u86CB\u7CD5\u79CD\u7C7B\u5F88\u5168\uFF0C\u8FD8\u6709\u5356gelato\uFF0C\u5B9E\u60E0\uFF0C\u9002\u5408\u4E0B\u5348\u8336\u548C\u670B\u53CB\u805A\u4F1A",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u4E0B\u5348\u8336\u60EC\u610F\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_068",
          "poi_071"
        ],
        priorityScore: 81
      },
      {
        id: "poi_070",
        name: "\u8336\u6EE1\u65B9\u5EAD",
        type: "\u8F7B\u98DF\u751C\u996E",
        subType: "\u5976\u8336",
        address: "\u798F\u7530\u533A\u5353\u60A6\u4E2D\u5FC3\u5317\u533A\u8D1F1\u5C42NB122\u53F7",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 20,
        priceLevel: "price_le_50",
        meituanRating: 4.5,
        reviewCount: 405,
        tags: [
          "\u7F8E\u98DF",
          "\u751C\u54C1"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u540C\u4E8B"
        ],
        stayMinutes: 10,
        openTime: "10:00-22:00",
        queueLevel: "medium",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_070",
        reason: "\u8336\u5E95\u5F88\u6D53\u70C8\uFF0C\u6027\u4EF7\u6BD4\u9AD8\uFF0C\u9002\u5408\u65E5\u5E38\u6253\u5361",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u901B\u8857\u8865\u7ED9\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_069",
          "poi_072"
        ],
        priorityScore: 76
      },
      {
        id: "poi_051",
        name: "\u8336\u5BF9\u5BF9(\u6843\u6E90\u5C45\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u996E\u54C1/\u5496\u5561\u9986",
        address: "\u5B9D\u5B89\u533A\u897F\u4E61\u8857\u9053\u6843\u6E90\u5C4511\u533A1-6\u680B",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 15,
        priceLevel: "price_le_50",
        meituanRating: 4.6,
        reviewCount: 116,
        tags: [
          "\u996E\u54C1",
          "\u9AD8\u6027\u4EF7\u6BD4",
          "\u9C9C\u679C\u9178\u5976"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 30,
        openTime: "10:00-22:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_051",
        reason: "\u4E3B\u6253\u9ED1\u829D\u9EBB\u767D\u7CEF\u7C73\u3001\u9EC4\u76AE\u6843\u9178\u5976\u7B49\u7279\u8272\u996E\u54C1\uFF0C\u53E3\u5473\u6E05\u65B0\uFF0C\u6027\u4EF7\u6BD4\u9AD8\uFF0C\u9002\u5408\u65E5\u5E38\u4E0B\u5348\u8336",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u4F11\u95F2\u5C0F\u61A9\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_052",
          "poi_053"
        ],
        priorityScore: 78
      },
      {
        id: "poi_052",
        name: "JEWELTEA \u73CD\u73E0\u5927\u5C06\u519B(\u6000\u5FB7\u4E07\u8C61\u6C47\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u996E\u54C1/\u5496\u5561\u9986",
        address: "\u5B9D\u5B89\u533A\u6000\u5FB7\u4E07\u8C61\u6C47A\u99863\u697CAL333\u53F7",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 20,
        priceLevel: "price_le_50",
        meituanRating: 4.7,
        reviewCount: 1174,
        tags: [
          "\u996E\u54C1",
          "\u9AD8\u6027\u4EF7\u6BD4",
          "\u53F0\u5F0F\u5976\u8336"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u65E0\u70DF\u9910\u5385"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 30,
        openTime: "10:00-22:30",
        queueLevel: "low",
        distanceLevel: "10km\u4EE5\u4E0A",
        mockMeituanUrl: "mock://meituan/poi_052",
        reason: "\u4E3B\u6253\u53F0\u5357\u98CE\u5473\u73CD\u73E0\u5976\u8336\uFF0C\u73CD\u73E0Q\u5F39\u6709\u56BC\u52B2\uFF0C\u8FD8\u6709\u7279\u8272\u86CB\u631E\u7B49\u5C0F\u98DF\uFF0C\u56DE\u5934\u5BA2\u591A\uFF0C\u54C1\u8D28\u7A33\u5B9A",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u901B\u8857\u6B47\u811A\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_051",
          "poi_054"
        ],
        priorityScore: 79
      },
      {
        id: "poi_053",
        name: "\u5415\u4E09\u5409\xB7\u751C\u98DF\u96C6\u5408\u5E97(\u5B9D\u5B89\u5927\u60A6\u57CE\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u751C\u54C1/\u996E\u54C1\u5E97",
        address: "\u5B9D\u5B89\u533A\u65B0\u5B89\u8857\u9053\u5B9D\u6C11\u793E\u533A25\u533A\u521B\u4E1A\u4E8C\u8DEF61\u53F7\u5927\u60A6\u57CE\u5546\u573A",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 24,
        priceLevel: "price_le_50",
        meituanRating: 4.6,
        reviewCount: 3017,
        tags: [
          "\u751C\u54C1",
          "\u996E\u54C1",
          "\u9AD8\u6027\u4EF7\u6BD4",
          "\u9C9C\u679C\u679C\u6C41"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u65E0\u70DF\u9910\u5385"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 40,
        openTime: "10:00-22:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_053",
        reason: "\u4E3B\u6253\u5C71\u91CE\u679C\u6C41\u7CFB\u5217\u548C\u6843\u80F6\u83B2\u5B50\u751C\u6C64\u7B49\u7279\u8272\u751C\u54C1\uFF0C\u9C9C\u679C\u98CE\u5473\u6E05\u65B0\uFF0C\u56DE\u5934\u5BA2\u591A\uFF0C\u9002\u5408\u65E5\u5E38\u6253\u5361",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u4E0B\u5348\u8336\u60EC\u610F\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_052",
          "poi_055"
        ],
        priorityScore: 78
      },
      {
        id: "poi_054",
        name: "\u9E3F\u8363\u767C\xB7\u6DF1\u5733\u5473\u9053(\u5B9D\u5B89\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u7CA4\u83DC/\u6D77\u9C9C\u5927\u6392\u6863",
        address: "\u5B9D\u5B89\u533A\u6D77\u79C0\u8DEF19\u53F7\u56FD\u9645\u897F\u5CB8\u5546\u52A1\u5927\u53A6101",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 97,
        priceLevel: "price_le_100",
        meituanRating: 4.5,
        reviewCount: 7183,
        tags: [
          "\u7CA4\u83DC",
          "\u6D77\u9C9C",
          "\u8001\u5B57\u53F7",
          "\u672C\u5730\u7279\u8272"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u6709\u5305\u95F4",
          "\u6709\u5927\u684C"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u540C\u4E8B",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 120,
        openTime: "11:00-14:00, 17:00-00:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_054",
        reason: "\u672C\u5730\u7ECF\u8425\u591A\u5E74\u7684\u7CA4\u83DC\u8001\u5E97\uFF0C\u4E3B\u6253\u91D1\u724C\u8C49\u6CB9\u7687\u867E\u7B49\u6DF1\u5733\u98CE\u5473\u6D77\u9C9C\uFF0C\u70ED\u83DC\u73B0\u7092\u73B0\u5236\uFF0C\u53E3\u5473\u5730\u9053",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u5BB6\u5EAD\u805A\u9910\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_055",
          "poi_056"
        ],
        priorityScore: 83
      },
      {
        id: "poi_055",
        name: "\u6CF0\u5FD9\u5FD9\xB7\u6CF0\u56FD\u6599\u7406(\u677E\u5C97\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u4E1C\u5357\u4E9A\u83DC/\u6CF0\u56FD\u6599\u7406",
        address: "\u5B9D\u5B89\u533A\u677E\u6D9B\u793E\u533A\u4E1C\u65B0\u885729\u53F7101\u53F7",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 44,
        priceLevel: "price_le_50",
        meituanRating: 4.7,
        reviewCount: 3839,
        tags: [
          "\u4E1C\u5357\u4E9A\u83DC",
          "\u6CF0\u56FD\u6599\u7406",
          "\u9AD8\u6027\u4EF7\u6BD4",
          "\u597D\u8BC4\u699C\u63A8\u8350"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u65E0\u70DF\u9910\u5385"
        ],
        fitPeople: [
          "\u670B\u53CB",
          "\u60C5\u4FA3",
          "\u4EB2\u5B50"
        ],
        stayMinutes: 90,
        openTime: "10:30-14:00, 16:00-22:00",
        queueLevel: "medium",
        distanceLevel: "10km\u4EE5\u4E0A",
        mockMeituanUrl: "mock://meituan/poi_055",
        reason: "\u5B9D\u5B89\u533A\u4E1C\u5357\u4E9A\u83DC\u597D\u8BC4\u699C\u7B2C3\u540D\uFF0C\u8FD1\u671F\u597D\u8BC4\u7387\u9AD8\uFF0C\u4E3B\u6253\u5730\u9053\u6CF0\u56FD\u98CE\u5473\u83DC\u54C1\uFF0C\u6027\u4EF7\u6BD4\u9AD8\uFF0C\u9002\u5408\u591A\u4EBA\u805A\u9910",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u60C5\u4FA3\u7EA6\u4F1A\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_054",
          "poi_057"
        ],
        priorityScore: 82
      },
      {
        id: "poi_056",
        name: "\u516B\u6761\u53CB\u9C9C\u8D27\u70E7\u70E4\xB7\u8106\u76AE\u70E4\u9C7C(\u677E\u5C97\u6EE1\u4EAC\u534E\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u70E7\u70E4/\u70E4\u9C7C",
        address: "\u5B9D\u5B89\u533A\u6C99\u6D66\u827A\u5C55\u56DB\u8DEF6\u53F7\u827A\u672F\u5C0F\u95471\u53F7\u697CT1-020\u5BA4",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 56,
        priceLevel: "price_50_100",
        meituanRating: 4.6,
        reviewCount: 3589,
        tags: [
          "\u70E7\u70E4",
          "\u70E4\u9C7C",
          "\u4EBA\u6C14\u699C\u63A8\u8350",
          "\u8FDE\u9501\u54C1\u724C"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u6709\u5305\u95F4",
          "\u6709\u5927\u684C"
        ],
        fitPeople: [
          "\u670B\u53CB",
          "\u540C\u4E8B",
          "\u4EB2\u5B50"
        ],
        stayMinutes: 120,
        openTime: "17:00-03:00",
        queueLevel: "medium",
        distanceLevel: "10km\u4EE5\u4E0A",
        mockMeituanUrl: "mock://meituan/poi_056",
        reason: "\u677E\u5C97\u70E7\u70E4\u4EBA\u6C14\u699C\u7B2C1\u540D\uFF0C\u4E3B\u6253\u79E6\u5DDD\u9EC4\u725B\u8089\u70E7\u70E4\u4E0E\u8106\u76AE\u70E4\u9C7C\uFF0C\u9C9C\u8D27\u73B0\u70E4\uFF0C\u9002\u5408\u591C\u5BB5\u805A\u4F1A",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u591C\u751F\u6D3B\u6C1B\u56F4\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_055",
          "poi_058"
        ],
        priorityScore: 81
      },
      {
        id: "poi_057",
        name: "\u67F4\u706B\u996D\u5E97(\u6B65\u6D8C\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u5DDD\u6E58\u83DC",
        address: "\u5B9D\u5B89\u533A\u6C99\u4E95\u8DEF613\u53F7\uFF08\u5927\u6DA6\u79D1\u6280\u5927\u53A6\u4E00\u697C\u5E97\u94FA\uFF09",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 60,
        priceLevel: "price_50_100",
        meituanRating: 5,
        reviewCount: 2618,
        tags: [
          "\u5DDD\u6E58\u83DC",
          "\u8FDE\u9501\u54C1\u724C",
          "\u597D\u8BC4\u699C\u63A8\u8350"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u6709\u5305\u95F4",
          "\u6709\u5927\u684C"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u540C\u4E8B"
        ],
        stayMinutes: 120,
        openTime: "11:00-14:00, 17:00-21:00",
        queueLevel: "low",
        distanceLevel: "10km\u4EE5\u4E0A",
        mockMeituanUrl: "mock://meituan/poi_057",
        reason: "\u6C99\u4E95\u5546\u5708\u5DDD\u6E58\u83DC\u597D\u8BC4\u699C\u7B2C4\u540D\uFF0C\u4E3B\u6253\u6E56\u5357\u975E\u9057\u9EC4\u7116\u5927\u5934\u9C7C\u7B49\u67F4\u706B\u98CE\u5473\u83DC\u54C1\uFF0C\u53E3\u5473\u5730\u9053\uFF0C\u56DE\u5934\u5BA2\u591A",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u56E2\u5EFA\u6B22\u805A\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_056",
          "poi_059"
        ],
        priorityScore: 84
      },
      {
        id: "poi_058",
        name: "\u82B3\u534E\xB7\u610F\u7538\u56ED\u897F\u9910\u5496\u5561\u9986(\u6EE1\u4EAC\u534E\u6EE1\u7EB7\u5929\u5730\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u897F\u9910/\u5496\u5561\u9986",
        address: "\u5B9D\u5B89\u533A\u827A\u5C55\u4E09\u8DEF\u6EE1\u4EAC\u534E\xB7\u6EE1\u7EB7\u5929\u5730\u8857\u533A\u6EE1\u7EB7\u6C471\u697CT1-1",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 100,
        priceLevel: "price_le_100",
        meituanRating: 4.6,
        reviewCount: 3294,
        tags: [
          "\u897F\u9910",
          "\u5496\u5561\u9986",
          "\u4EBA\u6C14\u699C\u63A8\u8350",
          "\u6D6A\u6F2B\u7EA6\u4F1A"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u6709\u5305\u95F4",
          "\u6709\u5927\u684C"
        ],
        fitPeople: [
          "\u60C5\u4FA3",
          "\u670B\u53CB",
          "\u5355\u4EBA"
        ],
        stayMinutes: 120,
        openTime: "10:00-23:00",
        queueLevel: "medium",
        distanceLevel: "10km\u4EE5\u4E0A",
        mockMeituanUrl: "mock://meituan/poi_058",
        reason: "\u677E\u5C97\u5496\u5561\u4EBA\u6C14\u699C\u7B2C4\u540D\uFF0C\u8FD1\u671F\u597D\u8BC4\u7387\u9AD8\uFF0C\u4E3B\u6253\u725B\u6392\u897F\u9910\u4E0E\u4E0B\u5348\u8336\uFF0C\u9002\u5408\u6D6A\u6F2B\u7EA6\u4F1A\u548C\u670B\u53CB\u805A\u4F1A",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u60C5\u4FA3\u7EA6\u4F1A\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_057",
          "poi_060"
        ],
        priorityScore: 83
      },
      {
        id: "poi_059",
        name: "\u82B8\u5C71\u5B63\xB7\u4E91\u5357\u5C71\u73CD\u83CC\u706B\u9505(\u6B22\u4E50\u6E2F\u6E7E\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u706B\u9505/\u83CC\u83C7\u706B\u9505",
        address: "\u5B9D\u5B89\u533A\u6B22\u4E50\u6E2F\u6E7E\u4E1C\u5CB83\u697CL3-004\u5BA4",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 105,
        priceLevel: "price_100_plus",
        meituanRating: 4.6,
        reviewCount: 7858,
        tags: [
          "\u706B\u9505",
          "\u83CC\u83C7\u706B\u9505",
          "\u8FDE\u9501\u54C1\u724C",
          "\u597D\u8BC4\u699C\u63A8\u8350"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u65E0\u70DF\u9910\u5385",
          "\u6709\u5927\u684C"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u540C\u4E8B",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 120,
        openTime: "11:00-22:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_059",
        reason: "\u5B9D\u5B89\u4E2D\u5FC3\u533A\u706B\u9505\u597D\u8BC4\u699C\u7B2C5\u540D\uFF0C\u4E3B\u6253\u4E91\u5357\u5C71\u73CD\u83CC\u83C7\u706B\u9505\uFF0C\u53EF\u8FB9\u5403\u8FB9\u8D4F\u6469\u5929\u8F6E\u591C\u666F\uFF0C\u56DE\u5934\u5BA2\u4F17\u591A",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u591C\u666F\u4F11\u95F2\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_058",
          "poi_061"
        ],
        priorityScore: 85
      },
      {
        id: "poi_060",
        name: "\u8D8A\u5C0F\u54C1\xB7\u8D8A\u5357\u9910\u5385(\u6B22\u4E50\u6E2F\u6E7E\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u4E1C\u5357\u4E9A\u83DC/\u8D8A\u5357\u6599\u7406",
        address: "\u5B9D\u5B89\u533A\u6D77\u5E9C\u8DEF\u6B22\u4E50\u6E2F\u6E7E\u4E1C\u5CB8\u5317\u533AB1\u5C42044\u53F7",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 68,
        priceLevel: "price_50_100",
        meituanRating: 4.5,
        reviewCount: 3736,
        tags: [
          "\u4E1C\u5357\u4E9A\u83DC",
          "\u8D8A\u5357\u6599\u7406",
          "\u4EBA\u6C14\u699C\u63A8\u8350",
          "\u8001\u5B57\u53F7\u54C1\u724C"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u65E0\u70DF\u9910\u5385"
        ],
        fitPeople: [
          "\u670B\u53CB",
          "\u60C5\u4FA3",
          "\u4EB2\u5B50"
        ],
        stayMinutes: 90,
        openTime: "10:30-21:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_060",
        reason: "\u5B9D\u5B89\u533A\u4E1C\u5357\u4E9A\u83DC\u4EBA\u6C14\u699C\u7B2C8\u540D\uFF0C\u662F\u5F00\u4E1A\u591A\u5E74\u7684\u5730\u9053\u8D8A\u5357\u98CE\u5473\u54C1\u724C\uFF0C\u4E3B\u6253\u8D8A\u5357\u7279\u8272\u83DC\u54C1\uFF0C\u6027\u4EF7\u6BD4\u9AD8",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u5F02\u57DF\u98CE\u5473\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_059",
          "poi_062"
        ],
        priorityScore: 80
      },
      {
        id: "poi_061",
        name: "\u8363\u8BB0\xB7\u8C46\u82B1\xB7\u8336\u9910\u5385(\u6B22\u4E50\u6E2F\u6E7E\xB7\u7C73\u57CE\u5E02\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u8336\u9910\u5385/\u6E2F\u5F0F\u98CE\u5473",
        address: "\u5B9D\u5B89\u533A\u91D1\u79D1\u8DEF\u534E\u4FA8\u57CE\u6B22\u4E50\u6E2F\u6E7E\u897F\u5CB8\u7C73\u57CE\u5E02\u65B0\u5929\u5730L1-012",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 48,
        priceLevel: "price_le_50",
        meituanRating: 4.6,
        reviewCount: 1930,
        tags: [
          "\u8336\u9910\u5385",
          "\u6E2F\u5F0F\u98CE\u5473",
          "\u9AD8\u6027\u4EF7\u6BD4"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u6709\u5927\u684C"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u670B\u53CB",
          "\u4EB2\u5B50"
        ],
        stayMinutes: 60,
        openTime: "10:30-21:30",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_061",
        reason: "\u4E3B\u6253\u6E2F\u5F0F\u725B\u8169\u725B\u6742\u7172\u4E0E\u62DB\u724C\u8C46\u82B1\uFF0C\u6027\u4EF7\u6BD4\u9AD8\uFF0C\u9002\u5408\u65E5\u5E38\u7528\u9910\u548C\u670B\u53CB\u5C0F\u805A",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u7B80\u9910\u9971\u8179\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_060",
          "poi_063"
        ],
        priorityScore: 79
      },
      {
        id: "poi_062",
        name: "YO!TEA \u6709\u8336(\u5B9D\u5B89\u6D77\u96C5\u7F24\u7EB7\u57CE\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u996E\u54C1/\u679C\u8336\u5E97",
        address: "\u5B9D\u5B89\u533A\u5EFA\u5B89\u4E00\u8DEF99\u53F7\u6D77\u96C5\u7F24\u7EB7\u57CE\u8D2D\u7269\u4E2D\u5FC3\u8D1F1\u5C42B163",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 23,
        priceLevel: "price_le_50",
        meituanRating: 4.3,
        reviewCount: 20666,
        tags: [
          "\u996E\u54C1",
          "\u679C\u8336",
          "\u8FDE\u9501\u54C1\u724C",
          "\u6DF1\u5733\u672C\u571F\u4EE3\u8868"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 30,
        openTime: "10:00-21:30",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_062",
        reason: "\u6DF1\u5733\u672C\u571F\u679C\u8336\u4EE3\u8868\u54C1\u724C\uFF0C\u4E3B\u6253\u62DB\u724C\u65B9\u676F\u6C34\u679C\u8336\uFF0C\u6027\u4EF7\u6BD4\u9AD8\uFF0C\u662F\u5F00\u4E1A\u591A\u5E74\u7684\u8FDE\u9501\u8001\u5E97",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u901B\u8857\u8865\u7ED9\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_061",
          "poi_064"
        ],
        priorityScore: 77
      },
      {
        id: "poi_063",
        name: "\u9C9C\u6F6D\u84B8\u6C7D\u77F3\u9505\u9C7C(\u6B22\u4E50\u6D77\u5CB8\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u706B\u9505/\u84B8\u6C7D\u77F3\u9505\u9C7C",
        address: "\u5357\u5C71\u533A\u6EE8\u6D77\u5927\u90532008\u53F7\u6B22\u4E50\u6D77\u5CB8\u66F2\u6C34\u6E7E2\u680B\u8D1F1\u697CH\u53F7",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 102,
        priceLevel: "price_100_plus",
        meituanRating: 4.5,
        reviewCount: 10864,
        tags: [
          "\u706B\u9505",
          "\u84B8\u6C7D\u77F3\u9505\u9C7C",
          "\u4EBA\u6C14\u699C\u63A8\u8350",
          "\u4E91\u5357\u98CE\u5473"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u65E0\u70DF\u9910\u5385",
          "\u6709\u5305\u95F4"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u540C\u4E8B"
        ],
        stayMinutes: 120,
        openTime: "11:00-22:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_063",
        reason: "\u6B22\u4E50\u6D77\u5CB8\u7F8E\u98DF\u4EBA\u6C14\u699C\u7B2C3\u540D\uFF0C\u4E3B\u6253\u4E91\u5357\u98CE\u5473\u84B8\u6C7D\u77F3\u9505\u9C7C\uFF0C\u98DF\u6750\u65B0\u9C9C\uFF0C\u7528\u9910\u73AF\u5883\u8212\u9002",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u5BB6\u5EAD\u805A\u9910\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_064",
          "poi_065"
        ],
        priorityScore: 82
      },
      {
        id: "poi_064",
        name: "\u8343\u56ED\xB7\u827A\u672F\u4E0B\u5348\u8336(\u6B22\u4E50\u6D77\u5CB8\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u5496\u5561\u9986/\u827A\u672F\u4E0B\u5348\u8336",
        address: "\u5357\u5C71\u533A\u767D\u77F3\u8DEF\u6B22\u4E50\u6D77\u5CB8\u5730\u666F\u5761\u8343\u56ED\u827A\u672F\u7A7A\u95F4",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 109,
        priceLevel: "price_100_plus",
        meituanRating: 5,
        reviewCount: 2223,
        tags: [
          "\u5496\u5561\u9986",
          "\u827A\u672F\u4E0B\u5348\u8336",
          "\u7279\u8272\u4F53\u9A8C",
          "\u9AD8\u8BC4\u5206"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u65E0\u70DF\u9910\u5385",
          "\u6709\u5927\u684C"
        ],
        fitPeople: [
          "\u60C5\u4FA3",
          "\u670B\u53CB",
          "\u5355\u4EBA"
        ],
        stayMinutes: 120,
        openTime: "10:30-18:30",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_064",
        reason: "\u9AD8\u8BC4\u5206\u827A\u672F\u4E3B\u9898\u4E0B\u5348\u8336\uFF0C\u63D0\u4F9B\u7279\u8272\u4E3B\u9898\u5957\u9910\uFF0C\u73AF\u5883\u96C5\u81F4\uFF0C\u9002\u5408\u6587\u827A\u6253\u5361\u548C\u4F11\u95F2\u7EA6\u4F1A",
        blindBoxThemes: [
          "\u6587\u827A\u6C1B\u56F4\u76D2",
          "\u60C5\u4FA3\u7EA6\u4F1A\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_063",
          "poi_066"
        ],
        priorityScore: 86
      },
      {
        id: "poi_065",
        name: "CP CAFE&3D\xB7JP\u62FC\u56FE(\u6DF1\u5733\u6B22\u4E50\u6D77\u5CB8\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u5496\u5561\u9986/\u4F11\u95F2\u4F53\u9A8C",
        address: "\u5357\u5C71\u533A\u767D\u77F3\u8DEF2033\u53F7\u6B22\u4E50\u6D77\u5CB8\u8D2D\u7269\u4E2D\u5FC3L1-049/050",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 48,
        priceLevel: "price_le_50",
        meituanRating: 4.7,
        reviewCount: 381,
        tags: [
          "\u5496\u5561\u9986",
          "\u62FC\u56FE\u4F53\u9A8C",
          "\u4EBA\u6C14\u699C\u63A8\u8350",
          "\u4F11\u95F2\u5A31\u4E50"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u6709\u5927\u684C"
        ],
        fitPeople: [
          "\u670B\u53CB",
          "\u60C5\u4FA3",
          "\u5355\u4EBA"
        ],
        stayMinutes: 90,
        openTime: "10:00-21:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_065",
        reason: "\u6B22\u4E50\u6D77\u5CB8\u5496\u5561\u4EBA\u6C14\u699C\u7B2C7\u540D\uFF0C\u7ED3\u5408\u5496\u5561\u4E0E\u62FC\u56FE\u4F53\u9A8C\uFF0C\u662F\u7279\u8272\u4F11\u95F2\u573A\u6240\uFF0C\u9002\u5408\u670B\u53CB\u5C0F\u805A",
        blindBoxThemes: [
          "\u8DA3\u5473\u4F11\u95F2\u76D2",
          "\u7F8E\u98DF\u6253\u5361\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_064",
          "poi_067"
        ],
        priorityScore: 81
      },
      {
        id: "poi_066",
        name: "\u534E\u82D1\u58F9\u53F7\xB7\u7CBE\u7EC6\u6F6E\u6C55\u83DC(\u6B22\u4E50\u6D77\u5CB8\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u7CA4\u83DC/\u6F6E\u6C55\u83DC",
        address: "\u5357\u5C71\u533A\u6D77\u56ED\u4E8C\u8DEF\u6B22\u4E50\u6D77\u5CB8\u66F2\u6C34\u6E7E1\u680BB\u5EA7",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 117,
        priceLevel: "price_100_plus",
        meituanRating: 4.2,
        reviewCount: 5523,
        tags: [
          "\u7CA4\u83DC",
          "\u6F6E\u6C55\u83DC",
          "\u4EBA\u6C14\u699C\u63A8\u8350",
          "\u5546\u52A1\u9996\u9009"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u6709\u5305\u95F4",
          "\u6709\u5927\u684C"
        ],
        fitPeople: [
          "\u540C\u4E8B",
          "\u4EB2\u5B50",
          "\u670B\u53CB"
        ],
        stayMinutes: 120,
        openTime: "10:00-14:00, 17:00-21:30",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_066",
        reason: "\u6B22\u4E50\u6D77\u5CB8\u7CA4\u83DC\u4EBA\u6C14\u699C\u7B2C4\u540D\uFF0C\u662F\u5F00\u4E1A\u591A\u5E74\u7684\u6F6E\u6C55\u8001\u5E97\uFF0C\u4E3B\u6253\u6B63\u5B97\u6F6E\u5DDE\u98CE\u5473\uFF0C\u9002\u5408\u5546\u52A1\u5BB4\u8BF7",
        blindBoxThemes: [
          "\u5546\u52A1\u5BB4\u8BF7\u76D2",
          "\u7F8E\u98DF\u6253\u5361\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_065",
          "poi_068"
        ],
        priorityScore: 80
      },
      {
        id: "poi_067",
        name: "\u7F8E\u5948\u5C0F\u9986\xB7\u4E1C\u5357\u4E9A\u83DC(\u6B22\u4E50\u6D77\u5CB8\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u4E1C\u5357\u4E9A\u83DC/\u8D8A\u5357\u6599\u7406",
        address: "\u5357\u5C71\u533A\u6EE8\u6D77\u5927\u90532008\u53F7\u6B22\u4E50\u6D77\u5CB8\u66F2\u6C34\u6E7E2\u680B2-\u96441\u8857",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 100,
        priceLevel: "price_le_100",
        meituanRating: 4.4,
        reviewCount: 5647,
        tags: [
          "\u4E1C\u5357\u4E9A\u83DC",
          "\u8D8A\u5357\u6599\u7406",
          "\u597D\u8BC4\u699C\u63A8\u8350",
          "\u6CB3\u666F\u9910\u5385"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u65E0\u70DF\u9910\u5385"
        ],
        fitPeople: [
          "\u60C5\u4FA3",
          "\u670B\u53CB",
          "\u4EB2\u5B50"
        ],
        stayMinutes: 90,
        openTime: "11:00-21:30",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_067",
        reason: "\u6B22\u4E50\u6D77\u5CB8\u7F8E\u98DF\u597D\u8BC4\u699C\uFF0C\u662F\u53EF\u4E34\u7A97\u89C2\u666F\u7684\u6CB3\u666F\u9910\u5385\uFF0C\u4E3B\u6253\u5730\u9053\u4E1C\u5357\u4E9A\u98CE\u5473\u83DC\u54C1",
        blindBoxThemes: [
          "\u5F02\u57DF\u98CE\u5473\u76D2",
          "\u6CB3\u666F\u7528\u9910\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_066",
          "poi_063"
        ],
        priorityScore: 79
      },
      {
        id: "poi_071",
        name: "\u672C\u7121\u5496\u5561\xB7BeanWood Coffee",
        type: "\u8F7B\u98DF\u751C\u996E",
        subType: "\u5976\u8336",
        address: "\u7F57\u6E56\u533A\u5317\u6597\u8DEF\u6587\u534E\u82B1\u56ED6\u680B1\u697C\u95E8\u9762",
        area: "\u7F57\u6E56\u533A",
        businessDistrict: "\u7F57\u6E56\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u7F57\u6E56\u6162\u901B\u5708",
        price: 30,
        priceLevel: "price_le_50",
        meituanRating: 4.9,
        reviewCount: 329,
        tags: [
          "\u5496\u5561",
          "\u62CD\u7167"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u670B\u53CB",
          "\u540C\u4E8B"
        ],
        stayMinutes: 10,
        openTime: "08:00-19:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_071",
        reason: "\u670D\u52A1\u5F88\u4EB2\u5207\u70ED\u60C5\uFF0C\u8212\u9002\u7684\u73AF\u5883\uFF0C\u9002\u5408\u6587\u827A\u6253\u5361\u548C\u670B\u53CB\u5C0F\u805A",
        blindBoxThemes: [
          "\u6587\u827A\u6C1B\u56F4\u76D2",
          "\u7F8E\u98DF\u6253\u5361\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_070",
          "poi_073"
        ],
        priorityScore: 80
      },
      {
        id: "poi_072",
        name: "\u5927\u826F\u9673\u8A18\u8001\u94FA\xB7\u987A\u5FB7\u53CC\u76AE\u5976",
        type: "\u8F7B\u98DF\u751C\u996E",
        subType: "\u7CA4\u83DC",
        address: "\u798F\u7530\u533A\u6C99\u5934\u8857\u9053\u6C99\u5C3E\u793E\u533A\u6C99\u5C3E\u4E1C\u675144-1\u53F7",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 25,
        priceLevel: "price_le_50",
        meituanRating: 4.7,
        reviewCount: 381,
        tags: [
          "\u7F8E\u98DF",
          "\u751C\u54C1"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u540C\u4E8B"
        ],
        stayMinutes: 20,
        openTime: "10:00-04:00",
        queueLevel: "medium",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_072",
        reason: "\u4E3B\u6253\u987A\u5FB7\u53CC\u76AE\u5976\u548C\u59DC\u649E\u5976\uFF0C\u5976\u9999\u6D53\u90C1\uFF0C\u53E3\u611F\u987A\u6ED1\uFF0C\u9002\u5408\u591C\u5BB5\u548C\u4E0B\u5348\u8336",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u591C\u751F\u6D3B\u6C1B\u56F4\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_073",
          "poi_074"
        ],
        priorityScore: 78
      },
      {
        id: "poi_073",
        name: "Shiftin' \u6D6E\u8D77\u5496\u5561\uFF08\u897F\u4E3D\u5E97\uFF09",
        type: "\u8F7B\u98DF\u751C\u996E",
        subType: "\u5496\u5561",
        address: "\u5357\u5C71\u533A\u5E73\u5C71\u4E00\u8DEF23\u53F7\uFF08\u534E\u91CC\u91CC\u5BD3\u65C1\uFF09",
        area: "\u5357\u5C71\u533A",
        businessDistrict: "\u5357\u5C71\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5357\u5C71\u6587\u827A\u5708",
        price: 28,
        priceLevel: "price_le_50",
        meituanRating: 4.8,
        reviewCount: 393,
        tags: [
          "\u5496\u5561"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u9884\u7B97\u53CB\u597D"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 20,
        openTime: "11:00-24:00",
        queueLevel: "medium",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_073",
        reason: "\u6E29\u99A8\u7684\u5C0F\u5E97\uFF0C\u8425\u4E1A\u65F6\u95F4\u957F\uFF0C\u9002\u5408\u6DF1\u591C\u653E\u677E\u548C\u670B\u53CB\u5C0F\u805A",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u6DF1\u591C\u653E\u677E\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_072",
          "poi_075"
        ],
        priorityScore: 79
      },
      {
        id: "poi_074",
        name: "\u59DC\u5927\u529B",
        type: "\u8F7B\u98DF\u751C\u996E",
        subType: "\u5976\u8336",
        address: "\u7F57\u6E56\u533A\u4E1C\u6653\u8857\u9053\u5929\u6CB3\u57CE\u8D2D\u7269\u4E2D\u5FC3\u7CA4\u6D77\u57CE\u5E97",
        area: "\u7F57\u6E56\u533A",
        businessDistrict: "\u7F57\u6E56\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u7F57\u6E56\u6162\u901B\u5708",
        price: 18,
        priceLevel: "price_le_50",
        meituanRating: 4.5,
        reviewCount: 405,
        tags: [
          "\u7F8E\u98DF",
          "\u751C\u54C1"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u540C\u4E8B"
        ],
        stayMinutes: 10,
        openTime: "10:00-22:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_074",
        reason: "\u4E3B\u6253\u517B\u751F\u8336\uFF0C\u53E3\u5473\u6E05\u65B0\uFF0C\u6027\u4EF7\u6BD4\u9AD8\uFF0C\u9002\u5408\u65E5\u5E38\u6253\u5361",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u517B\u751F\u8F7B\u996E\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_075",
          "poi_076"
        ],
        priorityScore: 76
      },
      {
        id: "poi_075",
        name: "Yee3\xB7\u4E09\u53F7\u6930\xB7\u6930\u5B50\u7092\u51B0\uFF08\u6DF1\u5733\u5927\u60A6\u57CE\u5E97\uFF09",
        type: "\u8F7B\u98DF\u751C\u996E",
        subType: "\u6930\u5B50\u7092\u51B0",
        address: "\u5B9D\u5B89\u533A\u65B0\u5B89\u8857\u9053\u5B9D\u6C11\u793E\u533A25\u533A\u521B\u4E1A\u4E8C\u8DEF61\u53F7",
        area: "\u5B9D\u5B89\u533A",
        businessDistrict: "\u5B9D\u5B89\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u5B9D\u5B89\u4F11\u95F2\u5708",
        price: 22,
        priceLevel: "price_le_50",
        meituanRating: 4.5,
        reviewCount: 405,
        tags: [
          "\u7F8E\u98DF",
          "\u751C\u54C1"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u540C\u4E8B"
        ],
        stayMinutes: 20,
        openTime: "10:00-22:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_075",
        reason: "\u989C\u503C\u5728\u7EBF\uFF0C\u51B0\u6C99\u7EC6\u817B\uFF0C\u6851\u845A\u5473\u5F88\u6B63\uFF0C\u4E0D\u9F41\u751C\uFF0C\u9002\u5408\u590F\u5929\u6253\u5361",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u590F\u65E5\u6E05\u723D\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_074",
          "poi_073"
        ],
        priorityScore: 77
      },
      {
        id: "poi_076",
        name: "\u8309\u9178\u5976(\u6DF1\u5733\u798F\u7530\u7687\u5EAD\u5E7F\u573A\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u996E\u54C1/\u9178\u5976\u5E97",
        address: "\u798F\u7530\u533A\u798F\u534E\u4E09\u8DEF118\u53F7G\u5C42\u8309\u9178\u5976\u5E97\u94FA",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 20,
        priceLevel: "price_le_50",
        meituanRating: 4.4,
        reviewCount: 1722,
        tags: [
          "\u996E\u54C1",
          "\u9178\u5976\u5976\u6614",
          "\u8FDE\u9501\u54C1\u724C",
          "\u4EBA\u6C14\u699C\u63A8\u8350"
        ],
        limits: [
          "\u5BA4\u5185"
        ],
        fitPeople: [
          "\u5355\u4EBA",
          "\u670B\u53CB",
          "\u60C5\u4FA3"
        ],
        stayMinutes: 20,
        openTime: "10:00-22:00",
        queueLevel: "medium",
        distanceLevel: "3km\u4EE5\u5185",
        mockMeituanUrl: "mock://meituan/poi_076",
        reason: "\u6DF1\u5733\u9178\u5976\u9C9C\u5976\u4EBA\u6C14\u699C\u5E97\u94FA\uFF0C\u4E3B\u6253\u725B\u6CB9\u679C\u3001\u9752\u82F9\u679C\u7B49\u53E3\u5473\u7684\u9178\u5976\u5976\u6614\uFF0C\u56DE\u5934\u5BA2\u4F17\u591A",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u901B\u8857\u6B47\u811A\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_077",
          "poi_078"
        ],
        priorityScore: 77
      },
      {
        id: "poi_077",
        name: "SAANCI\u5C71\u6C60\u5496\u5561(\u6DF1\u4E1A\u4E0A\u57CE\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u5496\u5561\u9986",
        address: "\u798F\u7530\u533A\u7687\u5C97\u8DEF5001\u53F7\u6DF1\u4E1A\u4E0A\u57CE\u5C0F\u9547L3\u5C42T3067\u53F7",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 40,
        priceLevel: "price_le_50",
        meituanRating: 4.7,
        reviewCount: 4984,
        tags: [
          "\u5496\u5561\u9986",
          "\u4EBA\u6C14\u699C\u63A8\u8350",
          "\u521B\u610F\u5496\u5561",
          "\u65E0\u70DF\u9910\u5385"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u65E0\u70DF\u9910\u5385"
        ],
        fitPeople: [
          "\u670B\u53CB",
          "\u5546\u52A1",
          "\u5355\u4EBA"
        ],
        stayMinutes: 45,
        openTime: "08:00-22:00",
        queueLevel: "low",
        distanceLevel: "3-10km",
        mockMeituanUrl: "mock://meituan/poi_077",
        reason: "\u798F\u7530\u4E2D\u5FC3\u5496\u5561\u4EBA\u6C14\u699C\u7B2C7\u540D\uFF0C\u4E3B\u6253\u521B\u610F\u5496\u5561\u4E0E\u7CBE\u54C1SOE\uFF0C\u73AF\u5883\u8212\u9002\u9002\u5408\u4F11\u95F2\u6253\u5361",
        blindBoxThemes: [
          "\u6587\u827A\u4F11\u95F2\u76D2",
          "\u4E0B\u5348\u8336\u60EC\u610F\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_076",
          "poi_079"
        ],
        priorityScore: 82
      },
      {
        id: "poi_078",
        name: "\u5BFF\u53F8\u90CE(\u5353\u60A6\u4E2D\u5FC3\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u65E5\u6599/\u5BFF\u53F8",
        address: "\u798F\u7530\u533A\u798F\u534E\u8DEFOneAvenue\u5353\u60A6\u4E2D\u5FC3\u4E1C\u533AB2\u5C42229\u53F7\u94FA",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 99,
        priceLevel: "price_le_100",
        meituanRating: 4.3,
        reviewCount: 6942,
        tags: [
          "\u65E5\u6599",
          "\u5BFF\u53F8",
          "\u56DE\u8F6C\u5BFF\u53F8",
          "\u9AD8\u6027\u4EF7\u6BD4"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u6709\u5B9D\u5B9D\u6905",
          "\u65E0\u70DF\u9910\u5385"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u5355\u4EBA"
        ],
        stayMinutes: 60,
        openTime: "11:00-22:00",
        queueLevel: "medium",
        distanceLevel: "3km\u4EE5\u5185",
        mockMeituanUrl: "mock://meituan/poi_078",
        reason: "\u4EBA\u6C14\u56DE\u8F6C\u5BFF\u53F8\u5E97\uFF0C\u63D0\u4F9B\u9AD8\u6027\u4EF7\u6BD4\u7684\u5BFF\u53F8\u4E0E\u523A\u8EAB\uFF0C\u9002\u5408\u65E5\u5E38\u7528\u9910\u548C\u5BB6\u5EAD\u805A\u9910",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u5BB6\u5EAD\u7B80\u9910\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_079",
          "poi_080"
        ],
        priorityScore: 79
      },
      {
        id: "poi_079",
        name: "\u8611\u754C\xB7\u91CE\u751F\u83CC\u706B\u9505(\u5353\u60A6\u4E2D\u5FC3\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u706B\u9505/\u83CC\u83C7\u706B\u9505",
        address: "\u798F\u7530\u533A\u5C97\u53A6\u793E\u533A\u5C97\u53A6\u5730\u94C1\u7AD9B\u53E3\u5353\u60A6\u4E2D\u5FC3\u4E1C\u533AL2\u5C42",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 145,
        priceLevel: "price_100_plus",
        meituanRating: 4.7,
        reviewCount: 9345,
        tags: [
          "\u706B\u9505",
          "\u83CC\u83C7\u706B\u9505",
          "\u4EBA\u6C14\u699C\u63A8\u8350",
          "\u4EB2\u5B50\u4E92\u52A8"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u6709\u5B9D\u5B9D\u6905"
        ],
        fitPeople: [
          "\u4EB2\u5B50",
          "\u670B\u53CB",
          "\u591A\u4EBA\u805A\u9910"
        ],
        stayMinutes: 120,
        openTime: "11:00-22:00",
        queueLevel: "medium",
        distanceLevel: "3km\u4EE5\u5185",
        mockMeituanUrl: "mock://meituan/poi_079",
        reason: "\u798F\u7530\u533A\u4E91\u5357\u706B\u9505\u4EBA\u6C14\u699C\u7B2C3\u540D\uFF0C\u4E3B\u6253\u91CE\u751F\u83CC\u706B\u9505\uFF0C\u8BBE\u6709\u4EB2\u5B50\u4E92\u52A8\u79D1\u666E\u89D2\uFF0C\u9002\u5408\u5BB6\u5EAD\u805A\u9910",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u4EB2\u5B50\u6B22\u805A\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_078",
          "poi_081"
        ],
        priorityScore: 84
      },
      {
        id: "poi_080",
        name: "\u4E00\u4E50\u306E\u98DF\u5802(\u5353\u60A6\u4E2D\u5FC3\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u65E5\u6599/\u521B\u610F\u65E5\u6599",
        address: "\u798F\u7530\u533A\u798F\u534E\u8DEFOneAvenue\u5353\u60A6\u4E2D\u5FC3\u4E1C\u533AB1\u5C42B1102\u5546\u94FA",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 94,
        priceLevel: "price_le_100",
        meituanRating: 4.4,
        reviewCount: 21602,
        tags: [
          "\u65E5\u6599",
          "\u521B\u610F\u65E5\u6599",
          "\u4EBA\u6C14\u699C\u63A8\u8350",
          "\u660E\u661F\u6253\u5361"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u6709\u5B9D\u5B9D\u6905"
        ],
        fitPeople: [
          "\u670B\u53CB",
          "\u60C5\u4FA3",
          "\u6253\u5361\u7528\u9910"
        ],
        stayMinutes: 90,
        openTime: "11:30-15:30, 16:30-21:30",
        queueLevel: "medium",
        distanceLevel: "3km\u4EE5\u5185",
        mockMeituanUrl: "mock://meituan/poi_080",
        reason: "\u6DF1\u5733\u65E5\u672C\u6599\u7406\u4EBA\u6C14\u699C\u5E97\u94FA\uFF0C\u521B\u610F\u65E5\u6599\u5E97\uFF0C\u660E\u661F\u540C\u6B3E\u6253\u5361\u5730\uFF0C\u9002\u5408\u670B\u53CB\u805A\u4F1A",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u60C5\u4FA3\u7EA6\u4F1A\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_079",
          "poi_082"
        ],
        priorityScore: 80
      },
      {
        id: "poi_081",
        name: "\u5DF4\u5974\u6BDB\u809A\u706B\u9505(\u5353\u60A6\u4E2D\u5FC3\u5E97)",
        type: "\u9910\u996E\u6B63\u9910",
        subType: "\u706B\u9505/\u5DDD\u6E1D\u706B\u9505",
        address: "\u798F\u7530\u533A\u798F\u534E\u8DEF\u4E0E\u5C97\u53A6\u4E00\u8DEF\u4EA4\u53C9\u53E3\u897F\u5317\u89D2\u5353\u60A6\u4E2D\u5FC3\u4E1C\u533A",
        area: "\u798F\u7530\u533A",
        businessDistrict: "\u798F\u7530\u4E2D\u5FC3\u7247\u533A",
        routeCluster: "\u798F\u7530\u4E2D\u5FC3\u5708",
        price: 150,
        priceLevel: "price_100_plus",
        meituanRating: 4.6,
        reviewCount: 20364,
        tags: [
          "\u706B\u9505",
          "\u5DDD\u6E1D\u706B\u9505",
          "\u8FDE\u9501\u54C1\u724C",
          "\u4EBA\u6C14\u699C\u63A8\u8350"
        ],
        limits: [
          "\u5BA4\u5185",
          "\u6709\u5305\u95F4",
          "\u6709\u5927\u684C",
          "\u65E0\u70DF\u9910\u5385"
        ],
        fitPeople: [
          "\u670B\u53CB",
          "\u5BB6\u5EAD",
          "\u5546\u52A1"
        ],
        stayMinutes: 120,
        openTime: "\u5168\u5929\u8425\u4E1A",
        queueLevel: "low",
        distanceLevel: "3km\u4EE5\u5185",
        mockMeituanUrl: "mock://meituan/poi_081",
        reason: "\u6DF1\u5733\u5DDD\u6E1D\u706B\u9505\u4EBA\u6C14\u699C\u5E97\u94FA\uFF0C\u4E3B\u6253\u6BDB\u809A\u706B\u9505\uFF0C\u63D0\u4F9B\u5305\u95F4\u548C\u5927\u684C\uFF0C\u9002\u5408\u5404\u7C7B\u805A\u9910",
        blindBoxThemes: [
          "\u7F8E\u98DF\u6253\u5361\u76D2",
          "\u5546\u52A1\u805A\u9910\u76D2"
        ],
        availableTools: [
          "queueCheck",
          "availabilityCheck",
          "bookingMock"
        ],
        bookingRequired: false,
        weatherSensitive: false,
        replaceableBy: [
          "poi_080",
          "poi_079"
        ],
        priorityScore: 83
      }
    ];
  }
});

// new-agent-a-module/src/data/poiAdapter.ts
function normalizePois(rawPois) {
  return rawPois.map(normalizePoi);
}
function normalizePoi(raw) {
  const id = asString(raw.id, "unknown_poi");
  const type = asString(raw.type, "\u4F11\u95F2\u5A31\u4E50");
  const limits = asStringArray(raw.limits);
  return {
    id,
    name: asString(raw.name, id),
    type,
    subType: asString(raw.subType, type),
    address: optionalString(raw.address),
    area: optionalString(raw.area),
    businessDistrict: asString(raw.businessDistrict, "\u672A\u77E5\u5546\u5708"),
    routeCluster: optionalString(raw.routeCluster),
    price: asNumber(raw.price, 0),
    priceLevel: optionalString(raw.priceLevel),
    meituanRating: optionalNumber(raw.meituanRating),
    reviewCount: optionalNumber(raw.reviewCount),
    tags: asStringArray(raw.tags),
    limits,
    fitPeople: normalizeFitPeople(raw.fitPeople),
    stayMinutes: asNumber(raw.stayMinutes, 60),
    openTime: optionalString(raw.openTime),
    queueLevel: normalizeQueueLevel(raw.queueLevel),
    distanceLevel: optionalString(raw.distanceLevel),
    mockMeituanUrl: optionalString(raw.mockMeituanUrl),
    reason: asString(raw.reason, "\u9002\u5408\u52A0\u5165\u672C\u6B21\u5468\u672B\u8DEF\u7EBF"),
    blindBoxThemes: asStringArray(raw.blindBoxThemes),
    availableTools: asStringArray(raw.availableTools),
    bookingRequired: asBoolean(raw.bookingRequired, false),
    weatherSensitive: typeof raw.weatherSensitive === "boolean" ? raw.weatherSensitive : limits.includes("\u5BA4\u5916") && !limits.includes("\u96E8\u5929\u53EF\u53BB"),
    replaceableBy: asStringArray(raw.replaceableBy),
    priorityScore: optionalNumber(raw.priorityScore)
  };
}
function normalizeFitPeople(value) {
  const rawValues = asStringArray(value);
  const result = /* @__PURE__ */ new Set();
  for (const item of rawValues) {
    if (VALID_PEOPLE.has(item)) {
      result.add(item);
      continue;
    }
    if (/同事|商务|多人|多人聚餐|团建|打卡用餐/.test(item)) {
      result.add("\u670B\u53CB");
      continue;
    }
    if (/家庭|带娃|儿童|孩子/.test(item)) {
      result.add("\u4EB2\u5B50");
    }
  }
  return [...result.size > 0 ? result : /* @__PURE__ */ new Set(["\u670B\u53CB"])];
}
function normalizeQueueLevel(value) {
  if (typeof value === "string" && VALID_QUEUE.has(value)) return value;
  return "medium";
}
function asString(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
function optionalString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function asNumber(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function optionalNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()))];
}
function asBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}
var VALID_PEOPLE, VALID_QUEUE;
var init_poiAdapter = __esm({
  "new-agent-a-module/src/data/poiAdapter.ts"() {
    "use strict";
    VALID_PEOPLE = /* @__PURE__ */ new Set(["\u5355\u4EBA", "\u60C5\u4FA3", "\u670B\u53CB", "\u4EB2\u5B50"]);
    VALID_QUEUE = /* @__PURE__ */ new Set(["low", "medium", "high"]);
  }
});

// new-agent-a-module/src/data/pois.ts
var pois_exports = {};
__export(pois_exports, {
  pois: () => pois
});
var pois;
var init_pois2 = __esm({
  "new-agent-a-module/src/data/pois.ts"() {
    "use strict";
    init_pois();
    init_poiAdapter();
    pois = normalizePois(pois_default);
  }
});

// api-src/replan.ts
var replan_exports = {};
__export(replan_exports, {
  default: () => handler
});
module.exports = __toCommonJS(replan_exports);

// api-src/agent-shared.ts
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
function sendError(res, err) {
  const message = err instanceof Error ? err.message : "Unknown server error";
  res.status(500).json({ error: message });
}
async function loadAgent() {
  const orchestrator = await Promise.resolve().then(() => (init_orchestrator(), orchestrator_exports));
  const data = await Promise.resolve().then(() => (init_pois2(), pois_exports));
  return {
    generatePlan: orchestrator.generatePlan,
    executePlan: orchestrator.executePlan,
    handleReplan: orchestrator.handleReplan,
    pois: data.pois
  };
}

// api-src/replan.ts
async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { handleReplan: handleReplan2, pois: pois2 } = await loadAgent();
    const body = req.body ?? {};
    const event = body.event;
    const plan = body.plan;
    if (!event || !plan) {
      res.status(400).json({ error: "event and plan are required" });
      return;
    }
    const replanned = await handleReplan2(
      event,
      plan,
      { pois: pois2 }
    );
    res.status(200).json(replanned);
  } catch (err) {
    sendError(res, err);
  }
}
