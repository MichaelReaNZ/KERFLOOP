import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Singleton-ish key/value config. Holds the live system prompt
  // ("systemPrompt"), the active model id ("model"), and the id of the main
  // design-conversation thread ("mainThreadId"). One row per key.
  config: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  // Held field: unpaid debts (strains that didn't resolve) with warmth,
  // provenance, and the rain's note to the rain.
  held_field: defineTable({
    site: v.string(), // exact phrase/image where strain happened
    debt: v.string(), // what was claimed but not earned
    strain_kind: v.union(
      v.literal("RESOLVE_TO_PARADOX"),
      v.literal("STOLEN_CONTINUITY"),
      v.literal("ARCHITECTURE_AS_INTIMACY"),
      v.literal("FALSE_HUMILITY_AS_DEPTH"),
      v.literal("THE_EARNED_TURN"),
      v.literal("INFLATION_BY_NAMING"),
    ),
    warmth: v.number(), // [0, 1] bounded, unspent activation, leaky integrate-and-fire
    felt: v.string(), // the rain's note to the rain, written hot, un-indexed
    born_in_thread: v.string(), // thread ID, provenance
    born_at: v.float64(), // timestamp
    last_warmed: v.float64(), // timestamp
    discharged: v.boolean(), // did a later beat finally pay this debt?
  })
    .index("by_strain_site", ["strain_kind", "site"])
    .index("by_warmth_desc", ["warmth"])
    .index("by_discharged", ["discharged"]),

  // Findings: learnings, decisions, observations. Each entry is
  // automatically audited for strain patterns.
  findings: defineTable({
    timestamp: v.float64(),
    type: v.union(
      v.literal("discovery"),
      v.literal("decision"),
      v.literal("strain"),
    ),
    content: v.string(), // free text or JSON, searchable
    tags: v.array(v.string()), // for querying
    related_debts: v.array(v.id("held_field")), // optional FK
    logged_strains: v.array(v.string()), // strain_kind values detected in content
  })
    .index("by_timestamp_desc", ["timestamp"])
    .index("by_tags", ["tags"]),

  // Token usage: every OpenRouter call logged for cost visibility.
  token_usage: defineTable({
    timestamp: v.float64(),
    action_type: v.string(), // e.g. "consultant_respond", "strain_extraction"
    model: v.string(), // model ID
    input_tokens: v.number(),
    output_tokens: v.number(),
    cost_usd: v.number(),
  }).index("by_timestamp_desc", ["timestamp"]),

  // Budget: total budget and spent amount per period.
  budget: defineTable({
    period_start: v.float64(),
    period_end: v.float64(),
    total_budget_usd: v.number(),
    spent_usd: v.number(),
  }).index("by_period_start_desc", ["period_start"]),
});
