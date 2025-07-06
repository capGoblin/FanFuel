"use client";

import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";

// Cadence script to get all campaigns
const GET_CAMPAIGNS_SCRIPT = `
import CampaignManager from 0xCampaignManager

access(all)
fun main(): [CampaignManager.Campaign] {
    return CampaignManager.getCampaigns()
}
`;

export interface Campaign {
  id: string;
  creator: string;
  title: string;
  description: string;
  goalAmount: string;
  milestones: string[];
  totalNFTs: string;
  fundedAmount: string;
  nftsMinted: string;
  imageURL?: string;
  milestonesClaimed?: string;
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await fcl.query({
        cadence: GET_CAMPAIGNS_SCRIPT,
      });

      const transformedCampaigns = result
        ? result.map((campaign: any) => ({
            id: campaign.id,
            creator: campaign.creator,
            title: campaign.title,
            description: campaign.description,
            goalAmount: campaign.goalAmount,
            milestones: campaign.milestones,
            totalNFTs: campaign.totalNFTs,
            fundedAmount: campaign.fundedAmount,
            nftsMinted: campaign.nftsMinted,
            imageURL: campaign.imageURL,
            milestonesClaimed: campaign.milestonesClaimed,
          }))
        : [];

      console.log(transformedCampaigns);

      setCampaigns(transformedCampaigns);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    isLoading,
    error,
    refetch: fetchCampaigns,
  };
}
