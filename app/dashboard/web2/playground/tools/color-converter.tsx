"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast-context";
import { ToolCard } from "./tool-card";
import { Copy, Check, Droplets } from "lucide-react";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let h = hex.replace(/^#/, "");
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const match = h.match(/(.{2})(.{2})(.{2})/);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function ColorConverter() {
  const toast = useToast();
  const [hex, setHex] = useState("#22c55e");
  const [rgb, setRgb] = useState({ r: 34, g: 197, b: 98 });
  const [hsl, setHsl] = useState({ h: 142, s: 71, l: 45 });
  const [copied, setCopied] = useState<string | null>(null);

  const updateFromHex = (h: string) => {
    setHex(h);
    const rgbVal = hexToRgb(h);
    if (rgbVal) {
      setRgb(rgbVal);
      setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b));
    }
  };

  const updateFromRgb = (r: number, g: number, b: number) => {
    setRgb({ r, g, b });
    setHex(rgbToHex(r, g, b));
    setHsl(rgbToHsl(r, g, b));
  };

  const updateFromHsl = (h: number, s: number, l: number) => {
    setHsl({ h, s, l });
    const rgbVal = hslToRgb(h, s, l);
    setRgb(rgbVal);
    setHex(rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b));
  };

  const copy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied", value);
  };

  return (
    <ToolCard title="Color Converter" icon={Droplets}>
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded border border-zinc-600 shrink-0"
            style={{ backgroundColor: hex }}
          />
          <div className="flex-1">
            <label className="text-xs text-zinc-500 mb-1 block">Hex</label>
            <div className="flex gap-1">
              <Input
                value={hex}
                onChange={(e) => updateFromHex(e.target.value)}
                className="text-sm h-8 flex-1"
              />
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => copy(hex)}>
                {copied === hex ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 mb-1 block">RGB</label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              max={255}
              value={rgb.r}
              onChange={(e) => updateFromRgb(parseInt(e.target.value) || 0, rgb.g, rgb.b)}
              className="text-sm h-8"
            />
            <Input
              type="number"
              min={0}
              max={255}
              value={rgb.g}
              onChange={(e) => updateFromRgb(rgb.r, parseInt(e.target.value) || 0, rgb.b)}
              className="text-sm h-8"
            />
            <Input
              type="number"
              min={0}
              max={255}
              value={rgb.b}
              onChange={(e) => updateFromRgb(rgb.r, rgb.g, parseInt(e.target.value) || 0)}
              className="text-sm h-8"
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            rgb({rgb.r}, {rgb.g}, {rgb.b})
          </p>
        </div>

        <div>
          <label className="text-xs text-zinc-500 mb-1 block">HSL</label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              max={360}
              value={hsl.h}
              onChange={(e) => updateFromHsl(parseInt(e.target.value) || 0, hsl.s, hsl.l)}
              className="text-sm h-8"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={hsl.s}
              onChange={(e) => updateFromHsl(hsl.h, parseInt(e.target.value) || 0, hsl.l)}
              className="text-sm h-8"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={hsl.l}
              onChange={(e) => updateFromHsl(hsl.h, hsl.s, parseInt(e.target.value) || 0)}
              className="text-sm h-8"
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
          </p>
        </div>
      </ToolCard>
  );
}
