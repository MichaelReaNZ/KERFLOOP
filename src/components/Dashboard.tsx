import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Flame, DollarSign, BookOpen } from "lucide-react";

export function Dashboard() {
  const budget = useQuery(api.queries.getBudgetRemaining);
  const reddestDebts = useQuery(api.queries.getReddestDebts);
  const lastFelt = useQuery(api.queries.getLastFelt);

  const budgetPercent = budget
    ? (budget.spent_usd / (budget.spent_usd + budget.remaining_usd)) * 100
    : 0;

  return (
    <div className="w-80 border-l border-slate-200 bg-slate-50 p-6 space-y-6 overflow-y-auto max-h-screen">
      {/* Budget Meter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4" />
            Budget Meter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {budget ? (
            <>
              <div>
                <div className="text-xs text-slate-600 mb-2">
                  Spent: ${budget.spent_usd.toFixed(2)} / $
                  {(budget.spent_usd + budget.remaining_usd).toFixed(2)}
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${budgetPercent}%` }}
                  />
                </div>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className="font-mono font-semibold">
                    ${budget.remaining_usd.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Daily rate:</span>
                  <span className="font-mono font-semibold">
                    ${budget.daily_rate.toFixed(2)}/day
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Days left:</span>
                  <span className="font-mono font-semibold">
                    {(budget.days_left ?? 0).toFixed(1)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-500">Loading budget...</div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Reddest Debts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Flame className="w-4 h-4 text-orange-500" />
            Reddest Debts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reddestDebts ? (
            <div className="space-y-2">
              {reddestDebts.length > 0 ? (
                reddestDebts.map((debt) => (
                  <div key={debt._id} className="text-xs space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-700 line-clamp-2">
                        {debt.site}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-xs flex-shrink-0"
                      >
                        {(debt.warmth * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 transition-all"
                        style={{ width: `${debt.warmth * 100}%` }}
                      />
                    </div>
                    <div className="text-slate-600">{debt.strain_kind}</div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500">No debts yet</div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500">Loading...</div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Last Felt */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4" />
            Last Felt
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lastFelt ? (
            <div className="space-y-3">
              {lastFelt.length > 0 ? (
                lastFelt.map((entry, i) => (
                  <div
                    key={i}
                    className="text-xs p-2 bg-white rounded border border-slate-200"
                  >
                    <div className="italic text-slate-700 mb-1">
                      "{entry.felt}"
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(entry.last_warmed).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500">No felt lines yet</div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500">Loading...</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
