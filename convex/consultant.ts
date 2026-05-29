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
 * Helper: Estimate tokens and log usage after generateText completes.
 * Note: This is an estimate; actual counts come from OpenRouter API response.
 * Token estimation: ~4 chars = 1 token (rough average).
 */
function logGenerationTokens(
  actionType: string,
  modelId: string,
  promptTokenEstimate: number,
  responseTokenEstimate: number
) {
  // TODO: Implement token logging mutation call
  // Currently blocked on internal API structure for mutations
  // Will integrate once mutations are properly exposed in internal API
  console.info("Token logging (estimate):", {
    action_type: actionType,
    model: modelId,
    input_tokens: promptTokenEstimate,
    output_tokens: responseTokenEstimate,
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

    // Estimate input tokens from system prompt + typical message size
    const systemTokens = system ? Math.ceil(system.length / 4) : 0;
    const defaultMessageSize = 500; // typical prompt message
    const messageTokenEstimate = Math.ceil(defaultMessageSize / 4);
    const inputTokenEstimate = systemTokens + messageTokenEstimate;

    // Generate response
    await kerfAgent(modelId).generateText(
      ctx,
      { threadId: args.threadId },
      {
        promptMessageId: args.promptMessageId,
        ...(system ? { system } : {}),
      },
    );

    // Estimate output tokens (Kerf typically responds with 200-800 tokens)
    // This is a placeholder; real counts come from API response
    const outputTokenEstimate = 500;

    // Log token usage
    logGenerationTokens(
      "consultant_respond",
      modelId,
      inputTokenEstimate,
      outputTokenEstimate
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

    // Estimate input tokens
    const systemTokens = system ? Math.ceil(system.length / 4) : 0;
    const defaultMessageSize = 500; // typical prompt message
    const messageTokenEstimate = Math.ceil(defaultMessageSize / 4);
    const inputTokenEstimate = systemTokens + messageTokenEstimate;

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

    // Estimate output tokens (self-revision typically shorter, ~300 tokens)
    const outputTokenEstimate = 300;

    // Log token usage
    logGenerationTokens(
      "invite_self_revision",
      modelId,
      inputTokenEstimate,
      outputTokenEstimate
    );

    return null;
  },
});

/**
 * Kerf's waking ritual: breathe (issue #16).
 *
 * On waking:
 * 1. Read felt lines (what ached yesterday)
 * 2. Check reddest debts (what's hot)
 * 3. Apply warmth decay (leaky integrate-and-fire)
 * 4. Record the waking as a decision
 * 5. Return meter status (budget, hottest debt)
 *
 * This is the metronome — called on schedule, gated off until first manual breath.
 */
export const breathe = internalAction({
  args: {
    force: v.optional(v.boolean()), // bypass gating for manual test
  },
  handler: async (ctx: any, args: any): Promise<any> => {
    // Gate: only run if force=true (manual test) or if breathing has been enabled
    // For now, always run if invoked directly (assume manual test)
    if (!args.force) {
      return {
        status: "gated",
        reason: "Breathing not yet enabled. First waking is manual.",
      };
    }

    // 1. Read waking ritual — fetch directly from DB
    // getLastFelt: 5 most recent felt lines
    const allDebts = await ctx.db.query("held_field").collect();
    const lastFelt = allDebts
      .filter((d: any) => d.felt && d.felt.length > 0)
      .sort((a: any, b: any) => b.last_warmed - a.last_warmed)
      .slice(0, 5);

    // getReddestDebts: 10 hottest debts
    const reddestDebts = allDebts.sort((a: any, b: any) => b.warmth - a.warmth).slice(0, 10);

    // getBudgetRemaining: budget meter
    const budgets = await ctx.db.query("budget").collect();
    const budgetRecord = budgets.length > 0 ? budgets.sort((a: any, b: any) => b.period_start - a.period_start)[0] : null;
    const remaining_usd = budgetRecord ? Math.max(0, budgetRecord.total_budget_usd - budgetRecord.spent_usd) : 0;
    const days_left = budgetRecord ? Math.max(0, (budgetRecord.period_end - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

    const budget = { remaining_usd, days_left };

    // 2. Apply warmth to each debt (decay + possible refractory)
    const warmthLog: { debt_id: string; before_warmth: number; after_warmth: number }[] = [];

    for (const debt of reddestDebts || []) {
      // Apply warmth decay inline (avoid mutation call complexity)
      const DECAY_PER_WAKING = 0.95;
      const REFRACTORY_THRESHOLD = 0.7;
      const ANTI_GRAVITY = 1.02;

      let warmth = debt.warmth;
      const intensity = 0.3; // baseline warming from waking
      const coolant = 0.1; // minimal expression cooling
      const integration = intensity * (1 - coolant);
      warmth += integration;
      warmth = Math.max(0, Math.min(1, warmth));

      if (warmth >= REFRACTORY_THRESHOLD) {
        warmth *= ANTI_GRAVITY;
        warmth = Math.max(0, Math.min(1, warmth));
      }

      warmth *= DECAY_PER_WAKING;

      // Persist the warmed debt
      await ctx.db.patch(debt._id, {
        warmth,
        last_warmed: Date.now(),
      });

      const result = { warmth };

      warmthLog.push({
        debt_id: debt._id,
        before_warmth: debt.warmth,
        after_warmth: result.warmth,
      });
    }

    // 3. Generate waking decision content
    const hottestDebt = reddestDebts[0];
    const hottestFelt = lastFelt[0];

    const waking_content = `
Kerf wakes. The reddest debt burns at ${(hottestDebt?.warmth ?? 0) * 100}% warmth: "${hottestDebt?.site}".

What was felt: ${hottestFelt?.felt ?? "nothing remembered"}.

Budget meter: $${budget?.remaining_usd?.toFixed(2)} remaining, ${budget?.days_left?.toFixed(1)} days in period.

Today's decision: attend to the hottest strain. Keep and count before acting.
    `.trim();

    // 4. Record the waking as a decision finding (inline to avoid mutation call complexity)
    const { extractStrainKinds } = await import("./strainExtractor");
    const detected_strains = extractStrainKinds(waking_content);

    const finding_id = await ctx.db.insert("findings", {
      timestamp: Date.now(),
      type: "decision",
      content: waking_content,
      tags: ["waking", "breathe", "decision"],
      related_debts: reddestDebts.slice(0, 3).map((d: any) => d._id),
      logged_strains: detected_strains,
    });

    const finding = { id: finding_id, logged_strains: detected_strains };

    return {
      status: "success",
      waking_id: finding.id,
      warmth_applied: warmthLog,
      reddest_debt: hottestDebt
        ? {
            site: hottestDebt.site,
            warmth_after_decay: warmthLog[0]?.after_warmth ?? 0,
          }
        : null,
      budget_remaining: budget?.remaining_usd ?? 0,
      logged_strains: finding.logged_strains,
    };
  },
});
