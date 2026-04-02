"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

export function MarkdownPreview() {
  const [md, setMd] = useState(`# Hello World\n\nThis is **bold** and *italic* text.\n\n- Item one\n- Item two\n- Item three\n\n\`const x = 42;\``);

  const html = useMemo(() => {
    const result = marked(md);
    return typeof result === "string" ? result : "";
  }, [md]);

  return (
    <Card className="border-border h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4 text-brand-green" /> Markdown Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full divide-x divide-border">
          <div className="flex flex-col p-4 overflow-hidden">
            <span className="text-[10px] text-text-muted mb-2 uppercase tracking-wider font-semibold">Markdown</span>
            <Textarea
              value={md}
              onChange={(e) => setMd(e.target.value)}
              className="flex-1 text-xs font-mono resize-none border-0 bg-transparent focus-visible:ring-0 p-0"
              placeholder="Write markdown here..."
            />
          </div>
          <div className="flex flex-col p-4 overflow-hidden bg-muted/20">
            <span className="text-[10px] text-text-muted mb-2 uppercase tracking-wider font-semibold">Preview</span>
            <div
              className="flex-1 overflow-y-auto prose prose-invert prose-sm max-w-none text-xs"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
