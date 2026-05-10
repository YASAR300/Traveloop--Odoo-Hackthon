"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  Menu,
  LayoutDashboard,
  MapPin,
  Plus,
  Globe,
  Compass,
  Users,
  Package,
  FileText,
  User,
  Shield,
  LogOut,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const navLinks = [
  { label: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
  { label: "MY TRIPS", href: "/trips", icon: MapPin },
  { label: "CREATE TRIP", href: "/trips/create", icon: Plus },
  { label: "CITY SEARCH", href: "/search/cities", icon: Globe },
  { label: "ACTIVITIES", href: "/search/activities", icon: Compass },
  { label: "COMMUNITY", href: "/community", icon: Users },
];

const adminLink = { label: "ADMIN", href: "/admin", icon: Shield };

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const isAdmin = session?.user?.isAdmin;

  const allLinks = isAdmin ? [...navLinks, adminLink] : navLinks;

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "TR";

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b-2 border-black">
      <div className="flex h-14 items-center px-4 lg:px-6 gap-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger>
            <div role="button" className="lg:hidden p-2 border-2 border-black hover:bg-black hover:text-white transition-colors cursor-pointer">
              <Menu className="h-4 w-4" />
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-r-2 border-black rounded-none p-0">
            <SheetHeader className="p-6 border-b-2 border-black bg-black text-white">
              <SheetTitle className="text-white font-black italic uppercase tracking-tighter text-xl">
                Traveloop
              </SheetTitle>
              <p className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">
                // NAVIGATION_MENU //
              </p>
            </SheetHeader>
            <nav className="flex flex-col py-4">
              {allLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors border-l-4 ${
                      isActive
                        ? "border-black bg-black text-white"
                        : "border-transparent hover:border-blue-500 hover:text-blue-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                    {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 flex-shrink-0"
        >
          <div className="w-7 h-7 bg-black flex items-center justify-center">
            <span className="text-white font-black text-xs italic">TL</span>
          </div>
          <span className="font-black italic uppercase tracking-tighter text-black text-lg hidden sm:block">
            Traveloop
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-1 ml-4 flex-1">
          {allLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                  isActive
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-black hover:border-gray-400"
                }`}
              >
                <Icon className="h-3 w-3" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Search toggle */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <Input
                  autoFocus
                  placeholder="Search..."
                  className="h-8 border-2 border-black rounded-none text-xs font-mono focus-visible:ring-0"
                  onBlur={() => setSearchOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="h-8 w-8 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(59,130,246,1)] transition-shadow cursor-pointer rounded-none">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-black text-white font-black text-xs rounded-none">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-0"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="bg-black text-white px-4 py-3 rounded-none">
                  <p className="text-xs font-black uppercase tracking-widest">
                    {session?.user?.name || "Explorer"}
                  </p>
                  <p className="text-[10px] font-mono text-gray-400 truncate mt-0.5">
                    {session?.user?.email || ""}
                  </p>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="m-0 border-t-2 border-black" />
              <DropdownMenuItem asChild className="rounded-none px-4 py-2.5 cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span className="text-[11px] font-black uppercase tracking-wider">Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-none px-4 py-2.5 cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                <Settings className="h-3 w-3 mr-2" />
                <span className="text-[11px] font-black uppercase tracking-wider">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="m-0 border-t-2 border-black" />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-none px-4 py-2.5 cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600"
              >
                <LogOut className="h-3 w-3 mr-2" />
                <span className="text-[11px] font-black uppercase tracking-wider">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
