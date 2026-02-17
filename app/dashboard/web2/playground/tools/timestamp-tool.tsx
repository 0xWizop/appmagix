"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/toast-context";
import { ToolCard } from "./tool-card";
import { Clock, Copy, Check } from "lucide-react";

export function TimestampTool() {
  const toast = useToast();
  const [timestamp, setTimestamp] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const now = Math.floor(Date.now() / 1000);

  const toDate = () => {
    const ts = parseInt(timestamp, 10);
    if (isNaN(ts)) {
      setResult(null);
      return;
    }
    const d = ts < 1e12 ? new Date(ts * 1000) : new Date(ts);
    setResult(d.toLocaleString());
  };

  const toTimestamp = () => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      setResult(null);
      return;
    }
    setResult(String(Math.floor(d.getTime() / 1000)));
  };

  const useNow = () => {
    setTimestamp(String(now));
    setResult(new Date().toLocaleString());
  };

  const copy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <ToolCard title="Timestamp" icon={Clock}>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Unix timestamp → Date</label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. 1700000000"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="text-sm h-9"
            />
            <Button size="sm" className="h-9 shrink-0" onClick={toDate}>
              Convert
            </Button>
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Date → Unix timestamp</label>
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="text-sm h-9"
            />
            <Button size="sm" className="h-9 shrink-0" onClick={toTimestamp}>
              Convert
            </Button>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full h-9" onClick={useNow}>
          Use current time
        </Button>

        {result && (
          <div className="rounded border border-zinc-600 bg-zinc-800 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">{result}</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={copy}>
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-zinc-500 font-mono">Now: {now}</p>
    </ToolCard>
  );
}
