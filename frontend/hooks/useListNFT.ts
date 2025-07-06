"use client";

import { useState } from "react";
import * as fcl from "@onflow/fcl";

const LIST_NFT_TRANSACTION = `
import NFTStorefrontV2 from 0x2d55b98eb200daef
import MilestoneNFT      from 0xa474cefca3cbc541
import FlowToken         from 0x7e60df042a9c0868
import NonFungibleToken  from 0x631e88ae7f1d7c20
import FungibleToken     from 0x9a0766d93b6608b7
import MetadataViews     from 0x631e88ae7f1d7c20

/// Lists a specific MilestoneNFT owned by the signer for sale on their StorefrontV2.
///
/// Parameters
/// - \`nftID\`     : The NFT ID to list.
/// - \`salePrice\` : Listing price in FLOW.
transaction(nftID: UInt64, salePrice: UFix64) {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // 1️⃣ Borrow storefront with CreateListing entitlement
        let storefrontRef = signer.storage.borrow<auth(NFTStorefrontV2.CreateListing) & NFTStorefrontV2.Storefront>(
            from: NFTStorefrontV2.StorefrontStoragePath
        ) ?? panic("Storefront not found – run SetupStorefront first")

        // 2️⃣ Capability allowing storefront to withdraw the NFT
        let providerCap = signer.capabilities.storage.issue<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
            MilestoneNFT.CollectionStoragePath
        )

        // 3️⃣ FlowToken receiver capability (seller)
        let sellerCap = signer.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)

        // 4️⃣ Read royalty metadata from the NFT to pay creator on resale
        let collectionRef = signer.storage.borrow<&MilestoneNFT.Collection>(from: MilestoneNFT.CollectionStoragePath)
            ?? panic("Could not borrow NFT collection")

        // Use MetadataViews to resolve royalties
        let resolver = collectionRef.borrowViewResolver(id: nftID)
            ?? panic("Could not borrow view resolver for NFT")

        let royaltyView = resolver.resolveView(Type<MetadataViews.Royalties>())
            as? MetadataViews.Royalties
            ?? panic("NFT does not expose royalties view")

        let royalties = royaltyView.getRoyalties()
        assert(royalties.length == 1, message: "Expected single royalty entry")

        let creatorRoyalty = royalties[0]
        let creatorCut = salePrice * creatorRoyalty.cut
        let sellerCut = salePrice - creatorCut

        let saleCuts: [NFTStorefrontV2.SaleCut] = [
            NFTStorefrontV2.SaleCut(receiver: creatorRoyalty.receiver, amount: creatorCut),
            NFTStorefrontV2.SaleCut(receiver: sellerCap,               amount: sellerCut)
        ]

        // 5️⃣ Expiry (seconds since epoch + buffer) cast to UInt64
        let expiryTimestamp: UInt64 = UInt64(getCurrentBlock().timestamp) + 600

        storefrontRef.createListing(
            nftProviderCapability: providerCap,
            nftType:               Type<@MilestoneNFT.NFT>(),
            nftID:                 nftID,
            salePaymentVaultType:  Type<@FlowToken.Vault>(),
            saleCuts:              saleCuts,
            marketplacesCapability:nil,
            customID:              nil,
            commissionAmount:      0.0,
            expiry:                expiryTimestamp
        )

        log("✅ Listed MilestoneNFT #".concat(nftID.toString()).concat(" for ").concat(salePrice.toString()).concat(" FLOW"))
    }
}
`;

interface UseListNFTResult {
  listNFT: (nftId: string, price: string) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

export function useListNFT(): UseListNFTResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listNFT = async (
    nftId: string,
    price: string
  ): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Format price to have exactly one decimal place for UFix64
      const formattedPrice = parseFloat(price).toFixed(1);

      const transactionId = await fcl.mutate({
        cadence: LIST_NFT_TRANSACTION,
        args: (arg, t) => [arg(nftId, t.UInt64), arg(formattedPrice, t.UFix64)],
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
      console.error("Error listing NFT:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to list NFT";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    listNFT,
    isLoading,
    error,
  };
}
