"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  MapPin, 
  Clock, 
  DollarSign, 
  Plus, 
  Bookmark, 
  ChevronDown, 
  Star,
  City,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SearchCard({ item, type = "activity", isExpanded, onExpand, onSave, isSaved }) {
  const [addingToTrip, setAddingToTrip] = useState(false);

  const handleSave = (e) => {
    e.stopPropagation();
    onSave(item.id);
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    setAddingToTrip(true);
    // Flow: Open Dialog -> Select Trip -> Confirm
    toast.info(`Adding ${item.name || item.title} to trip...`);
  };

  const icon = type === "activity" ? <Target className="h-5 w-5 text-blue-500" /> : <Globe className="h-5 w-5 text-green-500" />;

  return (
    <div className="mb-3">
      <motion.div
        layout
        onClick={onExpand}
        className={cn(
          "w-full bg-white border-4 border-black transition-all cursor-pointer overflow-hidden",
          isExpanded ? "shadow-none" : "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        )}
      >
        {/* Main Row */}
        <div className="flex items-center gap-4 p-4 min-h-[80px]">
          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 border-2 border-black flex items-center justify-center">
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black uppercase italic tracking-tighter truncate text-lg">
                {item.name || item.title}
                {type === "city" && <span className="text-gray-400 font-normal ml-2">, {item.country}</span>}
              </h3>
              <Badge variant="outline" className="border-2 border-black rounded-none text-[8px] font-black uppercase tracking-tighter px-1">
                {type === "activity" ? item.sectionType : item.region}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {type === "activity" ? (
                <>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.city?.name || "Unknown"}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.duration || "2h"}</span>
                  <span className="flex items-center gap-1 text-black font-black italic"><DollarSign className="h-3 w-3" /> ₹{item.cost?.toLocaleString() || "0"}</span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1 text-black font-black italic"><DollarSign className="h-3 w-3" /> Cost Index: {item.costIndex || "$$"}</span>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {item.popularity || "High"}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleSave}
              className={cn(
                "p-2 border-2 border-black transition-all hover:scale-110",
                isSaved ? "bg-yellow-400 text-black" : "bg-white text-gray-300"
              )}
            >
              <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
            </button>
            <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", isExpanded && "rotate-180")} />
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t-4 border-black"
            >
              <div className="p-6 bg-gray-50">
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                  {/* Mock Image Placeholder */}
                  <div className="w-full md:w-48 h-32 bg-gray-200 border-2 border-black flex items-center justify-center relative overflow-hidden">
                    <span className="text-[10px] font-black uppercase text-gray-400 italic">Media_Preview</span>
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-xs font-black uppercase text-gray-400 mb-2">Description</h4>
                    <p className="text-sm font-bold text-gray-600 leading-relaxed mb-4">
                      {item.description || "Experience the thrill of discovery at this location. Perfect for travelers seeking a unique perspective."}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white border-2 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-[8px] font-black uppercase text-gray-400 block mb-1">Total_Reviews</span>
                        <span className="text-xs font-black italic tracking-tighter">4.8 (2,450 Reviews)</span>
                      </div>
                      <div className="bg-white border-2 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-[8px] font-black uppercase text-gray-400 block mb-1">Availability</span>
                        <span className="text-xs font-black italic tracking-tighter text-green-600 uppercase">Instant Booking</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleAdd}
                  className="w-full h-14 bg-black text-white rounded-none font-black uppercase italic text-lg shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:shadow-none transition-all active:translate-y-1"
                >
                  <Plus className="h-5 w-5 mr-2" /> Add to Trip
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
