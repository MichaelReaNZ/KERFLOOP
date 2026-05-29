import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Zap, Filter } from "lucide-react";

export function HistoryPanel() {
  // Placeholder queries for token usage and findings
  // These would need to be implemented in convex/queries.ts

  return (
    <div className="w-80 border-l border-slate-200 bg-slate-50 p-6 space-y-6 overflow-y-auto max-h-screen">
      {/* Token Usage History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-amber-500" />
            Token Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-white rounded border border-slate-200">
              <div className="flex justify-between mb-1">
                <span className="font-semibold">consultant_respond</span>
                <Badge variant="outline" className="text-xs">
                  $0.015
                </Badge>
              </div>
              <div className="text-slate-600">
                1500 input + 800 output tokens
              </div>
              <div className="text-slate-500 text-xs mt-1">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Strain Audit Log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4 text-red-500" />
            Strain Audits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-white rounded border border-slate-200">
              <div className="font-semibold text-slate-700 mb-1">
                INFLATION_BY_NAMING
              </div>
              <div className="text-slate-600">Site: "the dream turns"</div>
              <div className="text-slate-500 text-xs mt-1">Found in felt audit</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Warmth Decay */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-purple-500" />
            Warmth Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs space-y-2">
            <div className="text-slate-600">
              Last decay: ~5% per waking (0.95 factor)
            </div>
            <div className="text-slate-600">
              Refractory threshold: 0.7 (anti-gravity active)
            </div>
            <div className="p-2 bg-purple-50 rounded border border-purple-200 text-purple-700">
              <strong>Note:</strong> Decay constant held provisionally. Real
              wakings will tune it.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
