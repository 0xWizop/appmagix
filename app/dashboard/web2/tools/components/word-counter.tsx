"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlignLeft } from "lucide-react";
import { useState } from "react";

function analyze(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\n+/).filter((p) => p.trim()).length : 0;
  const readingMinutes = Math.ceil(words / 238); // avg reading speed
  return { words, chars, charsNoSpace, sentences, paragraphs, readingMinutes };
}

export function WordCounter() {
  const [text, setText] = useState(
    "Paste or type your text here to count words, characters, sentences, and estimate reading time."
  );

  const stats = useMemo(() => analyze(text), [text]);

  const items = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.chars },
    { label: "No spaces", value: stats.charsNoSpace },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Read time", value: `~${stats.readingMinutes} min` },
  ];

  return (
    <Card className="border-border h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlignLeft className="h-4 w-4 text-brand-green" /> Word Counter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-auto">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="min-h-[160px] text-sm resize-none"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map(({ label, value }) => (
            <div key={label} className="bg-muted/20 border border-border rounded-lg p-3 text-center">
              <div className="text-xl font-bold tabular-nums text-brand-green">{value}</div>
              <div className="text-[10px] text-text-muted mt-1 uppercase font-semibold">{label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
