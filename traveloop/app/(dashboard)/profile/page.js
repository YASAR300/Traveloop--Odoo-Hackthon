"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  User, 
  Settings, 
  MapPin, 
  Mail, 
  Globe, 
  Camera, 
  Shield, 
  Bell, 
  CreditCard,
  LogOut,
  ChevronRight,
  Compass,
  Phone,
  Info,
  Calendar,
  Share2,
  Trash2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  Image as ImageIcon,
  Target
} from "lucide-react";
import { motion, AnimatePresence, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CldUploadWidget } from "next-cloudinary";
import confetti from "canvas-confetti";
import { format, isAfter, isBefore } from "date-fns";
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

// --- Constants ---
const COUNTRIES = [
  "India", "United States", "United Kingdom", "United Arab Emirates", 
  "Thailand", "Singapore", "France", "Germany", "Japan", "Australia"
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "gu", label: "Gujarati" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "ar", label: "Arabic" }
];

// --- Components ---

const StatCard = ({ label, value, icon: Icon, index }) => {
  const animatedValue = useCountUp(value);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + (index * 0.1) }}
      className="flex-1 bg-white border-2 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gray-50 border border-black rounded-none">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
      </div>
      <div className="text-3xl font-black italic tracking-tighter">
        {label === "Spent" ? `₹${(animatedValue / 100000).toFixed(1)}L` : animatedValue}
      </div>
    </motion.div>
  );
};

const TripCard = ({ trip, isCompleted }) => {
  const initial = trip.name?.[0] || "T";
  const dateRange = trip.startDate && trip.endDate 
    ? `${format(new Date(trip.startDate), "dd MMM")} → ${format(new Date(trip.endDate), "dd MMM")}`
    : "TBD";

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="min-w-[180px] w-[180px] h-[280px] bg-white border-2 border-black flex flex-col shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all relative group"
    >
      {/* Image Area */}
      <div className="h-[65%] w-full bg-gray-100 relative overflow-hidden">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
            <span className="text-6xl font-black opacity-10 italic">{initial}</span>
          </div>
        )}
        
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-[8px] font-black uppercase px-2 py-1 italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            ✓ Completed
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <h4 className="text-xs font-black uppercase italic tracking-tighter leading-tight line-clamp-2 mb-1">
            {trip.name}
          </h4>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{dateRange}</p>
        </div>
        
        <Button asChild variant="outline" className="h-8 w-full border-2 border-black rounded-none text-[10px] font-black uppercase italic tracking-tighter hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none">
          <Link href={`/trips/${trip.id}/view`}>View</Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        setFormData(data.user);
      }
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Calculations ---
  const completion = useMemo(() => {
    if (!formData) return 0;
    let score = 0;
    if (formData.profileImage) score += 15;
    if (formData.firstName) score += 10;
    if (formData.lastName) score += 10;
    if (formData.email) score += 15;
    if (formData.phone) score += 10;
    if (formData.city) score += 10;
    if (formData.country) score += 10;
    if (formData.additionalInfo) score += 10;
    if (formData.language) score += 10;
    return score;
  }, [formData]);

  const missingChips = useMemo(() => {
    if (!formData) return [];
    const missing = [];
    if (!formData.phone) missing.push({ label: "Add Phone", field: "phone" });
    if (!formData.city) missing.push({ label: "Add City", field: "city" });
    if (!formData.country) missing.push({ label: "Add Country", field: "country" });
    if (!formData.additionalInfo) missing.push({ label: "Add Bio", field: "additionalInfo" });
    return missing;
  }, [formData]);

  useEffect(() => {
    if (completion === 100) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#000000', '#3b82f6', '#ffffff']
      });
      toast.success("✨ Profile Complete! You're a Master Explorer.");
    }
  }, [completion]);

  // --- Handlers ---
  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updated = await res.json();
        setProfileData(prev => ({ ...prev, user: updated }));
        setIsEditing(false);
        toast.success("Profile updated successfully!");
        updateSession({ ...session, user: { ...session?.user, name: `${updated.firstName} ${updated.lastName}` } });
      }
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/u/${formData.username}`;
    navigator.clipboard.writeText(url);
    toast.success("Profile link copied to clipboard!");
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/user/account", { method: "DELETE" });
      if (res.ok) {
        toast.success("Account deleted. Goodbye!");
        signOut({ callbackUrl: "/" });
      }
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-12 h-12 border-4 border-black border-t-blue-500 rounded-full animate-spin mb-4" />
      <span className="font-black uppercase italic tracking-tighter">Loading Your Explorer Profile...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] pb-32 pt-12 px-4 md:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-12"
      >
        
        {/* PROFILE HEADER CARD */}
        <section className="bg-white border-4 border-black p-6 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 -mr-16 -mt-16 rotate-45 pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row gap-12 relative z-10">
            {/* Left: Avatar */}
            <div className="lg:w-1/3 flex flex-col items-center gap-6">
              <div className="relative group cursor-pointer">
                {process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ? (
                  <CldUploadWidget 
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    options={{
                      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                      maxFiles: 1,
                      resourceType: "image",
                      folder: "traveloop_profiles", // Organizes uploads in a folder
                    }}
                    onSuccess={(result) => {
                      setFormData(prev => ({ ...prev, profileImage: result.info.secure_url }));
                      toast.success("Avatar uploaded! Save to apply.");
                    }}
                    onError={(error) => {
                      console.error("Upload Error:", error);
                      toast.error("Upload failed: Check your Cloudinary configuration.");
                    }}
                  >
                    {({ open }) => (
                      <div 
                        onClick={() => open()}
                        className="w-[180px] h-[180px] rounded-full border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(59,130,246,1)] relative"
                      >
                        <Avatar className="w-full h-full rounded-none">
                          <AvatarImage src={formData.profileImage} className="object-cover" />
                          <AvatarFallback className="bg-gray-100 text-4xl font-black italic">
                            {formData.firstName?.[0]}{formData.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-center text-white">
                            <Camera className="h-6 w-6 mx-auto mb-1" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Change Photo</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CldUploadWidget>
                ) : (
                  <div 
                    onClick={() => toast.error("NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET missing in .env")}
                    className="w-[180px] h-[180px] rounded-full border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative bg-gray-50 flex items-center justify-center cursor-not-allowed group"
                  >
                    <Avatar className="w-full h-full rounded-none opacity-50">
                      <AvatarImage src={formData.profileImage} className="object-cover" />
                      <AvatarFallback className="bg-gray-100 text-4xl font-black italic">
                        {formData.firstName?.[0]}{formData.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <AlertTriangle className="h-6 w-6 text-red-500 mb-1" />
                      <span className="text-[8px] font-black uppercase text-red-600 leading-tight">Config Missing</span>
                    </div>
                  </div>
                )}
              </div>
              <Button 
                onClick={handleShare}
                variant="outline" 
                className="w-full border-2 border-black rounded-none h-10 font-black uppercase italic text-[10px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
              >
                <Share2 className="h-3.5 w-3.5 mr-2" /> Share Profile
              </Button>
            </div>

            {/* Right: Details */}
            <div className="lg:w-2/3 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1 block">IDENTIFICATION_KEY</span>
                  <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                    {formData.firstName} {formData.lastName}
                  </h2>
                </div>
                <div className="flex gap-3">
                  {!isEditing ? (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-black text-white rounded-none font-black uppercase italic px-8 h-12 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:shadow-none transition-all"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline"
                        onClick={() => { setIsEditing(false); setFormData(profileData.user); }}
                        className="border-2 border-black rounded-none font-black uppercase italic px-6 h-12"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave}
                        disabled={saveLoading}
                        className="bg-blue-600 text-white rounded-none font-black uppercase italic px-8 h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                      >
                        {saveLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Editable Fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Personal Info</Label>
                    {!isEditing ? (
                      <div className="p-3 bg-gray-50 border-2 border-black font-bold text-xs uppercase tracking-tight flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-gray-400" /> {formData.firstName} {formData.lastName} (@{formData.username})
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          value={formData.firstName} 
                          onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                          placeholder="First Name" className="rounded-none border-2 border-black font-mono h-11" 
                        />
                        <Input 
                          value={formData.lastName} 
                          onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                          placeholder="Last Name" className="rounded-none border-2 border-black font-mono h-11" 
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Contact Details</Label>
                    {!isEditing ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-gray-50 border-2 border-black font-bold text-xs flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-gray-400" /> {formData.email}
                        </div>
                        <div className="p-3 bg-gray-50 border-2 border-black font-bold text-xs flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-gray-400" /> {formData.phone || "No phone added"}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative">
                          <Input 
                            value={formData.email} 
                            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                            className="rounded-none border-2 border-black font-mono h-11 pl-10" 
                          />
                          <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                          <p className="text-[7px] font-black text-blue-500 uppercase mt-1 italic">*Changing email requires re-login</p>
                        </div>
                        <div className="relative">
                          <Input 
                            value={formData.phone} 
                            onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                            placeholder="Phone Number" className="rounded-none border-2 border-black font-mono h-11 pl-10" 
                          />
                          <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Location & Language</Label>
                    {!isEditing ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-gray-50 border-2 border-black font-bold text-xs uppercase flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" /> {formData.city || "City"}, {formData.country || "Country"}
                        </div>
                        <div className="p-3 bg-gray-50 border-2 border-black font-bold text-xs uppercase flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-gray-400" /> {LANGUAGES.find(l => l.value === formData.language)?.label || "English"}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Input 
                            value={formData.city} 
                            onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                            placeholder="City" className="rounded-none border-2 border-black font-mono h-11" 
                          />
                          <Select 
                            value={formData.country} 
                            onValueChange={val => setFormData(p => ({ ...p, country: val }))}
                          >
                            <SelectTrigger className="rounded-none border-2 border-black font-mono h-11">
                              <SelectValue placeholder="Country" />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-2 border-black">
                              {COUNTRIES.map(c => <SelectItem key={c} value={c} className="font-mono text-xs">{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <Select 
                          value={formData.language} 
                          onValueChange={val => setFormData(p => ({ ...p, language: val }))}
                        >
                          <SelectTrigger className="rounded-none border-2 border-black font-mono h-11">
                            <SelectValue placeholder="Language" />
                          </SelectTrigger>
                          <SelectContent className="rounded-none border-2 border-black">
                            {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value} className="font-mono text-xs">{l.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Additional Information</Label>
                    {!isEditing ? (
                      <div className="p-3 bg-gray-50 border-2 border-black font-bold text-xs leading-relaxed min-h-[88px]">
                        {formData.additionalInfo || "No bio added yet. Tell us about your travel style!"}
                      </div>
                    ) : (
                      <div className="relative">
                        <Textarea 
                          value={formData.additionalInfo} 
                          onChange={e => setFormData(p => ({ ...p, additionalInfo: e.target.value.slice(0, 300) }))}
                          placeholder="Tell us about your travel style..." 
                          className="rounded-none border-2 border-black font-mono h-[88px] resize-none" 
                        />
                        <span className="absolute bottom-2 right-2 text-[8px] font-black text-gray-300">
                          {formData.additionalInfo?.length || 0}/300
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROFILE COMPLETION BAR */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <h3 className="text-sm font-black uppercase italic tracking-tighter">Profile Completion</h3>
              <div className="flex-1 max-w-md">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{completion}% Complete</span>
                </div>
                <Progress value={completion} className="h-3 rounded-none border-2 border-black bg-white [&>div]:bg-blue-600" />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {missingChips.map(chip => (
                <button 
                  key={chip.field}
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-blue-50 border-2 border-blue-600 text-[8px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-[3px_3px_0px_0px_rgba(37,99,235,0.2)]"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* TRAVEL STATS STRIP */}
        <section className="flex flex-col md:flex-row gap-6">
          <StatCard label="Trips" value={profileData.stats.tripsCount} icon={Compass} index={0} />
          <StatCard label="Cities" value={profileData.stats.citiesCount} icon={MapPin} index={1} />
          <StatCard label="Activities" value={profileData.stats.activitiesCount} icon={Target} index={2} />
          <StatCard label="Spent" value={profileData.stats.totalSpent} icon={CreditCard} index={3} />
        </section>

        {/* PREPLANNED TRIPS SECTION */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Preplanned Trips</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Next adventures</span>
          </div>
          
          <div className="flex gap-8 overflow-x-auto pb-6 px-2 -mx-2 no-scrollbar">
            {profileData.upcomingTrips.length > 0 ? (
              profileData.upcomingTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} isCompleted={false} />
              ))
            ) : (
              <div className="w-full h-40 border-4 border-black border-dashed flex flex-col items-center justify-center bg-gray-50">
                <Calendar className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-sm font-black uppercase italic tracking-tighter text-gray-300 mb-4">No upcoming trips — Plan one now!</p>
                <Button asChild className="bg-black text-white rounded-none font-black uppercase italic h-10 px-6">
                  <Link href="/trips/create">Plan a Trip</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* PREVIOUS TRIPS SECTION */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Previous Trips</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Memories</span>
          </div>
          
          <div className="flex gap-8 overflow-x-auto pb-6 px-2 -mx-2 no-scrollbar">
            {profileData.completedTrips.length > 0 ? (
              profileData.completedTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} isCompleted={true} />
              ))
            ) : (
              <div className="w-full h-40 border-4 border-black border-dashed flex flex-col items-center justify-center bg-gray-50 opacity-40 grayscale">
                <CheckCircle2 className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-sm font-black uppercase italic tracking-tighter text-gray-300">Your first adventure awaits!</p>
              </div>
            )}
          </div>
        </section>

        {/* VISITED CITIES CHIPS */}
        {profileData.visitedCities.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Cities You've Visited</h3>
            <div className="flex flex-wrap gap-3">
              {profileData.visitedCities.map((city, idx) => (
                <motion.button 
                  key={city.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + (idx * 0.05) }}
                  onClick={() => router.push(`/search/cities?q=${city.name}`)}
                  className="px-4 py-2 bg-white border-2 border-black flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  <span className="text-sm">{city.countryFlag || "📍"}</span>
                  <span className="text-[10px] font-black uppercase italic tracking-tighter">{city.name}</span>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* ACCOUNT & SECURITY */}
        <section className="pt-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="settings" className="border-t-4 border-black">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 border-2 border-black flex items-center justify-center">
                    <Settings className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">⚙️ Account & Security</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-10 pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Change Password */}
                  <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <h4 className="text-sm font-black uppercase italic mb-6 flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Change Password
                    </h4>
                    <form className="space-y-4" onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const currentPassword = formData.get("current");
                      const newPassword = formData.get("new");
                      const confirm = formData.get("confirm");

                      if (newPassword.length < 8) return toast.error("Password must be 8+ chars");
                      if (newPassword !== confirm) return toast.error("Passwords don't match");

                      try {
                        const res = await fetch("/api/user/change-password", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ currentPassword, newPassword })
                        });
                        if (res.ok) {
                          toast.success("Password updated!");
                          e.target.reset();
                        } else {
                          const err = await res.json();
                          toast.error(err.error);
                        }
                      } catch (err) { toast.error("Failed to update password"); }
                    }}>
                      <div className="space-y-2">
                        <Label className="text-[8px] font-black uppercase text-gray-400">Current Password</Label>
                        <Input name="current" type="password" required className="rounded-none border-2 border-black font-mono h-11" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[8px] font-black uppercase text-gray-400">New Password</Label>
                          <Input name="new" type="password" required className="rounded-none border-2 border-black font-mono h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[8px] font-black uppercase text-gray-400">Confirm New</Label>
                          <Input name="confirm" type="password" required className="rounded-none border-2 border-black font-mono h-11" />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-black text-white rounded-none font-black uppercase italic h-12 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:shadow-none transition-all mt-2">
                        Update Password
                      </Button>
                    </form>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-50 border-2 border-red-600 p-6 shadow-[6px_6px_0px_0px_rgba(220,38,38,0.2)]">
                    <h4 className="text-sm font-black uppercase italic mb-4 text-red-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Danger Zone
                    </h4>
                    <p className="text-[10px] font-bold text-red-800 uppercase leading-relaxed mb-6">
                      Deleting your account is permanent. All trip data, itinerary plans, and memories will be erased forever.
                    </p>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full border-2 border-black rounded-none h-12 font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-none border-4 border-black">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm font-bold text-gray-600">
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                            <div className="mt-6 p-4 bg-red-50 border-2 border-red-600 text-red-700">
                              <p className="text-[10px] font-black uppercase mb-2">Please type <span className="underline">DELETE</span> to confirm:</p>
                              <Input 
                                value={deleteConfirm}
                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                className="rounded-none border-2 border-black font-mono h-10 bg-white text-black" 
                              />
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-none border-2 border-black font-black uppercase italic">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirm !== "DELETE"}
                            className="bg-red-600 text-white rounded-none border-2 border-black font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all disabled:opacity-30"
                          >
                            Yes, Delete Forever
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button 
                      onClick={() => signOut({ callbackUrl: "/" })}
                      variant="outline" 
                      className="w-full border-2 border-black rounded-none h-12 font-black uppercase italic tracking-tighter text-black mt-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Proper Logout
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

      </motion.div>
    </div>
  );
}

function Badge({ children, className }) {
  return (
    <span className={`inline-block ${className}`}>
      {children}
    </span>
  );
}