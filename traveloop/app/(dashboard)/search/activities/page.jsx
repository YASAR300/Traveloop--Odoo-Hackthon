"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SearchCard from "@/components/search/SearchCard";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function ActivitiesSearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // Mocking API call for now
        // In reality: const res = await fetch(`/api/activities?q=${query}&...`);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network
        
        const mockData = [
          { id: "1", title: "Paragliding over Bali", sectionType: "ADVENTURE", cost: 4500, duration: "3h", city: { name: "Ubud" }, description: "Soar like an eagle over the breathtaking landscapes of Bali's central highlands." },
          { id: "2", title: "Sunset Seafood Dinner", sectionType: "FOOD & DINING", cost: 2000, duration: "2h", city: { name: "Jimbaran" }, description: "Enjoy fresh catch of the day while watching the legendary Jimbaran sunset." },
          { id: "3", title: "Uluwatu Temple Visit", sectionType: "SIGHTSEEING", cost: 800, duration: "4h", city: { name: "Uluwatu" }, description: "Ancient clifftop temple with mesmerizing kecak fire dance performances." },
          { id: "4", title: "Scuba Diving", sectionType: "ADVENTURE", cost: 6500, duration: "6h", city: { name: "Nusa Penida" }, description: "Explore the vibrant coral reefs and manta rays of the Indian Ocean." },
          { id: "5", title: "Cooking Class", sectionType: "CULTURE", cost: 1500, duration: "3h", city: { name: "Seminyak" }, description: "Learn the secrets of Balinese spices and traditional cooking techniques." },
        ];

        // Filter based on query if exists
        const filtered = query 
          ? mockData.filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
          : mockData;

        setResults(filtered);
      } catch (err) {
        toast.error("Failed to fetch activities");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const toggleSave = async (id) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // POST /api/user/saved...
    toast.success("Preference updated!");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Result Count + Status */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-dashed border-gray-200">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-1">Results</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {loading ? "Searching travelers database..." : `Showing ${results.length} activities ${query ? `for "${query}"` : "nearby"}`}
          </p>
        </div>
        {loading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {loading ? (
          // Skeleton Pulse Cards
          [1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 border-4 border-black animate-pulse shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]" />
          ))
        ) : results.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {results.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <SearchCard 
                  item={item} 
                  type="activity"
                  isExpanded={expandedId === item.id}
                  onExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  isSaved={savedIds.has(item.id)}
                  onSave={toggleSave}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="py-20 text-center border-4 border-dashed border-gray-200 bg-gray-50">
            <Sparkles className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-400">No results found</h3>
            <p className="text-xs font-bold text-gray-400 uppercase mt-2">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
