"use client";
import { ReactNode } from "react";
import { type Chain } from "viem";
import { base, baseSepolia } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";

const ENV = process.env.NEXT_PUBLIC_ENV || "production";

let selectedChain: Chain = base;
let paymasterUrl: string | undefined = process.env.NEXT_PUBLIC_PAYMASTER_URL;

if (ENV === "tenderly") {
  selectedChain = {
    ...base,
    rpcUrls: {
      default: { http: [process.env.NEXT_PUBLIC_TENDERLY_RPC_URL as string] },
      public: { http: [process.env.NEXT_PUBLIC_TENDERLY_RPC_URL as string] },
    },
  } as const;
  // For Tenderly, we disable the production Paymaster to avoid validation errors.
  // This aligns with "Option A" (Pre-fund) or "Option B" (Mocking) where we don't hit the real Paymaster API.
  paymasterUrl = undefined; 
} else if (ENV === "testnet") {
  selectedChain = baseSepolia;
  paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL_TESTNET;
} else {
  // Production
  selectedChain = base;
  paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
}

export function RootProvider({ children }: { children: ReactNode }) {
  if (typeof window !== "undefined") {
    const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || "missing";
    const pmUrl = paymasterUrl || "disabled";
    
    // Avoid dumping full secrets: only show prefix/suffix lengths.
    const short = (val: string) =>
      val === "missing" || val === "disabled" ? val : `${val.slice(0, 6)}…${val.slice(-4)} (len=${val.length})`;

    console.log("[RootProvider] Environment:", ENV);
    console.log("[RootProvider] chain", selectedChain.id, selectedChain.name);
    console.log("[RootProvider] apiKey", short(apiKey));
    console.log("[RootProvider] paymaster", short(pmUrl));
  }

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={selectedChain}
      config={{
        appearance: {
          mode: "auto",
        },
        wallet: {
          display: "modal",
          preference: "all",
        },
        paymaster: paymasterUrl,
      }}
      miniKit={{
        enabled: true,
        autoConnect: false,
        notificationProxyUrl: undefined,
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}
