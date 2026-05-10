"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, MapPin, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTopBar from "@/components/shared/PageTopBar";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { ease: "easeOut", duration: 0.4 } },
};

// Placeholder region cards
const regions = [
  { label: "ASIA", img: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400&q=80" },
  { label: "EUROPE", img: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&q=80" },
  { label: "AMERICAS", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" },
  { label: "AFRICA", img: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&q=80" },
  { label: "OCEANIA", img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80" },
];

export default function DashboardPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-4 lg:px-6 py-6 space-y-8"
    >
      {/* Banner Image */}
      <motion.div variants={itemVariants}>
        <div className="relative w-full h-52 md:h-72 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-8">
            <div className="inline-block border border-white/30 px-2 py-0.5 mb-3 w-fit">
              <span className="text-white/60 text-[10px] font-mono tracking-widest uppercase">
                // READY_TO_EXPLORE //
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
              Where To
              <br />
              <span className="text-blue-400">Next?</span>
            </h2>
          </div>
        </div>
      </motion.div>

      {/* Search bar row */}
      <motion.div variants={itemVariants}>
        <PageTopBar
          searchPlaceholder="Search bar ......"
          groupByOptions={[
            { label: "Region", value: "region" },
            { label: "Date", value: "date" },
            { label: "Budget", value: "budget" },
          ]}
          filterOptions={[
            { label: "All", value: "all" },
            { label: "Upcoming", value: "upcoming" },
            { label: "Completed", value: "completed" },
          ]}
          sortOptions={[
            { label: "Newest", value: "newest" },
            { label: "Oldest", value: "oldest" },
            { label: "Alphabetical", value: "alpha" },
          ]}
        />
      </motion.div>

      {/* Top Regional Selections */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-black whitespace-nowrap">
            Top Regional Selections
          </h2>
          <div className="flex-1 border-t-2 border-black" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {regions.map((region) => (
            <Link
              key={region.label}
              href={`/search/cities?region=${region.label}`}
              className="group relative aspect-square border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all overflow-hidden"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url('${region.img}')` }}
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="relative z-10 flex flex-col justify-end h-full p-3">
                <span className="text-white font-black text-[10px] uppercase tracking-widest">
                  {region.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Previous Trips */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-black whitespace-nowrap">
            Previous Trips
          </h2>
          <div className="flex-1 border-t-2 border-black" />
        </div>

        {/* Empty state / placeholder cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] border-2 border-black border-dashed flex flex-col items-center justify-center gap-3 text-gray-300"
            >
              <MapPin className="h-8 w-8" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                No Trip Yet
              </span>
            </div>
          ))}
        </div>

        {/* Plan a trip button — bottom right */}
        <div className="flex justify-end mt-6">
          <Button
            asChild
            className="h-11 px-6 bg-white border-2 border-black text-black rounded-none font-black text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center gap-2"
          >
            <Link href="/trips/create">
              <Plus className="h-4 w-4" />
              Plan a trip
            </Link>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}