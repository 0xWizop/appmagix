"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast-context";
import { Download, Upload, ImageIcon } from "lucide-react";

type ImageFormat = "png" | "jpeg" | "webp";

const FORMATS: { value: ImageFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
  { value: "webp", label: "WebP" },
];

function ConvertedImagePreview({ blob }: { blob: Blob }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Converted"
      className="max-h-48 rounded border border-border/50"
    />
  );
}

function convertImageToFormat(
  file: File,
  format: ImageFormat
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const mime = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
      const quality = format === "jpeg" || format === "webp" ? 0.92 : undefined;
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Conversion failed"));
        },
        mime,
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

export function ImageConverter() {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImageFormat>("png");
  const [preview, setPreview] = useState<string | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<"idle" | "converting" | "done" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setStatus("error");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setConvertedBlob(null);
    setStatus("idle");
  };

  const convert = async () => {
    if (!file) return;
    setStatus("converting");
    try {
      const blob = await convertImageToFormat(file, format);
      setConvertedBlob(blob);
      setStatus("done");
      toast.success("Converted", `${format.toUpperCase()} ready`);
    } catch {
      setStatus("error");
      toast.error("Conversion failed");
    }
  };

  const download = () => {
    if (!convertedBlob) return;
    const ext = format === "jpeg" ? "jpg" : format;
    const name = file?.name.replace(/\.[^.]+$/, "") ?? "converted";
    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download started");
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setConvertedBlob(null);
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className="relative rounded-lg border border-dashed border-border bg-surface hover:border-brand-green hover:bg-surface-hover transition-colors cursor-pointer min-h-[200px] flex flex-col items-center justify-center gap-3 p-8"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        {preview ? (
          <div className="flex items-center gap-6 w-full justify-center flex-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="max-h-32 rounded border border-border/50 object-contain"
            />
            <div className="text-left">
              <p className="text-sm text-text-primary">{file?.name}</p>
              <p className="text-xs text-text-muted mt-1">
                {file && `${(file.size / 1024).toFixed(1)} KB`}
              </p>
            </div>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-text-muted" />
            <p className="text-sm text-text-secondary">
              Drop image or click to upload
            </p>
            <p className="text-xs text-text-muted">
              PNG · JPEG · WebP · GIF · BMP
            </p>
          </>
        )}
      </div>

      {/* Format select + Convert */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Convert to</span>
          <div className="flex gap-1">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFormat(f.value)}
                className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                  format === f.value
                    ? "border-brand-green bg-brand-green-dark text-white"
                    : "border-border/50 text-text-secondary hover:border-border"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <Button
          onClick={convert}
          disabled={!file}
          size="sm"
          className="h-9 bg-brand-green text-black hover:bg-brand-green/90"
        >
          {status === "converting" ? (
            <span className="animate-pulse">Converting...</span>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              Convert
            </>
          )}
        </Button>
        {(file || convertedBlob) && (
          <Button variant="ghost" size="sm" onClick={reset} className="h-9">
            Reset
          </Button>
        )}
      </div>

      {/* Result */}
      {status === "done" && convertedBlob && (
        <div className="rounded-lg border border-border/50 bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-surface">
            <span className="text-xs text-text-muted">Output</span>
            <Button
              size="sm"
              onClick={download}
              className="h-7 text-xs bg-brand-green text-black hover:bg-brand-green/90"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>
          </div>
          <div className="p-4 flex justify-center bg-background">
            <ConvertedImagePreview blob={convertedBlob} />
          </div>
          <p className="px-3 py-2 text-xs text-text-muted border-t border-border/50">
            {(convertedBlob.size / 1024).toFixed(1)} KB · {format.toUpperCase()}
          </p>
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-red-400">Conversion failed.</p>
      )}
    </div>
  );
}
