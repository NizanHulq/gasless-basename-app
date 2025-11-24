"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { BASENAME_REGISTRY } from "../src/contracts";

const BASENAME_ADDRESS = BASENAME_REGISTRY.address;
const baseNameRegistryAbi = BASENAME_REGISTRY.abi;

function shortenAddress(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function estimateUsdcPrice(name: string): number {
  if (!name) return 0;
  if (name.length <= 3) return 20;
  if (name.length <= 5) return 10;
  return 5;
}

function BaseNameMiniAppDesignTwo() {
  const { address, isConnected } = useAccount();
  const [name, setName] = useState("");
  const [hasTyped, setHasTyped] = useState(false);
  const [availabilityTouched, setAvailabilityTouched] = useState(false);

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
  const usdcPrice = estimateUsdcPrice(name);

  const handleCheck = async () => {
    if (!name) return;
    setAvailabilityTouched(true);
    await refetchAvailability();
  };

  const isNameAvailable =
    availabilityTouched && (isAvailable as boolean | undefined) === true;

  return (
    <div className="design2-root">
      <div className="design2-background" />

      <div className="design2-inner">
        <header className="mb-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
            Built on Base
          </div>
          {isConnected && (
            <span className="max-w-[55%] truncate text-right text-[11px] text-slate-300">
              Signed in as{" "}
              <span className="font-mono">{shortenAddress(address)}</span>
            </span>
          )}
        </header>

        <motion.div
          className="design2-card"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
        >
          <div className="design2-card-glow" />

          <motion.h1
            className="text-center text-xl font-semibold leading-tight text-slate-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            Claim your{" "}
            <span className="text-sky-400 font-semibold">.base</span> name
          </motion.h1>

          <motion.p
            className="mt-2 text-center text-xs text-slate-300 leading-relaxed"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
          >
            One tap to secure your onchain username. Gasless when sponsored.
          </motion.p>

          <motion.div
            className="mt-6 space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold tracking-[0.16em] uppercase">
                Step 1
              </span>
              <span>Choose a name</span>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-transparent">
              <span className="text-slate-500 text-sm">@</span>
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500 text-slate-50"
                placeholder="yourname"
                value={name}
                onChange={(e) => {
                  setName(e.target.value.toLowerCase());
                  setHasTyped(true);
                  setAvailabilityTouched(false);
                }}
              />
              <div className="px-3 py-1 rounded-full bg-slate-800 text-xs font-mono text-slate-200">
                .base
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <button
                onClick={handleCheck}
                disabled={!name}
                className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-100 hover:border-sky-400 hover:text-sky-200 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed"
              >
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                Check availability
              </button>

              <DesignTwoAvailabilityBadge
                name={name}
                hasTyped={hasTyped}
                availabilityTouched={availabilityTouched}
                isChecking={isChecking}
                isAvailable={isAvailable as boolean | undefined}
              />
            </div>
          </motion.div>

          <DesignTwoMintSection
            name={name}
            isChecking={isChecking}
            isAvailable={isAvailable as boolean | undefined}
            availabilityTouched={availabilityTouched}
            isNameAvailable={isNameAvailable}
            ethFee={ethFee}
            usdcPrice={usdcPrice}
          />
        </motion.div>

        <motion.div
          className="mt-5 flex items-center justify-between text-[11px] text-slate-500"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span>Mini app • Base & Farcaster ready</span>
          <span>v0.2 • alt design</span>
        </motion.div>
      </div>
    </div>
  );
}

function DesignTwoAvailabilityBadge(props: {
  name: string;
  hasTyped: boolean;
  availabilityTouched: boolean;
  isChecking: boolean;
  isAvailable?: boolean;
}) {
  const { name, hasTyped, availabilityTouched, isChecking, isAvailable } =
    props;

  if (!hasTyped || !name) {
    return (
      <span className="text-[11px] text-slate-400">
        Type a name to begin
      </span>
    );
  }

  if (isChecking && availabilityTouched) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-sky-400">
        <span className="h-2 w-2 rounded-full bg-sky-300 animate-ping" />
        Checking…
      </span>
    );
  }

  if (!availabilityTouched) {
    return (
      <span className="text-[11px] text-slate-400">
        Tap “Check availability”
      </span>
    );
  }

  if (isAvailable) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-600 border border-emerald-200">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        {`${name}.base is available`}
      </span>
    );
  }

  if (isAvailable === false) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-600 border border-rose-200">
        <span className="h-2 w-2 rounded-full bg-rose-400" />
        Already taken
      </span>
    );
  }

  return null;
}

function DesignTwoMintSection(props: {
  name: string;
  isChecking: boolean;
  isAvailable?: boolean;
  availabilityTouched: boolean;
  isNameAvailable: boolean;
  ethFee: bigint;
  usdcPrice: number;
}) {
  const {
    name,
    isChecking,
    isAvailable,
    availabilityTouched,
    isNameAvailable,
    ethFee,
    usdcPrice,
  } = props;

  const showMintOptions = Boolean(
    name && availabilityTouched && !isChecking && isAvailable,
  );

  let helperTitle = "";
  let helperDescription = "";

  if (!name) {
    helperTitle = "Start by choosing a name";
    helperDescription = "Type a username above and check availability.";
  } else if (!availabilityTouched) {
    helperTitle = "Check availability first";
    helperDescription = "We need to confirm on-chain that this .base is free.";
  } else if (isChecking) {
    helperTitle = "Checking on Base…";
    helperDescription =
      "Reading the registry contract to see if this name exists.";
  } else if (availabilityTouched && isAvailable === false) {
    helperTitle = "That name is already taken";
    helperDescription = "Try another handle or add a few characters.";
  } else if (isNameAvailable) {
    helperTitle = "Ready to mint";
    helperDescription =
      "Pick how you’d like to pay — ETH on-chain or USDC off-chain.";
  }

  return (
    <motion.div
      className="mt-7 space-y-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.26 }}
    >
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="font-semibold uppercase tracking-[0.16em]">
          Step 2 · Mint
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Gasless when sponsored
        </span>
      </div>

      {!showMintOptions ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 px-3.5 py-3 text-[11px] text-slate-300">
          <div className="font-semibold">{helperTitle}</div>
          <div className="mt-1 text-slate-400">{helperDescription}</div>
        </div>
      ) : (
        <div className="space-y-3">
          <DesignTwoMintOptionsRow
            name={name}
            isNameAvailable={isNameAvailable}
            ethFee={ethFee}
            usdcPrice={usdcPrice}
          />
          <p className="text-[11px] leading-relaxed text-slate-400">
            Gas is sponsored when quota is available. If sponsorship runs out,
            your wallet will show a normal gas prompt instead.
          </p>
        </div>
      )}
    </motion.div>
  );
}

function DesignTwoMintOptionsRow({
  name,
  isNameAvailable,
  ethFee,
  usdcPrice,
}: {
  name: string;
  isNameAvailable: boolean;
  ethFee: bigint;
  usdcPrice: number;
}) {
  const disabled = !name || !isNameAvailable;

  return (
    <div className="grid grid-cols-1 gap-3">
      <DesignTwoMintWithEthButton
        name={name}
        ethFee={ethFee}
        disabled={disabled}
      />
      <DesignTwoMintWithUsdcButton
        name={name}
        usdcPrice={usdcPrice}
        disabled={disabled}
      />
    </div>
  );
}

function DesignTwoMintWithEthButton({
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
    data: txHash,
    isPending,
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
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
          console.error("Mint ETH error", err);
          if (!fallbackMode) {
            setFallbackMode(true);
          }
        },
      },
    );
  }, [name, disabled, ethFee, writeContract, fallbackMode]);

  const label = (() => {
    if (isPending || isConfirming) return "Minting…";
    if (isSuccess) return "Minted!";
    const feeText = (Number(ethFee) / 1e18).toFixed(4);
    if (fallbackMode) return `Mint (${feeText} ETH + gas)`;
    return `Mint (${feeText} ETH gasless)`;
  })();

  const disabledStyles = disabled || isPending || isConfirming;

  return (
    <motion.button
      type="button"
      disabled={disabledStyles}
      onClick={handleMint}
      className={`relative flex h-[80px] w-full flex-col items-start justify-center rounded-2xl border px-4 py-3 text-left text-xs transition-all ${
        disabledStyles
          ? "border-slate-700 bg-slate-900 text-slate-500 cursor-not-allowed"
          : "border-slate-500 bg-slate-900 hover:border-sky-400 hover:shadow-md"
      }`}
      whileTap={!disabledStyles ? { scale: 0.97 } : {}}
      whileHover={!disabledStyles ? { y: -1 } : {}}
    >
      <div className="relative flex w-full items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            Pay with ETH
          </div>
          <div className="mt-1 text-sm font-medium text-slate-50">
            {label}
          </div>
        </div>
      </div>

      {error && (
        <div className="relative mt-1 text-[10px] text-amber-600">
          Mint failed • tap again to retry or switch option.
        </div>
      )}
    </motion.button>
  );
}

function DesignTwoMintWithUsdcButton({
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
    data: txHash,
    isPending,
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [isPaying, setIsPaying] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  const handlePayAndMint = useCallback(async () => {
    if (!name || disabled) return;
    try {
      setIsPaying(true);

      await new Promise((resolve) => setTimeout(resolve, 1200));
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
    return `Mint with USDC (${usdcPrice.toFixed(2)} USDC)`;
  })();

  const disabledStyles = disabled || isPending || isConfirming || isPaying;

  return (
    <motion.button
      type="button"
      disabled={disabledStyles}
      onClick={handlePayAndMint}
      className={`relative flex h-[80px] w-full flex-col items-start justify-center rounded-2xl border px-4 py-3 text-left text-xs transition-all ${
        disabledStyles
          ? "border-slate-700 bg-slate-900 text-slate-500 cursor-not-allowed"
          : "border-sky-500 bg-slate-900 hover:border-sky-400 hover:shadow-md"
      }`}
      whileTap={!disabledStyles ? { scale: 0.97 } : {}}
      whileHover={!disabledStyles ? { y: -1 } : {}}
    >
      <div className="relative flex w-full items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300">
            <span className="h-1 w-4 rounded-full bg-sky-400" />
            Pay with USDC
          </div>
          <div className="mt-1 text-sm font-medium text-slate-50">
            {label}
          </div>
        </div>
      </div>

      {hasPaid && !isSuccess && (
        <div className="relative mt-1 text-[10px] text-emerald-600">
          Payment confirmed • finalizing on-chain mint…
        </div>
      )}

      {error && (
        <div className="relative mt-1 text-[10px] text-amber-600">
          Mint failed • check your wallet or try again.
        </div>
      )}
    </motion.button>
  );
}

export default function DesignTwoPage() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  return <BaseNameMiniAppDesignTwo />;
}

