import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

interface Campaign {
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

interface UseCampaignResult {
  campaign: Campaign | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCampaign(campaignId: string | null): UseCampaignResult {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaign = async () => {
    if (!campaignId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const getCampaignScript = `
        import CampaignManager from 0xCampaignManager

        access(all) fun main(campaignID: UInt64): CampaignManager.Campaign? {
            return CampaignManager.getCampaign(id: campaignID)
        }
      `;

      const result = await fcl.query({
        cadence: getCampaignScript,
        args: (arg, t) => [arg(campaignId, t.UInt64)],
      });

      if (result) {
        setCampaign({
          id: result.id.toString(),
          creator: result.creator,
          title: result.title,
          description: result.description,
          goalAmount: result.goalAmount,
          milestones: result.milestones,
          totalNFTs: result.totalNFTs.toString(),
          fundedAmount: result.fundedAmount,
          nftsMinted: result.nftsMinted.toString(),
          imageURL: result.imageURL,
          milestonesClaimed: result.milestonesClaimed,
        });
      } else {
        setError("Campaign not found");
      }
    } catch (err) {
      console.error("Error fetching campaign:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch campaign");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  return {
    campaign,
    loading,
    error,
    refetch: fetchCampaign,
  };
}
