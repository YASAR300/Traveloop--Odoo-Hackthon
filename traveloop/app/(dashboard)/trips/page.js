"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Plus, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Eye, 
  Pencil, 
  MoreHorizontal, 
  Share2, 
  Copy, 
  Trash2,
  Clock,
  CheckCircle2,
  Loader2,
  Compass,
  Search,
  Globe,
  DollarSign
} from "lucide-react";
import { format, isWithinInterval, isAfter, isBefore, addDays, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PageTopBar from "@/components/shared/PageTopBar";

// --- Components ---

const TripCard = ({ trip, onEdit, onDelete, onDuplicate }) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const today = startOfDay(new Date());
  const startDate = trip.startDate ? new Date(trip.startDate) : null;
  const endDate = trip.endDate ? new Date(trip.endDate) : null;

  // Calculate status
  let status = "UPCOMING";
  if (startDate && endDate) {
    if (isBefore(endDate, today)) status = "COMPLETED";
    else if (isWithinInterval(today, { start: startDate, end: endDate })) status = "ONGOING";
  }

  // Ongoing Progress
  const totalDays = startDate && endDate ? Math.ceil((endDate - startDate) / 86400000) + 1 : 0;
  const daysElapsed = startDate ? Math.ceil((today - startDate) / 86400000) + 1 : 0;
  const progress = totalDays > 0 ? Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100)) : 0;
  const daysLeft = endDate ? Math.ceil((endDate - today) / 86400000) : 0;

  // Upcoming Countdown
  const daysToStart = startDate ? Math.ceil((startDate - today) / 86400000) : 0;
  const startingSoon = daysToStart <= 7 && daysToStart > 0;
  const startsTomorrow = daysToStart === 1;

  const cityNames = trip.stops?.map(s => s.city?.name).filter(Boolean).join(" • ") || "Global Destination";
  const countries = [...new Set(trip.stops?.map(s => s.city?.country).filter(Boolean))].join(" • ") || "World";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative flex flex-col md:flex-row items-center bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all p-4 md:p-5 gap-5 min-h-[120px]"
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 border-2 border-black rounded-none overflow-hidden bg-gray-100 flex items-center justify-center">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center text-2xl font-black italic uppercase text-white/50">
            {trip.name[0]}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-xl font-black uppercase italic tracking-tighter leading-tight truncate">
            {trip.name}
          </h3>
          
          {/* Status Badge */}
          {status === "ONGOING" && (
            <Badge className="bg-green-500 text-white border-none rounded-none text-[8px] font-black uppercase flex items-center gap-1.5 h-5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              ONGOING
            </Badge>
          )}
          {status === "UPCOMING" && (
            <Badge className="bg-blue-500 text-white border-none rounded-none text-[8px] font-black uppercase h-5">
              UP-COMING
            </Badge>
          )}
          {status === "COMPLETED" && (
            <Badge className="bg-gray-400 text-white border-none rounded-none text-[8px] font-black uppercase h-5">
              COMPLETED
            </Badge>
          )}
        </div>

        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">
          {cityNames} • {countries}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
            <Calendar className="h-3 w-3" />
            {startDate && endDate ? `${format(startDate, "dd MMM yyyy")} → ${format(endDate, "dd MMM yyyy")}` : "Flexible Dates"}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
            <Globe className="h-3 w-3" />
            {trip.citiesCount || 0} cities • {trip.activitiesCount || 0} activities
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-900 font-bold">
            <DollarSign className="h-3 w-3" />
            ₹{trip.totalBudget?.toLocaleString() || 0}
          </div>
        </div>

        {/* Dynamic Context Rows */}
        {status === "ONGOING" && (
          <div className="mt-3 w-full max-w-sm">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[9px] font-black uppercase italic">Day {daysElapsed} of {totalDays}</span>
              <span className="text-[9px] font-black text-blue-600 uppercase italic">{daysLeft} days left</span>
            </div>
            <Progress value={progress} className="h-1 rounded-none border border-black bg-gray-100 [&>div]:bg-blue-500" />
          </div>
        )}

        {status === "UPCOMING" && startingSoon && (
          <div className="mt-2 flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-700 border-2 border-amber-200 rounded-none text-[8px] font-black uppercase italic">
              {startsTomorrow ? "Tomorrow! 🎉" : "Starting soon! ⚡"}
            </Badge>
            <span className="text-[9px] font-black uppercase text-gray-400">Starts in {daysToStart} days</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:pl-4">
        <Button 
          asChild 
          variant="outline" 
          className="w-10 h-10 border-2 border-black rounded-none p-0 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
        >
          <Link href={`/trips/${trip.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        <Button 
          onClick={() => onEdit(trip)}
          variant="outline" 
          className="w-10 h-10 border-2 border-black rounded-none p-0 hover:bg-blue-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-10 h-10 border-2 border-black rounded-none p-0 hover:bg-gray-100 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-0">
            <DropdownMenuItem 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/trips/${trip.shareToken}/view`);
                toast.success("Public link copied to clipboard!");
              }}
              className="rounded-none px-4 py-2.5 cursor-pointer hover:bg-gray-100 gap-3"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Share Trip</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDuplicate(trip.id)}
              className="rounded-none px-4 py-2.5 cursor-pointer hover:bg-gray-100 gap-3"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Duplicate</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setDeleteConfirmOpen(true)}
              className="rounded-none px-4 py-2.5 cursor-pointer hover:bg-red-50 text-red-600 gap-3"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase italic tracking-tighter">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-mono uppercase tracking-widest">
              This will permanently delete "{trip.name}" and all its itinerary data, budgets, and notes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border-2 border-black font-black uppercase tracking-widest text-[10px]">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(trip.id)}
              className="rounded-none bg-red-600 hover:bg-red-700 text-white border-2 border-black font-black uppercase tracking-widest text-[10px]"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

// --- Main Page ---

export default function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroupBy, setActiveGroupBy] = useState("status");
  const [editingTrip, setEditingTrip] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Fetch Trips
  const fetchTrips = async () => {
    try {
      const res = await fetch("/api/trips");
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch (err) {
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Handlers
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTrips(prev => prev.filter(t => t.id !== id));
        toast.success("Trip deleted successfully");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleDuplicate = async (id) => {
    const promise = fetch(`/api/trips/${id}/duplicate`, { method: "POST" });
    
    toast.promise(promise, {
      loading: "Duplicating trip...",
      success: async (res) => {
        const newTrip = await res.json();
        await fetchTrips(); // Reload all
        return `Trip duplicated! Edit it in Upcoming ↓`;
      },
      error: "Failed to duplicate"
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    const formData = new FormData(e.target);
    const updates = {
      name: formData.get("name"),
      description: formData.get("description"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      isPublic: formData.get("isPublic") === "on",
    };

    try {
      const res = await fetch(`/api/trips/${editingTrip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setTrips(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
        setEditingTrip(null);
        toast.success("Trip updated!");
      }
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  // Filter & Search Logic
  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const query = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(query);
      const matchCity = t.stops?.some(s => s.city?.name?.toLowerCase().includes(query));
      return matchName || matchCity;
    });
  }, [trips, searchQuery]);

  // Grouping Logic
  const groupedTrips = useMemo(() => {
    const today = startOfDay(new Date());
    
    if (activeGroupBy === "status") {
      const groups = { ONGOING: [], UPCOMING: [], COMPLETED: [] };
      filteredTrips.forEach(t => {
        const start = t.startDate ? new Date(t.startDate) : null;
        const end = t.endDate ? new Date(t.endDate) : null;
        if (start && end) {
          if (isBefore(end, today)) groups.COMPLETED.push(t);
          else if (isWithinInterval(today, { start, end })) groups.ONGOING.push(t);
          else groups.UPCOMING.push(t);
        } else {
          groups.UPCOMING.push(t);
        }
      });
      return [
        { label: "Ongoing", key: "ONGOING", trips: groups.ONGOING },
        { label: "Up-coming", key: "UPCOMING", trips: groups.UPCOMING },
        { label: "Completed", key: "COMPLETED", trips: groups.COMPLETED },
      ];
    }
    
    if (activeGroupBy === "destination") {
      const countries = {};
      filteredTrips.forEach(t => {
        const country = t.stops?.[0]?.city?.country || "Others";
        if (!countries[country]) countries[country] = [];
        countries[country].push(t);
      });
      return Object.entries(countries).map(([name, items]) => ({
        label: name, key: name, trips: items
      }));
    }

    return [{ label: "All Trips", key: "all", trips: filteredTrips }];
  }, [filteredTrips, activeGroupBy]);

  const ongoingCount = trips.filter(t => t.startDate && t.endDate && isWithinInterval(new Date(), { start: new Date(t.startDate), end: new Date(t.endDate) })).length;
  const upcomingCount = trips.filter(t => t.startDate && isAfter(new Date(t.startDate), new Date())).length;
  const completedCount = trips.filter(t => t.endDate && isBefore(new Date(t.endDate), new Date())).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-6 py-8 space-y-8">
        
        {/* Search & Stats Row */}
        <div className="space-y-6">
          <PageTopBar 
            onSearch={setSearchQuery}
            searchPlaceholder="Search trips by name or city..."
            groupByOptions={[
              { label: "Status", value: "status" },
              { label: "Destination", value: "destination" }
            ]}
            onGroupBy={setActiveGroupBy}
            filterOptions={[{ label: "All", value: "all" }]}
            sortOptions={[{ label: "Newest First", value: "newest" }]}
          />

          {/* Quick Stats Chips */}
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-white border-2 border-black flex items-center gap-2 hover:bg-green-50 transition-all shadow-[3px_3px_0px_0px_rgba(34,197,94,1)]">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">{ongoingCount} Ongoing</span>
            </button>
            <button className="px-4 py-2 bg-white border-2 border-black flex items-center gap-2 hover:bg-blue-50 transition-all shadow-[3px_3px_0px_0px_rgba(59,130,246,1)]">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest">{upcomingCount} Upcoming</span>
            </button>
            <button className="px-4 py-2 bg-white border-2 border-black flex items-center gap-2 hover:bg-gray-100 transition-all shadow-[3px_3px_0px_0px_rgba(156,163,175,1)]">
              <span className="w-2 h-2 bg-gray-400 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest">{completedCount} Completed</span>
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-12 pb-20">
          {loading ? (
            <div className="space-y-12">
              {[1, 2].map(i => (
                <div key={i} className="space-y-4">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse border-l-4 border-black" />
                  <div className="h-32 w-full bg-white border-2 border-black animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            groupedTrips.map((group) => (
              <div key={group.key} className="space-y-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-black">
                    {group.label}
                  </h2>
                  <div className="flex-1 h-0.5 bg-black/5" />
                  <span className="text-[10px] font-mono text-gray-400">{group.trips.length} items</span>
                </div>

                <div className="space-y-6">
                  {group.trips.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                      {group.trips.map((trip) => (
                        <TripCard 
                          key={trip.id} 
                          trip={trip} 
                          onEdit={setEditingTrip}
                          onDelete={handleDelete}
                          onDuplicate={handleDuplicate}
                        />
                      ))}
                    </AnimatePresence>
                  ) : (
                    <div className="h-32 border-2 border-black border-dashed flex flex-col items-center justify-center bg-white/50 group hover:bg-white transition-all">
                      <Compass className="h-6 w-6 text-gray-300 mb-2 group-hover:text-blue-500 transition-colors" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        No trips in {group.label}
                      </p>
                      {group.key === "UPCOMING" && (
                        <Button asChild variant="link" className="text-[9px] font-black uppercase text-blue-600 p-0 h-auto mt-1">
                          <Link href="/trips/create">Plan a New Trip →</Link>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingTrip} onOpenChange={(open) => !open && setEditingTrip(null)}>
        <DialogContent className="border-4 border-black rounded-none shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] max-w-lg">
          <DialogHeader className="border-b-2 border-black pb-4 mb-4">
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Edit Trip Details</DialogTitle>
            <DialogDescription className="text-[10px] font-mono uppercase tracking-widest font-bold">Update trip parameters manually</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Trip Name</Label>
                <Input name="name" defaultValue={editingTrip?.name} className="rounded-none border-2 border-black font-mono h-12" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Start Date</Label>
                  <Input name="startDate" type="date" defaultValue={editingTrip?.startDate ? format(new Date(editingTrip.startDate), "yyyy-MM-dd") : ""} className="rounded-none border-2 border-black font-mono h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">End Date</Label>
                  <Input name="endDate" type="date" defaultValue={editingTrip?.endDate ? format(new Date(editingTrip.endDate), "yyyy-MM-dd") : ""} className="rounded-none border-2 border-black font-mono h-12" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Description</Label>
                <Textarea name="description" defaultValue={editingTrip?.description} className="rounded-none border-2 border-black font-mono min-h-[80px]" />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="isPublic" name="isPublic" defaultChecked={editingTrip?.isPublic} className="w-4 h-4 border-2 border-black rounded-none" />
                <Label htmlFor="isPublic" className="text-[10px] font-black uppercase cursor-pointer">Make this trip public</Label>
              </div>
            </div>

            <DialogFooter className="border-t-2 border-black pt-6">
              <Button type="button" variant="outline" onClick={() => setEditingTrip(null)} className="rounded-none border-2 border-black font-black uppercase tracking-widest text-[10px] h-12">Cancel</Button>
              <Button type="submit" disabled={editLoading} className="rounded-none bg-black text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:shadow-none transition-all">
                {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}