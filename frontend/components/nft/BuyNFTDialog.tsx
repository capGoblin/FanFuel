"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  DollarSign,
  User,
  Crown,
  Check,
  Loader2,
  Image as ImageIcon,
  ShoppingCart,
  ExternalLink,
  Star,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useBuyNFT } from "@/hooks/useBuyNFT";
import { useSetupNFTCollection } from "@/hooks/useSetupNFTCollection";
import { useCheckNFTCollection } from "@/hooks/useCheckNFTCollection";
import * as fcl from "@onflow/fcl";
import { cn } from "@/lib/utils";

interface BuyNFTDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
    listingId?: string; // Add this for the actual listing ID from storefront
  };
}

const rarityColors = {
  Common: "from-gray-500 to-gray-600",
  Rare: "from-blue-500 to-blue-600",
  Epic: "from-purple-500 to-purple-600",
  Legendary: "from-yellow-500 to-orange-500",
};

export default function BuyNFTDialog({
  open,
  onOpenChange,
  listing,
}: BuyNFTDialogProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "check" | "setup" | "buy" | "complete"
  >("check");

  // FCL user state
  const [user, setUser] = useState<{
    loggedIn: boolean | null;
    addr: string | null;
  }>({
    loggedIn: null,
    addr: null,
  });

  // Hooks
  const {
    isSetup,
    loading: checkingSetup,
    checkSetup,
  } = useCheckNFTCollection(user?.addr);
  const {
    setupCollection,
    isLoading: settingUpCollection,
    error: setupError,
  } = useSetupNFTCollection();
  const { buyNFT, isLoading: buyingNFT, error: buyingError } = useBuyNFT();

  // Subscribe to FCL user changes
  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe(setUser);
    return () => unsubscribe();
  }, []);

  const royaltyAmount = listing.price * listing.royaltyRate;
  const sellerAmount = listing.price - royaltyAmount;

  const handlePurchaseNFT = async () => {
    if (!user?.loggedIn) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsPurchasing(true);
      setCurrentStep("check");

      // Step 1: Check if user has NFT collection setup
      if (isSetup === false) {
        setCurrentStep("setup");
        toast.info("Setting up your NFT collection first...");

        await setupCollection();

        if (setupError) {
          throw new Error(setupError);
        }

        // Re-check collection after setup
        await checkSetup();
      }

      // Step 2: Purchase the NFT
      setCurrentStep("buy");
      toast.info("Purchasing NFT...");

      // For demo purposes, we'll use the NFT ID as the listing ID
      // In a real implementation, you'd get the actual listing ID from the marketplace
      const listingIdToUse = listing.listingId || listing.id;

      const txId = await buyNFT(
        listing.seller,
        listingIdToUse,
        listing.price.toString()
      );

      if (!txId) {
        throw new Error(buyingError || "Failed to purchase NFT");
      }

      setCurrentStep("complete");
      setShowConfirmation(true);

      // Close dialog after showing confirmation
      setTimeout(() => {
        setShowConfirmation(false);
        onOpenChange(false);
        setCurrentStep("check");
        toast.success(`NFT purchased successfully! Transaction ID: ${txId}`);
      }, 3500);
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      setCurrentStep("check");
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to purchase NFT. Please try again."
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleClose = () => {
    if (!isPurchasing) {
      onOpenChange(false);
      setShowConfirmation(false);
      setCurrentStep("check");
    }
  };

  const handleViewCampaign = () => {
    // TODO: Navigate to campaign details
    console.log("View campaign:", listing.campaignId);
  };

  const isProcessing =
    isPurchasing || settingUpCollection || buyingNFT || checkingSetup;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-purple-400" />
            Purchase NFT
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!showConfirmation ? (
            <motion.div
              key="purchase-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* NFT Preview */}
              <Card className="bg-gray-800/50 border-gray-600/50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                      {listing.image ? (
                        <Image
                          src={listing.image}
                          alt={listing.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Crown className="h-8 w-8" />
                        </div>
                      )}
                      {/* Rarity border overlay */}
                      <div
                        className={`absolute inset-0 rounded-lg border-2 bg-gradient-to-br ${
                          rarityColors[listing.rarity]
                        } opacity-20`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {listing.name}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {listing.milestone}
                      </p>

                      <div className="flex items-center mt-2 space-x-2">
                        <Badge
                          variant="outline"
                          className="border-cyan-500/50 text-cyan-400 text-xs"
                        >
                          {listing.campaign}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`border-current text-xs bg-gradient-to-r ${
                            rarityColors[listing.rarity]
                          } border-0 text-white`}
                        >
                          {listing.rarity}
                        </Badge>
                      </div>

                      <div className="flex items-center mt-2 text-sm text-gray-300">
                        <Crown className="h-4 w-4 mr-2 text-purple-400" />
                        Creator royalty (
                        {(listing.royaltyRate * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Breakdown */}
              <Card className="bg-gray-800/30 border-gray-600/30">
                <CardContent className="p-4">
                  <h4 className="text-white font-medium mb-4 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                    Price Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-300">
                        <User className="h-4 w-4 mr-2 text-green-400" />
                        Seller receives
                      </div>
                      <div className="font-medium text-green-400">
                        {sellerAmount.toFixed(2)} FLOW
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-300">
                        <Crown className="h-4 w-4 mr-2 text-purple-400" />
                        Creator royalty (
                        {(listing.royaltyRate * 100).toFixed(1)}%)
                      </div>
                      <div className="font-medium text-purple-400">
                        {royaltyAmount.toFixed(2)} FLOW
                      </div>
                    </div>
                    <Separator className="bg-gray-600/50" />
                    <div className="flex items-center justify-between">
                      <div className="text-white font-medium">Total</div>
                      <div className="text-xl font-bold text-white">
                        {listing.price.toFixed(2)} FLOW
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Info */}
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-sm text-gray-400">Listed by</p>
                  <p className="text-white font-mono text-sm">
                    {listing.seller}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Listed on</p>
                  <p className="text-white text-sm">
                    {new Date(listing.listedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Status Messages */}
              {isProcessing && (
                <Card className="bg-blue-900/20 border-blue-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-blue-200">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">
                        {currentStep === "check" &&
                          "Checking NFT collection setup..."}
                        {currentStep === "setup" &&
                          "Setting up your NFT collection..."}
                        {currentStep === "buy" && "Purchasing NFT..."}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info Alert */}
              <Alert className="border-blue-500/30 bg-blue-900/20">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-200 text-sm">
                  This NFT will be transferred to your gallery after purchase.
                  Creator royalties automatically support the original campaign.
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1 border-gray-600 text-gray-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePurchaseNFT}
                  disabled={isProcessing || !user?.loggedIn}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Purchasing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Buy for {listing.price.toFixed(2)} FLOW
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Check className="h-8 w-8 text-white" />
              </motion.div>

              <h3 className="text-xl font-bold text-white mb-2">
                Purchase Successful!
              </h3>

              <p className="text-gray-400 mb-4">
                <span className="text-purple-400 font-medium">
                  {listing.name}
                </span>{" "}
                is now in your gallery
              </p>

              <div className="bg-gray-800/50 rounded-lg p-4 inline-block mb-6">
                <p className="text-sm text-gray-300">Total paid</p>
                <p className="text-xl font-bold text-green-400">
                  {listing.price.toFixed(2)} FLOW
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Including {royaltyAmount.toFixed(2)} FLOW creator royalty
                </p>
              </div>

              <div className="flex space-x-3 justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/gallery">
                    <Star className="h-4 w-4 mr-2" />
                    View in Gallery
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewCampaign}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Campaign
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
