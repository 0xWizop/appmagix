"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/lib/toast-context";
import { ToolCard } from "./tool-card";
import { Braces, Check, X } from "lucide-react";

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
    <ToolCard title="JSON Validator" icon={Braces}>
      <Textarea
        placeholder='Paste JSON here... e.g. {"key": "value"}'
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setValid(null);
          setError(null);
        }}
        className="min-h-[120px] text-sm font-mono resize-none"
      />

      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={validate}
          className="flex-1 min-w-[80px] py-2 rounded text-xs font-medium bg-brand-green text-black hover:bg-brand-green/90 transition-colors"
        >
          Validate
        </button>
        <button
          type="button"
          onClick={format}
          className="flex-1 min-w-[80px] py-2 rounded border text-xs font-medium border-zinc-600 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors"
        >
          Pretty
        </button>
        <button
          type="button"
          onClick={minify}
          className="flex-1 min-w-[80px] py-2 rounded border text-xs font-medium border-zinc-600 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors"
        >
          Minify
        </button>
      </div>

      {valid !== null && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg border ${
            valid
              ? "border-brand-green bg-brand-green-dark text-white"
              : "border-red-500 bg-red-950 text-red-400"
          }`}
        >
          {valid ? (
            <Check className="h-4 w-4 shrink-0" />
          ) : (
            <X className="h-4 w-4 shrink-0" />
          )}
          <span className="text-sm">
            {valid ? "Valid JSON" : error || "Invalid JSON"}
          </span>
        </div>
      )}
    </ToolCard>
  );
}
