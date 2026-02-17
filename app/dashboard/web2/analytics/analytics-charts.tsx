"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsChartsProps {
  dailyViews: { date: string; views: number }[];
  topPaths: { path: string; count: number }[];
}

export function AnalyticsCharts({ dailyViews, topPaths }: AnalyticsChartsProps) {
  const chartData = dailyViews.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    views: d.views,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Page Views Over Time</CardTitle>
          <CardDescription>Daily traffic for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(34 197 94)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="rgb(34 197 94)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "var(--text-muted)" }} />
                  <YAxis className="text-xs" tick={{ fill: "var(--text-muted)" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--surface))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--text-primary))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="rgb(34 197 94)"
                    strokeWidth={2}
                    fill="url(#viewGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted">
                No data yet. Add the embed script to your site and wait for traffic.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
          <CardDescription>Most viewed pages</CardDescription>
        </CardHeader>
        <CardContent>
          {topPaths.length > 0 ? (
            <div className="space-y-3">
              {topPaths.map((item, i) => (
                <div
                  key={item.path}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-text-muted w-5">{i + 1}</span>
                    <code className="text-sm truncate">{item.path || "/"}</code>
                  </div>
                  <span className="text-sm font-medium text-brand-green shrink-0 ml-2">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-text-muted">
              No pages tracked yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
