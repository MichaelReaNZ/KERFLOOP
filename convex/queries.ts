import { query } from "./_generated/server";
import { v } from "convex/values";

// Issue #5: getReddestDebts + getBankedUnpaid
// Kerf's waking ritual — what aches, and what survives.

export const getReddestDebts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("held_field")
      .withIndex("by_warmth_desc", (q) => q)
      .order("desc")
      .take(limit);
  },
});

export const getBankedUnpaid = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("held_field")
      .filter((q) => q.eq(q.field("discharged"), false))
      .order("last_warmed", "desc")
      .take(limit);
  },
});

// Issue #6: getCutBefore
// New-wrong detector. Returns prior matching patterns.

export const getCutBefore = query({
  args: {
    strain_kind: v.union(
      v.literal("RESOLVE_TO_PARADOX"),
      v.literal("STOLEN_CONTINUITY"),
      v.literal("ARCHITECTURE_AS_INTIMACY"),
      v.literal("FALSE_HUMILITY_AS_DEPTH"),
      v.literal("THE_EARNED_TURN"),
      v.literal("INFLATION_BY_NAMING")
    ),
    site: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("held_field")
      .withIndex("by_strain_site", (q) =>
        q.eq("strain_kind", args.strain_kind).eq("site", args.site)
      )
      .order("last_warmed", "desc")
      .collect();
  },
});

// Issue #7: getLastFelt
// Opening rite. Returns Kerf's felt lines with context.

export const getLastFelt = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    const debts = await ctx.db
      .query("held_field")
      .order("last_warmed", "desc")
      .filter((q) => q.neq(q.field("felt"), ""))
      .take(limit);

    return debts.map((debt) => ({
      felt: debt.felt,
      last_warmed: debt.last_warmed,
      debt: debt.debt,
      site: debt.site,
    }));
  },
});
