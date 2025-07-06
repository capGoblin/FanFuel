"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Plus,
  Trash2,
  Target,
  Sparkles,
  Check,
  AlertTriangle,
  Zap,
  Image as ImageIcon,
  DollarSign,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import GlowButton from "@/components/ui/glow-button";
import ProgressBar from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCreateCampaign } from "@/hooks/useCreateCampaign";
import { usePinataUpload } from "@/hooks/usePinataUpload";
import * as fcl from "@onflow/fcl";
import { useRouter } from "next/navigation";

interface Milestone {
  id: string;
  title: string;
  icon: string;
}

interface CampaignData {
  title: string;
  description: string;
  coverImage: File | null;
  coverImageUrl: string;
  milestones: Milestone[];
  goalAmount: number;
  totalNFTs: number;
}

const milestoneIcons = [
  "🎯",
  "🚀",
  "⭐",
  "🏆",
  "💎",
  "🎨",
  "🎵",
  "📱",
  "🌟",
  "🔥",
];

const steps = [
  {
    id: 1,
    title: "Campaign Basics",
    description: "Tell us about your project",
  },
  { id: 2, title: "Milestone Plan", description: "Define your roadmap" },
  { id: 3, title: "Funding Parameters", description: "Set your goals" },
  { id: 4, title: "Review & Deploy", description: "Launch your campaign" },
];

export default function CreateCampaign() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const router = useRouter();
  const { createCampaign, isPending, txId, error } = useCreateCampaign();
  const { uploadImage, loading: uploadingImage } = usePinataUpload();
  const [user, setUser] = useState({ loggedIn: null });

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, []);

  const [campaignData, setCampaignData] = useState<CampaignData>({
    title: "",
    description: "",
    coverImage: null,
    coverImageUrl: "",
    milestones: [{ id: "1", title: "", icon: "🎯" }],
    goalAmount: 0,
    totalNFTs: 0,
  });

  // Handle transaction status
  useEffect(() => {
    if (txId) {
      toast.success("🎉 Campaign creation transaction submitted!");
      toast.info(`Transaction ID: ${txId}`);

      // Wait a moment then redirect to campaigns page
      setTimeout(() => {
        setIsDeploying(false);
        router.push("/campaigns");
      }, 2000);
    }
  }, [txId, router]);

  useEffect(() => {
    if (error) {
      toast.error(`Transaction failed: ${error.message}`);
      setIsDeploying(false);
    }
  }, [error]);

  // Calculated values
  const milestoneAmount =
    campaignData.goalAmount && campaignData.milestones.length > 0
      ? campaignData.goalAmount / campaignData.milestones.length
      : 0;

  const nftPrice =
    campaignData.goalAmount && campaignData.totalNFTs > 0
      ? campaignData.goalAmount / campaignData.totalNFTs
      : 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCampaignData((prev) => ({
        ...prev,
        coverImage: file,
        coverImageUrl: url,
      }));
    }
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: "",
      icon: milestoneIcons[
        campaignData.milestones.length % milestoneIcons.length
      ],
    };
    setCampaignData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone],
    }));
  };

  const removeMilestone = (id: string) => {
    if (campaignData.milestones.length > 1) {
      setCampaignData((prev) => ({
        ...prev,
        milestones: prev.milestones.filter((m) => m.id !== id),
      }));
    }
  };

  const updateMilestone = (
    id: string,
    field: keyof Milestone,
    value: string
  ) => {
    setCampaignData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return campaignData.title && campaignData.description;
      case 2:
        return campaignData.milestones.every((m) => m.title.trim());
      case 3:
        return campaignData.goalAmount > 0 && campaignData.totalNFTs > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const deployCampaign = async () => {
    if (!user?.loggedIn) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsDeploying(true);

    try {
      let imageURL = "";

      // Upload image to Pinata if one is selected (for future use)
      if (campaignData.coverImage) {
        toast.info("Uploading image to IPFS...");
        imageURL = await uploadImage(campaignData.coverImage);
        toast.success("Image uploaded successfully!");
        toast.info(
          "Note: Image will be stored for future use. Current contract version doesn't support images yet."
        );
      }

      // Create campaign (imageURL will be ignored by current contract)
      createCampaign({
        title: campaignData.title,
        description: campaignData.description,
        imageURL: imageURL, // This will be ignored by the current deployed contract
        goalAmount: campaignData.goalAmount,
        milestones: campaignData.milestones.map((m) => m.title),
        totalNFTs: campaignData.totalNFTs,
      });
    } catch (err) {
      console.error("Failed to create campaign:", err);
      toast.error("Failed to create campaign");
      setIsDeploying(false);
    }
  };

  const getPriceWarning = () => {
    if (nftPrice < 1)
      return { type: "error", message: "NFT price too low (< 1 FLOW)" };
    if (nftPrice > 1000)
      return { type: "warning", message: "NFT price very high (> 1000 FLOW)" };
    return null;
  };

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
            Launch Campaign
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            Bring Your Vision to Life
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Create a milestone-based campaign and reward your supporters with
            exclusive NFTs
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4 mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                    currentStep >= step.id
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 text-white"
                      : "border-gray-600 text-gray-400"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-bold">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-16 h-0.5 mx-4 transition-all duration-300",
                      currentStep > step.id
                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                        : "bg-gray-600"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-400">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  {/* Step 1: Campaign Basics */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-white">
                          Campaign Title *
                        </Label>
                        <Input
                          id="title"
                          placeholder="Enter your campaign title..."
                          value={campaignData.title}
                          onChange={(e) =>
                            setCampaignData((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="bg-gray-800 border-gray-600 text-white text-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-white">
                          Campaign Description *
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your campaign and what you plan to create..."
                          rows={4}
                          value={campaignData.description}
                          onChange={(e) =>
                            setCampaignData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Cover Image</Label>
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="cover-upload"
                          />
                          <label
                            htmlFor="cover-upload"
                            className="cursor-pointer"
                          >
                            {campaignData.coverImageUrl ? (
                              <div className="space-y-4">
                                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                  <Image
                                    src={campaignData.coverImageUrl}
                                    alt="Cover preview"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <p className="text-gray-400">
                                  Click to change image
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div>
                                  <p className="text-gray-400">
                                    Click to upload cover image
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    16:9 ratio recommended
                                  </p>
                                </div>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Milestone Plan */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Campaign Milestones
                          </h3>
                          <p className="text-gray-400">
                            Define the key achievements for your campaign
                          </p>
                        </div>
                        <Button
                          onClick={addMilestone}
                          variant="outline"
                          size="sm"
                          className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Milestone
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {campaignData.milestones.map((milestone, index) => (
                          <motion.div
                            key={milestone.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-gray-700 rounded-lg p-4 space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <select
                                  value={milestone.icon}
                                  onChange={(e) =>
                                    updateMilestone(
                                      milestone.id,
                                      "icon",
                                      e.target.value
                                    )
                                  }
                                  className="bg-gray-800 border-gray-600 rounded text-white text-lg p-2"
                                >
                                  {milestoneIcons.map((icon) => (
                                    <option key={icon} value={icon}>
                                      {icon}
                                    </option>
                                  ))}
                                </select>
                                <h4 className="text-white font-medium">
                                  Milestone {index + 1}
                                </h4>
                                {milestoneAmount > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="border-cyan-500 text-cyan-400"
                                  >
                                    {milestoneAmount.toFixed(0)} FLOW
                                  </Badge>
                                )}
                              </div>
                              {campaignData.milestones.length > 1 && (
                                <Button
                                  onClick={() => removeMilestone(milestone.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <Input
                              placeholder="Milestone title..."
                              value={milestone.title}
                              onChange={(e) =>
                                updateMilestone(
                                  milestone.id,
                                  "title",
                                  e.target.value
                                )
                              }
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Funding Parameters */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="goalAmount" className="text-white">
                            Goal Amount (FLOW) *
                          </Label>
                          <Input
                            id="goalAmount"
                            type="number"
                            placeholder="5000"
                            value={campaignData.goalAmount || ""}
                            onChange={(e) =>
                              setCampaignData((prev) => ({
                                ...prev,
                                goalAmount: parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="totalNFTs" className="text-white">
                            Total NFTs to Mint *
                          </Label>
                          <Input
                            id="totalNFTs"
                            type="number"
                            placeholder="1000"
                            value={campaignData.totalNFTs || ""}
                            onChange={(e) =>
                              setCampaignData((prev) => ({
                                ...prev,
                                totalNFTs: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                      </div>

                      {/* Calculated Values */}
                      {nftPrice > 0 && (
                        <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
                          <h4 className="text-white font-semibold">
                            Calculated Values
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex justify-between">
                              <span className="text-gray-400">NFT Price:</span>
                              <span className="text-white font-bold">
                                {nftPrice.toFixed(2)} FLOW
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Per Milestone:
                              </span>
                              <span className="text-cyan-400 font-bold">
                                {milestoneAmount.toFixed(0)} FLOW
                              </span>
                            </div>
                          </div>

                          {getPriceWarning() && (
                            <div
                              className={cn(
                                "flex items-center space-x-2 p-3 rounded-lg",
                                getPriceWarning()?.type === "error"
                                  ? "bg-red-500/10 border border-red-500/30"
                                  : "bg-yellow-500/10 border border-yellow-500/30"
                              )}
                            >
                              <AlertTriangle
                                className={cn(
                                  "h-4 w-4",
                                  getPriceWarning()?.type === "error"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                                )}
                              />
                              <span
                                className={cn(
                                  "text-sm",
                                  getPriceWarning()?.type === "error"
                                    ? "text-red-300"
                                    : "text-yellow-300"
                                )}
                              >
                                {getPriceWarning()?.message}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Live Progress Simulation */}
                      {campaignData.goalAmount > 0 && (
                        <div className="bg-gray-800/50 rounded-lg p-6">
                          <h4 className="text-white font-semibold mb-4">
                            Campaign Preview
                          </h4>
                          <div className="space-y-3">
                            <ProgressBar progress={67} size="lg" />
                            <div className="flex justify-between text-sm">
                              <span className="text-white">
                                {Math.round(
                                  campaignData.goalAmount * 0.67
                                ).toLocaleString()}{" "}
                                FLOW raised
                              </span>
                              <span className="text-gray-400">
                                of {campaignData.goalAmount.toLocaleString()}{" "}
                                FLOW goal
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 4: Review & Deploy */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          Ready to Launch!
                        </h3>
                        <p className="text-gray-400">
                          Review your campaign details before deployment
                        </p>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-6 space-y-6">
                        <div>
                          <h4 className="text-white font-semibold mb-2">
                            Campaign Overview
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Title:</span>
                              <span className="text-white">
                                {campaignData.title}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Milestones:</span>
                              <span className="text-white">
                                {campaignData.milestones.length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Goal Amount:
                              </span>
                              <span className="text-cyan-400 font-bold">
                                {campaignData.goalAmount.toLocaleString()} FLOW
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total NFTs:</span>
                              <span className="text-white">
                                {campaignData.totalNFTs.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">NFT Price:</span>
                              <span className="text-purple-400 font-bold">
                                {nftPrice.toFixed(2)} FLOW
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-white font-semibold mb-3">
                            Milestone Roadmap
                          </h4>
                          <div className="space-y-2">
                            {campaignData.milestones.map((milestone, index) => (
                              <div
                                key={milestone.id}
                                className="flex items-center space-x-3 p-2 bg-gray-700/30 rounded"
                              >
                                <span className="text-lg">
                                  {milestone.icon}
                                </span>
                                <span className="text-white flex-1">
                                  {milestone.title}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="border-cyan-500 text-cyan-400"
                                >
                                  {milestoneAmount.toFixed(0)} FLOW
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <GlowButton
                          onClick={deployCampaign}
                          disabled={
                            isPending || uploadingImage || !user?.loggedIn
                          }
                          className="flex-1"
                        >
                          {isPending || uploadingImage ? (
                            <span className="flex items-center">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="mr-2"
                              >
                                <Zap className="h-5 w-5" />
                              </motion.div>
                              {uploadingImage
                                ? "Uploading Image..."
                                : "Creating Campaign..."}
                            </span>
                          ) : !user?.loggedIn ? (
                            <span className="flex items-center">
                              <AlertTriangle className="mr-2 h-5 w-5" />
                              Connect Wallet First
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Sparkles className="mr-2 h-5 w-5" />
                              Create Campaign
                            </span>
                          )}
                        </GlowButton>

                        <Button
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                        >
                          Save Draft
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    disabled={currentStep === 1}
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  {currentStep < 4 && (
                    <Button
                      onClick={nextStep}
                      disabled={!canProceed()}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Campaign Card Preview */}
                  <div className="border border-gray-700 rounded-lg overflow-hidden">
                    {campaignData.coverImageUrl ? (
                      <div className="relative h-32">
                        <Image
                          src={campaignData.coverImageUrl}
                          alt="Campaign preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}

                    <div className="p-4 space-y-3">
                      <h3 className="font-bold text-white">
                        {campaignData.title || "Campaign Title"}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {campaignData.description ||
                          "Campaign description will appear here..."}
                      </p>

                      {campaignData.goalAmount > 0 && (
                        <div className="space-y-2">
                          <ProgressBar progress={0} size="sm" />
                          <div className="flex justify-between text-xs">
                            <span className="text-white">0 FLOW</span>
                            <span className="text-gray-400">
                              of {campaignData.goalAmount.toLocaleString()} FLOW
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Milestones Preview */}
                  {campaignData.milestones.some((m) => m.title) && (
                    <div className="space-y-3">
                      <h4 className="text-white font-semibold">Milestones</h4>
                      <div className="space-y-2">
                        {campaignData.milestones.map((milestone, index) => (
                          <div
                            key={milestone.id}
                            className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded"
                          >
                            <span>{milestone.icon}</span>
                            <span className="text-sm text-white flex-1">
                              {milestone.title || `Milestone ${index + 1}`}
                            </span>
                            {milestoneAmount > 0 && (
                              <span className="text-xs text-cyan-400">
                                {milestoneAmount.toFixed(0)} FLOW
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NFT Preview */}
                  {nftPrice > 0 && (
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3">
                        NFT Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Price per NFT:</span>
                          <span className="text-purple-400 font-bold">
                            {nftPrice.toFixed(2)} FLOW
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Supply:</span>
                          <span className="text-white">
                            {campaignData.totalNFTs.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            Creator Royalty:
                          </span>
                          <span className="text-cyan-400">10%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
