"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HexExtractor } from "./tools/hex-extractor";
import { FontPreview } from "./tools/font-preview";
import { Base64Tool } from "./tools/base64-tool";
import { TimestampTool } from "./tools/timestamp-tool";
import { CurrencyConverter } from "./tools/currency-converter";
import { ColorConverter } from "./tools/color-converter";
import { WebhookTester } from "./tools/webhook-tester";
import { FileConvert } from "./tools/file-convert";
import { UrlEncoder } from "./tools/url-encoder";
import { JsonValidator } from "./tools/json-validator";
import {
  Palette,
  FileCode,
  Globe,
  DollarSign,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const TOOL_CATEGORIES = {
  design: {
    label: "Design",
    icon: Palette,
    tools: [
      { id: "hex-extractor", name: "Hex Extractor", component: HexExtractor },
      { id: "color-converter", name: "Color Converter", component: ColorConverter },
      { id: "font-preview", name: "Font Preview", component: FontPreview },
    ],
  },
  data: {
    label: "Data & Encoding",
    icon: FileCode,
    tools: [
      { id: "base64", name: "Base64", component: Base64Tool },
      { id: "url-encoder", name: "URL Encoder", component: UrlEncoder },
      { id: "json-validator", name: "JSON Validator", component: JsonValidator },
      { id: "file-convert", name: "JSON/YAML/CSV", component: FileConvert },
      { id: "timestamp", name: "Timestamp", component: TimestampTool },
    ],
  },
  web: {
    label: "Web & API",
    icon: Globe,
    tools: [{ id: "webhook", name: "Webhook Tester", component: WebhookTester }],
  },
  finance: {
    label: "Utilities",
    icon: DollarSign,
    tools: [{ id: "currency", name: "Currency Converter", component: CurrencyConverter }],
  },
} as const;

type CategoryId = keyof typeof TOOL_CATEGORIES;

export default function PlaygroundPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("design");

  const filterTools = (tools: Array<{ id: string; name: string; component: React.ComponentType }>) => {
    if (!search.trim()) return tools;
    const q = search.toLowerCase();
    return tools.filter(
      (t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
    );
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="mb-6 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs
        value={activeCategory}
        onValueChange={(v) => setActiveCategory(v as CategoryId)}
        className="space-y-6"
      >
        <TabsList className="flex flex-wrap gap-1 h-auto p-0 bg-transparent border-0">
          {(Object.entries(TOOL_CATEGORIES) as [CategoryId, (typeof TOOL_CATEGORIES)[CategoryId]][]).map(
            ([id, cat]) => {
              const Icon = cat.icon;
              const filtered = filterTools([...cat.tools]);
              if (search && filtered.length === 0) return null;
              return (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="gap-2 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 data-[state=active]:border-zinc-600 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                  <span className="text-zinc-500 text-xs">
                    {search ? filtered.length : cat.tools.length}
                  </span>
                </TabsTrigger>
              );
            }
          )}
        </TabsList>

        {(Object.entries(TOOL_CATEGORIES) as [CategoryId, (typeof TOOL_CATEGORIES)[CategoryId]][]).map(
          ([id, cat]) => {
            const filtered = filterTools([...cat.tools]);
            if (filtered.length === 0) return null;
            return (
              <TabsContent key={id} value={id} className="mt-0">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((tool) => {
                    const Component = tool.component;
                    return (
                      <div key={tool.id} className="h-[320px]">
                        <Component />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            );
          }
        )}
      </Tabs>
    </div>
  );
}
