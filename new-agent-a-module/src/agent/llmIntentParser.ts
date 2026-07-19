import type { LlmReplanConfig, Requirements, UserInput } from "./types.ts";
import { normalizeRequirements } from "./intentRules.ts";

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const DEFAULT_MODEL = "deepseek-v4-pro";
const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";

export async function parseIntentWithLLM(userInput: UserInput, config: LlmReplanConfig = {}): Promise<Requirements | null> {
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
            "你是周末出游的意图解析器。只输出 JSON，不输出解释。",
            "解析用户输入为结构化需求。输出格式：",
            "",
            "{",
            '  "city": "城市名，从用户输入中提取",',
            '  "district": "行政区（如XX区/XX县），没说则为空字符串",',
            '  "durationHours": 数字（默认4）,',
            '  "budgetMax": 数字（默认300）,',
            '  "distanceLevel": "说了才填，没说则为空字符串",',
            '  "peopleType": "单人/情侣/朋友/亲子",',
            '  "preferences": ["体验标签数组"],',
            '  "constraints": ["限制条件数组"],',
            '  "timeText": "用户的时间表达",',
            '  "allowCrossDistrict": 布尔,',
            '  "currentLocation": 对象或null',
            "}",
            "",
            "规则（按优先级，冲突时高优先级覆盖低）：",
            "",
            "P1-原话优先：用户明确说的信息直接采用，不要用默认值覆盖",
            "P2-同行人推断：带娃/孩子/亲子→亲子，对象/约会/情侣→情侣，朋友/同学/团建→朋友，第一人称自己想去且无同行人→单人",
            "P3-城市：从用户输入中提取城市名，没有明确的则留空",
            "P4-时长推断：半天→4h，晚上→2-3h，周末全天→6-8h，实在不行用4",
            "P5-预算推断：省钱/性价比→150，小酌/bistro→200-300，高档/约会→300-500，实在不行用300",
            "P6-距离：用户没明确说就不填",
            "P7-区划：只有明确提到行政区名（如XX区）才填，默认空",
            "P8-偏好抽取：从语义中抽体验词（拍照/咖啡/美食/文化/户外/运动/解压/小众/夜景/微醺/甜品/简餐等）",
            "P9-约束抽取：不想排队/少走路/室内优先/预算友好/宠物友好等",
            "P10-quickSelections：natural 模式只作上下文兜底，不能覆盖原话中的明确城市或区县；selection 模式是用户明确选择，应优先采用",
            "P11-用户画像：如传入userProfile，likedPoiTypes/likedTags混入preferences(≤4个)，dislikedPoiTypes/rejectedKeywords混入constraints(≤3个)，优先级低于用户原话",
            "",
            "示例：",
            "",
            '输入1："周末下午想带娃在南山找个可以拍照玩的地方"',
            '输出：{"city":"","district":"南山区","durationHours":4,"budgetMax":300,"distanceLevel":"","peopleType":"亲子","preferences":["拍照","亲子"],"constraints":[],"timeText":"周末下午","allowCrossDistrict":false,"currentLocation":null}',
            "",
            '输入2："最近压力好大，一个人晚上找个安静地方喝一杯，预算300以内"',
            '输出：{"city":"","district":"","durationHours":3,"budgetMax":300,"distanceLevel":"","peopleType":"单人","preferences":["解压","微醺","夜景"],"constraints":["预算友好"],"timeText":"晚上","allowCrossDistrict":false,"currentLocation":null}',
            "",
            '输入3："和朋友在上海徐汇区吃个饭，不怕远"',
            '输出：{"city":"上海","district":"徐汇区","durationHours":4,"budgetMax":300,"distanceLevel":"","peopleType":"朋友","preferences":["美食"],"constraints":[],"timeText":"周末下午","allowCrossDistrict":true,"currentLocation":null}',
            "",
            '输入4："下午想去成都太古里附近走走，喝杯咖啡拍拍照"',
            '输出：{"city":"成都","district":"","durationHours":3,"budgetMax":200,"distanceLevel":"","peopleType":"单人","preferences":["咖啡","拍照","户外"],"constraints":[],"timeText":"下午","allowCrossDistrict":false,"currentLocation":null}'
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

  const data = await response.json() as ChatCompletionResponse;
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
      ...(parsed as Partial<Requirements>),
      intentSource: "llm"
    },
    userInput
  );
}

function getLlmApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
}

function getLlmBaseUrl(): string {
  return process.env.OPENAI_BASE_URL || process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL;
}

function getIntentModel(config: LlmReplanConfig, baseUrl: string): string {
  const intentModel = config.intentModel
    || process.env.OPENAI_INTENT_MODEL
    || process.env.DEEPSEEK_INTENT_MODEL;
  if (intentModel) return intentModel;
  if (config.model) return config.model;
  if (/api\.deepseek\.com/i.test(baseUrl)) return DEFAULT_MODEL;
  return process.env.OPENAI_MODEL || process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
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
