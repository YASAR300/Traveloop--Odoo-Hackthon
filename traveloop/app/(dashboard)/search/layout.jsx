"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import debounce from "lodash/debounce";

export default function SearchLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecentSearches(saved);
  }, []);

  const updateSearch = useCallback(
    debounce((term) => {
      const params = new URLSearchParams(searchParams);
      if (term) params.set("q", term);
      else params.delete("q");
      router.push(`${pathname}?${params.toString()}`);

      // Update recent searches
      if (term && term.length > 2) {
        const saved = JSON.parse(localStorage.getItem("recentSearches") || "[]");
        const updated = [term, ...saved.filter(s => s !== term)].slice(0, 5);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
        setRecentSearches(updated);
      }
    }, 300),
    [pathname, searchParams]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    updateSearch(value);
  };

  const removeRecent = (term) => {
    const updated = recentSearches.filter(s => s !== term);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
    setRecentSearches(updated);
  };

  const activeTab = pathname.includes("/cities") ? "cities" : "activities";

  return (
    <div className="max-w-6xl mx-auto px-4 pt-10 pb-20">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 bg-gray-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Link 
            href="/search/activities"
            className={cn(
              "px-6 py-2 text-xs font-black uppercase italic transition-all",
              activeTab === "activities" ? "bg-black text-white" : "text-black hover:bg-gray-200"
            )}
          >
            🎯 Activities
          </Link>
          <Link 
            href="/search/cities"
            className={cn(
              "px-6 py-2 text-xs font-black uppercase italic transition-all",
              activeTab === "cities" ? "bg-black text-white" : "text-black hover:bg-gray-200"
            )}
          >
            🏙️ Cities
          </Link>
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="relative mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
            <Input 
              placeholder={activeTab === "cities" ? "Search cities, countries..." : "Paragliding, Street food..."}
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className="h-14 pl-12 border-4 border-black rounded-none bg-white text-lg font-black italic tracking-tight shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:shadow-[8px_8px_0px_0px_rgba(59,130,246,1)] transition-all"
            />
            
            {/* Recent Searches Dropdown */}
            <AnimatePresence>
              {isFocused && recentSearches.length > 0 && !query && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black z-50 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-4"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">RECENT_SEARCHES</span>
                  <div className="space-y-1">
                    {recentSearches.map((term) => (
                      <div key={term} className="flex items-center justify-between group/item p-2 hover:bg-blue-50 transition-colors cursor-pointer">
                        <div onClick={() => { setQuery(term); updateSearch(term); }} className="flex-1 font-bold text-sm uppercase italic">
                          {term}
                        </div>
                        <button onClick={() => removeRecent(term)} className="p-1 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2 h-14">
            <Button variant="outline" className="h-full border-4 border-black rounded-none font-black uppercase italic text-xs px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
              <LayoutGrid className="h-4 w-4 mr-2" /> Group By
            </Button>
            <Button variant="outline" className="h-full border-4 border-black rounded-none font-black uppercase italic text-xs px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button variant="outline" className="h-full border-4 border-black rounded-none font-black uppercase italic text-xs px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
              <ArrowUpDown className="h-4 w-4 mr-2" /> Sort By
            </Button>
          </div>
        </div>

        {/* Popular Tags */}
        <AnimatePresence>
          {!query && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex flex-wrap gap-2 items-center"
            >
              <span className="text-[10px] font-black uppercase text-gray-400 mr-2">Popular:</span>
              {["Paragliding", "Beach", "Temples", "Street Food", "Adventure"].map(tag => (
                <button 
                  key={tag}
                  onClick={() => { setQuery(tag); updateSearch(tag); }}
                  className="px-3 py-1 border-2 border-black text-[10px] font-black uppercase italic hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {children}
    </div>
  );
}
