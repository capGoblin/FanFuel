"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  Zap,
  Star,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProgressBar from "@/components/ui/progress-bar";
import Link from "next/link";
import { useCampaigns } from "@/hooks/useCampaigns";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import * as fcl from "@onflow/fcl";
import { toast } from "sonner";

const categories = ["All", "Music", "Art", "Gaming", "Tech", "Film", "Fashion"];
const sortOptions = ["Latest", "Most Funded", "Ending Soon", "Most Backers"];

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");
  const { campaigns, isLoading, error, refetch } = useCampaigns();

  // 👤 current user state
  const [user, setUser] = useState<{
    loggedIn: boolean | null;
    addr: string | null;
  }>({
    loggedIn: null,
    addr: null,
  });
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = fcl.currentUser.subscribe(setUser);
    return () => unsub();
  }, []);

  // 🚀 withdraw handler
  const handleWithdraw = async (campaignId: string) => {
    if (!user.loggedIn || !user.addr) {
      toast.error("Please connect your wallet first");
      return;
    }

    setWithdrawingId(campaignId);

    const tx = `
      import FungibleToken from 0xFungibleToken
      import FlowToken from 0xFlowToken
      import CampaignManager from 0xCampaignManager

      transaction(campaignID: UInt64) {
        prepare(acct: auth(Storage) &Account) {
          let cap = acct.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
          CampaignManager.withdrawNextMilestone(
            campaignID: campaignID,
            recipientCap: cap
          )
        }
      }
    `;

    try {
      const txId = await fcl.mutate({
        cadence: tx,
        args: (arg, t) => [arg(campaignId, t.UInt64)],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000,
      });

      await fcl.tx(txId).onceSealed();
      toast.success("Milestone withdrawn ✨");
      refetch();
    } catch (err) {
      console.error(err);
      const raw = err instanceof Error ? err.message : String(err);
      let msg = "Withdrawal failed";
      if (raw.includes("Not enough funds collected")) {
        msg = "Not enough funds collected for the next milestone yet.";
      } else if (raw.includes("All milestones already claimed")) {
        msg = "All milestones for this campaign have already been claimed.";
      } else if (raw.includes("Recipient must be the campaign creator")) {
        msg = "Only the campaign creator can withdraw milestones.";
      }
      toast.error(msg);
    } finally {
      setWithdrawingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 mt-4">
            Loading campaigns from Flow blockchain...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl">Error loading campaigns</p>
          <p className="text-gray-400 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">
            Explore
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            Discover Amazing Campaigns
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Support creators and collect exclusive milestone NFTs with real
            utility and royalties
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Campaign Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-400">
            Found {filteredCampaigns.length} campaigns on Flow testnet
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>

        {/* Campaigns Grid */}
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-400 mb-6">
              Be the first to create a campaign on Flow!
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Link href="/create-campaign">Create Campaign</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/campaign/${campaign.id}`} className="block group">
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden cursor-pointer hover:scale-[1.02]">
                    <div className="relative h-48 overflow-hidden">
                      {/* Fallback gradient/emoji always behind */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <div className="text-6xl">🚀</div>
                      </div>

                      {/* Image layer (may hide itself on error) */}
                      {campaign.imageURL &&
                        (() => {
                          const displayUrl = campaign.imageURL.includes(
                            ".mypinata.cloud/ipfs/"
                          )
                            ? campaign.imageURL.replace(
                                /https?:\/\/[^/]+\/ipfs\/(.+)/,
                                "https://gateway.pinata.cloud/ipfs/$1"
                              )
                            : campaign.imageURL;
                          return (
                            <Image
                              src={displayUrl}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              onError={(e) => {
                                const target =
                                  e.currentTarget as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          );
                        })()}
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-cyan-500 to-purple-500">
                        <Star className="mr-1 h-3 w-3" />
                        On Flow
                      </Badge>
                    </div>

                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                            {campaign.title}
                          </h3>
                          <p className="text-gray-400 text-sm mt-1">
                            by {campaign.creator.slice(0, 6)}...
                            {campaign.creator.slice(-4)}
                          </p>
                        </div>

                        <p className="text-gray-300 text-sm line-clamp-2">
                          {campaign.description}
                        </p>

                        <div className="space-y-3">
                          <ProgressBar
                            progress={
                              (parseFloat(campaign.fundedAmount) /
                                parseFloat(campaign.goalAmount)) *
                              100
                            }
                          />
                          <div className="flex justify-between text-sm">
                            <span className="text-white font-semibold">
                              {parseFloat(campaign.fundedAmount).toFixed(2)} FLOW
                            </span>
                            <span className="text-gray-400">
                              of {parseFloat(campaign.goalAmount).toFixed(0)} FLOW
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-400">
                          <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            {campaign.nftsMinted} NFTs minted
                          </div>
                          <div className="flex items-center">
                            <Zap className="mr-1 h-4 w-4" />
                            {campaign.milestones.length} milestones
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <Badge
                            variant="outline"
                            className="border-cyan-500 text-cyan-400"
                          >
                            {(
                              parseFloat(campaign.goalAmount) /
                              parseFloat(campaign.totalNFTs)
                            ).toFixed(2)}{" "}
                            FLOW/NFT
                          </Badge>
                          
                          {user.addr?.toLowerCase() === campaign.creator.toLowerCase() ? (
                            <Button
                              size="sm"
                              disabled={withdrawingId === campaign.id}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleWithdraw(campaign.id);
                              }}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 relative z-10"
                            >
                              {withdrawingId === campaign.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                "Withdraw Milestone"
                              )}
                            </Button>
                          ) : (
                            <div className="flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
                              <span className="text-sm font-medium mr-2">Click to view</span>
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
