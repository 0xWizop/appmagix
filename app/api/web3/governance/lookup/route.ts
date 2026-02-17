import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { createPublicClient, http } from "viem";
import { mainnet, polygon, arbitrum } from "viem/chains";

export const dynamic = "force-dynamic";

const RPC_URLS: Record<number, string> = {
  [mainnet.id]: "https://eth.llamarpc.com",
  [polygon.id]: "https://polygon-rpc.com",
  [arbitrum.id]: "https://arb1.arbitrum.io/rpc",
};

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

  const { searchParams } = new URL(req.url);
  const governorAddress = searchParams.get("address") as `0x${string}` | null;
  const chainId = parseInt(searchParams.get("chainId") || "1", 10);

  if (!governorAddress || !/^0x[a-fA-F0-9]{40}$/.test(governorAddress)) {
    return NextResponse.json({ error: "Valid governor address required" }, { status: 400 });
  }

  const rpcUrl = RPC_URLS[chainId];
  if (!rpcUrl) {
    return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });
  }

  const chain = [mainnet, polygon, arbitrum].find((c) => c.id === chainId) ?? mainnet;
  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  try {
    const count = await client.readContract({
      address: governorAddress,
      abi: GOVERNOR_ABI,
      functionName: "proposalCount",
    });

    const totalProposals = Number(count);
    const proposals: { id: number; forVotes: string; againstVotes: string; state: string }[] = [];
    const toFetch = Math.min(5, totalProposals);

    for (let i = totalProposals; i > totalProposals - toFetch && i > 0; i--) {
      try {
        const [prop, state] = await Promise.all([
          client.readContract({
            address: governorAddress,
            abi: GOVERNOR_ABI,
            functionName: "proposals",
            args: [BigInt(i)],
          }),
          client.readContract({
            address: governorAddress,
            abi: GOVERNOR_ABI,
            functionName: "state",
            args: [BigInt(i)],
          }),
        ]);
        proposals.push({
          id: i,
          forVotes: prop[5].toString(),
          againstVotes: prop[6].toString(),
          state: PROPOSAL_STATES[Number(state)] ?? "Unknown",
        });
      } catch {
        // skip
      }
    }

    const activeCount = proposals.filter((p) => p.state === "Active").length;

    return NextResponse.json({
      governorAddress,
      chainId,
      totalProposals,
      activeCount,
      proposals,
    });
  } catch (err) {
    console.error("Governance lookup error:", err);
    return NextResponse.json(
      { error: "Failed to fetch governance. Check address and chain." },
      { status: 500 }
    );
  }
}
