"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, Link2, Copy, ExternalLink } from "lucide-react";
import { HelpTooltip } from "@/components/dashboard/help-tooltip";
import { DASHBOARD_HELP } from "@/lib/dashboard-help";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");

interface ConnectSiteCardProps {
  projectId: string;
  websiteUrl?: string;
  siteVerifiedAt?: Date;
}

export function ConnectSiteCard({ projectId, websiteUrl, siteVerifiedAt }: ConnectSiteCardProps) {
  const router = useRouter();
  const toast = useToast();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [connectResult, setConnectResult] = useState<{
    metaTag: string;
    embedScript: string;
    websiteUrl: string;
  } | null>(null);
  const [error, setError] = useState("");

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/connect-site`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to connect");
      setConnectResult({
        metaTag: data.metaTag,
        embedScript: data.embedScript,
        websiteUrl: data.websiteUrl,
      });
      toast.success("Site connected", "Add the meta tag and embed script to your site");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      toast.error("Connect failed", err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/verify-site`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      if (data.verified) {
        setConnectResult(null);
        toast.success("Site verified");
        router.refresh();
      } else {
        const msg = "Make sure you added the meta tag and embed script to your site";
        setError(msg);
        toast.error("Verification failed", msg);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      toast.error("Verification failed", err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const isVerified = !!siteVerifiedAt;

  if (isVerified && websiteUrl) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Site Connected
          </CardTitle>
          <CardDescription>
            Analytics are being collected from your site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-brand-green hover:underline"
          >
            {websiteUrl}
            <ExternalLink className="h-3 w-3" />
          </a>
          <p className="text-xs text-text-muted">
            View analytics in the{" "}
            <a href={`/dashboard/web2/analytics?project=${projectId}`} className="text-brand-green hover:underline">
              Analytics dashboard
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-brand-green" />
          Connect Your Site
          <HelpTooltip content={DASHBOARD_HELP.analytics.connectSite} side="bottom" />
        </CardTitle>
        <CardDescription>
          Add your site to enable analytics. Add the meta tag and script to your site&apos;s &lt;head&gt;.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
            {error}
          </div>
        )}

        {!connectResult ? (
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-url">Site URL</Label>
              <Input
                id="site-url"
                type="url"
                placeholder="https://yourstore.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect Site
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">1. Add this meta tag to your site&apos;s &lt;head&gt;</Label>
              <div className="flex gap-2">
                <pre className="flex-1 p-3 rounded-lg bg-surface text-xs overflow-x-auto">
                  {connectResult.metaTag}
                </pre>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(connectResult.metaTag)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">2. Add this script before &lt;/body&gt;</Label>
              <div className="flex gap-2">
                <pre className="flex-1 p-3 rounded-lg bg-surface text-xs overflow-x-auto">
                  {connectResult.embedScript}
                </pre>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(connectResult.embedScript)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button onClick={handleVerify} disabled={isVerifying}>
              {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              I&apos;ve added these — Verify
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
