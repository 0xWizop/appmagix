"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface InteractiveCodeSnippetProps {
  code: string;
  language?: string;
  className?: string;
}

export function InteractiveCodeSnippet({
  code,
  language = "javascript",
  className,
}: InteractiveCodeSnippetProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className={cn("relative group rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest leading-none">
          {language}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <pre className="p-4 text-xs sm:text-sm font-mono text-zinc-300 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}
