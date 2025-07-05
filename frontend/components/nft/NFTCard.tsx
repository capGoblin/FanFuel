'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Heart, Share2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface NFTCardProps {
  nft: {
    id: string;
    name: string;
    image: string;
    creator: string;
    campaign: string;
    milestone: string;
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
    price?: number;
    isListed?: boolean;
    metadata?: {
      description: string;
      attributes: Array<{ trait_type: string; value: string }>;
    };
  };
  showFlip?: boolean;
  className?: string;
}

const rarityColors = {
  Common: 'from-gray-500 to-gray-600',
  Rare: 'from-blue-500 to-blue-600',
  Epic: 'from-purple-500 to-purple-600',
  Legendary: 'from-yellow-500 to-orange-500',
};

export default function NFTCard({ nft, showFlip = true, className }: NFTCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      className={cn('group perspective-1000', className)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          'relative w-full h-96 transform-style-preserve-3d transition-transform duration-700 cursor-pointer',
          isFlipped && showFlip ? 'rotate-y-180' : ''
        )}
        onClick={() => showFlip && setIsFlipped(!isFlipped)}
      >
        {/* Front Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="relative h-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 shadow-xl group-hover:shadow-2xl group-hover:shadow-purple-500/10 transition-all duration-300">
            {/* NFT Image */}
            <div className="relative h-64 overflow-hidden">
              <Image
                src={nft.image}
                alt={nft.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Rarity Badge */}
              <div className="absolute top-3 left-3">
                <Badge className={cn(
                  'bg-gradient-to-r text-white border-0 shadow-lg',
                  rarityColors[nft.rarity]
                )}>
                  {nft.rarity}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                  }}
                >
                  <Heart className={cn('h-4 w-4', isLiked ? 'fill-red-500 text-red-500' : '')} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* NFT Info */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-white truncate">{nft.name}</h3>
                <p className="text-sm text-gray-400 truncate">by {nft.creator}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Campaign</p>
                  <p className="text-sm font-medium text-cyan-400 truncate">{nft.campaign}</p>
                </div>
                {nft.price && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="text-sm font-bold text-white">{nft.price} FLOW</p>
                  </div>
                )}
              </div>

              {nft.isListed && (
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                  Buy Now
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Back Side - Metadata */}
        {showFlip && nft.metadata && (
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            <div className="h-full rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/90 via-pink-900/90 to-cyan-900/90 border border-purple-500/30 shadow-xl backdrop-blur-sm">
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Metadata</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:bg-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3 flex-1">
                  <div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {nft.metadata.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Attributes</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {nft.metadata.attributes.map((attr, index) => (
                        <div key={index} className="bg-black/30 rounded-lg p-2">
                          <p className="text-xs text-gray-400">{attr.trait_type}</p>
                          <p className="text-sm font-medium text-white">{attr.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Milestone Achievement</p>
                      <p className="text-sm font-medium text-cyan-400">{nft.milestone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}