"use client";

import { createNetworkConfig, SuiClientProvider, WalletProvider as DappKitWalletProvider } from "@onelabs/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ONECHAIN_RPC } from "@/lib/constants";
import "@onelabs/dapp-kit/dist/index.css";

const { networkConfig } = createNetworkConfig({
  testnet: { url: ONECHAIN_RPC },
});

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <DappKitWalletProvider autoConnect>
          {children}
        </DappKitWalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
