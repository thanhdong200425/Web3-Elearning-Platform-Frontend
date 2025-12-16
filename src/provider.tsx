import type { NavigateOptions } from "react-router-dom";
import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { injected } from "wagmi/connectors";
import { sepolia } from "wagmi/chains";
import { defineChain } from "viem";
import { AuthProvider } from "@/contexts/AuthContext";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

const local31337 = defineChain({
  id: 31337,
  name: "Localhost31337",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
});

const queryClient = new QueryClient();

export const config = createConfig({
  chains: [local31337, sepolia],
  connectors: [injected()],
  transports: {
    [local31337.id]: http("http://127.0.0.1:8545"), // Use a default public RPC for localhost
    [sepolia.id]: http(), // Use a default public RPC for Sepolia
  },
});

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </HeroUIProvider>
  );
}
