"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowDown, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  LayoutGrid, 
  Share2, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Plane,
  Hotel,
  Utensils,
  Target,
  Calendar,
  List as ListIcon,
  GitGraph
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ItineraryViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("flow"); // flow, calendar, list
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const res = await fetch(`/api/trips/${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (err) {
        toast.error("Could not load itinerary");
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [id]);

  const handleShare = () => {
    if (data?.trip?.isPublic) {
      navigator.clipboard.writeText(`${window.location.origin}/share/${data.trip.shareToken}`);
      toast.success("Itinerary link copied!");
    } else {
      toast.info("Make trip public first in settings to share.");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "TRAVEL": return <Plane className="h-4 w-4" />;
      case "HOTEL": return <Hotel className="h-4 w-4" />;
      case "FOOD": return <Utensils className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const totalBudget = data?.trip?.budget?.totalBudget || 0;
  const remainingBudget = totalBudget - data?.totalSpent;

  const handleSetBudget = async () => {
    const amount = prompt("Enter overall trip budget (₹):", "10000");
    if (!amount || isNaN(amount)) return;

    try {
      const res = await fetch(`/api/trips/${id}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalBudget: parseFloat(amount) })
      });
      if (res.ok) {
        toast.success("Budget updated!");
        // Refresh data
        const refresh = await fetch(`/api/trips/${id}`);
        const json = await refresh.json();
        setData(json);
      }
    } catch (err) {
      toast.error("Failed to update budget");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
        <GitGraph className="h-12 w-12 text-black" />
      </motion.div>
      <span className="font-black uppercase italic tracking-tighter">Drafting Flow...</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* ... header ... */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
            Itinerary for <span className="text-blue-600 underline decoration-4 underline-offset-4">{data?.trip?.name}</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {data?.trip?.startDate ? new Date(data.trip.startDate).toLocaleDateString() : "Drafting Mode"} • {data?.trip?.stops?.length} Stops
          </p>
        </div>

        <div className="flex gap-2">
          <div className="flex border-2 border-black p-1 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => setViewMode("flow")}
              className={cn("p-2 transition-all", viewMode === "flow" ? "bg-black text-white" : "hover:bg-gray-100")}
            >
              <GitGraph className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode("calendar")}
              className={cn("p-2 transition-all", viewMode === "calendar" ? "bg-black text-white" : "hover:bg-gray-100")}
            >
              <Calendar className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={cn("p-2 transition-all", viewMode === "list" ? "bg-black text-white" : "hover:bg-gray-100")}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={handleShare} variant="outline" className="border-2 border-black rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic text-xs">
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
        </div>
      </div>

      {/* ... search/filters ... */}
      <div className="flex gap-2 mb-16">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black" />
          <Input 
            placeholder="Search activities..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-12 border-2 border-black rounded-none font-bold uppercase italic tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] transition-all"
          />
        </div>
        <Button variant="outline" className="h-12 border-2 border-black rounded-none font-black uppercase italic text-xs px-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
          <SlidersHorizontal className="h-4 w-4 mr-2" /> Filter
        </Button>
        <Button variant="outline" className="h-12 border-2 border-black rounded-none font-black uppercase italic text-xs px-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
          <ArrowUpDown className="h-4 w-4 mr-2" /> Sort
        </Button>
      </div>

      {/* Column Headers */}
      <div className="flex gap-4 mb-8 px-20">
        <div className="flex-[7] text-xs font-black uppercase tracking-widest text-gray-400">Physical Activity</div>
        <div className="flex-[3] text-xs font-black uppercase tracking-widest text-gray-400 text-right">Expense</div>
      </div>

      {/* Day Wise Flow */}
      <div className="space-y-20 relative">
        {data?.sortedDays.map((dayLabel, dayIdx) => (
          <div key={dayLabel} className="relative">
            {/* Day Label Pill */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="absolute -left-4 top-0 -translate-x-full pr-8 z-10"
            >
              <div className="bg-white border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[80px] text-center">
                <span className="block text-lg font-black italic tracking-tighter leading-none">{dayLabel}</span>
                <span className="block text-[8px] font-bold uppercase mt-1 text-gray-400">
                  ₹{data.dayMap[dayLabel].reduce((s, x) => s + x.totalCost, 0).toLocaleString()}
                </span>
              </div>
            </motion.div>

            {/* Activities List */}
            <div className="space-y-0">
              {data.dayMap[dayLabel].map((section, secIdx) => {
                const isMatch = !searchQuery || section.title.toLowerCase().includes(searchQuery.toLowerCase());
                
                return (
                  <React.Fragment key={section.id}>
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: isMatch ? 1 : 0.2 }}
                      viewport={{ once: true }}
                      className="flex gap-4 items-stretch group"
                    >
                      {/* Activity Box */}
                      <div className="flex-[7] bg-white border-2 border-black p-4 flex items-center justify-between hover:border-blue-600 hover:translate-x-1 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 border-2 border-black rounded-full">
                            {getIcon(section.sectionType)}
                          </div>
                          <span className="font-black uppercase italic tracking-tighter text-lg">{section.title}</span>
                        </div>
                        <Badge variant="outline" className="border-black rounded-none text-[8px] font-black">{section.sectionType}</Badge>
                      </div>

                      {/* Expense Box */}
                      <div className={cn(
                        "flex-[3] border-2 border-black p-4 flex flex-col justify-center text-right font-black italic text-xl",
                        section.totalCost > (totalBudget / 7) ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                      )}>
                        ₹{section.totalCost.toLocaleString()}
                        <span className="text-[8px] font-bold uppercase text-gray-400 tracking-tighter">Budget_Estimated</span>
                      </div>
                    </motion.div>

                    {/* Arrow Connector */}
                    {secIdx < data.dayMap[dayLabel].length - 1 && (
                      <div className="flex justify-center h-12 relative group/arrow">
                        <motion.div 
                          initial={{ scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          className="w-0.5 bg-black origin-top h-full"
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-white border-2 border-black rounded-full p-1 opacity-0 group-hover/arrow:opacity-100 transition-all cursor-pointer hover:scale-125">
                          <Plus className="h-3 w-3" />
                        </div>
                        <ArrowDown className="absolute bottom-0 left-1/2 -translate-x-1/2 h-3 w-3" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Budget Summary Section */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        className="mt-32 p-8 border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-2">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Budget Summary</h2>
          {totalBudget === 0 && (
            <Button onClick={handleSetBudget} className="bg-blue-600 text-white rounded-none font-black uppercase italic text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              Set Overall Budget
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-bold uppercase">
              <span>Total Activities Cost</span>
              <span className="font-black italic text-lg">₹{data.totalSpent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold uppercase">
              <span>Planned Overall Budget</span>
              <div className="flex items-center gap-2">
                <span className="font-black italic text-lg">₹{totalBudget.toLocaleString()}</span>
                {totalBudget > 0 && <Button onClick={handleSetBudget} variant="link" className="h-auto p-0 text-[10px] font-black uppercase underline italic">Edit</Button>}
              </div>
            </div>
            <div className="h-1 bg-gray-200" />
            <div className="flex justify-between items-center">
              <span className="text-xl font-black uppercase italic tracking-tighter">Remaining Budget</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-3xl font-black italic",
                  remainingBudget < 0 ? "text-red-600" : "text-green-600"
                )}>
                  ₹{remainingBudget.toLocaleString()}
                </span>
                {remainingBudget >= 0 ? <CheckCircle2 className="text-green-600" /> : <AlertCircle className="text-red-600" />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {data.sortedDays.slice(0, 4).map(day => (
               <div key={day} className="bg-gray-50 border-2 border-black p-3">
                 <span className="text-[10px] font-black uppercase text-gray-400 block">{day}</span>
                 <span className="text-sm font-black italic">₹{data.dayMap[day].reduce((s, x) => s + x.totalCost, 0).toLocaleString()}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-12">
          <Button 
            onClick={() => router.push(`/trips/${id}/invoice`)}
            className="flex-1 h-14 bg-black text-white rounded-none font-black uppercase italic text-lg shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] hover:shadow-none transition-all"
          >
            View Full Invoice
          </Button>
          <Button 
            onClick={() => router.push(`/trips/${id}/itinerary`)}
            variant="outline" 
            className="flex-1 h-14 border-4 border-black rounded-none font-black uppercase italic text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
          >
            Edit Itinerary
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
