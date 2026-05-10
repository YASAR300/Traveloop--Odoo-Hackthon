"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isAfter } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Search, 
  Check, 
  Loader2, 
  Plus,
  Compass,
  ArrowRight
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

const tripSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  cityId: z.string().min(1, "Please select a place"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
}).refine((data) => !data.startDate || !data.endDate || isAfter(data.endDate, data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

export default function CreateTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [citySearch, setCitySearch] = useState("");
  const [activities, setActivities] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  const form = useForm({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: "",
      cityId: "",
      startDate: undefined,
      endDate: undefined,
    },
  });

  // Fetch cities for search
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(`/api/cities?search=${citySearch}`);
        const data = await res.json();
        setCities(data);
      } catch (err) {
        console.error("Error fetching cities", err);
      }
    };

    const debounce = setTimeout(fetchCities, 300);
    return () => clearTimeout(debounce);
  }, [citySearch]);

  // Fetch activities when city changes
  useEffect(() => {
    const fetchActivities = async () => {
      const url = selectedCity 
        ? `/api/activities?cityId=${selectedCity.id}&limit=6`
        : `/api/activities?limit=6`;
      
      try {
        const res = await fetch(url);
        const data = await res.json();
        setActivities(data);
      } catch (err) {
        console.error("Error fetching activities", err);
      }
    };

    fetchActivities();
  }, [selectedCity]);

  const toggleActivity = (activityId) => {
    setSelectedActivities((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          preSelectedActivityIds: selectedActivities,
        }),
      });

      if (!res.ok) throw new Error("Failed to create trip");

      const trip = await res.json();
      toast.success("Trip planned successfully!");
      router.push(`/trips/${trip.id}/itinerary`);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="border-b-4 border-black pb-4">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-black">
            Plan a new trip:
          </h1>
          <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mt-1">
            // JOURNEY_STARTS_HERE //
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest">Name:</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Trip to Paris..." 
                        className="rounded-none border-2 border-black h-12 focus-visible:ring-0 focus-visible:border-blue-500 font-mono transition-all"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-black uppercase" />
                  </FormItem>
                )}
              />

              {/* City Selection */}
              <FormField
                control={form.control}
                name="cityId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-black uppercase tracking-widest">Select a Place:</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between rounded-none border-2 border-black h-12 font-mono text-left",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? cities.find((c) => c.id === field.value)?.name || selectedCity?.name
                              : "Search city..."}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="p-2 border-b-2 border-black">
                          <Input
                            placeholder="Search..."
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            className="h-10 border-none focus-visible:ring-0 rounded-none font-mono"
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto bg-white">
                          {cities.length === 0 ? (
                            <div className="p-4 text-center text-xs font-mono uppercase text-gray-400">
                              No city found
                            </div>
                          ) : (
                            cities.map((city) => (
                              <button
                                key={city.id}
                                type="button"
                                className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-100 transition-colors border-b last:border-none"
                                onClick={() => {
                                  form.setValue("cityId", city.id);
                                  setSelectedCity(city);
                                  setCitySearch("");
                                }}
                              >
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-xs font-black uppercase">{city.name}</p>
                                  <p className="text-[10px] text-gray-500 font-mono">{city.country}</p>
                                </div>
                                {field.value === city.id && <Check className="ml-auto h-4 w-4" />}
                              </button>
                            ))
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-[10px] font-black uppercase" />
                  </FormItem>
                )}
              />

              {/* Date Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-black uppercase tracking-widest">Start Date:</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-mono rounded-none border-2 border-black h-12",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-[10px] font-black uppercase" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-black uppercase tracking-widest">End Date:</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-mono rounded-none border-2 border-black h-12",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < (form.getValues("startDate") || new Date())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-[10px] font-black uppercase" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Suggestions Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-black whitespace-nowrap">
                  Suggestion for Places to Visit / Activities to Perform
                </h2>
                <div className="flex-1 border-t-2 border-black" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                          "group relative aspect-[4/5] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden cursor-pointer transition-all",
                          selectedActivities.includes(activity.id) && "shadow-none translate-x-1 translate-y-1 border-blue-500"
                        )}
                        onClick={() => toggleActivity(activity.id)}
                      >
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url('${activity.imageUrl || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80"}')` }}
                        />
                        <div className={cn(
                          "absolute inset-0 bg-black/40 transition-colors",
                          selectedActivities.includes(activity.id) ? "bg-blue-600/40" : "group-hover:bg-black/20"
                        )} />
                        
                        {selectedActivities.includes(activity.id) && (
                          <div className="absolute top-2 right-2 z-20 bg-blue-500 text-white p-1">
                            <Check className="h-3 w-3" />
                          </div>
                        )}

                        <div className="absolute inset-0 z-10 flex flex-col justify-end p-4">
                          <Badge className="w-fit mb-2 bg-black text-[8px] tracking-widest rounded-none border-none">
                            {activity.type}
                          </Badge>
                          <span className="text-white font-black text-xs uppercase leading-tight">
                            {activity.name}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    // Skeleton/Empty placeholders
                    [1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-[4/5] border-2 border-black border-dashed flex flex-col items-center justify-center bg-gray-50 text-gray-300">
                        <Compass className="h-8 w-8 mb-2 animate-pulse" />
                        <span className="text-[10px] font-black uppercase">No Data</span>
                      </div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <Button
                type="submit"
                disabled={loading}
                className="group relative h-16 w-full md:w-64 bg-black text-white rounded-none font-black text-lg italic uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(59,130,246,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all overflow-hidden"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    PLANNING...
                  </>
                ) : (
                  <>
                    CREATE TRIP
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 transform rotate-45 translate-x-2 translate-y-2" />
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}