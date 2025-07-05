import { useState } from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

interface UseContributeAndMintResult {
  contribute: (campaignId: string, amount: string) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function useContributeAndMint(): UseContributeAndMintResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contribute = async (
    campaignId: string,
    amount: string
  ): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      const contributeTransaction = `
        import FungibleToken from 0xFungibleToken
        import FlowToken from 0xFlowToken
        import CampaignManager from 0xCampaignManager
        import NonFungibleToken from 0xNonFungibleToken
        import MilestoneNFT from 0xMilestoneNFT

        /// Contribute a specified FLOW amount to a campaign and automatically receive an NFT.
        /// The signer must be the contributor.
        transaction(campaignID: UInt64, amount: UFix64) {
            prepare(acct: auth(Storage, BorrowValue) &Account) {
                // 1️⃣ Ensure the signer has a MilestoneNFT.Collection stored
                if acct.storage.borrow<&MilestoneNFT.Collection>(from: MilestoneNFT.CollectionStoragePath) == nil {
                    let collection <- MilestoneNFT.createEmptyCollection(nftType: Type<@MilestoneNFT.NFT>())
                    acct.storage.save(<-collection, to: MilestoneNFT.CollectionStoragePath)
                }

                // Collection acts as an NFT receiver
                let receiverRef = acct.storage.borrow<&MilestoneNFT.Collection>(from: MilestoneNFT.CollectionStoragePath)
                    ?? panic("Could not borrow NFT collection")
                let nftReceiver = receiverRef as &{NonFungibleToken.Receiver}

                // 2️⃣ Withdraw the specified FLOW amount from the user's vault
                let vaultRef = acct.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
                    ?? panic("Could not borrow FlowToken vault with withdraw capability")
                let payment <- vaultRef.withdraw(amount: amount)

                // 3️⃣ Call the contract to record contribution and mint NFT
                CampaignManager.contributeAndMint(
                    campaignID: campaignID,
                    payment: <-payment,
                    nftRecipient: nftReceiver
                )
            }

            execute {
                log("Contribution successful and NFT minted 🎉")
            }
        }
      `;

      // Format amount to have exactly one decimal place for UFix64
      const formattedAmount = parseFloat(amount).toFixed(1);

      const txId = await fcl.mutate({
        cadence: contributeTransaction,
        args: (arg, t) => [
          arg(campaignId, t.UInt64),
          arg(formattedAmount, t.UFix64),
        ],
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000,
      });

      // Wait for transaction to be sealed
      const transaction = await fcl.tx(txId).onceSealed();

      if (transaction.status === 4) {
        // SEALED
        return txId;
      } else {
        throw new Error("Transaction failed");
      }
    } catch (err) {
      console.error("Error contributing to campaign:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to contribute to campaign";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    contribute,
    loading,
    error,
  };
}
