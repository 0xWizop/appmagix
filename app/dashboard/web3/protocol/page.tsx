import { getSession } from "@/lib/firebase-session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, TrendingUp, Users, Zap } from "lucide-react";

export default async function ProtocolDashboardPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const placeholderMetrics = [
    { label: "TVL", value: "—", description: "Total Value Locked", icon: TrendingUp },
    { label: "Active Users", value: "—", description: "Last 30 days", icon: Users },
    { label: "Transactions", value: "—", description: "Last 24h", icon: Zap },
    { label: "Protocol Fees", value: "—", description: "Last 30 days", icon: Activity },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-green/20 border border-brand-green/50 mb-4">
          <span className="inline-block w-2 h-2 rounded-full bg-brand-green" />
          <span className="text-xs font-medium text-brand-green uppercase tracking-wider">
            Web3
          </span>
        </div>
        <h1 className="text-3xl font-medium tracking-tight">Protocol Dashboard</h1>
        <p className="text-text-secondary mt-2 text-sm max-w-xl">
          Monitor your protocol&apos;s key metrics: TVL, users, transactions, and fees. Connect a protocol to see live data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {placeholderMetrics.map((m) => (
          <Card key={m.label} className="hover:border-brand-green transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                {m.label}
              </CardTitle>
              <m.icon className="h-5 w-5 text-text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">{m.value}</div>
              <p className="text-xs text-text-muted mt-1">{m.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Activity className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Connect your protocol</h3>
          <p className="text-text-secondary text-sm max-w-md mx-auto mb-4">
            Add your protocol&apos;s contract address and chain to start tracking metrics. Wallet integration coming soon.
          </p>
          <p className="text-xs text-text-muted">Protocol connection — coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
