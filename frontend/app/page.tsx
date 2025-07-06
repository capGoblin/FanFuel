"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Star,
  Zap,
  Users,
  TrendingUp,
  Target,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import GlowButton from "@/components/ui/glow-button";
import ProgressBar from "@/components/ui/progress-bar";
import Link from "next/link";
import Image from "next/image";

// Mock featured campaigns
const featuredCampaigns = [
  {
    id: "1",
    title: "Cosmic Dreams: Music Journey",
    creator: "Luna Starweaver",
    image:
      "https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=600",
    currentAmount: 2847,
    targetAmount: 5000,
    category: "Music",
  },
  {
    id: "2",
    title: "Digital Art Revolution",
    creator: "CyberArtist",
    image:
      "https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=600",
    currentAmount: 1200,
    targetAmount: 3000,
    category: "Art",
  },
  {
    id: "3",
    title: "Indie Game Development",
    creator: "GameDev Studio",
    image:
      "https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=600",
    currentAmount: 4500,
    targetAmount: 8000,
    category: "Gaming",
  },
];

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 min-h-screen flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge
                    variant="secondary"
                    className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30"
                  >
                    <span className="flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      The Future of Fan Support
                    </span>
                  </Badge>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-7xl font-bold leading-tight"
                >
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    Fuel Your
                  </span>
                  <br />
                  <span className="text-white">Favorite Creators</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-gray-300 leading-relaxed max-w-2xl"
                >
                  Support creators through milestone-based campaigns and earn
                  exclusive NFTs as they achieve their goals. On-chain
                  transparency meets real creative impact.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <GlowButton asChild className="group text-lg px-8 py-4">
                  <Link href="/campaigns">
                    <span className="flex items-center">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Explore Campaigns
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </GlowButton>

                <Button
                  variant="outline"
                  size="lg"
                  className="group border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 text-lg px-8 py-4"
                >
                  <span className="flex items-center">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </span>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center space-x-8 text-sm text-gray-400"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live on Flow</span>
                </div>
                <div>
                  <span className="font-semibold text-white">125K+</span> FLOW
                  Raised
                </div>
                <div>
                  <span className="font-semibold text-white">1.2K+</span> NFTs
                  Minted
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gray-900/50 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                        <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-purple-500/30 text-purple-300"
                      >
                        Live Campaign
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="h-6 bg-gradient-to-r from-purple-500 to-cyan-500 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                      <ProgressBar progress={67} size="lg" />
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>2,847 FLOW raised</span>
                        <span>156 supporters</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30"></div>
                      <div className="h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/30"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Three Simple Steps to Success
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              A revolutionary approach to creator funding that benefits everyone
              involved
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Creators Launch Campaigns",
                description:
                  "Set milestones, define rewards, and share your vision with the world",
                icon: Target,
                color: "from-purple-500 to-pink-500",
              },
              {
                step: "02",
                title: "Fans Mint Milestone NFTs",
                description:
                  "Support creators by minting exclusive NFTs tied to campaign milestones",
                icon: Zap,
                color: "from-pink-500 to-cyan-500",
              },
              {
                step: "03",
                title: "Everyone Wins",
                description:
                  "Creators get funded, fans get exclusive content and NFTs with real utility",
                icon: Users,
                color: "from-cyan-500 to-purple-500",
              },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative"
                >
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 h-full">
                    <CardContent className="p-8 text-center">
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${step.color} mb-6`}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>

                      <div className="text-4xl font-bold text-gray-600 mb-4">
                        {step.step}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">
                        {step.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>

                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              Featured Campaigns
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trending Projects
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover amazing creators and support their journey to success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featuredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={campaign.image}
                      alt={campaign.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {campaign.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="font-bold text-white text-lg mb-2">
                      {campaign.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      by {campaign.creator}
                    </p>

                    <div className="space-y-3">
                      <ProgressBar
                        progress={
                          (campaign.currentAmount / campaign.targetAmount) * 100
                        }
                        showPercentage={false}
                        size="sm"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-white font-medium">
                          {campaign.currentAmount.toLocaleString()} FLOW
                        </span>
                        <span className="text-gray-400">
                          of {campaign.targetAmount.toLocaleString()} FLOW
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <GlowButton asChild>
              <Link href="/campaigns">
                <span className="flex items-center">
                  View All Campaigns
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
            </GlowButton>
          </motion.div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="mb-8">
              <div className="text-6xl text-purple-400 mb-4">"</div>
              <blockquote className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
                FanFuel has revolutionized how I connect with my audience. The
                milestone-based approach keeps me motivated and my fans engaged
                throughout the entire creative process.
              </blockquote>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <Image
                src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Luna Starweaver"
                width={60}
                height={60}
                className="rounded-full"
              />
              <div className="text-left">
                <div className="font-semibold text-white">Luna Starweaver</div>
                <div className="text-gray-400">Music Creator</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-cyan-900/50 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Ready to Launch Your Campaign?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of creators who are already using FanFuel to
                  bring their visions to life
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <GlowButton asChild className="text-lg px-8 py-4">
                    <Link href="/create-campaign">
                      <span className="flex items-center">
                        <Target className="mr-2 h-5 w-5" />
                        Launch Campaign
                      </span>
                    </Link>
                  </GlowButton>

                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 text-lg px-8 py-4"
                  >
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
