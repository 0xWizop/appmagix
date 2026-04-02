"use client";

import { notFound } from "next/navigation";
import { QRGenerator } from "../components/qr-generator";
import { RegexTester } from "../components/regex-tester";
import { MarkdownPreview } from "../components/markdown-preview";
import { PasswordGenerator } from "../components/password-generator";
import { CssGradient } from "../components/css-gradient";
import { WordCounter } from "../components/word-counter";
import { HexExtractor } from "../components/hex-extractor";
import { Base64Tool } from "../components/base64-tool";
import { JsonValidator } from "../components/json-validator";
import { UrlEncoder } from "../components/url-encoder";
import { TimestampTool } from "../components/timestamp-tool";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";

const TOOLS_MAP = {
  qr: { name: "QR Code Generator", component: QRGenerator },
  regex: { name: "Regex Tester", component: RegexTester },
  markdown: { name: "Markdown Preview", component: MarkdownPreview },
  password: { name: "Password Generator", component: PasswordGenerator },
  gradient: { name: "CSS Gradient", component: CssGradient },
  wordcount: { name: "Word Counter", component: WordCounter },
  hex: { name: "Hex Color Extractor", component: HexExtractor },
  base64: { name: "Base64 Encoder/Decoder", component: Base64Tool },
  json: { name: "JSON Validator & Formatter", component: JsonValidator },
  url: { name: "URL Encoder & Decoder", component: UrlEncoder },
  timestamp: { name: "Timestamp Converter", component: TimestampTool },
} as const;

type ToolSlug = keyof typeof TOOLS_MAP;

export default function ToolDetailPage({ params }: { params: { slug: string } }) {
  const tool = TOOLS_MAP[params.slug as ToolSlug];
  const toast = useToast();

  if (!tool) {
    notFound();
  }

  const Component = tool.component;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/dashboard/web2/tools">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-medium">{tool.name}</h1>
            <p className="text-xs text-text-muted">Mini Tool</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 shrink-0">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      <div className="min-h-[500px]">
        <Component />
      </div>
    </div>
  );
}
