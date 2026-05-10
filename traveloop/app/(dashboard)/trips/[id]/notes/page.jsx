"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Paperclip, 
  Trash2, 
  Plus, 
  Calendar, 
  MapPin, 
  Search, 
  ChevronDown, 
  Pin, 
  Pencil,
  Clock,
  LayoutGrid,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Loader2,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
} from "@/components/ui/alert-dialog";
import PageTopBar from "@/components/shared/PageTopBar";

// --- Components ---

const NoteCard = ({ note, onEdit, onDelete, onTogglePin, searchQuery }) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <span key={i} className="bg-yellow-200 text-black px-0.5 rounded-sm animate-pulse">{part}</span> 
            : part
        )}
      </>
    );
  };

  const dayDate = note.linkedDay ? `Day ${note.linkedDay}: ${note.createdAt ? format(new Date(note.createdAt), "MMMM dd yyyy") : ""}` : "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl ${
        note.isPinned ? "border-l-[12px] border-l-blue-500" : ""
      }`}
    >
      <div className="absolute top-4 right-4 flex gap-2">
        <button 
          onClick={() => onTogglePin(note)}
          className={`p-2 border-2 border-black rounded-none transition-all ${
            note.isPinned ? "bg-blue-500 text-white" : "bg-white text-black hover:bg-gray-100"
          }`}
          title={note.isPinned ? "Unpin Note" : "Pin Note"}
        >
          <Pin className="h-3.5 w-3.5" />
        </button>
        <button 
          onClick={() => onEdit(note)}
          className="p-2 border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-all rounded-none"
          title="Edit Note"
        >
          <Paperclip className="h-3.5 w-3.5" />
        </button>
        <button 
          onClick={() => setDeleteConfirmOpen(true)}
          className="p-2 border-2 border-black bg-white text-red-600 hover:bg-red-600 hover:text-white transition-all rounded-none"
          title="Delete Note"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="pr-24 space-y-2">
        <h3 className="font-black uppercase italic tracking-tighter text-lg leading-tight">
          {highlightText(note.title || "Untitled Note", searchQuery)}
          {note.stop?.city?.name && (
            <span className="text-gray-400 font-bold ml-2">— {note.stop.city.name} stop</span>
          )}
        </h3>
        <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap leading-relaxed">
          {highlightText(note.content, searchQuery)}
        </p>
        <div className="flex items-center gap-2 pt-2">
          <Clock className="h-3 w-3 text-gray-400" />
          <span className="text-[10px] font-mono font-black uppercase text-gray-400 tracking-widest">
            {dayDate || (note.createdAt ? format(new Date(note.createdAt), "MMMM dd yyyy") : "")}
          </span>
        </div>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase italic tracking-tighter">Delete this note?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-mono uppercase tracking-widest">
              This action cannot be undone. This will permanently remove the note from this trip.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border-2 border-black font-black uppercase tracking-widest text-[10px]">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(note.id)}
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

const NoteDialog = ({ isOpen, onOpenChange, onSubmit, initialData, tripStops }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    linkType: "none", // none, day, stop
    linkedDay: "",
    stopId: "",
    isPinned: false
  });
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        content: initialData.content || "",
        linkType: initialData.linkedDay ? "day" : (initialData.stopId ? "stop" : "none"),
        linkedDay: initialData.linkedDay || "",
        stopId: initialData.stopId || "",
        isPinned: initialData.isPinned || false
      });
      setCharCount(initialData.content?.length || 0);
    } else {
      setFormData({ title: "", content: "", linkType: "none", linkedDay: "", stopId: "", isPinned: false });
      setCharCount(0);
    }
  }, [initialData, isOpen]);

  const handleContentChange = (e) => {
    const val = e.target.value.slice(0, 2000);
    setFormData({ ...formData, content: val });
    setCharCount(val.length);
  };

  const getProgressColor = () => {
    const p = (charCount / 2000) * 100;
    if (p < 33) return "text-gray-300";
    if (p < 66) return "text-yellow-400";
    if (p < 90) return "text-orange-500";
    return "text-red-500";
  };

  const templates = [
    { label: "Hotel Check-in", content: "Check in: [time], Room: [#], Breakfast: [Y/N]" },
    { label: "Flight Details", content: "Flight: [#], Depart: [time], Terminal: [#]" },
    { label: "Restaurant", content: "Restaurant: [name], Reservation: [time], Address: [addr]" },
    { label: "Custom Reminder", content: "" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border-4 border-black rounded-none shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] max-w-lg">
        <DialogHeader className="border-b-2 border-black pb-4 mb-4">
          <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
            {initialData ? "Edit Note" : "Add Note"}
          </DialogTitle>
          <DialogDescription className="text-[10px] font-mono uppercase tracking-widest font-bold">
            Create or modify your trip memory
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase">Title (optional)</label>
            <Input 
              placeholder="e.g. Hotel check-in details" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="rounded-none border-2 border-black font-mono h-12"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase">Note Content *</label>
              <Select onValueChange={(val) => setFormData({ ...formData, content: val })}>
                <SelectTrigger className="w-[160px] h-7 text-[9px] font-black uppercase border-2 border-black rounded-none bg-gray-50">
                  <SelectValue placeholder="Use template:" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-2 border-black">
                  {templates.map(t => (
                    <SelectItem key={t.label} value={t.content} className="text-[10px] font-black uppercase italic">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Textarea 
                placeholder="What do you want to remember?"
                value={formData.content}
                onChange={handleContentChange}
                className="rounded-none border-2 border-black font-mono min-h-[140px] p-4 resize-none"
                required
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <div className="relative w-4 h-4">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-100"
                    />
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={2 * Math.PI * 6}
                      strokeDashoffset={2 * Math.PI * 6 * (1 - charCount / 2000)}
                      className={`${getProgressColor()} transition-all duration-300`}
                    />
                  </svg>
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-400">
                  {charCount}/2000
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase">Link to:</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="linkType" 
                  checked={formData.linkType === "none"} 
                  onChange={() => setFormData({ ...formData, linkType: "none" })}
                  className="w-4 h-4 border-2 border-black rounded-full checked:bg-black appearance-none transition-all"
                />
                <span className="text-[11px] font-black uppercase italic group-hover:text-blue-500">None</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="linkType" 
                  checked={formData.linkType === "day"} 
                  onChange={() => setFormData({ ...formData, linkType: "day" })}
                  className="w-4 h-4 border-2 border-black rounded-full checked:bg-black appearance-none transition-all"
                />
                <span className="text-[11px] font-black uppercase italic group-hover:text-blue-500">Day</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="linkType" 
                  checked={formData.linkType === "stop"} 
                  onChange={() => setFormData({ ...formData, linkType: "stop" })}
                  className="w-4 h-4 border-2 border-black rounded-full checked:bg-black appearance-none transition-all"
                />
                <span className="text-[11px] font-black uppercase italic group-hover:text-blue-500">Stop</span>
              </label>
            </div>

            {formData.linkType === "day" && (
              <div className="flex items-center gap-4 animate-in slide-in-from-left-2">
                <label className="text-[10px] font-black uppercase whitespace-nowrap">Day Number:</label>
                <Input 
                  type="number" 
                  min="1" 
                  placeholder="1"
                  value={formData.linkedDay}
                  onChange={(e) => setFormData({ ...formData, linkedDay: e.target.value })}
                  className="w-24 rounded-none border-2 border-black font-mono h-10"
                />
              </div>
            )}

            {formData.linkType === "stop" && (
              <div className="flex items-center gap-4 animate-in slide-in-from-left-2">
                <label className="text-[10px] font-black uppercase whitespace-nowrap">Stop/City:</label>
                <Select value={formData.stopId} onValueChange={(val) => setFormData({ ...formData, stopId: val })}>
                  <SelectTrigger className="flex-1 rounded-none border-2 border-black font-mono h-10">
                    <SelectValue placeholder="Select City ▼" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-2 border-black">
                    {tripStops.map(stop => (
                      <SelectItem key={stop.id} value={stop.id} className="font-mono text-xs">
                        {stop.city?.name || "Unknown City"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t-2 border-black pt-6 gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-none border-2 border-black font-black uppercase tracking-widest text-[10px] h-12 px-6">
            Cancel
          </Button>
          <Button 
            onClick={() => onSubmit(formData)}
            className="rounded-none bg-black text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:shadow-none transition-all"
          >
            {initialData ? "Save Changes" : "Save Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Page ---

export default function TripNotesPage() {
  const { id: tripId } = useParams();
  const router = useRouter();
  
  const [notes, setNotes] = useState([]);
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, tripsRes, tripRes] = await Promise.all([
          fetch(`/api/trips/${tripId}/notes`),
          fetch("/api/trips"),
          fetch(`/api/trips/${tripId}`)
        ]);
        
        if (notesRes.ok) setNotes(await notesRes.json());
        if (tripsRes.ok) setTrips(await tripsRes.json());
        if (tripRes.ok) setCurrentTrip(await tripRes.json());
      } catch (err) {
        toast.error("Failed to load notes data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tripId]);

  const handleAddNote = async (data) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const newNote = await res.json();
        setNotes([newNote, ...notes]);
        setIsDialogOpen(false);
        toast.success("Note added!");
      }
    } catch (err) {
      toast.error("Failed to add note");
    }
  };

  const handleUpdateNote = async (data) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/notes/${editingNote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setNotes(notes.map(n => n.id === updated.id ? updated : n));
        setEditingNote(null);
        setIsDialogOpen(false);
        toast.success("Note updated!");
      }
    } catch (err) {
      toast.error("Failed to update note");
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/notes/${noteId}`, { method: "DELETE" });
      if (res.ok) {
        setNotes(notes.filter(n => n.id !== noteId));
        toast.success("Note deleted");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleTogglePin = async (note) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !note.isPinned })
      });
      if (res.ok) {
        const updated = await res.json();
        setNotes(notes.map(n => n.id === updated.id ? updated : n));
        toast.success(updated.isPinned ? "Note pinned!" : "Note unpinned");
      }
    } catch (err) {
      toast.error("Failed to pin note");
    }
  };

  const filteredNotes = useMemo(() => {
    let result = notes.filter(n => 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sorting
    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "day") return (a.linkedDay || 999) - (b.linkedDay || 999);
      if (sortBy === "alphabetical") return (a.title || "").localeCompare(b.title || "");
      return 0;
    });

    return result;
  }, [notes, searchQuery, sortBy]);

  const groupedNotes = useMemo(() => {
    if (activeTab === "all") return [{ label: "All Notes", key: "all", items: filteredNotes }];

    if (activeTab === "day") {
      const days = {};
      filteredNotes.forEach(n => {
        const d = n.linkedDay || "Unlinked";
        if (!days[d]) days[d] = [];
        days[d].push(n);
      });
      return Object.keys(days).sort((a, b) => {
        if (a === "Unlinked") return 1;
        if (b === "Unlinked") return -1;
        return parseInt(a) - parseInt(b);
      }).map(d => ({
        label: d === "Unlinked" ? "Unlinked Notes" : `Day ${d} — ${currentTrip?.startDate ? format(addDays(new Date(currentTrip.startDate), parseInt(d)-1), "MMMM dd, yyyy") : ""}`,
        key: `day-${d}`,
        items: days[d]
      }));
    }

    if (activeTab === "stop") {
      const stops = {};
      filteredNotes.forEach(n => {
        const s = n.stop?.city?.name || "Unlinked";
        if (!stops[s]) stops[s] = [];
        stops[s].push(n);
      });
      return Object.keys(stops).sort().map(s => ({
        label: s === "Unlinked" ? "Other Notes" : `🏙️ ${s}`,
        key: `stop-${s}`,
        items: stops[s]
      }));
    }

    return [];
  }, [filteredNotes, activeTab, currentTrip]);

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 lg:px-6 py-8 space-y-10">
        
        {/* Search & Filter Bar */}
        <PageTopBar 
          onSearch={setSearchQuery}
          searchPlaceholder="Search notes by title or content..."
          groupByOptions={[
            { label: "All", value: "all" },
            { label: "By Day", value: "day" },
            { label: "By Stop", value: "stop" }
          ]}
          onGroupBy={setActiveTab}
          sortOptions={[
            { label: "Newest First", value: "newest" },
            { label: "Oldest First", value: "oldest" },
            { label: "By Day Number", value: "day" },
            { label: "Alphabetical", value: "alphabetical" }
          ]}
          onSort={setSortBy}
        />

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none border-l-8 border-black pl-4">
              Trip Notes
            </h2>
            
            <div className="flex items-center gap-3">
              <Select value={tripId} onValueChange={(val) => router.push(`/trips/${val}/notes`)}>
                <SelectTrigger className="w-[280px] h-12 border-4 border-black rounded-none bg-white font-black uppercase italic text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <SelectValue placeholder="Select Trip ↓" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-2 border-black">
                  {trips.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-xs font-bold uppercase">
                      Trip: {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={() => { setEditingNote(null); setIsDialogOpen(true); }}
                className="h-12 border-4 border-black rounded-none bg-white text-black font-black uppercase italic text-xs px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:shadow-none transition-all"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Note
              </Button>
            </div>
          </div>

          {/* Tab Pills */}
          <div className="flex gap-2">
            {[
              { id: "all", label: "All" },
              { id: "day", label: "by Day" },
              { id: "stop", label: "by stop" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 border-2 border-black text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? "bg-black text-white shadow-none" 
                    : "bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-12 pb-20">
          {loading ? (
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-100 border-4 border-black animate-pulse shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]" />
              ))}
            </div>
          ) : groupedNotes.length > 0 && groupedNotes[0].items.length > 0 ? (
            groupedNotes.map((group) => (
              <div key={group.key} className="space-y-6">
                {activeTab !== "all" && (
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black border-b-4 border-blue-500 pb-1">
                      {group.label}
                    </h3>
                    <div className="flex-1 h-0.5 bg-black/5" />
                    <span className="text-[10px] font-mono text-gray-400">{group.items.length} items</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                  <AnimatePresence mode="popLayout">
                    {group.items.map((note) => (
                      <NoteCard 
                        key={note.id} 
                        note={note} 
                        onEdit={(n) => { setEditingNote(n); setIsDialogOpen(true); }}
                        onDelete={handleDeleteNote}
                        onTogglePin={handleTogglePin}
                        searchQuery={searchQuery}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center border-4 border-dashed border-gray-200 bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]">
              <Sparkles className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-gray-300">No notes found</h3>
              <p className="text-xs font-bold text-gray-400 uppercase mt-2">
                {searchQuery ? `No results for "${searchQuery}"` : "Start capturing your trip memories"}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  variant="link" 
                  className="mt-4 text-blue-500 font-black uppercase italic text-xs underline decoration-2 underline-offset-4"
                >
                  Create your first note →
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <NoteDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={editingNote ? handleUpdateNote : handleAddNote}
        initialData={editingNote}
        tripStops={currentTrip?.stops || []}
      />
    </div>
  );
}
