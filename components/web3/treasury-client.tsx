"use client";

import { useEffect, useState } from "react";
import { useConnection, useConnectionEffect } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Coins, ArrowRightLeft, Loader2 } from "lucide-react";
import { ConnectWalletButton } from "./connect-wallet-button";

interface ChainBalance {
  chainId: number;
  chainName: string;
  native: string;
  tokens: { symbol: string; balance: string }[];
}

interface BalanceData {
  address: string;
  balances: ChainBalance[];
}

export function TreasuryClient() {
  const { address, isConnected } = useConnection();
  const [prefs, setPrefs] = useState<{ walletAddress?: string | null } | null>(null);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync connected wallet to preferences
  useConnectionEffect({
    onConnect(data) {
      if (data?.address) {
        fetch("/api/user/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: data.address }),
        })
          .then(() => setPrefs((p) => ({ ...p, walletAddress: data.address })));
      }
    },
    onDisconnect() {
      fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: null }),
      }).then(() => setPrefs((p) => ({ ...p, walletAddress: null })));
      setBalanceData(null);
    },
  });

  // Load preferences on mount
  useEffect(() => {
    fetch("/api/user/preferences")
      .then((r) => r.json())
      .then((d) => setPrefs(d.preferences ? { walletAddress: d.preferences.walletAddress } : null))
      .catch(() => setPrefs(null));
  }, []);

  // Fetch balances when we have an address (connected or from prefs)
  const effectiveAddress = isConnected ? address : prefs?.walletAddress;
  useEffect(() => {
    if (!effectiveAddress) {
      setBalanceData(null);
      return;
    }
    setLoading(true);
    fetch(`/api/web3/balance?address=${encodeURIComponent(effectiveAddress)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setBalanceData(d);
      })
      .catch(() => setBalanceData(null))
      .finally(() => setLoading(false));
  }, [effectiveAddress]);

  const totalNative = balanceData?.balances?.reduce(
    (sum, b) => sum + parseFloat(b.native || "0"),
    0
  ) ?? 0;
  const tokenCount = balanceData?.balances?.flatMap((b) => b.tokens).length ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span />
        <ConnectWalletButton />
      </div>

      {effectiveAddress && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="hover:border-brand-green transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Total Native
              </CardTitle>
              <Wallet className="h-5 w-5 text-text-muted" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
              ) : (
                <>
                  <div className="text-2xl font-medium">
                    {totalNative.toFixed(4)}
                  </div>
                  <p className="text-xs text-text-muted mt-1">Native (ETH/MATIC) across chains</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="hover:border-brand-green transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Token Holdings
              </CardTitle>
              <Coins className="h-5 w-5 text-text-muted" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
              ) : (
                <>
                  <div className="text-2xl font-medium">{tokenCount}</div>
                  <p className="text-xs text-text-muted mt-1">USDT, USDC, DAI</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="hover:border-brand-green transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Chains
              </CardTitle>
              <ArrowRightLeft className="h-5 w-5 text-text-muted" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
              ) : (
                <>
                  <div className="text-2xl font-medium">
                    {balanceData?.balances?.length ?? 0}
                  </div>
                  <p className="text-xs text-text-muted mt-1">Ethereum, Polygon, Arbitrum</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {balanceData?.balances && balanceData.balances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Balances by chain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {balanceData.balances.map((b) => (
                <div
                  key={b.chainId}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="font-medium text-brand-green">{b.chainName}</div>
                  <div className="mt-2 text-sm text-text-secondary">
                    Native: {parseFloat(b.native).toFixed(4)} ETH
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm">
                    {b.tokens.map((t) => (
                      <span key={t.symbol}>
                        {t.symbol}: {t.balance}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!effectiveAddress && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Wallet className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Connect your wallet</h3>
            <p className="text-text-secondary text-sm max-w-md mx-auto mb-4">
              Connect a wallet to view treasury balances and token holdings across Ethereum, Polygon, and Arbitrum.
            </p>
            <ConnectWalletButton />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
