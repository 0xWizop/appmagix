"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/lib/toast-context";
import { Clock, Copy, Check, Calendar } from "lucide-react";

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
    <Card className="border-border h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-green" /> Timestamp Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 overflow-auto">
        <div className="space-y-2">
          <label className="text-[10px] text-text-muted uppercase font-semibold">Unix timestamp → Date</label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. 1700000000"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="text-sm h-9 font-mono bg-muted/20"
            />
            <Button size="sm" className="h-9 shrink-0 bg-brand-green text-white" onClick={toDate}>
              Convert
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-text-muted uppercase font-semibold">Date → Unix timestamp</label>
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="text-sm h-9 bg-muted/20"
            />
            <Button size="sm" className="h-9 shrink-0 bg-brand-green text-white" onClick={toTimestamp}>
              Convert
            </Button>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full h-9 hover:border-brand-green hover:text-brand-green transition-colors" onClick={useNow}>
          <Calendar className="h-3.5 w-3.5 mr-2" />
          Use Current Time
        </Button>

        {result && (
          <div className="rounded-xl border border-brand-green/30 bg-brand-green/5 p-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-brand-green/70 block mb-1">Result</span>
                <span className="text-base font-mono text-brand-green break-all leading-none">{result}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-brand-green hover:bg-brand-green/10" onClick={copy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border flex items-center justify-between">
           <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Current Unix Epoch</span>
           <span className="text-xs font-bold font-mono text-brand-green">{now}</span>
        </div>
      </CardContent>
    </Card>
  );
}
