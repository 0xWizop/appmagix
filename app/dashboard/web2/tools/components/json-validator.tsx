"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast-context";
import { Braces, Check, X, ClipboardCheck, Trash2 } from "lucide-react";

export function JsonValidator() {
  const toast = useToast();
  const [input, setInput] = useState("");
  const [valid, setValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!input.trim()) {
      setValid(null);
      setError(null);
      return;
    }
    try {
      JSON.parse(input);
      setValid(true);
      setError(null);
      toast.success("Valid JSON");
    } catch (e) {
      setValid(false);
      setError(e instanceof Error ? e.message : "Invalid JSON");
      toast.error("Invalid JSON");
    }
  };

  const format = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
      setValid(true);
      setError(null);
      toast.success("Formatted");
    } catch {
      toast.error("Invalid JSON - cannot format");
    }
  };

  const minify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setValid(true);
      setError(null);
      toast.success("Minified");
    } catch {
      toast.error("Invalid JSON - cannot minify");
    }
  };

  return (
    <Card className="border-border h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Braces className="h-4 w-4 text-brand-green" /> JSON Validator & Formatter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-auto">
        <div className="relative">
          <Textarea
            placeholder='Paste JSON here... e.g. {"key": "value"}'
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setValid(null);
              setError(null);
            }}
            className="min-h-[200px] text-sm font-mono resize-none pr-10"
          />
          {input && (
            <button
              onClick={() => { setInput(""); setValid(null); setError(null); }}
              className="absolute top-2 right-2 p-1 text-text-muted hover:text-red-400 transition-colors"
              title="Clear"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={validate}
            className="flex-1 h-9 bg-brand-green text-white hover:bg-brand-green/90"
          >
            Validate
          </Button>
          <Button
            variant="outline"
            onClick={format}
            className="flex-1 h-9"
          >
            Beautify
          </Button>
          <Button
            variant="outline"
            onClick={minify}
            className="flex-1 h-9"
          >
            Minify
          </Button>
        </div>

        {valid !== null && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border animate-in fade-in zoom-in-95 duration-200 ${
              valid
                ? "border-brand-green/30 bg-brand-green/5 text-brand-green"
                : "border-red-500/30 bg-red-500/5 text-red-500"
            }`}
          >
            {valid ? (
              <ClipboardCheck className="h-5 w-5 shrink-0 mt-0.5" />
            ) : (
              <X className="h-5 w-5 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <span className="text-sm font-bold block">
                {valid ? "JSON is Valid" : "Invalid JSON"}
              </span>
              {error && <p className="text-xs font-mono mt-1 break-all opacity-80">{error}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
