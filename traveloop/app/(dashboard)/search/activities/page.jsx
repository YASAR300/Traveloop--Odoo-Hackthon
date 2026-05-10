"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SearchCard from "@/components/search/SearchCard";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Suspense } from "react";

function ActivitiesContent() {
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
        const res = await fetch(`/api/activities?search=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        
        // Fetch saved status
        const savedRes = await fetch("/api/user/saved");
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setSavedIds(new Set(savedData.activities.map(a => a.id)));
        }
      } catch (err) {
        console.error("Activities Fetch Error:", err);
        toast.error("Failed to fetch activities");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const toggleSave = async (id) => {
    try {
      const res = await fetch("/api/user/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: id })
      });

      if (!res.ok) throw new Error("Failed to save");
      
      const data = await res.json();
      
      setSavedIds(prev => {
        const next = new Set(prev);
        if (data.status === "removed") next.delete(id);
        else next.add(id);
        return next;
      });

      toast.success(data.status === "saved" ? "Activity bookmarked!" : "Removed from bookmarks");
    } catch (err) {
      toast.error("Could not update bookmark");
    }
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

export default function ActivitiesSearchPage() {
  return (
    <Suspense fallback={null}>
      <ActivitiesContent />
    </Suspense>
  );
}
