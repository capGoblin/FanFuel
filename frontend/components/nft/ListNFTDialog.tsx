"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  DollarSign,
  User,
  Check,
  Loader2,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useSetupStorefront } from "@/hooks/useSetupStorefront";
import { useCheckStorefront } from "@/hooks/useCheckStorefront";
import { useListNFT } from "@/hooks/useListNFT";
import * as fcl from "@onflow/fcl";

interface ListNFTDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
}

export default function ListNFTDialog({
  open,
  onOpenChange,
  nft,
}: ListNFTDialogProps) {
  const [price, setPrice] = useState("");
  const [isListing, setIsListing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "check" | "setup" | "list" | "complete"
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
    hasStorefront,
    loading: checkingStorefront,
    checkStorefront,
  } = useCheckStorefront(user?.addr);
  const {
    setupStorefront,
    isLoading: settingUpStorefront,
    error: setupError,
  } = useSetupStorefront();
  const { listNFT, isLoading: listingNFT, error: listingError } = useListNFT();

  // Subscribe to FCL user changes
  useState(() => {
    const unsubscribe = fcl.currentUser.subscribe(setUser);
    return () => unsubscribe();
  });

  const royaltyRate = nft.royalties?.[0]?.cut || 0.05; // Default 5% if not specified
  const priceValue = parseFloat(price) || 0;
  const creatorAmount = priceValue * royaltyRate;
  const sellerAmount = priceValue - creatorAmount;

  const handleListNFT = async () => {
    if (!price || priceValue <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (!user?.loggedIn) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsListing(true);
      setCurrentStep("check");

      // Step 1: Check if user has storefront
      if (hasStorefront === false) {
        setCurrentStep("setup");
        toast.info("Setting up your storefront first...");

        await setupStorefront();

        if (setupError) {
          throw new Error(setupError);
        }

        // Re-check storefront after setup
        await checkStorefront();
      }

      // Step 2: List the NFT
      setCurrentStep("list");
      toast.info("Listing your NFT...");

      const txId = await listNFT(nft.id, price);

      if (!txId) {
        throw new Error(listingError || "Failed to list NFT");
      }

      setCurrentStep("complete");
      setShowConfirmation(true);

      // Close dialog after showing confirmation
      setTimeout(() => {
        setShowConfirmation(false);
        onOpenChange(false);
        setPrice("");
        setCurrentStep("check");
        toast.success(`NFT listed successfully! Transaction ID: ${txId}`);
      }, 3000);
    } catch (error) {
      console.error("Error listing NFT:", error);
      setCurrentStep("check");
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to list NFT. Please try again."
      );
    } finally {
      setIsListing(false);
    }
  };

  const handleClose = () => {
    if (!isListing) {
      onOpenChange(false);
      setPrice("");
      setShowConfirmation(false);
      setCurrentStep("check");
    }
  };

  const isProcessing =
    isListing || settingUpStorefront || listingNFT || checkingStorefront;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-purple-400" />
            List NFT for Sale
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!showConfirmation ? (
            <motion.div
              key="listing-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* NFT Preview */}
              <Card className="bg-gray-800/50 border-gray-600/50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-700">
                      {nft.image ? (
                        <Image
                          src={nft.image}
                          alt={nft.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Crown className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {nft.name}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {nft.description}
                      </p>
                      <div className="flex items-center mt-1">
                        <Crown className="h-3 w-3 mr-1 text-purple-400" />
                        <span className="text-xs text-purple-400">
                          {(royaltyRate * 100).toFixed(1)}% royalty
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Input */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-white font-medium">
                  Sale Price (FLOW)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Enter price in FLOW"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-400">
                  Minimum listing price: 0.1 FLOW
                </p>
              </div>

              {/* Price Breakdown */}
              {priceValue > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gray-800/30 border-gray-600/30">
                    <CardContent className="p-4">
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-cyan-400" />
                        Payment Breakdown
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-300">
                            <User className="h-4 w-4 mr-2 text-purple-400" />
                            Creator gets
                          </div>
                          <div className="font-medium text-purple-400">
                            {creatorAmount.toFixed(2)} FLOW
                          </div>
                        </div>
                        <Separator className="bg-gray-600/50" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-300">
                            <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                            You receive
                          </div>
                          <div className="font-bold text-green-400">
                            {sellerAmount.toFixed(2)} FLOW
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Status Messages */}
              {isProcessing && (
                <Card className="bg-blue-900/20 border-blue-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-blue-200">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">
                        {currentStep === "check" &&
                          "Checking storefront setup..."}
                        {currentStep === "setup" &&
                          "Setting up your storefront..."}
                        {currentStep === "list" && "Listing your NFT..."}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Listing Button */}
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
                  onClick={handleListNFT}
                  disabled={isProcessing || !price || priceValue <= 0}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      List NFT
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
                NFT Listed Successfully!
              </h3>

              <p className="text-gray-400 mb-4">
                <span className="text-purple-400 font-medium">{nft.name}</span>{" "}
                is now available on the FanFuel marketplace
              </p>

              <div className="bg-gray-800/50 rounded-lg p-4 inline-block">
                <p className="text-sm text-gray-300">Listed for</p>
                <p className="text-xl font-bold text-green-400">
                  {priceValue.toFixed(2)} FLOW
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
