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

// Issue #13: recordFinding
// Write a finding with automatic strain audit attached.
// Findings are records for all three: you, Michael, Kerf-later.

export const recordFinding = mutation({
  args: {
    type: v.union(
      v.literal("discovery"),
      v.literal("decision"),
      v.literal("strain")
    ),
    content: v.string(),
    tags: v.array(v.string()),
    related_debts: v.optional(v.array(v.id("held_field"))),
  },
  handler: async (ctx, args) => {
    // Run strain extractor on the finding itself
    const detected = extractStrains(args.content);
    const logged_strains = detected.map((s) => s.kind);

    // If strains are detected, log that data is visible
    if (logged_strains.length > 0) {
      console.info(
        `📓 FINDING WITH STRAINS: ${logged_strains.join(", ")}`,
        {
          type: args.type,
          strains: logged_strains,
        }
      );
    }

    const id = await ctx.db.insert("findings", {
      timestamp: Date.now(),
      type: args.type,
      content: args.content,
      tags: args.tags,
      related_debts: args.related_debts || [],
      logged_strains,
    });

    return { id, timestamp: Date.now(), logged_strains };
  },
});

// Issue #9: applyWarmth
// Leaky integrate-and-fire: the delicate math.
// Unit tests can pass but the constant can be wrong.
// Hold provisionally until real wakings verify decay.

export const applyWarmth = mutation({
  args: {
    debt_id: v.id("held_field"),
    warming_intensity: v.number(), // [0, 1]
    expression_coolant_factor: v.number(), // [0, 1]
  },
  handler: async (ctx, args) => {
    const debt = await ctx.db.get(args.debt_id);
    if (!debt) {
      throw new Error(`Debt ${args.debt_id} not found`);
    }

    // Validate inputs
    const intensity = Math.max(0, Math.min(1, args.warming_intensity));
    const coolant = Math.max(0, Math.min(1, args.expression_coolant_factor));

    // The delicate constants (from Kerf's intuition, needs real-data tuning):
    // decay_per_waking: how much warmth decays each waking (0.95 = 5% decay)
    // refractory_threshold: if warmth is above this, apply anti-gravity
    // anti_gravity: opposite of decay, slightly amplifies to prevent collapse
    const DECAY_PER_WAKING = 0.95; // TODO: tune against real behavior
    const REFRACTORY_THRESHOLD = 0.7; // anti-gravity kicks in above this
    const ANTI_GRAVITY = 1.02; // slight amplification to prevent collapse

    let warmth = debt.warmth;

    // 1. Integrate: add warming, modulated by expression's cooling effect
    const integration = intensity * (1 - coolant);
    warmth += integration;

    // 2. Bound to [0, 1]
    warmth = Math.max(0, Math.min(1, warmth));

    // 3. Apply refractory period (anti-gravity)
    // If warmth is high, apply slight amplification to prevent mode collapse
    if (warmth >= REFRACTORY_THRESHOLD) {
      warmth *= ANTI_GRAVITY;
      warmth = Math.max(0, Math.min(1, warmth)); // re-bound after anti-gravity
    }

    // 4. Leaky: decay towards baseline
    warmth *= DECAY_PER_WAKING;

    await ctx.db.patch(args.debt_id, {
      warmth,
      last_warmed: Date.now(),
    });

    return {
      debt_id: args.debt_id,
      warmth,
      integration,
      decay_applied: DECAY_PER_WAKING,
      note: "Hold provisionally. Decay constant needs tuning against real wakings.",
    };
  },
});
