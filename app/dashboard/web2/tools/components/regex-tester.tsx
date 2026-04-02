"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Regex } from "lucide-react";
import { cn } from "@/lib/utils";

export function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testStr, setTestStr] = useState("Hello World 123");

  const result = useMemo(() => {
    if (!pattern) return { matches: [], error: null, highlighted: testStr };
    try {
      const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const matches: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = re.exec(testStr)) !== null) {
        matches.push(m[0]);
        if (!flags.includes("g")) break;
      }
      // Build highlighted version
      const highlighted = testStr.replace(
        new RegExp(pattern, flags.includes("g") ? flags : flags + "g"),
        (match) => `<mark class="bg-brand-green/30 text-brand-green rounded px-0.5">${match}</mark>`
      );
      return { matches, error: null, highlighted };
    } catch (e) {
      return { matches: [], error: (e as Error).message, highlighted: testStr };
    }
  }, [pattern, flags, testStr]);

  return (
    <Card className="border-border h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Regex className="h-4 w-4 text-brand-green" /> Regex Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 overflow-auto">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-[10px] mb-1 block text-text-muted uppercase">Pattern</Label>
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="[A-Z][a-z]+"
              className="text-sm font-mono h-8"
            />
          </div>
          <div className="w-20">
            <Label className="text-[10px] mb-1 block text-text-muted uppercase">Flags</Label>
            <Input value={flags} onChange={(e) => setFlags(e.target.value)} className="text-sm font-mono h-8" />
          </div>
        </div>
        <div>
          <Label className="text-[10px] mb-1 block text-text-muted uppercase">Test String</Label>
          <Textarea
            value={testStr}
            onChange={(e) => setTestStr(e.target.value)}
            className="text-sm font-mono min-h-[80px] resize-none"
          />
        </div>
        {result.error ? (
          <p className="text-xs text-red-400 font-mono">{result.error}</p>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-text-muted uppercase">Result Preview</Label>
              <div
                className="text-sm font-mono bg-surface border border-border rounded-md p-3 min-h-[48px] whitespace-pre-wrap break-all"
                dangerouslySetInnerHTML={{ __html: result.highlighted }}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-text-muted">{result.matches.length} match{result.matches.length !== 1 ? "es" : ""}</span>
              {result.matches.slice(0, 5).map((m, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-mono">{m}</Badge>
              ))}
              {result.matches.length > 5 && <span className="text-xs text-text-muted">+{result.matches.length - 5} more</span>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
