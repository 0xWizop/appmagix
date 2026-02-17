import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { createPublicClient, http, formatEther } from "viem";
import { mainnet, polygon, arbitrum } from "viem/chains";

export const dynamic = "force-dynamic";

const RPC_URLS: Record<number, string> = {
  [mainnet.id]: "https://eth.llamarpc.com",
  [polygon.id]: "https://polygon-rpc.com",
  [arbitrum.id]: "https://arb1.arbitrum.io/rpc",
};

const CHAIN_NAMES: Record<number, string> = {
  [mainnet.id]: "Ethereum",
  [polygon.id]: "Polygon",
  [arbitrum.id]: "Arbitrum",
};

const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Common ERC20 tokens per chain (address, symbol)
const DEFAULT_TOKENS: Record<number, { address: `0x${string}`; symbol: string }[]> = {
  [mainnet.id]: [
    { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" as `0x${string}`, symbol: "USDT" },
    { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as `0x${string}`, symbol: "USDC" },
    { address: "0x6B175474E89094C44Da98b954EedeacCB5BE3830" as `0x${string}`, symbol: "DAI" },
  ],
  [polygon.id]: [
    { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" as `0x${string}`, symbol: "USDT" },
    { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" as `0x${string}`, symbol: "USDC" },
    { address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063" as `0x${string}`, symbol: "DAI" },
  ],
  [arbitrum.id]: [
    { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" as `0x${string}`, symbol: "USDT" },
    { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as `0x${string}`, symbol: "USDC" },
    { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1" as `0x${string}`, symbol: "DAI" },
  ],
};

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address") as `0x${string}` | null;
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: "Valid address required" }, { status: 400 });
  }

  const balances: { chainId: number; chainName: string; native: string; tokens: { symbol: string; balance: string }[] }[] = [];

  for (const chainId of [mainnet.id, polygon.id, arbitrum.id]) {
    const rpcUrl = RPC_URLS[chainId];
    if (!rpcUrl) continue;

    const client = createPublicClient({
      chain: chainId === mainnet.id ? mainnet : chainId === polygon.id ? polygon : arbitrum,
      transport: http(rpcUrl),
    });

    const nativeBalance = await client.getBalance({ address });
    const nativeFormatted = formatEther(nativeBalance);

    const tokens = DEFAULT_TOKENS[chainId] ?? [];
    const tokenBalances: { symbol: string; balance: string }[] = [];

    for (const t of tokens) {
      try {
        const balance = await client.readContract({
          address: t.address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        });
        const decimals = await client.readContract({
          address: t.address,
          abi: ERC20_ABI,
          functionName: "decimals",
        });
        const divisor = BigInt(10 ** Number(decimals));
        const formatted = balance / divisor ? (Number(balance) / Number(divisor)).toFixed(2) : "0";
        tokenBalances.push({ symbol: t.symbol, balance: formatted });
      } catch {
        tokenBalances.push({ symbol: t.symbol, balance: "0" });
      }
    }

    balances.push({
      chainId,
      chainName: CHAIN_NAMES[chainId] ?? `Chain ${chainId}`,
      native: nativeFormatted,
      tokens: tokenBalances,
    });
  }

  return NextResponse.json({ address, balances });
}
