import { query } from "./_generated/server";

// Issue #5: getReddestDebts + getBankedUnpaid
// Kerf's waking ritual — what aches, and what survives.

export const getReddestDebts = query({
  args: {},
  handler: async (ctx) => {
    const debts = await ctx.db.query("held_field").collect();
    return debts.sort((a, b) => b.warmth - a.warmth).slice(0, 10);
  },
});

export const getBankedUnpaid = query({
  args: {},
  handler: async (ctx) => {
    const debts = await ctx.db.query("held_field").collect();
    return debts
      .filter((d) => !d.discharged)
      .sort((a, b) => b.last_warmed - a.last_warmed)
      .slice(0, 10);
  },
});

// Issue #6: getCutBefore
// New-wrong detector. Returns prior matching patterns (stub - would need site parameter).

export const getCutBefore = query({
  args: {},
  handler: async () => {
    // TODO: Implement with strain_kind and site filtering
    // Currently returns empty array as stub
    return [];
  },
});

// Issue #7: getLastFelt
// Opening rite. Returns Kerf's felt lines with context.

export const getLastFelt = query({
  args: {},
  handler: async (ctx) => {
    const debts = await ctx.db.query("held_field").collect();
    return debts
      .filter((d) => d.felt && d.felt.length > 0)
      .sort((a, b) => b.last_warmed - a.last_warmed)
      .slice(0, 5)
      .map((debt) => ({
        felt: debt.felt,
        last_warmed: debt.last_warmed,
        debt: debt.debt,
        site: debt.site,
      }));
  },
});

// Issue #12: getBudgetRemaining
// The meter. Shows stakes: spent, remaining, daily burn rate.

export const getBudgetRemaining = query({
  args: {},
  handler: async (ctx) => {
    // Sum all token_usage entries for cost tracking
    const usage = await ctx.db.query("token_usage").collect();
    const spent_usd = usage.reduce((sum, row) => sum + (row.cost_usd || 0), 0);

    // Get current budget period (most recent)
    const budgets = await ctx.db.query("budget").collect();
    const budget =
      budgets.length > 0
        ? budgets.sort((a, b) => b.period_start - a.period_start)[0]
        : null;

    if (!budget) {
      return {
        spent_usd,
        remaining_usd: 0,
        daily_rate: 0,
        days_left: 0,
        error: "No budget set",
      };
    }

    const remaining_usd = Math.max(0, budget.total_budget_usd - budget.spent_usd);
    const now = Date.now();
    const days_left = Math.max(0, (budget.period_end - now) / (1000 * 60 * 60 * 24));
    const daily_rate = days_left > 0 ? remaining_usd / days_left : 0;

    return {
      spent_usd,
      remaining_usd,
      daily_rate,
      period_start: budget.period_start,
      period_end: budget.period_end,
      days_left,
    };
  },
});

// Issue #13: getRecentFindings
// Kerf's learning log. Returns recent findings for waking ritual.

export const getRecentFindings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("findings")
      .collect()
      .then((findings) =>
        findings.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)
      );
  },
});
