import { mutation } from "./_generated/server";
import { v } from "convex/values";

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
