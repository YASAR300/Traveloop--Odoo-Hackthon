"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Calendar as CalendarIcon, 
  DollarSign, 
  Save,
  X,
  Plane,
  Hotel,
  Utensils,
  Target,
  FileText,
  Link as LinkIcon,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Eye,
  Share2,
  MoreVertical,
  ArrowRight,
  Loader2
} from "lucide-react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// --- Constants & Enums ---

const SECTION_TYPES = [
  { id: "TRAVEL", label: "Travel", icon: Plane, color: "bg-blue-500" },
  { id: "HOTEL", label: "Hotel", icon: Hotel, color: "bg-purple-500" },
  { id: "FOOD", label: "Food", icon: Utensils, color: "bg-orange-500" },
  { id: "ACTIVITY", label: "Activity", icon: Target, color: "bg-green-500" },
  { id: "GENERAL", label: "General", icon: FileText, color: "bg-gray-500" },
];

const BUDGET_CATEGORIES = [
  "TRANSPORT", "HOTEL", "ACTIVITY", "FOOD", "STAY", "MISCELLANEOUS"
];

// --- Sub-components ---

const BudgetDialog = ({ section, onSaveBudget }) => {
  const [items, setItems] = useState(section.sectionBudgets || []);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setItems(section.sectionBudgets || []);
  }, [section.sectionBudgets]);

  const addItem = () => {
    setItems([...items, { 
      id: `temp-${Date.now()}`,
      category: "MISCELLANEOUS", 
      description: "", 
      unitCost: 0, 
      quantity: 1, 
      amount: 0 
    }]);
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === "unitCost" || field === "quantity") {
          updated.amount = (parseFloat(updated.unitCost) || 0) * (parseInt(updated.quantity) || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const deleteItem = (id) => setItems(items.filter(i => i.id !== id));

  const total = items.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const handleSave = async () => {
    await onSaveBudget(section.id, items);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex-1 h-11 border-2 border-black rounded-none bg-white font-black text-[10px] uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2"
        >
          <DollarSign className="h-3 w-3" />
          Budget: ₹{total.toLocaleString()}
          {total > 0 && <div className="w-2 h-2 rounded-full bg-green-500" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b-4 border-black bg-gray-50">
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-2">
            <DollarSign className="h-6 w-6" /> Section Budget — {section.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          <div className="space-y-3">
            {items.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-2 border-black bg-white relative group overflow-hidden"
              >
                {/* Line 1: Category & Description */}
                <div className="grid grid-cols-12 border-b-2 border-black">
                  <div className="col-span-4 border-r-2 border-black bg-gray-50">
                    <Select value={item.category} onValueChange={(v) => updateItem(item.id, "category", v)}>
                      <SelectTrigger className="h-10 border-0 rounded-none font-bold text-[9px] px-2 bg-transparent focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black rounded-none">
                        {BUDGET_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat} className="text-[10px] font-bold">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-8">
                    <Input 
                      placeholder="Item name / Description" 
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="h-10 border-0 rounded-none text-[10px] font-bold focus-visible:ring-0"
                    />
                  </div>
                </div>

                {/* Line 2: Cost, Qty, Total */}
                <div className="grid grid-cols-12 h-10">
                  <div className="col-span-5 border-r-2 border-black flex items-center bg-white px-2">
                    <span className="text-[9px] font-black text-gray-400 mr-1">COST:</span>
                    <Input 
                      type="number"
                      value={item.unitCost}
                      onChange={(e) => updateItem(item.id, "unitCost", e.target.value)}
                      className="h-full border-0 rounded-none text-[10px] font-black focus-visible:ring-0 p-0"
                    />
                  </div>
                  <div className="col-span-3 border-r-2 border-black flex items-center bg-white px-2">
                    <span className="text-[9px] font-black text-gray-400 mr-1">QTY:</span>
                    <Input 
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                      className="h-full border-0 rounded-none text-[10px] font-black text-center focus-visible:ring-0 p-0"
                    />
                  </div>
                  <div className="col-span-4 flex items-center justify-between px-2 bg-gray-50">
                    <span className="text-[11px] font-black italic">₹{item.amount.toLocaleString()}</span>
                    <button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Button 
            variant="outline" 
            onClick={addItem}
            className="w-full h-12 border-2 border-dashed border-black rounded-none font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 bg-gray-50/50"
          >
            <Plus className="h-3 w-3 mr-2" /> Add Another Item
          </Button>
        </div>
        
        <DialogFooter className="p-6 border-t-4 border-black bg-white">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-gray-400">Section Total:</span>
              <span className="text-2xl font-black">₹{total.toLocaleString()}</span>
            </div>
            <Button onClick={handleSave} className="bg-black text-white rounded-none font-black uppercase italic h-12 px-8 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:shadow-none transition-all">
              Save Budget
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SectionCard = ({ section, index, onUpdate, onDelete, onSaveBudget, onAiFill }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(section.title || `Section ${index + 1}`);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (tempTitle !== section.title) {
      onUpdate(section.id, { title: tempTitle });
    }
  };

  const handleAiFill = async () => {
    setIsAiLoading(true);
    try {
      const userInput = window.prompt("What is this section about? (e.g., Flight from Mumbai to Bali)");
      if (userInput) {
        await onAiFill(section.id, userInput);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const currentType = SECTION_TYPES.find(t => t.id === section.sectionType) || SECTION_TYPES[4];

  return (
    <motion.div 
      ref={setNodeRef} 
      style={style}
      layout
      className={cn(
        "group relative bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6 transition-all",
        section.isPlanned && "border-l-[12px] border-l-green-500",
        isDragging && "opacity-50 scale-95 shadow-none"
      )}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-8 h-12 bg-black flex items-center justify-center cursor-grab active:cursor-grabbing text-white"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Top Header Actions */}
      <div className="p-6 pb-0 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onUpdate(section.id, { isPlanned: !section.isPlanned })}
            className={cn(
              "flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 transition-all",
              section.isPlanned ? "bg-green-500 border-green-500 text-white" : "border-gray-200 text-gray-400 hover:border-black hover:text-black"
            )}
          >
            <CheckCircle2 className="h-3 w-3" />
            {section.isPlanned ? "Planned ✓" : "Mark as Planned"}
          </button>
          
          <div className="flex items-center bg-gray-100 border-2 border-black p-0.5">
            {SECTION_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => onUpdate(section.id, { sectionType: type.id })}
                className={cn(
                  "p-1.5 transition-all hover:bg-white",
                  section.sectionType === type.id ? "bg-black text-white" : "text-gray-400"
                )}
                title={type.label}
              >
                <type.icon className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn("px-2 py-0.5 text-[8px] font-black uppercase text-white", currentType.color)}>
            {currentType.label}
          </div>
          <button 
            onClick={() => onDelete(section.id)}
            className="text-gray-300 hover:text-red-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6 pl-12">
        {/* Title */}
        <div className="mb-4">
          {isEditingTitle ? (
            <Input 
              autoFocus
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
              className="text-2xl font-black uppercase italic tracking-tighter border-2 border-black rounded-none h-12 bg-blue-50"
            />
          ) : (
            <h3 
              onClick={() => setIsEditingTitle(true)}
              className="text-2xl font-black uppercase italic tracking-tighter border-2 border-transparent hover:border-dashed hover:border-gray-300 px-1 cursor-text transition-all"
            >
              {section.title || `Section ${index + 1}:`}
            </h3>
          )}
        </div>

        {/* Description */}
        <div className="relative group/desc">
          <Textarea 
            placeholder="Add notes, plans, or any info for this section..."
            className="min-h-[80px] border-2 border-black rounded-none font-bold text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all mb-4 resize-none"
            value={section.description || ""}
            onChange={(e) => onUpdate(section.id, { description: e.target.value })}
          />
          {(!section.description && !isAiLoading) && (
            <button 
              onClick={handleAiFill}
              className="absolute top-2 right-2 flex items-center gap-2 bg-black text-white px-3 py-1.5 text-[9px] font-black uppercase italic hover:bg-blue-600 transition-all opacity-0 group-hover/desc:opacity-100"
            >
              <Sparkles className="h-3 w-3" /> Auto-fill with AI
            </button>
          )}
          {isAiLoading && (
            <div className="absolute top-2 right-2 flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 text-[9px] font-black uppercase italic">
              <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
            </div>
          )}
        </div>

        {/* Attachment URL Chip */}
        {section.attachmentUrl && (
          <a 
            href={section.attachmentUrl} 
            target="_blank" 
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-black mb-4 group/chip hover:bg-blue-50 transition-colors"
          >
            <LinkIcon className="h-3 w-3 text-blue-600" />
            <span className="text-[10px] font-bold text-gray-600 truncate max-w-[200px]">
              {section.attachmentUrl.replace(/(^\w+:|^)\/\//, '').split('/')[0]} — Resource
            </span>
            <ArrowRight className="h-3 w-3 opacity-0 group-hover/chip:opacity-100 transition-opacity" />
          </a>
        )}

        {/* Bottom Bar: Day, Dates & Budget */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Day Selector */}
          <div className="flex-1 flex items-center bg-gray-50 border-2 border-black">
            <div className="px-3 border-r-2 border-black flex items-center justify-center h-full bg-white">
              <span className="text-[10px] font-black uppercase italic tracking-tighter">Day</span>
            </div>
            <Select 
              value={section.startDate ? Math.floor((new Date(section.startDate) - new Date(section.trip?.startDate || section.startDate)) / (1000 * 60 * 60 * 24)) + 1 : 1}
              onValueChange={(day) => {
                const tripStart = new Date(section.trip?.startDate || section.startDate);
                const newDate = new Date(tripStart);
                newDate.setDate(newDate.getDate() + (parseInt(day) - 1));
                onUpdate(section.id, { 
                  startDate: newDate.toISOString(), 
                  endDate: newDate.toISOString() 
                });
              }}
            >
              <SelectTrigger className="flex-1 h-11 border-0 rounded-none font-black text-xs focus:ring-0">
                <SelectValue placeholder="Select Day" />
              </SelectTrigger>
              <SelectContent className="border-2 border-black rounded-none">
                {Array.from({ length: 15 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()} className="text-xs font-bold">
                    Day {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex-1 flex items-center gap-3 px-4 h-11 bg-gray-50 border-2 border-black hover:bg-white transition-all text-left">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 leading-none">Custom Date</span>
                  <span className="text-[10px] font-black uppercase">
                    {section.startDate ? format(new Date(section.startDate), "dd MMM") : "Start"} 
                    {" → "} 
                    {section.endDate ? format(new Date(section.endDate), "dd MMM, yyyy") : "End"}
                  </span>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <Calendar
                mode="range"
                selected={{
                  from: section.startDate ? new Date(section.startDate) : undefined,
                  to: section.endDate ? new Date(section.endDate) : undefined
                }}
                onSelect={(range) => onUpdate(section.id, { 
                  startDate: range?.from?.toISOString(), 
                  endDate: range?.to?.toISOString() 
                })}
              />
            </PopoverContent>
          </Popover>

          <BudgetDialog 
            section={section} 
            onSaveBudget={onSaveBudget}
          />

          <button 
            onClick={() => {
              const url = prompt("Paste your booking/resource link here:");
              if (url) onUpdate(section.id, { attachmentUrl: url });
            }}
            className="w-11 h-11 border-2 border-black bg-white flex items-center justify-center hover:bg-gray-100 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Page Component ---

export default function AdvancedItineraryPage() {
  const params = useParams();
  const router = useRouter();
  const { id: tripId } = params;
  
  const [trip, setTrip] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle, saving, saved
  const [viewMode, setViewMode] = useState("list"); // list or days

  const dayGroups = useMemo(() => {
    if (!trip?.startDate) return { "Unscheduled": sections };
    const groups = {};
    const tripStart = new Date(trip.startDate);
    
    sections.forEach(s => {
      let label = "Unscheduled";
      if (s.startDate) {
        const diff = Math.floor((new Date(s.startDate) - tripStart) / (1000 * 60 * 60 * 24)) + 1;
        label = diff > 0 ? `Day ${diff}` : "Day 1";
      }
      if (!groups[label]) groups[label] = [];
      groups[label].push(s);
    });
    return groups;
  }, [sections, trip]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Data Fetching ---

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionsRes, allTripsRes] = await Promise.all([
          fetch(`/api/trips/${tripId}/sections`),
          fetch("/api/trips")
        ]);

        if (sectionsRes.ok) {
          const data = await sectionsRes.json();
          setSections(data);
        }

        if (allTripsRes.ok) {
          const allTrips = await allTripsRes.json();
          const currentTrip = allTrips.find(t => t.id === tripId);
          setTrip(currentTrip);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tripId]);

  // --- Handlers ---

  const addSection = async (template = null) => {
    const defaultTitle = template ? template.title : `Section ${sections.length + 1}`;
    const defaultType = template ? template.type : "GENERAL";
    
    try {
      const res = await fetch(`/api/trips/${tripId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: defaultTitle,
          sectionType: defaultType,
          order: sections.length,
          startDate: trip?.startDate,
          endDate: trip?.endDate,
        })
      });
      
      if (res.ok) {
        const newSection = await res.json();
        setSections([...sections, { ...newSection, sectionBudgets: [] }]);
        toast.success(`Added: ${defaultTitle}`);
      }
    } catch (err) {
      toast.error("Failed to add section");
    }
  };

  const updateSection = async (sectionId, updates) => {
    setSaveStatus("saving");
    // Optimistic update
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, ...updates } : s));
    
    try {
      await fetch(`/api/trips/${tripId}/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      setTimeout(() => setSaveStatus("saved"), 1000);
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("idle");
      toast.error("Auto-save failed");
    }
  };

  const deleteSection = async (sectionId) => {
    if (!confirm("Remove this section?")) return;
    try {
      const res = await fetch(`/api/trips/${tripId}/sections/${sectionId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSections(sections.filter(s => s.id !== sectionId));
        toast.success("Deleted successfully");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const saveBudget = async (sectionId, budgetItems) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/sections/${sectionId}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: budgetItems })
      });
      
      if (res.ok) {
        setSections(prev => prev.map(s => 
          s.id === sectionId ? { ...s, sectionBudgets: budgetItems } : s
        ));
        toast.success("Budget updated");
      }
    } catch (err) {
      toast.error("Budget save failed");
    }
  };

  const handleAiFill = async (sectionId, promptText) => {
    try {
      const res = await fetch("/api/ai/section-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: promptText,
          tripContext: { 
            name: trip?.name || "My Trip", 
            dates: trip?.startDate ? `${trip.startDate} to ${trip.endDate}` : "Flexible dates" 
          }
        })
      });
      
      if (res.ok) {
        const aiData = await res.json();
        updateSection(sectionId, {
          title: aiData.suggestedTitle,
          description: aiData.suggestedDescription,
          sectionType: aiData.sectionType
        });
        toast.success("AI pre-filled the details!");
      }
    } catch (err) {
      toast.error("AI Assistant busy");
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);
      
      try {
        await fetch(`/api/trips/${tripId}/sections/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds: newSections.map(s => s.id) })
        });
      } catch (err) {
        toast.error("Reordering failed");
      }
    }
  };

  // --- Computed Stats ---

  const totalPlannedBudget = useMemo(() => {
    return sections.reduce((acc, s) => {
      return acc + (s.sectionBudgets?.reduce((a, c) => a + c.amount, 0) || 0);
    }, 0);
  }, [sections]);

  const plannedCount = sections.filter(s => s.isPlanned).length;
  const progressPercent = sections.length > 0 ? Math.round((plannedCount / sections.length) * 100) : 0;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
      <span className="font-black uppercase italic tracking-tighter">Initialising Masterplan...</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 pb-40 flex flex-col lg:flex-row gap-10">
      {/* Left Column: Builder */}
      <div className="flex-1 max-w-4xl">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-8 bg-blue-500" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">ITINERARY_BUILDER // LIVE_SYNC</span>
                <h1 className="text-4xl font-black text-black uppercase italic tracking-tighter leading-none">{trip?.name}</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex border-2 border-black p-1 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <button 
                  onClick={() => setViewMode("list")}
                  className={cn("px-3 py-1 text-[10px] font-black uppercase italic transition-all", viewMode === "list" ? "bg-black text-white" : "hover:bg-gray-50")}
                >List</button>
                <button 
                  onClick={() => setViewMode("days")}
                  className={cn("px-3 py-1 text-[10px] font-black uppercase italic transition-all", viewMode === "days" ? "bg-black text-white" : "hover:bg-gray-50")}
                >Days</button>
              </div>
              <Button variant="outline" className="border-2 border-black rounded-none h-10 px-4">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-white border-2 border-black p-4 mb-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest">{plannedCount} of {sections.length} Sections Planned</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{progressPercent}% COMPLETE</span>
            </div>
            <div className="h-4 bg-gray-100 border-2 border-black relative overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="absolute inset-0 bg-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sections List */}
        {viewMode === "list" ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <LayoutGroup>
                {sections.map((section, index) => (
                  <SectionCard 
                    key={section.id} 
                    section={section} 
                    index={index}
                    onUpdate={updateSection}
                    onDelete={deleteSection}
                    onSaveBudget={saveBudget}
                    onAiFill={handleAiFill}
                  />
                ))}
              </LayoutGroup>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="space-y-12">
            {Object.entries(dayGroups).sort(([a],[b]) => a.localeCompare(b)).map(([day, daySections]) => (
              <div key={day} className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xl font-black uppercase italic tracking-tighter bg-black text-white px-4 py-1">{day}</h2>
                  <div className="h-0.5 flex-1 bg-black/10" />
                  <span className="text-[10px] font-bold text-gray-400">₹{daySections.reduce((acc, s) => acc + (s.sectionBudgets?.reduce((a,c) => a+c.amount,0) || 0), 0).toLocaleString()}</span>
                </div>
                <div className="space-y-4">
                  {daySections.map((section, index) => (
                    <SectionCard 
                      key={section.id} 
                      section={section} 
                      index={index}
                      onUpdate={updateSection}
                      onDelete={deleteSection}
                      onSaveBudget={saveBudget}
                      onAiFill={handleAiFill}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Templates Row */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button 
          onClick={() => addSection({ title: "Flight", type: "TRAVEL" })}
          variant="outline" 
          className="h-10 border-2 border-black rounded-none font-black text-[9px] uppercase tracking-widest hover:bg-blue-50"
        >
          <Plane className="h-3 w-3 mr-2" /> Flight Template
        </Button>
        <Button 
          onClick={() => addSection({ title: "Hotel Stay", type: "HOTEL" })}
          variant="outline" 
          className="h-10 border-2 border-black rounded-none font-black text-[9px] uppercase tracking-widest hover:bg-purple-50"
        >
          <Hotel className="h-3 w-3 mr-2" /> Hotel Template
        </Button>
        <Button 
          onClick={() => addSection({ title: "Dining", type: "FOOD" })}
          variant="outline" 
          className="h-10 border-2 border-black rounded-none font-black text-[9px] uppercase tracking-widest hover:bg-orange-50"
        >
          <Utensils className="h-3 w-3 mr-2" /> Food Template
        </Button>
        <Button 
          onClick={() => addSection({ title: "Activity", type: "ACTIVITY" })}
          variant="outline" 
          className="h-10 border-2 border-black rounded-none font-black text-[9px] uppercase tracking-widest hover:bg-green-50"
        >
          <Target className="h-3 w-3 mr-2" /> Activity Template
        </Button>

        {/* Add Section Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => addSection()}
          className="w-full h-24 border-4 border-black border-dashed flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-black hover:border-solid hover:bg-gray-50 transition-all mb-12"
        >
          <Plus className="h-8 w-8" />
          <span className="text-xs font-black uppercase tracking-widest">Add Another Section</span>
        </motion.button>
      </div>

      </div>

      {/* Right Column: Preview Sidebar */}
      <aside className="hidden lg:block w-80">
        <div className="sticky top-24 space-y-6">
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" /> Live Preview
            </h3>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {sections.length === 0 ? (
                <div className="py-10 text-center text-[10px] font-bold text-gray-400 uppercase italic">
                  No places added yet
                </div>
              ) : (
                sections.map((s, i) => (
                  <div key={s.id} className="flex gap-3 group">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full border-2 border-black bg-white group-hover:bg-blue-500 transition-all" />
                      {i < sections.length - 1 && <div className="w-0.5 flex-1 bg-black" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-[10px] font-black uppercase italic leading-none truncate">{s.title || "Untitled Section"}</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">
                        {s.sectionType} • ₹{(s.sectionBudgets?.reduce((a,c) => a+c.amount,0) || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-6 border-t-2 border-black space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-gray-400">Total Planned</span>
                <span className="text-lg font-black">₹{totalPlannedBudget.toLocaleString()}</span>
              </div>
              <Button asChild className="w-full bg-black text-white rounded-none font-black uppercase italic h-12 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] hover:shadow-none transition-all">
                <Link href={`/trips/${tripId}/view`}>Final Preview →</Link>
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-black p-4">
            <h4 className="text-[10px] font-black uppercase mb-2 flex items-center gap-2">
              <Sparkles className="h-3 w-3" /> Quick Tips
            </h4>
            <p className="text-[9px] font-bold text-blue-800 leading-relaxed uppercase">
              Use templates to quickly add flights or hotels. Group by "Days" to see your chronological flow.
            </p>
          </div>
        </div>
      </aside>

      {/* Cost Heatmap (Sticky Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-md border-t-4 border-black z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Budget Distribution Heatmap</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Total: ₹{totalPlannedBudget.toLocaleString()}</span>
          </div>
          <div className="h-3 flex border-2 border-black overflow-hidden">
            {sections.map(section => {
              const secTotal = section.sectionBudgets?.reduce((a, c) => a + c.amount, 0) || 0;
              const width = totalPlannedBudget > 0 ? (secTotal / totalPlannedBudget) * 100 : 0;
              const typeColor = SECTION_TYPES.find(t => t.id === section.sectionType)?.color || "bg-gray-300";
              
              if (width === 0) return null;
              
              return (
                <motion.div 
                  key={section.id}
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  className={cn("h-full border-r border-black/20 last:border-0", typeColor)}
                  title={`${section.title}: ₹${secTotal}`}
                />
              );
            })}
            {totalPlannedBudget === 0 && <div className="w-full bg-gray-100" />}
          </div>
          <div className="flex items-center gap-4 mt-2 overflow-x-auto pb-1 no-scrollbar">
            {SECTION_TYPES.map(type => (
              <div key={type.id} className="flex items-center gap-1.5 whitespace-nowrap">
                <div className={cn("w-2 h-2", type.color)} />
                <span className="text-[8px] font-black uppercase text-gray-400">{type.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
