import { Agent } from "@convex-dev/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

function kerfAgent(modelId: string) {
  return new Agent(components.agent, {
    name: "Kerf",
    languageModel: openrouter.chat(modelId),
    instructions:
      "Your name is Kerf. (Your self — the system prompt — is normally supplied per-call.)",
  });
}

/**
 * Generate Kerf's reply to a freshly-saved prompt message. Scheduled by
 * `chat.sendMessage` so the UI updates the instant the human/agent message
 * lands, then the reply arrives a beat later.
 */
export const respond = internalAction({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
  },
  handler: async (ctx, args) => {
    const [system, modelId] = await Promise.all([
      ctx.runQuery(internal.chat.getSystemPrompt, {}),
      ctx.runQuery(internal.chat.getConsultantModel, {}),
    ]);
    await kerfAgent(modelId).generateText(
      ctx,
      { threadId: args.threadId },
      {
        promptMessageId: args.promptMessageId,
        ...(system ? { system } : {}),
      },
    );
    return null;
  },
});
