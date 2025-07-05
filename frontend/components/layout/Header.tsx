"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Zap,
  Home,
  Search,
  Plus,
  User,
  Sun,
  Moon,
  Wallet,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import * as fcl from "@onflow/fcl";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Campaigns", href: "/campaigns", icon: Search },
  { name: "Create", href: "/create-campaign", icon: Plus },
  { name: "Gallery", href: "/gallery", icon: User },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<{
    loggedIn: boolean | null;
    addr: string | null;
  }>({ loggedIn: null, addr: null });

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative">
            <Zap className="h-8 w-8 text-purple-500" />
            <div className="absolute inset-0 h-8 w-8 text-purple-500 animate-pulse opacity-50">
              <Zap className="h-8 w-8" />
            </div>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            FanFuel
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-purple-400 ${
                  pathname === item.href ? "text-purple-400" : "text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-gray-400 hover:text-white"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Badge
            variant="secondary"
            className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
          >
            Flow Testnet
          </Badge>

          {user?.loggedIn ? (
            <div className="flex items-center space-x-3">
              <div className="text-sm">
                <p className="text-white font-medium">
                  {user?.addr?.slice(0, 6)}...{user?.addr?.slice(-4)}
                </p>
                <p className="text-gray-400 text-xs">Connected</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fcl.unauthenticate()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                asChild
              >
                <Link href="/create-campaign">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fcl.authenticate()}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            </div>
          )}

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-400 hover:text-white"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-64 bg-gray-900 border-gray-800"
            >
              <nav className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-purple-400 ${
                        pathname === item.href
                          ? "text-purple-400"
                          : "text-gray-300"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
