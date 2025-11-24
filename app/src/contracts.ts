// src/contracts.ts
import { parseEther, type ContractFunctionParameters } from "viem";
import { baseNameRegistryAbi } from "./abi/BaseNameRegistry";

type PayableContractFunction = ContractFunctionParameters & {
  value?: bigint;
};

export const BASENAME_REGISTRY = {
  address: "0x651a242f3b09f4846adA583D3C2103069D9635F0" as `0x${string}`,
  abi: baseNameRegistryAbi,
} as const;

// Helper for Transaction `contracts` prop:
export const basenameMintContracts = (
  name: string,
): PayableContractFunction[] => [
    {
      address: BASENAME_REGISTRY.address,
      abi: BASENAME_REGISTRY.abi,
      functionName: "register",
      args: [name],
      value: parseEther("0.00035"), // 0.00035 ETH in wei
    },
  ];
