"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Wallet, Vote, Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/lib/toast-context";

type Tab = "domain" | "wallet" | "protocol";

interface ToolsClientProps {
  web2Only?: boolean;
}

export function ToolsClient({ web2Only = false }: ToolsClientProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("domain");

  const [domainInput, setDomainInput] = useState("");
  const [domainResult, setDomainResult] = useState<{
    url: string;
    title: string | null;
    description: string | null;
    status: number;
  } | null>(null);
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainAddResult, setDomainAddResult] = useState<{
    metaTag: string;
    embedScript: string;
    site: { id: string; domain: string };
  } | null>(null);
  const [domainAddLoading, setDomainAddLoading] = useState(false);

  const [walletInput, setWalletInput] = useState("");
  const [walletResult, setWalletResult] = useState<{
    address: string;
    balances: { chainId: number; chainName: string; native: string; tokens: { symbol: string; balance: string }[] }[];
  } | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const [protocolAddress, setProtocolAddress] = useState("");
  const [protocolChainId, setProtocolChainId] = useState(1);
  const [protocolResult, setProtocolResult] = useState<{
    totalProposals: number;
    activeCount: number;
    proposals: { id: number; forVotes: string; againstVotes: string; state: string }[];
  } | null>(null);
  const [protocolLoading, setProtocolLoading] = useState(false);

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDomainLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    setDomainLoading(true);
    setDomainResult(null);
    setDomainAddResult(null);
    try {
      const res = await fetch(
        `/api/tools/domain-lookup?url=${encodeURIComponent(domainInput.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setDomainResult(data);
    } catch (err) {
      toast.error("Lookup failed", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setDomainLoading(false);
    }
  };

  const handleDomainAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    setDomainAddLoading(true);
    setDomainAddResult(null);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setDomainAddResult({
        metaTag: data.metaTag,
        embedScript: data.embedScript,
        site: data.site,
      });
      toast.success("Site added. Add the meta tag and script to your site to track analytics.");
    } catch (err) {
      toast.error("Add failed", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setDomainAddLoading(false);
    }
  };

  const handleWalletLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletInput.trim() || !/^0x[a-fA-F0-9]{40}$/.test(walletInput.trim())) {
      toast.error("Enter a valid Ethereum address");
      return;
    }
    setWalletLoading(true);
    setWalletResult(null);
    try {
      const res = await fetch(
        `/api/web3/balance?address=${encodeURIComponent(walletInput.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setWalletResult(data);
    } catch (err) {
      toast.error("Lookup failed", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setWalletLoading(false);
    }
  };

  const handleProtocolLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocolAddress.trim() || !/^0x[a-fA-F0-9]{40}$/.test(protocolAddress.trim())) {
      toast.error("Enter a valid contract address");
      return;
    }
    setProtocolLoading(true);
    setProtocolResult(null);
    try {
      const res = await fetch(
        `/api/web3/governance/lookup?address=${encodeURIComponent(protocolAddress.trim())}&chainId=${protocolChainId}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setProtocolResult(data);
    } catch (err) {
      toast.error("Lookup failed", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setProtocolLoading(false);
    }
  };

  const tabs = web2Only
    ? [{ id: "domain" as Tab, label: "Domain", icon: Globe }]
    : [
        { id: "domain" as Tab, label: "Domain", icon: Globe },
        { id: "wallet" as Tab, label: "Wallet", icon: Wallet },
        { id: "protocol" as Tab, label: "Protocol", icon: Vote },
      ];

  return (
    <div className="space-y-6">
      {tabs.length > 1 && (
        <div className="flex gap-2 border-b border-border pb-2">
          {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t.id
                ? "bg-brand-green/20 text-brand-green"
                : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
        </div>
      )}

      {activeTab === "domain" && (
        <Card>
          <CardHeader>
            <CardTitle>Domain lookup</CardTitle>
            <CardDescription>
              Fetch basic info from a URL or add a domain to track analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleDomainLookup} className="flex gap-2">
              <Input
                placeholder="example.com or https://example.com"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={domainLoading}>
                {domainLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
              </Button>
            </form>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDomainAdd}
                disabled={domainAddLoading || !domainInput.trim()}
              >
                {domainAddLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add & track"}
              </Button>
              <span className="text-xs text-text-muted self-center">
                Add domain to enable analytics tracking
              </span>
            </div>

            {domainResult && (
              <div className="rounded-lg border border-border p-4 space-y-2">
                <div className="text-sm font-medium text-brand-green">{domainResult.url}</div>
                {domainResult.title && (
                  <div>
                    <span className="text-xs text-text-muted">Title: </span>
                    {domainResult.title}
                  </div>
                )}
                {domainResult.description && (
                  <div>
                    <span className="text-xs text-text-muted">Description: </span>
                    {domainResult.description}
                  </div>
                )}
                <div className="text-xs text-text-muted">Status: {domainResult.status}</div>
              </div>
            )}

            {domainAddResult && (
              <div className="rounded-lg border border-brand-green p-4 space-y-3">
                <div className="text-sm font-medium">Site added: {domainAddResult.site.domain}</div>
                <div>
                  <Label className="text-xs">Meta tag — add to your &lt;head&gt;</Label>
                  <div className="flex gap-2 mt-1">
                    <code className="flex-1 text-xs bg-surface p-2 rounded overflow-x-auto">
                      {domainAddResult.metaTag}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(domainAddResult.metaTag, "meta")}
                    >
                      {copied === "meta" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Embed script — add before &lt;/body&gt;</Label>
                  <div className="flex gap-2 mt-1">
                    <code className="flex-1 text-xs bg-surface p-2 rounded overflow-x-auto">
                      {domainAddResult.embedScript}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(domainAddResult.embedScript, "script")}
                    >
                      {copied === "script" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <a
                  href="/dashboard/web2/analytics"
                  className="text-sm text-brand-green hover:underline"
                >
                  View analytics →
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "wallet" && (
        <Card>
          <CardHeader>
            <CardTitle>Wallet lookup</CardTitle>
            <CardDescription>
              Enter a wallet address to view native and token balances across chains.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleWalletLookup} className="flex gap-2">
              <Input
                placeholder="0x..."
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                className="flex-1 font-mono"
              />
              <Button type="submit" disabled={walletLoading}>
                {walletLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
              </Button>
            </form>

            {walletResult && (
              <div className="space-y-4">
                <div className="text-sm font-medium text-brand-green">
                  {walletResult.address.slice(0, 10)}...{walletResult.address.slice(-8)}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {walletResult.balances.map((b) => (
                    <div
                      key={b.chainId}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="font-medium text-sm">{b.chainName}</div>
                      <div className="mt-2 text-sm">
                        Native: {parseFloat(b.native).toFixed(4)}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-text-muted">
                        {b.tokens.map((t) => (
                          <span key={t.symbol}>
                            {t.symbol}: {t.balance}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "protocol" && (
        <Card>
          <CardHeader>
            <CardTitle>Protocol / governance lookup</CardTitle>
            <CardDescription>
              Enter a Governor Bravo contract address to view proposals and votes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleProtocolLookup} className="space-y-4">
              <div>
                <Label>Governor contract address</Label>
                <Input
                  placeholder="0x..."
                  value={protocolAddress}
                  onChange={(e) => setProtocolAddress(e.target.value)}
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label>Chain</Label>
                <select
                  value={protocolChainId}
                  onChange={(e) => setProtocolChainId(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={1}>Ethereum</option>
                  <option value={137}>Polygon</option>
                  <option value={42161}>Arbitrum</option>
                </select>
              </div>
              <Button type="submit" disabled={protocolLoading}>
                {protocolLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
              </Button>
            </form>

            {protocolResult && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-sm text-text-muted">Total proposals</div>
                    <div className="text-2xl font-medium">{protocolResult.totalProposals}</div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-sm text-text-muted">Active</div>
                    <div className="text-2xl font-medium">{protocolResult.activeCount}</div>
                  </div>
                </div>
                {protocolResult.proposals.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Recent proposals</div>
                    <div className="space-y-2">
                      {protocolResult.proposals.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-lg border border-border p-3 text-sm"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-medium">Proposal #{p.id}</span>
                            <span className="text-text-muted">({p.state})</span>
                          </div>
                          <div className="mt-1 text-text-muted">
                            For: {p.forVotes} · Against: {p.againstVotes}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
