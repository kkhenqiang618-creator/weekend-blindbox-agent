import type { Requirements, UserInput } from "./types.ts";
import { parseIntentWithLLM } from "./llmIntentParser.ts";
import { parseIntentWithRules } from "./intentRules.ts";

export async function parseIntent(userInput: UserInput): Promise<Requirements> {
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
