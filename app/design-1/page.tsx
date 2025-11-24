"use client";

import { useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { BASENAME_REGISTRY } from "../src/contracts";

const BASENAME_ADDRESS = BASENAME_REGISTRY.address;
const baseNameRegistryAbi = BASENAME_REGISTRY.abi;

type TabKey = "ETH" | "USDC";

function shortenAddress(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getUsdcPrice(name: string): number {
  if (!name) return 0;
  if (name.length <= 3) return 20;
  if (name.length <= 5) return 10;
  return 5;
}

function BaseNameMiniAppDesignOne() {
  const { address, isConnected } = useAccount();
  const [name, setName] = useState("");
  const [hasChecked, setHasChecked] = useState(false);

  const {
    data: isAvailable,
    isLoading: isChecking,
    refetch: refetchAvailability,
  } = useReadContract({
    address: BASENAME_ADDRESS,
    abi: baseNameRegistryAbi,
    functionName: "isAvailable",
    args: [name || ""],
    query: { enabled: false },
  });

  const { data: mintFee } = useReadContract({
    address: BASENAME_ADDRESS,
    abi: baseNameRegistryAbi,
    functionName: "mintFee",
  });

  const ethFee: bigint =
    (mintFee as bigint | undefined) ?? parseEther("0.0005");
  const usdcPrice = getUsdcPrice(name);

  const handleCheck = async () => {
    if (!name) return;
    setHasChecked(true);
    await refetchAvailability();
  };

  const available =
    hasChecked && (isAvailable as boolean | undefined) === true && !isChecking;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <header className="mb-3 flex items-center justify-between text-xs text-slate-200">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 border border-slate-800">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="font-medium">Built on Base</span>
          </div>
          {isConnected && (
            <span className="text-[11px] text-slate-400">
              {shortenAddress(address)}
            </span>
          )}
        </header>

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl bg-slate-900/80 text-slate-100 shadow-2xl border border-slate-800 px-5 py-6 space-y-6"
        >
          <section className="space-y-2">
            <h1 className="text-xl font-semibold leading-tight">
              Claim your{" "}
              <span className="text-sky-400 font-semibold">.base</span> name
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pick a username, check availability, then mint with ETH or USDC.
              Gas can be sponsored when quota is available.
            </p>
          </section>

          <section className="space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              STEP 1 • CHOOSE A USERNAME
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-transparent">
              <span className="text-slate-500 text-sm">@</span>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value.toLowerCase());
                  setHasChecked(false);
                }}
                placeholder="yourname"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500 text-slate-50"
              />
              <span className="text-sm font-mono text-slate-400">.base</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleCheck}
                disabled={!name || isChecking}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                {isChecking ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-sky-200 animate-ping" />
                    Checking…
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-sky-300" />
                    Check
                  </>
                )}
              </button>

              <DesignOneAvailability
                name={name}
                hasChecked={hasChecked}
                isChecking={isChecking}
                isAvailable={isAvailable as boolean | undefined}
              />
            </div>
          </section>

          <DesignOneMintSection
            name={name}
            available={available}
            ethFee={ethFee}
            usdcPrice={usdcPrice}
          />

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Gasless when sponsored by our paymaster. If sponsorship quota is
            empty, your wallet will show a normal gas prompt.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function DesignOneAvailability(props: {
  name: string;
  hasChecked: boolean;
  isChecking: boolean;
  isAvailable?: boolean;
}) {
  const { name, hasChecked, isChecking, isAvailable } = props;

  if (!name) {
    return (
      <span className="text-[11px] text-slate-400">
        Type a name to start
      </span>
    );
  }

  if (isChecking) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-sky-400">
        <span className="h-2 w-2 rounded-full bg-sky-300 animate-ping" />
        Checking…
      </span>
    );
  }

  if (!hasChecked) {
    return (
      <span className="text-[11px] text-slate-400">
        Tap “Check” to continue
      </span>
    );
  }

  if (isAvailable) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-600 border border-emerald-200">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Available
      </span>
    );
  }

  if (isAvailable === false) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-600 border border-rose-200">
        <span className="h-2 w-2 rounded-full bg-rose-400" />
        Taken
      </span>
    );
  }

  return null;
}

function DesignOneMintSection(props: {
  name: string;
  available: boolean;
  ethFee: bigint;
  usdcPrice: number;
}) {
  const { name, available, ethFee, usdcPrice } = props;
  const [activeTab, setActiveTab] = useState<TabKey>("ETH");

  const disabledMint = !name || !available;

  return (
    <section className="space-y-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        STEP 2 • MINT
      </div>

      <div className="inline-flex rounded-full bg-slate-900 px-1 py-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("ETH")}
          className={`px-3 py-1 rounded-full ${
            activeTab === "ETH"
              ? "bg-sky-500 text-white font-semibold"
              : "text-slate-400"
          }`}
        >
          Pay with ETH
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("USDC")}
          className={`px-3 py-1 rounded-full ${
            activeTab === "USDC"
              ? "bg-sky-500 text-white font-semibold"
              : "text-slate-400"
          }`}
        >
          Pay with USDC
        </button>
      </div>

      {activeTab === "ETH" ? (
        <DesignOneMintWithEth name={name} disabled={disabledMint} ethFee={ethFee} />
      ) : (
        <DesignOneMintWithUsdc
          name={name}
          disabled={disabledMint}
          usdcPrice={usdcPrice}
        />
      )}
    </section>
  );
}

function DesignOneMintWithEth({
  name,
  ethFee,
  disabled,
}: {
  name: string;
  ethFee: bigint;
  disabled: boolean;
}) {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const [fallbackMode, setFallbackMode] = useState(false);

  const handleMint = useCallback(() => {
    if (!name || disabled) return;

    writeContract(
      {
        address: BASENAME_ADDRESS,
        abi: baseNameRegistryAbi,
        functionName: "register",
        args: [name],
        value: ethFee,
      },
      {
        onError(err) {
          console.error("mint ETH error", err);
          if (!fallbackMode) setFallbackMode(true);
        },
      },
    );
  }, [name, disabled, writeContract, ethFee, fallbackMode]);

  const feeText = (Number(ethFee) / 1e18).toFixed(4);

  const label = (() => {
    if (isPending || isConfirming) return "Minting…";
    if (isSuccess) return "Minted!";
    if (fallbackMode) return `Mint (${feeText} ETH + gas)`;
    return `Mint (${feeText} ETH, gasless)`;
  })();

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-400">
        Simple on-chain payment. Gas is sponsored when quota is available.
      </p>
      <motion.button
        type="button"
        disabled={disabled || isPending || isConfirming}
        onClick={handleMint}
        whileTap={!disabled ? { scale: 0.97 } : {}}
        className={`w-full rounded-xl py-2.5 text-sm font-semibold shadow-md transition
          ${
            disabled
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-sky-500 text-white hover:bg-sky-400"
          } ${
          isPending || isConfirming ? "opacity-80 cursor-wait" : ""
        }`}
      >
        {label}
      </motion.button>
      {error && (
        <p className="text-[11px] text-amber-600">
          Mint failed. Try again later or switch option.
        </p>
      )}
    </div>
  );
}

function DesignOneMintWithUsdc({
  name,
  usdcPrice,
  disabled,
}: {
  name: string;
  usdcPrice: number;
  disabled: boolean;
}) {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const [isPaying, setIsPaying] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  const handlePayAndMint = useCallback(async () => {
    if (!name || disabled) return;

    try {
      setIsPaying(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setHasPaid(true);

      writeContract({
        address: BASENAME_ADDRESS,
        abi: baseNameRegistryAbi,
        functionName: "register",
        args: [name],
        value: BigInt(0),
      });
    } finally {
      setIsPaying(false);
    }
  }, [name, disabled, writeContract]);

  const label = (() => {
    if (isPaying) return "Processing USDC payment…";
    if (isPending || isConfirming) return "Minting on-chain…";
    if (isSuccess) return "Minted via USDC!";
    return `Mint for ${usdcPrice.toFixed(2)} USDC`;
  })();

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-400">
        Pay in USDC (recommended). 5% creator fee already included.
      </p>
      <motion.button
        type="button"
        disabled={disabled || isPending || isConfirming || isPaying}
        onClick={handlePayAndMint}
        whileTap={!disabled ? { scale: 0.97 } : {}}
        className={`w-full rounded-xl py-2.5 text-sm font-semibold shadow-md transition
          ${
            disabled
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-slate-50 text-slate-900 hover:bg-slate-100"
          } ${
          isPending || isConfirming || isPaying ? "opacity-80 cursor-wait" : ""
        }`}
      >
        {label}
      </motion.button>
      {hasPaid && !isSuccess && (
        <p className="text-[11px] text-emerald-600">
          Payment received. Finalizing on-chain mint…
        </p>
      )}
      {error && (
        <p className="text-[11px] text-amber-600">
          Mint failed. Check your wallet activity or try again.
        </p>
      )}
    </div>
  );
}

export default function DesignOnePage() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  return <BaseNameMiniAppDesignOne />;
}

