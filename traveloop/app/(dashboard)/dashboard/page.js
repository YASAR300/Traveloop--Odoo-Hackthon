"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTopBar from "@/components/shared/PageTopBar";
import { format } from "date-fns";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { ease: "easeOut", duration: 0.4 } },
};

const regions = [
  { label: "ASIA", img: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400&q=80" },
  { label: "EUROPE", img: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&q=80" },
  { label: "AMERICAS", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" },
  { label: "AFRICA", img: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&q=80" },
  { label: "OCEANIA", img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80" },
];

export default function DashboardPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch("/api/trips");
        if (res.ok) {
          const data = await res.json();
          setTrips(data);
        }
      } catch (error) {
        console.error("Failed to fetch trips:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-4 lg:px-6 py-6 space-y-8"
    >
      {/* Banner */}
      <motion.div variants={itemVariants}>
        <div className="relative w-full h-52 md:h-72 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-8">
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
              Where To
              <br />
              <span className="text-blue-400">Next?</span>
            </h2>
          </div>
        </div>
      </motion.div>

      {/* Page Controls */}
      <motion.div variants={itemVariants}>
        <PageTopBar
          searchPlaceholder="Search trips..."
          groupByOptions={[
            { label: "Region", value: "region" },
            { label: "Date", value: "date" },
          ]}
          filterOptions={[
            { label: "All", value: "all" },
            { label: "Upcoming", value: "upcoming" },
          ]}
          sortOptions={[
            { label: "Newest", value: "newest" },
          ]}
        />
      </motion.div>

      {/* Regions */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-black whitespace-nowrap">
            Explore Regions
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
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex flex-col justify-end h-full p-3">
                <span className="text-white font-black text-[10px] uppercase tracking-widest">
                  {region.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Trips Section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-black whitespace-nowrap">
              My Trips
            </h2>
            <div className="flex-1 border-t-2 border-black" />
          </div>
          <Button
            asChild
            variant="outline"
            className="ml-4 h-9 px-4 border-2 border-black rounded-none font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all flex items-center gap-2"
          >
            <Link href="/trips/create">
              <Plus className="h-3 w-3" />
              Plan New
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
            ))}
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {trips.map((trip) => {
              const mainStop = trip.stops?.[0];
              const city = mainStop?.city;
              const cityImg = city?.imageUrl || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80";

              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}/itinerary`}
                  className="group relative flex flex-col border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all"
                >
                  <div className="relative aspect-video overflow-hidden border-b-2 border-black">
                    <img
                      src={cityImg}
                      alt={trip.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800";
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-white border-2 border-black px-2 py-1 text-[10px] font-black uppercase tracking-tighter italic">
                      {city?.name || "Global"}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter italic leading-tight group-hover:text-blue-600 transition-colors">
                      {trip.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {trip.startDate && trip.endDate 
                          ? `${format(new Date(trip.startDate), "MMM dd")} - ${format(new Date(trip.endDate), "MMM dd, yyyy")}`
                          : "Flexible Dates"}
                      </span>
                    </div>
                    <div className="mt-2 pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">View Itinerary</span>
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-black border-dashed bg-gray-50">
            <Compass className="h-12 w-12 text-gray-300 mb-4 animate-pulse" />
            <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">No trips planned yet.</p>
            <Button asChild className="mt-6 bg-black text-white rounded-none font-black uppercase tracking-tighter italic border-b-4 border-r-4 border-gray-600 hover:bg-gray-900 active:translate-y-1 active:translate-x-1 active:border-b-0 active:border-r-0 transition-all">
              <Link href="/trips/create">Start Your First Journey</Link>
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}