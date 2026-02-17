import { getSession } from "@/lib/firebase-session";
import { redirect } from "next/navigation";
import { TreasuryClient } from "@/components/web3/treasury-client";

export default async function TreasuryPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-green/20 border border-brand-green/50 mb-4">
          <span className="inline-block w-2 h-2 rounded-full bg-brand-green" />
          <span className="text-xs font-medium text-brand-green uppercase tracking-wider">
            Web3
          </span>
        </div>
        <h1 className="text-3xl font-medium tracking-tight">Treasury</h1>
        <p className="text-text-secondary mt-2 text-sm max-w-xl">
          View balances across chains, token holdings, and treasury activity. Connect a wallet to see your assets.
        </p>
      </div>

      <TreasuryClient />
    </div>
  );
}
