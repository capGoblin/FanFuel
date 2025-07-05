"use client";

import { useState } from "react";
import * as fcl from "@onflow/fcl";
import { useCheckNFTCollection } from "./useCheckNFTCollection";
import { useSetupNFTCollection } from "./useSetupNFTCollection";
import { useContributeAndMint } from "./useContributeAndMint";

interface UseContributeAndMintWithSetupResult {
  contributeWithSetup: (
    campaignId: string,
    amount: string
  ) => Promise<string | null>;
  needsSetup: boolean;
  setupAndContribute: (
    campaignId: string,
    amount: string
  ) => Promise<string | null>;
  loading: boolean;
  setupLoading: boolean;
  error: string | null;
  currentStep:
    | "checking"
    | "setup_needed"
    | "setting_up"
    | "contributing"
    | "complete"
    | "error";
}

export function useContributeAndMintWithSetup(
  userAddress: string | null
): UseContributeAndMintWithSetupResult {
  const [currentStep, setCurrentStep] = useState<
    | "checking"
    | "setup_needed"
    | "setting_up"
    | "contributing"
    | "complete"
    | "error"
  >("checking");
  const [error, setError] = useState<string | null>(null);

  const {
    isSetup,
    loading: checkingSetup,
    checkSetup,
  } = useCheckNFTCollection(userAddress);
  const {
    setupCollection,
    isLoading: setupLoading,
    txId: setupTxId,
  } = useSetupNFTCollection();
  const { contribute, loading: contributingLoading } = useContributeAndMint();

  const needsSetup = isSetup === false;
  const loading = checkingSetup || contributingLoading;

  const contributeWithSetup = async (
    campaignId: string,
    amount: string
  ): Promise<string | null> => {
    try {
      setError(null);
      setCurrentStep("checking");

      // First, check if collection is set up
      await checkSetup();

      if (isSetup === false) {
        setCurrentStep("setup_needed");
        return null; // Return null to indicate setup is needed
      }

      // If setup, proceed with contribution
      setCurrentStep("contributing");
      const txId = await contribute(campaignId, amount);

      if (txId) {
        setCurrentStep("complete");
        return txId;
      } else {
        setCurrentStep("error");
        return null;
      }
    } catch (err) {
      console.error("Error in contribute with setup:", err);
      setError(err instanceof Error ? err.message : "Failed to contribute");
      setCurrentStep("error");
      return null;
    }
  };

  const setupAndContribute = async (
    campaignId: string,
    amount: string
  ): Promise<string | null> => {
    try {
      setError(null);
      setCurrentStep("setting_up");

      // First, setup the collection
      await setupCollection();

      // Wait for setup transaction to complete
      if (setupTxId) {
        // Wait a bit for the transaction to be processed
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Refresh setup status
        await checkSetup();

        // Now contribute
        setCurrentStep("contributing");
        const txId = await contribute(campaignId, amount);

        if (txId) {
          setCurrentStep("complete");
          return txId;
        } else {
          setCurrentStep("error");
          return null;
        }
      } else {
        setCurrentStep("error");
        setError("Failed to setup NFT collection");
        return null;
      }
    } catch (err) {
      console.error("Error in setup and contribute:", err);
      setError(
        err instanceof Error ? err.message : "Failed to setup and contribute"
      );
      setCurrentStep("error");
      return null;
    }
  };

  return {
    contributeWithSetup,
    needsSetup,
    setupAndContribute,
    loading,
    setupLoading,
    error,
    currentStep,
  };
}
