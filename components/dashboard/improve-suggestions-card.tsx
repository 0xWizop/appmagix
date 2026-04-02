import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, BarChart3, FileText } from "lucide-react";

interface ImproveSuggestionsCardProps {
  hasSite: boolean;
  totalViews14d: number;
  topPaths: { path: string; count: number }[];
}

export function ImproveSuggestionsCard({ hasSite, totalViews14d, topPaths }: ImproveSuggestionsCardProps) {
  const lowOrNoTraffic = hasSite && totalViews14d < 20;
  const hasTopPaths = topPaths.length > 0;

  if (!hasSite && !hasTopPaths) return null;
  if (!lowOrNoTraffic && !hasTopPaths) return null;

  return (
    <Card className="border-brand-green-dark bg-surface">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-brand-green" />
          Improve
        </CardTitle>
        <CardDescription>
          Quick wins to get more from your sites and analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lowOrNoTraffic && (
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <BarChart3 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Add tracking to your site</p>
              <p className="text-xs text-text-secondary mt-1">
                We’re seeing little or no traffic in the last 14 days. Make sure the tracking script is installed on every page you want to measure.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href="/dashboard/web2/analytics">Sites & Analytics</Link>
              </Button>
            </div>
          </div>
        )}
        {hasTopPaths && (
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <FileText className="h-5 w-5 text-brand-green shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Top pages to optimize</p>
              <p className="text-xs text-text-secondary mt-1">
                Consider adding meta titles and descriptions for SEO on these high-traffic pages.
              </p>
              <ul className="mt-2 space-y-1 text-xs text-text-muted">
                {topPaths.slice(0, 5).map(({ path, count }) => (
                  <li key={path}>
                    <code className="bg-surface-hover px-1 rounded">{path || "/"}</code>
                    <span className="ml-2">{count} views</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href="/dashboard/web2/support/new">Get help with SEO</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
