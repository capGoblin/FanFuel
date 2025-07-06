'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';
import { toast } from 'sonner';
import * as fcl from '@onflow/fcl';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressBar from '@/components/ui/progress-bar';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProfilePageProps {
  params: { address: string };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { campaigns, isLoading, error, refetch } = useCampaigns();
  const [user, setUser] = useState<{ loggedIn: boolean | null; addr: string | null }>({
    loggedIn: null,
    addr: null,
  });
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  // Subscribe to the current Flow user
  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe(setUser);
    return () => unsubscribe();
  }, []);

  // Filter campaigns created by the requested address (case-insensitive)
  const userCampaigns = useMemo(
    () =>
      campaigns.filter(
        (c) => c.creator.toLowerCase() === params.address.toLowerCase()
      ),
    [campaigns, params.address]
  );

  // Handler to withdraw the next milestone payout
  const handleWithdraw = async (campaignId: string) => {
    if (!user.loggedIn || !user.addr) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (user.addr.toLowerCase() !== params.address.toLowerCase()) {
      toast.error('You are not the creator of this profile');
      return;
    }

    try {
      setWithdrawingId(campaignId);

      const withdrawTx = `
        import FungibleToken from 0xFungibleToken
        import FlowToken from 0xFlowToken
        import CampaignManager from 0xCampaignManager

        transaction(campaignID: UInt64) {
          prepare(acct: auth(Storage) &Account) {
            let creatorCap = acct.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            CampaignManager.withdrawNextMilestone(
              campaignID: campaignID,
              recipientCap: creatorCap
            )
          }
          execute {
            log("Successfully withdrew next milestone payout ✨")
          }
        }
      `;

      const txId = await fcl.mutate({
        cadence: withdrawTx,
        args: (arg, t) => [arg(campaignId, t.UInt64)],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 1000,
      });

      await fcl.tx(txId).onceSealed();
      toast.success(`Milestone withdrawn! Tx: ${txId}`);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error('Withdrawal failed. Ensure enough funds are available.');
    } finally {
      setWithdrawingId(null);
    }
  };

  // ---------------------------- UI STATES ----------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-400">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <p className="text-red-400 text-xl">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            asChild
            className="text-gray-400 hover:text-white"
          >
            <Link href="/campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Link>
          </Button>
        </motion.div>

        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-white mb-8"
        >
          Campaigns created by {params.address.slice(0, 6)}…
          {params.address.slice(-4)}
        </motion.h1>

        {/* Campaign Grid */}
        {userCampaigns.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-400 mb-6">
              This creator has not launched any campaigns on Flow.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userCampaigns.map((campaign, index) => {
              const totalMilestones = campaign.milestones.length;
              const milestonesClaimed = parseInt(campaign.milestonesClaimed || '0');
              const fundingProgress =
                (parseFloat(campaign.fundedAmount) /
                  parseFloat(campaign.goalAmount)) * 100;
              const canWithdraw =
                user.addr?.toLowerCase() === params.address.toLowerCase() &&
                milestonesClaimed < totalMilestones;
              const isWithdrawing = withdrawingId === campaign.id;

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">
                        {campaign.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {campaign.description}
                      </p>

                      <ProgressBar progress={fundingProgress} />

                      <div className="flex justify-between text-sm text-gray-400">
                        <span>
                          {parseFloat(campaign.fundedAmount).toFixed(2)} /{' '}
                          {parseFloat(campaign.goalAmount).toFixed(2)} FLOW
                        </span>
                        <span>
                          {milestonesClaimed}/{totalMilestones} milestones claimed
                        </span>
                      </div>

                      {canWithdraw ? (
                        <Button
                          size="sm"
                          disabled={isWithdrawing}
                          onClick={() => handleWithdraw(campaign.id)}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          {isWithdrawing ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            'Withdraw Next Milestone'
                          )}
                        </Button>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="w-full text-center"
                        >
                          {milestonesClaimed >= totalMilestones
                            ? 'All milestones claimed'
                            : 'Milestone not yet claimable'}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}