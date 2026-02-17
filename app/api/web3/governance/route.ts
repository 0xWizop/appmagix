import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { createPublicClient, http } from "viem";
import { mainnet, polygon, arbitrum } from "viem/chains";

export const dynamic = "force-dynamic";

const RPC_URLS: Record<number, string> = {
  [mainnet.id]: "https://eth.llamarpc.com",
  [polygon.id]: "https://polygon-rpc.com",
  [arbitrum.id]: "https://arb1.arbitrum.io/rpc",
};

// Governor Bravo / OpenZeppelin Governor interface
const GOVERNOR_ABI = [
  {
    inputs: [],
    name: "proposalCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "proposalId", type: "uint256" }],
    name: "proposals",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "proposer", type: "address" },
      { name: "eta", type: "uint256" },
      { name: "startBlock", type: "uint256" },
      { name: "endBlock", type: "uint256" },
      { name: "forVotes", type: "uint256" },
      { name: "againstVotes", type: "uint256" },
      { name: "abstainVotes", type: "uint256" },
      { name: "canceled", type: "bool" },
      { name: "executed", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "proposalId", type: "uint256" }],
    name: "state",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const PROPOSAL_STATES = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const doc = await db.collection("user_settings").doc(session.user.id).get();
  const govConfig = doc.data()?.preferences?.governanceConfig as
    | { governorAddress: string; chainId: number }
    | undefined
    | null;

  if (!govConfig?.governorAddress || !govConfig?.chainId) {
    return NextResponse.json({
      configured: false,
      proposals: [],
      activeCount: 0,
    });
  }

  const rpcUrl = RPC_URLS[govConfig.chainId];
  if (!rpcUrl) {
    return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });
  }

  const chain = [mainnet, polygon, arbitrum].find((c) => c.id === govConfig.chainId) ?? mainnet;
  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  try {
    const count = await client.readContract({
      address: govConfig.governorAddress as `0x${string}`,
      abi: GOVERNOR_ABI,
      functionName: "proposalCount",
    });

    const totalProposals = Number(count);
    const proposals: { id: number; forVotes: string; againstVotes: string; state: string }[] = [];

    // Fetch last 10 proposals
    const toFetch = Math.min(10, totalProposals);
    for (let i = totalProposals; i > totalProposals - toFetch && i > 0; i--) {
      try {
        const [prop, state] = await Promise.all([
          client.readContract({
            address: govConfig.governorAddress as `0x${string}`,
            abi: GOVERNOR_ABI,
            functionName: "proposals",
            args: [BigInt(i)],
          }),
          client.readContract({
            address: govConfig.governorAddress as `0x${string}`,
            abi: GOVERNOR_ABI,
            functionName: "state",
            args: [BigInt(i)],
          }),
        ]);
        const stateName = PROPOSAL_STATES[Number(state)] ?? "Unknown";
        proposals.push({
          id: i,
          forVotes: prop[5].toString(),
          againstVotes: prop[6].toString(),
          state: stateName,
        });
      } catch {
        // Skip failed proposal fetch
      }
    }

    const activeCount = proposals.filter((p) => p.state === "Active").length;

    return NextResponse.json({
      configured: true,
      governorAddress: govConfig.governorAddress,
      chainId: govConfig.chainId,
      totalProposals,
      activeCount,
      proposals,
    });
  } catch (err) {
    console.error("Governance fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch governance data. Check contract address and chain." },
      { status: 500 }
    );
  }
}
