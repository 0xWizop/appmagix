"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Copy, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { useToast } from "@/lib/toast-context";

export function QRGenerator() {
  const [url, setUrl] = useState("https://");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      if (!url.trim() || url === "https://") { setDataUrl(null); return; }
      try {
        const du = await QRCode.toDataURL(url, { width: 256, margin: 2, color: { dark: "#ffffff", light: "#00000000" } });
        setDataUrl(du);
      } catch { setDataUrl(null); }
    }, 300);
  }, [url]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
    toast.success("QR code downloaded!");
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(url).then(() => toast.success("URL copied!"));
  };

  return (
    <Card className="border-border h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <QrCode className="h-4 w-4 text-brand-green" /> QR Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 overflow-auto">
        <div className="flex gap-2">
          <Input
            placeholder="https://yoursite.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 text-sm h-8"
          />
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={copyUrl}><Copy className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center justify-center py-4 bg-muted/30 rounded-lg">
          {dataUrl ? (
            <div className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dataUrl} alt="QR Code" className="w-40 h-40 rounded-lg bg-white p-2" />
              <button
                onClick={download}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity text-white text-xs gap-1"
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          ) : (
            <div className="w-40 h-40 rounded-lg bg-surface border border-dashed border-border flex items-center justify-center text-xs text-text-muted">
              QR preview
            </div>
          )}
        </div>
        {dataUrl && (
          <Button size="sm" className="w-full h-8" onClick={download}>
            <Download className="h-4 w-4 mr-2" /> Download PNG
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
