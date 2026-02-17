"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast-context";
import { Download, Upload, Video, Loader2 } from "lucide-react";

type VideoFormat = "mp4" | "webm";

function VideoPreview({ blob }: { blob: Blob }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  if (!url) return null;
  return (
    <video
      src={url}
      controls
      className="w-full max-h-64 rounded border border-border/50"
    />
  );
}

export function VideoConverter() {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<VideoFormat>("mp4");
  const [status, setStatus] = useState<"idle" | "loading" | "converting" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initFFmpeg = async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { fetchFile } = await import("@ffmpeg/util");
    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress: p }) => setProgress(Math.round(p * 100)));
    await ffmpeg.load();
    return { ffmpeg, fetchFile };
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setStatus("error");
      setErrorMsg("Please select a video file");
      return;
    }
    setFile(f);
    setConvertedBlob(null);
    setStatus("idle");
    setErrorMsg(null);
  };

  const convert = async () => {
    if (!file) return;
    setStatus("loading");
    setErrorMsg(null);
    try {
      const { ffmpeg, fetchFile } = await initFFmpeg();
      setStatus("converting");
      setProgress(0);

      const ext = file.name.match(/\.[^.]+$/)?.[0] ?? ".mp4";
      const inputName = "input" + ext;
      const outputName = format === "mp4" ? "output.mp4" : "output.webm";

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      if (format === "mp4") {
        await ffmpeg.exec(["-i", inputName, "-c:v", "libx264", "-preset", "fast", outputName]);
      } else {
        await ffmpeg.exec(["-i", inputName, "-c:v", "libvpx-vp9", "-b:v", "0", outputName]);
      }

      const data = await ffmpeg.readFile(outputName);
      const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
      const blob = new Blob([bytes], { type: format === "mp4" ? "video/mp4" : "video/webm" });
      setConvertedBlob(blob);
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Conversion failed");
    }
  };

  const download = () => {
    if (!convertedBlob) return;
    const ext = format;
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
    setFile(null);
    setConvertedBlob(null);
    setStatus("idle");
    setErrorMsg(null);
    setProgress(0);
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
          accept="video/*"
          onChange={handleFile}
          className="hidden"
        />
        {file ? (
          <div className="text-center">
            <Video className="h-10 w-10 text-brand-green mx-auto mb-2" />
            <p className="text-sm text-text-primary">{file.name}</p>
            <p className="text-xs text-text-muted mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-text-muted" />
            <p className="text-sm text-text-secondary">
              Drop video or click to upload
            </p>
            <p className="text-xs text-text-muted">
              MP4 · WebM · MOV · AVI · MKV
            </p>
          </>
        )}
      </div>

      {/* Format + Convert */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Convert to</span>
          <div className="flex gap-1">
            {(["mp4", "webm"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                  format === f
                    ? "border-brand-green bg-brand-green-dark text-white"
                    : "border-border/50 text-text-secondary hover:border-border"
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <Button
          onClick={convert}
          disabled={!file || status === "loading" || status === "converting"}
          size="sm"
          className="h-9 bg-brand-green text-black hover:bg-brand-green/90"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : status === "converting" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {progress}%
            </>
          ) : (
            <>
              <Video className="mr-2 h-4 w-4" />
              Convert
            </>
          )}
        </Button>
        {(file || convertedBlob) && status !== "converting" && status !== "loading" && (
          <Button variant="ghost" size="sm" onClick={reset} className="h-9">
            Reset
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {status === "converting" && (
        <div className="rounded-lg border border-border/50 bg-surface p-4">
          <div className="h-2 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full bg-brand-green transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">Processing... {progress}%</p>
        </div>
      )}

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
          <div className="p-4 bg-background">
            <VideoPreview blob={convertedBlob} />
          </div>
          <p className="px-3 py-2 text-xs text-text-muted border-t border-border/50">
            {(convertedBlob.size / 1024 / 1024).toFixed(2)} MB · {format.toUpperCase()}
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{errorMsg}</p>
          <p className="text-xs text-text-muted mt-2">
            Video conversion runs in-browser via FFmpeg.wasm. Some browsers may require enhanced security headers.
          </p>
        </div>
      )}
    </div>
  );
}
