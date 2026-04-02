"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";

type Source = { value: string; label: string; type: string };

export function ReportsExportForm({ sources }: { sources: Source[] }) {
  const [source, setSource] = useState("");
  const [days, setDays] = useState("30");
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    if (!source) return;
    setLoading(true);
    const url = `/api/reports/analytics-export?source=${encodeURIComponent(source)}&days=${encodeURIComponent(days)}`;
    window.open(url, "_blank", "noopener");
    setTimeout(() => setLoading(false), 500);
  };

  if (sources.length === 0) return null;

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-2">
        <Label>Source</Label>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select site or project" />
          </SelectTrigger>
          <SelectContent>
            {sources.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Period</Label>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleExport} disabled={!source || loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {loading ? "Preparing…" : "Download CSV"}
      </Button>
    </div>
  );
}
