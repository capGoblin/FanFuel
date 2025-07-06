"use client";

import { useState } from "react";
import * as fcl from "@onflow/fcl";

const SETUP_STOREFRONT_TRANSACTION = `
import NFTStorefrontV2 from 0x2d55b98eb200daef

/// Stores a Storefront resource in the signer's account if one doesn't already exist.
transaction {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Return early if storefront already exists
        if signer.storage.borrow<&NFTStorefrontV2.Storefront>(from: NFTStorefrontV2.StorefrontStoragePath) != nil {
            log("Storefront already exists")
            return
        }

        // Create a new storefront resource
        let storefront <- NFTStorefrontV2.createStorefront()

        // Save it into account storage
        signer.storage.save(<-storefront, to: NFTStorefrontV2.StorefrontStoragePath)

        // Publish the public capability for other users to browse/purchase listings
        signer.capabilities.publish(
            signer.capabilities.storage.issue<&{NFTStorefrontV2.StorefrontPublic}>(NFTStorefrontV2.StorefrontStoragePath),
            at: NFTStorefrontV2.StorefrontPublicPath
        )

        log("Storefront created and linked")
    }
}
`;

interface UseSetupStorefrontResult {
  setupStorefront: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  txId: string | null;
}

export function useSetupStorefront(): UseSetupStorefrontResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const setupStorefront = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTxId(null);

      const transactionId = await fcl.mutate({
        cadence: SETUP_STOREFRONT_TRANSACTION,
        args: () => [],
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000,
      });

      setTxId(transactionId);

      // Wait for transaction to be sealed
      const transaction = await fcl.tx(transactionId).onceSealed();

      if (transaction.status !== 4) {
        throw new Error("Transaction failed");
      }
    } catch (err) {
      console.error("Error setting up storefront:", err);
      setError(
        err instanceof Error ? err.message : "Failed to setup storefront"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    setupStorefront,
    isLoading,
    error,
    txId,
  };
}
