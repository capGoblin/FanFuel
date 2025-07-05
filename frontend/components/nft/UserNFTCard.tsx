"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface UserNFTCardProps {
  nft: {
    id: string;
    name: string;
    description: string;
    image: string;
    royalties?: {
      receiver: string;
      cut: number;
      description: string;
    }[];
  };
  index: number;
}

export default function UserNFTCard({ nft, index }: UserNFTCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Debug logging
  console.log(`NFT ${nft.id} image info:`, {
    hasImage: !!nft.image,
    imageUrl: nft.image,
    imageError,
    imageLoading,
  });

  const handleViewDetails = () => {
    // TODO: Open NFT details modal or navigate to details page
    console.log("View NFT details:", nft.id);
  };

  const handleViewOnFlowscan = () => {
    // Open on Flowscan or Flow explorer
    window.open(`https://testnet.flowscan.org/account/${nft.id}`, "_blank");
  };

  const handleImageError = () => {
    console.log(`Image error for NFT ${nft.id}:`, nft.image);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log(`Image loaded for NFT ${nft.id}:`, nft.image);
    setImageLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
        <div className="relative">
          <div className="aspect-square relative overflow-hidden">
            {!imageError && nft.image ? (
              <>
                {/* Use regular img tag for IPFS URLs to avoid Next.js restrictions */}
                <img
                  src={nft.image}
                  alt={nft.name}
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
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 animate-pulse"></div>
                  <div className="absolute top-4 left-4 w-8 h-8 bg-purple-400/40 rounded-full"></div>
                  <div className="absolute bottom-8 right-6 w-6 h-6 bg-pink-400/40 rounded-full"></div>
                  <div className="absolute top-1/2 right-8 w-4 h-4 bg-cyan-400/40 rounded-full"></div>
                </div>

                <div className="text-center z-10">
                  <div className="relative mb-3">
                    <ImageIcon className="h-16 w-16 text-purple-300 mx-auto" />
                    <div className="absolute inset-0 h-16 w-16 text-purple-300 mx-auto animate-ping opacity-20">
                      <ImageIcon className="h-16 w-16" />
                    </div>
                  </div>
                  <p className="text-sm text-purple-200 font-medium mb-1">
                    {nft.name}
                  </p>
                  <p className="text-xs text-purple-300/80">NFT #{nft.id}</p>
                  <div className="mt-3 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-400/30">
                    <p className="text-xs text-purple-200">FanFuel Milestone</p>
                  </div>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* NFT ID Badge */}
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 bg-black/60 text-white border-gray-600"
          >
            #{nft.id}
          </Badge>

          {/* Hover Actions */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleViewDetails}
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleViewOnFlowscan}
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Explorer
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
              {nft.name}
            </h3>

            <p className="text-sm text-gray-400 line-clamp-2">
              {nft.description}
            </p>

            {nft.royalties && nft.royalties.length > 0 && (
              <div className="pt-2 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Creator Royalty</span>
                  <span>{(nft.royalties[0].cut * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
