"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/lib/toast-context";
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
    <Card className="border-border h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Binary className="h-4 w-4 text-brand-green" /> Base64 Encoder/Decoder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-auto">
        <div className="flex p-1 bg-muted/30 rounded-lg border border-border">
          <button
            onClick={() => setMode("encode")}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === "encode"
                ? "bg-brand-green text-white shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode("decode")}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === "decode"
                ? "bg-brand-green text-white shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Decode
          </button>
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder={mode === "encode" ? "Text to encode..." : "Base64 to decode..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px] text-sm resize-none font-mono"
          />
        </div>

        <Button size="sm" className="w-full h-9" onClick={convert}>
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          {mode === "encode" ? "Encode to Base64" : "Decode from Base64"}
        </Button>

        {output && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold text-text-muted">Result</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={copyOutput}>
                {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                Copy Output
              </Button>
            </div>
            <div className="p-3 bg-muted/20 border border-border rounded-lg break-all font-mono text-xs min-h-[80px]">
              {output}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      </CardContent>
    </Card>
  );
}
