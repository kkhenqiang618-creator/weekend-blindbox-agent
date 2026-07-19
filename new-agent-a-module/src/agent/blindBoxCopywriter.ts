import type { BlindBox, LlmReplanConfig, Requirements, Route } from "./types.ts";

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

const DEFAULT_MODEL = "deepseek-v4-flash";
const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";

export async function personalizeBlindBoxCopy(
  blindBox: BlindBox,
  requirements: Requirements,
  route: Route,
  config: LlmReplanConfig = {},
  fetchImpl: typeof fetch = fetch
): Promise<BlindBox> {
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
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: [
              "你是 WeekendBuddy 的盲盒揭晓文案作者。",
              "根据用户原话和已经确定的最终路线，写一段自然、具体、有变化的中文反馈。",
              "只返回严格 JSON：title 字符串、story 字符串、tags 字符串数组。",
              "story 必须原样提到最终路线中至少一个实际地点名称，并解释路线怎样回应用户需求。",
              "不要每次使用相同开头；避免“听懂了”“根据你的需求”“为你精心”等客服腔。",
              "不得编造路线数据中不存在的地点、优惠、营业状态或评价。",
              "title 8-18 个汉字，story 45-90 个汉字，tags 2-4 个。"
            ].join("\n"),
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
                reason: step.poi.reason,
              })),
            }),
          },
        ],
      }),
    });
    if (!response.ok) return unavailableCopy(blindBox);
    const data = await response.json() as ChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content;
    const parsed = content ? safeParseJson(content) : null;
    if (!parsed) return unavailableCopy(blindBox);
    return {
      ...blindBox,
      title: parsed.title || blindBox.title,
      story: parsed.story,
      tags: parsed.tags.length ? parsed.tags.slice(0, 4) : blindBox.tags,
      copySource: "llm",
    };
  } catch {
    return unavailableCopy(blindBox);
  }
}

function unavailableCopy(blindBox: BlindBox): BlindBox {
  return {
    ...blindBox,
    story: "个性化反馈暂未生成，请配置 DEEPSEEK_API_KEY 后重新生成。",
    copySource: "unavailable",
  };
}

function safeParseJson(content: string): { title?: string; story: string; tags: string[] } | null {
  try {
    const match = content.match(/\{[\s\S]*\}/);
    const value = JSON.parse(match?.[0] || content) as Record<string, unknown>;
    if (typeof value.story !== "string" || !value.story.trim()) return null;
    return {
      title: typeof value.title === "string" ? value.title.trim() : undefined,
      story: value.story.trim(),
      tags: Array.isArray(value.tags) ? value.tags.filter((tag): tag is string => typeof tag === "string" && Boolean(tag.trim())).map((tag) => tag.trim()) : [],
    };
  } catch {
    return null;
  }
}
