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

// ../api-src/replan.ts
var replan_exports = {};
__export(replan_exports, {
  default: () => handler
});
module.exports = __toCommonJS(replan_exports);

// ../new-agent-a-module/src/agent/blindBox.ts
var THEME_RULES = [
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
    theme: "\u591C\u666F\u5FAE\u91BA\u76D2",
    tags: ["\u591C\u666F", "\u5FAE\u91BA", "\u7B80\u9910"],
    match: (req) => hasAny(req.preferences, ["\u591C\u666F", "\u5FAE\u91BA", "\u7B80\u9910"]) || /晚上|夜景|小酌|微醺/.test(req.rawText),
    storyPrefix: "\u628A\u665A\u95F4\u6D3B\u52A8\u3001\u591C\u666F\u6C1B\u56F4\u548C\u8F7B\u677E\u7B80\u9910\u4E32\u8D77\u6765\uFF0C\u9002\u5408\u670B\u53CB\u6216\u60C5\u4FA3\u4E0D\u8D76\u8DEF\u5730\u6536\u5C3E\u3002"
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
function selectBlindBoxTheme(requirements) {
  if (requirements.blindBoxTheme) return requirements.blindBoxTheme;
  return THEME_RULES.find((rule) => rule.match(requirements))?.theme ?? "\u5468\u672B\u8F7B\u677E\u63A2\u7D22\u76D2";
}
function composeBlindBox(theme, route, requirements, toolResults) {
  const rule = THEME_RULES.find((item) => item.theme === theme);
  const hasQueueSafe = toolResults.some((result) => /排队|高排队/.test(result.message));
  const title = `${requirements.timeText}${theme}`;
  const firstName = route.steps[0]?.poi.name || "\u7B2C\u4E00\u7AD9";
  const lastName = route.steps.at(-1)?.poi.name || "\u6536\u5C3E\u7AD9";
  const selectionStories = [
    `\u8FD9\u6B21\u968F\u673A\u5F00\u51FA\u300C${theme}\u300D\uFF1A\u4ECE${firstName}\u51FA\u53D1\uFF0C\u5230${lastName}\u6536\u5C3E\uFF0C\u4E2D\u95F4\u5C11\u8D70\u56DE\u5934\u8DEF\u3002`,
    `\u672C\u6B21\u76F2\u76D2\u843D\u5728\u300C${theme}\u300D\uFF0C${route.steps.length} \u7AD9\u4ECE${firstName}\u4E00\u8DEF\u4E32\u5230${lastName}\u3002`,
    `\u672C\u6B21\u5F00\u51FA\u300C${theme}\u300D\uFF1A\u5148\u53BB${firstName}\uFF0C\u6700\u540E\u5728${lastName}\u7ED3\u675F\u8FD9\u8D9F\u5468\u672B\u8DEF\u7EBF\u3002`,
    `\u968F\u673A\u7EC4\u5408\u5B8C\u6210\uFF1A${firstName}\u8D1F\u8D23\u5F00\u573A\uFF0C${lastName}\u8D1F\u8D23\u6536\u5C3E\uFF0C\u5171\u5B89\u6392 ${route.steps.length} \u7AD9\u3002`
  ];
  const selectionStory = selectionStories[Math.floor(Math.random() * selectionStories.length)];
  return {
    theme,
    title,
    tags: rule?.tags ?? requirements.preferences.slice(0, 3),
    story: requirements.inputMode === "natural" ? "\u6B63\u5728\u6839\u636E\u4F60\u7684\u539F\u8BDD\u548C\u672C\u6B21\u8DEF\u7EBF\u751F\u6210\u4E2A\u6027\u5316\u53CD\u9988\u3002" : `${selectionStory}${rule?.storyPrefix ?? ""}`,
    unlockText: hasQueueSafe ? "\u5DF2\u68C0\u67E5\u6392\u961F\u98CE\u9669\uFF0C\u5E76\u51C6\u5907\u53EF\u66FF\u6362\u8282\u70B9\u3002" : "\u5DF2\u5B8C\u6210\u672C\u6B21\u968F\u673A\u5339\u914D\uFF0C\u53EF\u4EE5\u89E3\u9501\u8DEF\u7EBF\u3002",
    copySource: "system"
  };
}
function hasAny(values, targets) {
  return targets.some((target) => values.includes(target));
}

// ../new-agent-a-module/src/agent/blindBoxCopywriter.ts
var DEFAULT_MODEL = "deepseek-v4-flash";
var DEFAULT_BASE_URL = "https://api.deepseek.com/v1";
async function personalizeBlindBoxCopy(blindBox, requirements, route, config = {}, fetchImpl = fetch) {
  if (requirements.inputMode !== "natural") {
    return { ...blindBox, copySource: "system" };
  }
  const apiKey = config.apiKey || process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return unavailableCopy(blindBox);
  }
  const baseUrl = config.baseUrl || process.env.OPENAI_BASE_URL || process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL;
  const model = config.model || process.env.OPENAI_MODEL || process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
  try {
    const response = await fetchImpl(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: [
              "\u4F60\u662F WeekendBuddy \u7684\u76F2\u76D2\u63ED\u6653\u6587\u6848\u4F5C\u8005\u3002",
              "\u6839\u636E\u7528\u6237\u539F\u8BDD\u548C\u5DF2\u7ECF\u786E\u5B9A\u7684\u6700\u7EC8\u8DEF\u7EBF\uFF0C\u5199\u4E00\u6BB5\u81EA\u7136\u3001\u5177\u4F53\u3001\u6709\u53D8\u5316\u7684\u4E2D\u6587\u53CD\u9988\u3002",
              "\u53EA\u8FD4\u56DE\u4E25\u683C JSON\uFF1Atitle \u5B57\u7B26\u4E32\u3001story \u5B57\u7B26\u4E32\u3001tags \u5B57\u7B26\u4E32\u6570\u7EC4\u3002",
              "story \u5FC5\u987B\u539F\u6837\u63D0\u5230\u6700\u7EC8\u8DEF\u7EBF\u4E2D\u81F3\u5C11\u4E00\u4E2A\u5B9E\u9645\u5730\u70B9\u540D\u79F0\uFF0C\u5E76\u89E3\u91CA\u8DEF\u7EBF\u600E\u6837\u56DE\u5E94\u7528\u6237\u9700\u6C42\u3002",
              "\u4E0D\u8981\u6BCF\u6B21\u4F7F\u7528\u76F8\u540C\u5F00\u5934\uFF1B\u907F\u514D\u201C\u542C\u61C2\u4E86\u201D\u201C\u6839\u636E\u4F60\u7684\u9700\u6C42\u201D\u201C\u4E3A\u4F60\u7CBE\u5FC3\u201D\u7B49\u5BA2\u670D\u8154\u3002",
              "\u4E0D\u5F97\u7F16\u9020\u8DEF\u7EBF\u6570\u636E\u4E2D\u4E0D\u5B58\u5728\u7684\u5730\u70B9\u3001\u4F18\u60E0\u3001\u8425\u4E1A\u72B6\u6001\u6216\u8BC4\u4EF7\u3002",
              "title 8-18 \u4E2A\u6C49\u5B57\uFF0Cstory 45-90 \u4E2A\u6C49\u5B57\uFF0Ctags 2-4 \u4E2A\u3002"
            ].join("\n")
          },
          {
            role: "user",
            content: JSON.stringify({
              originalText: requirements.rawText,
              city: requirements.city,
              district: requirements.district,
              peopleType: requirements.peopleType,
              preferences: requirements.preferences,
              constraints: requirements.constraints,
              budgetMax: requirements.budgetMax,
              route: route.steps.map((step) => ({
                name: step.poi.name,
                type: step.poi.type,
                area: step.poi.area,
                tags: step.poi.tags,
                reason: step.poi.reason
              }))
            })
          }
        ]
      })
    });
    if (!response.ok) return unavailableCopy(blindBox);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = content ? safeParseJson(content) : null;
    if (!parsed) return unavailableCopy(blindBox);
    return {
      ...blindBox,
      title: parsed.title || blindBox.title,
      story: parsed.story,
      tags: parsed.tags.length ? parsed.tags.slice(0, 4) : blindBox.tags,
      copySource: "llm"
    };
  } catch {
    return unavailableCopy(blindBox);
  }
}
function unavailableCopy(blindBox) {
  return {
    ...blindBox,
    story: "\u4E2A\u6027\u5316\u53CD\u9988\u6682\u672A\u751F\u6210\uFF0C\u8BF7\u914D\u7F6E DEEPSEEK_API_KEY \u540E\u91CD\u65B0\u751F\u6210\u3002",
    copySource: "unavailable"
  };
}
function safeParseJson(content) {
  try {
    const match = content.match(/\{[\s\S]*\}/);
    const value = JSON.parse(match?.[0] || content);
    if (typeof value.story !== "string" || !value.story.trim()) return null;
    return {
      title: typeof value.title === "string" ? value.title.trim() : void 0,
      story: value.story.trim(),
      tags: Array.isArray(value.tags) ? value.tags.filter((tag) => typeof tag === "string" && Boolean(tag.trim())).map((tag) => tag.trim()) : []
    };
  } catch {
    return null;
  }
}

// ../new-agent-a-module/src/agent/intentRules.ts
var DEFAULT_CITY = "";
var DEFAULT_DURATION_HOURS = 4;
var DEFAULT_BUDGET_MAX = 300;
var DEFAULT_PEOPLE_TYPE = "\u670B\u53CB";
var DISTRICT_SUFFIX_PATTERN = /[\u4e00-\u9fff]{2,6}?(?:区|县|旗)/;
var COMMON_CITY_NAMES = [
  "\u5317\u4EAC",
  "\u4E0A\u6D77",
  "\u5E7F\u5DDE",
  "\u6DF1\u5733",
  "\u676D\u5DDE",
  "\u6210\u90FD",
  "\u6B66\u6C49",
  "\u5357\u4EAC",
  "\u91CD\u5E86",
  "\u5929\u6D25",
  "\u82CF\u5DDE",
  "\u897F\u5B89",
  "\u957F\u6C99",
  "\u9752\u5C9B",
  "\u90D1\u5DDE",
  "\u5927\u8FDE",
  "\u53A6\u95E8",
  "\u798F\u5DDE",
  "\u5408\u80A5",
  "\u6D4E\u5357",
  "\u6C88\u9633",
  "\u6606\u660E",
  "\u8D35\u9633",
  "\u5357\u5B81",
  "\u6D77\u53E3",
  "\u4E09\u4E9A",
  "\u54C8\u5C14\u6EE8",
  "\u957F\u6625",
  "\u592A\u539F",
  "\u77F3\u5BB6\u5E84",
  "\u5170\u5DDE",
  "\u4E4C\u9C81\u6728\u9F50",
  "\u62C9\u8428",
  "\u547C\u548C\u6D69\u7279",
  "\u94F6\u5DDD",
  "\u897F\u5B81",
  "\u5357\u660C",
  "\u5B81\u6CE2",
  "\u65E0\u9521",
  "\u4E1C\u839E",
  "\u4F5B\u5C71",
  "\u73E0\u6D77",
  "\u60E0\u5DDE",
  "\u6E29\u5DDE",
  "\u7ECD\u5174",
  "\u5609\u5174",
  "\u5E38\u5DDE",
  "\u5357\u901A"
];
function parseIntentWithRules(userInput) {
  const rawText = userInput.rawText || "";
  const quick = userInput.quickSelections ?? {};
  const naturalMode = quick.inputMode !== "selection";
  const explicitCity = extractCity(rawText);
  const explicitDistrict = extractDistrict(rawText);
  const preferences = unique([
    ...extractPreferences(rawText),
    ...quick.preferences ?? [],
    ...extractProfilePreferences(quick.userProfile)
  ]);
  const constraints = unique([
    ...extractConstraints(rawText),
    ...quick.constraints ?? [],
    ...extractProfileConstraints(quick.userProfile)
  ]);
  return {
    city: naturalMode ? explicitCity ?? quick.city ?? DEFAULT_CITY : quick.city ?? explicitCity ?? DEFAULT_CITY,
    district: naturalMode ? explicitDistrict ?? normalizeDistrict(quick.district) : normalizeDistrict(quick.district) ?? explicitDistrict,
    durationHours: quick.durationHours ?? extractDurationHours(rawText) ?? DEFAULT_DURATION_HOURS,
    budgetMax: normalizeBudget(quick.budget) ?? extractBudget(rawText) ?? DEFAULT_BUDGET_MAX,
    distanceLevel: quick.distanceLevel ?? extractDistanceLevel(rawText) ?? void 0,
    peopleType: quick.peopleType ?? extractPeopleType(rawText) ?? DEFAULT_PEOPLE_TYPE,
    preferences: preferences.length > 0 ? preferences : ["\u7F8E\u98DF", "\u4F11\u95F2"],
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
function applyQuickSelections(requirements, userInput) {
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
    preferences: unique([...requirements.preferences ?? [], ...quick.preferences ?? []]),
    constraints: unique([...requirements.constraints ?? [], ...quick.constraints ?? []]),
    blindBoxTheme: normalizeTheme(quick.blindBoxTheme) ?? requirements.blindBoxTheme,
    allowCrossDistrict: typeof quick.allowCrossDistrict === "boolean" ? quick.allowCrossDistrict : requirements.allowCrossDistrict,
    currentLocation: normalizeLocation(quick.currentLocation) ?? requirements.currentLocation,
    inputMode,
    userProfile: normalizeUserProfile(quick.userProfile) ?? requirements.userProfile
  };
}
function normalizeRequirements(input, userInput) {
  const ruleFallback = parseIntentWithRules(userInput);
  const normalized = {
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
function extractCity(text) {
  for (const start of getLocationStarts(text)) {
    const tail = text.slice(start);
    const commonCity = COMMON_CITY_NAMES.find((city) => tail.startsWith(city));
    if (commonCity) return commonCity;
    const suffixed = tail.match(/^([\u4e00-\u9fff]{2,7}?)市(?=[\u4e00-\u9fff]|$)/)?.[1];
    if (suffixed && !containsPlanningPhrase(suffixed)) return suffixed;
  }
  return null;
}
function extractDistrict(text) {
  for (const start of getLocationStarts(text)) {
    let tail = text.slice(start);
    const commonCity = COMMON_CITY_NAMES.find((city) => tail.startsWith(city));
    if (commonCity) tail = tail.slice(commonCity.length).replace(/^市/, "");
    else tail = tail.replace(/^[\u4e00-\u9fff]{2,7}?市/, "");
    const match = tail.match(new RegExp(`^(${DISTRICT_SUFFIX_PATTERN.source})`));
    if (match?.[1] && !containsPlanningPhrase(match[1])) return match[1];
  }
  return void 0;
}
function getLocationStarts(text) {
  const starts = /* @__PURE__ */ new Set([0]);
  const pattern = /(?:在|去|到|从|位于)/g;
  for (const match of text.matchAll(pattern)) starts.add((match.index ?? 0) + match[0].length);
  return [...starts].sort((a, b) => a - b);
}
function containsPlanningPhrase(value) {
  return /周末|今天|明天|后天|上午|中午|下午|晚上|想去|想在|找个|地方|附近/.test(value);
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
    [/简餐|轻食/, "\u7B80\u9910"],
    [/夜景|夜晚|晚上|灯光|看海夜景/, "\u591C\u666F"],
    [/微醺|小酌|喝一杯|酒吧|精酿|鸡尾酒|bistro/i, "\u5FAE\u91BA"],
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
function normalizeTheme(value) {
  if (typeof value !== "string") return void 0;
  const theme = value.trim();
  if (!theme || theme === "\u60CA\u559C\u76F2\u76D2") return void 0;
  return theme;
}
function normalizeDistrict(value) {
  if (typeof value !== "string") return void 0;
  const raw = value.trim();
  if (!raw) return void 0;
  const withoutCity = raw.includes("\u5E02") ? raw.slice(raw.lastIndexOf("\u5E02") + 1) : raw;
  const match = withoutCity.match(new RegExp(`^(${DISTRICT_SUFFIX_PATTERN.source})$`));
  return match?.[1];
}
function normalizeLocation(value) {
  if (!value || typeof value !== "object") return void 0;
  const location = value;
  const lng = typeof location.lng === "number" ? location.lng : Number(location.lng);
  const lat = typeof location.lat === "number" ? location.lat : Number(location.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return void 0;
  return { lng, lat };
}
function extractProfilePreferences(profile) {
  if (!profile || typeof profile !== "object") return [];
  const data = profile;
  return unique([
    ...normalizeProfileArray(data.likedPoiTypes).slice(0, 4),
    ...normalizeProfileArray(data.likedTags).slice(0, 5),
    ...normalizeProfileArray(data.favoriteRouteThemes).slice(0, 2),
    ...normalizeProfileArray(data.favoritePoiNames).slice(0, 2).map((name) => `\u559C\u6B22${name}`)
  ]);
}
function extractProfileConstraints(profile) {
  if (!profile || typeof profile !== "object") return [];
  const data = profile;
  const constraints = [
    ...normalizeProfileArray(data.dislikedPoiTypes).slice(0, 3).map((type) => `\u5C11\u63A8\u8350${type}`),
    ...normalizeProfileArray(data.rejectedKeywords).slice(0, 3)
  ];
  if (data.preferredRoutePace === "relaxed") constraints.push("\u504F\u597D\u677E\u5F1B\u8DEF\u7EBF");
  if (data.preferredRoutePace === "packed") constraints.push("\u504F\u597D\u4E30\u5BCC\u7D27\u51D1\u8DEF\u7EBF");
  return unique(constraints);
}
function normalizeProfileArray(value) {
  if (!Array.isArray(value)) return [];
  return unique(value.filter((item) => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()));
}
function normalizeUserProfile(value) {
  if (!value || typeof value !== "object") return void 0;
  const data = value;
  const pace = data.preferredRoutePace;
  const budgetRange = Array.isArray(data.budgetRange) && data.budgetRange.length === 2 && data.budgetRange.every((item) => typeof item === "number" && Number.isFinite(item)) ? data.budgetRange : void 0;
  const profile = {
    likedPoiTypes: normalizeProfileArray(data.likedPoiTypes),
    likedTags: normalizeProfileArray(data.likedTags),
    likedDistricts: normalizeProfileArray(data.likedDistricts),
    favoritePoiNames: normalizeProfileArray(data.favoritePoiNames),
    favoriteRouteThemes: normalizeProfileArray(data.favoriteRouteThemes),
    dislikedPoiTypes: normalizeProfileArray(data.dislikedPoiTypes),
    rejectedKeywords: normalizeProfileArray(data.rejectedKeywords),
    budgetRange,
    preferredRoutePace: pace === "relaxed" || pace === "balanced" || pace === "packed" ? pace : void 0,
    confirmedRouteCount: typeof data.confirmedRouteCount === "number" ? data.confirmedRouteCount : 0,
    favoritePoiCount: typeof data.favoritePoiCount === "number" ? data.favoritePoiCount : 0,
    favoriteRouteCount: typeof data.favoriteRouteCount === "number" ? data.favoriteRouteCount : 0
  };
  const hasSignal = [
    profile.likedPoiTypes,
    profile.likedTags,
    profile.likedDistricts,
    profile.favoritePoiNames,
    profile.favoriteRouteThemes,
    profile.dislikedPoiTypes,
    profile.rejectedKeywords
  ].some((items) => (items?.length ?? 0) > 0) || Boolean(profile.budgetRange || profile.preferredRoutePace);
  return hasSignal ? profile : void 0;
}

// ../new-agent-a-module/src/agent/llmIntentParser.ts
var DEFAULT_MODEL2 = "deepseek-v4-pro";
var DEFAULT_BASE_URL2 = "https://api.deepseek.com/v1";
async function parseIntentWithLLM(userInput, config = {}) {
  const apiKey = config.apiKey || getLlmApiKey();
  if (!apiKey) return null;
  const baseUrl = config.baseUrl || getLlmBaseUrl();
  const model = getIntentModel(config, baseUrl);
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "\u4F60\u662F\u5468\u672B\u51FA\u6E38\u7684\u610F\u56FE\u89E3\u6790\u5668\u3002\u53EA\u8F93\u51FA JSON\uFF0C\u4E0D\u8F93\u51FA\u89E3\u91CA\u3002",
            "\u89E3\u6790\u7528\u6237\u8F93\u5165\u4E3A\u7ED3\u6784\u5316\u9700\u6C42\u3002\u8F93\u51FA\u683C\u5F0F\uFF1A",
            "",
            "{",
            '  "city": "\u57CE\u5E02\u540D\uFF0C\u4ECE\u7528\u6237\u8F93\u5165\u4E2D\u63D0\u53D6",',
            '  "district": "\u884C\u653F\u533A\uFF08\u5982XX\u533A/XX\u53BF\uFF09\uFF0C\u6CA1\u8BF4\u5219\u4E3A\u7A7A\u5B57\u7B26\u4E32",',
            '  "durationHours": \u6570\u5B57\uFF08\u9ED8\u8BA44\uFF09,',
            '  "budgetMax": \u6570\u5B57\uFF08\u9ED8\u8BA4300\uFF09,',
            '  "distanceLevel": "\u8BF4\u4E86\u624D\u586B\uFF0C\u6CA1\u8BF4\u5219\u4E3A\u7A7A\u5B57\u7B26\u4E32",',
            '  "peopleType": "\u5355\u4EBA/\u60C5\u4FA3/\u670B\u53CB/\u4EB2\u5B50",',
            '  "preferences": ["\u4F53\u9A8C\u6807\u7B7E\u6570\u7EC4"],',
            '  "constraints": ["\u9650\u5236\u6761\u4EF6\u6570\u7EC4"],',
            '  "timeText": "\u7528\u6237\u7684\u65F6\u95F4\u8868\u8FBE",',
            '  "allowCrossDistrict": \u5E03\u5C14,',
            '  "currentLocation": \u5BF9\u8C61\u6216null',
            "}",
            "",
            "\u89C4\u5219\uFF08\u6309\u4F18\u5148\u7EA7\uFF0C\u51B2\u7A81\u65F6\u9AD8\u4F18\u5148\u7EA7\u8986\u76D6\u4F4E\uFF09\uFF1A",
            "",
            "P1-\u539F\u8BDD\u4F18\u5148\uFF1A\u7528\u6237\u660E\u786E\u8BF4\u7684\u4FE1\u606F\u76F4\u63A5\u91C7\u7528\uFF0C\u4E0D\u8981\u7528\u9ED8\u8BA4\u503C\u8986\u76D6",
            "P2-\u540C\u884C\u4EBA\u63A8\u65AD\uFF1A\u5E26\u5A03/\u5B69\u5B50/\u4EB2\u5B50\u2192\u4EB2\u5B50\uFF0C\u5BF9\u8C61/\u7EA6\u4F1A/\u60C5\u4FA3\u2192\u60C5\u4FA3\uFF0C\u670B\u53CB/\u540C\u5B66/\u56E2\u5EFA\u2192\u670B\u53CB\uFF0C\u7B2C\u4E00\u4EBA\u79F0\u81EA\u5DF1\u60F3\u53BB\u4E14\u65E0\u540C\u884C\u4EBA\u2192\u5355\u4EBA",
            "P3-\u57CE\u5E02\uFF1A\u4ECE\u7528\u6237\u8F93\u5165\u4E2D\u63D0\u53D6\u57CE\u5E02\u540D\uFF0C\u6CA1\u6709\u660E\u786E\u7684\u5219\u7559\u7A7A",
            "P4-\u65F6\u957F\u63A8\u65AD\uFF1A\u534A\u5929\u21924h\uFF0C\u665A\u4E0A\u21922-3h\uFF0C\u5468\u672B\u5168\u5929\u21926-8h\uFF0C\u5B9E\u5728\u4E0D\u884C\u75284",
            "P5-\u9884\u7B97\u63A8\u65AD\uFF1A\u7701\u94B1/\u6027\u4EF7\u6BD4\u2192150\uFF0C\u5C0F\u914C/bistro\u2192200-300\uFF0C\u9AD8\u6863/\u7EA6\u4F1A\u2192300-500\uFF0C\u5B9E\u5728\u4E0D\u884C\u7528300",
            "P6-\u8DDD\u79BB\uFF1A\u7528\u6237\u6CA1\u660E\u786E\u8BF4\u5C31\u4E0D\u586B",
            "P7-\u533A\u5212\uFF1A\u53EA\u6709\u660E\u786E\u63D0\u5230\u884C\u653F\u533A\u540D\uFF08\u5982XX\u533A\uFF09\u624D\u586B\uFF0C\u9ED8\u8BA4\u7A7A",
            "P8-\u504F\u597D\u62BD\u53D6\uFF1A\u4ECE\u8BED\u4E49\u4E2D\u62BD\u4F53\u9A8C\u8BCD\uFF08\u62CD\u7167/\u5496\u5561/\u7F8E\u98DF/\u6587\u5316/\u6237\u5916/\u8FD0\u52A8/\u89E3\u538B/\u5C0F\u4F17/\u591C\u666F/\u5FAE\u91BA/\u751C\u54C1/\u7B80\u9910\u7B49\uFF09",
            "P9-\u7EA6\u675F\u62BD\u53D6\uFF1A\u4E0D\u60F3\u6392\u961F/\u5C11\u8D70\u8DEF/\u5BA4\u5185\u4F18\u5148/\u9884\u7B97\u53CB\u597D/\u5BA0\u7269\u53CB\u597D\u7B49",
            "P10-quickSelections\uFF1Anatural \u6A21\u5F0F\u53EA\u4F5C\u4E0A\u4E0B\u6587\u515C\u5E95\uFF0C\u4E0D\u80FD\u8986\u76D6\u539F\u8BDD\u4E2D\u7684\u660E\u786E\u57CE\u5E02\u6216\u533A\u53BF\uFF1Bselection \u6A21\u5F0F\u662F\u7528\u6237\u660E\u786E\u9009\u62E9\uFF0C\u5E94\u4F18\u5148\u91C7\u7528",
            "P11-\u7528\u6237\u753B\u50CF\uFF1A\u5982\u4F20\u5165userProfile\uFF0ClikedPoiTypes/likedTags\u6DF7\u5165preferences(\u22644\u4E2A)\uFF0CdislikedPoiTypes/rejectedKeywords\u6DF7\u5165constraints(\u22643\u4E2A)\uFF0C\u4F18\u5148\u7EA7\u4F4E\u4E8E\u7528\u6237\u539F\u8BDD",
            "",
            "\u793A\u4F8B\uFF1A",
            "",
            '\u8F93\u51651\uFF1A"\u5468\u672B\u4E0B\u5348\u60F3\u5E26\u5A03\u5728\u5357\u5C71\u627E\u4E2A\u53EF\u4EE5\u62CD\u7167\u73A9\u7684\u5730\u65B9"',
            '\u8F93\u51FA\uFF1A{"city":"","district":"\u5357\u5C71\u533A","durationHours":4,"budgetMax":300,"distanceLevel":"","peopleType":"\u4EB2\u5B50","preferences":["\u62CD\u7167","\u4EB2\u5B50"],"constraints":[],"timeText":"\u5468\u672B\u4E0B\u5348","allowCrossDistrict":false,"currentLocation":null}',
            "",
            '\u8F93\u51652\uFF1A"\u6700\u8FD1\u538B\u529B\u597D\u5927\uFF0C\u4E00\u4E2A\u4EBA\u665A\u4E0A\u627E\u4E2A\u5B89\u9759\u5730\u65B9\u559D\u4E00\u676F\uFF0C\u9884\u7B97300\u4EE5\u5185"',
            '\u8F93\u51FA\uFF1A{"city":"","district":"","durationHours":3,"budgetMax":300,"distanceLevel":"","peopleType":"\u5355\u4EBA","preferences":["\u89E3\u538B","\u5FAE\u91BA","\u591C\u666F"],"constraints":["\u9884\u7B97\u53CB\u597D"],"timeText":"\u665A\u4E0A","allowCrossDistrict":false,"currentLocation":null}',
            "",
            '\u8F93\u51653\uFF1A"\u548C\u670B\u53CB\u5728\u4E0A\u6D77\u5F90\u6C47\u533A\u5403\u4E2A\u996D\uFF0C\u4E0D\u6015\u8FDC"',
            '\u8F93\u51FA\uFF1A{"city":"\u4E0A\u6D77","district":"\u5F90\u6C47\u533A","durationHours":4,"budgetMax":300,"distanceLevel":"","peopleType":"\u670B\u53CB","preferences":["\u7F8E\u98DF"],"constraints":[],"timeText":"\u5468\u672B\u4E0B\u5348","allowCrossDistrict":true,"currentLocation":null}',
            "",
            '\u8F93\u51654\uFF1A"\u4E0B\u5348\u60F3\u53BB\u6210\u90FD\u592A\u53E4\u91CC\u9644\u8FD1\u8D70\u8D70\uFF0C\u559D\u676F\u5496\u5561\u62CD\u62CD\u7167"',
            '\u8F93\u51FA\uFF1A{"city":"\u6210\u90FD","district":"","durationHours":3,"budgetMax":200,"distanceLevel":"","peopleType":"\u5355\u4EBA","preferences":["\u5496\u5561","\u62CD\u7167","\u6237\u5916"],"constraints":[],"timeText":"\u4E0B\u5348","allowCrossDistrict":false,"currentLocation":null}'
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
  const parsed = safeParseJson2(content);
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
function getLlmApiKey() {
  return process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
}
function getLlmBaseUrl() {
  return process.env.OPENAI_BASE_URL || process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL2;
}
function getIntentModel(config, baseUrl) {
  const intentModel = config.intentModel || process.env.OPENAI_INTENT_MODEL || process.env.DEEPSEEK_INTENT_MODEL;
  if (intentModel) return intentModel;
  if (config.model) return config.model;
  if (/api\.deepseek\.com/i.test(baseUrl)) return DEFAULT_MODEL2;
  return process.env.OPENAI_MODEL || process.env.DEEPSEEK_MODEL || DEFAULT_MODEL2;
}
function safeParseJson2(content) {
  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  }
}

// ../new-agent-a-module/src/agent/intentParser.ts
async function parseIntent(userInput, config = {}) {
  try {
    const llmRequirements = await parseIntentWithLLM(userInput, config);
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

// ../new-agent-a-module/src/mock/mockPois.ts
var mockPois = [
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

// ../new-agent-a-module/src/planner/routeQualityRules.ts
var FREE_PLACE_PATTERN = /公园|广场|绿道|栈道|海滨|沙滩|街区|古城|游客中心|图书馆|文化馆|博物馆|美术馆|艺术馆|市民中心|湿地|自然|步道|山|湖|海边|citywalk/i;
var TICKETED_PATTERN = /乐园|影院|电影|密室|桌游|电玩城|KTV|剧本|DIY|diy|手作|陶艺|烘焙|展览|营地|农场|运动|攀岩|蹦床/i;
var DINING_PATTERN = /餐|饭|菜馆|酒楼|火锅|烤肉|烧烤|海鲜|bistro|简餐|小吃|夜市|美食街/i;
var DRINK_PATTERN = /咖啡|茶|甜品|奶茶|饮品|面包|下午茶/i;
var DISTRICT_NEARBY_KM = 12;
var VENUE_SUBPLACE_PATTERN = /^(.*?)(?:文化艺术中心|艺术中心|商业街|步行街|美术馆|艺术馆|博物馆|购物中心|游客中心|摩天轮|水世界|南区|北区|东区|西区|一期|二期|三期)(?:.*)?$/;
var DISTRICT_CENTERS = {
  "\u798F\u7530\u533A": { lng: 114.055, lat: 22.545 },
  "\u5357\u5C71\u533A": { lng: 113.93, lat: 22.533 },
  "\u7F57\u6E56\u533A": { lng: 114.13, lat: 22.548 },
  "\u5B9D\u5B89\u533A": { lng: 113.884, lat: 22.555 },
  "\u9F99\u5C97\u533A": { lng: 114.247, lat: 22.72 },
  "\u9F99\u534E\u533A": { lng: 114.045, lat: 22.696 },
  "\u76D0\u7530\u533A": { lng: 114.237, lat: 22.557 },
  "\u576A\u5C71\u533A": { lng: 114.35, lat: 22.69 },
  "\u5149\u660E\u533A": { lng: 113.936, lat: 22.748 },
  "\u5927\u9E4F\u533A": { lng: 114.474, lat: 22.596 }
};
function getVenueComplexKey(name) {
  const cleaned = name.replace(/[（(].*?[）)]/g, "").replace(/[\s·•]/g, "").trim();
  const prefix = cleaned.match(VENUE_SUBPLACE_PATTERN)?.[1]?.trim();
  return prefix && prefix.length >= 3 ? prefix : cleaned;
}
function getTargetDurationMinutes(requirements) {
  const raw = Number(requirements.durationHours || 4) * 60;
  return Math.max(120, Math.min(480, Math.round(raw)));
}
function getDurationWindow(requirements) {
  const target = getTargetDurationMinutes(requirements);
  const tolerance = target <= 150 ? 20 : Math.max(25, Math.round(target * 0.12));
  return {
    target,
    min: Math.max(90, target - tolerance),
    max: target + tolerance
  };
}
function normalizePoiForPlanning(poi, requirements) {
  const priceInfo = estimatePoiPrice(poi, requirements);
  return {
    ...poi,
    price: priceInfo.price,
    priceLevel: priceInfo.label,
    stayMinutes: estimateStayMinutes(poi),
    tags: [.../* @__PURE__ */ new Set([...poi.tags, ...priceInfo.tags])].slice(0, 8),
    limits: [.../* @__PURE__ */ new Set([...poi.limits, ...priceInfo.limits])]
  };
}
function estimatePoiPrice(poi, requirements) {
  const text = `${poi.name} ${poi.type} ${poi.subType} ${poi.tags.join(" ")} ${poi.reason}`;
  const budget = requirements.budgetMax;
  if (FREE_PLACE_PATTERN.test(text) && !TICKETED_PATTERN.test(text) && !DINING_PATTERN.test(text) && !DRINK_PATTERN.test(text)) {
    return { price: 0, label: "\u514D\u8D39/\u73B0\u573A\u4E3A\u51C6", tags: ["\u514D\u8D39"], limits: ["\u9884\u7B97\u53CB\u597D"] };
  }
  if (poi.type === "\u6237\u5916\u6563\u6B65" || poi.type === "\u62CD\u7167\u5730\u6807") {
    const price = TICKETED_PATTERN.test(text) ? clampPrice(40, budget, 0.7) : 0;
    return { price, label: price === 0 ? "\u514D\u8D39/\u73B0\u573A\u4E3A\u51C6" : "\u7EA60-80/\u4EBA", tags: price === 0 ? ["\u514D\u8D39"] : ["\u4F4E\u9884\u7B97"], limits: ["\u9884\u7B97\u53CB\u597D"] };
  }
  if (poi.type === "\u8F7B\u98DF\u751C\u996E" || DRINK_PATTERN.test(text)) {
    const price = budget <= 150 ? 28 : budget >= 350 ? 58 : 42;
    return { price, label: "\u7EA630-80/\u4EBA", tags: ["\u8F7B\u9884\u7B97"], limits: ["\u9884\u7B97\u53CB\u597D"] };
  }
  if (poi.type === "\u9910\u996E\u6B63\u9910" || DINING_PATTERN.test(text)) {
    const price = budget <= 150 ? 58 : budget >= 350 ? 128 : 88;
    return { price, label: budget <= 150 ? "\u7EA650-90/\u4EBA" : budget >= 350 ? "\u7EA6100-180/\u4EBA" : "\u7EA670-120/\u4EBA", tags: ["\u9910\u996E\u9884\u7B97"], limits: [] };
  }
  if (poi.type === "\u6587\u5316\u4F53\u9A8C") {
    const price = TICKETED_PATTERN.test(text) ? clampPrice(80, budget, 0.8) : 0;
    return { price, label: price === 0 ? "\u514D\u8D39-80/\u4EBA" : "\u7EA660-120/\u4EBA", tags: price === 0 ? ["\u4F4E\u9884\u7B97"] : ["\u4F53\u9A8C\u9884\u7B97"], limits: ["\u9884\u7B97\u53CB\u597D"] };
  }
  if (poi.type === "\u4F11\u95F2\u5A31\u4E50") {
    const price = budget <= 150 ? 60 : budget >= 350 ? 128 : 88;
    return { price, label: budget <= 150 ? "\u7EA650-90/\u4EBA" : "\u7EA680-160/\u4EBA", tags: ["\u4F53\u9A8C\u9884\u7B97"], limits: [] };
  }
  return { price: Math.min(Math.max(poi.price || 0, 0), budget), label: poi.priceLevel || "\u9884\u4F30/\u73B0\u573A\u4E3A\u51C6", tags: [], limits: [] };
}
function estimateStayMinutes(poi) {
  const text = `${poi.name} ${poi.type} ${poi.subType} ${poi.tags.join(" ")} ${poi.reason}`;
  if (poi.type === "\u9910\u996E\u6B63\u9910") return clampStay(poi.stayMinutes || 80, 70, 105);
  if (poi.type === "\u8F7B\u98DF\u751C\u996E") return clampStay(poi.stayMinutes || 45, 35, 65);
  if (poi.type === "\u4F11\u95F2\u5A31\u4E50") return clampStay(poi.stayMinutes || 95, 75, 130);
  if (poi.type === "\u6587\u5316\u4F53\u9A8C") return clampStay(poi.stayMinutes || 85, 60, /DIY|diy|手作|陶艺|烘焙/.test(text) ? 130 : 110);
  if (poi.type === "\u6237\u5916\u6563\u6B65") return clampStay(poi.stayMinutes || 65, 45, 95);
  if (poi.type === "\u62CD\u7167\u5730\u6807") return clampStay(poi.stayMinutes || 50, 35, 75);
  return clampStay(poi.stayMinutes || 70, 45, 100);
}
function estimateTravelMinutesBetweenSteps(steps) {
  if (steps.length <= 1) return 0;
  return steps.slice(1).reduce((sum, step, index) => {
    return sum + estimateTravelMinutes(steps[index].poi, step.poi);
  }, 0);
}
function estimateRouteMinutes(steps) {
  return steps.reduce((sum, step) => sum + step.poi.stayMinutes, 0) + estimateTravelMinutesBetweenSteps(steps);
}
function estimateTravelMinutesBetweenPois(a, b) {
  return estimateTravelMinutes(a, b);
}
function estimateTravelMinutesFromCurrentLocation(poi, currentLocation) {
  if (!currentLocation || typeof poi.lat !== "number" || typeof poi.lng !== "number") return 0;
  return estimateTravelMinutes({
    ...poi,
    id: "__current__",
    name: "\u5F53\u524D\u4F4D\u7F6E",
    lat: currentLocation.lat,
    lng: currentLocation.lng
  }, poi);
}
function stretchStepsToDuration(steps, requirements) {
  const { min, max } = getDurationWindow(requirements);
  let total = estimateRouteMinutes(steps);
  if (total >= min || steps.length === 0) return steps;
  return steps.map((step) => {
    if (total >= min) return step;
    const room = Math.min(getStretchRoom(step.poi), min - total, max - total);
    if (room <= 0) return step;
    total += room;
    return {
      ...step,
      poi: {
        ...step.poi,
        stayMinutes: step.poi.stayMinutes + room,
        reason: step.poi.reason
      }
    };
  });
}
function estimateTravelMinutes(a, b) {
  if (typeof a.lat !== "number" || typeof a.lng !== "number" || typeof b.lat !== "number" || typeof b.lng !== "number") {
    return 12;
  }
  const km = distanceKm(a, b);
  return Math.max(8, Math.min(120, Math.round(km * 7 + 8)));
}
function isPoiNearRequestedDistrict(poi, district, maxKm = DISTRICT_NEARBY_KM) {
  const normalized = normalizeDistrictName(district);
  if (!normalized) return true;
  if (matchesDistrictText(poi, normalized)) return true;
  const center = DISTRICT_CENTERS[normalized];
  if (!center || typeof poi.lat !== "number" || typeof poi.lng !== "number") return false;
  return distanceKm({ ...poi, lat: center.lat, lng: center.lng }, poi) <= maxKm;
}
function distanceFromRequestedDistrictKm(poi, district) {
  const normalized = normalizeDistrictName(district);
  const center = normalized ? DISTRICT_CENTERS[normalized] : void 0;
  if (!center || typeof poi.lat !== "number" || typeof poi.lng !== "number") return 0;
  return distanceKm({ ...poi, lat: center.lat, lng: center.lng }, poi);
}
function estimateTravelMinutesFromRequestedDistrict(poi, district) {
  const km = distanceFromRequestedDistrictKm(poi, district);
  if (km <= 0) return 0;
  return Math.max(8, Math.min(120, Math.round(km * 7 + 8)));
}
function normalizeDistrictName(district) {
  if (!district) return void 0;
  const raw = district.trim();
  const withoutCity = raw.includes("\u5E02") ? raw.slice(raw.lastIndexOf("\u5E02") + 1) : raw;
  const explicit = withoutCity.match(/[\u4e00-\u9fff]{2,6}(?:区|县|旗)$/)?.[0];
  return explicit || withoutCity || void 0;
}
function matchesDistrictText(poi, district) {
  const short = district.replace(/区$/, "");
  return [poi.area, poi.businessDistrict, poi.routeCluster, poi.address].filter(Boolean).some((value) => String(value).includes(short));
}
function getStretchRoom(poi) {
  if (poi.type === "\u9910\u996E\u6B63\u9910") return 25;
  if (poi.type === "\u4F11\u95F2\u5A31\u4E50") return 25;
  if (poi.type === "\u6587\u5316\u4F53\u9A8C") return 20;
  if (poi.type === "\u6237\u5916\u6563\u6B65") return 20;
  if (poi.type === "\u8F7B\u98DF\u751C\u996E") return 15;
  return 10;
}
function clampStay(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value / 5) * 5));
}
function clampPrice(base, budget, factor) {
  return Math.max(0, Math.min(Math.round(base * (budget <= 150 ? 0.75 : budget >= 350 ? 1.15 : 1)), Math.round(budget * factor)));
}
function distanceKm(a, b) {
  if (typeof a.lat !== "number" || typeof a.lng !== "number" || typeof b.lat !== "number" || typeof b.lng !== "number") return 0;
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(h)));
}
function toRadians(value) {
  return value * Math.PI / 180;
}

// ../new-agent-a-module/src/planner/amapCategoryMap.ts
var MID_CATEGORY_NAME_MAP = [
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
  [/^特色商业街/, "outdoor"]
];
var SUB_CATEGORY_NAME_MAP = [
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
  [/^棋牌室/, "entertainment"]
];
var BIG_CATEGORY_NAME_MAP = [
  [/^餐饮服务/, "meal"],
  [/^体育休闲服务/, "entertainment"],
  [/^风景名胜/, "outdoor"],
  [/^科教文化服务/, "culture"]
];
function mapByName(bigCategoryName, midCategoryName, subCategoryName) {
  if (subCategoryName) {
    for (const [pattern, cat] of SUB_CATEGORY_NAME_MAP) {
      if (pattern.test(subCategoryName)) return cat;
    }
  }
  for (const [pattern, cat] of MID_CATEGORY_NAME_MAP) {
    if (pattern.test(midCategoryName)) return cat;
  }
  for (const [pattern, cat] of BIG_CATEGORY_NAME_MAP) {
    if (pattern.test(bigCategoryName)) return cat;
  }
  return void 0;
}
var CODE_PREFIX_MAP = [
  // --- 餐饮 050000 — 最具体的子类优先 ---
  ["050116", "local_food"],
  // 老字号 (specific sub-category)
  ["050117", "meal"],
  // 火锅店
  ["050118", "meal"],
  // 特色/地方风味
  ["050305", "meal"],
  // 茶餐厅 (fast food but still meal)
  // 中餐厅/外国餐厅/快餐厅 → meal
  ["0501", "meal"],
  ["0502", "meal"],
  ["0503", "meal"],
  ["0504", "drink"],
  // 休闲餐饮场所
  ["0505", "drink"],
  // 咖啡厅
  ["0506", "drink"],
  // 茶艺馆
  ["0507", "drink"],
  // 冷饮店
  ["0508", "drink"],
  // 糕饼店
  ["0509", "drink"],
  // 甜品店
  // --- 体育休闲 080000 ---
  ["0800", "entertainment"],
  // 体育休闲服务(通用)
  ["0801", "outdoor"],
  // 运动场馆
  ["0802", "outdoor"],
  // 高尔夫相关
  ["0803", "entertainment"],
  // 娱乐场所
  ["0804", "outdoor"],
  // 度假疗养场所
  ["0805", "entertainment"],
  // 休闲场所(游乐场)
  ["0806", "entertainment"],
  // 影剧院
  // --- 风景名胜 110000 ---
  ["1101", "outdoor"],
  // 公园广场
  ["110101", "outdoor"],
  // 公园
  ["110102", "outdoor"],
  // 动物园
  ["110103", "outdoor"],
  // 植物园
  ["110105", "outdoor"],
  // 城市广场
  ["1102", "outdoor"],
  // 风景名胜
  // --- 科教文化 140000 ---
  ["1401", "culture"],
  // 博物馆
  ["1402", "culture"],
  // 展览馆
  ["1403", "culture"],
  // 会展中心
  ["1404", "culture"],
  // 美术馆
  ["1405", "culture"],
  // 图书馆
  ["1406", "culture"],
  // 科技馆
  ["1407", "culture"],
  // 天文馆
  ["1408", "culture"],
  // 文化宫
  // --- 购物 060000 — 特定文化/户外子类 ---
  ["061205", "culture"],
  // 书店
  ["061201", "culture"],
  // 古玩字画
  ["061214", "local_food"],
  // 土特产专卖
  ["061001", "outdoor"],
  // 步行街
  ["0610", "outdoor"],
  // 特色商业街
  ["0601", "shopping"],
  // 商场/购物中心
  ["0600", "shopping"],
  // 购物服务(通用)
  ["0607", "shopping"],
  // 综合市场(含农贸/果品/水产) — 文本兜底识别夜市/小吃
  // --- 生活服务 / 住宿 070000/100000 — 通常不作路线核心 ---
  ["1001", "other"],
  // 宾馆酒店
  // --- 体育休闲 080000 — 更多子类 ---
  ["080108", "outdoor"],
  // 户外健身场所
  ["080111", "entertainment"],
  // 健身中心
  ["080501", "entertainment"],
  // 游乐场
  ["080504", "outdoor"],
  // 露营地
  // --- 风景名胜 110000 — 更多子类 ---
  ["110208", "photo"],
  // 观景点/海滩
  ["110209", "photo"],
  // 观景点
  // --- 科教文化 140000 — 更多子类 ---
  ["1400", "culture"]
  // 科教文化服务(通用)
];
function mapAmapCategoryToRouteCategory(poi) {
  const { amapCategoryCode, amapCategoryPath, amapCategoryName } = poi;
  if (amapCategoryCode) {
    const code = amapCategoryCode.replace(/\s/g, "");
    for (const [prefix, cat] of CODE_PREFIX_MAP.sort((a, b) => b[0].length - a[0].length)) {
      if (code.startsWith(prefix)) return cat;
    }
  }
  if (amapCategoryPath) {
    const parts = amapCategoryPath.split(/[>;/]/).map((p) => p.trim()).filter(Boolean);
    const big = parts[0] ?? "";
    const mid = parts[1] ?? "";
    const small = parts.slice(2).join(">");
    const result = mapByName(big, mid, small);
    if (result) return result;
  }
  if (amapCategoryName) {
    const result = mapByName(amapCategoryName, amapCategoryName);
    if (result) return result;
  }
  return void 0;
}
var MID_CODE_EXPERIENCE_MAP = [
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
  ["1400", "culture"]
];
function getExperienceSubKey(poi) {
  if (poi.amapCategoryCode) {
    const code = poi.amapCategoryCode.replace(/\s/g, "");
    for (const [prefix, subKey] of MID_CODE_EXPERIENCE_MAP) {
      if (code.startsWith(prefix)) return subKey;
    }
  }
  if (poi.amapCategoryPath) {
    const parts = poi.amapCategoryPath.split(/[>;/]/).map((p) => p.trim()).filter(Boolean);
    const mid = parts[1] || "";
    if (mid === "\u5496\u5561\u5385") return "coffee";
    if (mid === "\u751C\u54C1\u5E97") return "dessert";
    if (mid === "\u535A\u7269\u9986") return "museum";
    if (mid === "\u7F8E\u672F\u9986") return "gallery";
    if (mid === "\u56FE\u4E66\u9986") return "library";
    if (mid === "\u516C\u56ED\u5E7F\u573A") return "park";
    if (mid === "\u8FD0\u52A8\u573A\u9986") return "sports";
    if (mid === "\u5F71\u5267\u9662") return "cinema";
    if (mid === "\u5A31\u4E50\u573A\u6240") return "nightlife";
  }
  return void 0;
}

// ../new-agent-a-module/src/planner/poiNormalizer.ts
var LOW_VALUE_CHAIN_BRANDS = [
  "\u745E\u5E78",
  "luckin",
  "\u661F\u5DF4\u514B",
  "starbucks",
  "\u9EA6\u5F53\u52B3",
  "\u80AF\u5FB7\u57FA",
  "KFC",
  "\u5FC5\u80DC\u5BA2",
  "\u6C49\u5821\u738B",
  "\u871C\u96EA\u51B0\u57CE",
  "\u76CA\u79BE\u5802",
  "\u53E4\u8317",
  "\u4E00\u70B9\u70B9",
  "\u8336\u767E\u9053",
  "\u5948\u96EA",
  "\u559C\u8336",
  "\u9738\u738B\u8336\u59EC",
  "CoCo",
  "\u6CAA\u4E0A\u963F\u59E8",
  "\u7EDD\u5473\u9E2D\u8116",
  "\u6B63\u65B0\u9E21\u6392",
  "\u534E\u83B1\u58EB"
];
var GENERIC_SERVICE_PATTERN = /游客中心|服务中心|停车场|收费站|公交站|地铁站|道路|路口|出入口|入口|出口|卫生间|厕所|派出所|办事处|委员会|政府|银行|医院|药房|学校|培训|写字楼|公寓|住宅|小区|酒店|宾馆|公司|物流|仓库|售楼|营销中心|维修|洗车|汽修|中介|房产/;
var FAKE_GENERAL_PLACE_PATTERN = /附近|周边|顺路|推荐点|休息点|聚餐点|咖啡点|玩乐点|体验点|路线节点|占位|待定|某某|目的地/;
var ABSTRACT_UNEXECUTABLE_NAME_PATTERN = /附近|周边|顺路|推荐点|休息点|聚餐点|咖啡点|玩乐点|体验点|路线节点|占位|待定|某某/;
var FAKE_ADDRESS_PATTERN = /附近/;
var LOCAL_FEATURE_PATTERN = /本地|老字号|夜市|美食街|市集|街区|特色街区|古城|古镇|茶餐厅|小吃|文创|创意园|公园|绿道|栈道|海滨|博物馆|美术馆|艺术馆|图书馆|书店|书吧|文化馆/;
function normalizePoiForRecommendation(poi, requirements) {
  const planned = normalizePoiForPlanning(poi, requirements);
  const text = buildPoiText(planned);
  const venueKey = getVenueKey(planned.name, planned.area || planned.businessDistrict);
  const brandKey = getBrandKey(text) || venueKey;
  const categoryKey = getCategoryKey(planned);
  const source = inferPoiSource(planned);
  const qualityTags = buildQualityTags(planned, requirements);
  const qualityWarnings = buildQualityWarnings(planned, requirements);
  return {
    ...planned,
    source,
    venueKey,
    brandKey,
    categoryKey,
    qualityTags,
    qualityWarnings,
    qualityScore: scorePoiQuality(planned, qualityTags, qualityWarnings)
  };
}
function isLowValueChainPoi(poi, requirements) {
  const text = buildPoiText(poi);
  const brand = getBrandKey(text);
  if (!brand) return false;
  if (!requirements) return true;
  return !isExplicitlyRequestedBrand(brand, requirements);
}
function isLowValueAnchorPoi(poi) {
  const text = buildPoiText(poi);
  return Boolean(getBrandKey(text)) || GENERIC_SERVICE_PATTERN.test(text) || /游客中心|停车场|出入口|入口|服务中心/.test(text);
}
function isRealNavigablePoi(poi) {
  const text = buildPoiText(poi);
  if (!poi.name || poi.name.trim().length < 2) return false;
  if (FAKE_GENERAL_PLACE_PATTERN.test(poi.name)) return false;
  if (GENERIC_SERVICE_PATTERN.test(text)) return false;
  return Boolean(
    poi.address || poi.mockMeituanUrl || poi.lat !== void 0 || poi.lng !== void 0 || hasConcreteSource(poi)
  );
}
function isExecutablePoi(poi) {
  if (!isRealNavigablePoi(poi)) return false;
  const text = buildPoiText(poi);
  if (ABSTRACT_UNEXECUTABLE_NAME_PATTERN.test(poi.name)) return false;
  if (FAKE_ADDRESS_PATTERN.test(poi.address || "") && !hasConcreteSource(poi)) return false;
  if (/mock:\/\/local/i.test(poi.mockMeituanUrl || "") && !poi.address && (poi.lat === void 0 || poi.lng === void 0)) return false;
  return true;
}
function getVenueKey(name, area) {
  const cleanedName = name.replace(/[（(].*?[）)]/g, "").replace(/旗舰店|总店|分店|东区|西区|南区|北区|一期|二期|三期|店|馆|中心/gi, "").replace(/[·\s\-_/｜|]/g, "").trim().toLowerCase();
  const cleanedArea = (area || "").replace(/街道|附近/g, "").replace(/\s+/g, "").trim().toLowerCase();
  return [cleanedName || name.trim().toLowerCase(), cleanedArea].filter(Boolean).join("@");
}
function getBrandKey(text) {
  return LOW_VALUE_CHAIN_BRANDS.find((brand) => new RegExp(escapeRegExp(brand), "i").test(text));
}
function getCategoryKey(poi) {
  if (poi.categoryKey) return poi.categoryKey;
  const amapCategory = mapAmapCategoryToRouteCategory(poi);
  if (amapCategory) return amapCategory;
  const text = buildPoiText(poi);
  if (poi.type === "\u9910\u996E\u6B63\u9910" || /餐|饭|菜馆|火锅|烧烤|小吃|夜市|美食街|茶餐厅|bistro/i.test(text)) return "meal";
  if (poi.type === "\u8F7B\u98DF\u751C\u996E" || /咖啡|茶|甜品|奶茶|饮品|面包|下午茶/i.test(text)) return "drink";
  if (poi.type === "\u6587\u5316\u4F53\u9A8C" || /展|美术馆|博物馆|书店|文化|艺术|手作|陶艺|DIY/i.test(text)) return "culture";
  if (poi.type === "\u6237\u5916\u6563\u6B65" || /公园|绿道|栈道|海滨|沙滩|街区|古城|散步|citywalk/i.test(text)) return "outdoor";
  if (poi.type === "\u62CD\u7167\u5730\u6807" || /拍照|打卡|地标|夜景|广场/i.test(text)) return "photo";
  if (poi.type === "\u4F11\u95F2\u5A31\u4E50" || /娱乐|电影|影院|KTV|密室|桌游|电玩城|乐园|运动/i.test(text)) return "entertainment";
  return "other";
}
function inferPoiSource(poi) {
  if (poi.source) return poi.source;
  const id = poi.id || "";
  const url = poi.mockMeituanUrl || "";
  if (/^live_|^amap_|mock:\/\/amap/i.test(`${id} ${url}`) || poi.availableTools?.includes("amapPlaceSearch")) return "amap";
  if (/^manual-|^custom-/i.test(id)) return "manual";
  return "local";
}
function buildQualityTags(poi, requirements) {
  const tags = /* @__PURE__ */ new Set();
  const text = buildPoiText(poi);
  if (getBrandKey(text)) tags.add("low_value_chain");
  if (GENERIC_SERVICE_PATTERN.test(text)) tags.add("generic_service");
  if (isLowValueAnchorPoi(poi)) tags.add("bad_anchor_candidate");
  if (LOCAL_FEATURE_PATTERN.test(text)) tags.add("local_feature");
  if (poi.price === 0 || poi.price <= 50 || poi.limits.includes("\u9884\u7B97\u53CB\u597D") || poi.tags.includes("\u514D\u8D39")) tags.add("budget_friendly");
  if (poi.lat !== void 0 && poi.lng !== void 0) tags.add("has_coordinates");
  if (requirements.budgetMax <= 150 && /夜市|小吃|美食街|市集|老字号|公园|博物馆|美术馆|艺术馆|图书馆|绿道|街区|古镇|古城/.test(text)) {
    tags.add("low_budget_value");
  }
  return [...tags];
}
function buildQualityWarnings(poi, requirements) {
  const warnings = [];
  const text = buildPoiText(poi);
  const brand = getBrandKey(text);
  if (!isRealNavigablePoi(poi)) warnings.push("\u5730\u70B9\u7F3A\u5C11\u53EF\u5BFC\u822A\u4FE1\u606F\u6216\u7591\u4F3C\u6CDB\u5316\u5360\u4F4D\u70B9");
  if (brand && isExplicitlyRejectedBrand(brand, requirements)) warnings.push(`\u547D\u4E2D\u7528\u6237\u660E\u786E\u6392\u65A5\u54C1\u724C\uFF1A${brand}`);
  if (brand && !isExplicitlyRequestedBrand(brand, requirements)) warnings.push(`\u666E\u901A\u8FDE\u9501\u54C1\u724C\uFF1A${brand}`);
  if (GENERIC_SERVICE_PATTERN.test(text)) warnings.push("\u4F4E\u4EF7\u503C\u670D\u52A1\u578B\u5730\u70B9\uFF0C\u4E0D\u9002\u5408\u4F5C\u4E3A\u8DEF\u7EBF\u6838\u5FC3");
  if (!isExecutablePoi(poi)) warnings.push("\u5730\u70B9\u7591\u4F3C\u62BD\u8C61\u515C\u5E95\u6216\u4E0D\u53EF\u6267\u884C\uFF0C\u4E0D\u80FD\u76F4\u63A5\u5BFC\u822A/\u641C\u7D22");
  return warnings;
}
function scorePoiQuality(poi, tags, warnings) {
  let score = 72;
  if (tags.includes("local_feature")) score += 12;
  if (tags.includes("budget_friendly")) score += 6;
  if (tags.includes("has_coordinates")) score += 4;
  if ((poi.meituanRating ?? 0) >= 4.6) score += 4;
  if (tags.includes("low_value_chain")) score -= 24;
  if (tags.includes("generic_service")) score -= 35;
  if (!isExecutablePoi(poi)) score -= 45;
  score -= warnings.length * 10;
  return Math.max(0, Math.min(100, score));
}
function isExplicitlyRequestedBrand(brand, requirements) {
  const text = getRequirementText(requirements);
  return new RegExp(`(\u60F3\u53BB|\u8981\u53BB|\u5C31\u53BB|\u6307\u5B9A|\u559C\u6B22|\u53EF\u4EE5).{0,12}${escapeRegExp(brand)}`, "i").test(text);
}
function isExplicitlyRejectedBrand(brand, requirements) {
  const text = getRequirementText(requirements);
  return new RegExp(`(\u4E0D\u8981|\u4E0D\u60F3\u53BB|\u4E0D\u53BB|\u522B\u53BB|\u907F\u5F00|\u5C11\u63A8\u8350|\u62D2\u7EDD).{0,12}${escapeRegExp(brand)}`, "i").test(text);
}
function getRequirementText(requirements) {
  return [
    requirements.rawText,
    ...requirements.preferences,
    ...requirements.constraints,
    ...requirements.userProfile?.rejectedKeywords ?? [],
    ...requirements.userProfile?.dislikedPoiTypes ?? []
  ].filter(Boolean).join(" ");
}
function hasConcreteSource(poi) {
  return inferPoiSource(poi) === "amap" || inferPoiSource(poi) === "local";
}
function buildPoiText(poi) {
  return [
    poi.name,
    poi.type,
    poi.subType,
    poi.address,
    poi.area,
    poi.businessDistrict,
    poi.routeCluster,
    poi.tags.join(" "),
    poi.limits.join(" "),
    poi.reason,
    poi.amapCategoryPath,
    poi.amapCategoryName
  ].filter(Boolean).join(" ");
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ../new-agent-a-module/src/planner/routeQualityCheck.ts
function evaluateRouteQuality(route, requirements, template) {
  const normalizedSteps = route.steps.map((step) => ({
    ...step,
    poi: normalizePoiForRecommendation(step.poi, requirements)
  }));
  const warnings = [];
  const fatalReasons = [];
  const debugReasons = [];
  const issues = [];
  checkRealPois(normalizedSteps, fatalReasons, debugReasons, issues);
  checkExecutablePois(normalizedSteps, fatalReasons, debugReasons, issues);
  checkDistrictConsistency(normalizedSteps, requirements, fatalReasons, debugReasons, issues);
  checkDuplicateVenues(normalizedSteps, fatalReasons, debugReasons, issues);
  checkDuplicateBrands(normalizedSteps, fatalReasons, debugReasons, issues);
  checkRejectedBrands(normalizedSteps, requirements, fatalReasons, debugReasons, issues);
  checkRejectedTypes(normalizedSteps, requirements, fatalReasons, debugReasons, issues);
  checkAnchor(normalizedSteps, warnings, fatalReasons, debugReasons, issues);
  checkTemplateRoleCoverage(normalizedSteps, template, warnings, debugReasons, issues);
  checkTemplateRoleCompatibility(normalizedSteps, fatalReasons, debugReasons, issues);
  checkCategoryDiversity(normalizedSteps, warnings, debugReasons, issues);
  checkExperienceStacking(normalizedSteps, warnings, debugReasons, issues);
  checkFoodDrinkBalance(normalizedSteps, template, warnings, debugReasons, issues);
  checkLowValueChainLoad(normalizedSteps, warnings, debugReasons, issues);
  checkBudgetRouteValue(normalizedSteps, requirements, warnings, debugReasons, issues);
  checkDuration(route, requirements, warnings, debugReasons, issues);
  checkTravel(normalizedSteps, requirements, warnings, debugReasons, issues);
  if (route.steps.length < getTargetStopCount(requirements)) {
    const targetStopCount = getTargetStopCount(requirements);
    const message = `\u5F53\u524D\u8DEF\u7EBF\u4E3A ${route.steps.length} \u7AD9\uFF0C\u5C11\u4E8E\u76EE\u6807 ${targetStopCount} \u7AD9\uFF1B\u5982\u679C\u5019\u9009\u8D28\u91CF\u4E0D\u8DB3\uFF0C\u77ED\u8DEF\u7EBF\u6BD4\u786C\u51D1\u70B9\u66F4\u7A33\u3002`;
    addWarning(warnings, issues, {
      code: "too_few_stops_without_reason",
      message,
      meta: {
        currentStops: route.steps.length,
        targetStops: targetStopCount
      }
    });
  }
  const normalizedTemplateId = normalizeTemplateId(template);
  if (normalizedTemplateId) debugReasons.push(`quality_template=${normalizedTemplateId}`);
  const uniqueWarnings = uniqueMessages(warnings);
  const uniqueFatalReasons = uniqueMessages(fatalReasons);
  const uniqueDebugReasons = uniqueMessages(debugReasons);
  const uniqueIssueList = uniqueIssues(issues);
  const score = calculateRouteQualityScore(route, uniqueWarnings, uniqueFatalReasons);
  return {
    passed: uniqueFatalReasons.length === 0 && score >= 60,
    score,
    warnings: [...uniqueFatalReasons, ...uniqueWarnings],
    fatalReasons: uniqueFatalReasons,
    debugReasons: uniqueDebugReasons,
    issues: uniqueIssueList
  };
}
function checkExecutablePois(steps, fatalReasons, debugReasons, issues) {
  for (const step of steps) {
    if (!isExecutablePoi(step.poi)) {
      const message = `\u300C${step.poi.name}\u300D\u7591\u4F3C\u62BD\u8C61\u515C\u5E95\u6216\u4E0D\u53EF\u6267\u884C\u5730\u70B9\uFF0C\u4E0D\u80FD\u76F4\u63A5\u5BFC\u822A/\u641C\u7D22\u3002`;
      addFatal(fatalReasons, issues, {
        code: "not_executable_poi",
        message,
        poiIds: [step.poi.id]
      });
      debugReasons.push(`not_executable:${step.poi.id}:${step.poi.name}`);
    }
  }
}
function checkDistrictConsistency(steps, requirements, fatalReasons, debugReasons, issues) {
  if (!requirements.district || requirements.allowCrossDistrict) return;
  for (const step of steps) {
    if (matchesDistrictText2(step.poi, requirements.district)) continue;
    const message = `\u7528\u6237\u6307\u5B9A\u300C${requirements.district}\u300D\u4E14\u672A\u5141\u8BB8\u8DE8\u533A\uFF0C\u4F46\u8DEF\u7EBF\u5305\u542B\u300C${step.poi.name}\u300D\uFF08${step.poi.area || step.poi.businessDistrict}\uFF09\u3002`;
    addFatal(fatalReasons, issues, {
      code: "cross_district_without_permission",
      message,
      poiIds: [step.poi.id],
      meta: {
        district: requirements.district,
        poiDistrict: step.poi.area || step.poi.businessDistrict
      }
    });
    debugReasons.push(`district_mismatch:${step.poi.id}:${step.poi.name}:${step.poi.area || step.poi.businessDistrict}`);
  }
}
function checkRealPois(steps, fatalReasons, debugReasons, issues) {
  for (const step of steps) {
    if (!isRealNavigablePoi(step.poi)) {
      const message = `\u300C${step.poi.name}\u300D\u7F3A\u5C11\u53EF\u5BFC\u822A\u4FE1\u606F\u6216\u7591\u4F3C\u6CDB\u5316\u5730\u70B9\u3002`;
      addFatal(fatalReasons, issues, {
        code: "not_real_navigable_poi",
        message,
        poiIds: [step.poi.id]
      });
      debugReasons.push(`not_real_navigable:${step.poi.id}:${step.poi.name}`);
    }
  }
}
function checkDuplicateVenues(steps, fatalReasons, debugReasons, issues) {
  const seen = /* @__PURE__ */ new Map();
  for (const step of steps) {
    const key = step.poi.venueKey || getVenueKey(step.poi.name, step.poi.area || step.poi.businessDistrict);
    if (key.length < 3) continue;
    const existing = seen.get(key);
    if (existing) {
      const message = `\u8DEF\u7EBF\u91CD\u590D\u51FA\u73B0\u76F8\u540C\u6216\u9AD8\u5EA6\u76F8\u4F3C\u5730\u70B9\uFF1A\u300C${existing.name}\u300D\u548C\u300C${step.poi.name}\u300D\u3002`;
      addFatal(fatalReasons, issues, {
        code: "duplicate_venue",
        message,
        poiIds: [existing.id, step.poi.id],
        meta: { venueKey: key }
      });
      debugReasons.push(`duplicate_venue:${key}`);
      continue;
    }
    seen.set(key, step.poi);
  }
}
function checkDuplicateBrands(steps, fatalReasons, debugReasons, issues) {
  const seen = /* @__PURE__ */ new Map();
  for (const step of steps) {
    const brand = step.poi.brandKey && getBrandKey(step.poi.brandKey) ? step.poi.brandKey : getBrandKey(buildPoiText2(step.poi));
    if (!brand) continue;
    const normalizedBrand = brand.toLowerCase();
    const existing = seen.get(normalizedBrand);
    if (existing) {
      const message = `\u666E\u901A\u8FDE\u9501\u54C1\u724C\u91CD\u590D\u51FA\u73B0\uFF1A\u300C${existing.name}\u300D\u548C\u300C${step.poi.name}\u300D\u3002`;
      addFatal(fatalReasons, issues, {
        code: "duplicate_brand",
        message,
        poiIds: [existing.id, step.poi.id],
        meta: { brandKey: normalizedBrand }
      });
      debugReasons.push(`duplicate_low_value_brand:${brand}`);
      continue;
    }
    seen.set(normalizedBrand, step.poi);
  }
}
function checkRejectedBrands(steps, requirements, fatalReasons, debugReasons, issues) {
  for (const step of steps) {
    const brand = getBrandKey(buildPoiText2(step.poi));
    if (!brand || !isExplicitlyRejectedBrand(brand, requirements)) continue;
    const message = `\u7528\u6237\u660E\u786E\u6392\u65A5\u300C${brand}\u300D\uFF0C\u4F46\u8DEF\u7EBF\u4E2D\u4ECD\u5305\u542B\u300C${step.poi.name}\u300D\u3002`;
    addFatal(fatalReasons, issues, {
      code: "rejected_brand",
      message,
      poiIds: [step.poi.id],
      meta: { brandKey: brand.toLowerCase() }
    });
    debugReasons.push(`rejected_brand:${brand}:${step.poi.id}`);
  }
}
function checkRejectedTypes(steps, requirements, fatalReasons, debugReasons, issues) {
  const rejectedTypes = getExplicitlyRejectedTypes(requirements);
  if (rejectedTypes.length === 0) return;
  for (const step of steps) {
    const category = step.poi.categoryKey || getCategoryKey(step.poi);
    const text = buildPoiText2(step.poi);
    const matched = rejectedTypes.find(
      (type) => step.poi.type.includes(type) || step.poi.subType.includes(type) || category.includes(type) || text.includes(type)
    );
    if (!matched) continue;
    const message = `\u7528\u6237\u660E\u786E\u6392\u65A5\u300C${matched}\u300D\uFF0C\u4F46\u8DEF\u7EBF\u4E2D\u4ECD\u5305\u542B\u300C${step.poi.name}\u300D\u3002`;
    addFatal(fatalReasons, issues, {
      code: "rejected_type",
      message,
      poiIds: [step.poi.id],
      meta: { rejectedType: matched }
    });
    debugReasons.push(`rejected_type:${matched}:${step.poi.id}`);
  }
}
function checkAnchor(steps, warnings, fatalReasons, debugReasons, issues) {
  const anchorStep = inferAnchorStep(steps);
  if (!anchorStep) {
    addWarning(warnings, issues, {
      code: "missing_anchor",
      message: "\u8DEF\u7EBF\u7F3A\u5C11\u660E\u786E\u6838\u5FC3\u951A\u70B9\u3002"
    });
    debugReasons.push("missing_anchor");
    return;
  }
  if (isLowValueAnchorPoi(anchorStep.poi)) {
    const message = `\u300C${anchorStep.poi.name}\u300D\u4E0D\u9002\u5408\u4F5C\u4E3A\u8DEF\u7EBF\u6838\u5FC3\u951A\u70B9\u3002`;
    addFatal(fatalReasons, issues, {
      code: "low_value_anchor",
      message,
      poiIds: [anchorStep.poi.id]
    });
    debugReasons.push(`low_value_anchor:${anchorStep.poi.id}:${anchorStep.poi.name}`);
    return;
  }
  if (!isMeaningfulAnchorPoi(anchorStep.poi)) {
    addWarning(warnings, issues, {
      code: "weak_anchor",
      message: "\u8DEF\u7EBF\u7F3A\u5C11\u660E\u663E\u6838\u5FC3\u951A\u70B9\uFF0C\u7B2C\u4E00\u7AD9\u66F4\u50CF\u666E\u901A\u8854\u63A5\u70B9\u3002",
      poiIds: [anchorStep.poi.id]
    });
    debugReasons.push(`weak_anchor:${anchorStep.poi.id}:${anchorStep.poi.name}`);
  }
}
function checkCategoryDiversity(steps, warnings, debugReasons, issues) {
  if (steps.length < 3) return;
  const categoryCounts = /* @__PURE__ */ new Map();
  for (const step of steps) {
    const key = step.poi.categoryKey || getCategoryKey(step.poi);
    categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
  }
  const repeated = [...categoryCounts.entries()].filter(([, count]) => count >= 3);
  if (repeated.length > 0) {
    addWarning(warnings, issues, {
      code: "too_many_same_category",
      message: `\u8DEF\u7EBF\u4E2D\u540C\u7C7B\u8282\u70B9\u504F\u591A\uFF1A${repeated.map(([key]) => key).join("\u3001")}\u3002`,
      meta: { repeatedCategoryCount: repeated.length }
    });
    for (const [category, count] of repeated) {
      issues.push({
        code: "too_many_same_category",
        severity: "warning",
        message: `\u8DEF\u7EBF\u4E2D\u540C\u7C7B\u8282\u70B9\u504F\u591A\uFF1A${category}\u3002`,
        meta: {
          category,
          count
        }
      });
    }
    debugReasons.push(`repeated_categories:${repeated.map(([key]) => key).join(",")}`);
  }
}
function checkExperienceStacking(steps, warnings, debugReasons, issues) {
  if (steps.length < 3) return;
  const subKeyCounts = /* @__PURE__ */ new Map();
  for (const step of steps) {
    const subKey = getExperienceSubKey(step.poi);
    if (!subKey) continue;
    const group = subKeyCounts.get(subKey) ?? [];
    group.push(step.poi);
    subKeyCounts.set(subKey, group);
  }
  for (const [subKey, group] of subKeyCounts) {
    if (group.length < 2) continue;
    const names = group.map((poi) => poi.name).join("\u3001");
    addWarning(warnings, issues, {
      code: "same_experience_stacking",
      message: `\u8DEF\u7EBF\u4E2D\u300C${names}\u300D\u5C5E\u4E8E\u540C\u7C7B\u4F53\u9A8C\uFF08${labelExperienceSubKey(subKey)}\uFF09\u3002`,
      poiIds: group.map((poi) => poi.id),
      meta: { experienceSubKey: subKey, count: group.length }
    });
    debugReasons.push(`experience_stacking:${subKey}:${group.length}`);
  }
}
function labelExperienceSubKey(key) {
  const labels = {
    coffee: "\u5496\u5561\u5385",
    tea: "\u8336\u996E",
    cold_drink: "\u51B7\u996E",
    bakery: "\u9762\u5305\u7CD5\u997C",
    dessert: "\u751C\u54C1",
    meal: "\u6B63\u9910",
    fast_food: "\u5FEB\u9910\u5385",
    casual_eat: "\u4F11\u95F2\u9910\u996E",
    park: "\u516C\u56ED\u5E7F\u573A",
    scenery: "\u98CE\u666F\u540D\u80DC",
    museum: "\u535A\u7269\u9986",
    exhibition: "\u5C55\u89C8",
    gallery: "\u7F8E\u672F\u9986",
    library: "\u56FE\u4E66\u9986",
    science: "\u79D1\u6280\u9986",
    culture_center: "\u6587\u5316\u7A7A\u95F4",
    sports: "\u8FD0\u52A8",
    cinema: "\u5F71\u5267\u9662",
    nightlife: "\u5A31\u4E50\u573A\u6240",
    playground: "\u6E38\u4E50\u573A"
  };
  return labels[key] ?? key;
}
function checkFoodDrinkBalance(steps, template, warnings, debugReasons, issues) {
  const templateId = normalizeTemplateId(template);
  if (!["photo_afternoon_tea", "date"].includes(templateId ?? "")) return;
  const drinkSteps = steps.filter((step) => isDrinkLike(step.poi));
  const foodDrinkSteps = steps.filter((step) => isFoodOrDrinkLike(step.poi));
  if (drinkSteps.length > 1) {
    addWarning(warnings, issues, {
      code: "too_many_drink",
      message: `\u62CD\u7167/\u7EA6\u4F1A\u8DEF\u7EBF\u4E2D\u5496\u5561\u751C\u54C1\u7C7B\u8282\u70B9\u504F\u591A\uFF1A${drinkSteps.map((step) => step.poi.name).join("\u3001")}\u3002`,
      poiIds: drinkSteps.map((step) => step.poi.id),
      meta: { count: drinkSteps.length }
    });
    debugReasons.push(`too_many_drink_nodes:${drinkSteps.map((step) => step.poi.id).join(",")}`);
  }
  if (foodDrinkSteps.length > 2) {
    addWarning(warnings, issues, {
      code: "too_many_food_drink",
      message: `\u62CD\u7167/\u7EA6\u4F1A\u8DEF\u7EBF\u4E2D\u5403\u559D\u7C7B\u8282\u70B9\u5360\u6BD4\u504F\u9AD8\uFF1A${foodDrinkSteps.map((step) => step.poi.name).join("\u3001")}\u3002`,
      poiIds: foodDrinkSteps.map((step) => step.poi.id),
      meta: { count: foodDrinkSteps.length }
    });
    debugReasons.push(`too_many_food_drink_nodes:${foodDrinkSteps.map((step) => step.poi.id).join(",")}`);
  }
}
function checkTemplateRoleCoverage(steps, template, warnings, debugReasons, issues) {
  const templateId = normalizeTemplateId(template);
  if (!templateId) return;
  const requiredRoles = getRequiredTemplateRoles(templateId);
  if (requiredRoles.length === 0) return;
  const presentRoles = new Set(steps.flatMap((step) => normalizeTemplateRole(step)));
  const missingRoles = requiredRoles.filter((role) => !presentRoles.has(role));
  if (missingRoles.length === 0) return;
  addWarning(warnings, issues, {
    code: "missing_template_role",
    message: `\u8DEF\u7EBF\u6A21\u677F\u7F3A\u5C11\u5173\u952E\u89D2\u8272\uFF1A${missingRoles.map(labelTemplateRole).join("\u3001")}\u3002`,
    meta: {
      templateId,
      missingCount: missingRoles.length
    }
  });
  for (const role of missingRoles) {
    issues.push({
      code: "missing_template_role",
      severity: "warning",
      message: `\u8DEF\u7EBF\u6A21\u677F\u7F3A\u5C11\u5173\u952E\u89D2\u8272\uFF1A${labelTemplateRole(role)}\u3002`,
      role,
      meta: { templateId }
    });
  }
  debugReasons.push(`missing_template_roles:${templateId}:${missingRoles.join(",")}`);
}
function checkTemplateRoleCompatibility(steps, fatalReasons, debugReasons, issues) {
  for (const step of steps) {
    if (!step.templateRole) continue;
    if (isTemplateRoleCompatible(step)) continue;
    const message = `\u300C${step.poi.name}\u300D\u7684\u6A21\u677F\u89D2\u8272\u300C${labelTemplateRole(step.templateRole)}\u300D\u4E0E\u5730\u70B9\u7C7B\u578B\u300C${step.poi.type}\u300D\u4E0D\u5339\u914D\u3002`;
    addFatal(fatalReasons, issues, {
      code: "template_role_mismatch",
      message,
      poiIds: [step.poi.id],
      role: step.templateRole
    });
    debugReasons.push(`template_role_mismatch:${step.templateRole}:${step.poi.id}:${step.poi.name}`);
  }
}
function checkLowValueChainLoad(steps, warnings, debugReasons, issues) {
  const chainSteps = steps.filter((step) => isLowValueChainPoi(step.poi));
  if (chainSteps.length >= 2) {
    addWarning(warnings, issues, {
      code: "too_many_low_value_chains",
      message: `\u666E\u901A\u8FDE\u9501\u8282\u70B9\u504F\u591A\uFF1A${chainSteps.map((step) => step.poi.name).join("\u3001")}\u3002`,
      poiIds: chainSteps.map((step) => step.poi.id),
      meta: { count: chainSteps.length }
    });
    debugReasons.push(`too_many_low_value_chains:${chainSteps.map((step) => step.poi.id).join(",")}`);
  }
}
function checkBudgetRouteValue(steps, requirements, warnings, debugReasons, issues) {
  if (requirements.budgetMax > 150) return;
  const hasLowBudgetValue = steps.some((step) => {
    const text = buildPoiText2(step.poi);
    return step.poi.price === 0 || /本地|老字号|夜市|美食街|市集|小吃|茶餐厅|公园|绿道|栈道|街区|古城|博物馆|美术馆|图书馆|文化馆/.test(text);
  });
  if (!hasLowBudgetValue) {
    addWarning(warnings, issues, {
      code: "low_budget_missing_local_value",
      message: "\u4F4E\u9884\u7B97\u8DEF\u7EBF\u7F3A\u5C11\u672C\u5730\u5C0F\u5403\u3001\u591C\u5E02\u5E02\u96C6\u3001\u514D\u8D39\u516C\u5171\u7A7A\u95F4\u6216\u6587\u5316\u7A7A\u95F4\uFF0C\u53EF\u80FD\u663E\u5F97\u666E\u901A\u3002"
    });
    debugReasons.push("low_budget_missing_local_or_free_value");
  }
}
function getRequiredTemplateRoles(templateId) {
  const roles = {
    relaxed_half_day: ["anchor", "support", "break"],
    photo_afternoon_tea: ["anchor", "break", "support", "ending"],
    low_budget: ["anchor", "meal", "support"],
    rainy_indoor: ["anchor", "support", "break"],
    friends_gathering: ["anchor", "support", "meal"],
    date: ["anchor", "break", "ending"],
    family: ["anchor", "support", "break"]
  };
  return roles[templateId] ?? [];
}
function normalizeTemplateRole(step) {
  const roles = /* @__PURE__ */ new Set();
  if (step.isAnchor || step.templateRole === "anchor") roles.add("anchor");
  const rawRole = step.templateRole ?? step.role;
  if (rawRole === "break") roles.add("break");
  if (rawRole === "meal" || rawRole === "local_food") roles.add("meal");
  if (rawRole === "ending") roles.add("ending");
  if (["support", "free_space", "indoor_activity", "interactive", "atmosphere", "family_activity"].includes(rawRole)) {
    roles.add("support");
  }
  const category = step.poi.categoryKey || getCategoryKey(step.poi);
  if (category === "drink") roles.add("break");
  if (category === "meal") roles.add("meal");
  if (category === "local_food") {
    roles.add("meal");
    roles.add("support");
  }
  if (["culture", "outdoor", "photo", "entertainment"].includes(category)) roles.add("support");
  return [...roles];
}
function labelTemplateRole(role) {
  const labels = {
    anchor: "\u4E3B\u951A\u70B9",
    break: "\u4F11\u606F/\u4E0B\u5348\u8336",
    meal: "\u6B63\u9910/\u672C\u5730\u5403\u98DF",
    support: "\u8865\u5145\u4F53\u9A8C",
    ending: "\u6536\u5C3E\u70B9"
  };
  return labels[role] ?? role;
}
function isTemplateRoleCompatible(step) {
  const role = step.templateRole;
  const category = step.poi.categoryKey || getCategoryKey(step.poi);
  const text = buildPoiText2(step.poi);
  if (!role) return true;
  if (role === "anchor") return ["culture", "outdoor", "photo", "entertainment"].includes(category);
  if (role === "break") return category === "drink" || /咖啡|下午茶|甜品|茶饮|面包|休息|书店|书吧|书房|图书|阅读/i.test(text);
  if (role === "meal" || role === "local_food") return ["meal", "local_food"].includes(category) || /正餐|小吃|饭|餐|美食|茶餐厅|夜市|美食街/i.test(text);
  if (role === "free_space") return ["local_food"].includes(category) || step.poi.price === 0 || /免费|公园|绿道|街区|古镇|图书馆|博物馆|美术馆|文化馆/i.test(text);
  if (role === "indoor_activity") return ["culture", "entertainment"].includes(category) && (step.poi.limits.includes("\u5BA4\u5185") || step.poi.limits.includes("\u96E8\u5929\u53EF\u53BB") || /室内|书店|书吧|美术馆|博物馆|展览|桌游|手作|密室|剧本杀|影院|DIY|棋牌|台球|健身|电竞|网吧|儿童乐园|游泳馆/i.test(text));
  if (role === "interactive") return category === "entertainment" || /互动|桌游|KTV|密室|剧本杀|棋牌|台球|运动|健身|电竞|DIY|手作|团建|酒吧|露营|采摘|轰趴|市集|夜市|聚会|聊天|体验|足浴|按摩|洗浴|汗蒸|网吧|私人影院|游泳|羽毛球|儿童乐园/i.test(text);
  if (role === "atmosphere") return ["culture", "outdoor", "photo", "drink"].includes(category) || /氛围|夜景|约会|艺术|书店|书吧|公园|海滨|街区|古镇|拍照|酒吧|私人影院|展览|茶馆|手工|DIY/i.test(text);
  if (role === "family_activity") return ["culture", "outdoor", "entertainment"].includes(category) && /亲子|儿童|自然教育|公园|博物馆|图书馆|少走路|雨天可去|儿童乐园/i.test(text);
  if (role === "ending") return ["outdoor", "photo", "culture", "entertainment"].includes(category) || /散步|公园|绿道|海滨|街区|书店|书吧|美术馆|艺术馆/i.test(text);
  if (role === "support") return ["culture", "outdoor", "photo", "entertainment", "meal", "local_food"].includes(category);
  return true;
}
function matchesDistrictText2(poi, district) {
  const normalized = district.replace(/区$/, "");
  return [poi.area, poi.businessDistrict, poi.routeCluster, poi.address].filter(Boolean).some((value) => String(value).includes(normalized));
}
function checkDuration(route, requirements, warnings, debugReasons, issues) {
  const window = getDurationWindow(requirements);
  if (route.totalMinutes < window.min) {
    const message = `\u8DEF\u7EBF\u603B\u65F6\u957F ${route.totalMinutes} \u5206\u949F\u4F4E\u4E8E\u9884\u671F\u4E0B\u9650 ${window.min} \u5206\u949F\u3002`;
    addWarning(warnings, issues, {
      code: "duration_under",
      message,
      meta: {
        totalMinutes: route.totalMinutes,
        minMinutes: window.min
      }
    });
    debugReasons.push(`duration_under:${route.totalMinutes}<${window.min}`);
  }
  if (route.totalMinutes > window.max) {
    const message = `\u8DEF\u7EBF\u603B\u65F6\u957F ${route.totalMinutes} \u5206\u949F\u8D85\u8FC7\u9884\u671F\u4E0A\u9650 ${window.max} \u5206\u949F\u3002`;
    addWarning(warnings, issues, {
      code: "duration_over",
      message,
      meta: {
        totalMinutes: route.totalMinutes,
        maxMinutes: window.max
      }
    });
    debugReasons.push(`duration_over:${route.totalMinutes}>${window.max}`);
  }
}
function checkTravel(steps, requirements, warnings, debugReasons, issues) {
  const first = steps[0]?.poi;
  if (first && requirements.currentLocation) {
    const firstLeg = estimateTravelMinutesFromCurrentLocation(first, requirements.currentLocation);
    if (firstLeg > 60) {
      const message = `\u7B2C\u4E00\u7AD9\u9884\u8BA1\u8DEF\u7A0B\u7EA6 ${firstLeg} \u5206\u949F\uFF0C\u53EF\u80FD\u504F\u8FDC\u3002`;
      addWarning(warnings, issues, {
        code: "first_leg_too_long",
        message,
        poiIds: [first.id],
        meta: { minutes: firstLeg }
      });
      debugReasons.push(`first_leg_over_60:${firstLeg}:${first.name}`);
    }
  }
  for (let index = 1; index < steps.length; index += 1) {
    const previous = steps[index - 1].poi;
    const current = steps[index].poi;
    const minutes = estimateTravelMinutesBetweenPois(previous, current);
    if (minutes > 60) {
      const message = `\u300C${previous.name}\u300D\u5230\u300C${current.name}\u300D\u9884\u8BA1\u7EA6 ${minutes} \u5206\u949F\uFF0C\u5355\u6BB5\u4EA4\u901A\u504F\u957F\u3002`;
      addWarning(warnings, issues, {
        code: "segment_too_long",
        message,
        poiIds: [previous.id, current.id],
        meta: { minutes }
      });
      debugReasons.push(`segment_over_60:${minutes}:${previous.id}->${current.id}`);
    }
  }
}
function inferAnchorStep(steps) {
  return steps.find((step) => step.isAnchor) ?? steps.find((step) => step.role === "activity" && !isLowValueChainPoi(step.poi) && isMeaningfulAnchorPoi(step.poi)) ?? steps.find((step) => step.role === "activity" && !isLowValueChainPoi(step.poi)) ?? steps[0];
}
function isMeaningfulAnchorPoi(poi) {
  const category = poi.categoryKey || getCategoryKey(poi);
  const text = buildPoiText2(poi);
  if (["culture", "outdoor", "photo", "entertainment"].includes(category)) return true;
  return /本地|老字号|夜市|美食街|市集|特色街区|古城|古镇|文创|创意园|公园|绿道|栈道|海滨|博物馆|美术馆|艺术馆|图书馆|书店|书吧|文化馆/.test(text);
}
function isFoodOrDrinkLike(poi) {
  return isDrinkLike(poi) || isMealLike(poi);
}
function isDrinkLike(poi) {
  const category = poi.categoryKey || getCategoryKey(poi);
  return category === "drink" || /咖啡|下午茶|甜品|茶饮|奶茶|面包|饮品/i.test(buildPoiText2(poi));
}
function isMealLike(poi) {
  const category = poi.categoryKey || getCategoryKey(poi);
  return category === "meal" || /正餐|小吃|饭|餐|美食|茶餐厅|夜市|美食街|火锅|烧烤/i.test(buildPoiText2(poi));
}
function getExplicitlyRejectedTypes(requirements) {
  const text = [
    requirements.rawText,
    ...requirements.constraints,
    ...requirements.userProfile?.rejectedKeywords ?? [],
    ...requirements.userProfile?.dislikedPoiTypes ?? []
  ].filter(Boolean).join(" ");
  const knownTypes = [
    "\u9910\u996E\u6B63\u9910",
    "\u8F7B\u98DF\u751C\u996E",
    "\u6587\u5316\u4F53\u9A8C",
    "\u6237\u5916\u6563\u6B65",
    "\u62CD\u7167\u5730\u6807",
    "\u4F11\u95F2\u5A31\u4E50",
    "\u5496\u5561",
    "\u5976\u8336",
    "\u751C\u54C1",
    "\u706B\u9505",
    "\u5546\u573A",
    "\u684C\u6E38",
    "\u5BC6\u5BA4",
    "\u516C\u56ED"
  ];
  return knownTypes.filter(
    (type) => new RegExp(`(\u4E0D\u8981|\u4E0D\u60F3\u53BB|\u4E0D\u53BB|\u522B\u53BB|\u907F\u5F00|\u5C11\u63A8\u8350|\u62D2\u7EDD).{0,12}${type}`, "i").test(text)
  );
}
function getTargetStopCount(requirements) {
  const targetMinutes = requirements.durationHours * 60;
  if (targetMinutes <= 150) return 3;
  if (targetMinutes >= 330) return 4;
  return 4;
}
function calculateRouteQualityScore(route, warnings, fatalReasons) {
  let score = 86;
  score -= fatalReasons.length * 24;
  score -= warnings.length * 8;
  if (route.steps.length >= 4) score += 4;
  if (route.steps.length <= 1) score -= 30;
  return Math.max(0, Math.min(100, score));
}
function normalizeTemplateId(template) {
  if (!template) return void 0;
  if (typeof template === "string") return template;
  if (typeof template === "object" && "id" in template) {
    const id = template.id;
    return typeof id === "string" ? id : void 0;
  }
  return void 0;
}
function uniqueMessages(messages) {
  return [...new Set(messages.filter((message) => message.trim().length > 0))];
}
function uniqueIssues(issues) {
  const seen = /* @__PURE__ */ new Set();
  return issues.filter((issue) => {
    const key = [
      issue.severity,
      issue.code,
      issue.message,
      issue.role ?? "",
      issue.poiIds?.join(",") ?? "",
      issue.meta ? JSON.stringify(issue.meta) : ""
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function addFatal(fatalReasons, issues, issue) {
  fatalReasons.push(issue.message);
  issues.push({ ...issue, severity: "fatal" });
}
function addWarning(warnings, issues, issue) {
  warnings.push(issue.message);
  issues.push({ ...issue, severity: "warning" });
}
function buildPoiText2(poi) {
  return [
    poi.name,
    poi.type,
    poi.subType,
    poi.address,
    poi.area,
    poi.businessDistrict,
    poi.routeCluster,
    poi.tags.join(" "),
    poi.limits.join(" "),
    poi.reason,
    poi.amapCategoryPath,
    poi.amapCategoryName
  ].filter(Boolean).join(" ");
}

// ../new-agent-a-module/src/planner/routeTemplates.ts
var ROUTE_TEMPLATES = [
  {
    id: "relaxed_half_day",
    name: "\u8F7B\u677E\u534A\u65E5",
    description: "\u4EE5\u4E00\u4E2A\u8F7B\u91CF\u4E3B\u76EE\u7684\u5730\u5C55\u5F00\uFF0C\u642D\u914D\u5403\u559D\u4F11\u606F\uFF0C\u63A7\u5236\u79FB\u52A8\u6210\u672C\u3002",
    targetRoles: ["anchor", "break", "meal", "ending"],
    idealDurationHours: 4,
    idealStopCount: 4
  },
  {
    id: "photo_afternoon_tea",
    name: "\u62CD\u7167\u4E0B\u5348\u8336",
    description: "\u56F4\u7ED5\u597D\u62CD\u3001\u597D\u901B\u3001\u9002\u5408\u804A\u5929\u7684\u4E3B\u951A\u70B9\uFF0C\u642D\u914D\u8F7B\u98DF\u751C\u996E\u548C\u6536\u5C3E\u70B9\u3002",
    targetRoles: ["anchor", "photo", "break", "ending"],
    idealDurationHours: 4,
    idealStopCount: 4
  },
  {
    id: "low_budget",
    name: "\u4F4E\u9884\u7B97\u5FEB\u4E50",
    description: "\u4F18\u5148\u514D\u8D39\u516C\u5171\u7A7A\u95F4\u3001\u672C\u5730\u5C0F\u5403\u3001\u5E02\u96C6\u8857\u533A\u548C\u4F4E\u6D88\u8D39\u6587\u5316\u4F53\u9A8C\u3002",
    targetRoles: ["anchor", "free_space", "local_food", "ending"],
    idealDurationHours: 4,
    idealStopCount: 4
  },
  {
    id: "rainy_indoor",
    name: "\u5BA4\u5185\u96E8\u5929",
    description: "\u4EE5\u5BA4\u5185\u6587\u5316\u3001\u5C55\u89C8\u3001\u4E66\u5E97\u6216\u5A31\u4E50\u7A7A\u95F4\u4F5C\u4E3A\u6838\u5FC3\uFF0C\u51CF\u5C11\u5929\u6C14\u5F71\u54CD\u3002",
    targetRoles: ["anchor", "indoor_activity", "break", "meal"],
    idealDurationHours: 4,
    idealStopCount: 4
  },
  {
    id: "friends_gathering",
    name: "\u670B\u53CB\u805A\u4F1A",
    description: "\u4EE5\u9002\u5408\u591A\u4EBA\u804A\u5929\u4E92\u52A8\u7684\u6838\u5FC3\u70B9\u5C55\u5F00\uFF0C\u517C\u987E\u5403\u559D\u548C\u8F7B\u6D3B\u52A8\u3002",
    targetRoles: ["anchor", "interactive", "meal", "break"],
    idealDurationHours: 4,
    idealStopCount: 4
  },
  {
    id: "date",
    name: "\u7EA6\u4F1A\u8DEF\u7EBF",
    description: "\u56F4\u7ED5\u6C1B\u56F4\u3001\u62CD\u7167\u3001\u6563\u6B65\u6216\u6587\u5316\u4F53\u9A8C\uFF0C\u51CF\u5C11\u786C\u6838\u6392\u961F\u548C\u5954\u6CE2\u3002",
    targetRoles: ["anchor", "atmosphere", "break", "ending"],
    idealDurationHours: 4,
    idealStopCount: 4
  },
  {
    id: "family",
    name: "\u4EB2\u5B50\u8DEF\u7EBF",
    description: "\u4F18\u5148\u4EB2\u5B50\u53CB\u597D\u3001\u5C11\u8D70\u8DEF\u3001\u81EA\u7136\u6559\u80B2\u6216\u5BA4\u5185\u5B89\u5168\u7A7A\u95F4\u3002",
    targetRoles: ["anchor", "family_activity", "break", "meal"],
    idealDurationHours: 4,
    idealStopCount: 4
  }
];
function selectRouteTemplate(requirements, theme) {
  const text = getSignalText(requirements, theme);
  const scored = ROUTE_TEMPLATES.map((template2) => {
    const signals = matchTemplateSignals(template2.id, text, requirements, theme);
    const score = signals.reduce((sum, signal) => sum + signal.score, 0);
    return { template: template2, score, signals };
  }).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return templatePriority(b.template.id) - templatePriority(a.template.id);
  });
  const best = scored[0];
  const template = best && best.score > 0 ? best : {
    template: ROUTE_TEMPLATES[0],
    score: 0,
    signals: [{ key: "default_relaxed_half_day", reason: "\u6CA1\u6709\u5F3A\u4E3B\u9898\u4FE1\u53F7\uFF0C\u4F7F\u7528\u8F7B\u677E\u534A\u65E5\u6A21\u677F\u3002", score: 1 }]
  };
  return {
    ...template.template,
    matchedSignals: template.signals.map((signal) => signal.key),
    matchedReasons: template.signals.map((signal) => signal.reason)
  };
}
function getTargetStopCount2(requirements, template) {
  const durationMinutes = requirements.durationHours * 60;
  const pace = requirements.userProfile?.preferredRoutePace;
  if (durationMinutes <= 150) return Math.min(3, template.idealStopCount);
  if (pace === "packed" && durationMinutes >= 240) return Math.min(5, template.idealStopCount + 1);
  if (pace === "relaxed") return Math.max(3, template.idealStopCount - 1);
  return template.idealStopCount;
}
function getMinimumStopCount(requirements, template) {
  const durationMinutes = requirements.durationHours * 60;
  if (durationMinutes <= 150) return 2;
  if (template.id === "low_budget") return 3;
  return 3;
}
function matchTemplateSignals(templateId, text, requirements, theme) {
  const signals = [];
  const add = (condition, key, reason, score) => {
    if (condition) signals.push({ key, reason, score });
  };
  if (templateId === "photo_afternoon_tea") {
    add(/拍照|出片|打卡|小众|citywalk/i.test(text), "photo_signal", "\u7528\u6237\u8868\u8FBE\u4E86\u62CD\u7167\u3001\u6253\u5361\u6216\u5C0F\u4F17\u51FA\u7247\u9700\u6C42\u3002", 30);
    add(/下午茶|咖啡|甜品|茶饮|轻食/i.test(text), "afternoon_tea_signal", "\u7528\u6237\u8868\u8FBE\u4E86\u4E0B\u5348\u8336\u3001\u5496\u5561\u6216\u751C\u54C1\u9700\u6C42\u3002", 24);
    add(Boolean(theme && /拍照|吃货|下午茶|小众/.test(theme)), "theme_photo_food", "\u76F2\u76D2\u4E3B\u9898\u504F\u62CD\u7167\u6216\u5403\u8D27\u3002", 22);
  }
  if (templateId === "low_budget") {
    add(requirements.budgetMax <= 150, "low_budget_cap", `\u9884\u7B97\u4E0A\u9650\u4E3A \xA5${requirements.budgetMax}\uFF0C\u9002\u5408\u4F4E\u9884\u7B97\u8DEF\u7EBF\u3002`, 30);
    add(/省钱|低预算|预算友好|便宜|免费|小吃|夜市|市集|美食街/i.test(text), "budget_value_signal", "\u7528\u6237\u63D0\u5230\u7701\u94B1\u3001\u5C0F\u5403\u3001\u5E02\u96C6\u6216\u514D\u8D39\u7A7A\u95F4\u3002", 34);
    add(Boolean(theme && /省钱|低预算|小吃/.test(theme)), "theme_low_budget", "\u76F2\u76D2\u4E3B\u9898\u504F\u4F4E\u9884\u7B97\u3002", 18);
  }
  if (templateId === "rainy_indoor") {
    add(/雨|下雨|雨天|室内|不晒|太热|避暑/i.test(text), "weather_indoor_signal", "\u7528\u6237\u8868\u8FBE\u4E86\u96E8\u5929\u3001\u5BA4\u5185\u6216\u907F\u5F00\u5929\u6C14\u5F71\u54CD\u7684\u9700\u6C42\u3002", 46);
    add(requirements.constraints.some((item) => /室内|雨天/.test(item)), "constraint_indoor", "\u7EA6\u675F\u4E2D\u5305\u542B\u5BA4\u5185\u6216\u96E8\u5929\u4F18\u5148\u3002", 22);
  }
  if (templateId === "friends_gathering") {
    add(requirements.peopleType === "\u670B\u53CB", "people_friends", "\u51FA\u884C\u4EBA\u7FA4\u4E3A\u670B\u53CB\u3002", 20);
    add(/朋友|聚会|聊天|多人|互动|桌游|KTV|密室|剧本杀|棋牌|台球|羽毛球|运动|健身|电竞|DIY|手作|团建|酒吧|露营|采摘|轰趴/.test(text), "friends_gathering_signal", "\u7528\u6237\u8868\u8FBE\u4E86\u670B\u53CB\u805A\u4F1A\u6216\u4E92\u52A8\u9700\u6C42\u3002", 24);
  }
  if (templateId === "date") {
    add(requirements.peopleType === "\u60C5\u4FA3", "people_date", "\u51FA\u884C\u4EBA\u7FA4\u4E3A\u60C5\u4FA3\u3002", 32);
    add(/约会|情侣|氛围|浪漫|夜景/i.test(text), "date_signal", "\u7528\u6237\u8868\u8FBE\u4E86\u7EA6\u4F1A\u3001\u6C1B\u56F4\u6216\u591C\u666F\u9700\u6C42\u3002", 30);
  }
  if (templateId === "family") {
    add(requirements.peopleType === "\u4EB2\u5B50", "people_family", "\u51FA\u884C\u4EBA\u7FA4\u4E3A\u4EB2\u5B50\u3002", 34);
    add(/亲子|小朋友|孩子|儿童|自然教育|少走路/i.test(text), "family_signal", "\u7528\u6237\u8868\u8FBE\u4E86\u4EB2\u5B50\u3001\u513F\u7AE5\u6216\u5C11\u8D70\u8DEF\u9700\u6C42\u3002", 30);
  }
  if (templateId === "relaxed_half_day") {
    add(/轻松|随便逛|休闲|半日|不累|少走路/i.test(text), "relaxed_signal", "\u7528\u6237\u8868\u8FBE\u4E86\u8F7B\u677E\u4F11\u95F2\u9700\u6C42\u3002", 18);
  }
  return signals;
}
function templatePriority(id) {
  const priorities = {
    rainy_indoor: 7,
    photo_afternoon_tea: 6,
    low_budget: 5,
    family: 4,
    date: 3,
    friends_gathering: 2,
    relaxed_half_day: 1
  };
  return priorities[id];
}
function getSignalText(requirements, theme) {
  return [
    requirements.rawText,
    theme,
    requirements.blindBoxTheme,
    requirements.peopleType,
    ...requirements.preferences,
    ...requirements.constraints,
    ...requirements.userProfile?.likedTags ?? [],
    ...requirements.userProfile?.favoriteRouteThemes ?? []
  ].filter(Boolean).join(" ");
}

// ../new-agent-a-module/src/planner/anchorSelector.ts
var STRONG_ANCHOR_PATTERN = /古镇|古城|公园|美术馆|艺术馆|博物馆|书吧|书店|文化街区|特色街区|创意园|文创|市集|夜市|美食街|老街|绿道|海滨|栈道|艺术空间|文化空间/;
var INDOOR_ANCHOR_PATTERN = /美术馆|艺术馆|博物馆|书店|书吧|文化馆|展览|艺术空间|文化空间|剧场|影院|桌游|手作|陶艺|DIY/i;
var LOCAL_FOOD_PATTERN = /本地|老字号|小吃|夜市|美食街|市集|茶餐厅|客家|潮汕|蛇口|盐田|甘坑|大鹏/;
function selectAnchor(candidates, template, requirements) {
  const ranked = candidates.map((poi) => normalizePoiForRecommendation(poi, requirements)).filter((poi) => isEligibleAnchor(poi, requirements)).map((poi) => scoreAnchor(poi, template, requirements)).sort((a, b) => b.score - a.score);
  return ranked[0] ?? null;
}
function isEligibleAnchor(poi, requirements) {
  return isRealNavigablePoi(poi) && isExecutablePoi(poi) && matchesRequestedDistrict(poi, requirements) && !isLowValueChainPoi(poi, requirements) && !isLowValueAnchorPoi(poi);
}
function scoreAnchor(poi, template, requirements) {
  const text = buildPoiText3(poi);
  const category = poi.categoryKey || getCategoryKey(poi);
  const debugReasons = [];
  let score = 50 + Math.min(25, Math.max(0, poi.qualityScore ?? 0) / 4);
  const add = (condition, value, reason) => {
    if (!condition) return;
    score += value;
    debugReasons.push(reason);
  };
  add(STRONG_ANCHOR_PATTERN.test(text), 42, "strong_local_or_culture_anchor");
  add(LOCAL_FOOD_PATTERN.test(text), 12, "local_feature_anchor");
  add(poi.price === 0 || poi.price <= 50, 8, "budget_friendly_anchor");
  add(Boolean(requirements.district && matchesDistrictText3(poi, requirements.district)), 12, "district_matched_anchor");
  add(typeof poi.lat === "number" && typeof poi.lng === "number", 4, "has_coordinates");
  add((poi.meituanRating ?? 0) >= 4.6, 4, "high_rating");
  const experienceSubKey = getExperienceSubKey(poi);
  add(
    experienceSubKey === "museum" || experienceSubKey === "gallery" || experienceSubKey === "park" || experienceSubKey === "scenery" || experienceSubKey === "library",
    14,
    `amap_confirmed_anchor:${experienceSubKey}`
  );
  if (template.id === "photo_afternoon_tea") {
    add(["photo", "culture", "outdoor"].includes(category), 28, "photo_template_core_category");
    add(/拍照|打卡|出片|街区|古镇|艺术|美术馆|公园|书店|书吧/i.test(text), 18, "photo_template_scene");
    add(category === "drink", -16, "drink_is_supporting_not_anchor");
  }
  if (template.id === "low_budget") {
    add(["outdoor", "culture", "photo", "meal"].includes(category), 24, "low_budget_core_category");
    add(/免费|预算友好|公园|绿道|街区|古镇|市集|小吃|美食街|博物馆|美术馆|图书馆|书吧/i.test(text), 22, "low_budget_value_scene");
  }
  if (template.id === "rainy_indoor") {
    add(["culture", "entertainment"].includes(category), 28, "rainy_indoor_core_category");
    add(INDOOR_ANCHOR_PATTERN.test(text) || poi.limits.includes("\u5BA4\u5185") || poi.limits.includes("\u96E8\u5929\u53EF\u53BB"), 22, "rainy_indoor_scene");
    add(poi.weatherSensitive === true, -18, "weather_sensitive_anchor");
  }
  if (template.id === "friends_gathering") {
    add(["entertainment", "culture", "outdoor", "meal"].includes(category), 18, "friends_core_category");
    add(/互动|桌游|市集|夜市|美食街|街区|公园|聊天|聚会|小吃/i.test(text), 18, "friends_gathering_scene");
  }
  if (template.id === "date") {
    add(["photo", "culture", "outdoor"].includes(category), 22, "date_core_category");
    add(/氛围|约会|夜景|艺术|美术馆|书店|书吧|公园|海滨|街区|古镇/i.test(text), 20, "date_scene");
  }
  if (template.id === "family") {
    add(["outdoor", "culture", "entertainment"].includes(category), 22, "family_core_category");
    add(/亲子|儿童|自然教育|公园|博物馆|图书馆|少走路|雨天可去/i.test(text), 20, "family_scene");
  }
  if (template.id === "relaxed_half_day") {
    add(["outdoor", "culture", "photo", "entertainment"].includes(category), 18, "relaxed_core_category");
  }
  const venueKey = poi.venueKey || getVenueKey(poi.name, poi.area || poi.businessDistrict);
  const brandKey = poi.brandKey || getBrandKey(text);
  if (venueKey) debugReasons.push(`venue:${venueKey}`);
  if (brandKey) debugReasons.push(`brand:${brandKey}`);
  debugReasons.push(`category:${category}`);
  return {
    poi,
    score,
    reason: buildAnchorReason(poi, template, debugReasons),
    debugReasons
  };
}
function buildAnchorReason(poi, template, debugReasons) {
  const text = buildPoiText3(poi);
  if (/古镇|古城|文化街区|特色街区/.test(text)) {
    return `\u300C${poi.name}\u300D\u6709\u5B8C\u6574\u8857\u533A\u6E38\u901B\u5185\u5BB9\uFF0C\u9002\u5408\u4F5C\u4E3A\u300C${template.name}\u300D\u7684\u4E3B\u951A\u70B9\u3002`;
  }
  if (/公园|绿道|海滨|栈道/.test(text)) {
    return `\u300C${poi.name}\u300D\u80FD\u63D0\u4F9B\u7A33\u5B9A\u7684\u4F4E\u6210\u672C\u505C\u7559\u548C\u6563\u6B65\u7A7A\u95F4\uFF0C\u9002\u5408\u4F5C\u4E3A\u300C${template.name}\u300D\u6838\u5FC3\u3002`;
  }
  if (/美术馆|艺术馆|博物馆|书店|书吧|文化空间|艺术空间/.test(text)) {
    return `\u300C${poi.name}\u300D\u5177\u5907\u660E\u786E\u6587\u5316\u4F53\u9A8C\u5185\u5BB9\uFF0C\u80FD\u6491\u8D77\u300C${template.name}\u300D\u7684\u6838\u5FC3\u4F53\u9A8C\u3002`;
  }
  if (/市集|夜市|美食街|老街|小吃/.test(text)) {
    return `\u300C${poi.name}\u300D\u6709\u672C\u5730\u70DF\u706B\u6C14\u548C\u53EF\u901B\u6027\uFF0C\u9002\u5408\u4F5C\u4E3A\u300C${template.name}\u300D\u4E3B\u7EBF\u3002`;
  }
  if (debugReasons.includes("rainy_indoor_scene")) {
    return `\u300C${poi.name}\u300D\u66F4\u9002\u5408\u5BA4\u5185\u505C\u7559\uFF0C\u53EF\u4F5C\u4E3A\u300C${template.name}\u300D\u7684\u6838\u5FC3\u70B9\u3002`;
  }
  return `\u300C${poi.name}\u300D\u6BD4\u666E\u901A\u8865\u5145\u70B9\u66F4\u80FD\u627F\u8F7D\u300C${template.name}\u300D\u7684\u6838\u5FC3\u4F53\u9A8C\u3002`;
}
function buildPoiText3(poi) {
  return [
    poi.name,
    poi.type,
    poi.subType,
    poi.address,
    poi.area,
    poi.businessDistrict,
    poi.routeCluster,
    poi.tags.join(" "),
    poi.limits.join(" "),
    poi.reason,
    poi.amapCategoryPath,
    poi.amapCategoryName
  ].filter(Boolean).join(" ");
}
function matchesDistrictText3(poi, district) {
  const normalized = district.replace(/区$/, "");
  return [poi.area, poi.businessDistrict, poi.routeCluster, poi.address].filter(Boolean).some((value) => String(value).includes(normalized));
}
function matchesRequestedDistrict(poi, requirements) {
  if (!requirements.district || requirements.allowCrossDistrict) return true;
  return matchesDistrictText3(poi, requirements.district);
}

// ../new-agent-a-module/src/planner/routeComposer.ts
function composeRouteFromTemplate(input) {
  const { requirements, template, anchor } = input;
  const warnings = [];
  const debugReasons = [`composer_template=${template.id}`, `composer_theme=${input.theme || "none"}`];
  const targetStopCount = getTargetStopCount2(requirements, template);
  const minStopCount = getMinimumStopCount(requirements, template);
  const maxMinutes = getDurationWindow(requirements).max;
  const normalizedCandidates = input.candidates.map((poi) => normalizePoiForRecommendation(poi, requirements)).filter((poi) => isUsablePoi(poi, requirements, warnings, debugReasons));
  const selected = [];
  const normalizedAnchor = anchor?.poi ? normalizePoiForRecommendation(anchor.poi, requirements) : null;
  if (normalizedAnchor && isUsableAnchor(normalizedAnchor, requirements)) {
    addStep(selected, normalizedAnchor, "anchor", anchor?.reason);
    debugReasons.push(`composer_anchor_selected:${normalizedAnchor.id}:${normalizedAnchor.name}`);
  } else if (normalizedAnchor) {
    warnings.push(`\u5019\u9009\u951A\u70B9\u300C${normalizedAnchor.name}\u300D\u8D28\u91CF\u4E0D\u8DB3\uFF0C\u5DF2\u8DF3\u8FC7\u6A21\u677F\u951A\u70B9\u3002`);
    debugReasons.push(`composer_anchor_rejected:${normalizedAnchor.id}:${normalizedAnchor.name}`);
  } else {
    warnings.push("\u6A21\u677F\u7EC4\u88C5\u672A\u627E\u5230\u53EF\u7528\u4E3B\u951A\u70B9\u3002");
    debugReasons.push("composer_missing_anchor");
  }
  const slots = getTemplateSlots(template);
  for (const slot of slots) {
    if (selected.length >= targetStopCount) break;
    if (slot === "anchor" && selected.some((step) => step.templateRole === "anchor")) continue;
    const candidate = pickSlotCandidate(normalizedCandidates, selected, slot, input);
    if (!candidate) {
      debugReasons.push(`composer_slot_missing:${slot}`);
      continue;
    }
    const preview = buildPreview(selected, candidate, slot);
    if (estimateRouteMinutes(preview) > maxMinutes && selected.length >= minStopCount) {
      warnings.push(`\u5DF2\u8DF3\u8FC7\u300C${candidate.name}\u300D\uFF1A\u4F5C\u4E3A\u7B2C ${selected.length + 1} \u4E2A\u70B9\u4F1A\u8BA9\u8DEF\u7EBF\u8D85\u8FC7\u65F6\u957F\u4E0A\u9650\u3002`);
      debugReasons.push(`composer_skip_over_duration:${slot}:${candidate.id}`);
      continue;
    }
    addStep(selected, candidate, slot, buildRoleReason(candidate, slot, template));
  }
  fillSupportStops(selected, normalizedCandidates, input, targetStopCount, maxMinutes, debugReasons);
  if (selected.length < targetStopCount) {
    warnings.push(`\u6A21\u677F\u76EE\u6807\u4E3A ${targetStopCount} \u4E2A\u70B9\uFF0C\u4F46\u53EA\u627E\u5230 ${selected.length} \u4E2A\u9AD8\u8D28\u91CF\u53EF\u8854\u63A5\u8282\u70B9\uFF1B\u4E0D\u4E3A\u51D1\u6570\u52A0\u5165\u4F4E\u8D28\u91CF\u5730\u70B9\u3002`);
    debugReasons.push(`composer_under_target:${selected.length}<${targetStopCount}`);
  }
  if (selected.length < minStopCount) {
    warnings.push(`\u6A21\u677F\u7EC4\u88C5\u4F4E\u4E8E\u6700\u4F4E ${minStopCount} \u4E2A\u70B9\uFF0C\u5C06\u56DE\u9000\u5230\u65E7\u8DEF\u7EBF\u751F\u6210\u903B\u8F91\u3002`);
    debugReasons.push(`composer_below_minimum:${selected.length}<${minStopCount}`);
  }
  return {
    steps: selected.map((step, index) => ({ ...step, order: index + 1 })),
    template,
    anchor,
    warnings: uniqueMessages2(warnings),
    debugReasons: uniqueMessages2(debugReasons)
  };
}
function getTemplateSlots(template) {
  const byTemplate = {
    relaxed_half_day: ["anchor", "support", "break", "meal", "ending"],
    photo_afternoon_tea: ["anchor", "break", "support", "ending", "meal"],
    low_budget: ["anchor", "local_food", "free_space", "support", "ending"],
    rainy_indoor: ["anchor", "indoor_activity", "break", "meal", "support"],
    friends_gathering: ["anchor", "interactive", "meal", "break", "ending"],
    date: ["anchor", "atmosphere", "break", "ending", "meal"],
    family: ["anchor", "family_activity", "break", "meal", "ending"]
  };
  return byTemplate[template.id] ?? template.targetRoles;
}
function pickSlotCandidate(candidates, selected, slot, input) {
  const usableCandidates = candidates.filter((candidate) => canUseCandidate(candidate, selected, slot, input));
  const pool = slot === "break" && prefersQuietBookishBreak(input.requirements) && usableCandidates.some(isBookishBreak) ? usableCandidates.filter(isBookishBreak) : usableCandidates;
  const preferredRoles = new Set(input.preferredRoles ?? []);
  return pool.map((candidate) => ({
    candidate,
    score: scoreCandidateForSlot(candidate, selected, slot, input) + (preferredRoles.has(slot) ? 28 : 0)
  })).sort((a, b) => b.score - a.score)[0]?.candidate;
}
function fillSupportStops(selected, candidates, input, targetStopCount, maxMinutes, debugReasons) {
  const roles = buildFillRolePriority(input.preferredRoles);
  for (const role of roles) {
    if (selected.length >= targetStopCount) return;
    const candidate = pickSlotCandidate(candidates, selected, role, input);
    if (!candidate) continue;
    const preview = buildPreview(selected, candidate, role);
    if (estimateRouteMinutes(preview) > maxMinutes) {
      debugReasons.push(`composer_fill_skip_over_duration:${role}:${candidate.id}`);
      continue;
    }
    addStep(selected, candidate, role, buildRoleReason(candidate, role, input.template));
  }
}
function buildFillRolePriority(preferredRoles) {
  const fillableRoles = [
    "support",
    "ending",
    "break",
    "meal",
    "local_food",
    "free_space",
    "indoor_activity",
    "interactive",
    "atmosphere",
    "family_activity"
  ];
  return [.../* @__PURE__ */ new Set([...(preferredRoles ?? []).filter((role) => fillableRoles.includes(role)), ...fillableRoles])];
}
function canUseCandidate(candidate, selected, slot, input) {
  const { requirements, template } = input;
  if (selected.some((step) => step.poi.id === candidate.id)) return false;
  if (input.excludedPoiIds?.includes(candidate.id)) return false;
  const candidateVenueKey = candidate.venueKey || getVenueKey(candidate.name, candidate.area || candidate.businessDistrict);
  if (candidateVenueKey.length >= 3 && normalizeKeyList(input.excludedVenueKeys).includes(candidateVenueKey.toLowerCase())) return false;
  const candidateBrandKey = candidate.brandKey || getBrandKey(buildPoiText4(candidate));
  if (candidateBrandKey && normalizeKeyList(input.excludedBrandKeys).includes(candidateBrandKey.toLowerCase())) return false;
  if (hasDuplicateVenue(selected, candidate)) return false;
  if (hasDuplicateLowValueBrand(selected, candidate)) return false;
  if (wouldRepeatCategoryConsecutively(selected, candidate) && !(slot === "break" && isBookishBreak(candidate))) return false;
  if (exceedsTemplateCategoryLimit(selected, candidate, slot, template)) return false;
  const category = candidate.categoryKey || getCategoryKey(candidate);
  if (input.forbiddenCategories?.includes(category)) return false;
  if (!isRealNavigablePoi(candidate)) return false;
  if (!isExecutablePoi(candidate)) return false;
  if (!matchesRequestedDistrict2(candidate, requirements)) return false;
  if (!isRoleCompatibleForSlot(candidate, slot)) return false;
  if (isCoreSlot(slot) && isLowValueAnchorPoi(candidate)) return false;
  if (isCoreSlot(slot) && isLowValueChainPoi(candidate, requirements)) return false;
  if (isRejectedPoi(candidate, requirements)) return false;
  if (!canConnectToSelected(selected, candidate, requirements)) return false;
  return true;
}
function isUsablePoi(poi, requirements, warnings, debugReasons) {
  if (!isRealNavigablePoi(poi) || !isExecutablePoi(poi)) {
    debugReasons.push(`composer_filter_not_real:${poi.id}:${poi.name}`);
    return false;
  }
  if (!matchesRequestedDistrict2(poi, requirements)) {
    debugReasons.push(`composer_filter_district_mismatch:${poi.id}:${poi.name}`);
    return false;
  }
  if (isRejectedPoi(poi, requirements)) {
    warnings.push(`\u5DF2\u8FC7\u6EE4\u7528\u6237\u660E\u786E\u6392\u65A5\u7684\u5730\u70B9\uFF1A\u300C${poi.name}\u300D\u3002`);
    debugReasons.push(`composer_filter_rejected:${poi.id}:${poi.name}`);
    return false;
  }
  return true;
}
function isUsableAnchor(poi, requirements) {
  return isRealNavigablePoi(poi) && isExecutablePoi(poi) && matchesRequestedDistrict2(poi, requirements) && !isLowValueAnchorPoi(poi) && !isLowValueChainPoi(poi, requirements) && !isRejectedPoi(poi, requirements);
}
function scoreCandidateForSlot(candidate, selected, slot, input) {
  const text = buildPoiText4(candidate);
  const category = candidate.categoryKey || getCategoryKey(candidate);
  let score = 45 + (candidate.priorityScore ?? 0) * 0.25 + (candidate.qualityScore ?? 0) * 0.25;
  if (candidate.meituanRating) score += candidate.meituanRating * 2;
  if (candidate.price === 0 || candidate.price <= 50) score += input.requirements.budgetMax <= 150 ? 12 : 4;
  if (input.requirements.district && matchesDistrictText4(candidate, input.requirements.district)) score += 10;
  if (candidate.blindBoxThemes?.includes(input.theme)) score += 8;
  score += scoreSlotFit(slot, category, text, candidate, input.template);
  if (slot === "break" && isBookishBreak(candidate) && prefersQuietBookishBreak(input.requirements)) score += 24;
  score -= selected.length > 0 ? Math.min(24, estimateTravelMinutesBetweenPois(selected.at(-1).poi, candidate) * 0.35) : 0;
  if (selected.length === 0) score -= Math.min(20, estimateTravelMinutesFromCurrentLocation(candidate, input.requirements.currentLocation) * 0.25);
  if (isLowValueChainPoi(candidate, input.requirements)) score -= isCoreSlot(slot) ? 80 : 20;
  if (isLowValueAnchorPoi(candidate) && isCoreSlot(slot)) score -= 100;
  return score;
}
function scoreSlotFit(slot, category, text, candidate, template) {
  const subKey = getExperienceSubKey(candidate);
  if (slot === "anchor") return ["culture", "outdoor", "photo", "entertainment"].includes(category) ? 35 : -20;
  if (slot === "break") {
    if (category === "drink" || /咖啡|下午茶|甜品|茶饮|面包|休息/i.test(text)) {
      if (subKey === "coffee") return 46;
      if (subKey === "tea") return 44;
      if (subKey === "bakery") return 42;
      if (subKey === "dessert") return 40;
      return 42;
    }
    if (isBookishBreak(candidate)) return 46;
    return -10;
  }
  if (slot === "meal") {
    if (subKey === "meal") return 44;
    if (category === "local_food") return 38;
    if (subKey === "fast_food") return 30;
    if (subKey === "casual_eat") return 26;
    return category === "meal" || /正餐|小吃|饭|餐|美食|茶餐厅|夜市|美食街/i.test(text) ? 40 : -14;
  }
  if (slot === "local_food") return /本地|老字号|小吃|夜市|市集|美食街|茶餐厅|客家|潮汕/i.test(text) ? 45 : category === "meal" ? 18 : -16;
  if (slot === "free_space") return candidate.price === 0 || /免费|公园|绿道|街区|古镇|图书馆|博物馆|美术馆|文化馆/i.test(text) ? 42 : -18;
  if (slot === "indoor_activity") return candidate.limits.includes("\u5BA4\u5185") || candidate.limits.includes("\u96E8\u5929\u53EF\u53BB") || /室内|书店|书吧|美术馆|博物馆|展览|桌游|手作|密室|剧本杀|影院|DIY|棋牌|台球|健身|电竞|网吧|儿童乐园|游泳馆/i.test(text) ? 42 : -22;
  if (slot === "interactive") return category === "entertainment" || /互动|桌游|KTV|密室|剧本杀|棋牌|台球|运动|健身|电竞|DIY|手作|团建|酒吧|露营|采摘|轰趴|市集|夜市|聚会|聊天|体验|足浴|按摩|洗浴|汗蒸|网吧|私人影院|游泳|羽毛球|儿童乐园/i.test(text) ? 38 : -8;
  if (slot === "atmosphere") return /氛围|夜景|约会|艺术|书店|书吧|公园|海滨|街区|古镇|拍照|酒吧|私人影院|展览|茶馆|手工|DIY/i.test(text) ? 38 : -8;
  if (slot === "family_activity") return /亲子|儿童|自然教育|公园|博物馆|图书馆|少走路|雨天可去/i.test(text) ? 40 : -10;
  if (slot === "ending") return ["outdoor", "photo", "culture", "entertainment"].includes(category) || /散步|公园|绿道|海滨|街区|书店|书吧|美术馆|艺术馆|夜景/i.test(text) ? 32 : -4;
  if (slot === "support") {
    if (template.id === "low_budget" && /本地|市集|小吃|免费|公园|文化|街区|古镇/i.test(text)) return 34;
    if (["photo_afternoon_tea", "date"].includes(template.id)) {
      if (["culture", "photo"].includes(category)) return 82;
      if (category === "entertainment") return 26;
      if (category === "meal") return -18;
      if (category === "outdoor") return 4;
    }
    if (["culture", "outdoor", "photo"].includes(category)) return 30;
    if (category === "entertainment") return 24;
    if (category === "meal") return 12;
    if (category === "local_food") return 16;
    return 0;
  }
  return 0;
}
function isRoleCompatibleForSlot(candidate, slot) {
  const category = candidate.categoryKey || getCategoryKey(candidate);
  const text = buildPoiText4(candidate);
  if (slot === "anchor") return ["culture", "outdoor", "photo", "entertainment"].includes(category);
  if (slot === "break") return category === "drink" || /咖啡|下午茶|甜品|茶饮|面包|休息/i.test(text) || isBookishBreak(candidate);
  if (slot === "meal" || slot === "local_food") return ["meal", "local_food"].includes(category) || /正餐|小吃|饭|餐|美食|茶餐厅|夜市|美食街/i.test(text);
  if (slot === "free_space") return ["local_food"].includes(category) || candidate.price === 0 || /免费|公园|绿道|街区|古镇|图书馆|博物馆|美术馆|文化馆/i.test(text);
  if (slot === "indoor_activity") return ["culture", "entertainment"].includes(category) && (candidate.limits.includes("\u5BA4\u5185") || candidate.limits.includes("\u96E8\u5929\u53EF\u53BB") || /室内|书店|书吧|美术馆|博物馆|展览|桌游|手作|密室|剧本杀|影院|DIY|棋牌|台球|健身|电竞|网吧|儿童乐园|游泳馆/i.test(text));
  if (slot === "interactive") return category === "entertainment" || /互动|桌游|KTV|密室|剧本杀|棋牌|台球|运动|健身|电竞|DIY|手作|团建|酒吧|露营|采摘|轰趴|市集|夜市|聚会|聊天|体验|足浴|按摩|洗浴|汗蒸|网吧|私人影院|游泳|羽毛球|儿童乐园/i.test(text);
  if (slot === "atmosphere") return ["culture", "outdoor", "photo", "drink"].includes(category) || /氛围|夜景|约会|艺术|书店|书吧|公园|海滨|街区|古镇|拍照|酒吧|私人影院|展览|茶馆|手工|DIY/i.test(text);
  if (slot === "family_activity") return ["culture", "outdoor", "entertainment"].includes(category) && /亲子|儿童|自然教育|公园|博物馆|图书馆|少走路|雨天可去/i.test(text);
  if (slot === "ending") return ["outdoor", "photo", "culture", "entertainment"].includes(category) || /散步|公园|绿道|海滨|街区|书店|书吧|美术馆|艺术馆/i.test(text);
  if (slot === "support") return ["culture", "outdoor", "photo", "entertainment", "meal", "local_food"].includes(category);
  return true;
}
function addStep(selected, poi, templateRole, roleReason) {
  selected.push({
    order: selected.length + 1,
    role: inferRouteRole(poi, templateRole),
    poi,
    note: poi.reason,
    templateRole,
    isAnchor: templateRole === "anchor",
    roleReason
  });
}
function buildPreview(selected, candidate, slot) {
  return [
    ...selected,
    {
      order: selected.length + 1,
      role: inferRouteRole(candidate, slot),
      poi: candidate,
      note: candidate.reason,
      templateRole: slot
    }
  ];
}
function inferRouteRole(poi, templateRole) {
  if (templateRole === "meal" || templateRole === "local_food" || poi.type === "\u9910\u996E\u6B63\u9910") return "meal";
  if (templateRole === "break" || poi.type === "\u8F7B\u98DF\u751C\u996E") return "break";
  if (templateRole === "ending") return "ending";
  return "activity";
}
function buildRoleReason(poi, slot, template) {
  const roleName = roleLabel(slot);
  return `\u300C${poi.name}\u300D\u5339\u914D\u300C${template.name}\u300D\u4E2D\u7684${roleName}\u8282\u70B9\u3002`;
}
function roleLabel(slot) {
  const labels = {
    anchor: "\u4E3B\u951A\u70B9",
    break: "\u4F11\u606F/\u4E0B\u5348\u8336",
    meal: "\u6B63\u9910",
    support: "\u8865\u5145\u4F53\u9A8C",
    ending: "\u8F7B\u677E\u6536\u5C3E",
    local_food: "\u672C\u5730\u5403\u98DF",
    free_space: "\u514D\u8D39/\u4F4E\u4EF7\u7A7A\u95F4",
    indoor_activity: "\u5BA4\u5185\u6D3B\u52A8",
    interactive: "\u670B\u53CB\u4E92\u52A8",
    atmosphere: "\u6C1B\u56F4\u4F53\u9A8C",
    family_activity: "\u4EB2\u5B50\u6D3B\u52A8"
  };
  return labels[slot] ?? slot;
}
function isCoreSlot(slot) {
  return slot === "anchor" || slot === "support" || slot === "indoor_activity" || slot === "interactive" || slot === "atmosphere" || slot === "family_activity";
}
function hasDuplicateVenue(selected, candidate) {
  const candidateKey = candidate.venueKey || getVenueKey(candidate.name, candidate.area || candidate.businessDistrict);
  if (candidateKey.length < 3) return false;
  if (selected.some((step) => {
    const key = step.poi.venueKey || getVenueKey(step.poi.name, step.poi.area || step.poi.businessDistrict);
    return key.length >= 3 && candidateKey === key;
  })) return true;
  const candidateVenue = getVenueComplexKey(candidate.name);
  if (candidateVenue) {
    return selected.some((step) => getVenueComplexKey(step.poi.name) === candidateVenue);
  }
  return false;
}
function hasDuplicateLowValueBrand(selected, candidate) {
  const brand = getBrandKey(buildPoiText4(candidate));
  if (!brand) return false;
  return selected.some((step) => getBrandKey(buildPoiText4(step.poi))?.toLowerCase() === brand.toLowerCase());
}
function wouldRepeatCategoryConsecutively(selected, candidate) {
  const previous = selected.at(-1)?.poi;
  if (!previous) return false;
  return (previous.categoryKey || getCategoryKey(previous)) === (candidate.categoryKey || getCategoryKey(candidate));
}
function exceedsTemplateCategoryLimit(selected, candidate, slot, template) {
  const category = candidate.categoryKey || getCategoryKey(candidate);
  const existingCategoryCount = selected.filter((step) => (step.poi.categoryKey || getCategoryKey(step.poi)) === category).length;
  const existingBreakCount = selected.filter((step) => step.templateRole === "break").length;
  if (slot === "break" && existingBreakCount >= 1) return true;
  if (["photo_afternoon_tea", "date"].includes(template.id) && isDrinkLike2(candidate) && selected.some((step) => isDrinkLike2(step.poi))) return true;
  if (["photo_afternoon_tea", "date"].includes(template.id) && isFoodOrDrinkLike2(candidate)) {
    const existingFoodDrinkCount = selected.filter((step) => isFoodOrDrinkLike2(step.poi)).length;
    if (existingFoodDrinkCount >= 2) return true;
  }
  if (template.id === "photo_afternoon_tea" && (slot === "ending" || slot === "support") && category === "meal" && existingCategoryCount >= 1) return true;
  return false;
}
function isFoodOrDrinkLike2(poi) {
  return isDrinkLike2(poi) || isMealLike2(poi);
}
function isDrinkLike2(poi) {
  const category = poi.categoryKey || getCategoryKey(poi);
  return category === "drink" || /咖啡|下午茶|甜品|茶饮|奶茶|面包|饮品/i.test(buildPoiText4(poi));
}
function isMealLike2(poi) {
  const category = poi.categoryKey || getCategoryKey(poi);
  return category === "meal" || /正餐|小吃|饭|餐|美食|茶餐厅|夜市|美食街|火锅|烧烤/i.test(buildPoiText4(poi));
}
function isBookishBreak(poi) {
  return /书店|书吧|书房|图书|阅读/i.test(buildPoiText4(poi));
}
function prefersQuietBookishBreak(requirements) {
  return /书店|书吧|书房|图书|阅读|安静|轻松|聊天/i.test([
    requirements.rawText,
    ...requirements.preferences,
    ...requirements.constraints
  ].filter(Boolean).join(" "));
}
function canConnectToSelected(selected, candidate, requirements) {
  if (selected.length === 0) {
    const firstLeg = estimateTravelMinutesFromCurrentLocation(candidate, requirements.currentLocation);
    return firstLeg === 0 || firstLeg <= 60;
  }
  const previous = selected.at(-1)?.poi;
  return !previous || estimateTravelMinutesBetweenPois(previous, candidate) <= 60;
}
function matchesRequestedDistrict2(poi, requirements) {
  if (!requirements.district || requirements.allowCrossDistrict) return true;
  return matchesDistrictText4(poi, requirements.district);
}
function isRejectedPoi(poi, requirements) {
  const text = buildPoiText4(poi);
  const brand = getBrandKey(text);
  if (brand && isExplicitlyRejectedBrand(brand, requirements)) return true;
  return getExplicitlyRejectedTypes2(requirements).some(
    (type) => poi.type.includes(type) || poi.subType.includes(type) || (poi.categoryKey || getCategoryKey(poi)).includes(type) || text.includes(type)
  );
}
function normalizeKeyList(values) {
  return (values ?? []).map((value) => value.toLowerCase());
}
function getExplicitlyRejectedTypes2(requirements) {
  const text = [
    requirements.rawText,
    ...requirements.constraints,
    ...requirements.userProfile?.rejectedKeywords ?? [],
    ...requirements.userProfile?.dislikedPoiTypes ?? []
  ].filter(Boolean).join(" ");
  const knownTypes = ["\u9910\u996E\u6B63\u9910", "\u8F7B\u98DF\u751C\u996E", "\u6587\u5316\u4F53\u9A8C", "\u6237\u5916\u6563\u6B65", "\u62CD\u7167\u5730\u6807", "\u4F11\u95F2\u5A31\u4E50", "\u5496\u5561", "\u5976\u8336", "\u751C\u54C1", "\u706B\u9505", "\u5546\u573A", "\u684C\u6E38", "\u5BC6\u5BA4", "\u516C\u56ED"];
  return knownTypes.filter(
    (type) => new RegExp(`(\u4E0D\u8981|\u4E0D\u60F3\u53BB|\u4E0D\u53BB|\u522B\u53BB|\u907F\u5F00|\u5C11\u63A8\u8350|\u62D2\u7EDD).{0,12}${type}`, "i").test(text)
  );
}
function buildPoiText4(poi) {
  return [
    poi.name,
    poi.type,
    poi.subType,
    poi.address,
    poi.area,
    poi.businessDistrict,
    poi.routeCluster,
    poi.tags.join(" "),
    poi.limits.join(" "),
    poi.reason,
    poi.amapCategoryPath,
    poi.amapCategoryName
  ].filter(Boolean).join(" ");
}
function matchesDistrictText4(poi, district) {
  const normalized = district.replace(/区$/, "");
  return [poi.area, poi.businessDistrict, poi.routeCluster, poi.address].filter(Boolean).some((value) => String(value).includes(normalized));
}
function uniqueMessages2(messages) {
  return [...new Set(messages.filter((message) => message.trim().length > 0))];
}

// ../new-agent-a-module/src/planner/simpleRoutePlanner.ts
function buildRoute(requirements, pois2, theme) {
  const normalizedPois = pois2.map((poi) => normalizePoiForRecommendation(poi, requirements));
  const routeTemplate = selectRouteTemplate(requirements, theme);
  const filteredCandidates = filterPois(requirements, normalizedPois, theme);
  const districtCandidates = requirements.district ? filteredCandidates.filter((poi) => matchesDistrict(poi, requirements.district)) : [];
  const viableCandidates = ensureViableCandidates(requirements, normalizedPois, filteredCandidates, theme);
  const allCandidates = selectGeographicCandidates(viableCandidates, districtCandidates, requirements);
  const explicitActivityTypes = getExplicitActivityTypes(requirements);
  const routeCluster = selectRouteCluster(allCandidates, requirements, theme, explicitActivityTypes);
  const clusteredCandidates = routeCluster ? selectClusterAndNearbyCandidates(allCandidates, routeCluster) : allCandidates;
  const candidatesBeforeHardFilters = clusteredCandidates.length >= 2 ? clusteredCandidates : allCandidates;
  const candidates = applyHardRouteCandidateFilters(candidatesBeforeHardFilters, requirements);
  const anchorSelection = selectAnchor(candidates, routeTemplate, requirements);
  const minStepCount = getMinimumStopCount(requirements, routeTemplate);
  const targetStepCount = getTargetStopCount2(requirements, routeTemplate);
  const composedAttempt = buildComposedRouteWithQualityRetries(
    candidates,
    requirements,
    theme,
    routeTemplate,
    anchorSelection,
    explicitActivityTypes
  );
  if (composedAttempt && composedAttempt.route.steps.length >= Math.min(targetStepCount, minStepCount + 1) && composedAttempt.fatalCount === 0 && !hasTooManySameCategoryIssue(composedAttempt.issues)) {
    return composedAttempt.route;
  }
  const steps = [];
  const durationWindow = getDurationWindow(requirements);
  const maxMinutes = durationWindow.max;
  const routePattern = buildRoutePattern(requirements, theme, explicitActivityTypes);
  addStepIfFits(steps, anchorSelection?.poi, maxMinutes, requirements);
  const firstActivity = pickFirst(
    candidates,
    routePattern.activity,
    steps
  );
  addStepIfFits(steps, firstActivity, maxMinutes, requirements);
  const breakStop = pickFirst(candidates, routePattern.breakStop, steps);
  addStepIfFits(steps, breakStop, maxMinutes, requirements);
  const meal = routePattern.includeMeal ? pickFirst(candidates, ["\u9910\u996E\u6B63\u9910"], steps) : void 0;
  addStepIfFits(steps, meal, maxMinutes, requirements);
  const ending = pickFirst(candidates, routePattern.ending, steps);
  addStepIfFits(steps, ending, maxMinutes, requirements);
  for (const candidate of candidates) {
    if (steps.length >= 5) break;
    if (usedIds(steps).includes(candidate.id)) continue;
    if (hasSimilarExperience(steps.map((step) => step.poi), candidate)) continue;
    addStepIfFits(steps, candidate, maxMinutes, requirements);
  }
  const selected = steps.length >= minStepCount ? steps.map((step) => step.poi) : selectBestFallbackCandidates(candidates, minStepCount, durationWindow, requirements);
  for (const candidate of candidates) {
    if (selected.length >= minStepCount) break;
    if (selected.some((poi) => poi.id === candidate.id)) continue;
    if (hasSimilarExperience(selected, candidate)) continue;
    if (!canConnectPois(selected, candidate, requirements)) continue;
    selected.push(candidate);
  }
  for (const candidate of candidates) {
    if (selected.length >= 5) break;
    if (selected.some((poi) => poi.id === candidate.id)) continue;
    if (hasSimilarExperience(selected, candidate)) continue;
    if (!canConnectPois(selected, candidate, requirements)) continue;
    const previewSteps = selected.map((poi, index) => ({
      order: index + 1,
      role: inferRole(poi, index),
      poi,
      note: poi.reason
    }));
    previewSteps.push({
      order: previewSteps.length + 1,
      role: inferRole(candidate, previewSteps.length),
      poi: candidate,
      note: candidate.reason
    });
    if (estimateRouteMinutes(previewSteps) <= maxMinutes) selected.push(candidate);
    if (selected.length >= targetStepCount && estimateRouteMinutes(previewSteps) >= durationWindow.min) break;
  }
  fillRouteIfTooShort(selected, candidates, minStepCount, requirements);
  fillRouteTowardTarget(selected, candidates, targetStepCount, durationWindow.max, requirements);
  const finalSelected = improveRouteDiversity(selected, candidates, minStepCount, requirements);
  steps.length = 0;
  finalSelected.forEach((poi, index) => {
    steps.push({
      order: index + 1,
      role: inferRole(poi, index),
      poi,
      note: poi.reason
    });
  });
  const route = decorateRouteTemplateAndAnchor(
    summarizeRoute(stretchStepsToDuration(steps, requirements), explicitActivityTypes, requirements),
    routeTemplate,
    anchorSelection
  );
  const quality = evaluateRouteQuality(route, requirements, routeTemplate);
  const mergedWarnings = mergeMessages(quality.warnings);
  const mergedDebugReasons = mergeMessages([
    ...composedAttempt?.route.debugReasons ?? [],
    "composer_fallback_to_legacy",
    ...quality.debugReasons
  ]);
  const recommendationReasons = buildRouteRecommendationReasons(route, requirements, {
    template: routeTemplate,
    anchorSelection,
    qualityIssues: quality.issues,
    warnings: mergedWarnings,
    debugReasons: mergedDebugReasons,
    usedFallback: true
  });
  return {
    ...route,
    recommendationReasons,
    qualityScore: quality.score,
    warnings: mergedWarnings,
    debugReasons: mergedDebugReasons,
    qualityIssues: quality.issues
  };
}
function buildComposedRouteWithQualityRetries(candidates, requirements, theme, template, initialAnchor, explicitActivityTypes) {
  const attempts = [];
  let repairPlan = emptyRepairPlan();
  let anchorSelection = initialAnchor;
  for (let attemptIndex = 0; attemptIndex <= 2; attemptIndex += 1) {
    const filteredCandidates = applyRepairPlanToCandidates(candidates, repairPlan);
    if (filteredCandidates.length === 0) break;
    if (repairPlan.forceReselectAnchor) {
      anchorSelection = selectAnchor(filteredCandidates, template, requirements);
    }
    const draft = composeRouteFromTemplate({
      candidates: filteredCandidates,
      requirements,
      theme,
      template,
      anchor: anchorSelection,
      excludedPoiIds: repairPlan.excludedPoiIds,
      excludedVenueKeys: repairPlan.excludedVenueKeys,
      excludedBrandKeys: repairPlan.excludedBrandKeys,
      forbiddenCategories: repairPlan.forbiddenCategories,
      preferredRoles: repairPlan.preferredRoles
    });
    const enhancedDraft = {
      ...draft,
      debugReasons: mergeMessages([
        ...draft.debugReasons,
        `quality_retry_attempt:${attemptIndex}`,
        ...repairPlan.debugReasons
      ])
    };
    const evaluated = finalizeRouteDraft(enhancedDraft, explicitActivityTypes, requirements);
    attempts.push(evaluated);
    if (!shouldRetryForQualityIssues(evaluated.issues, attemptIndex)) {
      break;
    }
    const nextPlan = deriveRepairPlanFromIssues(evaluated.issues, evaluated.route);
    if (!hasRepairActions(nextPlan)) {
      break;
    }
    repairPlan = mergeRepairPlans(repairPlan, nextPlan);
  }
  if (attempts.length === 0) return null;
  return selectBestRouteAttempt(attempts);
}
function finalizeRouteDraft(draft, explicitActivityTypes, requirements) {
  const preferredFirstTypes = [
    draft.anchor?.poi.type,
    ...explicitActivityTypes
  ].filter((type) => Boolean(type));
  const route = decorateRouteTemplateAndAnchor(
    summarizeRoute(stretchStepsToDuration(draft.steps, requirements), preferredFirstTypes, requirements),
    draft.template,
    draft.anchor
  );
  const quality = evaluateRouteQuality(route, requirements, draft.template);
  const mergedWarnings = mergeMessages([...draft.warnings, ...quality.warnings]);
  const mergedDebugReasons = mergeMessages([...draft.debugReasons, ...quality.debugReasons]);
  const recommendationReasons = buildRouteRecommendationReasons(route, requirements, {
    template: draft.template,
    anchorSelection: draft.anchor,
    draft,
    qualityIssues: quality.issues,
    warnings: mergedWarnings,
    debugReasons: mergedDebugReasons
  });
  return {
    route: {
      ...route,
      recommendationReasons,
      qualityScore: quality.score,
      warnings: mergedWarnings,
      debugReasons: mergedDebugReasons,
      qualityIssues: quality.issues
    },
    draft,
    issues: quality.issues,
    fatalCount: quality.fatalReasons.length,
    warningCount: mergedWarnings.length,
    qualityScore: quality.score
  };
}
function shouldRetryForQualityIssues(issues, attemptIndex) {
  if (attemptIndex >= 2) return false;
  const repairableIssueCodes = /* @__PURE__ */ new Set([
    "duplicate_venue",
    "duplicate_brand",
    "not_executable_poi",
    "not_real_navigable_poi",
    "rejected_brand",
    "rejected_type",
    "missing_anchor",
    "low_value_anchor",
    "missing_template_role",
    "template_role_mismatch",
    "too_many_food_drink",
    "too_many_drink",
    "too_many_same_category",
    "low_budget_missing_local_value",
    "cross_district_without_permission"
  ]);
  return issues.some((issue) => repairableIssueCodes.has(issue.code));
}
function deriveRepairPlanFromIssues(issues, route) {
  const plan = emptyRepairPlan();
  const anchorPoiId = route.steps.find((step) => step.isAnchor)?.poi.id;
  for (const issue of issues) {
    if (["not_executable_poi", "not_real_navigable_poi", "rejected_brand", "rejected_type", "template_role_mismatch"].includes(issue.code)) {
      plan.excludedPoiIds.push(...issue.poiIds ?? []);
      plan.debugReasons.push(`quality_repair_applied:${issue.code}`);
    }
    if (issue.code === "cross_district_without_permission") {
      plan.excludedPoiIds.push(...issue.poiIds ?? []);
      plan.preferredRoles.push("support", "ending");
      plan.debugReasons.push("quality_repair_applied:cross_district_without_permission");
    }
    if (issue.code === "duplicate_venue") {
      plan.excludedPoiIds.push(...(issue.poiIds ?? []).slice(1));
      const venueKey = typeof issue.meta?.venueKey === "string" ? issue.meta.venueKey : void 0;
      if (venueKey) plan.excludedVenueKeys.push(venueKey.toLowerCase());
      plan.debugReasons.push("quality_repair_applied:duplicate_venue");
    }
    if (issue.code === "duplicate_brand") {
      plan.excludedPoiIds.push(...(issue.poiIds ?? []).slice(1));
      const brandKey = typeof issue.meta?.brandKey === "string" ? issue.meta.brandKey : void 0;
      if (brandKey) plan.excludedBrandKeys.push(brandKey.toLowerCase());
      plan.debugReasons.push("quality_repair_applied:duplicate_brand");
    }
    if (issue.code === "low_value_anchor" || issue.code === "missing_anchor") {
      plan.forceReselectAnchor = true;
      if (anchorPoiId) plan.excludedPoiIds.push(anchorPoiId);
      plan.excludedPoiIds.push(...issue.poiIds ?? []);
      plan.debugReasons.push(`quality_repair_applied:${issue.code}`);
    }
    if (issue.code === "missing_template_role" && issue.role) {
      plan.preferredRoles.push(issue.role);
      if (issue.role === "break") {
        plan.preferredRoles.push("support");
      }
      if (issue.role === "support") {
        plan.preferredRoles.push("ending");
      }
      plan.debugReasons.push(`quality_repair_applied:prefer_role:${issue.role}`);
    }
    if (issue.code === "too_many_drink") {
      plan.forbiddenCategories.push("drink");
      plan.preferredRoles.push("support", "ending");
      plan.debugReasons.push("quality_repair_applied:too_many_drink");
    }
    if (issue.code === "too_many_food_drink") {
      plan.forbiddenCategories.push("drink");
      plan.preferredRoles.push("support", "ending");
      plan.debugReasons.push("quality_repair_applied:too_many_food_drink");
    }
    if (issue.code === "too_many_same_category") {
      const category = typeof issue.meta?.category === "string" ? issue.meta.category : void 0;
      if (category) {
        plan.forbiddenCategories.push(category);
        plan.preferredRoles.push("support", "ending");
        plan.debugReasons.push(`quality_repair_applied:forbid_category:${category}`);
      }
    }
    if (issue.code === "low_budget_missing_local_value") {
      plan.preferredRoles.push("local_food", "free_space", "support");
      plan.debugReasons.push("quality_repair_applied:low_budget_missing_local_value");
    }
  }
  return normalizeRepairPlan(plan);
}
function emptyRepairPlan() {
  return {
    excludedPoiIds: [],
    excludedVenueKeys: [],
    excludedBrandKeys: [],
    forbiddenCategories: [],
    preferredRoles: [],
    forceReselectAnchor: false,
    debugReasons: []
  };
}
function normalizeRepairPlan(plan) {
  return {
    excludedPoiIds: [...new Set(plan.excludedPoiIds.filter(Boolean))],
    excludedVenueKeys: [...new Set(plan.excludedVenueKeys.filter(Boolean).map((value) => value.toLowerCase()))],
    excludedBrandKeys: [...new Set(plan.excludedBrandKeys.filter(Boolean).map((value) => value.toLowerCase()))],
    forbiddenCategories: [...new Set(plan.forbiddenCategories.filter(Boolean))],
    preferredRoles: [...new Set(plan.preferredRoles.filter(Boolean))],
    forceReselectAnchor: plan.forceReselectAnchor,
    debugReasons: [...new Set(plan.debugReasons.filter(Boolean))]
  };
}
function mergeRepairPlans(current, next) {
  return normalizeRepairPlan({
    excludedPoiIds: [...current.excludedPoiIds, ...next.excludedPoiIds],
    excludedVenueKeys: [...current.excludedVenueKeys, ...next.excludedVenueKeys],
    excludedBrandKeys: [...current.excludedBrandKeys, ...next.excludedBrandKeys],
    forbiddenCategories: [...current.forbiddenCategories, ...next.forbiddenCategories],
    preferredRoles: [...current.preferredRoles, ...next.preferredRoles],
    forceReselectAnchor: current.forceReselectAnchor || next.forceReselectAnchor,
    debugReasons: [...current.debugReasons, ...next.debugReasons]
  });
}
function hasRepairActions(plan) {
  return plan.forceReselectAnchor || plan.excludedPoiIds.length > 0 || plan.excludedVenueKeys.length > 0 || plan.excludedBrandKeys.length > 0 || plan.forbiddenCategories.length > 0 || plan.preferredRoles.length > 0;
}
function applyRepairPlanToCandidates(candidates, plan) {
  return candidates.filter((poi) => {
    if (plan.excludedPoiIds.includes(poi.id)) return false;
    const venueKey = poi.venueKey?.toLowerCase();
    if (venueKey && plan.excludedVenueKeys.includes(venueKey)) return false;
    const brandKey = poi.brandKey?.toLowerCase();
    if (brandKey && plan.excludedBrandKeys.includes(brandKey)) return false;
    const category = poi.categoryKey;
    if (category && plan.forbiddenCategories.includes(category)) return false;
    return true;
  });
}
function selectBestRouteAttempt(attempts) {
  const best = attempts.slice().sort((left, right) => {
    if (left.fatalCount !== right.fatalCount) return left.fatalCount - right.fatalCount;
    if (left.qualityScore !== right.qualityScore) return right.qualityScore - left.qualityScore;
    if (left.warningCount !== right.warningCount) return left.warningCount - right.warningCount;
    return right.route.steps.length - left.route.steps.length;
  })[0];
  if (best) {
    best.route = {
      ...best.route,
      debugReasons: mergeMessages([
        ...best.route.debugReasons ?? [],
        `quality_selected_best_attempt:${attempts.findIndex((a) => a === best)}`
      ])
    };
  }
  return best;
}
function selectBestFallbackCandidates(candidates, count, durationWindow, requirements) {
  const pool = candidates.slice(0, 12);
  const combos = combinations(pool, Math.min(count, pool.length));
  const ranked = combos.filter((combo) => !hasDuplicateExperience(combo)).filter((combo) => canConnectCombo(combo, requirements)).map((combo) => {
    const steps = combo.map((poi, index) => ({
      order: index + 1,
      role: inferRole(poi, index),
      poi,
      note: poi.reason
    }));
    const total = estimateRouteMinutes(steps);
    const overPenalty = total > durationWindow.max ? (total - durationWindow.max) * 3 : 0;
    const underPenalty = total < durationWindow.min ? (durationWindow.min - total) * 1.4 : 0;
    return {
      combo,
      score: Math.abs(total - durationWindow.target) + overPenalty + underPenalty
    };
  }).sort((a, b) => a.score - b.score);
  return ranked[0]?.combo ?? pickDiverseFallback(pool.filter((poi) => canConnectCombo([poi], requirements)), count) ?? pickDiverseFallback(pool, count);
}
function canConnectCombo(pois2, requirements) {
  if (pois2.length === 0) return false;
  if (requirements.district && !requirements.allowCrossDistrict && pois2.some((poi) => !matchesDistrict(poi, requirements.district))) {
    return false;
  }
  const firstLeg = estimateTravelMinutesFromCurrentLocation(pois2[0], requirements.currentLocation);
  if (firstLeg > 60) return false;
  for (let index = 1; index < pois2.length; index += 1) {
    if (estimateTravelMinutesBetweenPois(pois2[index - 1], pois2[index]) > 60) return false;
  }
  return true;
}
function canConnectPois(selected, candidate, requirements) {
  return canConnectCombo([...selected, candidate], requirements);
}
function combinations(items, count) {
  if (count <= 0) return [[]];
  if (items.length < count) return [];
  if (count === 1) return items.map((item) => [item]);
  return items.flatMap(
    (item, index) => combinations(items.slice(index + 1), count - 1).map((rest) => [item, ...rest])
  );
}
function hasDuplicateExperience(pois2) {
  const keys = pois2.map(getExperienceKey);
  return new Set(keys).size !== keys.length;
}
function pickDiverseFallback(candidates, count) {
  const selected = [];
  for (const candidate of candidates) {
    if (selected.length >= count) break;
    if (selected.some((poi) => poi.id === candidate.id)) continue;
    if (hasSimilarExperience(selected, candidate)) continue;
    selected.push(candidate);
  }
  for (const candidate of candidates) {
    if (selected.length >= count) break;
    if (selected.some((poi) => poi.id === candidate.id)) continue;
    selected.push(candidate);
  }
  return selected;
}
function selectGeographicCandidates(filteredCandidates, districtCandidates, requirements) {
  if (!requirements.district) return filteredCandidates;
  if (requirements.allowCrossDistrict) {
    const nearby2 = filteredCandidates.filter(
      (poi) => isPoiNearRequestedDistrict(poi, requirements.district, 18) || Boolean(requirements.currentLocation) && estimateTravelMinutesFromCurrentLocation(poi, requirements.currentLocation) <= 60
    );
    return nearby2.length >= 2 ? nearby2 : filteredCandidates;
  }
  if (districtCandidates.length >= 2) return districtCandidates;
  const nearby = filteredCandidates.filter((poi) => isPoiNearRequestedDistrict(poi, requirements.district, 12));
  return nearby.length >= 2 ? nearby : filteredCandidates;
}
function filterPois(requirements, pois2, theme) {
  return pois2.filter((poi) => isExecutablePoi(poi)).filter((poi) => !isLowValueChain(buildPoiText5(poi), requirements)).filter((poi) => poi.price <= requirements.budgetMax).filter((poi) => poi.fitPeople.includes(requirements.peopleType)).filter((poi) => {
    if (isFarDistance(poi.distanceLevel) && requirements.distanceLevel !== "10km\u4EE5\u4E0A") return false;
    if (!requirements.distanceLevel || !poi.distanceLevel) return true;
    if (isNearOrMediumDistance(requirements.distanceLevel)) return isNearOrMediumDistance(poi.distanceLevel);
    return poi.distanceLevel === requirements.distanceLevel;
  }).filter((poi) => {
    if (requirements.constraints.includes("\u4E0D\u60F3\u6392\u961F")) return poi.queueLevel !== "high";
    return true;
  }).filter((poi) => {
    if (requirements.constraints.includes("\u5BA4\u5185\u4F18\u5148") || hasIndoorIntent(requirements)) {
      return poi.limits.includes("\u5BA4\u5185") || poi.limits.includes("\u96E8\u5929\u53EF\u53BB") || poi.weatherSensitive === false;
    }
    return true;
  }).sort((a, b) => scorePoi(b, requirements, theme) - scorePoi(a, requirements, theme));
}
function ensureViableCandidates(requirements, pois2, strictCandidates, theme) {
  const minViable = getDurationWindow(requirements).target <= 150 ? 2 : 3;
  if (strictCandidates.length >= minViable) return strictCandidates;
  const strictIds = new Set(strictCandidates.map((poi) => poi.id));
  const budgetCeiling = Math.max(requirements.budgetMax + 80, Math.round(requirements.budgetMax * 1.35), 120);
  const relaxed = pois2.filter((poi) => !strictIds.has(poi.id)).filter((poi) => isExecutablePoi(poi)).filter((poi) => !isLowValueChain(buildPoiText5(poi), requirements)).filter((poi) => poi.price <= budgetCeiling).filter((poi) => {
    if (requirements.constraints.includes("\u4E0D\u60F3\u6392\u961F")) return poi.queueLevel !== "high";
    return true;
  }).sort((a, b) => scorePoi(b, requirements, theme) - scorePoi(a, requirements, theme));
  return uniquePoiList([...strictCandidates, ...relaxed]);
}
function applyHardRouteCandidateFilters(candidates, requirements) {
  if (!requirements.district || requirements.allowCrossDistrict) return candidates.filter((poi) => isExecutablePoi(poi));
  const district = candidates.filter((poi) => matchesDistrict(poi, requirements.district));
  if (district.length >= 2) return district.filter((poi) => isExecutablePoi(poi));
  const nearby = candidates.filter((poi) => isPoiNearRequestedDistrict(poi, requirements.district, 18));
  if (nearby.length >= 2) return nearby.filter((poi) => isExecutablePoi(poi));
  return candidates.filter((poi) => isExecutablePoi(poi));
}
function fillRouteIfTooShort(selected, candidates, minStepCount, requirements) {
  if (selected.length >= minStepCount) return;
  for (const candidate of candidates) {
    if (selected.length >= minStepCount) break;
    if (selected.some((poi) => poi.id === candidate.id)) continue;
    if (!canConnectPois(selected, candidate, requirements)) continue;
    selected.push(candidate);
  }
  for (const candidate of candidates) {
    if (selected.length >= minStepCount) break;
    if (selected.some((poi) => poi.id === candidate.id)) continue;
    selected.push(candidate);
  }
}
function fillRouteTowardTarget(selected, candidates, targetStepCount, maxMinutes, requirements) {
  for (const candidate of candidates) {
    if (selected.length >= targetStepCount) break;
    if (selected.some((poi) => poi.id === candidate.id || hasSimilarVenueName(poi, candidate))) continue;
    if (hasSimilarExperience(selected, candidate)) continue;
    if (!canConnectPois(selected, candidate, requirements)) continue;
    const previewSteps = [...selected, candidate].map((poi, index) => ({
      order: index + 1,
      role: inferRole(poi, index),
      poi,
      note: poi.reason
    }));
    if (estimateRouteMinutes(previewSteps) <= maxMinutes + 35) {
      selected.push(candidate);
    }
  }
  for (const candidate of candidates) {
    if (selected.length >= targetStepCount) break;
    if (selected.some((poi) => poi.id === candidate.id || hasSimilarVenueName(poi, candidate))) continue;
    if (!canConnectPois(selected, candidate, requirements)) continue;
    const previewSteps = [...selected, candidate].map((poi, index) => ({
      order: index + 1,
      role: inferRole(poi, index),
      poi,
      note: poi.reason
    }));
    if (estimateRouteMinutes(previewSteps) <= maxMinutes + 50) {
      selected.push(candidate);
    }
  }
}
function improveRouteDiversity(selected, candidates, minStepCount, requirements) {
  const result = [];
  for (const poi of selected) {
    if (result.some((item) => item.id === poi.id || hasSimilarVenueName(item, poi) || hasSimilarExperience(result.filter((item2) => item2.id !== poi.id), poi))) {
      const replacement = candidates.find(
        (candidate) => !result.some((item) => item.id === candidate.id || hasSimilarVenueName(item, candidate)) && !selected.some((item) => item.id === candidate.id && item.id !== poi.id) && !hasSimilarExperience(result, candidate) && canConnectPois(result, candidate, requirements)
      );
      if (replacement) {
        result.push(replacement);
        continue;
      }
    }
    result.push(poi);
  }
  for (const candidate of candidates) {
    if (result.length >= minStepCount) break;
    if (result.some((poi) => poi.id === candidate.id || hasSimilarVenueName(poi, candidate))) continue;
    if (hasSimilarExperience(result, candidate)) continue;
    result.push(candidate);
  }
  return result;
}
function uniquePoiList(pois2) {
  const seen = /* @__PURE__ */ new Set();
  return pois2.filter((poi) => {
    const key = poi.id || poi.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function rerollRoute(requirements, previousRoute, pois2, theme) {
  const previousIds = new Set(previousRoute.steps.map((step) => step.poi.id));
  const remainingPois = pois2.filter((poi) => !previousIds.has(poi.id));
  return buildRoute(requirements, remainingPois.length > 0 ? remainingPois : pois2, theme);
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
  if (event.preferredReplacement && !event.customPreference?.trim()) {
    const exactReplacement = resolvePreferredReplacement(event, pois2, requirements);
    if (exactReplacement) {
      const reason = event.preferredReplacement.reason || `${exactReplacement.name} \u662F\u7528\u6237\u9009\u4E2D\u7684\u66FF\u4EE3\u8282\u70B9\uFF0C\u5DF2\u6309\u9009\u62E9\u66F4\u65B0\u8DEF\u7EBF\u3002`;
      const afterSteps2 = currentRoute.steps.map((step) => {
        if (step.poi.id !== targetStep.poi.id) return step;
        return {
          ...step,
          poi: exactReplacement,
          note: `${reason}\uFF08\u7528\u6237\u786E\u8BA4\u66FF\u6362\uFF09`
        };
      });
      const afterRoute2 = summarizeRoute(afterSteps2);
      changes.push({
        action: "replace",
        from: targetStep.poi.name,
        to: exactReplacement.name,
        reason
      });
      return buildPlanBResult(
        event,
        currentRoute,
        afterRoute2,
        changes,
        requirements,
        `\u5DF2\u6309\u4F60\u7684\u9009\u62E9\uFF0C\u5C06\u300C${targetStep.poi.name}\u300D\u66FF\u6362\u4E3A\u300C${exactReplacement.name}\u300D\u3002`
      );
    }
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
function resolvePreferredReplacement(event, pois2, requirements) {
  const preferred = event.preferredReplacement;
  if (!preferred?.name) return null;
  const normalizedName = normalizeName(preferred.name);
  const matchedPoi = pois2.find(
    (poi) => normalizeName(poi.name) === normalizedName || normalizeName(poi.name).includes(normalizedName) || normalizedName.includes(normalizeName(poi.name))
  );
  if (matchedPoi) return matchedPoi;
  return {
    id: preferred.id || `manual-${Date.now()}`,
    name: preferred.name,
    type: preferred.type || "\u4F11\u95F2\u5A31\u4E50",
    subType: preferred.subType || preferred.type || "\u7528\u6237\u9009\u62E9",
    area: preferred.area,
    businessDistrict: preferred.businessDistrict || preferred.area || requirements.city,
    price: preferred.price ?? 0,
    meituanRating: 4.6,
    reviewCount: 1200,
    tags: preferred.tags ?? [],
    limits: [],
    fitPeople: [requirements.peopleType],
    stayMinutes: preferred.stayMinutes ?? 60,
    queueLevel: "low",
    distanceLevel: "medium",
    reason: preferred.reason || `${preferred.name} \u662F\u7528\u6237\u786E\u8BA4\u9009\u62E9\u7684\u66FF\u4EE3\u8282\u70B9\u3002`,
    weatherSensitive: false
  };
}
function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "");
}
function pickFirst(candidates, types, existingSteps = []) {
  const existingPois = existingSteps.map((step) => step.poi);
  return candidates.find(
    (poi) => types.includes(poi.type) && !existingPois.some((existing) => existing.id === poi.id) && !hasSimilarExperience(existingPois, poi)
  );
}
function addStepIfFits(steps, poi, maxMinutes, requirements) {
  if (!poi) return;
  if (!canConnectToRoute(steps, poi, requirements)) return;
  const previewSteps = [
    ...steps,
    {
      order: steps.length + 1,
      role: inferRole(poi, steps.length),
      poi,
      note: poi.reason
    }
  ];
  if (estimateRouteMinutes(previewSteps) > maxMinutes && steps.length >= 1) return;
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
function hasSimilarExperience(existingPois, candidate) {
  const candidateKey = getExperienceKey(candidate);
  return existingPois.some((poi) => getExperienceKey(poi) === candidateKey);
}
function hasSimilarVenueName(a, b) {
  const left = getVenueNameKey(a.name);
  const right = getVenueNameKey(b.name);
  return left.length >= 3 && right.length >= 3 && (left.includes(right) || right.includes(left));
}
function getVenueNameKey(name) {
  return name.replace(/[（(].*?[）)]/g, "").replace(/旗舰店|总店|分店|东区|西区|南区|北区|一期|二期|三期|店|馆|体验|沉浸式|沉浸|实景|剧场|RPG|密室|咖啡|餐厅|书店|中心|购物|公园/gi, "").replace(/[·\s\-_/]/g, "").trim().toLowerCase();
}
function getExperienceKey(poi) {
  const text = `${poi.name} ${poi.type} ${poi.subType} ${poi.tags.join(" ")} ${poi.reason}`;
  const brand = getLowValueChainBrand(text);
  if (brand) return `\u8FDE\u9501\u54C1\u724C:${brand}`;
  if (/DIY|diy|手作|手工|陶艺|银饰|香薰|烘焙|画画|绘画|手办|Tufting/i.test(text)) return "DIY\u624B\u4F5C";
  if (poi.type === "\u8F7B\u98DF\u751C\u996E") return "\u8F7B\u98DF\u751C\u996E";
  if (poi.type === "\u9910\u996E\u6B63\u9910") return "\u9910\u996E\u6B63\u9910";
  if (poi.type === "\u6587\u5316\u4F53\u9A8C") return "\u6587\u5316\u770B\u5C55";
  if (poi.type === "\u6237\u5916\u6563\u6B65") return "\u6237\u5916\u6563\u6B65";
  if (poi.type === "\u4F11\u95F2\u5A31\u4E50") return "\u5BA4\u5185\u5A31\u4E50";
  if (poi.type === "\u62CD\u7167\u5730\u6807") return "\u62CD\u7167\u5730\u6807";
  if (/咖啡|奶茶|甜品|茶|饮品|面包|下午茶/.test(text)) return "\u8F7B\u98DF\u751C\u996E";
  if (/餐|饭|火锅|烧烤|小吃|bistro|酒馆|清吧|简餐/.test(text)) return "\u9910\u996E\u6B63\u9910";
  if (/展|美术馆|博物馆|书店|文化|艺术空间/.test(text)) return "\u6587\u5316\u770B\u5C55";
  if (/公园|栈道|海滨|沙滩|绿道|散步|徒步|citywalk/i.test(text)) return "\u6237\u5916\u6563\u6B65";
  if (/商场|购物中心|密室|桌游|KTV|电影|影院|电玩城|乐园/.test(text)) return "\u5BA4\u5185\u5A31\u4E50";
  if (/拍照|打卡|地标|夜景|广场/.test(text)) return "\u62CD\u7167\u5730\u6807";
  return poi.type;
}
function isLowValueChain(text, requirements) {
  const brand = getLowValueChainBrand(text);
  if (!brand) return false;
  const explicitText = `${requirements.rawText} ${requirements.preferences.join(" ")} ${requirements.constraints.join(" ")}`;
  if (new RegExp(`(\u4E0D\u8981|\u4E0D\u60F3\u53BB|\u4E0D\u53BB|\u522B\u53BB|\u907F\u5F00|\u5C11\u63A8\u8350).{0,12}${brand}`, "i").test(explicitText)) return true;
  return !explicitText.includes(brand);
}
function getLowValueChainBrand(text) {
  const brands = ["\u745E\u5E78", "luckin", "\u661F\u5DF4\u514B", "starbucks", "\u9EA6\u5F53\u52B3", "\u80AF\u5FB7\u57FA", "KFC", "\u5FC5\u80DC\u5BA2", "\u6C49\u5821\u738B", "\u871C\u96EA\u51B0\u57CE", "\u76CA\u79BE\u5802", "\u53E4\u8317", "\u4E00\u70B9\u70B9", "\u8336\u767E\u9053", "\u5948\u96EA", "\u559C\u8336", "\u9738\u738B\u8336\u59EC", "CoCo", "\u6CAA\u4E0A\u963F\u59E8", "\u7EDD\u5473\u9E2D\u8116", "\u6B63\u65B0\u9E21\u6392", "\u534E\u83B1\u58EB"];
  return brands.find((brand) => new RegExp(brand, "i").test(text));
}
function inferRole(poi, index) {
  if (poi.type === "\u9910\u996E\u6B63\u9910") return "meal";
  if (poi.type === "\u8F7B\u98DF\u751C\u996E") return "break";
  if (index >= 3) return "ending";
  return "activity";
}
function summarizeRoute(steps, preferredFirstTypes = [], requirements, context) {
  const orderedSteps = orderStepsSpatially(steps, preferredFirstTypes, requirements);
  const route = {
    totalMinutes: estimateRouteMinutes(orderedSteps),
    totalBudget: orderedSteps.reduce((sum, step) => sum + step.poi.price, 0),
    steps: orderedSteps.map((step, index) => ({
      ...step,
      order: index + 1,
      role: inferRole(step.poi, index)
    })),
    recommendationReasons: [],
    personalizationSummary: buildPersonalizationSummary(orderedSteps, requirements)
  };
  route.recommendationReasons = buildRouteRecommendationReasons(route, requirements, context);
  return route;
}
function decorateRouteTemplateAndAnchor(route, template, anchorSelection) {
  const usedRoles = /* @__PURE__ */ new Set();
  return {
    ...route,
    templateId: template.id,
    templateName: template.name,
    steps: route.steps.map((step, index) => {
      if (anchorSelection && step.poi.id === anchorSelection.poi.id) {
        usedRoles.add("anchor");
        return {
          ...step,
          isAnchor: true,
          templateRole: "anchor",
          roleReason: anchorSelection.reason
        };
      }
      const templateRole = step.templateRole ?? inferTemplateRoleForLegacyStep(step, index, template, usedRoles);
      usedRoles.add(templateRole);
      return {
        ...step,
        templateRole,
        roleReason: step.roleReason ?? buildLegacyRoleReason(step.poi, templateRole, template)
      };
    })
  };
}
function inferTemplateRoleForLegacyStep(step, index, template, usedRoles) {
  const text = buildPoiText5(step.poi);
  const category = getExperienceKey(step.poi);
  const preferred = template.targetRoles.find((role) => role !== "anchor" && !usedRoles.has(role));
  if (step.poi.type === "\u9910\u996E\u6B63\u9910" || /餐|饭|小吃|美食|夜市|茶餐厅/.test(text)) {
    if (template.targetRoles.includes("local_food") && !usedRoles.has("local_food")) return "local_food";
    if (template.targetRoles.includes("meal") && !usedRoles.has("meal")) return "meal";
  }
  if (step.poi.type === "\u8F7B\u98DF\u751C\u996E" || /咖啡|甜品|下午茶|茶饮/.test(text)) {
    if (template.targetRoles.includes("break") && !usedRoles.has("break")) return "break";
  }
  if (/户外|散步|公园|绿道|海滨|街区/.test(category + text)) {
    if (template.targetRoles.includes("ending") && !usedRoles.has("ending") && index >= 2) return "ending";
    if (template.targetRoles.includes("free_space") && !usedRoles.has("free_space")) return "free_space";
  }
  if (/文化|展|美术馆|博物馆|书店|艺术/.test(category + text)) {
    if (template.targetRoles.includes("indoor_activity") && !usedRoles.has("indoor_activity")) return "indoor_activity";
    if (template.targetRoles.includes("support") && !usedRoles.has("support")) return "support";
  }
  return preferred ?? (index >= 3 ? "ending" : "support");
}
function buildLegacyRoleReason(poi, role, template) {
  return `\u300C${poi.name}\u300D\u9002\u5408\u653E\u5728\u300C${template.name}\u300D\u91CC\u7684${labelTemplateRole2(role)}\u4F4D\u7F6E\u3002`;
}
function mergeMessages(messages) {
  return [...new Set(messages.filter((message) => message.trim().length > 0))];
}
function getExplicitActivityTypes(requirements) {
  const text = [
    requirements.rawText,
    ...requirements.preferences,
    ...requirements.constraints
  ].join(" ");
  const types = [];
  if (/室内.*(娱乐|玩|活动)|娱乐.*室内|电玩城|桌游|密室|KTV|电影|游戏|剧本/.test(text)) {
    types.push("\u4F11\u95F2\u5A31\u4E50");
  }
  if (/diy|DIY|手工|手作|陶艺|银饰|香薰|烘焙|画画|绘画/.test(text)) {
    types.push("\u6587\u5316\u4F53\u9A8C", "\u4F11\u95F2\u5A31\u4E50");
  }
  if (/展|美术馆|博物馆|艺术|文化|书店/.test(text)) {
    types.push("\u6587\u5316\u4F53\u9A8C");
  }
  if (/拍照|打卡|出片|地标|夜景/.test(text)) {
    types.push("\u62CD\u7167\u5730\u6807", "\u6587\u5316\u4F53\u9A8C");
  }
  if (/公园|散步|户外|徒步|citywalk/i.test(text)) {
    types.push("\u6237\u5916\u6563\u6B65");
  }
  return [...new Set(types)];
}
function buildRoutePattern(requirements, theme, explicitActivityTypes) {
  const activity = explicitActivityTypes.length > 0 ? explicitActivityTypes : ["\u62CD\u7167\u5730\u6807", "\u6587\u5316\u4F53\u9A8C", "\u4F11\u95F2\u5A31\u4E50", "\u6237\u5916\u6563\u6B65"];
  const base = {
    activity,
    breakStop: ["\u8F7B\u98DF\u751C\u996E"],
    ending: ["\u6237\u5916\u6563\u6B65", "\u62CD\u7167\u5730\u6807", "\u6587\u5316\u4F53\u9A8C", "\u4F11\u95F2\u5A31\u4E50"],
    includeMeal: true
  };
  if (requirements.peopleType === "\u4EB2\u5B50" || theme === "\u4EB2\u5B50\u8F7B\u677E\u653E\u7535\u76D2") {
    return {
      activity: explicitActivityTypes.length > 0 ? explicitActivityTypes : ["\u4F11\u95F2\u5A31\u4E50", "\u6237\u5916\u6563\u6B65", "\u6587\u5316\u4F53\u9A8C"],
      breakStop: ["\u8F7B\u98DF\u751C\u996E", "\u9910\u996E\u6B63\u9910"],
      ending: ["\u6237\u5916\u6563\u6B65", "\u4F11\u95F2\u5A31\u4E50", "\u8F7B\u98DF\u751C\u996E"],
      includeMeal: true
    };
  }
  if (theme === "\u96E8\u5929\u5BA4\u5185\u56DE\u8840\u76D2" || hasIndoorIntent(requirements)) {
    return {
      activity: explicitActivityTypes.length > 0 ? explicitActivityTypes : ["\u4F11\u95F2\u5A31\u4E50", "\u6587\u5316\u4F53\u9A8C", "\u62CD\u7167\u5730\u6807"],
      breakStop: ["\u8F7B\u98DF\u751C\u996E", "\u9910\u996E\u6B63\u9910"],
      ending: ["\u6587\u5316\u4F53\u9A8C", "\u4F11\u95F2\u5A31\u4E50", "\u8F7B\u98DF\u751C\u996E"],
      includeMeal: true
    };
  }
  if (requirements.peopleType === "\u5355\u4EBA" || theme === "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2") {
    return {
      activity: explicitActivityTypes.length > 0 ? explicitActivityTypes : ["\u6237\u5916\u6563\u6B65", "\u6587\u5316\u4F53\u9A8C", "\u62CD\u7167\u5730\u6807"],
      breakStop: ["\u8F7B\u98DF\u751C\u996E", "\u6587\u5316\u4F53\u9A8C"],
      ending: ["\u6237\u5916\u6563\u6B65", "\u6587\u5316\u4F53\u9A8C", "\u8F7B\u98DF\u751C\u996E", "\u62CD\u7167\u5730\u6807"],
      includeMeal: requirements.budgetMax > 150
    };
  }
  if (theme === "\u5C0F\u4F17\u62CD\u7167\u5403\u8D27\u76D2") {
    return {
      activity: explicitActivityTypes.length > 0 ? explicitActivityTypes : ["\u62CD\u7167\u5730\u6807", "\u6587\u5316\u4F53\u9A8C", "\u6237\u5916\u6563\u6B65"],
      breakStop: ["\u8F7B\u98DF\u751C\u996E"],
      ending: ["\u9910\u996E\u6B63\u9910", "\u62CD\u7167\u5730\u6807", "\u6587\u5316\u4F53\u9A8C"],
      includeMeal: true
    };
  }
  if (theme === "\u591C\u666F\u5FAE\u91BA\u76D2") {
    return {
      activity: explicitActivityTypes.length > 0 ? explicitActivityTypes : ["\u62CD\u7167\u5730\u6807", "\u6587\u5316\u4F53\u9A8C", "\u4F11\u95F2\u5A31\u4E50"],
      breakStop: ["\u9910\u996E\u6B63\u9910", "\u8F7B\u98DF\u751C\u996E"],
      ending: ["\u62CD\u7167\u5730\u6807", "\u6237\u5916\u6563\u6B65", "\u4F11\u95F2\u5A31\u4E50"],
      includeMeal: true
    };
  }
  if (theme === "\u7701\u94B1\u5FEB\u4E50\u76D2" || requirements.budgetMax <= 150) {
    return {
      activity: explicitActivityTypes.length > 0 ? explicitActivityTypes : ["\u6237\u5916\u6563\u6B65", "\u62CD\u7167\u5730\u6807", "\u6587\u5316\u4F53\u9A8C", "\u4F11\u95F2\u5A31\u4E50"],
      breakStop: ["\u8F7B\u98DF\u751C\u996E", "\u9910\u996E\u6B63\u9910"],
      ending: ["\u6237\u5916\u6563\u6B65", "\u62CD\u7167\u5730\u6807", "\u6587\u5316\u4F53\u9A8C", "\u4F11\u95F2\u5A31\u4E50"],
      includeMeal: true
    };
  }
  return base;
}
function hasIndoorIntent(requirements) {
  const text = [
    requirements.rawText,
    ...requirements.preferences,
    ...requirements.constraints
  ].join(" ");
  return /室内|下雨|雨天/.test(text);
}
function orderStepsSpatially(steps, preferredFirstTypes = [], requirements) {
  if (steps.length < 3 || steps.length > 5) return steps;
  if (steps.some((step) => !hasCoordinate(step.poi))) return steps;
  const permutations = permute(steps).filter((candidate) => !requirements || canConnectCombo(candidate.map((step) => step.poi), requirements));
  return permutations.map((candidate) => ({
    candidate,
    score: scoreRouteOrder(candidate, preferredFirstTypes)
  })).sort((a, b) => a.score - b.score)[0]?.candidate ?? steps;
}
function hasCoordinate(poi) {
  return typeof poi.lat === "number" && typeof poi.lng === "number";
}
function scoreRouteOrder(steps, preferredFirstTypes = []) {
  const pathDistance = steps.slice(1).reduce((sum, step, index) => {
    return sum + distanceKm2(steps[index].poi, step.poi);
  }, 0);
  const startEndDistance = distanceKm2(steps[0].poi, steps.at(-1).poi);
  const rolePenalty = scoreRoleOrderPenalty(steps, preferredFirstTypes);
  const backtrackPenalty = scoreBacktrackPenalty(steps);
  return pathDistance - startEndDistance * 0.45 + rolePenalty + backtrackPenalty;
}
function scoreRoleOrderPenalty(steps, preferredFirstTypes = []) {
  let penalty = 0;
  const first = steps[0]?.poi;
  const last = steps.at(-1)?.poi;
  if (preferredFirstTypes.length > 0 && first && !preferredFirstTypes.includes(first.type)) penalty += 100;
  if (first?.type === "\u9910\u996E\u6B63\u9910" || first?.type === "\u8F7B\u98DF\u751C\u996E") penalty += 2.5;
  if (last?.type === "\u9910\u996E\u6B63\u9910") penalty += 1.2;
  const mealIndex = steps.findIndex((step) => step.poi.type === "\u9910\u996E\u6B63\u9910");
  const breakIndex = steps.findIndex((step) => step.poi.type === "\u8F7B\u98DF\u751C\u996E");
  if (mealIndex >= 0 && breakIndex >= 0 && mealIndex < breakIndex) penalty += 0.8;
  for (let index = 1; index < steps.length; index += 1) {
    const previous = steps[index - 1];
    const current = steps[index];
    if (getRouteCategoryKey(previous.poi) === getRouteCategoryKey(current.poi)) penalty += 80;
    if (previous.templateRole && previous.templateRole === current.templateRole) penalty += 70;
    if (isFoodOrDrink(previous.poi) && isFoodOrDrink(current.poi)) penalty += 55;
  }
  const drinkCount = steps.filter((step) => getRouteCategoryKey(step.poi) === "drink").length;
  const foodDrinkCount = steps.filter((step) => isFoodOrDrink(step.poi)).length;
  if (drinkCount > 1) penalty += (drinkCount - 1) * 90;
  if (foodDrinkCount > 2) penalty += (foodDrinkCount - 2) * 75;
  return penalty;
}
function getRouteCategoryKey(poi) {
  const text = buildPoiText5(poi);
  if (poi.type === "\u9910\u996E\u6B63\u9910" || /餐|饭|菜馆|火锅|烧烤|小吃|夜市|美食街|茶餐厅|bistro/i.test(text)) return "meal";
  if (poi.type === "\u8F7B\u98DF\u751C\u996E" || /咖啡|茶|甜品|奶茶|饮品|面包|下午茶/i.test(text)) return "drink";
  if (poi.type === "\u6587\u5316\u4F53\u9A8C" || /展|美术馆|博物馆|书店|文化|艺术|手作|陶艺|DIY/i.test(text)) return "culture";
  if (poi.type === "\u6237\u5916\u6563\u6B65" || /公园|绿道|栈道|海滨|沙滩|街区|古城|散步|citywalk/i.test(text)) return "outdoor";
  if (poi.type === "\u62CD\u7167\u5730\u6807" || /拍照|打卡|地标|夜景|广场/i.test(text)) return "photo";
  if (poi.type === "\u4F11\u95F2\u5A31\u4E50" || /娱乐|电影|影院|KTV|密室|桌游|电玩城|乐园|运动/i.test(text)) return "entertainment";
  return "other";
}
function isFoodOrDrink(poi) {
  return ["meal", "drink"].includes(getRouteCategoryKey(poi));
}
function scoreBacktrackPenalty(steps) {
  let penalty = 0;
  for (let i = 2; i < steps.length; i += 1) {
    const prevPrev = steps[i - 2].poi;
    const current = steps[i].poi;
    const skippedDistance = distanceKm2(prevPrev, current);
    const viaDistance = distanceKm2(prevPrev, steps[i - 1].poi) + distanceKm2(steps[i - 1].poi, current);
    if (skippedDistance > 0 && viaDistance / skippedDistance > 2.2) {
      penalty += 1.5;
    }
  }
  return penalty;
}
function distanceKm2(a, b) {
  if (!hasCoordinate(a) || !hasCoordinate(b)) return 0;
  const earthRadiusKm = 6371;
  const dLat = toRadians2(b.lat - a.lat);
  const dLng = toRadians2(b.lng - a.lng);
  const lat1 = toRadians2(a.lat);
  const lat2 = toRadians2(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(h)));
}
function toRadians2(value) {
  return value * Math.PI / 180;
}
function permute(items) {
  if (items.length <= 1) return [items];
  return items.flatMap((item, index) => {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    return permute(rest).map((candidate) => [item, ...candidate]);
  });
}
function canConnectToRoute(steps, poi, requirements) {
  if (!requirements.allowCrossDistrict && requirements.district && !matchesDistrict(poi, requirements.district)) {
    return false;
  }
  if (steps.length === 0) {
    const firstLegMinutes = estimateTravelMinutesFromCurrentLocation(poi, requirements.currentLocation);
    return firstLegMinutes === 0 || firstLegMinutes <= 60;
  }
  const previous = steps.at(-1)?.poi;
  if (!previous) return true;
  return estimateTravelMinutesBetweenPois(previous, poi) <= 60;
}
function scorePoi(poi, requirements, theme) {
  let score = poi.priorityScore ?? 50;
  const profile = requirements.userProfile;
  const poiText = buildPoiText5(poi);
  if (isLowValueChain(poiText, requirements)) score -= 90;
  if (!poi.fitPeople.includes(requirements.peopleType)) score -= 26;
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
  if (requirements.district && matchesDistrict(poi, requirements.district)) score += 24;
  if (requirements.district && !isPoiNearRequestedDistrict(poi, requirements.district, 12)) score -= 80;
  if (requirements.district) {
    const startTravel = estimateTravelMinutesFromRequestedDistrict(poi, requirements.district);
    if (startTravel > 70) score -= 60;
    else if (startTravel > 45) score -= 25;
    else if (startTravel > 0 && startTravel <= 30) score += 12;
  }
  if (requirements.currentLocation) {
    const fromCurrent = estimateTravelMinutesFromCurrentLocation(poi, requirements.currentLocation);
    if (fromCurrent > 90) score -= 100;
    else if (fromCurrent > 60) score -= 55;
    else if (fromCurrent > 40) score -= 18;
    else if (fromCurrent > 0 && fromCurrent <= 25) score += 24;
    else if (fromCurrent > 0 && fromCurrent <= 40) score += 12;
  }
  if (requirements.peopleType === "\u4EB2\u5B50" && (poi.tags.includes("\u4EB2\u5B50") || poi.tags.includes("\u81EA\u7136\u6559\u80B2") || poi.limits.includes("\u5C11\u8D70\u8DEF") || /儿童|亲子|公园/.test(poi.reason))) score += 14;
  if (requirements.peopleType === "\u60C5\u4FA3" && (poi.tags.includes("\u6C1B\u56F4") || poi.tags.includes("\u62CD\u7167") || poi.tags.includes("\u591C\u666F") || /约会|清吧|安静/.test(poi.reason))) score += 12;
  if (requirements.peopleType === "\u670B\u53CB" && (poi.tags.includes("\u4E92\u52A8") || poi.tags.includes("\u7F8E\u98DF") || poi.type === "\u4F11\u95F2\u5A31\u4E50" || /桌游|聚会|小吃|聊天/.test(poi.reason))) score += 12;
  if (requirements.peopleType === "\u5355\u4EBA" && (poi.tags.includes("\u5B89\u9759") || poi.tags.includes("\u5496\u5561") || poi.type === "\u6587\u5316\u4F53\u9A8C" || poi.type === "\u6237\u5916\u6563\u6B65" || /书店|美术馆|公园/.test(poi.reason))) score += 12;
  if (requirements.budgetMax <= 150 && (poi.price === 0 || poi.price <= 50 || poi.tags.includes("\u6027\u4EF7\u6BD4") || poi.tags.includes("\u514D\u8D39"))) score += 14;
  if (requirements.budgetMax <= 150 && poi.price > 120) score -= 18;
  if (requirements.budgetMax >= 350 && (poi.type === "\u6587\u5316\u4F53\u9A8C" || poi.type === "\u9910\u996E\u6B63\u9910" || poi.tags.includes("\u5C0F\u4F17") || poi.tags.includes("\u624B\u4F5C") || poi.tags.includes("\u591C\u666F"))) score += 8;
  if (requirements.budgetMax > 150 && requirements.budgetMax < 350 && (poi.tags.includes("\u6027\u4EF7\u6BD4") || poi.type === "\u8F7B\u98DF\u751C\u996E")) score += 5;
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
  if (profile) {
    score += scoreProfilePreference(poi, poiText, profile);
  }
  return score;
}
function scoreProfilePreference(poi, poiText, profile) {
  let score = 0;
  if (profile.likedPoiTypes?.includes(poi.type)) score += 28;
  if (profile.favoritePoiNames?.some((name) => poi.name.includes(name) || name.includes(poi.name))) score += 35;
  if (profile.likedDistricts?.some((district) => matchesDistrict(poi, district))) score += 16;
  const likedTagHits = (profile.likedTags ?? []).filter((tag) => poi.tags.includes(tag) || poiText.includes(tag));
  score += Math.min(24, likedTagHits.length * 7);
  if (profile.favoriteRouteThemes?.some((theme) => poi.blindBoxThemes?.includes(theme) || poiText.includes(theme))) score += 10;
  if (profile.dislikedPoiTypes?.includes(poi.type)) score -= 42;
  const rejectedHits = (profile.rejectedKeywords ?? []).filter((keyword) => poiText.includes(keyword.replace(/^少推荐/, "")));
  score -= Math.min(30, rejectedHits.length * 10);
  const budgetRange = profile.budgetRange;
  if (budgetRange) {
    const [minBudget, maxBudget] = budgetRange;
    if (poi.price >= minBudget && poi.price <= maxBudget) score += 10;
    if (poi.price > maxBudget) score -= Math.min(28, Math.round((poi.price - maxBudget) / 8));
  }
  if (profile.preferredRoutePace === "relaxed") {
    if (poi.stayMinutes <= 85 || poi.type === "\u8F7B\u98DF\u751C\u996E" || poi.type === "\u6237\u5916\u6563\u6B65") score += 6;
    if (poi.stayMinutes >= 120) score -= 8;
  }
  if (profile.preferredRoutePace === "packed") {
    if (poi.stayMinutes <= 80) score += 5;
    if (poi.stayMinutes >= 120) score -= 5;
  }
  return score;
}
function buildRouteRecommendationReasons(route, requirements, context) {
  const steps = route.steps ?? [];
  if (steps.length === 0) return [];
  const reasons = [];
  reasons.push(...collectTemplateReason(context?.template));
  reasons.push(...collectAnchorReason(route, context?.anchorSelection));
  reasons.push(...collectFallbackReason(context));
  reasons.push(...collectRoleCoverageReason(route, context));
  reasons.push(...collectRepairReason(route, context));
  reasons.push(...collectBaseRecommendationReasons(route, requirements));
  return finalizeRecommendationReasons(reasons);
}
function collectTemplateReason(template) {
  if (!template) return [];
  const matchedReason = template.matchedReasons.find((reason) => reason.trim().length > 0);
  if (!matchedReason) return [];
  return [`\u8FD9\u6B21\u6309\u300C${template.name}\u300D\u7684\u8282\u594F\u6765\u5B89\u6392\uFF0C\u539F\u56E0\u662F\uFF1A${toUserFacingReason(matchedReason)}`];
}
function collectAnchorReason(route, anchorSelection) {
  const anchorStep = route.steps.find((step) => step.isAnchor);
  const anchorName = anchorStep?.poi.name ?? anchorSelection?.poi.name;
  const anchorReason = anchorStep?.roleReason ?? anchorSelection?.reason;
  if (!anchorName || !anchorReason) return [];
  return [`\u5148\u9009\u300C${anchorName}\u300D\u4F5C\u4E3A\u6838\u5FC3\u505C\u7559\u70B9\uFF0C\u518D\u56F4\u7ED5\u5B83\u5B89\u6392\u5403\u559D\u3001\u6563\u6B65\u6216\u6536\u5C3E\u3002`];
}
function collectRoleCoverageReason(route, context) {
  const warnings = context?.warnings ?? [];
  const debugReasons = context?.debugReasons ?? [];
  const roles = route.steps.map((step) => step.templateRole).filter((role) => Boolean(role) && role !== "anchor");
  const uniqueRoles = [...new Set(roles)];
  const shortRouteWarning = warnings.find((warning) => /不为凑数|只找到|少于目标|低质量地点/.test(warning));
  if (shortRouteWarning || debugReasons.some((reason) => /composer_under_target|composer_slot_missing|composer_below_minimum/.test(reason))) {
    return [`\u8FD9\u6B21\u53EA\u4FDD\u7559 ${route.steps.length} \u7AD9\uFF0C\u662F\u56E0\u4E3A\u9644\u8FD1\u66F4\u5408\u9002\u7684\u8865\u70B9\u4E0D\u591F\u7A33\u5B9A\u3002`];
  }
  if (uniqueRoles.length === 0) return [];
  return [`\u8DEF\u7EBF\u91CC\u8865\u4E86${uniqueRoles.slice(0, 3).map(labelTemplateRole2).join("\u3001")}\uFF0C\u4E0D\u662F\u53EA\u5806\u540C\u4E00\u79CD\u5E97\u3002`];
}
function collectRepairReason(route, context) {
  const issues = context?.qualityIssues ?? [];
  const debugReasons = context?.debugReasons ?? [];
  const issueCodes = new Set(issues.map((issue) => issue.code));
  const hasRepairSignals = debugReasons.some((reason) => /quality_retry_attempt:|quality_repair_applied:|quality_selected_best_attempt:/.test(reason));
  if (!hasRepairSignals && issueCodes.size === 0) return [];
  if (debugReasons.some((reason) => /quality_repair_applied:duplicate_brand|quality_repair_applied:duplicate_venue/.test(reason)) || issueCodes.has("duplicate_brand") || issueCodes.has("duplicate_venue")) {
    return ["\u5DF2\u907F\u5F00\u91CD\u590D\u5E97\u548C\u666E\u901A\u8FDE\u9501\u624E\u5806\uFF0C\u5C3D\u91CF\u8BA9\u6BCF\u4E00\u7AD9\u90FD\u6709\u4E0D\u540C\u4F5C\u7528\u3002"];
  }
  if (debugReasons.some((reason) => /quality_repair_applied:low_value_anchor|quality_repair_applied:missing_anchor|quality_repair_applied:not_executable_poi|quality_repair_applied:not_real_navigable_poi/.test(reason)) || issueCodes.has("low_value_anchor") || issueCodes.has("missing_anchor") || issueCodes.has("not_executable_poi") || issueCodes.has("not_real_navigable_poi")) {
    return ["\u5DF2\u5C3D\u91CF\u907F\u5F00\u4F4E\u4EF7\u503C\u6216\u4E0D\u53EF\u6267\u884C\u5730\u70B9\uFF0C\u4F18\u5148\u4FDD\u7559\u80FD\u771F\u6B63\u6210\u7EBF\u7684\u8282\u70B9\u3002"];
  }
  if (debugReasons.some((reason) => /quality_repair_applied:too_many_drink|quality_repair_applied:too_many_food_drink|quality_repair_applied:forbid_category:/.test(reason)) || issueCodes.has("too_many_drink") || issueCodes.has("too_many_food_drink") || issueCodes.has("too_many_same_category")) {
    return ["\u5DF2\u538B\u4F4E\u5403\u559D\u6216\u540C\u7C7B\u8282\u70B9\u5360\u6BD4\uFF0C\u4F18\u5148\u4FDD\u7559\u66F4\u5747\u8861\u7684\u8DEF\u7EBF\u8282\u594F\u3002"];
  }
  if (debugReasons.some((reason) => /quality_repair_applied:cross_district_without_permission/.test(reason)) || issueCodes.has("cross_district_without_permission")) {
    return ["\u5DF2\u5C3D\u91CF\u628A\u8DEF\u7EBF\u538B\u56DE\u76EE\u6807\u533A\u57DF\u5185\uFF0C\u51CF\u5C11\u8DE8\u533A\u6298\u8FD4\u548C\u79FB\u52A8\u6D88\u8017\u3002"];
  }
  if (debugReasons.some((reason) => /quality_repair_applied:prefer_role:/.test(reason)) || issueCodes.has("missing_template_role") || issueCodes.has("template_role_mismatch") || issueCodes.has("too_few_stops_without_reason")) {
    return ["\u5F53\u524D\u5019\u9009\u4E0D\u8DB3\u65F6\u4F18\u5148\u4FDD\u7559\u6838\u5FC3\u89D2\u8272\uFF0C\u6CA1\u6709\u4E3A\u4E86\u8865\u6EE1\u70B9\u6570\u727A\u7272\u8DEF\u7EBF\u8D28\u91CF\u3002"];
  }
  if (hasRepairSignals) {
    return ["\u7CFB\u7EDF\u5DF2\u7ECF\u7B5B\u6389\u4E00\u8F6E\u4E0D\u591F\u987A\u7684\u7EC4\u5408\uFF0C\u4FDD\u7559\u5F53\u524D\u66F4\u5BB9\u6613\u6267\u884C\u7684\u4E00\u7248\u3002"];
  }
  return [];
}
function collectFallbackReason(context) {
  if (!context?.usedFallback && !(context?.debugReasons ?? []).includes("composer_fallback_to_legacy")) {
    return [];
  }
  return ["\u5982\u679C\u6807\u51C6\u7EC4\u5408\u4E0D\u591F\u987A\uFF0C\u4F1A\u6539\u7528\u66F4\u7A33\u7684\u62FC\u6CD5\uFF0C\u4F18\u5148\u4FDD\u8BC1\u771F\u5B9E\u53EF\u53BB\u3001\u5C11\u7ED5\u8DEF\u3002"];
}
function collectBaseRecommendationReasons(route, requirements) {
  const steps = route.steps ?? [];
  const reasons = [];
  const profile = requirements?.userProfile;
  const pois2 = steps.map((step) => step.poi);
  const types = [...new Set(pois2.map((poi) => poi.type))];
  const districts = [...new Set(pois2.map((poi) => poi.area || poi.businessDistrict).filter(Boolean))];
  const profileTypeHits = profile?.likedPoiTypes?.filter((type) => types.includes(type)) ?? [];
  const profileDistrictHits = profile?.likedDistricts?.filter((district) => pois2.some((poi) => matchesDistrict(poi, district))) ?? [];
  const profileTagHits = profile?.likedTags?.filter((tag) => pois2.some((poi) => poi.tags.includes(tag) || buildPoiText5(poi).includes(tag))) ?? [];
  if (requirements?.district) {
    const inDistrictCount = pois2.filter((poi) => matchesDistrict(poi, requirements.district)).length;
    if (inDistrictCount === pois2.length) {
      reasons.push(`\u8DEF\u7EBF\u8282\u70B9\u5747\u5728${requirements.district}\u5185\uFF0C\u51CF\u5C11\u7B2C\u4E00\u7AD9\u548C\u4E2D\u9014\u79FB\u52A8\u6210\u672C\u3002`);
    } else if (requirements.allowCrossDistrict) {
      reasons.push(`\u4EE5${requirements.district}\u4E3A\u6838\u5FC3\uFF0C\u5E76\u5141\u8BB8\u76F8\u90BB\u5546\u5708\u8865\u70B9\uFF1B\u5F53\u524D\u6709 ${pois2.length - inDistrictCount} \u4E2A\u8DE8\u533A\u8282\u70B9\u3002`);
    } else {
      reasons.push(`\u76EE\u6807\u533A\u57DF${requirements.district}\u7684\u53EF\u6267\u884C\u5019\u9009\u4E0D\u8DB3\uFF0C\u5F53\u524D\u8DEF\u7EBF\u672A\u80FD\u5B8C\u5168\u538B\u5728\u8BE5\u533A\u5185\u3002`);
    }
  }
  if (profileTypeHits.length > 0 || profileDistrictHits.length > 0 || profileTagHits.length > 0) {
    reasons.push(`\u53C2\u8003\u4E86\u4F60\u7684\u5386\u53F2\u504F\u597D\uFF1A${[
      profileTypeHits.slice(0, 2).join("\u3001"),
      profileDistrictHits.slice(0, 2).join("\u3001"),
      profileTagHits.slice(0, 2).join("\u3001")
    ].filter(Boolean).join("\uFF1B")}\u3002`);
  }
  const avoidedTypes = profile?.dislikedPoiTypes?.filter((type) => !types.includes(type)).slice(0, 2) ?? [];
  if (avoidedTypes.length > 0) {
    reasons.push(`\u5DF2\u5C3D\u91CF\u907F\u5F00\u4F60\u6700\u8FD1\u66FF\u6362\u6216\u5220\u9664\u8FC7\u7684\u300C${avoidedTypes.join("\u3001")}\u300D\u3002`);
  }
  if (types.length >= Math.min(3, steps.length)) {
    reasons.push(`\u8282\u70B9\u7C7B\u578B\u8986\u76D6${types.slice(0, 4).join("\u3001")}\uFF0C\u907F\u514D\u6574\u6761\u8DEF\u7EBF\u53EA\u91CD\u590D\u540C\u4E00\u79CD\u4F53\u9A8C\u3002`);
  }
  if (requirements?.budgetMax) {
    reasons.push(`\u9884\u7B97\u6309\u6BCF\u7AD9\u4EBA\u5747\u533A\u95F4\u4F30\u7B97\uFF0C\u5E76\u63A7\u5236\u5728\u4F60\u9009\u62E9\u7684 \xA5${requirements.budgetMax} \u4EE5\u5185\u3002`);
  }
  if (districts.length > 0 && steps.length >= 2) {
    reasons.push(`\u8DEF\u7EBF\u4ECE${districts[0]}\u5C55\u5F00\uFF0C\u987A\u5E8F\u4F1A\u6309\u7A7A\u95F4\u8DDD\u79BB\u548C\u5403\u559D\u73A9\u4F11\u8282\u594F\u91CD\u65B0\u6392\u5E8F\u3002`);
  }
  return reasons;
}
function toUserFacingReason(reason) {
  return reason.replace(/用户表达了/g, "\u4F60\u63D0\u5230\u4E86").replace(/用户提到/g, "\u4F60\u63D0\u5230\u4E86").replace(/出行人群为/g, "\u540C\u884C\u4EBA\u662F").replace(/盲盒主题偏/g, "\u9009\u62E9\u7684\u98CE\u683C\u504F").replace(/预算上限为/g, "\u9884\u7B97\u662F").replace(/没有强主题信号，使用轻松半日模板。/g, "\u6CA1\u6709\u7279\u522B\u9650\u5B9A\u98CE\u683C\uFF0C\u9002\u5408\u8D70\u8F7B\u677E\u534A\u65E5\u8DEF\u7EBF\u3002");
}
function finalizeRecommendationReasons(reasons) {
  return [...new Set(reasons.map((reason) => reason.trim()).filter((reason) => reason.length > 0))].slice(0, 4);
}
function labelTemplateRole2(role) {
  const labels = {
    anchor: "\u4E3B\u951A\u70B9",
    break: "\u4F11\u606F/\u4E0B\u5348\u8336",
    meal: "\u6B63\u9910",
    support: "\u8865\u5145\u4F53\u9A8C",
    ending: "\u8F7B\u677E\u6536\u5C3E",
    local_food: "\u672C\u5730\u5403\u98DF",
    free_space: "\u514D\u8D39/\u4F4E\u4EF7\u7A7A\u95F4",
    indoor_activity: "\u5BA4\u5185\u6D3B\u52A8",
    interactive: "\u670B\u53CB\u4E92\u52A8",
    atmosphere: "\u6C1B\u56F4\u4F53\u9A8C",
    family_activity: "\u4EB2\u5B50\u6D3B\u52A8"
  };
  return labels[role] ?? role;
}
function buildPersonalizationSummary(steps, requirements) {
  if (steps.length === 0) return void 0;
  const profile = requirements?.userProfile;
  if (!profile) return void 0;
  const signalCount = (profile.confirmedRouteCount ?? 0) + (profile.favoritePoiCount ?? 0) + (profile.favoriteRouteCount ?? 0);
  const routeTypes = new Set(steps.map((step) => step.poi.type));
  const matchedTypes = (profile.likedPoiTypes ?? []).filter((type) => routeTypes.has(type));
  const matchedDistrict = (profile.likedDistricts ?? []).find((district) => steps.some((step) => matchesDistrict(step.poi, district)));
  const parts = [
    signalCount > 0 ? `${signalCount} \u6761\u5386\u53F2\u884C\u4E3A` : "",
    matchedTypes.length ? `\u504F\u597D\u7C7B\u578B ${matchedTypes.slice(0, 2).join("\u3001")}` : "",
    matchedDistrict ? `\u5E38\u53BB\u533A\u57DF ${matchedDistrict}` : ""
  ].filter(Boolean);
  return parts.length ? `\u5DF2\u53C2\u8003${parts.join("\uFF1B")}` : void 0;
}
function buildPoiText5(poi) {
  return `${poi.name} ${poi.type} ${poi.subType} ${poi.area || ""} ${poi.businessDistrict} ${poi.tags.join(" ")} ${poi.limits.join(" ")} ${poi.reason}`;
}
function matchesDistrict(poi, district) {
  const normalized = district.replace(/区$/, "");
  return [poi.area, poi.businessDistrict, poi.routeCluster, poi.address].filter(Boolean).some((value) => String(value).includes(normalized));
}
function selectRouteCluster(candidates, requirements, theme, requiredTypes = []) {
  const clusters = /* @__PURE__ */ new Map();
  for (const poi of candidates) {
    if (!poi.routeCluster) continue;
    const bucket = clusters.get(poi.routeCluster) ?? { score: 0, types: /* @__PURE__ */ new Set(), count: 0 };
    bucket.score += scorePoi(poi, requirements, theme);
    bucket.types.add(poi.type);
    bucket.count += 1;
    clusters.set(poi.routeCluster, bucket);
  }
  return [...clusters.entries()].filter(([, bucket]) => bucket.count >= 2).filter(([, bucket]) => requiredTypes.length === 0 || requiredTypes.some((type) => bucket.types.has(type))).sort(([, a], [, b]) => {
    const scoreA = a.score + a.types.size * 35 + Math.min(a.count, 6) * 8;
    const scoreB = b.score + b.types.size * 35 + Math.min(b.count, 6) * 8;
    return scoreB - scoreA;
  })[0]?.[0];
}
function selectClusterAndNearbyCandidates(candidates, routeCluster) {
  const anchors = candidates.filter((poi) => poi.routeCluster === routeCluster);
  return candidates.filter(
    (poi) => poi.routeCluster === routeCluster || anchors.some((anchor) => hasCoordinate(anchor) && hasCoordinate(poi) && distanceKm2(anchor, poi) <= 8)
  );
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
  const requestedTypes = getRequestedReplacementTypes(event, targetPoi);
  const directReplacement = pois2.find(
    (poi) => replaceableIds.includes(poi.id) && !usedIds2.has(poi.id) && isNearEnoughForReplacement(poi, targetPoi) && matchesRequestedType(poi, requestedTypes)
  );
  if (directReplacement && matchesEvent(event, directReplacement)) return directReplacement;
  return pois2.filter((poi) => !usedIds2.has(poi.id)).filter((poi) => poi.fitPeople.includes(requirements.peopleType)).filter((poi) => poi.price <= Math.max(requirements.budgetMax, targetPoi.price + 40)).filter((poi) => matchesRequestedType(poi, requestedTypes) || !event.customPreference?.trim() && (poi.type === targetPoi.type || event.type === "rain")).filter((poi) => isNearEnoughForReplacement(poi, targetPoi)).filter((poi) => matchesEvent(event, poi)).sort((a, b) => {
    const sameClusterA = a.routeCluster && a.routeCluster === targetPoi.routeCluster ? 35 : 0;
    const sameClusterB = b.routeCluster && b.routeCluster === targetPoi.routeCluster ? 35 : 0;
    const sameDistrictA = a.businessDistrict === targetPoi.businessDistrict ? 20 : 0;
    const sameDistrictB = b.businessDistrict === targetPoi.businessDistrict ? 20 : 0;
    return sameClusterB + sameDistrictB + scorePoi(b, requirements) - (sameClusterA + sameDistrictA + scorePoi(a, requirements));
  })[0];
}
function getRequestedReplacementTypes(event, targetPoi) {
  const text = event.customPreference || event.message || "";
  const types = [];
  if (/室内.*(娱乐|玩|活动)|娱乐.*室内|电玩城|桌游|密室|KTV|电影|游戏|剧本/.test(text)) {
    types.push("\u4F11\u95F2\u5A31\u4E50");
  }
  if (/diy|DIY|手工|手作|陶艺|银饰|香薰|烘焙|画画|绘画/.test(text)) {
    types.push("\u6587\u5316\u4F53\u9A8C", "\u4F11\u95F2\u5A31\u4E50");
  }
  if (/展|美术馆|博物馆|艺术|文化|书店/.test(text)) {
    types.push("\u6587\u5316\u4F53\u9A8C");
  }
  if (/咖啡|奶茶|甜|饮|茶/.test(text)) {
    types.push("\u8F7B\u98DF\u751C\u996E");
  }
  if (/吃|饭|餐|火锅|烧烤|菜/.test(text)) {
    types.push("\u9910\u996E\u6B63\u9910");
  }
  if (/拍照|打卡|出片|地标|夜景/.test(text)) {
    types.push("\u62CD\u7167\u5730\u6807", "\u6587\u5316\u4F53\u9A8C");
  }
  if (/公园|散步|户外|徒步|citywalk/i.test(text)) {
    types.push("\u6237\u5916\u6563\u6B65");
  }
  return [...new Set(types.length > 0 ? types : [targetPoi.type])];
}
function matchesRequestedType(poi, requestedTypes) {
  return requestedTypes.length === 0 || requestedTypes.includes(poi.type);
}
function isNearEnoughForReplacement(candidate, targetPoi) {
  if (isFarDistance(candidate.distanceLevel)) return false;
  if (hasCoordinate(candidate) && hasCoordinate(targetPoi) && distanceKm2(candidate, targetPoi) <= 8) return true;
  if (targetPoi.routeCluster && candidate.routeCluster) return candidate.routeCluster === targetPoi.routeCluster;
  if (targetPoi.area && candidate.area) return candidate.area === targetPoi.area;
  return !hasCoordinate(candidate) || !hasCoordinate(targetPoi);
}
function isNearDistance(distanceLevel) {
  return distanceLevel === "3km\u5185" || distanceLevel === "3km\u4EE5\u5185" || distanceLevel === "near" || distanceLevel === "\u8FD1" || distanceLevel === "\u9644\u8FD1" || distanceLevel === "\u4E0D\u8981\u592A\u8FDC";
}
function isMediumDistance(distanceLevel) {
  return distanceLevel === "3-10km" || distanceLevel === "medium" || distanceLevel === "\u4E2D\u7B49" || !distanceLevel;
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
  if (event.type === "unavailable" || event.type === "closed") return poi.bookingRequired !== true || Boolean(poi.availableTools?.includes("bookingMock"));
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
function hasTooManySameCategoryIssue(issues) {
  return issues.some(
    (issue) => ["too_many_same_category", "too_many_food_drink", "too_many_drink"].includes(issue.code)
  );
}

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

// ../new-agent-a-module/src/planner/liveRoutePlanner.ts
var DEFAULT_TIMEOUT_MS = 15e3;
var AMAP_PLACE_URL = "https://restapi.amap.com/v3/place/text";
var LOW_VALUE_CHAIN_PATTERN = /瑞幸|luckin|星巴克|starbucks|麦当劳|肯德基|KFC|必胜客|汉堡王|蜜雪冰城|益禾堂|古茗|一点点|茶百道|奈雪|喜茶|霸王茶姬|CoCo|沪上阿姨|绝味鸭脖|正新鸡排|华莱士/i;
var DISTRICT_PATTERN = /([\u4e00-\u9fff]{2,6}(?:区|县|市))/g;
var DEFAULT_MODEL3 = "deepseek-v4-flash";
var DEFAULT_BASE_URL3 = "https://api.deepseek.com/v1";
async function buildLiveRoute(requirements, theme, options = {}) {
  return withTimeout(buildLiveRouteInner(requirements, theme, options), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
}
async function buildLiveRouteInner(requirements, theme, options) {
  const keywords = buildSearchKeywords(requirements, theme);
  const excludeIds = new Set(options.excludeIds ?? []);
  const results = await Promise.all(keywords.map((keyword) => searchAmap(keyword, requirements)));
  const allResults = [...results];
  const merged = uniquePois(allResults.flat());
  if (merged.length < 3 && requirements.district) {
    const fallbackKeywords = buildFallbackSearchKeywords(requirements);
    const fallbackResults = await Promise.all(fallbackKeywords.map((kw) => searchAmap(kw, requirements)));
    allResults.push(...fallbackResults);
  }
  const candidates = diversifyCandidates(uniquePois(allResults.flat()), requirements).filter((poi) => !excludeIds.has(poi.id)).slice(0, 48);
  const foodDrinkRatio = candidates.filter((p) => isFoodOrDrinkLike3(p)).length / Math.max(1, candidates.length);
  if (candidates.length >= 4 && foodDrinkRatio > 0.6 && requirements.district) {
    const balanceKeywords = buildBalancedSearchKeywords(requirements);
    const balanceResults = await Promise.all(balanceKeywords.map((kw) => searchAmap(kw, requirements)));
    const balanceCandidates = uniquePois(balanceResults.flat()).filter((poi) => !excludeIds.has(poi.id) && !isFoodOrDrinkLike3(poi));
    const existingIds = new Set(candidates.map((p) => p.id));
    for (const p of balanceCandidates) {
      if (!existingIds.has(p.id)) candidates.push(p);
    }
  }
  if (candidates.length < 2) return null;
  const route = ensureLiveRouteHasTargetStops(buildRoute(requirements, candidates, theme), candidates, requirements);
  if (route.steps.length < 2) return null;
  if (!isRouteGoodEnough(route)) {
    route.recommendationReasons = [
      "\u8FD9\u6B21\u4F18\u5148\u4F7F\u7528\u5B9E\u65F6\u5730\u70B9\u7ED3\u679C\u6765\u7EC4\u8DEF\u7EBF\uFF1B\u5982\u679C\u533A\u57DF\u6216\u9884\u7B97\u6BD4\u8F83\u7A84\uFF0C\u4F1A\u5148\u4FDD\u8BC1\u8DEF\u7EBF\u771F\u5B9E\u53EF\u53BB\u3001\u987A\u8DEF\u597D\u6267\u884C\u3002",
      ...(route.recommendationReasons ?? []).slice(0, 3)
    ];
  }
  await enrichRouteReasons(route, requirements, theme);
  return { route, candidates, keywords };
}
function ensureLiveRouteHasTargetStops(route, candidates, requirements) {
  const targetStops = requirements.durationHours <= 2.5 ? 3 : 4;
  if (route.steps.length >= targetStops) return route;
  const selected = rebalanceLiveSelectedStops([...route.steps], candidates, requirements);
  fillLiveSupplementStops(selected, candidates, requirements, targetStops, false);
  fillLiveSupplementStops(selected, candidates, requirements, targetStops, true);
  if (selected.length === route.steps.length) return route;
  const nextRoute = compactLiveRouteToWindow({
    ...route,
    steps: selected.map((step, index) => ({
      ...step,
      order: index + 1,
      role: inferLiveRouteRole(step.poi, index)
    }))
  }, requirements);
  nextRoute.totalMinutes = estimateRouteMinutes(nextRoute.steps);
  nextRoute.totalBudget = nextRoute.steps.reduce((sum, step) => sum + step.poi.price, 0);
  const quality = evaluateRouteQuality(nextRoute, requirements);
  nextRoute.qualityScore = quality.score;
  nextRoute.warnings = quality.warnings;
  nextRoute.debugReasons = [...route.debugReasons ?? [], ...quality.debugReasons, "live_route_extended_to_target"];
  nextRoute.qualityIssues = quality.issues;
  nextRoute.recommendationReasons = [
    `\u672C\u6B21\u4F18\u5148\u6392\u6210 ${nextRoute.steps.length} \u7AD9\uFF0C\u8BA9\u884C\u7A0B\u66F4\u5B8C\u6574\u3002`,
    ...route.recommendationReasons ?? []
  ].slice(0, 4);
  return nextRoute;
}
function fillLiveSupplementStops(selected, candidates, requirements, targetStops, allowFoodDrinkOverflow) {
  const maxMinutes = getDurationWindow(requirements).max;
  const rankedCandidates = [...candidates].sort((a, b) => scoreLiveSupplementCandidate(b, selected, requirements) - scoreLiveSupplementCandidate(a, selected, requirements));
  for (const candidate of rankedCandidates) {
    if (selected.length >= targetStops) break;
    if (selected.some((step) => step.poi.id === candidate.id || isSameLiveVenue(step.poi, candidate))) continue;
    if (!requirements.allowCrossDistrict && requirements.district && !matchesDistrictText5(candidate, requirements.district)) continue;
    if (wouldRepeatLowValueBrand(selected.map((step) => step.poi), candidate)) continue;
    if (!allowFoodDrinkOverflow && selected.length > 0) {
      const lastCat = selected.at(-1).poi.categoryKey || getCategoryKey(selected.at(-1).poi);
      const candCat = candidate.categoryKey || getCategoryKey(candidate);
      if (lastCat === candCat) continue;
    }
    if (!allowFoodDrinkOverflow && isFoodOrDrinkLike3(candidate) && selected.filter((step) => isFoodOrDrinkLike3(step.poi)).length >= 2) continue;
    const preview = [...selected, buildLiveSupplementStep(candidate, selected.length, targetStops)];
    if (!allowFoodDrinkOverflow && estimateRouteMinutes(preview) > maxMinutes + 45) continue;
    selected.push({
      ...preview.at(-1)
    });
  }
}
function buildLiveSupplementStep(candidate, index, targetStops) {
  return {
    order: index + 1,
    role: inferLiveRouteRole(candidate, index),
    templateRole: index >= targetStops - 1 ? "ending" : "support",
    poi: candidate,
    note: candidate.reason,
    roleReason: `\u300C${candidate.name}\u300D\u4F5C\u4E3A\u8865\u5145\u505C\u7559\u70B9\uFF0C\u8BA9\u8DEF\u7EBF\u63A5\u8FD1 ${targetStops} \u7AD9\u3002`
  };
}
function compactLiveRouteToWindow(route, requirements) {
  const maxMinutes = getDurationWindow(requirements).max;
  let steps = route.steps;
  let total = estimateRouteMinutes(steps);
  if (total <= maxMinutes) return route;
  steps = steps.map((step) => {
    if (total <= maxMinutes) return step;
    const minStay = getMinimumLiveStayMinutes(step.poi);
    const reducible = Math.max(0, step.poi.stayMinutes - minStay);
    const reduction = Math.min(reducible, total - maxMinutes);
    total -= reduction;
    return {
      ...step,
      poi: {
        ...step.poi,
        stayMinutes: step.poi.stayMinutes - reduction
      }
    };
  });
  return { ...route, steps };
}
function getMinimumLiveStayMinutes(poi) {
  if (poi.type === "\u9910\u996E\u6B63\u9910") return 45;
  if (poi.type === "\u8F7B\u98DF\u751C\u996E") return 20;
  if (poi.type === "\u4F11\u95F2\u5A31\u4E50") return 45;
  if (poi.type === "\u6587\u5316\u4F53\u9A8C") return 30;
  return 20;
}
function scoreLiveSupplementCandidate(candidate, selected, requirements) {
  let score = candidate.qualityScore ?? 50;
  const preview = [...selected, buildLiveSupplementStep(candidate, selected.length, 4)];
  const routeMinutes = estimateRouteMinutes(preview);
  const maxMinutes = getDurationWindow(requirements).max;
  score -= Math.max(0, routeMinutes - maxMinutes) * 0.8;
  if (requirements.district && matchesDistrictText5(candidate, requirements.district)) score += 20;
  if (!isFoodOrDrinkLike3(candidate)) score += 18;
  if (selected.some((step) => isSameLiveVenue(step.poi, candidate))) score -= 100;
  if (isFoodOrDrinkLike3(candidate) && selected.filter((step) => isFoodOrDrinkLike3(step.poi)).length >= 2) score -= 80;
  if (/万象城|COCO Park|cocopark|壹方城|海岸城|海雅缤纷|卓悦|领展|皇庭|KK one|KK ONE|万科里|万科广场|天虹|星河|宝能|益田|京基|茂业|华强北|九方/i.test(candidate.name)) score += 24;
  return score;
}
function rebalanceLiveSelectedStops(steps, candidates, requirements) {
  const result = [];
  for (const step of steps) {
    const foodDrinkCount = result.filter((item) => isFoodOrDrinkLike3(item.poi)).length;
    const shouldReplace = result.some((item) => isSameLiveVenue(item.poi, step.poi)) || isFoodOrDrinkLike3(step.poi) && foodDrinkCount >= 2;
    if (!shouldReplace) {
      result.push(step);
      continue;
    }
    const replacement = candidates.find(
      (candidate) => !isFoodOrDrinkLike3(candidate) && !result.some((item) => item.poi.id === candidate.id || isSameLiveVenue(item.poi, candidate)) && (!requirements.district || requirements.allowCrossDistrict || matchesDistrictText5(candidate, requirements.district))
    );
    result.push(replacement ? { ...step, poi: replacement, note: replacement.reason } : step);
  }
  return result;
}
function inferLiveRouteRole(poi, index) {
  if (poi.type === "\u9910\u996E\u6B63\u9910") return "meal";
  if (poi.type === "\u8F7B\u98DF\u751C\u996E") return "break";
  if (index >= 3) return "ending";
  return "activity";
}
function wouldRepeatLowValueBrand(existing, candidate) {
  const brand = getLowValueChainBrand2(`${candidate.name} ${candidate.type} ${candidate.subType}`);
  if (!brand) return false;
  return existing.some((poi) => {
    const existingBrand = getLowValueChainBrand2(`${poi.name} ${poi.type} ${poi.subType}`);
    return existingBrand?.toLowerCase() === brand.toLowerCase();
  });
}
function isFoodOrDrinkLike3(poi) {
  const text = `${poi.name} ${poi.type} ${poi.subType} ${poi.tags.join(" ")}`;
  return /餐饮正餐|轻食甜饮|咖啡|甜品|茶饮|奶茶|饮品|餐|饭|美食|小吃|火锅|烧烤|bistro|酒馆/i.test(text);
}
function isSameLiveVenue(left, right) {
  if (left.id === right.id) return true;
  const leftKey = getVenueNameKey2(left.name);
  const rightKey = getVenueNameKey2(right.name);
  if (leftKey.length >= 3 && rightKey.length >= 3 && (leftKey === rightKey || leftKey.includes(rightKey) || rightKey.includes(leftKey))) return true;
  return getVenueComplexKey(left.name) === getVenueComplexKey(right.name);
}
function getLowValueChainBrand2(text) {
  const brands = ["\u745E\u5E78", "luckin", "\u661F\u5DF4\u514B", "starbucks", "\u9EA6\u5F53\u52B3", "\u80AF\u5FB7\u57FA", "KFC", "\u5FC5\u80DC\u5BA2", "\u6C49\u5821\u738B", "\u871C\u96EA\u51B0\u57CE", "\u76CA\u79BE\u5802", "\u53E4\u8317", "\u4E00\u70B9\u70B9", "\u8336\u767E\u9053", "\u5948\u96EA", "\u559C\u8336", "\u9738\u738B\u8336\u59EC", "CoCo", "\u6CAA\u4E0A\u963F\u59E8", "\u7EDD\u5473\u9E2D\u8116", "\u6B63\u65B0\u9E21\u6392", "\u534E\u83B1\u58EB"];
  return brands.find((brand) => new RegExp(brand, "i").test(text));
}
function buildSearchKeywords(requirements, theme) {
  const district = normalizeDistrict2(requirements.district) ?? extractDistrict2(requirements.rawText);
  const areaPrefix = district ? `${district} ` : `${requirements.city || ""} `;
  const themeKeywords = {
    "\u5C0F\u4F17\u62CD\u7167\u5403\u8D27\u76D2": ["\u5C0F\u4F17\u5496\u5561", "\u62CD\u7167\u6253\u5361", "\u751C\u54C1\u5496\u5561", "\u521B\u610F\u9910\u5385", "\u827A\u672F\u7A7A\u95F4", "\u6587\u521B\u56ED", "\u672C\u5730\u5C0F\u5403", "\u591C\u5E02"],
    "\u591C\u666F\u5FAE\u91BA\u76D2": ["\u591C\u666F\u9910\u5385", "bistro", "\u7CBE\u917F\u9152\u9986", "\u7B80\u9910", "\u591C\u666F\u6253\u5361", "\u9732\u53F0\u9152\u5427", "livehouse", "\u6E05\u5427"],
    "\u96E8\u5929\u5BA4\u5185\u56DE\u8840\u76D2": ["\u8D2D\u7269\u4E2D\u5FC3", "\u5BC6\u5BA4\u9003\u8131", "\u7535\u5F71\u9662", "DIY\u624B\u5DE5", "\u5496\u5561\u9986", "\u5C55\u89C8", "\u684C\u6E38", "\u9676\u827A"],
    "\u4EB2\u5B50\u8F7B\u677E\u653E\u7535\u76D2": ["\u4EB2\u5B50\u4E50\u56ED", "\u513F\u7AE5\u4F53\u9A8C", "\u4EB2\u5B50\u9910\u5385", "\u5BA4\u5185\u6E38\u4E50\u573A", "\u516C\u56ED", "\u81EA\u7136\u6559\u80B2", "\u513F\u7AE5\u4E66\u5E97", "\u79D1\u5B66\u9986"],
    "\u57CE\u5E02\u6563\u6B65\u7597\u6108\u76D2": ["\u4E66\u5E97\u5496\u5561", "\u516C\u56ED\u6563\u6B65", "\u7F8E\u672F\u9986", "\u521B\u610F\u56ED", "citywalk", "\u6D77\u6EE8\u6808\u9053", "\u5B89\u9759\u5496\u5561", "\u7EFF\u9053"],
    "\u7701\u94B1\u5FEB\u4E50\u76D2": ["\u591C\u5E02", "\u7F8E\u98DF\u8857", "\u672C\u5730\u5C0F\u5403", "\u5E02\u96C6", "\u514D\u8D39\u516C\u56ED", "\u5E73\u4EF7\u7F8E\u98DF", "\u8001\u5B57\u53F7", "\u535A\u7269\u9986", "\u8857\u533A\u6563\u6B65"],
    "\u5468\u672B\u8F7B\u677E\u63A2\u7D22\u76D2": ["\u4F11\u95F2\u5A31\u4E50", "\u5496\u5561\u9986", "\u7F8E\u98DF", "\u62CD\u7167\u6253\u5361", "\u8D2D\u7269\u4E2D\u5FC3", "\u516C\u56ED", "\u8F7B\u4F53\u9A8C", "\u6563\u6B65"]
  };
  const fromTheme = themeKeywords[theme] ?? themeKeywords["\u5468\u672B\u8F7B\u677E\u63A2\u7D22\u76D2"];
  const fromPrefs = requirements.preferences.slice(0, 4).map((preference) => `${preference} \u5468\u672B`);
  const fromProfile = buildProfileKeywords(requirements);
  const fromPeople = buildPeopleKeywords(requirements);
  const fromBudget = buildBudgetKeywords(requirements);
  const mustHave = [
    ...fromProfile.slice(0, 3),
    ...fromTheme.slice(0, 4),
    ...fromPrefs,
    ...fromPeople.slice(0, 2),
    ...fromBudget.slice(0, 1)
  ];
  const weighted = [...mustHave, ...fromProfile, ...fromPeople, ...fromBudget, ...fromTheme];
  return [...new Set(weighted.map((keyword) => `${areaPrefix}${keyword}`))].slice(0, 12);
}
function buildFallbackSearchKeywords(requirements) {
  const district = normalizeDistrict2(requirements.district) ?? extractDistrict2(requirements.rawText);
  const areaPrefix = district ? `${district} ` : `${requirements.city || ""} `;
  const fallbacks = [
    "\u4F11\u95F2\u5A31\u4E50",
    "\u6563\u6B65",
    "\u516C\u56ED",
    "\u5496\u5561\u9986",
    "\u7F8E\u98DF",
    "\u8D2D\u7269\u4E2D\u5FC3",
    "\u521B\u610F\u56ED",
    "\u666F\u70B9",
    "\u7F51\u7EA2\u6253\u5361",
    "\u4E66\u5E97"
  ];
  if (requirements.peopleType === "\u4EB2\u5B50") fallbacks.push("\u4EB2\u5B50\u4E50\u56ED", "\u513F\u7AE5\u516C\u56ED");
  if (requirements.peopleType === "\u60C5\u4FA3") fallbacks.push("\u7EA6\u4F1A", "\u6C1B\u56F4");
  if (requirements.preferences.includes("\u62CD\u7167") || requirements.preferences.includes("\u5496\u5561")) fallbacks.push("\u62CD\u7167\u6253\u5361");
  return [...new Set(fallbacks.map((kw) => `${areaPrefix}${kw}`))].slice(0, 6);
}
function buildBalancedSearchKeywords(requirements) {
  const district = normalizeDistrict2(requirements.district) ?? extractDistrict2(requirements.rawText);
  const areaPrefix = district ? `${district} ` : `${requirements.city || ""} `;
  const keywords = [
    "\u516C\u56ED",
    "\u535A\u7269\u9986",
    "\u7F8E\u672F\u9986",
    "\u4E66\u5E97",
    "\u521B\u610F\u56ED",
    "\u5C55\u89C8",
    "\u6B65\u884C\u8857",
    "\u57CE\u5E02\u5E7F\u573A",
    "\u56FE\u4E66\u9986",
    "\u6587\u5316\u9986"
  ];
  if (requirements.peopleType === "\u4EB2\u5B50") keywords.push("\u513F\u7AE5\u516C\u56ED", "\u79D1\u5B66\u9986");
  if (requirements.peopleType === "\u60C5\u4FA3") keywords.push("\u591C\u666F", "\u7EA6\u4F1A\u5723\u5730");
  if (requirements.preferences.includes("\u62CD\u7167")) keywords.push("\u7F51\u7EA2\u6253\u5361", "\u5730\u6807");
  return [...new Set(keywords.map((kw) => `${areaPrefix}${kw}`))].slice(0, 5);
}
async function searchAmap(keyword, requirements) {
  const amapKey = process.env.AMAP_API_KEY || process.env.AMAP_WEB_SERVICE_KEY;
  if (!amapKey) {
    console.error("[AMap] API Key \u672A\u914D\u7F6E\uFF0C\u8BF7\u5728\u73AF\u5883\u53D8\u91CF\u4E2D\u8BBE\u7F6E AMAP_API_KEY \u6216 AMAP_WEB_SERVICE_KEY");
    return [];
  }
  const url = new URL(AMAP_PLACE_URL);
  url.searchParams.set("key", amapKey);
  url.searchParams.set("keywords", keyword);
  if (requirements.city) {
    url.searchParams.set("city", requirements.city);
    url.searchParams.set("citylimit", "true");
  } else if (requirements.currentLocation) {
    url.searchParams.set("location", `${requirements.currentLocation.lng},${requirements.currentLocation.lat}`);
    url.searchParams.set("sortrule", "distance");
  }
  url.searchParams.set("offset", "15");
  url.searchParams.set("page", "1");
  url.searchParams.set("extensions", "all");
  try {
    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), 6e3);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(fetchTimeout);
    if (!response.ok) return [];
    const data = await response.json();
    if (data.status !== "1" || !Array.isArray(data.pois)) return [];
    const mapped = data.pois.filter((item) => isUsableAmapPoi(item)).filter((item) => isNotLowValueChain(item, requirements)).map((item, index) => poiFromAmap(item, index, keyword, requirements)).filter((poi) => Boolean(poi)).filter((poi) => isPeopleAppropriatePoi(poi, requirements));
    const strict = mapped.filter((poi) => matchesGeoIntent(poi, requirements));
    const relaxed = mapped.filter((poi) => !strict.some((item) => item.id === poi.id) && matchesRelaxedGeoIntent(poi, requirements));
    return uniquePois([...strict, ...relaxed]);
  } catch {
    return [];
  }
}
function matchesGeoIntent(poi, requirements) {
  if (!requirements.district) return true;
  if (!requirements.allowCrossDistrict) return matchesDistrictText5(poi, requirements.district);
  return isPoiNearRequestedDistrict(poi, requirements.district, 18) || Boolean(requirements.currentLocation) && estimateTravelMinutesFromCurrentLocation(poi, requirements.currentLocation) <= 60;
}
function matchesRelaxedGeoIntent(poi, requirements) {
  if (!requirements.district) return true;
  if (matchesDistrictText5(poi, requirements.district)) return true;
  const nearbyKm = requirements.allowCrossDistrict ? 28 : 14;
  return isPoiNearRequestedDistrict(poi, requirements.district, nearbyKm) || Boolean(requirements.currentLocation) && estimateTravelMinutesFromCurrentLocation(poi, requirements.currentLocation) <= 75;
}
function matchesDistrictText5(poi, district) {
  const short = district.replace(/区$/, "");
  return [poi.area, poi.businessDistrict, poi.routeCluster, poi.address].filter(Boolean).some((value) => String(value).includes(short));
}
function isPeopleAppropriatePoi(poi, requirements) {
  const text = `${poi.name} ${poi.type} ${poi.subType} ${poi.tags.join(" ")} ${poi.reason}`;
  if (requirements.peopleType === "\u4EB2\u5B50") return true;
  return !/儿童乐园|亲子|儿童|早教|少儿|母婴/.test(text);
}
function isUsableAmapPoi(item) {
  const text = `${item.name || ""} ${item.type || ""}`;
  if (!item.name) return false;
  if (/节点$|NEXUS节点|导航点|途经点|定位点|打卡点$|集合点$|服务点$|入口$|出入口$|^出入口/.test(item.name)) return false;
  if (/烟草|香烟|雪茄|电子烟|烟酒|赌博/.test(text)) return false;
  if (/快餐|盒饭|便当|外卖|大排档|路边摊|小吃摊|食堂|饭堂|小档口|小炒/.test(text)) return false;
  if (/肠粉|米粉|米线|螺蛳粉|刀削面|热干面|炸酱面|包子|馒头|饺子馆|馄饨|粥店|卤味|卤肉|麻辣烫|冒菜|串串香/.test(text)) return false;
  if (/政府|派出所|停车场|收费站|公交站|地铁站|道路|路口|出入口|住宅|小区|写字楼|公寓|宿舍|医院|药房|诊所|学校|幼儿园|培训机构|驾校|维修|洗车|汽修|物流|仓库|中介|房产|殡仪|陵园/.test(text)) return false;
  if (/照相|摄影|写真|证件照|婚纱/.test(text) && !/汉服/.test(text)) return false;
  if (/快印|印刷|广告|图文/.test(text)) return false;
  if (/沙县小吃|兰州拉面|黄焖鸡|隆江猪脚饭|华莱士|正新鸡排|蜜雪冰城|益禾堂|古茗|一点点|绝味鸭脖|便利店/.test(text)) return false;
  if (/地名地址信息|道路附属设施|交通设施服务|政府机构/.test(text)) return false;
  return true;
}
function isNotLowValueChain(item, requirements) {
  const text = `${item.name || ""} ${item.type || ""}`;
  if (!LOW_VALUE_CHAIN_PATTERN.test(text)) return true;
  const explicitText = `${requirements.rawText} ${requirements.preferences.join(" ")} ${requirements.constraints.join(" ")}`;
  if (/(想去|要去|就去|指定|喜欢|可以|来杯).{0,12}(瑞幸|luckin|星巴克|starbucks|麦当劳|肯德基|KFC|必胜客|汉堡王|蜜雪冰城|益禾堂|古茗|一点点|茶百道|奈雪|喜茶|霸王茶姬|CoCo|沪上阿姨|绝味鸭脖|正新鸡排|华莱士)/i.test(explicitText)) {
    return true;
  }
  return false;
}
function poiFromAmap(item, index, keyword, requirements) {
  if (!item.name) return null;
  const [lng, lat] = parseLocation(item.location);
  const type = inferPoiType(item, keyword);
  const area = item.adname || normalizeDistrict2(requirements.district) || extractDistrict2(requirements.rawText) || requirements.city || "";
  const amapCategoryPath = item.type || void 0;
  const categorySegments = (item.type || "").split(";").filter(Boolean);
  const codeSegments = (item.typecode || "").split(";").filter(Boolean);
  const amapCategoryName = categorySegments.length > 1 ? categorySegments.at(-1) : void 0;
  const amapCategoryCode = codeSegments.length > 1 ? codeSegments.at(-1) : codeSegments[0] || void 0;
  const details = extractAmapPoiDetails(item);
  return normalizePoiForPlanning({
    id: `live_route_${item.id || `${Date.now()}_${index}`}`,
    name: item.name,
    type,
    subType: inferSubType(item, type),
    address: Array.isArray(item.address) ? item.address.join("") : item.address,
    area,
    businessDistrict: normalizeBusinessArea(item.business_area, area),
    routeCluster: `live:${area}`,
    price: simulatePrice(type, requirements),
    meituanRating: details.meituanRating,
    ratingSource: details.ratingSource,
    tags: buildTags(type, keyword, requirements),
    limits: buildLimits(type, keyword),
    fitPeople: buildFitPeople(type, keyword),
    stayMinutes: simulateStayMinutes(type),
    queueLevel: index % 4 === 0 ? "medium" : "low",
    distanceLevel: "3-10km",
    mockMeituanUrl: `mock://amap/${item.id || index}`,
    reason: buildFallbackReason(item, type, keyword, requirements),
    photoUrl: details.photoUrl,
    photoUrls: details.photoUrls,
    openTime: details.openTime,
    blindBoxThemes: requirements.blindBoxTheme ? [requirements.blindBoxTheme] : void 0,
    availableTools: ["amapPlaceSearch", "queueCheck", "availabilityCheck"],
    bookingRequired: false,
    weatherSensitive: !buildLimits(type, keyword).includes("\u5BA4\u5185"),
    priorityScore: buildPriorityScore(type, keyword, requirements, index),
    lat,
    lng,
    amapCategoryPath,
    amapCategoryName,
    amapCategoryCode
  }, requirements);
}
async function enrichRouteReasons(route, requirements, theme) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return;
  try {
    const descriptions = await withTimeout(
      askModelForPoiDescriptions(route, requirements, theme, apiKey),
      8e3
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
async function askModelForPoiDescriptions(route, requirements, theme, apiKey) {
  const baseUrl = process.env.OPENAI_BASE_URL || process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL3;
  const model = process.env.OPENAI_MODEL || process.env.DEEPSEEK_MODEL || DEFAULT_MODEL3;
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "\u4F60\u662F WeekendBuddy \u7684\u672C\u5730\u751F\u6D3B\u8DEF\u7EBF\u6587\u6848\u52A9\u624B\u3002",
            "\u8BF7\u57FA\u4E8E\u9AD8\u5FB7\u5730\u70B9\u68C0\u7D22\u7ED3\u679C\uFF0C\u4E3A\u6BCF\u4E2A POI \u5199\u4E00\u53E5\u9002\u5408\u5C55\u793A\u5728\u8DEF\u7EBF\u5361\u7247\u4E0A\u7684\u4E2D\u6587\u7B80\u4ECB\u3002",
            "\u53EA\u8FD4\u56DE\u4E25\u683C JSON\uFF0C\u5BF9\u8C61 key \u5FC5\u987B\u662F POI id\uFF0Cvalue \u662F 20-35 \u5B57\u4E2D\u6587\u7B80\u4ECB\u3002",
            "\u4E0D\u8981\u7F16\u9020\u5177\u4F53\u4F18\u60E0\u3001\u6392\u961F\u3001\u8BC4\u4EF7\u6392\u540D\u6216\u672A\u7ED9\u51FA\u7684\u4E8B\u5B9E\u3002",
            "\u7B80\u4ECB\u8981\u7ED3\u5408\u76F2\u76D2\u98CE\u683C\u3001\u5730\u70B9\u7C7B\u578B\u3001\u533A\u57DF\u548C\u7528\u6237\u504F\u597D\uFF0C\u8BF4\u660E\u4E3A\u4EC0\u4E48\u9002\u5408\u8FD9\u4E00\u7AD9\u3002"
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
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return {};
  const parsed = safeParseJson3(content);
  if (!parsed || typeof parsed !== "object") return {};
  return Object.fromEntries(
    Object.entries(parsed).filter(([, value]) => typeof value === "string" && value.trim().length > 0).map(([key, value]) => [key, String(value).trim()])
  );
}
function buildFallbackReason(item, type, keyword, requirements) {
  const area = item.adname || normalizeDistrict2(requirements.district) || extractDistrict2(requirements.rawText) || requirements.city || "";
  if (type === "\u8F7B\u98DF\u751C\u996E") return `${area}\u4E2D\u9014\u4F11\u606F\u7684\u5496\u5561\u751C\u70B9\u5E97\u3002`;
  if (type === "\u9910\u996E\u6B63\u9910") return `${area}\u7684\u9910\u996E\u9009\u62E9\u3002`;
  if (type === "\u6587\u5316\u4F53\u9A8C") return `${area}\u7684\u6587\u5316\u4F53\u9A8C\u70B9\uFF0C\u9002\u5408\u770B\u5C55\u3001\u901B\u4E66\u5E97\u6216\u624B\u4F5C\u4F53\u9A8C\u3002`;
  if (type === "\u6237\u5916\u6563\u6B65") return `${area}\u7684\u6563\u6B65\u597D\u53BB\u5904\u3002`;
  if (type === "\u62CD\u7167\u5730\u6807") return `${area}\u7684\u62CD\u7167\u6253\u5361\u70B9\u3002`;
  if (/电影|IMAX|影城/.test(item.name || item.type || keyword)) return `${area}\u7684\u5F71\u9662\uFF0C\u9002\u5408\u5BA4\u5185\u4F11\u95F2\u3002`;
  return `${area}\u7684\u4F11\u95F2\u53BB\u5904\u3002`;
}
function safeParseJson3(content) {
  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  }
}
function inferPoiType(item, keyword) {
  const placeText = `${item.type || ""} ${item.name || ""}`;
  const nameText = item.name || "";
  if (/酒吧|清吧|lounge|club|bistro|精酿|livehouse/i.test(placeText)) return "\u4F11\u95F2\u5A31\u4E50";
  if (/DIY|diy|手作|手工|陶艺|银饰|香薰|烘焙|画画|绘画|Tufting/i.test(placeText)) return "\u6587\u5316\u4F53\u9A8C";
  if (/咖啡|甜品|茶馆|茶室|奶茶|饮品|面包|下午茶/.test(nameText)) return "\u8F7B\u98DF\u751C\u996E";
  if (/餐饮|美食|饭|火锅|烧烤|餐厅|小吃|酒楼|素食|菜馆/.test(placeText)) return "\u9910\u996E\u6B63\u9910";
  if (/咖啡|甜品|茶|奶茶|饮品|面包/.test(placeText)) return "\u8F7B\u98DF\u751C\u996E";
  if (/展览|展馆|会展|展厅|美术馆|博物馆|书店|文化|手作|手工|DIY|diy|陶艺/.test(placeText)) return "\u6587\u5316\u4F53\u9A8C";
  if (/(?<!购物)公园|步道|绿地|海滨|散步|citywalk|体育中心|体育馆|体育场/i.test(placeText)) return "\u6237\u5916\u6563\u6B65";
  if (/娱乐|商场|乐园|电影|KTV|密室|桌游|电玩城|亲子|棋牌|台球|健身|电竞|网吧|网咖|足浴|按摩|洗浴|汗蒸|剧本杀|私人影院|轰趴|游泳|羽毛球|露营|采摘/.test(placeText)) return "\u4F11\u95F2\u5A31\u4E50";
  if (/拍照|打卡|地标|夜景|广场/.test(placeText)) return "\u62CD\u7167\u5730\u6807";
  return "\u4F11\u95F2\u5A31\u4E50";
}
function inferSubType(item, type) {
  const rawType = item.type?.split(";").at(-1);
  return rawType || type;
}
function simulatePrice(type, requirements) {
  const budgetFactor = requirements.budgetMax <= 150 ? 0.75 : requirements.budgetMax >= 350 ? 1.15 : 1;
  if (type === "\u9910\u996E\u6B63\u9910") return Math.round(90 * budgetFactor);
  if (type === "\u8F7B\u98DF\u751C\u996E") return Math.round(38 * budgetFactor);
  if (type === "\u4F11\u95F2\u5A31\u4E50") return Math.round(80 * budgetFactor);
  return 0;
}
function simulateStayMinutes(type) {
  if (type === "\u9910\u996E\u6B63\u9910") return 80;
  if (type === "\u8F7B\u98DF\u751C\u996E") return 45;
  if (type === "\u6587\u5316\u4F53\u9A8C") return 90;
  if (type === "\u4F11\u95F2\u5A31\u4E50") return 100;
  return 70;
}
function buildTags(type, keyword, requirements) {
  const tags = new Set(requirements.preferences.slice(0, 4));
  if (type === "\u9910\u996E\u6B63\u9910") tags.add("\u7F8E\u98DF");
  if (type === "\u8F7B\u98DF\u751C\u996E") tags.add(keyword.includes("\u5496\u5561") ? "\u5496\u5561" : "\u751C\u54C1");
  if (type === "\u6587\u5316\u4F53\u9A8C") tags.add("\u6587\u5316");
  if (type === "\u6237\u5916\u6563\u6B65") tags.add("\u6237\u5916");
  if (type === "\u4F11\u95F2\u5A31\u4E50") tags.add("\u89E3\u538B");
  if (/拍照|打卡/.test(keyword)) tags.add("\u62CD\u7167");
  if (/小众/.test(keyword)) tags.add("\u5C0F\u4F17");
  if (/海|滨海|栈道|沙滩/.test(keyword)) tags.add("\u770B\u6D77");
  if (/亲子|儿童|自然教育/.test(keyword)) tags.add("\u4EB2\u5B50");
  if (requirements.peopleType === "\u60C5\u4FA3") tags.add("\u6C1B\u56F4");
  if (requirements.peopleType === "\u670B\u53CB") tags.add("\u4E92\u52A8");
  if (requirements.peopleType === "\u5355\u4EBA") tags.add("\u5B89\u9759");
  return [...tags].slice(0, 6);
}
function buildLimits(type, keyword) {
  const limits = /* @__PURE__ */ new Set(["\u9884\u7B97\u53CB\u597D"]);
  if (/室内|商场|展览|咖啡|娱乐|书店|美术馆|博物馆/.test(keyword) || ["\u9910\u996E\u6B63\u9910", "\u8F7B\u98DF\u751C\u996E", "\u6587\u5316\u4F53\u9A8C", "\u4F11\u95F2\u5A31\u4E50"].includes(type)) {
    limits.add("\u5BA4\u5185");
    limits.add("\u96E8\u5929\u53EF\u53BB");
  } else {
    limits.add("\u5BA4\u5916");
  }
  return [...limits];
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
function extractDistrict2(text) {
  const match = text.match(DISTRICT_PATTERN);
  return match?.[0];
}
function normalizeDistrict2(value) {
  if (!value) return void 0;
  const match = value.match(DISTRICT_PATTERN);
  return match?.[0];
}
function buildPeopleKeywords(requirements) {
  if (requirements.peopleType === "\u4EB2\u5B50") return ["\u4EB2\u5B50", "\u513F\u7AE5\u53CB\u597D", "\u5C11\u8D70\u8DEF", "\u81EA\u7136\u6559\u80B2", "\u4EB2\u5B50\u9910\u5385"];
  if (requirements.peopleType === "\u60C5\u4FA3") return ["\u7EA6\u4F1A", "\u6C1B\u56F4\u611F", "\u62CD\u7167", "\u5B89\u9759\u5496\u5561", "\u591C\u666F"];
  if (requirements.peopleType === "\u670B\u53CB") return ["\u670B\u53CB\u805A\u4F1A", "\u4E92\u52A8\u4F53\u9A8C", "\u597D\u804A\u5929", "\u684C\u6E38", "\u672C\u5730\u5C0F\u5403"];
  return ["\u5B89\u9759", "\u4E66\u5E97\u5496\u5561", "\u4E00\u4E2A\u4EBA\u6563\u6B65", "\u7F8E\u672F\u9986", "\u516C\u56ED"];
}
function buildBudgetKeywords(requirements) {
  if (requirements.budgetMax <= 150) return ["\u591C\u5E02", "\u7F8E\u98DF\u8857", "\u672C\u5730\u5C0F\u5403", "\u5E73\u4EF7", "\u5E02\u96C6", "\u514D\u8D39", "\u535A\u7269\u9986"];
  if (requirements.budgetMax >= 350) return ["\u7279\u8272\u4F53\u9A8C", "\u7CBE\u81F4\u9910\u5385", "\u5C0F\u4F17", "\u624B\u4F5C", "\u9152\u9986"];
  return ["\u6027\u4EF7\u6BD4", "\u5496\u5561", "\u8F7B\u4F53\u9A8C", "\u5546\u5708"];
}
function buildProfileKeywords(requirements) {
  const profile = requirements.userProfile;
  if (!profile) return [];
  const positive = [
    ...(profile.favoritePoiNames ?? []).slice(0, 2),
    ...(profile.likedPoiTypes ?? []).slice(0, 3),
    ...(profile.likedTags ?? []).slice(0, 4),
    ...(profile.favoriteRouteThemes ?? []).slice(0, 2)
  ];
  const negative = /* @__PURE__ */ new Set([
    ...profile.dislikedPoiTypes ?? [],
    ...(profile.rejectedKeywords ?? []).map((keyword) => keyword.replace(/^少推荐/, ""))
  ]);
  const pace = profile.preferredRoutePace === "relaxed" ? ["\u8F7B\u677E", "\u5C11\u8D70\u8DEF", "\u597D\u804A\u5929"] : profile.preferredRoutePace === "packed" ? ["\u591A\u70B9\u4F4D", "\u8F7B\u4F53\u9A8C", "\u987A\u8DEF"] : [];
  return [.../* @__PURE__ */ new Set([...positive, ...pace])].filter((keyword) => keyword && !negative.has(keyword)).slice(0, 8);
}
function buildFitPeople(type, keyword) {
  if (/亲子|儿童|乐园|自然教育/.test(keyword)) return ["\u4EB2\u5B50", "\u670B\u53CB"];
  if (/酒|微醺|bistro|夜景/.test(keyword)) return ["\u5355\u4EBA", "\u60C5\u4FA3", "\u670B\u53CB"];
  if (type === "\u6237\u5916\u6563\u6B65" || type === "\u6587\u5316\u4F53\u9A8C" || type === "\u8F7B\u98DF\u751C\u996E") return ["\u5355\u4EBA", "\u60C5\u4FA3", "\u670B\u53CB", "\u4EB2\u5B50"];
  if (type === "\u9910\u996E\u6B63\u9910") return ["\u5355\u4EBA", "\u60C5\u4FA3", "\u670B\u53CB", "\u4EB2\u5B50"];
  return ["\u5355\u4EBA", "\u60C5\u4FA3", "\u670B\u53CB", "\u4EB2\u5B50"];
}
function buildPriorityScore(type, keyword, requirements, index) {
  let score = 82 - index;
  const profile = requirements.userProfile;
  if (requirements.budgetMax <= 150 && /免费|平价|公园|本地小吃|夜市|老字号|美食街/.test(keyword)) score += 10;
  if (requirements.peopleType === "\u4EB2\u5B50" && /亲子|儿童|公园|自然/.test(keyword)) score += 12;
  if (requirements.peopleType === "\u60C5\u4FA3" && /约会|氛围|夜景|拍照/.test(keyword)) score += 10;
  if (requirements.peopleType === "\u670B\u53CB" && /互动|聚会|体验|桌游|密室/.test(keyword)) score += 10;
  if (requirements.peopleType === "\u5355\u4EBA" && /安静|书店|咖啡|散步|公园/.test(keyword)) score += 10;
  if (type === "\u9910\u996E\u6B63\u9910" && requirements.budgetMax <= 150) score -= 6;
  if (profile?.likedPoiTypes?.includes(type)) score += 16;
  if (profile?.likedTags?.some((tag) => keyword.includes(tag))) score += 10;
  if (profile?.dislikedPoiTypes?.includes(type)) score -= 28;
  if (LOW_VALUE_CHAIN_PATTERN.test(keyword)) score -= 50;
  return score;
}
function diversifyCandidates(pois2, requirements) {
  const buckets = /* @__PURE__ */ new Map();
  for (const poi of pois2) {
    const key = `${poi.area || ""}:${poi.type}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(poi);
    buckets.set(key, bucket);
  }
  const salt = Date.now() + Math.round(Math.random() * 1e4);
  const rotatedBuckets = [...buckets.values()].map((bucket, bucketIndex) => {
    const offset = bucket.length ? (salt + bucketIndex + hashText(requirements.rawText)) % bucket.length : 0;
    return [...bucket.slice(offset), ...bucket.slice(0, offset)];
  });
  const interleaved = [];
  const maxLength = Math.max(...rotatedBuckets.map((bucket) => bucket.length), 0);
  for (let index = 0; index < maxLength; index += 1) {
    for (const bucket of rotatedBuckets) {
      const poi = bucket[index];
      if (poi) {
        interleaved.push({
          ...poi,
          priorityScore: (poi.priorityScore ?? 50) + Math.random() * 10
        });
      }
    }
  }
  return interleaved;
}
function hashText(text) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = hash * 31 + text.charCodeAt(index) >>> 0;
  }
  return hash;
}
function isRouteGoodEnough(route) {
  const steps = route.steps;
  if (steps.length < 2) return false;
  const venueKeys = steps.map((step) => getVenueNameKey2(step.poi.name)).filter((key) => key.length >= 3);
  if (new Set(venueKeys).size !== venueKeys.length) return false;
  if (steps.length >= 3) {
    const uniqueTypes = new Set(steps.map((step) => step.poi.type));
    if (uniqueTypes.size < Math.min(3, steps.length)) return false;
  }
  return true;
}
function uniquePois(pois2) {
  const seen = /* @__PURE__ */ new Set();
  return pois2.filter((poi) => {
    const keys = [
      poi.name.trim().toLowerCase(),
      getVenueNameKey2(poi.name)
    ].filter((key) => key.length >= 3);
    if (keys.some((key) => seen.has(key))) return false;
    keys.forEach((key) => seen.add(key));
    return true;
  });
}
function getVenueNameKey2(name) {
  return name.replace(/[（(].*?[）)]/g, "").replace(/旗舰店|总店|分店|东区|西区|南区|北区|一期|二期|三期|店|馆|体验|沉浸式|沉浸|实景|剧场|RPG|密室|咖啡|餐厅|书店|中心|购物|公园/gi, "").replace(/[·\s\-_/]/g, "").trim().toLowerCase();
}
async function withTimeout(promise, timeoutMs) {
  let timeout;
  try {
    return await Promise.race([
      promise,
      new Promise((resolve) => {
        timeout = setTimeout(() => resolve(null), timeoutMs);
      })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

// ../new-agent-a-module/src/planner/llmReplanPlanner.ts
var DEFAULT_MODEL4 = "deepseek-v4-flash";
var DEFAULT_BASE_URL4 = "https://api.deepseek.com/v1";
async function replanRouteWithLLM(event, currentRoute, pois2, requirements, config = {}) {
  const targetStep = findTargetStep2(event, currentRoute);
  if (!targetStep) return null;
  if (event.preferredReplacement && !event.customPreference?.trim()) {
    return buildExactReplacementResult(event, currentRoute, pois2, requirements, targetStep);
  }
  const candidates = await buildCandidatePool(event, targetStep, currentRoute, pois2, requirements);
  if (candidates.length === 0) return null;
  const apiKey = config.apiKey || getLlmApiKey2();
  if (!apiKey) {
    return buildLocalReplacementResult(event, currentRoute, requirements, targetStep, candidates[0], "\u5F53\u524D\u672A\u914D\u7F6E\u6A21\u578B Key\uFF0C\u5DF2\u6309\u8DDD\u79BB\u3001\u9884\u7B97\u548C\u7C7B\u578B\u672C\u5730\u9009\u62E9\u66FF\u4EE3\u70B9\u3002");
  }
  const baseUrl = config.baseUrl || getLlmBaseUrl2();
  const model = config.model || getLlmModel();
  const decision = await askModelForReplacement({
    apiKey,
    baseUrl,
    model,
    event,
    targetStep,
    currentRoute,
    requirements,
    candidates
  }).catch(() => null);
  if (!decision?.replacementPoiId) {
    return buildLocalReplacementResult(event, currentRoute, requirements, targetStep, candidates[0], "\u6A21\u578B\u6CA1\u6709\u8FD4\u56DE\u660E\u786E\u5019\u9009\uFF0C\u5DF2\u6309\u672C\u5730\u6392\u5E8F\u9009\u62E9\u6700\u5408\u9002\u7684\u66FF\u4EE3\u70B9\u3002");
  }
  const replacement = candidates.find((poi) => poi.id === decision.replacementPoiId);
  if (!replacement) {
    return buildLocalReplacementResult(event, currentRoute, requirements, targetStep, candidates[0], "\u6A21\u578B\u8FD4\u56DE\u7684\u5019\u9009\u4E0D\u5728\u5019\u9009\u6C60\u4E2D\uFF0C\u5DF2\u6309\u672C\u5730\u6392\u5E8F\u9009\u62E9\u66FF\u4EE3\u70B9\u3002");
  }
  const decisionReason = cleanReplacementReason(decision.reason, replacement.reason);
  const afterSteps = currentRoute.steps.map((step) => {
    if (step.poi.id !== targetStep.poi.id) return step;
    return {
      ...step,
      poi: replacement,
      note: `${decisionReason}\uFF08LLM Plan B \u66FF\u6362\uFF09`
    };
  });
  const afterRoute = summarizeRoute2(afterSteps, getRequestedReplacementTypes2(event, targetStep.poi));
  const changes = [{
    action: "replace",
    from: targetStep.poi.name,
    to: replacement.name,
    reason: decisionReason
  }];
  return {
    event,
    impact: decision.impact || `${targetStep.poi.name} \u5DF2\u6839\u636E\u7528\u6237\u9009\u62E9\u8FDB\u5165\u66FF\u6362\u5224\u65AD\u3002`,
    beforeRoute: currentRoute,
    afterRoute,
    changes,
    keptPreferences: requirements.preferences.slice(0, 3),
    sacrificed: [targetStep.poi.name],
    message: `LLM \u5DF2\u6839\u636E\u5F53\u524D\u8DEF\u7EBF\u548C\u5019\u9009\u6C60\uFF0C\u5C06\u300C${targetStep.poi.name}\u300D\u66FF\u6362\u4E3A\u300C${replacement.name}\u300D\u3002`
  };
}
function getLlmApiKey2() {
  return process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
}
function getLlmBaseUrl2() {
  return process.env.OPENAI_BASE_URL || process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL4;
}
function getLlmModel() {
  return process.env.OPENAI_MODEL || process.env.DEEPSEEK_MODEL || DEFAULT_MODEL4;
}
async function askModelForReplacement({
  apiKey,
  baseUrl,
  model,
  event,
  targetStep,
  currentRoute,
  requirements,
  candidates
}) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "\u4F60\u662F WeekendBuddy \u7684\u8DEF\u7EBF\u5FAE\u8C03 Agent\u3002",
            "\u4EFB\u52A1\uFF1A\u4ECE\u5019\u9009 POI \u4E2D\u9009\u62E9\u4E00\u4E2A\u6700\u9002\u5408\u66FF\u6362\u76EE\u6807\u8282\u70B9\u7684\u5730\u70B9\u3002",
            "\u5FC5\u987B\u53EA\u8FD4\u56DE\u4E25\u683C JSON\uFF0C\u4E0D\u8981\u8F93\u51FA\u89E3\u91CA\u3002",
            "JSON \u5B57\u6BB5\uFF1AreplacementPoiId, reason, impact\u3002",
            "replacementPoiId \u5FC5\u987B\u6765\u81EA\u5019\u9009 POI \u7684 id\uFF1B\u9664\u975E\u5019\u9009\u6C60\u4E3A\u7A7A\uFF0C\u5426\u5219\u5FC5\u987B\u9009\u62E9\u4E00\u4E2A\u6700\u53EF\u6267\u884C\u7684\u5019\u9009\uFF0C\u4E0D\u8981\u8FD4\u56DE\u7A7A\u5B57\u7B26\u4E32\u3002",
            "\u9009\u62E9\u4F18\u5148\u7EA7\uFF1A\u5148\u6EE1\u8DB3\u7528\u6237 message/customPreference \u7684\u660E\u786E\u8981\u6C42\uFF1B\u5176\u6B21\u9009\u79BB\u76EE\u6807\u8282\u70B9\u6216\u8DEF\u7EBF\u6700\u8FD1\u3001\u9884\u7B97\u63A5\u8FD1\u3001\u7C7B\u578B\u5408\u7406\u7684\u5730\u70B9\uFF1B\u5982\u679C\u6CA1\u6709\u5B8C\u7F8E\u540C\u7C7B\u70B9\uFF0C\u4E5F\u8981\u9009\u62E9\u9644\u8FD1\u53EF\u6267\u884C\u573A\u6240\u515C\u5E95\u3002",
            "\u5982\u679C customPreference \u5305\u542B\u201C\u641C\u7D22\u7C7B\u578B=\u9910\u996E\u6B63\u9910/\u8F7B\u98DF\u751C\u996E/\u4F11\u95F2\u5A31\u4E50/\u6587\u5316\u4F53\u9A8C/\u62CD\u7167\u5730\u6807/\u6237\u5916\u6563\u6B65\u201D\uFF0C\u5FC5\u987B\u4F18\u5148\u9009\u62E9\u8FD9\u4E2A\u7C7B\u578B\u3002",
            "\u5982\u679C\u7528\u6237\u660E\u786E\u8981\u201C\u73A9\u3001\u597D\u73A9\u3001\u5A31\u4E50\u3001\u4F53\u9A8C\u3001\u6D3B\u52A8\u201D\uFF0C\u4F18\u5148\u9009\u62E9\u4F11\u95F2\u5A31\u4E50\u3001\u6587\u5316\u4F53\u9A8C\u3001\u62CD\u7167\u5730\u6807\u6216\u6237\u5916\u6563\u6B65\uFF1B\u53EA\u6709\u5019\u9009\u6C60\u6CA1\u6709\u8FD9\u4E9B\u7C7B\u578B\u65F6\uFF0C\u624D\u7528\u9910\u996E/\u751C\u996E\u515C\u5E95\u3002",
            "\u5982\u679C\u7528\u6237\u660E\u786E\u8981\u201C\u805A\u9910\u3001\u6B63\u9910\u3001\u5403\u996D\u3001\u9910\u5385\u3001\u9910\u9986\u201D\uFF0C\u5FC5\u987B\u4F18\u5148\u9009\u62E9\u9910\u996E\u6B63\u9910\uFF1B\u53EA\u8981\u5019\u9009\u6C60\u6709\u9910\u996E\u6B63\u9910\uFF0C\u5C31\u4E0D\u8981\u9009\u62E9\u53F0\u7403\u5385\u3001\u684C\u6E38\u3001\u7535\u73A9\u57CE\u3001\u5546\u573A\u5A31\u4E50\u7B49\u73A9\u4E50\u70B9\u3002",
            "reason \u7528\u4E2D\u6587\u8BF4\u660E\u5019\u9009\u5730\u70B9\u672C\u8EAB\u6709\u4EC0\u4E48\u7279\u8272\uFF0C\u4EE5\u53CA\u4E3A\u4EC0\u4E48\u9002\u5408\u66FF\u6362\u76EE\u6807\u8282\u70B9\u3002",
            "reason \u4E0D\u8981\u590D\u8FF0\u7CFB\u7EDF\u89C4\u5219\u3001\u641C\u7D22\u6307\u4EE4\u3001API \u8C03\u7528\u8981\u6C42\u6216\u7528\u6237\u539F\u8BDD\uFF1B\u4E0D\u8981\u51FA\u73B0\u201C\u8BF7\u8054\u7F51\u201D\u201C\u9AD8\u5FB7 API\u201D\u201C\u4E0D\u8981\u8FD4\u56DE\u201D\u201C\u6309\u7167\u8DDD\u79BB\u201D\u7B49\u63D0\u793A\u8BCD\u3002",
            "impact \u7528\u4E2D\u6587\u8BF4\u660E\u5BF9\u8DEF\u7EBF\u7684\u5F71\u54CD\u3002"
          ].join("\n")
        },
        {
          role: "user",
          content: JSON.stringify({
            event,
            target: summarizeStep(targetStep),
            route: currentRoute.steps.map(summarizeStep),
            requirements,
            candidates: candidates.map(summarizePoi)
          })
        }
      ]
    })
  });
  if (!response.ok) {
    throw new Error(`LLM replan request failed: ${response.status}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  const parsed = safeParseJson4(content);
  if (!parsed || typeof parsed !== "object") return null;
  return parsed;
}
async function buildCandidatePool(event, targetStep, currentRoute, pois2, requirements) {
  const usedIds2 = new Set(currentRoute.steps.map((step) => step.poi.id));
  const directIds = targetStep.poi.replaceableBy ?? [];
  const requestedTypes = getRequestedReplacementTypes2(event, targetStep.poi);
  const routeCluster = inferRouteCluster(currentRoute);
  const routeArea = inferRouteArea(currentRoute);
  const requireIndoor = hasIndoorIntent2(event, requirements);
  const direct = pois2.filter((poi) => directIds.includes(poi.id) && !usedIds2.has(poi.id)).filter((poi) => matchesRequestedType2(poi, requestedTypes)).filter((poi) => matchesIndoorIntent(poi, requireIndoor)).filter((poi) => matchesRouteArea(poi, targetStep.poi, routeCluster, routeArea));
  const sameType = pois2.filter((poi) => !usedIds2.has(poi.id)).filter((poi) => matchesRequestedType2(poi, requestedTypes)).filter((poi) => matchesIndoorIntent(poi, requireIndoor)).filter((poi) => poi.fitPeople.includes(requirements.peopleType)).filter((poi) => poi.price <= Math.max(requirements.budgetMax, targetStep.poi.price + 80)).filter((poi) => matchesRouteArea(poi, targetStep.poi, routeCluster, routeArea)).filter((poi) => {
    if (isNearbyByCoordinate(poi, targetStep.poi, 8)) return true;
    if (targetStep.poi.routeCluster && poi.routeCluster) return poi.routeCluster === targetStep.poi.routeCluster;
    if (targetStep.poi.area && poi.area) return poi.area === targetStep.poi.area;
    return true;
  });
  const broad = pois2.filter((poi) => !usedIds2.has(poi.id)).filter((poi) => matchesRequestedType2(poi, requestedTypes)).filter((poi) => matchesIndoorIntent(poi, requireIndoor)).filter((poi) => poi.fitPeople.includes(requirements.peopleType)).filter((poi) => poi.price <= Math.max(requirements.budgetMax, targetStep.poi.price + 120)).filter((poi) => matchesRouteArea(poi, targetStep.poi, routeCluster, routeArea) || isNearbyByCoordinate(poi, targetStep.poi, 10));
  const nearbyFallback = pois2.filter((poi) => !usedIds2.has(poi.id)).filter((poi) => matchesIndoorIntent(poi, requireIndoor)).filter((poi) => poi.fitPeople.includes(requirements.peopleType)).filter((poi) => poi.price <= Math.max(requirements.budgetMax + 80, targetStep.poi.price + 160)).filter((poi) => matchesRouteArea(poi, targetStep.poi, routeCluster, routeArea) || isNearbyByCoordinate(poi, targetStep.poi, 12));
  const liveCandidates = await searchLivePoiCandidates(event, targetStep, requirements, currentRoute);
  const strictTypeMatch = shouldUseStrictTypeMatch(event, requestedTypes);
  const sortedCandidates = uniquePois2([...liveCandidates, ...direct, ...sameType, ...broad, ...nearbyFallback]).sort(
    (a, b) => scoreCandidateReplacement(b, targetStep.poi, requestedTypes, routeCluster, routeArea) - scoreCandidateReplacement(a, targetStep.poi, requestedTypes, routeCluster, routeArea)
  );
  const typeMatchedCandidates = sortedCandidates.filter((poi) => matchesRequestedType2(poi, requestedTypes));
  if (strictTypeMatch && typeMatchedCandidates.length > 0) {
    return typeMatchedCandidates.slice(0, 24);
  }
  return sortedCandidates.slice(0, 24);
}
async function searchLivePoiCandidates(event, targetStep, requirements, currentRoute) {
  const keywords = buildLiveSearchKeywords(event, targetStep, requirements);
  const amapKey = process.env.AMAP_API_KEY || process.env.AMAP_WEB_SERVICE_KEY;
  if (!amapKey) {
    console.error("[AMap] API Key \u672A\u914D\u7F6E\uFF0C\u8BF7\u5728\u73AF\u5883\u53D8\u91CF\u4E2D\u8BBE\u7F6E AMAP_API_KEY \u6216 AMAP_WEB_SERVICE_KEY");
    return [];
  }
  const usedIds2 = new Set(currentRoute.steps.map((step) => step.poi.id));
  const usedNames = new Set(currentRoute.steps.map((step) => normalizeName2(step.poi.name)));
  try {
    const results = [];
    for (const keyword of keywords) {
      results.push(await queryAmapText(amapKey, keyword, requirements));
      if (hasCoordinate2(targetStep.poi)) {
        results.push(await queryAmapAround(amapKey, keyword, targetStep.poi));
      }
    }
    const requestedTypes = getRequestedReplacementTypes2(event, targetStep.poi);
    const candidates = results.flat().filter((item) => isUsableAmapPoi2(item)).filter((item) => isPeopleAppropriateAmapPoi(item, requirements)).map((item, index) => poiFromAmap2(item, index, event, targetStep, requirements)).filter((poi) => Boolean(poi && poi.id !== targetStep.poi.id && poi.name !== targetStep.poi.name)).filter((poi) => !usedIds2.has(poi.id) && !usedNames.has(normalizeName2(poi.name)));
    const strictTypeMatch = shouldUseStrictTypeMatch(event, requestedTypes);
    const uniqueCandidates = uniquePois2(candidates);
    const matched = uniqueCandidates.filter((poi) => matchesRequestedType2(poi, requestedTypes));
    const fallback = uniqueCandidates.filter((poi) => !matchesRequestedType2(poi, requestedTypes));
    if (strictTypeMatch && matched.length > 0) return matched.slice(0, 18);
    return [...matched, ...fallback].slice(0, 18);
  } catch {
    return [];
  }
}
function isPeopleAppropriateAmapPoi(item, requirements) {
  const text = `${item.name || ""} ${item.type || ""}`;
  if (requirements.peopleType === "\u4EB2\u5B50") return true;
  return !/儿童乐园|亲子|儿童|早教|少儿|母婴/.test(text);
}
async function queryAmapText(amapKey, keyword, requirements) {
  return fetchAmapPois(buildAmapTextSearchUrl(amapKey, keyword, requirements));
}
function buildAmapTextSearchUrl(amapKey, keyword, requirements) {
  const url = new URL("https://restapi.amap.com/v3/place/text");
  url.searchParams.set("key", amapKey);
  url.searchParams.set("keywords", keyword);
  if (requirements.city?.trim()) {
    url.searchParams.set("city", requirements.city.trim());
    url.searchParams.set("citylimit", "true");
  }
  url.searchParams.set("offset", "10");
  url.searchParams.set("page", "1");
  url.searchParams.set("extensions", "all");
  return url;
}
async function queryAmapAround(amapKey, keyword, targetPoi) {
  const url = new URL("https://restapi.amap.com/v3/place/around");
  url.searchParams.set("key", amapKey);
  url.searchParams.set("keywords", keyword);
  url.searchParams.set("location", `${targetPoi.lng},${targetPoi.lat}`);
  url.searchParams.set("radius", "5000");
  url.searchParams.set("sortrule", "distance");
  url.searchParams.set("offset", "10");
  url.searchParams.set("page", "1");
  url.searchParams.set("extensions", "all");
  return fetchAmapPois(url);
}
async function fetchAmapPois(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`AMap search failed: ${response.status}`);
  const data = await response.json();
  if (data.status !== "1" || !Array.isArray(data.pois)) return [];
  return data.pois;
}
function buildLiveSearchKeywords(event, targetStep, requirements) {
  const prompt = event.customPreference?.trim();
  const area = requirements.district || targetStep.poi.area || targetStep.poi.businessDistrict || requirements.city;
  const explicitSearchType = getExplicitSearchType(event);
  const keywords = [];
  if (explicitSearchType === "\u9910\u996E\u6B63\u9910") {
    keywords.push(`${area} \u805A\u9910 \u9910\u5385 \u7F8E\u98DF`);
    keywords.push(`${area} \u6B63\u9910 \u9910\u5385 \u5C11\u6392\u961F`);
    keywords.push(`${area} \u7279\u8272\u9910\u5385 \u8001\u5B57\u53F7 \u672C\u5730\u7F8E\u98DF`);
  }
  if (explicitSearchType === "\u8F7B\u98DF\u751C\u996E") {
    keywords.push(`${area} \u5496\u5561 \u8336\u996E \u751C\u54C1 \u4E0B\u5348\u8336`);
    keywords.push(`${area} \u5B89\u9759 \u5496\u5561 \u751C\u54C1 \u8F7B\u98DF`);
  }
  if (explicitSearchType === "\u4F11\u95F2\u5A31\u4E50") {
    keywords.push(`${area} \u5BA4\u5185\u5A31\u4E50 \u5546\u573A \u684C\u6E38 \u5BC6\u5BA4 \u7535\u73A9\u57CE \u5F71\u9662`);
    keywords.push(`${area} \u4F11\u95F2\u5A31\u4E50 \u5468\u672B\u597D\u53BB\u5904`);
  }
  if (explicitSearchType === "\u6587\u5316\u4F53\u9A8C") {
    keywords.push(`${area} \u4E66\u5E97 \u827A\u672F\u7A7A\u95F4 \u5C55\u89C8 \u535A\u7269\u9986 \u7F8E\u672F\u9986 \u624B\u4F5C`);
    keywords.push(`${area} \u6587\u5316\u4F53\u9A8C \u5C0F\u4F17\u5C55\u89C8`);
  }
  if (explicitSearchType === "\u62CD\u7167\u5730\u6807") {
    keywords.push(`${area} \u62CD\u7167\u6253\u5361 \u827A\u672F\u7A7A\u95F4 \u5496\u5561 \u5546\u573A`);
    keywords.push(`${area} \u5730\u6807 \u591C\u666F \u6253\u5361`);
  }
  if (explicitSearchType === "\u6237\u5916\u6563\u6B65") {
    keywords.push(`${area} \u516C\u56ED \u7EFF\u9053 \u6D77\u8FB9 \u5E7F\u573A \u6563\u6B65`);
    keywords.push(`${area} citywalk \u5468\u672B\u597D\u53BB\u5904`);
  }
  if (prompt && /拍照|打卡|出片/.test(prompt)) keywords.push(`${area} \u62CD\u7167\u6253\u5361 \u827A\u672F\u7A7A\u95F4 \u5496\u5561 \u5546\u573A`);
  if (prompt && /聚餐|正餐|吃饭|吃个饭|餐厅|餐馆|火锅|烧烤|烤肉|粤菜|湘菜|川菜|料理|bistro/i.test(prompt)) {
    keywords.push(`${area} \u805A\u9910 \u9910\u5385 \u7F8E\u98DF`);
    keywords.push(`${area} \u6B63\u9910 \u9910\u5385 \u5C11\u6392\u961F`);
    keywords.push(`${area} \u7279\u8272\u9910\u5385 \u8001\u5B57\u53F7 \u672C\u5730\u7F8E\u98DF`);
  }
  if (prompt && /室内|下雨|雨天/.test(prompt) || hasIndoorIntent2(event, requirements)) keywords.push(`${area} \u5BA4\u5185 \u5A31\u4E50 \u5546\u573A \u5C55\u89C8 \u4E66\u5E97`);
  if (prompt && /玩|好玩|玩的地方|能玩的地方|吃喝玩乐|娱乐|体验|活动/.test(prompt)) {
    keywords.push(`${area} \u597D\u73A9 \u5BA4\u5185\u5A31\u4E50 \u5546\u573A \u684C\u6E38 \u5BC6\u5BA4 \u7535\u73A9\u57CE`);
    keywords.push(`${area} \u4F11\u95F2\u5A31\u4E50 \u5468\u672B\u597D\u53BB\u5904`);
    keywords.push(`${area} \u5403\u559D\u73A9\u4E50 \u5546\u573A \u7F8E\u98DF \u5A31\u4E50`);
  }
  if (prompt && /diy|DIY|手工|手作|陶艺|银饰|烘焙|画画/.test(prompt)) keywords.push(`${area} DIY\u624B\u5DE5 \u9676\u827A \u70D8\u7119`);
  if (prompt && /亲子|孩子|儿童/.test(prompt)) keywords.push(`${area} \u4EB2\u5B50 \u513F\u7AE5 \u4E50\u56ED \u516C\u56ED`);
  if (prompt && /省钱|便宜|平价|预算/.test(prompt)) keywords.push(`${area} \u514D\u8D39 \u5E73\u4EF7 \u672C\u5730\u5C0F\u5403 \u591C\u5E02`);
  if (prompt && /朋友|聚会|聊天|桌游|互动/.test(prompt) && !/聚餐|正餐|吃饭|餐厅|餐馆/.test(prompt)) keywords.push(`${area} \u670B\u53CB\u805A\u4F1A \u684C\u6E38 \u672C\u5730\u5C0F\u5403 \u4F11\u95F2\u5A31\u4E50`);
  if (prompt && /小吃|夜市|老字号|美食街|本地/.test(prompt)) keywords.push(`${area} \u672C\u5730\u5C0F\u5403 \u591C\u5E02 \u8001\u5B57\u53F7 \u7F8E\u98DF\u8857`);
  if (prompt && /安静|一个人|单人|书店|放空/.test(prompt)) keywords.push(`${area} \u5B89\u9759 \u4E66\u5E97 \u5496\u5561 \u516C\u56ED`);
  if (prompt && /夜景|微醺|酒|清吧|livehouse/i.test(prompt)) keywords.push(`${area} \u591C\u666F \u6E05\u5427 bistro \u7B80\u9910`);
  if (prompt && /看海|海边|栈道|沙滩/.test(prompt)) keywords.push(`${area} \u770B\u6D77 \u6D77\u6EE8\u6808\u9053 \u5496\u5561 \u516C\u56ED`);
  if (prompt) keywords.push(`${area} ${prompt}`);
  const corePreference = requirements.preferences[0] || targetStep.poi.type;
  keywords.push(`${area} ${corePreference} ${targetStep.poi.type}`);
  keywords.push(`${area} \u5468\u672B \u597D\u53BB\u5904`);
  keywords.push(`${targetStep.poi.businessDistrict || area} \u9644\u8FD1 ${targetStep.poi.type}`);
  return [...new Set(keywords)].slice(0, 5);
}
function isUsableAmapPoi2(item) {
  const text = `${item.name || ""} ${item.type || ""}`;
  if (!item.name) return false;
  if (/节点$|NEXUS节点|导航点|途经点|定位点|打卡点$|集合点$|服务点$|入口$|出入口$|^出入口/.test(item.name)) return false;
  if (/会所|棋牌|麻将|网吧|网咖|足浴|按摩|水疗|养生|电竞酒店|桌球游泳网泳|烟草|香烟|雪茄|电子烟|烟酒/.test(text)) return false;
  if (/政府|委员会|办事处|派出所|停车场|收费站|公交站|地铁站|道路|路口|出入口|住宅|小区|写字楼|公寓|宿舍|酒店|宾馆|旅馆|住宿|民宿|公司|银行|医院|药房|诊所|学校|培训|教育机构|幼儿园|托管|售楼|营销中心|产业园办公|工业园|物流|仓库|广告|印刷|图文|快印|复印|招牌|维修|装修|洗车|汽修|驾校|中介|房产|照相|摄影|婚纱|写真|证件照|儿童摄影|汉服体验|旅拍/.test(text)) return false;
  if (/沙县小吃|兰州拉面|黄焖鸡|隆江猪脚饭|华莱士|正新鸡排|蜜雪冰城|益禾堂|古茗|一点点|绝味鸭脖|便利店/.test(text)) return false;
  if (/地名地址信息|道路附属设施|交通设施服务|政府机构|公司企业|商务住宅|医疗保健服务|生活服务;摄影冲印店|生活服务;生活服务场所|科教文化服务;培训机构/.test(text)) return false;
  return /餐饮|购物|商场|娱乐|体育休闲|影剧院|风景名胜|科教文化|咖啡|茶艺|甜品|美术馆|博物馆|书店|公园|生活服务/.test(text);
}
function poiFromAmap2(item, index, event, targetStep, requirements) {
  if (!item.name) return null;
  const [lngText, latText] = (item.location || "").split(",");
  const lng = Number(lngText);
  const lat = Number(latText);
  const tags = inferLiveTags(event, targetStep, requirements);
  const type = inferPoiTypeFromAmap(item, event, targetStep);
  const details = extractAmapPoiDetails(item);
  return normalizePoiForPlanning({
    id: `live_amap_${item.id || index}`,
    name: item.name,
    type,
    subType: item.type?.split(";").at(-1) || targetStep.poi.subType || "\u5B9E\u65F6\u63A8\u8350",
    address: Array.isArray(item.address) ? item.address.join("") : item.address,
    area: item.adname || requirements.district || targetStep.poi.area || requirements.city,
    businessDistrict: item.business_area || targetStep.poi.businessDistrict || item.adname || requirements.city,
    routeCluster: targetStep.poi.routeCluster || inferRouteClusterFromPoi(targetStep.poi),
    price: Math.min(Math.max(30, targetStep.poi.price || 60), requirements.budgetMax),
    priceLevel: targetStep.poi.priceLevel,
    meituanRating: details.meituanRating,
    ratingSource: details.ratingSource,
    tags,
    limits: ["\u53EF\u5B9E\u65F6\u68C0\u7D22"],
    fitPeople: [requirements.peopleType],
    stayMinutes: targetStep.poi.stayMinutes,
    queueLevel: "low",
    distanceLevel: targetStep.poi.distanceLevel || "3-10km",
    mockMeituanUrl: `mock://amap/${item.id || index}`,
    reason: buildLiveReplacementReason(item, type, targetStep, requirements),
    photoUrl: details.photoUrl,
    photoUrls: details.photoUrls,
    openTime: details.openTime,
    blindBoxThemes: [requirements.preferences.includes("\u62CD\u7167") ? "\u5C0F\u4F17\u62CD\u7167\u5403\u8D27\u76D2" : "\u5468\u672B\u8F7B\u677E\u63A2\u7D22\u76D2"],
    availableTools: ["amapPlaceSearch", "queueCheck", "availabilityCheck"],
    bookingRequired: false,
    weatherSensitive: false,
    priorityScore: 86 - index,
    lat: Number.isFinite(lat) ? lat : void 0,
    lng: Number.isFinite(lng) ? lng : void 0
  }, requirements);
}
function buildLiveReplacementReason(item, type, targetStep, requirements) {
  const name = item.name || "\u8FD9\u4E2A\u5730\u70B9";
  const area = item.business_area || item.adname || targetStep.poi.businessDistrict || targetStep.poi.area || requirements.city || "\u9644\u8FD1";
  const subType = item.type?.split(";").at(-1);
  const address = Array.isArray(item.address) ? item.address.join("") : item.address;
  const locationText = address ? `${area}\u7684${subType || "\u771F\u5B9E\u5730\u70B9"}` : `${area}\u9644\u8FD1`;
  const targetName = targetStep.poi.name;
  if (type === "\u4F11\u95F2\u5A31\u4E50") {
    return `${name} \u662F${locationText}\uFF0C\u66F4\u9002\u5408\u8865\u4E0A\u53EF\u505C\u7559\u3001\u53EF\u4F53\u9A8C\u7684\u73A9\u4E50\u611F\uFF0C\u66FF\u6362\u300C${targetName}\u300D\u540E\u8DEF\u7EBF\u8FD8\u80FD\u7EE7\u7EED\u5728\u5468\u8FB9\u8854\u63A5\u3002`;
  }
  if (type === "\u9910\u996E\u6B63\u9910") {
    return `${name} \u662F${locationText}\uFF0C\u9002\u5408\u628A\u8FD9\u4E00\u7AD9\u6362\u6210\u5403\u996D\u4F11\u6574\u8282\u70B9\uFF0C\u8BA9\u540E\u7EED\u884C\u7A0B\u8282\u594F\u66F4\u7A33\u3002`;
  }
  if (type === "\u8F7B\u98DF\u751C\u996E") {
    return `${name} \u662F${locationText}\uFF0C\u9002\u5408\u4E2D\u9014\u5750\u4E0B\u559D\u70B9\u4E1C\u897F\u3001\u804A\u5929\u4F11\u606F\uFF0C\u66FF\u6362\u300C${targetName}\u300D\u4E0D\u4F1A\u6253\u65AD\u8DEF\u7EBF\u8282\u594F\u3002`;
  }
  if (type === "\u6587\u5316\u4F53\u9A8C") {
    return `${name} \u5E26\u6709${subType || "\u6587\u5316\u4F53\u9A8C"}\u5C5E\u6027\uFF0C\u6BD4\u666E\u901A\u8DEF\u8FC7\u70B9\u66F4\u6709\u505C\u7559\u7406\u7531\uFF0C\u9002\u5408\u66FF\u6362\u6210\u4E00\u7AD9\u6709\u5185\u5BB9\u7684\u4F53\u9A8C\u70B9\u3002`;
  }
  if (type === "\u6237\u5916\u6563\u6B65") {
    return `${name} \u4F4D\u4E8E${area}\uFF0C\u9002\u5408\u4F5C\u4E3A\u6563\u6B65\u3001\u770B\u666F\u6216\u6536\u5C3E\u8282\u70B9\uFF0C\u80FD\u8BA9\u8DEF\u7EBF\u4FDD\u6301\u8F7B\u677E\u8FDE\u8D2F\u3002`;
  }
  if (type === "\u62CD\u7167\u5730\u6807") {
    return `${name} \u4F4D\u4E8E${area}\uFF0C\u9002\u5408\u62CD\u7167\u6253\u5361\u548C\u77ED\u6682\u505C\u7559\uFF0C\u80FD\u628A\u8FD9\u4E00\u7AD9\u6362\u6210\u66F4\u6709\u8BB0\u5FC6\u70B9\u7684\u8282\u70B9\u3002`;
  }
  return `${name} \u662F${locationText}\uFF0C\u548C\u539F\u8DEF\u7EBF\u8DDD\u79BB\u3001\u9884\u7B97\u4E0E\u505C\u7559\u65F6\u957F\u66F4\u5BB9\u6613\u8854\u63A5\uFF0C\u9002\u5408\u4F5C\u4E3A\u8FD9\u4E00\u7AD9\u7684\u5B9E\u65F6\u66FF\u4EE3\u70B9\u3002`;
}
function cleanReplacementReason(reason, fallback) {
  const text = reason?.trim();
  if (!text) return fallback;
  if (/请联网|高德\s*API|用户要替换|原节点类型|不要返回|按照距离|系统规则|搜索指令|customPreference|message/.test(text)) {
    return fallback;
  }
  return text;
}
function getRequestedReplacementTypes2(event, targetPoi) {
  const text = event.customPreference || event.message || "";
  const explicitSearchType = getExplicitSearchType(event);
  if (explicitSearchType) return [explicitSearchType];
  const types = [];
  if (/室内.*(娱乐|玩|活动)|娱乐.*室内|电玩城|桌游|密室|KTV|电影|游戏|剧本/.test(text)) {
    types.push("\u4F11\u95F2\u5A31\u4E50");
  }
  if (/玩|好玩|玩的地方|能玩的地方|吃喝玩乐|娱乐|体验|活动/.test(text)) {
    types.push("\u4F11\u95F2\u5A31\u4E50", "\u6587\u5316\u4F53\u9A8C", "\u62CD\u7167\u5730\u6807");
  }
  if (/diy|DIY|手工|手作|陶艺|银饰|香薰|烘焙|画画|绘画/.test(text)) {
    types.push("\u6587\u5316\u4F53\u9A8C", "\u4F11\u95F2\u5A31\u4E50");
  }
  if (/展|美术馆|博物馆|艺术|文化|书店/.test(text)) {
    types.push("\u6587\u5316\u4F53\u9A8C");
  }
  if (/咖啡|奶茶|甜|饮|茶/.test(text)) {
    types.push("\u8F7B\u98DF\u751C\u996E");
  }
  if (/吃|饭|餐|火锅|烧烤|菜/.test(text)) {
    types.push("\u9910\u996E\u6B63\u9910");
  }
  if (/拍照|打卡|出片|地标|夜景/.test(text)) {
    types.push("\u62CD\u7167\u5730\u6807", "\u6587\u5316\u4F53\u9A8C");
  }
  if (/公园|散步|户外|徒步|citywalk/i.test(text)) {
    types.push("\u6237\u5916\u6563\u6B65");
  }
  return [...new Set(types.length > 0 ? types : [targetPoi.type])];
}
function shouldUseStrictTypeMatch(event, requestedTypes) {
  const text = event.customPreference || event.message || "";
  if (getExplicitSearchType(event)) return requestedTypes.length === 1;
  if (requestedTypes.length !== 1) return false;
  if (requestedTypes[0] === "\u9910\u996E\u6B63\u9910") {
    return /聚餐|正餐|吃饭|吃个饭|餐厅|餐馆|火锅|烧烤|烤肉|粤菜|湘菜|川菜|料理|bistro/i.test(text);
  }
  if (requestedTypes[0] === "\u8F7B\u98DF\u751C\u996E") {
    return /咖啡|奶茶|甜品|茶饮|饮品|下午茶/.test(text);
  }
  return false;
}
function getExplicitSearchType(event) {
  const text = event.customPreference || "";
  const match = text.match(/搜索类型\s*=\s*(餐饮正餐|轻食甜饮|休闲娱乐|文化体验|拍照地标|户外散步)/);
  return match?.[1];
}
function matchesRequestedType2(poi, requestedTypes) {
  return requestedTypes.length === 0 || requestedTypes.includes(poi.type);
}
function hasIndoorIntent2(event, requirements) {
  const text = [
    event.customPreference,
    event.message,
    requirements.rawText,
    ...requirements.preferences,
    ...requirements.constraints
  ].filter(Boolean).join(" ");
  return /室内|下雨|雨天/.test(text);
}
function matchesIndoorIntent(poi, requireIndoor) {
  if (!requireIndoor) return true;
  return poi.limits.includes("\u5BA4\u5185") || poi.limits.includes("\u96E8\u5929\u53EF\u53BB") || poi.weatherSensitive === false;
}
function inferRouteCluster(route) {
  const counts = /* @__PURE__ */ new Map();
  for (const step of route.steps) {
    if (!step.poi.routeCluster) continue;
    counts.set(step.poi.routeCluster, (counts.get(step.poi.routeCluster) ?? 0) + 1);
  }
  return [...counts.entries()].sort(([, a], [, b]) => b - a)[0]?.[0];
}
function inferRouteArea(route) {
  const counts = /* @__PURE__ */ new Map();
  for (const step of route.steps) {
    if (!step.poi.area) continue;
    counts.set(step.poi.area, (counts.get(step.poi.area) ?? 0) + 1);
  }
  return [...counts.entries()].sort(([, a], [, b]) => b - a)[0]?.[0];
}
function matchesRouteArea(poi, targetPoi, routeCluster, routeArea) {
  if (isNearbyByCoordinate(poi, targetPoi, 8)) return true;
  if (routeCluster && poi.routeCluster) return poi.routeCluster === routeCluster;
  if (routeArea && poi.area) return poi.area === routeArea;
  return true;
}
function scoreCandidateLocality(poi, routeCluster, routeArea) {
  let score = 0;
  if (routeArea && poi.area !== routeArea) score -= 3;
  if (routeCluster && poi.routeCluster === routeCluster) score += 40;
  if (routeArea && poi.area === routeArea) score += 20;
  if (poi.distanceLevel === "3km\u5185" || poi.distanceLevel === "3km\u4EE5\u5185" || poi.distanceLevel === "near" || poi.distanceLevel === "\u8FD1" || poi.distanceLevel === "\u9644\u8FD1") score += 10;
  if (poi.distanceLevel === "10km\u4EE5\u4E0A" || poi.distanceLevel === "far") score -= 30;
  return score;
}
function scoreCandidateReplacement(poi, targetPoi, requestedTypes, routeCluster, routeArea) {
  let score = scoreCandidateLocality(poi, routeCluster, routeArea);
  if (matchesRequestedType2(poi, requestedTypes)) score += 45;
  if (poi.type === targetPoi.type) score += 16;
  if (poi.queueLevel === "low") score += 8;
  if (poi.price <= Math.max(targetPoi.price + 80, 120)) score += 6;
  if (poi.availableTools?.includes("amapPlaceSearch")) score += 10;
  if (hasCoordinate2(poi) && hasCoordinate2(targetPoi)) {
    const km = distanceKm3(poi, targetPoi);
    if (km <= 1.5) score += 36;
    else if (km <= 3) score += 28;
    else if (km <= 5) score += 18;
    else if (km <= 8) score += 8;
    else score -= Math.min(35, km * 2);
  }
  return score;
}
function isNearbyByCoordinate(a, b, maxKm) {
  if (!hasCoordinate2(a) || !hasCoordinate2(b)) return false;
  return distanceKm3(a, b) <= maxKm;
}
function inferRouteClusterFromPoi(poi) {
  return poi.routeCluster || poi.businessDistrict || poi.area;
}
function inferPoiType2(event, targetStep) {
  const text = event.customPreference || "";
  const explicitSearchType = getExplicitSearchType(event);
  if (explicitSearchType) return explicitSearchType;
  if (/玩|好玩|玩的地方|能玩的地方|娱乐|活动|电玩城|桌游|密室|KTV|电影|游戏|剧本/.test(text)) return "\u4F11\u95F2\u5A31\u4E50";
  if (/咖啡|奶茶|甜|饮|茶/.test(text)) return "\u8F7B\u98DF\u751C\u996E";
  if (/吃|饭|餐|火锅|烧烤|菜/.test(text)) return "\u9910\u996E\u6B63\u9910";
  if (/展|书|文化|美术|博物/.test(text)) return "\u6587\u5316\u4F53\u9A8C";
  if (/拍|打卡|地标|夜景/.test(text)) return "\u62CD\u7167\u5730\u6807";
  if (/公园|散步|户外|citywalk/i.test(text)) return "\u6237\u5916\u6563\u6B65";
  return targetStep.poi.type;
}
function inferPoiTypeFromAmap(item, event, targetStep) {
  const explicitType = inferPoiType2(event, targetStep);
  const text = `${item.name || ""} ${item.type || ""}`;
  if (/餐饮|中餐|西餐|火锅|烧烤|小吃|快餐|餐厅|酒楼|素食|菜馆|bistro/i.test(text)) return "\u9910\u996E\u6B63\u9910";
  if (/咖啡|茶艺|甜品|面包|饮品|奶茶/.test(text)) return "\u8F7B\u98DF\u751C\u996E";
  if (/美术馆|博物馆|书店|展览|艺术|文化|科教文化/.test(text)) return "\u6587\u5316\u4F53\u9A8C";
  if (/公园|风景名胜|海滨|绿道|广场|景点/.test(text)) return "\u6237\u5916\u6563\u6B65";
  if (/商场|购物中心|影剧院|电影院|娱乐|休闲|体育/.test(text)) return "\u4F11\u95F2\u5A31\u4E50";
  if (getExplicitSearchType(event)) return explicitType;
  return explicitType;
}
function inferLiveTags(event, targetStep, requirements) {
  const text = event.customPreference || "";
  const tags = /* @__PURE__ */ new Set([...requirements.preferences, ...targetStep.poi.tags.slice(0, 2)]);
  if (/拍|打卡|出片/.test(text)) tags.add("\u62CD\u7167");
  if (/小众|特别|新/.test(text)) tags.add("\u5C0F\u4F17");
  if (/不排队|少排队|快/.test(text)) tags.add("\u4E0D\u6613\u6392\u961F");
  if (/室内|下雨/.test(text)) tags.add("\u5BA4\u5185");
  if (/咖啡/.test(text)) tags.add("\u5496\u5561");
  if (/吃|餐|美食/.test(text)) tags.add("\u7F8E\u98DF");
  return [...tags].slice(0, 6);
}
function buildExactReplacementResult(event, currentRoute, pois2, requirements, targetStep) {
  const replacement = resolvePreferredReplacement2(event, pois2, requirements);
  if (!replacement) return null;
  const reason = event.preferredReplacement?.reason || `${replacement.name} \u662F\u7528\u6237\u9009\u4E2D\u7684\u66FF\u4EE3\u8282\u70B9\uFF0C\u5DF2\u6309\u9009\u62E9\u66F4\u65B0\u8DEF\u7EBF\u3002`;
  const afterSteps = currentRoute.steps.map((step) => {
    if (step.poi.id !== targetStep.poi.id) return step;
    return {
      ...step,
      poi: replacement,
      note: `${reason}\uFF08\u7528\u6237\u786E\u8BA4\u66FF\u6362\uFF09`
    };
  });
  const afterRoute = summarizeRoute2(afterSteps, getRequestedReplacementTypes2(event, targetStep.poi));
  const changes = [{
    action: "replace",
    from: targetStep.poi.name,
    to: replacement.name,
    reason
  }];
  return {
    event,
    impact: `\u5DF2\u6309\u4F60\u7684\u9009\u62E9\uFF0C\u5C06\u300C${targetStep.poi.name}\u300D\u66FF\u6362\u4E3A\u300C${replacement.name}\u300D\u3002`,
    beforeRoute: currentRoute,
    afterRoute,
    changes,
    keptPreferences: requirements.preferences.slice(0, 3),
    sacrificed: [targetStep.poi.name],
    message: `\u5DF2\u6309\u7528\u6237\u70B9\u9009\u7ED3\u679C\uFF0C\u5C06\u300C${targetStep.poi.name}\u300D\u66FF\u6362\u4E3A\u300C${replacement.name}\u300D\u3002`
  };
}
function buildLocalReplacementResult(event, currentRoute, requirements, targetStep, replacement, fallbackReason) {
  const afterSteps = currentRoute.steps.map((step) => {
    if (step.poi.id !== targetStep.poi.id) return step;
    return {
      ...step,
      poi: replacement,
      note: `${replacement.reason}\uFF08\u672C\u5730 Plan B \u66FF\u6362\uFF09`
    };
  });
  const afterRoute = summarizeRoute2(afterSteps, getRequestedReplacementTypes2(event, targetStep.poi));
  const reason = `${replacement.name} \u66F4\u7B26\u5408\u5F53\u524D\u66FF\u6362\u65B9\u5411\uFF0C\u4E14\u4E0E\u539F\u8DEF\u7EBF\u8DDD\u79BB\u548C\u9884\u7B97\u66F4\u5BB9\u6613\u8854\u63A5\u3002`;
  return {
    event,
    impact: fallbackReason,
    beforeRoute: currentRoute,
    afterRoute,
    changes: [{
      action: "replace",
      from: targetStep.poi.name,
      to: replacement.name,
      reason
    }],
    keptPreferences: requirements.preferences.slice(0, 3),
    sacrificed: [targetStep.poi.name],
    message: `\u5DF2\u5C06\u300C${targetStep.poi.name}\u300D\u66FF\u6362\u4E3A\u300C${replacement.name}\u300D\u3002`
  };
}
function resolvePreferredReplacement2(event, pois2, requirements) {
  const preferred = event.preferredReplacement;
  if (!preferred?.name) return null;
  const normalizedName = normalizeName2(preferred.name);
  const matchedPoi = pois2.find(
    (poi) => normalizeName2(poi.name) === normalizedName || normalizeName2(poi.name).includes(normalizedName) || normalizedName.includes(normalizeName2(poi.name))
  );
  if (matchedPoi) return matchedPoi;
  return {
    id: preferred.id || `manual-${Date.now()}`,
    name: preferred.name,
    type: preferred.type || "\u4F11\u95F2\u5A31\u4E50",
    subType: preferred.subType || preferred.type || "\u7528\u6237\u9009\u62E9",
    area: preferred.area,
    businessDistrict: preferred.businessDistrict || preferred.area || requirements.city,
    price: preferred.price ?? 0,
    meituanRating: 4.6,
    reviewCount: 1200,
    tags: preferred.tags ?? [],
    limits: [],
    fitPeople: [requirements.peopleType],
    stayMinutes: preferred.stayMinutes ?? 60,
    queueLevel: "low",
    distanceLevel: "medium",
    reason: preferred.reason || `${preferred.name} \u662F\u7528\u6237\u786E\u8BA4\u9009\u62E9\u7684\u66FF\u4EE3\u8282\u70B9\u3002`,
    weatherSensitive: false
  };
}
function normalizeName2(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "");
}
function findTargetStep2(event, currentRoute) {
  if (event.poiId) return currentRoute.steps.find((step) => step.poi.id === event.poiId);
  return currentRoute.steps.at(-1);
}
function summarizeRoute2(steps, preferredFirstTypes = []) {
  const orderedSteps = orderStepsSpatially2(steps, preferredFirstTypes);
  return {
    totalMinutes: estimateRouteMinutes(orderedSteps),
    totalBudget: orderedSteps.reduce((sum, step) => sum + step.poi.price, 0),
    steps: orderedSteps.map((step, index) => ({
      ...step,
      order: index + 1,
      role: inferRole2(step.poi, index)
    }))
  };
}
function orderStepsSpatially2(steps, preferredFirstTypes = []) {
  if (steps.length < 3 || steps.length > 5) return steps;
  if (steps.some((step) => !hasCoordinate2(step.poi))) return steps;
  const permutations = permute2(steps);
  return permutations.map((candidate) => ({
    candidate,
    score: scoreRouteOrder2(candidate, preferredFirstTypes)
  })).sort((a, b) => a.score - b.score)[0]?.candidate ?? steps;
}
function inferRole2(poi, index) {
  if (poi.type === "\u9910\u996E\u6B63\u9910") return "meal";
  if (poi.type === "\u8F7B\u98DF\u751C\u996E") return "break";
  if (index >= 3) return "ending";
  return "activity";
}
function hasCoordinate2(poi) {
  return typeof poi.lat === "number" && typeof poi.lng === "number";
}
function scoreRouteOrder2(steps, preferredFirstTypes = []) {
  const pathDistance = steps.slice(1).reduce((sum, step, index) => {
    return sum + distanceKm3(steps[index].poi, step.poi);
  }, 0);
  const startEndDistance = distanceKm3(steps[0].poi, steps.at(-1).poi);
  const rolePenalty = scoreRoleOrderPenalty2(steps, preferredFirstTypes);
  const backtrackPenalty = scoreBacktrackPenalty2(steps);
  return pathDistance - startEndDistance * 0.45 + rolePenalty + backtrackPenalty;
}
function scoreRoleOrderPenalty2(steps, preferredFirstTypes = []) {
  let penalty = 0;
  const first = steps[0]?.poi;
  const last = steps.at(-1)?.poi;
  if (preferredFirstTypes.length > 0 && first && !preferredFirstTypes.includes(first.type)) penalty += 100;
  if (first?.type === "\u9910\u996E\u6B63\u9910" || first?.type === "\u8F7B\u98DF\u751C\u996E") penalty += 2.5;
  if (last?.type === "\u9910\u996E\u6B63\u9910") penalty += 1.2;
  const mealIndex = steps.findIndex((step) => step.poi.type === "\u9910\u996E\u6B63\u9910");
  const breakIndex = steps.findIndex((step) => step.poi.type === "\u8F7B\u98DF\u751C\u996E");
  if (mealIndex >= 0 && breakIndex >= 0 && mealIndex < breakIndex) penalty += 0.8;
  return penalty;
}
function scoreBacktrackPenalty2(steps) {
  let penalty = 0;
  for (let i = 2; i < steps.length; i += 1) {
    const prevPrev = steps[i - 2].poi;
    const current = steps[i].poi;
    const skippedDistance = distanceKm3(prevPrev, current);
    const viaDistance = distanceKm3(prevPrev, steps[i - 1].poi) + distanceKm3(steps[i - 1].poi, current);
    if (skippedDistance > 0 && viaDistance / skippedDistance > 2.2) {
      penalty += 1.5;
    }
  }
  return penalty;
}
function distanceKm3(a, b) {
  if (!hasCoordinate2(a) || !hasCoordinate2(b)) return 0;
  const earthRadiusKm = 6371;
  const dLat = toRadians3(b.lat - a.lat);
  const dLng = toRadians3(b.lng - a.lng);
  const lat1 = toRadians3(a.lat);
  const lat2 = toRadians3(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(h)));
}
function toRadians3(value) {
  return value * Math.PI / 180;
}
function permute2(items) {
  if (items.length <= 1) return [items];
  return items.flatMap((item, index) => {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    return permute2(rest).map((candidate) => [item, ...candidate]);
  });
}
function summarizeStep(step) {
  return {
    order: step.order,
    role: step.role,
    note: step.note,
    poi: summarizePoi(step.poi)
  };
}
function summarizePoi(poi) {
  return {
    id: poi.id,
    name: poi.name,
    type: poi.type,
    subType: poi.subType,
    businessDistrict: poi.businessDistrict,
    routeCluster: poi.routeCluster,
    price: poi.price,
    rating: poi.meituanRating,
    tags: poi.tags,
    limits: poi.limits,
    fitPeople: poi.fitPeople,
    stayMinutes: poi.stayMinutes,
    queueLevel: poi.queueLevel,
    distanceLevel: poi.distanceLevel,
    reason: poi.reason,
    weatherSensitive: poi.weatherSensitive
  };
}
function uniquePois2(pois2) {
  const seen = /* @__PURE__ */ new Set();
  return pois2.filter((poi) => {
    if (seen.has(poi.id)) return false;
    seen.add(poi.id);
    return true;
  });
}
function safeParseJson4(content) {
  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  }
}

// ../new-agent-a-module/src/tools/checkAvailability.ts
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

// ../new-agent-a-module/src/tools/checkQueue.ts
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

// ../new-agent-a-module/src/agent/orchestrator.ts
function isShenzhenCity(city) {
  return city.replace(/市$/, "").trim() === "\u6DF1\u5733";
}
function assertLiveRouteOrLocalFallback(liveResult, requirements) {
  if (liveResult || isShenzhenCity(requirements.city)) return;
  const location = requirements.city.trim();
  if (!location) throw new Error("\u8BF7\u5148\u9009\u62E9\u57CE\u5E02\uFF0C\u518D\u751F\u6210\u771F\u5B9E\u8DEF\u7EBF\u3002");
  throw new Error(`\u6682\u65F6\u65E0\u6CD5\u5728${location}\u751F\u6210\u771F\u5B9E\u8DEF\u7EBF\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u6216\u66F4\u6362\u533A\u57DF\u3002`);
}
async function handleReplan(event, currentPlan, options = {}) {
  const pois2 = options.pois ?? mockPois;
  if (event.type === "reroll") {
    return handleReroll(event, currentPlan, pois2, options.llm);
  }
  let planB = null;
  try {
    planB = await replanRouteWithLLM(event, currentPlan.route, pois2, currentPlan.requirements, options.llm);
  } catch {
    planB = null;
  }
  if (!planB) {
    planB = replanRoute(event, currentPlan.route, pois2, currentPlan.requirements);
  }
  const [queueResults, availabilityResults] = await Promise.all([
    checkQueue(planB.afterRoute),
    checkAvailability(planB.afterRoute)
  ]);
  const toolStatus = [...queueResults, ...availabilityResults];
  const blindBox = await personalizeBlindBoxCopy(
    composeBlindBox(
      currentPlan.blindBox.theme,
      planB.afterRoute,
      currentPlan.requirements,
      toolStatus
    ),
    currentPlan.requirements,
    planB.afterRoute,
    options.llm
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
async function handleReroll(event, currentPlan, pois2, llm) {
  const requirements = await refineRerollRequirements(event, currentPlan);
  const theme = selectBlindBoxTheme(requirements);
  const liveResult = await buildLiveRoute(requirements, theme, {
    excludeIds: currentPlan.route.steps.map((step) => step.poi.id),
    timeoutMs: 8e3
  });
  assertLiveRouteOrLocalFallback(liveResult, requirements);
  const route = liveResult?.route ?? rerollRoute(requirements, currentPlan.route, pois2, theme);
  const [queueResults, availabilityResults] = await Promise.all([
    checkQueue(route),
    checkAvailability(route)
  ]);
  const toolStatus = [
    buildLiveRouteToolStatus(liveResult, requirements.blindBoxTheme),
    ...queueResults,
    ...availabilityResults
  ];
  const blindBox = await personalizeBlindBoxCopy(
    composeBlindBox(theme, route, requirements, toolStatus),
    requirements,
    route,
    llm
  );
  const planB = buildRerollResult(event, currentPlan, route, requirements);
  return {
    ...currentPlan,
    requirements,
    blindBox,
    route,
    toolStatus,
    executionTasks: [],
    planB
  };
}
function buildLiveRouteToolStatus(liveResult, selectedTheme) {
  return {
    toolName: "amapLiveRouteSearch",
    status: liveResult ? "success" : "failed",
    message: liveResult ? `\u5DF2\u6309${selectedTheme || "\u672C\u6B21\u98CE\u683C"}\u627E\u5230 ${liveResult.candidates.length} \u4E2A\u5019\u9009\u70B9\u3002` : "\u5B9E\u65F6\u5730\u70B9\u68C0\u7D22\u8D85\u65F6\u6216\u5019\u9009\u4E0D\u8DB3\uFF0C\u5DF2\u5148\u7528\u672C\u5730\u5730\u70B9\u5E93\u751F\u6210\u53EF\u6D4B\u8BD5\u8DEF\u7EBF\u3002",
    result: liveResult ? {
      keywords: liveResult.keywords,
      candidateCount: liveResult.candidates.length,
      routeNames: liveResult.route.steps.map((step) => step.poi.name)
    } : void 0
  };
}
async function refineRerollRequirements(event, currentPlan) {
  const previousNames = currentPlan.route.steps.map((step) => step.poi.name).join("\u3001");
  const rerollText = [
    currentPlan.requirements.rawText,
    event.message,
    event.customPreference,
    previousNames ? `\u907F\u5F00\u5F53\u524D\u8DEF\u7EBF\u91CC\u7684\u8FD9\u4E9B\u5730\u70B9\uFF1A${previousNames}` : ""
  ].filter(Boolean).join("\uFF1B");
  try {
    return await parseIntent({
      rawText: rerollText,
      quickSelections: {
        city: currentPlan.requirements.city,
        district: currentPlan.requirements.district,
        durationHours: currentPlan.requirements.durationHours,
        budget: currentPlan.requirements.budgetMax,
        peopleType: currentPlan.requirements.peopleType,
        preferences: currentPlan.requirements.preferences,
        constraints: currentPlan.requirements.constraints,
        distanceLevel: currentPlan.requirements.distanceLevel,
        blindBoxTheme: currentPlan.requirements.blindBoxTheme,
        inputMode: currentPlan.requirements.inputMode
      }
    });
  } catch {
    return currentPlan.requirements;
  }
}
function buildRerollResult(event, currentPlan, afterRoute, requirements) {
  const beforeNames = new Set(currentPlan.route.steps.map((step) => step.poi.name));
  const changes = afterRoute.steps.map((step, index) => {
    const beforeStep = currentPlan.route.steps[index];
    return {
      action: "replace",
      from: beforeStep?.poi.name,
      to: step.poi.name,
      reason: beforeNames.has(step.poi.name) ? "\u8FD9\u4E00\u7AD9\u4E0E\u65B0\u8DEF\u7EBF\u4ECD\u7136\u5339\u914D\uFF0C\u6240\u4EE5\u4FDD\u7559\u5728\u65B0\u7684\u987A\u5E8F\u91CC\u3002" : "\u5DF2\u907F\u5F00\u4E0A\u4E00\u6761\u8DEF\u7EBF\u7684\u6838\u5FC3\u70B9\uFF0C\u91CD\u65B0\u5339\u914D\u4E00\u6761\u65B0\u8DEF\u7EBF\u3002"
    };
  });
  return {
    event,
    impact: "\u4F60\u9009\u62E9\u91CD\u65B0\u66F4\u6362\u6574\u6761\u8DEF\u7EBF\uFF0C\u7CFB\u7EDF\u5DF2\u6309\u5F53\u524D\u9700\u6C42\u91CD\u65B0\u751F\u6210\u3002",
    beforeRoute: currentPlan.route,
    afterRoute,
    changes,
    keptPreferences: requirements.preferences.slice(0, 3),
    sacrificed: currentPlan.route.steps.map((step) => step.poi.name).filter((name) => !afterRoute.steps.some((afterStep) => afterStep.poi.name === name)),
    message: `\u5DF2\u57FA\u4E8E\u300C${requirements.preferences.slice(0, 2).join("\u3001") || "\u5F53\u524D\u504F\u597D"}\u300D\u91CD\u65B0\u751F\u6210\u5B8C\u6574\u8DEF\u7EBF\uFF0C\u5E76\u5C3D\u91CF\u907F\u5F00\u4E0A\u4E00\u6761\u8DEF\u7EBF\u7684\u6838\u5FC3\u8282\u70B9\u3002`
  };
}

// ../new-agent-a-module/src/data/pois.json
var pois_default = [
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
    priorityScore: 82,
    lat: 22.56685,
    lng: 114.121515
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
    priorityScore: 80,
    lat: 22.64213,
    lng: 113.864959
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
    priorityScore: 85,
    lat: 22.535788,
    lng: 113.927276
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
    priorityScore: 79,
    lat: 22.546572,
    lng: 114.076423
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
    priorityScore: 78,
    lat: 22.587464,
    lng: 114.146443
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
    priorityScore: 83,
    lat: 22.568402,
    lng: 114.148005
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
    priorityScore: 86,
    lat: 22.555364,
    lng: 113.895644
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
    priorityScore: 81,
    lat: 22.546577,
    lng: 114.122394
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
    priorityScore: 78,
    lat: 22.579626,
    lng: 114.116705
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
    priorityScore: 80,
    lat: 22.545278,
    lng: 114.114461
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
    priorityScore: 77,
    lat: 22.543047,
    lng: 113.887618
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
    priorityScore: 76,
    lat: 22.547283,
    lng: 114.096067
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
    priorityScore: 79,
    lat: 22.765293,
    lng: 113.82265
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
    priorityScore: 75,
    lat: 22.5329,
    lng: 113.9355
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
    priorityScore: 81,
    lat: 22.534288,
    lng: 114.062599
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
    priorityScore: 77,
    lat: 22.535899,
    lng: 114.065432
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
    priorityScore: 78,
    lat: 22.549623,
    lng: 113.88537
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
    priorityScore: 79,
    lat: 22.545956,
    lng: 114.061023
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
    priorityScore: 88,
    lat: 22.538869,
    lng: 113.97873
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
    priorityScore: 87,
    lat: 22.534481,
    lng: 113.973715
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
    priorityScore: 84,
    lat: 22.524634,
    lng: 113.990272
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
    priorityScore: 82,
    lat: 22.545627,
    lng: 114.117705
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
    priorityScore: 86,
    lat: 22.577705,
    lng: 114.177004
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
    priorityScore: 80,
    lat: 22.735034,
    lng: 113.789673
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
    priorityScore: 83,
    lat: 22.532087,
    lng: 114.054149
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
    priorityScore: 84,
    lat: 22.552264,
    lng: 113.88764
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
    priorityScore: 87,
    lat: 22.513668,
    lng: 113.912974
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
    priorityScore: 82,
    lat: 22.568767,
    lng: 113.904033
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
    priorityScore: 82,
    lat: 22.533235,
    lng: 114.026495
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
    priorityScore: 85,
    lat: 22.5458,
    lng: 114.0665
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
    priorityScore: 78,
    lat: 22.501608,
    lng: 113.921414
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
    priorityScore: 83,
    lat: 22.536805,
    lng: 114.065277
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
    priorityScore: 81,
    lat: 22.5329,
    lng: 113.9355
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
    priorityScore: 84,
    lat: 22.55053,
    lng: 114.110175
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
    priorityScore: 79,
    lat: 22.533191,
    lng: 113.930478
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
    priorityScore: 83,
    lat: 22.533191,
    lng: 113.930478
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
    priorityScore: 82,
    lat: 22.625823,
    lng: 113.8451
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
    priorityScore: 83,
    lat: 22.566019,
    lng: 114.143488
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
    priorityScore: 80,
    lat: 22.536178,
    lng: 113.91709
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
    priorityScore: 84,
    lat: 22.54672,
    lng: 114.059928
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
    priorityScore: 77,
    lat: 22.535739,
    lng: 114.066352
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
    priorityScore: 81,
    lat: 22.525153,
    lng: 113.991773
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
    priorityScore: 76,
    lat: 22.538039,
    lng: 114.064544
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
    priorityScore: 78,
    lat: 22.61503,
    lng: 113.861218
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
    priorityScore: 79,
    lat: 22.667588,
    lng: 113.820921
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
    priorityScore: 78,
    lat: 22.568929,
    lng: 113.903422
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
    priorityScore: 83,
    lat: 22.548754,
    lng: 113.887879
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
    priorityScore: 82,
    lat: 22.76774,
    lng: 113.846187
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
    priorityScore: 81,
    lat: 22.5357,
    lng: 114.0664
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
    priorityScore: 84,
    lat: 22.758723,
    lng: 113.812213
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
    priorityScore: 83,
    lat: 22.783159,
    lng: 113.835768
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
    priorityScore: 85,
    lat: 22.543089,
    lng: 113.886696
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
    priorityScore: 80,
    lat: 22.543089,
    lng: 113.886696
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
    priorityScore: 79,
    lat: 22.543089,
    lng: 113.886696
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
    priorityScore: 77,
    lat: 22.559863,
    lng: 113.906304
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
    priorityScore: 82,
    lat: 22.522696,
    lng: 113.992044
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
    priorityScore: 86,
    lat: 22.523474,
    lng: 113.991235
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
    priorityScore: 81,
    lat: 22.525231,
    lng: 113.98993
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
    priorityScore: 80,
    lat: 22.52518,
    lng: 113.992305
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
    priorityScore: 79,
    lat: 22.522561,
    lng: 113.992465
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
    priorityScore: 80,
    lat: 22.547863,
    lng: 114.133505
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
    priorityScore: 78,
    lat: 22.519596,
    lng: 114.043441
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
    priorityScore: 79,
    lat: 22.585512,
    lng: 113.968861
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
    priorityScore: 76,
    lat: 22.577485,
    lng: 114.134606
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
    priorityScore: 77,
    lat: 22.6355,
    lng: 114.2104
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
    priorityScore: 77,
    lat: 22.533935,
    lng: 114.053693
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
    priorityScore: 82,
    lat: 22.556013,
    lng: 114.070265
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
    priorityScore: 79,
    lat: 22.535957,
    lng: 114.066437
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
    priorityScore: 84,
    lat: 22.535362,
    lng: 114.066327
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
    priorityScore: 80,
    lat: 22.536084,
    lng: 114.066262
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
    priorityScore: 83,
    lat: 22.535957,
    lng: 114.066437
  }
];

// ../new-agent-a-module/src/data/poiAdapter.ts
var VALID_PEOPLE = /* @__PURE__ */ new Set(["\u5355\u4EBA", "\u60C5\u4FA3", "\u670B\u53CB", "\u4EB2\u5B50"]);
var VALID_QUEUE = /* @__PURE__ */ new Set(["low", "medium", "high"]);
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
    lat: optionalNumber(raw.lat),
    lng: optionalNumber(raw.lng),
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
    priorityScore: optionalNumber(raw.priorityScore),
    amapCategoryName: optionalString(raw.amapCategoryName),
    amapCategoryCode: optionalString(raw.amapCategoryCode),
    amapCategoryPath: optionalString(raw.amapCategoryPath)
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

// ../new-agent-a-module/src/data/pois.ts
var pois = normalizePois(pois_default);

// ../api-src/replan.ts
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
function sanitizeLlmConfig(config) {
  if (!config || typeof config !== "object") return void 0;
  const candidate = config;
  const apiKey = typeof candidate.apiKey === "string" ? candidate.apiKey.trim() : "";
  const baseUrl = typeof candidate.baseUrl === "string" ? candidate.baseUrl.trim() : "";
  const model = typeof candidate.model === "string" ? candidate.model.trim() : "";
  const intentModel = typeof candidate.intentModel === "string" ? candidate.intentModel.trim() : "";
  if (!apiKey && !baseUrl && !model && !intentModel) return void 0;
  return {
    apiKey: apiKey || void 0,
    baseUrl: baseUrl || void 0,
    model: model || void 0,
    intentModel: intentModel || void 0
  };
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
    const event = body.event;
    const plan = body.plan;
    if (!event || !plan) {
      res.status(400).json({ error: "event and plan are required" });
      return;
    }
    const replanned = await handleReplan(event, plan, {
      pois,
      llm: sanitizeLlmConfig(body.llmConfig)
    });
    res.status(200).json(replanned);
  } catch (err) {
    sendError(res, err);
  }
}
