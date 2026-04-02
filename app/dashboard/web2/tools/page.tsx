"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Wrench,
  QrCode,
  Regex,
  FileText,
  KeyRound,
  Paintbrush,
  AlignLeft,
  Search,
  Palette,
  ArrowRight,
  Code,
  Globe,
  Database,
  Type,
  Activity as ActivityIcon,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Binary = (props: any) => <Code {...props} />;
const Braces = (props: any) => <Code {...props} />;
const Link2 = (props: any) => <Globe {...props} />;
const Clock = (props: any) => <ActivityIcon {...props} />;

const CATEGORIES = [
  { id: "all", label: "All Tools", icon: Wrench },
  { id: "generate", label: "Generate", icon: QrCode },
  { id: "text", label: "Text & Code", icon: Type },
  { id: "utilities", label: "Misc Tools", icon: Wrench },
];

const TOOLS = [
  {
    id: "qr",
    slug: "qr",
    name: "QR Code Generator",
    description: "Generate high-quality QR codes for URLs and text.",
    icon: QrCode,
    category: "generate",
    tags: ["qr", "code", "url"]
  },
  {
    id: "password",
    slug: "password",
    name: "Password Generator",
    description: "Create secure, random passwords with custom settings.",
    icon: KeyRound,
    category: "generate",
    tags: ["password", "secret", "security"]
  },
  {
    id: "gradient",
    slug: "gradient",
    name: "CSS Gradient",
    description: "Visual tool to create and copy CSS3 linear gradients.",
    icon: Paintbrush,
    category: "generate",
    tags: ["css", "gradient", "color", "design"]
  },
  {
    id: "hex",
    slug: "hex",
    name: "Hex Color Extractor",
    description: "Extract color palettes from images automatically.",
    icon: Palette,
    category: "generate",
    tags: ["palette", "color", "image", "hex"]
  },
  {
    id: "markdown",
    slug: "markdown",
    name: "Markdown Preview",
    description: "Write and preview GFM markdown in real-time.",
    icon: FileText,
    category: "text",
    tags: ["markdown", "preview", "text"]
  },
  {
    id: "wordcount",
    slug: "wordcount",
    name: "Word Counter",
    description: "Detailed analysis of text: words, chars, read time.",
    icon: AlignLeft,
    category: "text",
    tags: ["word", "count", "characters"]
  },
  {
    id: "regex",
    slug: "regex",
    name: "Regex Tester",
    description: "Test your regular expressions with live highlighting.",
    icon: Regex,
    category: "text",
    tags: ["regex", "pattern", "test"]
  },
  {
    id: "base64",
    slug: "base64",
    name: "Base64 Tool",
    description: "Encode and decode text to/from Base64 format.",
    icon: Binary,
    category: "text",
    tags: ["base64", "encode", "decode", "binary"]
  },
  {
    id: "json",
    slug: "json",
    name: "JSON Validator",
    description: "Format, minify and validate JSON data.",
    icon: Braces,
    category: "text",
    tags: ["json", "format", "validate"]
  },
  {
    id: "url",
    slug: "url",
    name: "URL Encoder",
    description: "Safe URL encoding and decoding for web strings.",
    icon: Link2,
    category: "text",
    tags: ["url", "encode", "decode"]
  },
  {
    id: "timestamp",
    slug: "timestamp",
    name: "Timestamp Tool",
    description: "Convert Unix timestamps to readable dates and back.",
    icon: Clock,
    category: "utilities",
    tags: ["clock", "time", "unix", "epoch"]
  },
];

export default function ToolsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = TOOLS.filter((tool) => {
    const matchesSearch = search.trim() === "" ||
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase()) ||
      tool.tags.some(t => t.includes(search.toLowerCase()));

    const matchesCategory = activeCategory === "all" || tool.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-green/20 flex items-center justify-center">
            <Wrench className="h-6 w-6 text-brand-green" />
          </div>
          Mini Tools
        </h1>
        <p className="text-text-secondary mt-3 text-sm leading-relaxed">
          Handy developer and designer utilities for everyday tasks. No installs, no uploads, everything runs in your browser.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-muted/30"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 w-full no-scrollbar">
          {CATEGORIES.map((cat) => {
             const Icon = cat.icon;
             return (
               <button
                 key={cat.id}
                 onClick={() => setActiveCategory(cat.id)}
                 className={cn(
                   "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                   activeCategory === cat.id
                     ? "bg-brand-green text-white shadow-lg shadow-brand-green/25"
                     : "bg-surface border border-border text-text-muted hover:border-brand-green/50 hover:text-brand-green"
                 )}
               >
                 <Icon className="h-3.5 w-3.5" />
                 {cat.label}
               </button>
             );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="h-6 w-6 text-text-muted" />
          </div>
          <h3 className="text-lg font-medium">No tools found</h3>
          <p className="text-text-muted text-sm mt-1">Try searching for something else or browse all tools.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((tool) => (
            <Link key={tool.id} href={`/dashboard/web2/tools/${tool.slug}`} className="group">
              <Card className="h-full border-border bg-surface transition-all duration-300 group-hover:border-brand-green/50 group-hover:shadow-xl group-hover:shadow-brand-green/5 flex flex-col">
                <CardHeader className="p-5 pb-3">
                   <div className="h-10 w-10 rounded-lg bg-brand-green/10 flex items-center justify-center group-hover:bg-brand-green/20 transition-colors mb-3">
                     <tool.icon className="h-5 w-5 text-brand-green" />
                   </div>
                   <CardTitle className="text-base group-hover:text-brand-green transition-colors">{tool.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 flex-1">
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                  <div className="mt-4 flex items-center text-[10px] font-bold text-brand-green opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                    Open Tool
                    <ArrowRight className="ml-1.5 h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
