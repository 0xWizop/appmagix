"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/lib/toast-context";

export function AddSiteForm() {
  const toast = useToast();
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [result, setResult] = useState<{
    metaTag: string;
    embedScript: string;
    site: { id: string; domain: string };
  } | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResult({
        metaTag: data.metaTag,
        embedScript: data.embedScript,
        site: data.site,
      });
      toast.success("Site added. Add the meta tag and script to your site to start tracking.");
      setDomain("");
    } catch (err) {
      toast.error("Add failed", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Add a site
        </CardTitle>
        <CardDescription>
          Add a domain to track page views and analytics. Paste the meta tag and script on your site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
          <Input
            placeholder="example.com or https://example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add site"}
          </Button>
        </form>
        {result && (
          <div className="rounded-lg border border-brand-green bg-surface p-4 space-y-3">
            <div className="text-sm font-medium text-brand-green">Added: {result.site.domain}</div>
            <div>
              <Label className="text-xs">Meta tag — add to &lt;head&gt;</Label>
              <div className="flex gap-2 mt-1">
                <code className="flex-1 text-xs bg-background p-2 rounded overflow-x-auto border border-border">
                  {result.metaTag}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(result.metaTag, "meta")}
                  aria-label="Copy meta tag"
                >
                  {copied === "meta" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs">Script — add before &lt;/body&gt;</Label>
              <div className="flex gap-2 mt-1">
                <code className="flex-1 text-xs bg-background p-2 rounded overflow-x-auto border border-border">
                  {result.embedScript}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(result.embedScript, "script")}
                  aria-label="Copy script"
                >
                  {copied === "script" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
