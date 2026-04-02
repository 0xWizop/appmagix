"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/lib/toast-context";
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
    <Card className="border-border h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Palette className="h-4 w-4 text-brand-green" /> Hex Color Extractor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 overflow-auto">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl border border-dashed border-border bg-muted/20 hover:border-brand-green/50 hover:bg-muted/30 cursor-pointer min-h-[120px] flex flex-col items-center justify-center gap-2 p-6 transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <div className="h-10 w-10 rounded-full bg-brand-green/10 flex items-center justify-center group-hover:bg-brand-green/20 transition-colors">
            <Upload className="h-5 w-5 text-brand-green" />
          </div>
          <div className="text-center">
            <span className="text-sm font-medium text-text-primary block">Drop image or click</span>
            <span className="text-xs text-text-muted">PNG, JPG, GIF, WebP</span>
          </div>
        </div>

        {preview && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex gap-4 items-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg border border-border shadow-sm shrink-0 bg-white"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] uppercase font-semibold text-text-muted">Extracted Palette</span>
                   <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={copyAll}>
                    {copied === "all" ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    Copy all
                  </Button>
                </div>
                <div className="grid grid-cols-3 xs:grid-cols-4 gap-2">
                  {colors.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => copyOne(hex)}
                      title={`Copy ${hex}`}
                      className="group/btn flex flex-col items-center gap-1.5 rounded-lg border border-border bg-surface hover:border-brand-green/40 hover:bg-brand-green/5 p-1.5 transition-all"
                    >
                      <div
                        className="w-full aspect-square rounded border border-border"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="font-mono text-[9px] text-text-secondary uppercase">{hex}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
