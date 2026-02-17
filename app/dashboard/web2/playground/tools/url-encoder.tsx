"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/lib/toast-context";
import { ToolCard } from "./tool-card";
import { Link2, Copy, Check, ArrowRightLeft } from "lucide-react";

export function UrlEncoder() {
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
        setOutput(encodeURIComponent(input));
        toast.success("Encoded");
      } else {
        setOutput(decodeURIComponent(input));
        toast.success("Decoded");
      }
    } catch {
      const msg = mode === "decode" ? "Invalid URL-encoded string" : "Encoding failed";
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
      toast.success("Copied");
    }
  };

  return (
    <ToolCard title="URL Encoder" icon={Link2}>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setMode("encode")}
          className={`flex-1 py-2 rounded text-xs font-medium transition-colors ${
            mode === "encode"
              ? "bg-brand-green text-black"
              : "border-zinc-600 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Encode
        </button>
        <button
          type="button"
          onClick={() => setMode("decode")}
          className={`flex-1 py-2 rounded text-xs font-medium transition-colors ${
            mode === "decode"
              ? "bg-brand-green text-black"
              : "border-zinc-600 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Decode
        </button>
      </div>

      <Textarea
        placeholder={mode === "encode" ? "Text to encode..." : "URL-encoded text to decode..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="min-h-[70px] text-sm resize-none"
      />

      <Button size="sm" className="w-full h-9 bg-brand-green text-black hover:bg-brand-green/90" onClick={convert}>
        <ArrowRightLeft className="h-4 w-4 mr-2" />
        {mode === "encode" ? "Encode" : "Decode"}
      </Button>

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Output</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={copyOutput}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Textarea readOnly value={output} className="min-h-[70px] text-sm resize-none bg-surface" />
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </ToolCard>
  );
}
