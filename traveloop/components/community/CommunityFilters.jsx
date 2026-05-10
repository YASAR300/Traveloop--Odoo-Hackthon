"use client";

import React, { useState } from "react";
import { Search, ChevronDown, SlidersHorizontal, ArrowUpDown, LayoutGrid, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function CommunityFilters({ 
  onSearch, 
  onGroupBy, 
  onFilter, 
  onSort,
  activeFilters = {}
}) {
  const [searchValue, setSearchValue] = useState("");
  const [localFilters, setLocalFilters] = useState(activeFilters);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  const applyFilters = () => {
    onFilter?.(localFilters);
  };

  const clearFilters = () => {
    const cleared = {};
    setLocalFilters(cleared);
    onFilter?.(cleared);
  };

  const toggleFilter = (key, value) => {
    setLocalFilters(prev => {
      const current = prev[key] || [];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2 w-full flex-wrap sm:flex-nowrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search posts..."
            className="h-10 pl-9 border-2 border-black rounded-none bg-white font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(59,130,246,1)] transition-all"
          />
        </div>

        {/* Group By */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 px-4 border-2 border-black rounded-none font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white text-black flex gap-1.5">
              <LayoutGrid className="h-3 w-3" />
              Group By
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[160px]">
            {[
              { label: "Most Recent", value: "newest" },
              { label: "Most Liked", value: "mostLiked" },
              { label: "Most Commented", value: "mostCommented" },
              { label: "By Destination", value: "destination" },
              { label: "By Trip Type", value: "tripType" },
            ].map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => onGroupBy?.(opt.value)}
                className="rounded-none font-mono text-xs uppercase tracking-wider cursor-pointer hover:bg-black hover:text-white"
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter (Sheet) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-10 px-4 border-2 border-black rounded-none font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white text-black flex gap-1.5">
              <SlidersHorizontal className="h-3 w-3" />
              Filter
              {Object.values(localFilters).flat().length > 0 && (
                <span className="bg-blue-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">
                  {Object.values(localFilters).flat().length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="border-l-2 border-black rounded-none p-0 flex flex-col">
            <SheetHeader className="p-6 border-b-2 border-black bg-black text-white">
              <SheetTitle className="text-white font-black italic uppercase tracking-tighter text-xl">Filter Posts</SheetTitle>
              <p className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">// REFINE_SEARCH //</p>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Regions */}
              <section className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500" /> By Region
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Asia", "Europe", "Americas", "Africa", "Middle East", "Oceania"].map(r => (
                    <Badge
                      key={r}
                      variant="outline"
                      onClick={() => toggleFilter("regions", r)}
                      className={`rounded-none border-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                        localFilters.regions?.includes(r) 
                          ? "bg-black text-white border-black" 
                          : "bg-white text-black border-gray-200 hover:border-black"
                      }`}
                    >
                      {r}
                    </Badge>
                  ))}
                </div>
              </section>

              {/* Activity Types */}
              <section className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500" /> By Activity Type
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Adventure", "Culture", "Food", "Nature", "Shopping", "Wellness"].map(a => (
                    <Badge
                      key={a}
                      variant="outline"
                      onClick={() => toggleFilter("activities", a)}
                      className={`rounded-none border-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                        localFilters.activities?.includes(a) 
                          ? "bg-black text-white border-black" 
                          : "bg-white text-black border-gray-200 hover:border-black"
                      }`}
                    >
                      {a}
                    </Badge>
                  ))}
                </div>
              </section>

              {/* Show Only */}
              <section className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500" /> Show Only
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "All Posts", value: "all" },
                    { label: "From People I Follow", value: "followed", disabled: true },
                    { label: "My Posts", value: "mine" },
                  ].map(o => (
                    <div 
                      key={o.value}
                      onClick={() => !o.disabled && toggleFilter("showOnly", o.value)}
                      className={`flex items-center justify-between p-3 border-2 border-black font-mono text-[10px] uppercase tracking-wider cursor-pointer transition-all ${
                        o.disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-50"
                      } ${localFilters.showOnly?.includes(o.value) ? "bg-blue-50 border-blue-500" : "bg-white"}`}
                    >
                      <span>{o.label}</span>
                      {localFilters.showOnly?.includes(o.value) && <div className="w-2 h-2 bg-blue-500" />}
                      {o.disabled && <span className="text-[8px] text-gray-400">Soon</span>}
                    </div>
                  ))}
                </div>
              </section>

              {/* Date Posted */}
              <section className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500" /> Date Posted
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {["Today", "This Week", "This Month", "All Time"].map(d => (
                    <div 
                      key={d}
                      onClick={() => toggleFilter("dateRange", d)}
                      className={`p-2 border-2 border-black font-mono text-[10px] text-center uppercase tracking-wider cursor-pointer transition-all ${
                        localFilters.dateRange?.includes(d) ? "bg-black text-white" : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <SheetFooter className="p-6 border-t-2 border-black bg-gray-50 grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="rounded-none border-2 border-black font-black uppercase tracking-widest text-[10px]"
              >
                Clear All
              </Button>
              <SheetClose asChild>
                <Button 
                  onClick={applyFilters}
                  className="rounded-none bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]"
                >
                  Apply Filters
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Sort By */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 px-4 border-2 border-black rounded-none font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white text-black flex gap-1.5">
              <ArrowUpDown className="h-3 w-3" />
              Sort By
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[160px]">
            {[
              { label: "Newest First", value: "newest" },
              { label: "Most Liked", value: "mostLiked" },
              { label: "Most Commented", value: "mostCommented" },
              { label: "Oldest First", value: "oldest" },
            ].map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => onSort?.(opt.value)}
                className="rounded-none font-mono text-xs uppercase tracking-wider cursor-pointer hover:bg-black hover:text-white"
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
