"use client";

import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";

const CHECK_STOREFRONT_SCRIPT = `
import NFTStorefrontV2 from 0x2d55b98eb200daef

access(all) fun main(account: Address): Bool {
    let storefrontRef = getAccount(account)
        .capabilities.get<&{NFTStorefrontV2.StorefrontPublic}>(NFTStorefrontV2.StorefrontPublicPath)
        .borrow()

    return storefrontRef != nil
}
`;

interface UseCheckStorefrontResult {
  hasStorefront: boolean | null;
  loading: boolean;
  error: string | null;
  checkStorefront: () => Promise<void>;
}

export function useCheckStorefront(
  userAddress: string | null
): UseCheckStorefrontResult {
  const [hasStorefront, setHasStorefront] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStorefront = async () => {
    if (!userAddress) {
      setHasStorefront(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await fcl.query({
        cadence: CHECK_STOREFRONT_SCRIPT,
        args: (arg, t) => [arg(userAddress, t.Address)],
      });

      setHasStorefront(result);
    } catch (err) {
      console.error("Error checking storefront setup:", err);
      setError(
        err instanceof Error ? err.message : "Failed to check storefront setup"
      );
      setHasStorefront(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStorefront();
  }, [userAddress]);

  return {
    hasStorefront,
    loading,
    error,
    checkStorefront,
  };
}
