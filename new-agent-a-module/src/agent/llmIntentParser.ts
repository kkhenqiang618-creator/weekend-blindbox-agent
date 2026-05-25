import type { Requirements, UserInput } from "./types.ts";
import { normalizeRequirements } from "./intentRules.ts";

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const DEFAULT_MODEL = "deepseek-chat";
const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";

export async function parseIntentWithLLM(userInput: UserInput): Promise<Requirements | null> {
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
            "你是本地生活周末出游 Agent 的意图解析器。",
            "请把用户的一句话目标解析为严格 JSON，不要输出解释。",
            "字段必须包含：city, durationHours, budgetMax, distanceLevel, peopleType, preferences, constraints, timeText。",
            "peopleType 只能是：单人、情侣、朋友、亲子。",
            "preferences 和 constraints 必须是字符串数组。",
            "请优先根据用户原话做语义判断，不要机械套用默认值。",
            "城市：用户没说时默认深圳。",
            "时长：用户没说时，根据“现在、半天、下午、晚上、周末”等语境推断；仍无法判断时用4小时。",
            "预算：用户没说时，根据语气和活动类型推断合理预算；仍无法判断时用300。",
            "同行人：请根据语义判断。带娃/孩子/亲子通常是亲子；对象/情侣/约会通常是情侣；朋友/同学/同事/团建/多人通常是朋友；如果用户以第一人称表达自己想出去，如“我现在有点无聊”“我想找个地方”，且没有提到同行人，通常是单人。若没有明确关键词，也请结合整句话选择最合理的 peopleType，不要固定默认朋友。",
            "preferences：从语义中抽取用户真正想要的体验，如拍照、咖啡、美食、文化、户外、运动、解压、小众、性价比、休闲等。",
            "constraints：抽取限制条件，如不想排队、少走路、室内优先、预算友好、雨天可去等。",
            "timeText：保留用户提到的时间表达，如现在、周六下午、明天下午、周末晚上；如果没说，结合语境给出自然时间，如现在或周末下午。",
            "distanceLevel：如果用户没明确说距离，返回空字符串。"
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

function safeParseJson(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  }
}
