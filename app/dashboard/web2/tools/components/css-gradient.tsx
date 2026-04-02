"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Copy, Paintbrush } from "lucide-react";
import { useToast } from "@/lib/toast-context";

export function CssGradient() {
  const [color1, setColor1] = useState("#00D166");
  const [color2, setColor2] = useState("#0066FF");
  const [angle, setAngle] = useState([135]);
  const toast = useToast();

  const css = `background: linear-gradient(${angle[0]}deg, ${color1}, ${color2});`;

  const copy = () => {
    navigator.clipboard.writeText(css).then(() => toast.success("CSS copied!"));
  };

  return (
    <Card className="border-border h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Paintbrush className="h-4 w-4 text-brand-green" /> CSS Gradient
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 overflow-auto">
        <div
          className="h-32 rounded-xl border border-border transition-all duration-300 shadow-inner"
          style={{ background: `linear-gradient(${angle[0]}deg, ${color1}, ${color2})` }}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-semibold text-text-muted">Color 1</Label>
            <div className="flex gap-3 items-center p-2 bg-muted/20 rounded-lg border border-border">
              <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)}
                className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0" />
              <span className="text-xs font-mono text-text-primary uppercase">{color1}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-semibold text-text-muted">Color 2</Label>
            <div className="flex gap-3 items-center p-2 bg-muted/20 rounded-lg border border-border">
              <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)}
                className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0" />
              <span className="text-xs font-mono text-text-primary uppercase">{color2}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-text-muted">
            <Label className="uppercase font-semibold">Angle</Label>
            <span className="bg-muted px-2 py-0.5 rounded text-text-primary font-mono">{angle[0]}°</span>
          </div>
          <Slider value={angle} min={0} max={360} step={5} onValueChange={setAngle} />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-semibold text-text-muted">CSS Result</Label>
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-3">
            <code className="flex-1 text-xs font-mono text-text-secondary break-all">{css}</code>
            <button onClick={copy} className="hover:text-brand-green transition-colors shrink-0">
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Button size="sm" className="w-full h-10" onClick={copy}>
          <Copy className="h-4 w-4 mr-2" /> Copy CSS Gradient
        </Button>
      </CardContent>
    </Card>
  );
}
