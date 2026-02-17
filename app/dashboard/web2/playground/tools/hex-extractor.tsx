"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast-context";
import { ToolCard } from "./tool-card";
import { Palette, Upload, Copy, Check } from "lucide-react";

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export function HexExtractor() {
  const toast = useToast();
  const [colors, setColors] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        const colorMap: Record<string, number> = {};
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;
          const hex = rgbToHex(r, g, b);
          colorMap[hex] = (colorMap[hex] ?? 0) + 1;
        }

        const sorted = Object.entries(colorMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([hex]) => hex);

        setColors(sorted);
        setPreview(ev.target?.result as string);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(colors.join("\n"));
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied all colors");
  };

  const copyOne = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied", hex);
  };

  return (
    <ToolCard title="Hex Color Extractor" icon={Palette}>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded border border-dashed border-zinc-600 bg-zinc-800 hover:border-zinc-500 cursor-pointer min-h-[80px] flex flex-col items-center justify-center gap-2 p-4" style={{ minHeight: "80px" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <Upload className="h-8 w-8 text-zinc-500" />
          <span className="text-sm text-zinc-400">Drop image or click</span>
          <span className="text-xs text-zinc-500">PNG, JPG, GIF, WebP</span>
        </div>

        {preview && (
          <>
            <div className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded border border-zinc-600 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5">
                  {colors.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => copyOne(hex)}
                      className="group/btn flex items-center gap-1.5 rounded border border-zinc-600 bg-zinc-800 hover:border-zinc-500 px-2 py-1 text-xs text-zinc-300 transition-colors"
                    >
                      <div
                        className="w-6 h-6 rounded shrink-0 border border-zinc-600"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-xs">{hex}</span>
                      {copied === hex ? (
                        <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                      ) : (
                        <Copy className="h-3 w-3 opacity-50 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" onClick={copyAll}>
                  {copied === "all" ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  Copy all
                </Button>
              </div>
            </div>
          </>
        )}
      </ToolCard>
  );
}
