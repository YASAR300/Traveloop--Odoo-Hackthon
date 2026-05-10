"use client";

import React, { useState } from "react";
import { Search, ChevronDown, SlidersHorizontal, ArrowUpDown, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

/**
 * PageTopBar — reusable top action bar matching the wireframe layout.
 *
 * Props:
 *   searchPlaceholder?: string
 *   onSearch?: (value: string) => void
 *   groupByOptions?: { label: string; value: string }[]
 *   onGroupBy?: (value: string) => void
 *   filterOptions?: { label: string; value: string }[]
 *   onFilter?: (value: string) => void
 *   sortOptions?: { label: string; value: string }[]
 *   onSort?: (value: string) => void
 */
export default function PageTopBar({
  searchPlaceholder = "Search ......",
  onSearch,
  groupByOptions = [],
  onGroupBy,
  filterOptions = [],
  onFilter,
  sortOptions = [],
  onSort,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [activeGroupBy, setActiveGroupBy] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [activeSort, setActiveSort] = useState(null);

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleGroupBy = (val) => {
    setActiveGroupBy(val);
    onGroupBy?.(val);
  };

  const handleFilter = (val) => {
    setActiveFilter(val);
    onFilter?.(val);
  };

  const handleSort = (val) => {
    setActiveSort(val);
    onSort?.(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 w-full"
    >
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <Input
          value={searchValue}
          onChange={handleSearch}
          placeholder={searchPlaceholder}
          className="h-10 pl-9 border-2 border-black rounded-none bg-white font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(59,130,246,1)] transition-all"
        />
      </div>

      {/* Group By */}
      {groupByOptions.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`h-10 gap-1.5 border-2 border-black rounded-none font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                activeGroupBy ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              <LayoutGrid className="h-3 w-3" />
              Group By
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[140px]">
            {groupByOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => handleGroupBy(opt.value)}
                className={`rounded-none font-mono text-xs uppercase tracking-wider cursor-pointer ${
                  activeGroupBy === opt.value ? "bg-black text-white" : ""
                }`}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="outline"
          className="h-10 gap-1.5 border-2 border-black rounded-none font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white text-black"
          disabled
        >
          <LayoutGrid className="h-3 w-3" />
          Group By
        </Button>
      )}

      {/* Filter */}
      {filterOptions.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`h-10 gap-1.5 border-2 border-black rounded-none font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                activeFilter ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              <SlidersHorizontal className="h-3 w-3" />
              Filter
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[140px]">
            {filterOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => handleFilter(opt.value)}
                className={`rounded-none font-mono text-xs uppercase tracking-wider cursor-pointer ${
                  activeFilter === opt.value ? "bg-black text-white" : ""
                }`}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="outline"
          className="h-10 gap-1.5 border-2 border-black rounded-none font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white text-black"
          disabled
        >
          <SlidersHorizontal className="h-3 w-3" />
          Filter
        </Button>
      )}

      {/* Sort By */}
      {sortOptions.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`h-10 gap-1.5 border-2 border-black rounded-none font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                activeSort ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              <ArrowUpDown className="h-3 w-3" />
              Sort By
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[140px]">
            {sortOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => handleSort(opt.value)}
                className={`rounded-none font-mono text-xs uppercase tracking-wider cursor-pointer ${
                  activeSort === opt.value ? "bg-black text-white" : ""
                }`}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="outline"
          className="h-10 gap-1.5 border-2 border-black rounded-none font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white text-black"
          disabled
        >
          <ArrowUpDown className="h-3 w-3" />
          Sort By
        </Button>
      )}
    </motion.div>
  );
}
