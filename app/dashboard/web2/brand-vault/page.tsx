"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useFirebaseAuth } from "@/lib/firebase-auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Folder,
  ImageIcon,
  FileText,
  Trash2,
  Loader2,
  FolderOpen,
  Download,
  Shield,
  Palette,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
import { useBrandTheme } from "@/components/dashboard/brand-theme-provider";

interface BrandAsset {
  id: string;
  name: string;
  url: string;
  type: string; // MIME type
  size: number;
  uploadedAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  return FileText;
}

export default function BrandVaultPage() {
  const { user } = useFirebaseAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/brand-vault", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load assets");
      const data = await res.json();
      setAssets(data.assets || []);
    } catch {
      toast.error("Could not load assets", "Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) fetchAssets();
  }, [user, fetchAssets]);

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    let uploaded = 0;
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/brand-vault", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || "Upload failed");
        }
        uploaded++;
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`, err instanceof Error ? err.message : "Try again");
      }
    }
    if (uploaded > 0) {
      toast.success(`${uploaded} file${uploaded > 1 ? "s" : ""} uploaded!`);
      await fetchAssets();
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  };

  const handleDelete = async (assetId: string, name: string) => {
    setDeleting(assetId);
    try {
      const res = await fetch(`/api/brand-vault?id=${encodeURIComponent(assetId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      toast.success(`${name} deleted`);
    } catch {
      toast.error("Could not delete file", "Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const { colors, refreshColors } = useBrandTheme();
  const [selectedColors, setSelectedColors] = useState(colors);
  const [savingColors, setSavingColors] = useState(false);

  useEffect(() => {
    setSelectedColors(colors);
  }, [colors]);

  const saveColors = async () => {
    setSavingColors(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandColors: selectedColors }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Brand colors updated!");
      await refreshColors();
    } catch {
      toast.error("Could not save colors");
    } finally {
      setSavingColors(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-medium flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-green" />
            Brand Vault
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Securely store logos, brand guidelines, and assets for your projects.
          </p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Upload Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.ai,.svg,.eps,.fig,.sketch"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            uploadFiles(files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200",
          dragging
            ? "border-brand-green bg-brand-green/10 scale-[1.01]"
            : "border-border hover:border-brand-green/50 hover:bg-surface"
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-brand-green/10 flex items-center justify-center">
            <FolderOpen className="h-7 w-7 text-brand-green" />
          </div>
          <div>
            <p className="font-medium">Drop files here or click to upload</p>
            <p className="text-sm text-text-muted mt-1">
              PNG, JPG, SVG, PDF, AI, EPS, Figma files supported
            </p>
          </div>
          {uploading && (
            <div className="flex items-center gap-2 text-brand-green text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </div>
          )}
        </div>
      </div>

      {/* Asset Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-brand-green animate-spin" />
        </div>
      ) : assets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Folder className="h-12 w-12 text-text-muted opacity-50 mb-3" />
            <p className="text-sm text-text-muted">No assets yet.</p>
            <p className="text-xs text-text-muted mt-1">
              Upload logos, brand guides, and imagery to keep them handy.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-text-secondary">
              {assets.length} {assets.length === 1 ? "asset" : "assets"}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {assets.map((asset) => {
              const Icon = getFileIcon(asset.type);
              const isImage = asset.type.startsWith("image/");
              return (
                <Card
                  key={asset.id}
                  className="group relative overflow-hidden border-border hover:border-brand-green transition-colors"
                >
                  <CardContent className="p-0">
                    {/* Preview */}
                    <div className="aspect-square bg-surface flex items-center justify-center overflow-hidden">
                      {isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Icon className="h-10 w-10 text-text-muted" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <p className="text-xs font-medium truncate" title={asset.name}>
                        {asset.name}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">{formatBytes(asset.size)}</p>
                    </div>
                    {/* Action overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={asset.name}
                        className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="h-4 w-4 text-white" />
                      </a>
                      <button
                        type="button"
                        disabled={deleting === asset.id}
                        onClick={() => handleDelete(asset.id, asset.name)}
                        className="h-8 w-8 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors"
                      >
                        {deleting === asset.id ? (
                          <Loader2 className="h-4 w-4 text-red-400 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-400" />
                        )}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand Identity / Colors */}
      <Card className="border-border bg-surface overflow-hidden">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-brand-green" />
            Brand Identity
          </CardTitle>
          <CardDescription>
            These colors will be applied as accents across your MerchantMagix dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={selectedColors.primary}
                  onChange={(e) => setSelectedColors({ ...selectedColors, primary: e.target.value })}
                  className="h-10 w-10 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <code className="text-sm font-mono">{selectedColors.primary}</code>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={selectedColors.secondary}
                  onChange={(e) => setSelectedColors({ ...selectedColors, secondary: e.target.value })}
                  className="h-10 w-10 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <code className="text-sm font-mono">{selectedColors.secondary}</code>
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={saveColors} 
                disabled={savingColors || (selectedColors.primary === colors.primary && selectedColors.secondary === colors.secondary)}
                className="w-full sm:w-auto"
              >
                {savingColors ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Brand Colors
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card className="border-border bg-surface">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-xs text-text-muted">• Upload your logo in multiple formats (SVG, PNG, AI) for maximum flexibility during development.</p>
          <p className="text-xs text-text-muted">• Include a brand guidelines PDF so your team always works with the right colors and fonts.</p>
          <p className="text-xs text-text-muted">• All files are private — only you and your project team can access them.</p>
        </CardContent>
      </Card>
    </div>
  );
}
