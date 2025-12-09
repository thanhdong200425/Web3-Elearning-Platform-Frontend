import type { NavigateOptions } from "react-router-dom";
import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

const queryClient = new QueryClient();

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(), // Use a default public RPC for Sepolia
  },
});

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </HeroUIProvider>
  );
}
