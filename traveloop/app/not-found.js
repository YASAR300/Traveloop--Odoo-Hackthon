"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Home, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 max-w-2xl"
      >
        {/* Animated 404 Graphic */}
        <div className="relative">
          <h1 className="text-[150px] md:text-[200px] font-black italic tracking-tighter leading-none text-gray-100 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                y: [0, -10, 0]
              }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <Compass className="h-24 w-24 md:h-32 md:w-32 text-blue-600" />
            </motion.div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight">
            Whoops! You're <span className="text-blue-600">Lost in Transit.</span>
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs md:text-sm max-w-md mx-auto">
            The destination you're looking for doesn't exist or has been relocated to a different itinerary.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button asChild className="h-14 bg-black text-white rounded-none font-black uppercase italic px-10 shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] hover:shadow-none transition-all">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" /> Take Me Home
            </Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="h-14 border-2 border-black rounded-none font-black uppercase italic px-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="grid grid-cols-3 gap-8 pt-16 opacity-10">
          <MapPin className="h-8 w-8 mx-auto" />
          <Compass className="h-8 w-8 mx-auto" />
          <MapPin className="h-8 w-8 mx-auto" />
        </div>
      </motion.div>
    </div>
  );
}
