"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  FileText, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Search, 
  Clock, 
  Pin, 
  Star,
  StickyNote,
  MoreVertical,
  Save,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

export default function TripNotesPage() {
  const { id: tripId } = useParams();
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [tripId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.content.trim()) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/trips/${tripId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote)
      });
      if (res.ok) {
        const created = await res.json();
        setNotes(prev => [created, ...prev]);
        setNewNote({ title: "", content: "" });
        setIsCreating(false);
        toast.success("Note saved! 📝");
      }
    } catch (err) {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/notes?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== id));
        toast.success("Note removed");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-black border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black pb-8">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="rounded-none border-2 border-transparent hover:border-black p-0 h-auto hover:bg-transparent -ml-1 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Trip</span>
          </Button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2 block">KNOWLEDGE_BASE // TRIP_LOG</span>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              Trip <span className="text-gray-300">Notes</span>
            </h1>
          </div>
        </div>

        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-black text-white rounded-none font-black uppercase italic px-8 h-14 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:shadow-none transition-all"
        >
          <Plus className="h-4 w-4 mr-2" /> New Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* New Note Creator */}
        <AnimatePresence>
          {isCreating && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(59,130,246,1)] h-fit"
            >
              <form onSubmit={handleAddNote} className="space-y-4">
                <Input 
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Entry Title (optional)" 
                  className="rounded-none border-2 border-black font-black uppercase italic tracking-tighter h-12"
                />
                <Textarea 
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="What's on your mind? Flight info, hidden spots, reminders..." 
                  className="rounded-none border-2 border-black font-mono min-h-[160px] resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving} className="flex-1 bg-black text-white rounded-none font-black uppercase italic h-12">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Note"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreating(false)}
                    className="border-2 border-black rounded-none font-black uppercase italic px-4"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Grid */}
        <AnimatePresence mode="popLayout">
          {notes.map((note) => (
            <motion.div 
              key={note.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex flex-col min-h-[220px]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-8 h-8 bg-gray-50 border-2 border-black flex items-center justify-center">
                  <StickyNote className="h-4 w-4 text-gray-400" />
                </div>
                <button 
                  onClick={() => deleteNote(note.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {note.title && (
                <h3 className="text-xl font-black uppercase italic tracking-tighter leading-tight mb-2">
                  {note.title}
                </h3>
              )}
              
              <p className="text-sm font-bold text-gray-600 leading-relaxed whitespace-pre-wrap flex-1">
                {note.content}
              </p>

              <div className="mt-6 pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                <span className="text-[9px] font-mono text-gray-400 uppercase">
                  {format(new Date(note.createdAt), "dd MMM yyyy")}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">
                  #MEMO_{note.id.slice(-4).toUpperCase()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {notes.length === 0 && !isCreating && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center border-4 border-black border-dashed bg-gray-50/50">
            <FileText className="h-16 w-16 text-gray-200 mb-4" />
            <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-300 italic">No field notes captured yet.</p>
            <Button 
              onClick={() => setIsCreating(true)}
              variant="link" 
              className="mt-4 text-[10px] font-black uppercase text-blue-600 p-0 h-auto"
            >
              Start Journaling →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}