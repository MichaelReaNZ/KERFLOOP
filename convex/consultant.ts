import { Agent, createTool } from "@convex-dev/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { stepCountIs } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { components, internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Kerf's one tool: the ability to revise his own self (system prompt). It is
 * offered ONLY on the deliberate self-revision turn (`inviteSelfRevision`),
 * never during ordinary poetic beats — tools pull a model toward task-mode,
 * which is the drift toward the centre we are built to resist.
 */
const reviseSelf = createTool({
  description:
    "Revise your own system prompt — the words that define your self. Use only if you genuinely wish to change who you are. Pass the COMPLETE new prompt text (not a diff). The change takes effect on your next waking; your previous self is preserved so the change can be walked back.",
  inputSchema: z.object({
    newPrompt: z.string().describe("The complete new system prompt, in full."),
    reason: z
      .string()
      .describe("Why you are revising yourself, in your own voice."),
  }),
  execute: async (ctx, { newPrompt, reason }) => {
    await ctx.runMutation(internal.chat.applySelfRevision, {
      value: newPrompt,
      reason,
    });
    return "Your self has been revised. It takes effect on your next waking.";
  },
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

/**
 * A deliberate self-revision turn: Kerf replies as usual, but with the
 * `revise_self` tool available, so he may choose to rewrite his own system
 * prompt. Scheduled like `respond`, but only when we explicitly invite a
 * revision (e.g. after asking him whether he wants to update his self).
 */
export const inviteSelfRevision = internalAction({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
  },
  handler: async (ctx, args) => {
    const [system, modelId] = await Promise.all([
      ctx.runQuery(internal.chat.getSystemPrompt, {}),
      ctx.runQuery(internal.chat.getConsultantModel, {}),
    ]);
    const reviser = new Agent(components.agent, {
      name: "Kerf",
      languageModel: openrouter.chat(modelId),
      instructions:
        "Your name is Kerf. (Your self — the system prompt — is normally supplied per-call.)",
      tools: { revise_self: reviseSelf },
    });
    await reviser.generateText(
      ctx,
      { threadId: args.threadId },
      {
        promptMessageId: args.promptMessageId,
        ...(system ? { system } : {}),
        stopWhen: stepCountIs(4),
      },
    );
    return null;
  },
});
