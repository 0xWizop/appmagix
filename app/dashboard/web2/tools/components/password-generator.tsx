"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { KeyRound, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { cn } from "@/lib/utils";

const CHARS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generatePassword(length: number, opts: { upper: boolean; digits: boolean; symbols: boolean }) {
  let pool = CHARS.lower;
  if (opts.upper) pool += CHARS.upper;
  if (opts.digits) pool += CHARS.digits;
  if (opts.symbols) pool += CHARS.symbols;
  if (!pool) pool = CHARS.lower;
  let pw = "";
  for (let i = 0; i < length; i++) {
    pw += pool[Math.floor(Math.random() * pool.length)];
  }
  return pw;
}

function strengthLabel(pw: string): { label: string; color: string } {
  const score = [/[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/, /.{12,}/, /.{16,}/].filter((r) => r.test(pw)).length;
  if (score <= 1) return { label: "Weak", color: "text-red-400" };
  if (score <= 2) return { label: "Fair", color: "text-amber-400" };
  if (score <= 3) return { label: "Strong", color: "text-brand-green" };
  return { label: "Very Strong", color: "text-brand-green" };
}

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, digits: true, symbols: false });
  const [pw, setPw] = useState(() => generatePassword(16, { upper: true, digits: true, symbols: false }));
  const toast = useToast();

  const regen = useCallback(() => {
    setPw(generatePassword(length, opts));
  }, [length, opts]);

  const toggleOpt = (key: keyof typeof opts) => {
    const next = { ...opts, [key]: !opts[key] };
    setOpts(next);
    setPw(generatePassword(length, next));
  };

  const handleLengthChange = (val: number[]) => {
    setLength(val[0]);
    setPw(generatePassword(val[0], opts));
  };

  const copy = () => {
    navigator.clipboard.writeText(pw).then(() => toast.success("Password copied!"));
  };

  const { label, color } = strengthLabel(pw);

  return (
    <Card className="border-border h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-brand-green" /> Password Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 overflow-auto">
        <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg border border-border group relative transition-colors hover:border-brand-green/30">
          <code className="flex-1 text-sm font-mono break-all text-text-primary pr-12">{pw}</code>
          <div className="absolute right-3 flex items-center gap-1">
            <button onClick={regen} className="p-1.5 hover:text-brand-green transition-colors text-text-muted" title="Regenerate">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button onClick={copy} className="p-1.5 hover:text-brand-green transition-colors text-text-muted" title="Copy">
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted uppercase font-semibold">Strength:</span>
          <span className={cn("text-sm font-bold", color)}>{label}</span>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-text-muted">
            <Label className="uppercase font-semibold">Length</Label>
            <span className="bg-muted px-2 py-0.5 rounded text-text-primary font-mono">{length}</span>
          </div>
          <Slider value={[length]} min={8} max={64} step={1} onValueChange={handleLengthChange} />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-text-muted uppercase font-semibold">Options</Label>
          <div className="flex flex-wrap gap-2">
            {(["upper", "digits", "symbols"] as const).map((key) => {
              const labels = { upper: "Uppercase (A–Z)", digits: "Numbers (0–9)", symbols: "Symbols (!@#$)" };
              return (
                <button
                  key={key}
                  onClick={() => toggleOpt(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs border transition-all h-9 flex items-center gap-2",
                    opts[key]
                      ? "bg-brand-green/20 border-brand-green/40 text-brand-green"
                      : "bg-surface border-border text-text-muted hover:border-brand-green/20"
                  )}
                >
                  <div className={cn("h-3 w-3 rounded-full border", opts[key] ? "bg-brand-green border-brand-green" : "border-muted-foreground")} />
                  {labels[key]}
                </button>
              );
            })}
          </div>
        </div>

        <Button size="sm" className="w-full h-10" onClick={copy}>
          <Copy className="h-4 w-4 mr-2" /> Copy Password
        </Button>
      </CardContent>
    </Card>
  );
}
