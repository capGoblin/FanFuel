"use client";

import { useState } from "react";
import * as fcl from "@onflow/fcl";

const BUY_NFT_TRANSACTION = `
import NFTStorefrontV2 from 0x2d55b98eb200daef
import FlowToken        from 0x7e60df042a9c0868
import FungibleToken    from 0x9a0766d93b6608b7
import MilestoneNFT     from 0xcc3f81c625b55c77
import NonFungibleToken from 0x631e88ae7f1d7c20

/// Purchases a listing from a seller's StorefrontV2 and deposits the NFT into buyer's collection.
///
/// Parameters:
/// - \`seller\`     : Address of the seller (owner of the storefront)
/// - \`listingID\`  : ID of the Listing resource in the seller's storefront
/// - \`price\`      : Expected sale price (FLOW) – used as safety check
transaction(seller: Address, listingID: UInt64, price: UFix64) {
    prepare(buyer: auth(Storage, Capabilities) &Account) {
        // 1️⃣ Borrow the seller's storefront public capability
        let storefront = getAccount(seller)
            .capabilities.get<&{NFTStorefrontV2.StorefrontPublic}>(NFTStorefrontV2.StorefrontPublicPath)
            .borrow()
            ?? panic("Seller has no storefront")

        // 2️⃣ Borrow the listing
        let listing = storefront.borrowListing(listingResourceID: listingID)
            ?? panic("Listing not found")

        // Optional safety check on price
        let details = listing.getDetails()
        assert(details.salePrice == price, message: "Price mismatch")

        // 3️⃣ Withdraw FlowToken payment from buyer
        let vaultRef = buyer.storage.borrow<auth(FungibleToken.Withdraw) & FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Missing FlowToken vault")
        let payment <- vaultRef.withdraw(amount: price)

        // 4️⃣ Ensure buyer has MilestoneNFT collection – create if absent
        if buyer.storage.borrow<&MilestoneNFT.Collection>(from: MilestoneNFT.CollectionStoragePath) == nil {
            let collection <- MilestoneNFT.createEmptyCollection(nftType: Type<@MilestoneNFT.NFT>())
            buyer.storage.save(<-collection, to: MilestoneNFT.CollectionStoragePath)
            buyer.capabilities.publish(
                buyer.capabilities.storage.issue<&{NonFungibleToken.Collection}>(MilestoneNFT.CollectionStoragePath),
                at: MilestoneNFT.CollectionPublicPath
            )
        }

        let collectionRef = buyer.storage.borrow<&{NonFungibleToken.Collection}>(from: MilestoneNFT.CollectionStoragePath)
            ?? panic("Could not borrow NFT collection")

        // 5️⃣ Purchase the NFT (no commission recipient)
        let purchased <- listing.purchase(payment: <- payment, commissionRecipient: nil)

        // Deposit into buyer's collection
        collectionRef.deposit(token: <- purchased)
    }

    execute {
        log("✅ Purchased listing ".concat(listingID.toString()).concat(" from ").concat(seller.toString()))
    }
}
`;

interface UseBuyNFTResult {
  buyNFT: (
    seller: string,
    listingId: string,
    price: string
  ) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

export function useBuyNFT(): UseBuyNFTResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buyNFT = async (
    seller: string,
    listingId: string,
    price: string
  ): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Format price to have exactly one decimal place for UFix64
      const formattedPrice = parseFloat(price).toFixed(1);

      const transactionId = await fcl.mutate({
        cadence: BUY_NFT_TRANSACTION,
        args: (arg, t) => [
          arg(seller, t.Address),
          arg(listingId, t.UInt64),
          arg(formattedPrice, t.UFix64),
        ],
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000,
      });

      // Wait for transaction to be sealed
      const transaction = await fcl.tx(transactionId).onceSealed();

      if (transaction.status === 4) {
        // SEALED
        return transactionId;
      } else {
        throw new Error("Transaction failed");
      }
    } catch (err) {
      console.error("Error buying NFT:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to buy NFT";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    buyNFT,
    isLoading,
    error,
  };
}
