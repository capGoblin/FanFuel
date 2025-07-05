'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';

const walletOptions = [
  {
    name: 'Blocto',
    icon: '🟣',
    description: 'Easy-to-use wallet for everyone',
  },
  {
    name: 'Lilico',
    icon: '🦄',
    description: 'Feature-rich Flow wallet',
  },
  {
    name: 'Dapper',
    icon: '💎',
    description: 'Gaming-focused wallet',
  },
];

export default function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, address, walletType, connect, disconnect } = useStore();

  const handleConnect = async (wallet: string) => {
    setIsConnecting(true);
    
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock address generation
    const mockAddress = `0x${Math.random().toString(16).substr(2, 16)}`;
    connect(mockAddress, wallet);
    
    toast.success(`Connected to ${wallet} wallet!`);
    setIsConnecting(false);
    setIsOpen(false);
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success('Wallet disconnected');
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-mono text-sm">{formatAddress(address)}</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-gray-900 border-gray-700">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Connected with</span>
              <Badge variant="secondary" className="text-xs">{walletType}</Badge>
            </div>
            <div className="font-mono text-sm text-white break-all">{address}</div>
          </div>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem onClick={copyAddress} className="text-gray-300 hover:text-white hover:bg-gray-800">
            <Copy className="mr-2 h-4 w-4" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Flowscan
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem onClick={handleDisconnect} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-center">Connect Your Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <p className="text-gray-400 text-center text-sm">
            Choose your preferred wallet to connect to FanFuel
          </p>
          
          <div className="space-y-3">
            {walletOptions.map((wallet) => (
              <motion.button
                key={wallet.name}
                onClick={() => handleConnect(wallet.name)}
                disabled={isConnecting}
                className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{wallet.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">{wallet.name}</div>
                    <div className="text-sm text-gray-400">{wallet.description}</div>
                  </div>
                  {isConnecting && (
                    <div className="h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By connecting, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}