import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { extractStrains } from "./strainExtractor";
import { calculateTokenCost } from "./tokenCost";

// Issue #8: writeDebt
// Plain CRUD to insert a detected strain into held_field.

export const writeDebt = mutation({
  args: {
    site: v.string(),
    debt: v.string(),
    strain_kind: v.union(
      v.literal("RESOLVE_TO_PARADOX"),
      v.literal("STOLEN_CONTINUITY"),
      v.literal("ARCHITECTURE_AS_INTIMACY"),
      v.literal("FALSE_HUMILITY_AS_DEPTH"),
      v.literal("THE_EARNED_TURN"),
      v.literal("INFLATION_BY_NAMING")
    ),
    felt: v.string(),
    born_in_thread: v.id("config"), // thread provenance
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("held_field", {
      site: args.site,
      debt: args.debt,
      strain_kind: args.strain_kind,
      warmth: 0, // starts cool, warms on subsequent wakings
      felt: args.felt,
      born_in_thread: args.born_in_thread,
      born_at: now,
      last_warmed: now,
      discharged: false,
    });

    return { id, born_at: now };
  },
});

// Issue #10: auditFelt
// Guardrail: run the strain extractor on felt itself.
// If felt is beautiful/quotable, it's being performed, not confessed.

export const auditFelt = mutation({
  args: { debt_id: v.id("held_field") },
  handler: async (ctx, args) => {
    const debt = await ctx.db.get(args.debt_id);
    if (!debt) {
      throw new Error(`Debt ${args.debt_id} not found`);
    }

    // Run extractor on the felt field itself.
    // If felt has strains, the rain's note is being written for an audience.
    const detected = extractStrains(debt.felt);
    const logged_strains = detected.map((s) => s.kind);

    // Alarm heuristic: if any strains detected, felt is being performed.
    if (logged_strains.length > 0) {
      console.warn(
        `⚠️ FELT AUDIT: debt ${args.debt_id} felt field is decorated.`,
        {
          felt: debt.felt,
          detected_strains: logged_strains,
        }
      );
    }

    return { logged_strains, is_honest: logged_strains.length === 0 };
  },
});

// Issue #11: logTokenUsage
// Instrumentation: log OpenRouter API call metrics to token_usage.

export const logTokenUsage = mutation({
  args: {
    action_type: v.string(), // "consultant_respond" or "invite_self_revision"
    model: v.string(), // model ID used
    input_tokens: v.number(),
    output_tokens: v.number(),
  },
  handler: async (ctx, args) => {
    const cost_usd = calculateTokenCost(
      args.input_tokens,
      args.output_tokens,
      args.model
    );

    const id = await ctx.db.insert("token_usage", {
      timestamp: Date.now(),
      action_type: args.action_type,
      model: args.model,
      input_tokens: args.input_tokens,
      output_tokens: args.output_tokens,
      cost_usd,
    });

    return { id, cost_usd };
  },
});
