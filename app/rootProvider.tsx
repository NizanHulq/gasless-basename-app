"use client";
import { ReactNode } from "react";
import { baseSepolia } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";

const baseSepoliaWithRpc = {
  ...baseSepolia,
  rpcUrls: {
    default: { http: ["https://sepolia.base.org"] },
    public: { http: ["https://sepolia.base.org"] },
  },
} as const;

export function RootProvider({ children }: { children: ReactNode }) {
  // Minimal runtime logging to confirm we are targeting Base Sepolia + which env vars are loaded.
  if (typeof window !== "undefined") {
    const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || "missing";
    const paymaster = process.env.NEXT_PUBLIC_PAYMASTER_URL || "missing";
    // Avoid dumping full secrets: only show prefix/suffix lengths.
    const short = (val: string) =>
      val === "missing" ? val : `${val.slice(0, 6)}…${val.slice(-4)} (len=${val.length})`;

    // eslint-disable-next-line no-console
    console.log("[RootProvider] chain", baseSepolia.id, baseSepolia.name);
    // eslint-disable-next-line no-console
    console.log("[RootProvider] apiKey", short(apiKey));
    // eslint-disable-next-line no-console
    console.log("[RootProvider] paymaster", short(paymaster));
  }

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={baseSepoliaWithRpc}
      config={{
        appearance: {
          mode: "auto",
        },
        wallet: {
          display: "modal",
          preference: "all",
        },
        paymaster: process.env.NEXT_PUBLIC_PAYMASTER_URL!,
      }}
      miniKit={{
        enabled: true,
        autoConnect: true,
        notificationProxyUrl: undefined,
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}
