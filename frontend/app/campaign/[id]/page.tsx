"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Wallet,
  Target,
  Users,
  Calendar,
  Share2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import ProgressBar from "@/components/ui/progress-bar";
import GlowButton from "@/components/ui/glow-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCampaign } from "@/hooks/useCampaign";
import { useContributeAndMint } from "@/hooks/useContributeAndMint";
import * as fcl from "@onflow/fcl";

interface CampaignDetailProps {
  params: { id: string };
}

export default function CampaignDetail({ params }: CampaignDetailProps) {
  const router = useRouter();
  const [user, setUser] = useState<{
    loggedIn: boolean | null;
    addr: string | null;
  }>({
    loggedIn: null,
    addr: null,
  });
  const [contributionAmount, setContributionAmount] = useState("");
  const [isContributionDialogOpen, setIsContributionDialogOpen] =
    useState(false);

  const { campaign, loading, error, refetch } = useCampaign(params.id);
  const {
    contribute,
    loading: isContributing,
    error: contributionError,
  } = useContributeAndMint();

  // Subscribe to FCL current user
  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe(setUser);
    return () => unsubscribe();
  }, []);

  const handleContribute = async () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast.error("Please enter a valid contribution amount");
      return;
    }

    if (!user?.loggedIn) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!campaign) {
      toast.error("Campaign not found");
      return;
    }

    // Calculate NFT price based on campaign data
    const nftPrice =
      parseFloat(campaign.goalAmount) / parseFloat(campaign.totalNFTs);
    const contributionValue = parseFloat(contributionAmount);

    if (contributionValue < nftPrice) {
      toast.error(
        `Minimum contribution is ${nftPrice.toFixed(4)} FLOW for 1 NFT`
      );
      return;
    }

    const txId = await contribute(params.id, contributionAmount);

    if (txId) {
      toast.success(`Contribution successful! Transaction ID: ${txId}`);
      setContributionAmount("");
      setIsContributionDialogOpen(false);
      // Refetch campaign data to get updated funding
      refetch();
    } else if (contributionError) {
      toast.error(contributionError);
    }
  };

  const shareProject = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Project link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-gray-400">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-white mb-4">
            Campaign Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            {error || "The campaign you are looking for does not exist."}
          </p>
          <Button onClick={() => router.push("/campaigns")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  const nftPrice =
    parseFloat(campaign.goalAmount) / parseFloat(campaign.totalNFTs);
  const progress =
    (parseFloat(campaign.fundedAmount) / parseFloat(campaign.goalAmount)) * 100;
  const availableNFTs =
    parseFloat(campaign.totalNFTs) - parseFloat(campaign.nftsMinted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            asChild
            className="text-gray-400 hover:text-white"
          >
            <Link href="/campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      variant="secondary"
                      className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                    >
                      Campaign #{campaign.id}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={shareProject}
                      className="text-gray-400 hover:text-white"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  <h1 className="text-3xl font-bold text-white mb-4">
                    {campaign.title}
                  </h1>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {campaign.description}
                  </p>

                  <div className="flex items-center mt-6 text-sm text-gray-400">
                    <span>Created by: </span>
                    <Link
                      href={`/profile/${campaign.creator}`}
                      className="ml-1 text-purple-400 hover:text-purple-300 font-medium"
                    >
                      {campaign.creator.slice(0, 8)}...
                      {campaign.creator.slice(-6)}
                    </Link>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Milestones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">
                    Campaign Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {campaign.milestones.length > 0 ? (
                    <div className="space-y-4">
                      {campaign.milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/30"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <span className="text-purple-400 text-sm font-medium">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              {milestone}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">
                      No milestones defined for this campaign.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Funding Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-white mb-2">
                      {parseFloat(campaign.fundedAmount).toFixed(4)} FLOW
                    </div>
                    <div className="text-gray-400">
                      of {parseFloat(campaign.goalAmount).toFixed(4)} FLOW goal
                    </div>
                  </div>

                  <ProgressBar
                    progress={progress}
                    className="h-3 mb-6"
                    showPercentage={false}
                  />

                  <div className="grid grid-cols-2 gap-4 text-center text-sm mb-6">
                    <div>
                      <div className="text-lg font-bold text-purple-400">
                        {Math.round(progress)}%
                      </div>
                      <div className="text-gray-400">Funded</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-cyan-400">
                        {campaign.nftsMinted}
                      </div>
                      <div className="text-gray-400">NFTs Minted</div>
                    </div>
                  </div>

                  {/* NFT Information */}
                  <div className="border-t border-gray-700/50 pt-4 mb-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">NFT Price:</span>
                        <span className="text-white font-medium">
                          {nftPrice.toFixed(4)} FLOW
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Available NFTs:</span>
                        <span className="text-white font-medium">
                          {availableNFTs} / {campaign.totalNFTs}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contribute Button */}
                  {user?.loggedIn ? (
                    <Dialog
                      open={isContributionDialogOpen}
                      onOpenChange={setIsContributionDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <GlowButton
                          className="w-full"
                          disabled={availableNFTs <= 0}
                        >
                          <Wallet className="mr-2 h-4 w-4" />
                          {availableNFTs > 0
                            ? "Contribute & Get NFT"
                            : "Sold Out"}
                        </GlowButton>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            Contribute to Campaign
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="amount" className="text-gray-300">
                              Contribution Amount (FLOW)
                            </Label>
                            <Input
                              id="amount"
                              type="number"
                              step="0.0001"
                              min={nftPrice}
                              placeholder={`Minimum: ${nftPrice.toFixed(
                                4
                              )} FLOW`}
                              value={contributionAmount}
                              onChange={(e) =>
                                setContributionAmount(e.target.value)
                              }
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              You will receive 1 NFT for every{" "}
                              {nftPrice.toFixed(4)} FLOW contributed
                            </p>
                          </div>
                          <Button
                            onClick={handleContribute}
                            disabled={isContributing}
                            className="w-full"
                          >
                            {isContributing
                              ? "Processing..."
                              : "Contribute Now"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button
                      onClick={() => fcl.authenticate()}
                      variant="outline"
                      className="w-full"
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet to Contribute
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Campaign Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    Campaign Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Goal Amount</p>
                        <p className="text-white font-medium">
                          {parseFloat(campaign.goalAmount).toFixed(4)} FLOW
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-cyan-400" />
                      <div>
                        <p className="text-sm text-gray-400">Total NFTs</p>
                        <p className="text-white font-medium">
                          {campaign.totalNFTs}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Wallet className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-sm text-gray-400">Creator</p>
                        <p className="text-white font-medium font-mono text-xs">
                          {campaign.creator}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
