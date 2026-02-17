"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/lib/toast-context";
import { ToolCard } from "./tool-card";
import { Binary, Copy, Check, ArrowRightLeft } from "lucide-react";

export function Base64Tool() {
  const toast = useToast();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = () => {
    setError(null);
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
        toast.success("Encoded successfully");
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
        toast.success("Decoded successfully");
      }
    } catch {
      const msg = mode === "decode" ? "Invalid Base64 string" : "Encoding failed";
      setError(msg);
      setOutput("");
      toast.error(msg);
    }
  };

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <ToolCard title="Base64" icon={Binary}>
      <div className="flex gap-1">
        <button
          onClick={() => setMode("encode")}
          className={`flex-1 py-2 rounded border text-xs font-medium transition-colors ${
            mode === "encode"
              ? "border-zinc-500 bg-zinc-600 text-zinc-100"
              : "border-zinc-600 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Encode
        </button>
        <button
          onClick={() => setMode("decode")}
          className={`flex-1 py-2 rounded border text-xs font-medium transition-colors ${
            mode === "decode"
              ? "border-zinc-500 bg-zinc-600 text-zinc-100"
              : "border-zinc-600 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Decode
        </button>
      </div>

        <Textarea
          placeholder={mode === "encode" ? "Text to encode..." : "Base64 to decode..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[80px] text-sm resize-none"
        />

        <Button size="sm" variant="secondary" className="w-full h-9 bg-zinc-700 hover:bg-zinc-600 text-zinc-100" onClick={convert}>
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          {mode === "encode" ? "Encode" : "Decode"}
        </Button>

        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Output</span>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={copyOutput}>
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Textarea readOnly value={output} className="min-h-[80px] text-sm resize-none bg-zinc-800" />
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}
    </ToolCard>
  );
}
