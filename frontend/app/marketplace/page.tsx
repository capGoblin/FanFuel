"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Grid,
  List,
  TrendingUp,
  Heart,
  Star,
  ShoppingCart,
  Wallet,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import GlowButton from "@/components/ui/glow-button";
import MarketplaceNFTCard from "@/components/nft/MarketplaceNFTCard";
import BuyNFTDialog from "@/components/nft/BuyNFTDialog";
import { toast } from "sonner";
import Link from "next/link";
import { useMarketplaceListings } from "@/hooks/useMarketplaceListings";
import * as fcl from "@onflow/fcl";

export default function Marketplace() {
  const [user, setUser] = useState<{
    loggedIn: boolean | null;
    addr: string | null;
  }>({
    loggedIn: null,
    addr: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedNFT, setSelectedNFT] = useState<any | null>(null);
  const [showBuyDialog, setShowBuyDialog] = useState(false);

  // Subscribe to FCL current user
  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe(setUser);
    return () => unsubscribe();
  }, []);

  // Get marketplace listings
  const { listings, loading, error, refetch } = useMarketplaceListings();

  // Get unique campaigns for filter
  const campaigns = Array.from(
    new Set(listings.map((listing) => listing.campaign))
  );

  // Filter and sort listings
  const filteredListings = listings
    .filter((listing) => {
      const matchesSearch =
        listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.milestone.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCampaign =
        selectedCampaign === "all" || listing.campaign === selectedCampaign;
      const matchesPrice =
        listing.price >= priceRange[0] && listing.price <= priceRange[1];

      return matchesSearch && matchesCampaign && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
          return (
            new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime()
          );
        default:
          return 0;
      }
    });

  const handleBuyNFT = (nft: any) => {
    if (!user?.loggedIn) {
      toast.error("Please connect your wallet to purchase NFTs");
      return;
    }
    setSelectedNFT(nft);
    setShowBuyDialog(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCampaign("all");
    setPriceRange([0, 2000]);
    setSortBy("newest");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-gray-400">Loading marketplace listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-white mb-4">
            Error Loading Marketplace
          </h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => refetch()} variant="outline">
            <TrendingUp className="mr-2 h-4 w-4" />
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
            <ShoppingCart className="h-3 w-3 mr-1" />
            NFT Marketplace
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            FanFuel Marketplace
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Buy milestone NFTs from your favorite campaigns and support creators
          </p>
        </motion.div>

        {/* Stats Bar - Updated for real data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              label: "Listed NFTs",
              value: listings.length.toString(),
              color: "text-purple-400",
              icon: <Grid className="h-4 w-4" />,
            },
            {
              label: "Active Campaigns",
              value: campaigns.length.toString(),
              color: "text-cyan-400",
              icon: <Star className="h-4 w-4" />,
            },
            {
              label: "Avg Price",
              value:
                listings.length > 0
                  ? `${(
                      listings.reduce((acc, nft) => acc + nft.price, 0) /
                      listings.length
                    ).toFixed(1)} FLOW`
                  : "0 FLOW",
              color: "text-green-400",
              icon: <TrendingUp className="h-4 w-4" />,
            },
            {
              label: "Total Volume",
              value: `${listings
                .reduce((acc, nft) => acc + nft.price, 0)
                .toFixed(1)} FLOW`,
              color: "text-pink-400",
              icon: <Heart className="h-4 w-4" />,
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm"
            >
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <div className={`text-lg font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm sticky top-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-400 hover:text-white"
                  >
                    Clear
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search NFTs, campaigns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <Separator className="bg-gray-600/50" />

                  {/* Campaign Filter */}
                  {campaigns.length > 0 && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-white font-medium">
                          Campaign
                        </Label>
                        <Select
                          value={selectedCampaign}
                          onValueChange={setSelectedCampaign}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="All Campaigns" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="all" className="text-white">
                              All Campaigns
                            </SelectItem>
                            {campaigns.map((campaign) => (
                              <SelectItem
                                key={campaign}
                                value={campaign}
                                className="text-white"
                              >
                                {campaign}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator className="bg-gray-600/50" />
                    </>
                  )}

                  {/* Price Range */}
                  <div className="space-y-4">
                    <Label className="text-white font-medium">
                      Price Range (FLOW)
                    </Label>
                    <div className="px-3">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={2000}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-2 text-sm text-gray-400">
                        <span>{priceRange[0]} FLOW</span>
                        <span>{priceRange[1]} FLOW</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-600/50" />

                  {/* Sort */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="newest" className="text-white">
                          Newest Listed
                        </SelectItem>
                        <SelectItem value="price-low" className="text-white">
                          Price: Low to High
                        </SelectItem>
                        <SelectItem value="price-high" className="text-white">
                          Price: High to Low
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <p className="text-gray-400">
                  {filteredListings.length} NFT
                  {filteredListings.length !== 1 ? "s" : ""} found
                </p>
                {(searchTerm ||
                  selectedCampaign !== "all" ||
                  priceRange[0] > 0 ||
                  priceRange[1] < 2000) && (
                  <Badge
                    variant="outline"
                    className="border-purple-500 text-purple-400"
                  >
                    Filtered
                  </Badge>
                )}
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
              </div>
            </div>

            {/* NFT Grid or Empty State */}
            {filteredListings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  {listings.length === 0 ? (
                    <ShoppingCart className="h-12 w-12 text-gray-500" />
                  ) : (
                    <Search className="h-12 w-12 text-gray-500" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {listings.length === 0
                    ? "No NFTs Listed Yet"
                    : "No NFTs Found"}
                </h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  {listings.length === 0
                    ? "Be the first to list an NFT on the FanFuel marketplace! Start by minting NFTs from campaigns."
                    : "No NFTs match your current filters. Try adjusting your search criteria."}
                </p>
                {listings.length === 0 ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <GlowButton asChild>
                      <Link href="/campaigns">
                        <Star className="mr-2 h-4 w-4" />
                        Explore Campaigns
                      </Link>
                    </GlowButton>
                    <Button variant="outline" asChild>
                      <Link href="/gallery">
                        <Plus className="mr-2 h-4 w-4" />
                        List Your NFTs
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {filteredListings.map((listing, index) => (
                  <MarketplaceNFTCard
                    key={listing.id}
                    listing={listing}
                    index={index}
                    onBuy={handleBuyNFT}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Connect Wallet CTA for non-logged in users */}
        {!user?.loggedIn && listings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <Card className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 border-purple-500/30">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Connect Your Wallet to Start Shopping
                </h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Connect your Flow wallet to purchase milestone NFTs and
                  support your favorite creators. Every purchase includes
                  automatic royalties to campaign creators.
                </p>
                <GlowButton onClick={() => fcl.authenticate()}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </GlowButton>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Featured Campaigns Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <Card className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 border-purple-500/30">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Discover Amazing Campaigns
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Support your favorite creators by purchasing their milestone
                NFTs. Every purchase includes a 5% royalty that goes directly to
                the campaign creator.
              </p>
              <GlowButton asChild>
                <Link href="/campaigns">
                  <Star className="mr-2 h-4 w-4" />
                  Browse All Campaigns
                </Link>
              </GlowButton>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Buy NFT Dialog */}
      {selectedNFT && (
        <BuyNFTDialog
          open={showBuyDialog}
          onOpenChange={setShowBuyDialog}
          listing={selectedNFT}
        />
      )}
    </div>
  );
}
