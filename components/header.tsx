"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Search,
  Menu,
  LogOut,
  BookOpen,
  Heart,
  Settings,
  Home,
  Users,
  Grid3X3,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
    router.push("/");
  };

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/authors", label: "Authors", icon: Users },
    { href: "/genres", label: "Genres", icon: Grid3X3 },
  ];

  const userMenuItems = user
    ? [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/my-books", label: "My Books", icon: BookOpen },
        { href: "/wishlist", label: "Wishlist", icon: Heart },
        { href: "/settings", label: "Settings", icon: Settings },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BookHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`flex items-center space-x-2 transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "hover:bg-gray-100 text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div
                className={`relative transition-all duration-300 ${
                  isSearchFocused ? "scale-105" : ""
                }`}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search books, authors, genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-10 pr-4 bg-gray-50/80 border-gray-200 focus:border-blue-400 focus:ring-blue-400 focus:bg-white transition-all duration-200 rounded-full"
                />
              </div>
            </form>
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    <Avatar className="h-10 w-10 border-2 border-gray-200">
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                        {user.name?.charAt(0)?.toUpperCase() ||
                          user.email?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl"
                  align="end"
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <Icon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {item.label}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-gray-100 transition-colors duration-200"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-80 bg-white/95 backdrop-blur-md"
              >
                <div className="flex flex-col h-full">
                  {/* Mobile Search */}
                  <div className="mb-6">
                    <form onSubmit={handleSearch} className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </form>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="space-y-2 mb-6">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <Link key={item.href} href={item.href}>
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            className={`w-full justify-start space-x-3 ${
                              isActive
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                : "hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Button>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Mobile User Menu */}
                  {user ? (
                    <div className="space-y-2 border-t border-gray-200 pt-6">
                      <div className="px-3 py-2 mb-4">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.href} href={item.href}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start space-x-3 text-gray-700 hover:bg-gray-100"
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Button>
                          </Link>
                        );
                      })}

                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start space-x-3 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 border-t border-gray-200 pt-6">
                      <Link href="/login">
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
