import { createConfig, http } from "wagmi";
import { mainnet, polygon, arbitrum } from "viem/chains";

export const web3Chains = [mainnet, polygon, arbitrum] as const;

export const web3Config = createConfig({
  chains: web3Chains,
  transports: {
    [mainnet.id]: http("https://eth.llamarpc.com"),
    [polygon.id]: http("https://polygon-rpc.com"),
    [arbitrum.id]: http("https://arb1.arbitrum.io/rpc"),
  },
});
