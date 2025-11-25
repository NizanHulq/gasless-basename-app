"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { parseEther, type BaseError } from "viem";
import { BASENAME_REGISTRY } from "./src/contracts";
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownLink,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
} from '@coinbase/onchainkit/identity';

const ENV = process.env.NEXT_PUBLIC_ENV || "production";
const EXPECTED_CHAIN_ID = ENV === "testnet" ? baseSepolia.id : base.id;

const BASENAME_ADDRESS = BASENAME_REGISTRY.address;
const baseNameRegistryAbi = BASENAME_REGISTRY.abi;

type PaymentMethod = "ETH" | "USDC";



function getUsdcPrice(name: string): number {
  if (!name) return 0;
  if (name.length <= 3) return 20;
  if (name.length <= 5) return 10;
  return 5;
}

export default function BaseNameMiniApp() {
  const { isConnected } = useAccount();
  const [name, setName] = useState("");
  const [hasChecked, setHasChecked] = useState(false);

  const {
    data: isAvailable,
    isLoading: isChecking,
    refetch: refetchAvailability,
    error: availabilityError,
  } = useReadContract({
    address: BASENAME_ADDRESS,
    abi: baseNameRegistryAbi,
    functionName: "isAvailable",
    args: [name || ""],
    chainId: EXPECTED_CHAIN_ID,
    query: { enabled: false },
  });

  const { data: mintFee } = useReadContract({
    address: BASENAME_ADDRESS,
    abi: baseNameRegistryAbi,
    functionName: "mintFee",
    chainId: EXPECTED_CHAIN_ID,
  });

  const ethFee: bigint =
    (mintFee as bigint | undefined) ?? parseEther("0.0005");
  const usdcPrice = getUsdcPrice(name);

  const handleCheck = async () => {
    if (!name) return;
    setHasChecked(true);
    await refetchAvailability();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <header className="mb-3 flex items-center justify-end text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <Wallet>
              <ConnectWallet className="bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 rounded-full px-3 py-1 text-xs h-auto min-h-0 shadow-sm">
                <Avatar className="h-4 w-4" />
                <Name className="text-slate-900" />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                </Identity>
                <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
                  Wallet
                </WalletDropdownLink>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200 px-5 py-6 space-y-6"
        >
          <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100">
            <img
              src="/hero.png"
              alt="Base Name Hero"
              className="w-full h-32 object-cover"
            />
          </div>

          <section className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700">
              <span className="h-4 w-4 rounded-full bg-sky-500 text-[10px] text-white flex items-center justify-center">
                ⓑ
              </span>
              Claim your onchain handle
            </div>
            <h1 className="text-xl font-semibold leading-tight">
              Mint your{" "}
              <span className="text-sky-600 font-semibold">.base</span> name
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pick a name, check it, then mint with ETH or USDC on Base.
            </p>
          </section>

          <section className="space-y-3">
            <StepHeader step={1} title="Choose your name" />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 shadow-inner flex items-center gap-2 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-transparent">
              <span className="text-slate-400 text-sm">@</span>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value.toLowerCase());
                  setHasChecked(false);
                }}
                placeholder="yourname"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-900"
              />
              <span className="text-sm font-mono text-slate-500">.base</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleCheck}
                disabled={!name || isChecking}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-sky-500 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
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

              <AvailabilityBadge
                name={name}
                hasChecked={hasChecked}
                isChecking={isChecking}
                isAvailable={isAvailable as boolean | undefined}
                error={availabilityError}
              />
            </div>
          </section>

          <MintSection
            name={name}
            canMint={
              hasChecked &&
              (isAvailable as boolean | undefined) === true &&
              !isChecking
            }
            hasChecked={hasChecked}
            isChecking={isChecking}
            isAvailable={isAvailable as boolean | undefined}
            ethFee={ethFee}
            usdcPrice={usdcPrice}
            expectedChainId={EXPECTED_CHAIN_ID}
            isConnected={isConnected}
          />
        </motion.div>
      </div>
    </div>
  );
}

function StepHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-[11px] font-semibold text-white">
        {step}
      </div>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Step {step}
        </div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
      </div>
    </div>
  );
}

function AvailabilityBadge(props: {
  name: string;
  hasChecked: boolean;
  isChecking: boolean;
  isAvailable?: boolean;
  error?: Error | null;
}) {
  const { name, hasChecked, isChecking, isAvailable, error } = props;

  if (!name) {
    return (
      <span className="text-[11px] text-slate-400">
        Type a name to start
      </span>
    );
  }

  if (isChecking) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-sky-500">
        <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
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

  if (error) {
    return (
      <span className="text-[11px] text-amber-600">
        Error checking name — check RPC/API key.
      </span>
    );
  }

  return null;
}

function MintSection(props: {
  name: string;
  canMint: boolean;
  hasChecked: boolean;
  isChecking: boolean;
  isAvailable?: boolean;
  ethFee: bigint;
  usdcPrice: number;
  expectedChainId: number;
  isConnected: boolean;
}) {
  const {
    name,
    canMint,
    ethFee,
    usdcPrice,
    expectedChainId,
    isConnected,
  } = props;

  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [method, setMethod] = useState<PaymentMethod>("ETH");
  const [fallbackMode, setFallbackMode] = useState(false);
  const [isPayingUsdc, setIsPayingUsdc] = useState(false);
  const [hasPaidUsdc, setHasPaidUsdc] = useState(false);

  const {
    writeContract: writeEth,
    data: ethHash,
    isPending: isEthPending,
    error: ethError,
  } = useWriteContract();

  const {
    writeContract: writeUsdc,
    data: usdcHash,
    isPending: isUsdcPending,
    error: usdcError,
  } = useWriteContract();

  const {
    isLoading: isEthConfirming,
    isSuccess: isEthSuccess,
  } = useWaitForTransactionReceipt({
    hash: ethHash,
  });

  const {
    isLoading: isUsdcConfirming,
    isSuccess: isUsdcSuccess,
  } = useWaitForTransactionReceipt({
    hash: usdcHash,
  });

  const isMinting =
    method === "ETH"
      ? isEthPending || isEthConfirming
      : isUsdcPending || isUsdcConfirming || isPayingUsdc;

  const ethFeeText = (Number(ethFee) / 1e18).toFixed(4);

  const handleMint = useCallback(async () => {
    if (!isConnected) {
      // Should be handled by ConnectWallet button now
      return;
    }

    if (!name || !canMint) return;

    if (method === "ETH") {
      writeEth(
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
      return;
    }

    try {
      setIsPayingUsdc(true);

      // TODO: ganti ini dengan Base Accept Payments / backend flow
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setHasPaidUsdc(true);

      writeUsdc({
        address: BASENAME_ADDRESS,
        abi: baseNameRegistryAbi,
        functionName: "register",
        args: [name],
        value: BigInt(0),
      });
    } catch (err) {
      console.error("mint USDC error", err);
    } finally {
      setIsPayingUsdc(false);
    }
  }, [name, canMint, method, ethFee, writeEth, writeUsdc, fallbackMode, isConnected]);

  const primaryLabel = (() => {
    if (!isConnected) return "Connect Wallet";
    if (!canMint) return "Mint button will appear when ready";

    if (method === "ETH") {
      if (isMinting) return "Minting with ETH…";
      if (isEthSuccess) return "Minted with ETH!";
      if (fallbackMode) return `Mint now (${ethFeeText} ETH + gas)`;
      return `Mint now (${ethFeeText} ETH, gasless)`;
    }

    if (isMinting) return isPayingUsdc ? "Processing USDC payment…" : "Minting on-chain…";
    if (isUsdcSuccess) return "Minted with USDC!";
    return `Mint now (${usdcPrice.toFixed(2)} USDC)`;
  })();

  const activeError = method === "ETH" ? ethError : usdcError;

  return (
    <section className="space-y-3">
      {chainId !== expectedChainId && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-700 border border-amber-200 flex items-center justify-between">
          <span>
            Wrong network. Please switch to {expectedChainId === 84532 ? "Base Sepolia" : "Base Mainnet"}. (Detected: {chainId})
          </span>
          <button
            onClick={() => switchChain({ chainId: expectedChainId })}
            disabled={isSwitching}
            className="rounded bg-amber-200 px-2 py-1 text-[10px] font-semibold text-amber-800 hover:bg-amber-300 disabled:opacity-50"
          >
            {isSwitching ? "Switching..." : "Switch"}
          </button>
        </div>
      )}

      <StepHeader step={2} title="Choose how to mint" />

      <div className="grid grid-cols-1 gap-3">
        <PaymentMethodCard
          label="Pay with ETH"
          price={`${ethFeeText} ETH`}
          active={method === "ETH"}
          onClick={() => setMethod("ETH")}
        />

        <PaymentMethodCard
          label="Pay with USDC"
          price={`${usdcPrice.toFixed(2)} USDC`}
          active={method === "USDC"}
          onClick={() => setMethod("USDC")}
        />
      </div>

      {!isConnected ? (
        <Wallet>
          <ConnectWallet className="mt-1 w-full rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-sky-500 h-auto min-h-0">
            <span className="text-white">Connect Wallet</span>
          </ConnectWallet>
        </Wallet>
      ) : (
        <motion.button
          type="button"
          disabled={!canMint || isMinting || chainId !== expectedChainId}
          onClick={handleMint}
          whileTap={!isMinting && canMint && chainId === expectedChainId ? { scale: 0.97 } : {}}
          className={`mt-1 w-full rounded-xl py-2.5 text-sm font-semibold shadow-md transition
            ${
              !canMint || chainId !== expectedChainId
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-sky-600 text-white hover:bg-sky-500"
            } ${
            isMinting ? "opacity-80 cursor-wait" : ""
          }`}
        >
          {primaryLabel}
        </motion.button>
      )}

      {hasPaidUsdc && !isUsdcSuccess && method === "USDC" && (
        <p className="text-[11px] text-emerald-600">
          Payment received. Finalizing on-chain mint…
        </p>
      )}

      {activeError && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] text-rose-600 border border-rose-200 break-words">
          Error: {(activeError as BaseError).shortMessage || activeError.message}
        </div>
      )}
    </section>
  );
}

function PaymentMethodCard(props: {
  label: string;
  price: string;
  active: boolean;
  onClick: () => void;
}) {
  const { label, price, active, onClick } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl border px-3.5 py-3 text-left transition shadow-sm ${
        active
          ? "border-sky-500 bg-sky-50 shadow-md"
          : "border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 h-4 w-4 rounded-full border-2 ${
            active ? "border-sky-500" : "border-slate-300"
          } flex items-center justify-center`}
        >
          {active && (
            <span className="h-2 w-2 rounded-full bg-sky-500" />
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {label}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right text-[11px] text-slate-700">
        <div className="font-mono">{price}</div>
      </div>
    </button>
  );
}

