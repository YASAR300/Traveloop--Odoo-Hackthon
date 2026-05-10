"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SearchCard from "@/components/search/SearchCard";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function CitiesSearchPage() {
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
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network
        
        const mockData = [
          { id: "c1", name: "Bali", country: "Indonesia", region: "ASIA", costIndex: "$$", popularity: "Legendary", description: "The Island of Gods, where vibrant culture meets stunning natural beauty." },
          { id: "c2", name: "Tokyo", country: "Japan", region: "ASIA", costIndex: "$$$", popularity: "High", description: "A neon-lit metropolis blending futuristic tech with ancient traditions." },
          { id: "c3", name: "Paris", country: "France", region: "EUROPE", costIndex: "$$$+", popularity: "High", description: "The city of lights, love, and world-class culinary experiences." },
          { id: "c4", name: "Dubai", country: "UAE", region: "MIDDLE EAST", costIndex: "$$$", popularity: "Very High", description: "A desert oasis of luxury, innovation, and record-breaking architecture." },
          { id: "c5", name: "Cape Town", country: "South Africa", region: "AFRICA", costIndex: "$$", popularity: "High", description: "A breathtaking coastal city at the foot of Table Mountain." },
        ];

        const filtered = query 
          ? mockData.filter(item => 
              item.name.toLowerCase().includes(query.toLowerCase()) || 
              item.country.toLowerCase().includes(query.toLowerCase())
            )
          : mockData;

        setResults(filtered);
      } catch (err) {
        toast.error("Failed to fetch cities");
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
    toast.success("Destination bookmarked!");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-dashed border-gray-200">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-1">Results</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {loading ? "Scanning world map..." : `Showing ${results.length} cities ${query ? `matching "${query}"` : "to explore"}`}
          </p>
        </div>
        {loading && <Loader2 className="h-5 w-5 animate-spin text-green-500" />}
      </div>

      <div className="space-y-4">
        {loading ? (
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
                  type="city"
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
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-400">No cities found</h3>
            <p className="text-xs font-bold text-gray-400 uppercase mt-2">Try a broader search or check your spelling</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
