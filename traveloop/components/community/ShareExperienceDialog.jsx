"use client";

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, Plane, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ShareExperienceDialog({ isOpen, onClose, onPostCreated }) {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTrips();
    }
  }, [isOpen]);

  const fetchTrips = async () => {
    setLoadingTrips(true);
    try {
      const res = await fetch("/api/trips");
      if (res.ok) {
        const data = await res.json();
        // For hackathon, show all trips, but label them
        setTrips(data);
      }
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim() || isPosting) return;
    setIsPosting(true);

    const trip = trips.find(t => t.id === selectedTrip);
    const destination = trip?.stops?.[0]?.city?.name || "";

    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: selectedTrip,
          content: content.trim(),
          images,
          destination: destination || "Global",
        }),
      });

      if (res.ok) {
        const newPost = await res.json();
        onPostCreated?.(newPost);
        toast.success("Your experience has been shared! 🎉");
        handleClose();
      } else {
        toast.error("Failed to share your experience");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsPosting(false);
    }
  };

  const handleClose = () => {
    setSelectedTrip("");
    setContent("");
    setImages([]);
    onClose();
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 border-4 border-black rounded-none overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="p-6 border-b-4 border-black bg-black text-white">
          <DialogTitle className="font-black italic uppercase tracking-tighter text-2xl flex items-center gap-2">
            <Plane className="h-6 w-6 text-blue-400" />
            Share Experience
          </DialogTitle>
          <p className="text-[10px] font-mono text-gray-400 tracking-widest uppercase mt-1">// NEW_COMMUNITY_POST //</p>
        </DialogHeader>

        <div className="p-6 space-y-6 bg-white">
          {/* Trip Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Select Trip (Optional)</label>
            <Select value={selectedTrip} onValueChange={setSelectedTrip}>
              <SelectTrigger className="w-full border-2 border-black rounded-none font-mono text-xs focus:ring-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <SelectValue placeholder={loadingTrips ? "Loading trips..." : "Choose a trip..."} />
              </SelectTrigger>
              <SelectContent className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {trips.map(trip => (
                  <SelectItem key={trip.id} value={trip.id} className="font-mono text-xs uppercase cursor-pointer">
                    {trip.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex justify-between">
              <span>Your Story</span>
              <span>{content.length}/1000</span>
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 1000))}
              placeholder="Write about your breathtaking journey, tips, and hidden gems..."
              className="min-h-[150px] border-2 border-black rounded-none font-mono text-xs focus-visible:ring-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 resize-none"
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Add Photos (Max 5)</label>
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group">
                  <img src={img} className="w-full h-full object-cover" alt="Upload preview" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white p-1 border-2 border-black rounded-none hidden group-hover:block"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "traveloop_preset"}
                  onSuccess={(result) => {
                    setImages(prev => [...prev, result.info.secure_url]);
                  }}
                >
                  {({ open }) => (
                    <button
                      onClick={() => open()}
                      className="w-20 h-20 border-2 border-black border-dashed flex flex-col items-center justify-center gap-1 hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <ImagePlus className="h-4 w-4 text-gray-400" />
                      <span className="text-[8px] font-black uppercase">Upload</span>
                    </button>
                  )}
                </CldUploadWidget>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 border-t-4 border-black bg-gray-50 gap-3">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="flex-1 rounded-none border-2 border-black font-black uppercase tracking-widest text-[10px] h-11"
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePost}
            disabled={!content.trim() || isPosting}
            className="flex-1 rounded-none bg-black text-white font-black uppercase tracking-widest text-[10px] h-11 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:bg-blue-600 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post Experience ✈️"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
