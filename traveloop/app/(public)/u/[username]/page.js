"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  User, 
  MapPin, 
  Compass, 
  Target, 
  CreditCard,
  ExternalLink,
  ChevronRight,
  Plane
} from "lucide-react";
import { motion, animate } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";

// --- Custom Hooks ---
function useCountUp(to, duration = 1.5) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const controls = animate(0, to, {
      duration,
      onUpdate: (value) => setCount(Math.floor(value)),
    });
    return () => controls.stop();
  }, [to, duration]);
  return count;
}

const StatCard = ({ label, value, icon: Icon, index }) => {
  const animatedValue = useCountUp(value);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + (index * 0.1) }}
      className="bg-white border-2 border-black p-4 flex-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3 w-3 text-blue-500" />
        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{label}</span>
      </div>
      <div className="text-xl font-black italic tracking-tighter">
        {label === "Spent" ? `₹${(animatedValue / 100000).toFixed(1)}L` : animatedValue}
      </div>
    </motion.div>
  );
};

export default function PublicProfilePage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const res = await fetch(`/api/public/user/${username}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load public profile");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, [username]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-10 h-10 border-4 border-black border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
      <h1 className="text-6xl font-black italic tracking-tighter mb-4">404</h1>
      <p className="font-bold uppercase tracking-widest text-gray-400">Explorer Not Found</p>
      <Button asChild className="mt-8 bg-black text-white rounded-none font-black uppercase italic">
        <Link href="/">Back Home</Link>
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] pb-32">
      {/* Branding Header */}
      <nav className="h-16 bg-white border-b-4 border-black px-6 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-xl font-black uppercase italic tracking-tighter">
          Traveloop <span className="text-blue-600">/ Explore</span>
        </Link>
        <Button asChild className="bg-black text-white rounded-none font-black uppercase italic text-xs h-10 px-6 shadow-[3px_3px_0px_0px_rgba(59,130,246,1)]">
          <Link href="/signup">Join the Club</Link>
        </Button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 mt-12 space-y-12">
        {/* Profile Card */}
        <section className="bg-white border-4 border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center gap-10">
          <Avatar className="h-40 w-40 border-4 border-black shadow-[6px_6px_0px_0px_rgba(59,130,246,1)]">
            <AvatarImage src={data.profileImage} className="object-cover" />
            <AvatarFallback className="bg-gray-100 text-5xl font-black italic">
              {data.firstName?.[0]}{data.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1 block">PUBLIC_PROFILE</span>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
                {data.firstName} {data.lastName}
              </h1>
              <p className="text-sm font-mono text-gray-400 uppercase mt-1">@{data.username}</p>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] font-black uppercase text-gray-500 italic">
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {data.city || "Earth"}, {data.country || "Mars"}</span>
            </div>

            {data.additionalInfo && (
              <p className="text-sm font-bold text-gray-600 leading-relaxed max-w-lg">
                "{data.additionalInfo}"
              </p>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="flex flex-wrap gap-4">
          <StatCard label="Trips" value={data.stats.tripsCount} icon={Compass} index={0} />
          <StatCard label="Cities" value={data.stats.citiesCount} icon={MapPin} index={1} />
          <StatCard label="Acts" value={data.stats.activitiesCount} icon={Target} index={2} />
          <StatCard label="Spent" value={data.stats.totalSpent} icon={CreditCard} index={3} />
        </section>

        {/* Public Trips Grid */}
        <section className="space-y-6">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">Shared Journeys</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.publicTrips.length > 0 ? (
              data.publicTrips.map((trip, idx) => (
                <motion.div 
                  key={trip.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + (idx * 0.1) }}
                  className="bg-white border-2 border-black flex flex-col h-[280px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all group"
                >
                  <div className="h-[60%] bg-gray-100 relative overflow-hidden">
                    {trip.coverImage ? (
                      <img src={trip.coverImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    ) : (
                      <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                        <Plane className="h-10 w-10 text-blue-200" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-black uppercase italic tracking-tighter leading-tight mb-1">{trip.name}</h4>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">
                        {trip.startDate ? format(new Date(trip.startDate), "MMMM yyyy") : "Timeless Journey"}
                      </p>
                    </div>
                    <Button variant="outline" className="w-full border-2 border-black rounded-none h-9 text-[10px] font-black uppercase italic tracking-tighter hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none">
                      Explore Itinerary
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 border-4 border-black border-dashed flex flex-col items-center justify-center bg-gray-50 opacity-40">
                <Plane className="h-12 w-12 text-gray-200 mb-4" />
                <p className="text-sm font-black uppercase italic tracking-tighter text-gray-300">This explorer keeps their plans private.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
