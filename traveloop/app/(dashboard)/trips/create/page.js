"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isAfter, differenceInDays } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Search, 
  Check, 
  Loader2, 
  Plus,
  Compass,
  ArrowRight,
  Trash2,
  X,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const stopSchema = z.object({
  cityId: z.string().min(1, "Place is required"),
  cityName: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  activityIds: z.array(z.string()).default([]),
});

const tripSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  stops: z.array(stopSchema).min(1, "Add at least one stop"),
});

export default function CreateTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [citySearch, setCitySearch] = useState("");
  const [activities, setActivities] = useState([]);
  const [selectedActivitiesForCurrent, setSelectedActivitiesForCurrent] = useState([]);
  
  // Local state for the city adding flow
  const [currentCity, setCurrentCity] = useState(null);
  const [fromDate, setFromDate] = useState(undefined);
  const [toDate, setToDate] = useState(undefined);

  const form = useForm({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: "",
      stops: [],
    },
  });

  const stops = form.watch("stops") || [];

  // Fetch cities for search
  useEffect(() => {
    const fetchCities = async () => {
      if (!citySearch) return;
      try {
        const res = await fetch(`/api/cities?search=${citySearch}`);
        const data = await res.json();
        setCities(data);
      } catch (err) {
        console.error(err);
      }
    };
    const debounce = setTimeout(fetchCities, 300);
    return () => clearTimeout(debounce);
  }, [citySearch]);

  // Fetch activities when currentCity changes
  useEffect(() => {
    const fetchActivities = async () => {
      if (!currentCity) {
        setActivities([]);
        return;
      }
      try {
        const res = await fetch(`/api/activities?cityId=${currentCity.id}&limit=6`);
        const data = await res.json();
        setActivities(data);
        setSelectedActivitiesForCurrent([]); // Reset selection when city changes
      } catch (err) {
        console.error(err);
      }
    };
    fetchActivities();
  }, [currentCity]);

  const toggleActivity = (activityId) => {
    setSelectedActivitiesForCurrent(prev =>
      prev.includes(activityId) ? prev.filter(id => id !== activityId) : [...prev, activityId]
    );
  };

  const addStop = () => {
    if (!currentCity || !fromDate || !toDate) {
      toast.error("Please select city and dates");
      return;
    }
    const newStop = {
      cityId: currentCity.id,
      cityName: currentCity.name,
      startDate: fromDate,
      endDate: toDate,
      activityIds: selectedActivitiesForCurrent,
    };
    form.setValue("stops", [...stops, newStop]);
    // Reset local selection
    setCurrentCity(null);
    setFromDate(undefined);
    setToDate(undefined);
    setCitySearch("");
    setActivities([]);
    setSelectedActivitiesForCurrent([]);
    toast.success(`Added ${newStop.cityName} to trip`);
  };

  const removeStop = (index) => {
    form.setValue("stops", stops.filter((_, i) => i !== index));
  };

  const onSubmit = async (values) => {
    console.log("Submit triggered manually at:", new Date().toLocaleTimeString());
    setLoading(true);
    try {
      const allDates = values.stops.flatMap(s => [s.startDate, s.endDate]);
      const minDate = new Date(Math.min(...allDates));
      const maxDate = new Date(Math.max(...allDates));

      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          startDate: minDate,
          endDate: maxDate,
          stops: values.stops,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const trip = await res.json();
      console.log("Trip created successfully, redirecting...");
      router.push(`/trips/${trip.id}/itinerary`);
    } catch (err) {
      console.error("Submission Error:", err);
      toast.error("Error creating trip");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12" onKeyDown={handleKeyDown}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10"
      >
        <div className="border-b-2 border-black pb-4">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-black">
            Plan Your Journey
          </h1>
          <p className="text-[10px] font-mono text-gray-400 tracking-[0.3em] uppercase mt-1">
            // TRIP_MASTER_BUILDER //
          </p>
        </div>

        <Form {...form}>
          <div className="space-y-12">
            
            {/* 1. Trip Name */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-500">Trip Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., European Summer Trip" 
                        className="rounded-none border-2 border-black h-14 font-black uppercase italic text-xl focus-visible:ring-0 focus-visible:border-blue-500 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* 2. Destination Builder */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black">Add Destination</h2>
                <div className="flex-1 border-t border-black/10" />
              </div>

              <div className="bg-gray-50 border-2 border-black p-6 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {/* City Select */}
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-gray-400">Where are you going?</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-12 justify-between border-2 border-black rounded-none bg-white font-bold uppercase text-xs">
                          {currentCity ? currentCity.name : "Search City..."}
                          <Search className="h-4 w-4 opacity-30" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0 border-2 border-black rounded-none">
                        <div className="p-2 border-b border-black">
                          <Input 
                            placeholder="Type city name..." 
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            className="h-10 border-none focus-visible:ring-0 font-mono text-sm"
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto bg-white">
                          {cities.map((city) => (
                            <button
                              key={city.id}
                              type="button"
                              className="w-full flex items-center gap-2 p-3 text-left hover:bg-blue-50 border-b last:border-none"
                              onClick={() => setCurrentCity(city)}
                            >
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <div className="flex-1">
                                <p className="text-[11px] font-black uppercase">{city.name}</p>
                                <p className="text-[9px] text-gray-500 font-mono">{city.country}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Activity Suggestions for Selected City */}
                  {currentCity && activities.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase text-gray-400">Activities in {currentCity.name}</Label>
                        <span className="text-[8px] font-bold text-blue-500 uppercase">Select to include</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {activities.map((activity) => (
                          <div 
                            key={activity.id}
                            onClick={() => toggleActivity(activity.id)}
                            className={cn(
                              "group relative aspect-square border-2 border-black cursor-pointer overflow-hidden transition-all",
                              selectedActivitiesForCurrent.includes(activity.id) 
                                ? "shadow-none translate-x-[2px] translate-y-[2px] border-blue-500" 
                                : "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                            )}
                          >
                            <div 
                              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
                              style={{ backgroundImage: `url('${activity.imageUrl}')` }} 
                            />
                            <div className={cn(
                              "absolute inset-0 transition-colors duration-300",
                              selectedActivitiesForCurrent.includes(activity.id) ? "bg-blue-600/40" : "bg-black/30 group-hover:bg-black/10"
                            )} />
                            
                            {selectedActivitiesForCurrent.includes(activity.id) && (
                              <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 z-20">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                            
                            <div className="absolute inset-0 flex flex-col justify-end p-2">
                              <span className="text-white text-[9px] font-black uppercase italic leading-none drop-shadow-md">
                                {activity.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Dates Select (Two separate pickers) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-gray-400">From</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-12 justify-between border-2 border-black rounded-none bg-white font-bold uppercase text-xs">
                            {fromDate ? format(fromDate, "dd MMM yyyy") : "Start Date"}
                            <CalendarIcon className="h-4 w-4 opacity-30" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-2 border-black rounded-none" align="start">
                          <Calendar
                            mode="single"
                            selected={fromDate}
                            onSelect={setFromDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-gray-400">To</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-12 justify-between border-2 border-black rounded-none bg-white font-bold uppercase text-xs">
                            {toDate ? format(toDate, "dd MMM yyyy") : "End Date"}
                            <CalendarIcon className="h-4 w-4 opacity-30" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-2 border-black rounded-none" align="end">
                          <Calendar
                            mode="single"
                            selected={toDate}
                            onSelect={setToDate}
                            disabled={(date) => date < (fromDate || new Date())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <Button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addStop();
                  }}
                  className="w-full h-14 bg-black text-white rounded-none font-black uppercase italic tracking-tighter shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <Plus className="h-5 w-5 mr-2" /> Add Destination
                </Button>
              </div>

              {/* Added Stops List */}
              <div className="space-y-3">
                <AnimatePresence>
                  {stops.map((stop, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-4 bg-white border-2 border-black p-4 group"
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-black text-white font-black italic text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black uppercase italic tracking-tighter">{stop.cityName}</h3>
                          {stop.activityIds.length > 0 && (
                            <Badge className="bg-blue-100 text-blue-600 border-none rounded-none text-[8px] font-black uppercase">
                              {stop.activityIds.length} Activities
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                          {format(stop.startDate, "MMM dd")} — {format(stop.endDate, "MMM dd")} ({differenceInDays(stop.endDate, stop.startDate)} Nights)
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeStop(index)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col items-center pt-8 border-t-2 border-black">
              <Button
                type="button"
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={loading || stops.length === 0}
                className="h-20 w-full bg-black text-white rounded-none font-black text-2xl italic uppercase tracking-tighter shadow-[10px_10px_0px_0px_rgba(34,197,94,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all disabled:opacity-50 disabled:grayscale"
              >
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <>
                    CREATE MASTERPLAN
                    <ArrowRight className="ml-3 h-8 w-8" />
                  </>
                )}
              </Button>
              {stops.length === 0 && (
                <p className="mt-4 text-[10px] font-black uppercase text-red-500 tracking-[0.2em] animate-pulse">Select at least one destination to proceed</p>
              )}
            </div>
          </div>
        </Form>
      </motion.div>
    </div>
  );
}