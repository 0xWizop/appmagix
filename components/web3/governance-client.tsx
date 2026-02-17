"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Vote, FileText, Users, Loader2, Settings2 } from "lucide-react";

interface Proposal {
  id: number;
  forVotes: string;
  againstVotes: string;
  state: string;
}

interface GovernanceData {
  configured: boolean;
  governorAddress?: string;
  chainId?: number;
  totalProposals?: number;
  activeCount?: number;
  proposals?: Proposal[];
}

const CHAIN_IDS = [
  { id: 1, name: "Ethereum" },
  { id: 137, name: "Polygon" },
  { id: 42161, name: "Arbitrum" },
];

export function GovernanceClient() {
  const [data, setData] = useState<GovernanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [governorAddress, setGovernorAddress] = useState("");
  const [chainId, setChainId] = useState(1);

  const fetchGovernance = () => {
    setLoading(true);
    fetch("/api/web3/governance")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
        if (d.configured) {
          setGovernorAddress(d.governorAddress ?? "");
          setChainId(d.chainId ?? 1);
        }
      })
      .catch(() => setData({ configured: false, proposals: [] }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGovernance();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!governorAddress || !/^0x[a-fA-F0-9]{40}$/.test(governorAddress)) return;
    setSaving(true);
    fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        governanceConfig: { governorAddress, chainId },
      }),
    })
      .then(() => {
        setShowForm(false);
        fetchGovernance();
      })
      .finally(() => setSaving(false));
  };

  const totalVotes = data?.proposals?.reduce(
    (sum, p) => sum + BigInt(p.forVotes) + BigInt(p.againstVotes),
    BigInt(0)
  ) ?? BigInt(0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
          <Settings2 className="h-4 w-4" />
          {data?.configured ? "Change governance" : "Add governance"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Connect governance contract</CardTitle>
            <p className="text-sm text-text-secondary">
              Enter your Governor Bravo contract address and chain.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="governor">Governor contract address</Label>
                <Input
                  id="governor"
                  placeholder="0x..."
                  value={governorAddress}
                  onChange={(e) => setGovernorAddress(e.target.value)}
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label htmlFor="chain">Chain</Label>
                <select
                  id="chain"
                  value={chainId}
                  onChange={(e) => setChainId(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {CHAIN_IDS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {data?.configured && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="hover:border-brand-green transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Active Proposals
              </CardTitle>
              <FileText className="h-5 w-5 text-text-muted" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
              ) : (
                <>
                  <div className="text-2xl font-medium">{data.activeCount ?? 0}</div>
                  <p className="text-xs text-text-muted mt-1">Open for voting</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="hover:border-brand-green transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Total Proposals
              </CardTitle>
              <Vote className="h-5 w-5 text-text-muted" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
              ) : (
                <>
                  <div className="text-2xl font-medium">{data.totalProposals ?? 0}</div>
                  <p className="text-xs text-text-muted mt-1">All time</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="hover:border-brand-green transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Total Votes
              </CardTitle>
              <Users className="h-5 w-5 text-text-muted" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
              ) : (
                <>
                  <div className="text-2xl font-medium">{totalVotes.toString()}</div>
                  <p className="text-xs text-text-muted mt-1">For + against</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {data?.proposals && data.proposals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.proposals.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <span className="font-medium">Proposal #{p.id}</span>
                    <span className="ml-2 text-sm text-text-muted">({p.state})</span>
                  </div>
                  <div className="text-sm">
                    For: {p.forVotes} · Against: {p.againstVotes}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!data?.configured && !showForm && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Vote className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Connect governance</h3>
            <p className="text-text-secondary text-sm max-w-md mx-auto mb-4">
              Add your Governor Bravo contract address to view proposals, votes, and participation.
            </p>
            <Button onClick={() => setShowForm(true)} variant="outline">
              Add governance contract
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
