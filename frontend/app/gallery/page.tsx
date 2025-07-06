"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Grid, List, Search, Wallet, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import UserNFTCard from "@/components/nft/UserNFTCard";
import GlowButton from "@/components/ui/glow-button";
import { toast } from "sonner";
import Link from "next/link";
import * as fcl from "@onflow/fcl";
import { useUserNFTs } from "@/hooks/useUserNFTs";
import { useSetupNFTCollection } from "@/hooks/useSetupNFTCollection";
import { useCheckNFTCollection } from "@/hooks/useCheckNFTCollection";

export default function Gallery() {
  const [user, setUser] = useState<{
    loggedIn: boolean | null;
    addr: string | null;
  }>({
    loggedIn: null,
    addr: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [listingFilter, setListingFilter] = useState<
    "all" | "owned" | "listed"
  >("all");

  const {
    nfts,
    loading: nftsLoading,
    error,
    refetch,
  } = useUserNFTs(user?.addr);
  const {
    isSetup,
    loading: checkingSetup,
    checkSetup,
  } = useCheckNFTCollection(user?.addr);
  const {
    setupCollection,
    isLoading: isSettingUp,
    error: setupError,
    txId,
  } = useSetupNFTCollection();

  // Subscribe to FCL current user
  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe(setUser);
    return () => unsubscribe();
  }, []);

  // Track if we've already shown the success toast for this txId
  const shownToastRef = useRef<string | null>(null);

  // Handle setup transaction completion
  useEffect(() => {
    if (txId && txId !== shownToastRef.current) {
      shownToastRef.current = txId;
      toast.success("NFT Collection setup complete!");
      // Refetch NFTs and check setup after completion
      setTimeout(() => {
        checkSetup();
        refetch();
      }, 2000);
    }
  }, [txId, checkSetup, refetch]);

  const handleSetupCollection = async () => {
    try {
      await setupCollection();
    } catch (err) {
      toast.error("Failed to setup NFT collection");
    }
  };

  const filteredNFTs = nfts
    .filter((nft) => {
      const matchesSearch =
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Add demo isListed property for some NFTs for demonstration
      const nftWithListing = {
        ...nft,
        isListed: parseInt(nft.id) % 3 === 0, // Demo: every 3rd NFT is "listed"
      };

      let matchesFilter = true;
      if (listingFilter === "listed") {
        matchesFilter = nftWithListing.isListed;
      } else if (listingFilter === "owned") {
        matchesFilter = !nftWithListing.isListed;
      }

      return matchesSearch && matchesFilter;
    })
    .map((nft) => ({
      ...nft,
      isListed: parseInt(nft.id) % 3 === 0, // Add the isListed property to all filtered NFTs
    }));

  const handleRefresh = () => {
    checkSetup();
    refetch();
    toast.success("NFT collection refreshed!");
  };

  if (!user?.loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Wallet className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-400 mb-6">
            Connect your Flow wallet to view your NFT collection from FanFuel
            campaigns.
          </p>
          <GlowButton
            onClick={() => fcl.authenticate()}
            className="w-full mb-4"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </GlowButton>
          <Button variant="outline" asChild>
            <Link href="/campaigns">
              <Plus className="mr-2 h-4 w-4" />
              Explore Campaigns
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const loading = nftsLoading || checkingSetup;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-gray-400">Loading your NFT collection...</p>
        </div>
      </div>
    );
  }

  // Show setup screen if collection is not set up
  if (isSetup === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Plus className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Setup NFT Collection
          </h1>
          <p className="text-gray-400 mb-6">
            Initialize your NFT collection to start receiving and viewing NFTs
            from FanFuel campaigns.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Connected: {user.addr?.slice(0, 8)}...{user.addr?.slice(-6)}
          </p>
          <GlowButton
            onClick={handleSetupCollection}
            disabled={isSettingUp}
            className="w-full mb-4"
          >
            {isSettingUp ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Setting up...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Setup NFT Collection
              </>
            )}
          </GlowButton>
          {setupError && (
            <p className="text-red-400 text-sm mb-4">{setupError}</p>
          )}
          <Button variant="outline" asChild>
            <Link href="/campaigns">
              <Search className="mr-2 h-4 w-4" />
              Explore Campaigns
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    // Other errors (not collection setup related)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-white mb-4">
            Error Loading NFTs
          </h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">
            NFT Gallery
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            Your NFT Collection
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your exclusive NFTs from FanFuel campaigns
          </p>
          <div className="mt-4 text-sm text-gray-400">
            Connected: {user.addr?.slice(0, 8)}...{user.addr?.slice(-6)}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {[
            {
              label: "Total NFTs",
              value: nfts.length.toString(),
              color: "text-purple-400",
            },
            {
              label: "Owned",
              value: nfts
                .filter((nft) => !(parseInt(nft.id) % 3 === 0))
                .length.toString(),
              color: "text-cyan-400",
            },
            {
              label: "Listed",
              value: nfts
                .filter((nft) => parseInt(nft.id) % 3 === 0)
                .length.toString(),
              color: "text-green-400",
            },
            {
              label: "From Campaigns",
              value: nfts.length.toString(),
              color: "text-pink-400",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm"
            >
              <CardContent className="p-6 text-center">
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search NFTs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center space-x-2">
                  <div className="flex bg-gray-800 rounded-lg p-1">
                    <Button
                      variant={listingFilter === "all" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setListingFilter("all")}
                      className={`${
                        listingFilter === "all"
                          ? "bg-purple-600 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-700"
                      }`}
                    >
                      All
                    </Button>
                    <Button
                      variant={listingFilter === "owned" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setListingFilter("owned")}
                      className={`${
                        listingFilter === "owned"
                          ? "bg-purple-600 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-700"
                      }`}
                    >
                      Owned
                    </Button>
                    <Button
                      variant={listingFilter === "listed" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setListingFilter("listed")}
                      className={`${
                        listingFilter === "listed"
                          ? "bg-purple-600 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-700"
                      }`}
                    >
                      Listed
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* NFT Grid/List */}
        {nfts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Wallet className="h-12 w-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No NFTs Yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You haven't collected any NFTs yet. Contribute to campaigns to
              earn exclusive NFTs!
            </p>
            <GlowButton asChild>
              <Link href="/campaigns">
                <Plus className="mr-2 h-4 w-4" />
                Explore Campaigns
              </Link>
            </GlowButton>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {searchTerm && filteredNFTs.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-400">
                  No NFTs match your search for "{searchTerm}"
                </p>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {filteredNFTs.map((nft, index) => (
                  <UserNFTCard key={nft.id} nft={nft} index={index} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        {nfts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/campaigns">
                  <Plus className="mr-2 h-4 w-4" />
                  Discover More Campaigns
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
