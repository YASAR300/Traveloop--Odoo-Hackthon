"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function TrendingDestinations({ onSelectDestination }) {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("/api/community/trending");
        if (res.ok) {
          const data = await res.json();
          setTrending(data);
        }
      } catch (error) {
        console.error("Failed to fetch trending:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden py-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-8 w-24 bg-gray-100 animate-pulse border-2 border-black" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 whitespace-nowrap flex items-center gap-2">
          <span className="text-orange-500">🔥</span> Trending
        </h2>
        <div className="flex-1 border-t border-dashed border-gray-300" />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {trending.map((item, idx) => (
          <motion.button
            key={item.destination}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onSelectDestination?.(item.destination)}
            className="flex-shrink-0 px-4 py-1.5 border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all font-mono text-[11px] font-black uppercase tracking-wider flex items-center gap-2 group"
          >
            <span className="group-hover:scale-125 transition-transform">{item.destination.split(",")[0]}</span>
            <span className="text-[8px] bg-gray-100 px-1.5 py-0.5 rounded-none">{item.count}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
