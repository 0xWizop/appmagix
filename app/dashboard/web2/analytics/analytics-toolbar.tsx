"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Calendar } from "lucide-react";

const DAY_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
];

interface AnalyticsToolbarProps {
  dailyViews: { date: string; views: number }[];
  topPaths: { path: string; count: number }[];
  projectName?: string;
}

export function AnalyticsToolbar({
  dailyViews,
  topPaths,
  projectName = "Site",
}: AnalyticsToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const days = searchParams.get("days") || "30";
  const [showCustom, setShowCustom] = useState(days === "custom");
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  const handleDaysChange = (value: string) => {
    if (value === "custom") {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", value);
    params.delete("from");
    params.delete("to");
    router.push(`/dashboard/web2/analytics?${params.toString()}`);
  };

  const applyCustomRange = () => {
    if (!from || !to) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", "custom");
    params.set("from", from);
    params.set("to", to);
    router.push(`/dashboard/web2/analytics?${params.toString()}`);
  };

  const handleExport = () => {
    const rows: string[] = [];
    rows.push("Date,Page Views");
    dailyViews.forEach((d) => {
      rows.push(`${d.date},${d.views}`);
    });
    rows.push("");
    rows.push("Path,Views");
    topPaths.forEach((p) => {
      rows.push(`"${(p.path || "/").replace(/"/g, '""')}",${p.count}`);
    });
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${(projectName || "site").replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={showCustom ? "custom" : days} onValueChange={handleDaysChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DAY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showCustom && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-text-muted" />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 rounded-md border border-border bg-surface px-3 text-sm"
            />
          </div>
          <span className="text-text-muted text-sm">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-9 rounded-md border border-border bg-surface px-3 text-sm"
          />
          <Button size="sm" onClick={applyCustomRange} disabled={!from || !to}>
            Apply
          </Button>
        </div>
      )}

      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
    </div>
  );
}
