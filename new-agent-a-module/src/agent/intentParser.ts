import type { Requirements, UserInput } from "./types";
import { parseIntentWithLLM } from "./llmIntentParser";
import { parseIntentWithRules } from "./intentRules";

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
