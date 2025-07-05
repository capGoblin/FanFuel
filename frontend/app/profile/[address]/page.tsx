'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Wallet, Trophy, TrendingUp, Edit, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NFTCard from '@/components/nft/NFTCard';
import ProgressBar from '@/components/ui/progress-bar';
import { toast } from 'sonner';
import Image from 'next/image';

// Mock user data
const userData = {
  address: '0x1234567890abcdef',
  name: 'Luna Starweaver',
  bio: 'Cosmic music creator exploring the intersection of sound and blockchain technology. Creating immersive audio experiences for the decentralized future.',
  avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
  verified: true,
  joinedDate: '2023-01-15',
  stats: {
    campaignsCreated: 3,
    totalRaised: 12500,
    nftsOwned: 24,
    nftsMinted: 156,
  },
};

// Mock campaigns created
const campaignsCreated = [
  {
    id: '1',
    title: 'Cosmic Dreams: An Interstellar Music Journey',
    image: 'https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=400',
    currentAmount: 2847,
    targetAmount: 5000,
    backers: 156,
    status: 'active',
  },
  {
    id: '2',
    title: 'Ambient Soundscapes Collection',
    image: 'https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=400',
    currentAmount: 4200,
    targetAmount: 4000,
    backers: 89,
    status: 'completed',
  },
];

// Mock NFTs owned
const nftsOwned = [
  {
    id: '1',
    name: 'Cosmic Dawn #001',
    image: 'https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=400',
    creator: 'Luna Starweaver',
    campaign: 'Cosmic Dreams',
    milestone: 'Studio Time Secured',
    rarity: 'Rare' as const,
    metadata: {
      description: 'The first NFT in the Cosmic Dreams collection.',
      attributes: [
        { trait_type: 'Rarity', value: 'Rare' },
        { trait_type: 'Milestone', value: 'Studio Time' },
      ]
    }
  },
  {
    id: '2',
    name: 'Digital Rebellion #042',
    image: 'https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=400',
    creator: 'CyberArtist',
    campaign: 'Digital Revolution',
    milestone: 'Art Creation Phase',
    rarity: 'Epic' as const,
    metadata: {
      description: 'A powerful piece representing digital rebellion.',
      attributes: [
        { trait_type: 'Rarity', value: 'Epic' },
        { trait_type: 'Style', value: 'Cyberpunk' },
      ]
    }
  },
];

export default function ProfilePage({ params }: { params: { address: string } }) {
  const [activeTab, setActiveTab] = useState('campaigns');

  const copyAddress = () => {
    navigator.clipboard.writeText(userData.address);
    toast.success('Address copied to clipboard');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container py-12">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-purple-500/30">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="bg-purple-500 text-white text-2xl">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {userData.verified && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">{userData.name}</h1>
                      {userData.verified && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          Verified Creator
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-gray-400 mb-4">
                      <div className="flex items-center space-x-2">
                        <Wallet className="h-4 w-4" />
                        <span className="font-mono text-sm">{formatAddress(userData.address)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={copyAddress}
                          className="h-6 w-6 text-gray-400 hover:text-white"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">Joined {new Date(userData.joinedDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-gray-300 leading-relaxed max-w-2xl">
                      {userData.bio}
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:text-white">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:text-white">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Flowscan
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {[
            { label: 'Campaigns Created', value: userData.stats.campaignsCreated, color: 'text-purple-400' },
            { label: 'Total Raised', value: `${userData.stats.totalRaised.toLocaleString()} FLOW`, color: 'text-cyan-400' },
            { label: 'NFTs Owned', value: userData.stats.nftsOwned, color: 'text-pink-400' },
            { label: 'NFTs Minted', value: userData.stats.nftsMinted, color: 'text-green-400' },
          ].map((stat, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-gray-900/50 border border-gray-700/50 backdrop-blur-sm">
              <TabsTrigger value="campaigns" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                Campaigns Created
              </TabsTrigger>
              <TabsTrigger value="nfts" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                NFTs Owned
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campaignsCreated.map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <Image
                          src={campaign.image}
                          alt={campaign.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <Badge className={
                            campaign.status === 'active' 
                              ? 'bg-green-500/20 text-green-300 border-green-500/30'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }>
                            {campaign.status === 'active' ? 'Active' : 'Completed'}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-bold text-white text-lg mb-4">{campaign.title}</h3>
                        
                        <div className="space-y-3">
                          <ProgressBar 
                            progress={(campaign.currentAmount / campaign.targetAmount) * 100}
                            showPercentage={false}
                            size="sm"
                            variant={campaign.status === 'completed' ? 'success' : 'gradient'}
                          />
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-white font-medium">
                              {campaign.currentAmount.toLocaleString()} FLOW
                            </span>
                            <span className="text-gray-400">
                              of {campaign.targetAmount.toLocaleString()} FLOW
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>{campaign.backers} backers</span>
                            <span>{Math.round((campaign.currentAmount / campaign.targetAmount) * 100)}% funded</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="nfts" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nftsOwned.map((nft, index) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <NFTCard nft={nft} />
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'Minted NFT', item: 'Cosmic Dawn #001', time: '2 hours ago' },
                      { action: 'Created Campaign', item: 'Cosmic Dreams', time: '1 day ago' },
                      { action: 'Received Funding', item: '50 FLOW', time: '3 days ago' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-b-0">
                        <div>
                          <p className="text-white font-medium">{activity.action}</p>
                          <p className="text-gray-400 text-sm">{activity.item}</p>
                        </div>
                        <span className="text-gray-500 text-sm">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}