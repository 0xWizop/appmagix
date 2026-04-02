import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, ArrowRight } from "lucide-react";
import type { TrafficAlert } from "@/lib/traffic-alert";

export function TrafficAlertCard({ alerts }: { alerts: TrafficAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <Card className="border-amber-600 bg-surface">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-amber-600" />
          Traffic alert
        </CardTitle>
        <CardDescription>
          Traffic is down compared to the previous week on the following sites. Worth a look.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li
              key={`${a.sourceType}-${a.sourceName}`}
              className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border"
            >
              <div>
                <span className="font-medium text-sm">{a.sourceName}</span>
                <span className="text-xs text-text-muted ml-2">
                  {a.currentViews} views (was {a.previousViews}) — down {Math.abs(Math.round(a.percentChange))}%
                </span>
              </div>
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
          <Link href="/dashboard/web2/analytics">
            View Sites & Analytics
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
