import Link from 'next/link';
import { Zap, Github, Twitter, MessageCircle, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <Zap className="h-6 w-6 text-purple-500" />
                <div className="absolute inset-0 h-6 w-6 text-purple-500 animate-pulse opacity-50">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                FanFuel
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              Empowering creators through milestone-based campaigns and exclusive NFT rewards.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-white">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/campaigns" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Explore Campaigns
                </Link>
              </li>
              <li>
                <Link href="/create-campaign" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Launch Campaign
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-400 hover:text-purple-400 transition-colors">
                  NFT Gallery
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-white">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-purple-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://flow.com" className="text-gray-400 hover:text-purple-400 transition-colors flex items-center">
                  Flow Blockchain
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  FCL Integration
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-white">Community</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span className="sr-only">Discord</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>© 2024 FanFuel. Built on Flow blockchain. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}