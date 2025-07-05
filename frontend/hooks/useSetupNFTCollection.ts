"use client";

import { useState } from "react";
import * as fcl from "@onflow/fcl";

const SETUP_NFT_COLLECTION_TRANSACTION = `
import NonFungibleToken from 0xNonFungibleToken
import MilestoneNFT from 0xMilestoneNFT

transaction {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        let collectionExists = signer.storage.borrow<&MilestoneNFT.Collection>(from: MilestoneNFT.CollectionStoragePath) != nil

        if !collectionExists {
            // Create and save a new empty collection
            let collection <- MilestoneNFT.createEmptyCollection(nftType: Type<@MilestoneNFT.NFT>())
            signer.storage.save(<-collection, to: MilestoneNFT.CollectionStoragePath)
        }

        // (Re)publish a provider capability that includes Withdraw entitlement
        signer.capabilities.unpublish(MilestoneNFT.CollectionPublicPath)

        signer.capabilities.publish(
            signer.capabilities.storage.issue<&{NonFungibleToken.CollectionPublic}>(MilestoneNFT.CollectionStoragePath),
            at: MilestoneNFT.CollectionPublicPath
        )

        log("NFT Collection setup/refresh complete")
    }

    execute {
        log("Setup NFT Collection transaction executed")
    }
}
`;

interface UseSetupNFTCollectionResult {
  setupCollection: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  txId: string | null;
}

export function useSetupNFTCollection(): UseSetupNFTCollectionResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const setupCollection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTxId(null);

      const transactionId = await fcl.mutate({
        cadence: SETUP_NFT_COLLECTION_TRANSACTION,
        args: () => [],
      });

      setTxId(transactionId);
    } catch (err) {
      console.error("Error setting up NFT collection:", err);
      setError(
        err instanceof Error ? err.message : "Failed to setup collection"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    setupCollection,
    isLoading,
    error,
    txId,
  };
}
