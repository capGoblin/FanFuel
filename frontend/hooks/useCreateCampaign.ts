"use client";

import { useState } from "react";
import * as fcl from "@onflow/fcl";

// Cadence transaction to create a campaign
const CREATE_CAMPAIGN_TRANSACTION = `
import CampaignManager from 0xCampaignManager

transaction(title: String, description: String, imageURL: String, goalAmount: UFix64, milestones: [String], totalNFTs: UInt64) {
    prepare(signer: auth(Storage) &Account) {
        // Call the contract directly in prepare so we have access to signer.address
        CampaignManager.createCampaign(
            creator: signer.address,
            title: title,
            description: description,
            imageURL: imageURL,
            goalAmount: goalAmount,
            milestones: milestones,
            totalNFTs: totalNFTs
        )
    }
    
    execute {
        log("Campaign created via frontend transaction ✨")
    }
}
`;

export interface CreateCampaignParams {
  title: string;
  description: string;
  imageURL: string;
  goalAmount: number;
  milestones: string[];
  totalNFTs: number;
}

export function useCreateCampaign() {
  const [isPending, setIsPending] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleCreateCampaign = async (params: CreateCampaignParams) => {
    try {
      setIsPending(true);
      setError(null);
      setTxId(null);

      const transactionId = await fcl.mutate({
        cadence: CREATE_CAMPAIGN_TRANSACTION,
        args: (arg, t) => [
          arg(params.title, t.String),
          arg(params.description, t.String),
          arg(params.imageURL, t.String),
          arg(params.goalAmount.toFixed(1), t.UFix64), // UFix64 requires exactly one decimal place
          arg(params.milestones, t.Array(t.String)),
          arg(params.totalNFTs, t.UInt64),
        ],
      });

      setTxId(transactionId);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsPending(false);
    }
  };

  return {
    createCampaign: handleCreateCampaign,
    isPending,
    txId,
    error,
  };
}
