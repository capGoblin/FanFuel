"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  ExternalLink,
  Star,
  Info,
  Image as ImageIcon,
  Heart,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MarketplaceNFTCardProps {
  listing: {
    id: string;
    name: string;
    image: string;
    campaign: string;
    campaignId: string;
    milestone: string;
    price: number;
    seller: string;
    listedAt: string;
    royaltyRate: number;
    rarity: "Common" | "Rare" | "Epic" | "Legendary";
    description: string;
  };
  index: number;
  onBuy: (listing: MarketplaceNFTCardProps["listing"]) => void;
  viewMode?: "grid" | "list";
}

const rarityColors = {
  Common: "from-gray-500 to-gray-600",
  Rare: "from-blue-500 to-blue-600",
  Epic: "from-purple-500 to-purple-600",
  Legendary: "from-yellow-500 to-orange-500",
};

const rarityBorders = {
  Common: "border-gray-500/50",
  Rare: "border-blue-500/50",
  Epic: "border-purple-500/50",
  Legendary: "border-yellow-500/50",
};

export default function MarketplaceNFTCard({
  listing,
  index,
  onBuy,
  viewMode = "grid",
}: MarketplaceNFTCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleViewCampaign = () => {
    // TODO: Navigate to campaign details
    console.log("View campaign:", listing.campaignId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="w-full"
      >
        <Card
          className={cn(
            "bg-gray-900/50 border-gray-700/50 backdrop-blur-sm overflow-hidden group hover:border-purple-500/50 transition-all duration-300",
            rarityBorders[listing.rarity]
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              {/* NFT Image */}
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                {!imageError && listing.image ? (
                  <>
                    <img
                      src={listing.image}
                      alt={listing.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                    />
                    {imageLoading && (
                      <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-purple-300" />
                  </div>
                )}

                {/* Rarity Badge */}
                <Badge
                  className={cn(
                    "absolute -top-1 -right-1 text-xs text-white border-0",
                    `bg-gradient-to-r ${rarityColors[listing.rarity]}`
                  )}
                >
                  {listing.rarity}
                </Badge>
              </div>

              {/* NFT Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                      {listing.name}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">
                      {listing.milestone}
                    </p>

                    <div className="flex items-center mt-2 space-x-4">
                      <Badge
                        variant="outline"
                        className="border-cyan-500/50 text-cyan-400 text-xs"
                      >
                        {listing.campaign}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Listed {formatDate(listing.listedAt)}
                      </div>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {listing.price} FLOW
                      </p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-gray-400 flex items-center">
                              <Info className="h-3 w-3 mr-1" />+
                              {(listing.royaltyRate * 100).toFixed(0)}% creator
                              royalty
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Includes {(listing.royaltyRate * 100).toFixed(1)}%
                              royalty to campaign creator
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsLiked(!isLiked)}
                        className="border-gray-600 hover:border-pink-500"
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4",
                            isLiked
                              ? "fill-pink-500 text-pink-500"
                              : "text-gray-400"
                          )}
                        />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onBuy(listing)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="w-full"
    >
      <Card
        className={cn(
          "bg-gray-900/50 border-gray-700/50 backdrop-blur-sm overflow-hidden group hover:border-purple-500/50 transition-all duration-300",
          rarityBorders[listing.rarity]
        )}
      >
        <div className="relative">
          <div className="aspect-square relative overflow-hidden">
            {!imageError && listing.image ? (
              <>
                <img
                  src={listing.image}
                  alt={listing.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
                {imageLoading && (
                  <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-600" />
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-cyan-900/50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 animate-pulse"></div>
                </div>
                <div className="text-center z-10">
                  <ImageIcon className="h-16 w-16 text-purple-300 mx-auto mb-2" />
                  <p className="text-sm text-purple-200">{listing.name}</p>
                </div>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Badges */}
          <Badge
            className={cn(
              "absolute top-3 left-3 text-xs text-white border-0",
              `bg-gradient-to-r ${rarityColors[listing.rarity]}`
            )}
          >
            {listing.rarity}
          </Badge>

          {/* Like button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsLiked(!isLiked)}
            className="absolute top-3 right-3 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isLiked ? "fill-pink-500 text-pink-500" : "text-white"
              )}
            />
          </Button>

          {/* Quick actions on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleViewCampaign}
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              >
                <Star className="h-4 w-4 mr-1" />
                Campaign
              </Button>
              <Button
                size="sm"
                onClick={() => onBuy(listing)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Buy
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* NFT Name and Campaign */}
            <div>
              <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                {listing.name}
              </h3>
              <p className="text-sm text-gray-400 truncate">
                {listing.milestone}
              </p>
            </div>

            {/* Campaign Badge */}
            <Badge
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 text-xs w-fit"
            >
              {listing.campaign}
            </Badge>

            {/* Price and Info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Price</p>
                <p className="text-lg font-bold text-white">
                  {listing.price} FLOW
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Listed</p>
                      <p className="text-sm text-gray-400">
                        {formatDate(listing.listedAt)}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Includes {(listing.royaltyRate * 100).toFixed(1)}% royalty
                      to creator
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Buy Button */}
            <Button
              onClick={() => onBuy(listing)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy for {listing.price} FLOW
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
