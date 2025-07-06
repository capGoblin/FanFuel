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
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import * as fcl from "@onflow/fcl";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Campaigns", href: "/campaigns", icon: Search },
  { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
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
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
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
        <nav className="hidden lg:flex items-center space-x-6">
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

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-gray-400 hover:text-white hidden sm:flex"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Network Badge */}
          <Badge
            variant="secondary"
            className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs px-2 py-1 hidden sm:inline-flex"
          >
            Testnet
          </Badge>

          {/* Wallet Section */}
          {user?.loggedIn ? (
            <div className="flex items-center space-x-2">
              {/* User Address */}
              <div className="hidden sm:flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-white text-sm font-medium">
                  {user?.addr?.slice(0, 4)}...{user?.addr?.slice(-4)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fcl.unauthenticate()}
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Disconnect</span>
                </Button>

                {/* Create Campaign Button - Only show on larger screens or if on mobile and user is logged in */}
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  asChild
                >
                  <Link href="/create-campaign">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Create</span>
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fcl.authenticate()}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <Wallet className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Connect</span>
            </Button>
          )}

          {/* Mobile Navigation Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-gray-400 hover:text-white ml-2"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-64 bg-gray-900 border-gray-800"
            >
              <div className="flex flex-col space-y-6 mt-8">
                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-4">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-3 text-base font-medium transition-colors hover:text-purple-400 ${
                          pathname === item.href
                            ? "text-purple-400"
                            : "text-gray-300"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile User Section */}
                {user?.loggedIn && (
                  <div className="border-t border-gray-800 pt-6">
                    <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-800/50 rounded-lg">
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {user?.addr?.slice(0, 6)}...{user?.addr?.slice(-4)}
                        </p>
                        <p className="text-gray-400 text-xs">Connected</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                        onClick={() => {
                          setTheme(theme === "dark" ? "light" : "dark");
                        }}
                      >
                        {theme === "dark" ? (
                          <Sun className="mr-2 h-4 w-4" />
                        ) : (
                          <Moon className="mr-2 h-4 w-4" />
                        )}
                        Toggle Theme
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                        onClick={() => {
                          fcl.unauthenticate();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
