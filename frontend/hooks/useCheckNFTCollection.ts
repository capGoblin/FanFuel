"use client";

import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";

const CHECK_COLLECTION_SCRIPT = `
import NonFungibleToken from 0x631e88ae7f1d7c20
import MilestoneNFT from 0xMilestoneNFT

access(all) fun main(account: Address): Bool {
    let collectionRef = getAccount(account)
        .capabilities.get<&{NonFungibleToken.CollectionPublic}>(MilestoneNFT.CollectionPublicPath)
        .borrow()

    return collectionRef != nil
}
`;

interface UseCheckNFTCollectionResult {
  isSetup: boolean | null;
  loading: boolean;
  error: string | null;
  checkSetup: () => Promise<void>;
}

export function useCheckNFTCollection(
  userAddress: string | null
): UseCheckNFTCollectionResult {
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSetup = async () => {
    if (!userAddress) {
      setIsSetup(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await fcl.query({
        cadence: CHECK_COLLECTION_SCRIPT,
        args: (arg, t) => [arg(userAddress, t.Address)],
      });

      setIsSetup(result);
    } catch (err) {
      console.error("Error checking NFT collection setup:", err);
      setError(
        err instanceof Error ? err.message : "Failed to check collection setup"
      );
      setIsSetup(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSetup();
  }, [userAddress]);

  return {
    isSetup,
    loading,
    error,
    checkSetup,
  };
}
