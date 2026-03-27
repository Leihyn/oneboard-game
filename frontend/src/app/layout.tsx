import type { Metadata } from "next";
import { WalletProvider } from "@/providers/WalletProvider";
import { ToastProvider } from "@/components/game/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "OneBoard - DeFi Board Game on OneChain",
  description: "A DeFi-themed property trading board game with AI opponents, built on OneChain",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
