"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolCard } from "./tool-card";
import { Type } from "lucide-react";

const FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Source Sans 3",
  "Playfair Display",
  "Merriweather",
  "Space Grotesk",
  "DM Sans",
  "Outfit",
  "Plus Jakarta Sans",
];

const SIZES = [12, 14, 16, 18, 24, 32, 48];
const WEIGHTS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
];

export function FontPreview() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog");
  const [font, setFont] = useState("Inter");
  const [size, setSize] = useState(24);
  const [weight, setWeight] = useState("400");

  const fontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(" ", "+")}:wght@${weight}&display=swap`;

  return (
    <ToolCard title="Font Preview" icon={Type}>
      <link href={fontUrl} rel="stylesheet" />
      <div className="space-y-4">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to preview"
          className="text-sm h-9"
        />

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Font</label>
            <Select value={font} onValueChange={setFont}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => (
                  <SelectItem key={f} value={f} style={{ fontFamily: f }} className="text-xs">
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Size</label>
            <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZES.map((s) => (
                  <SelectItem key={s} value={String(s)} className="text-xs">
                    {s}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Weight</label>
            <Select value={weight} onValueChange={setWeight}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEIGHTS.map((w) => (
                  <SelectItem key={w.value} value={w.value} className="text-xs">
                    {w.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 rounded border border-zinc-600 bg-zinc-800 min-h-[80px] flex items-center">
          <p
            style={{
              fontFamily: `"${font}", sans-serif`,
              fontSize: `${size}px`,
              fontWeight: weight,
            }}
            className="text-zinc-200 break-words"
          >
            {text || "Enter text above"}
          </p>
        </div>

        <p className="text-xs text-zinc-500 font-mono">
          font-family: &quot;{font}&quot;; font-size: {size}px; font-weight: {weight};
        </p>
      </div>
    </ToolCard>
  );
}
