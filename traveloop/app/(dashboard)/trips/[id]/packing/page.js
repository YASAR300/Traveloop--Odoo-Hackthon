"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ShoppingBag, 
  Backpack, 
  Utensils, 
  Laptop, 
  Shirt, 
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Circle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const CATEGORIES = [
  { value: "CLOTHING", label: "Clothing", icon: Shirt, color: "text-blue-500" },
  { value: "ELECTRONICS", label: "Electronics", icon: Laptop, color: "text-purple-500" },
  { value: "TOILETRIES", label: "Toiletries", icon: ShoppingBag, color: "text-orange-500" },
  { value: "DOCUMENTS", label: "Documents", icon: FileText, color: "text-red-500" },
  { value: "OTHER", label: "Other Essentials", icon: Backpack, color: "text-gray-500" },
];

export default function TripPackingPage() {
  const { id: tripId } = useParams();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("CLOTHING");
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}/packing`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      toast.error("Failed to load packing list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [tripId]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      const res = await fetch(`/api/trips/${tripId}/packing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItemName, category: selectedCategory })
      });
      if (res.ok) {
        const newItem = await res.json();
        setItems(prev => [...prev, newItem]);
        setNewItemName("");
        toast.success("Added to list!");
      }
    } catch (err) {
      toast.error("Failed to add item");
    }
  };

  const toggleItem = async (item) => {
    // Optimistic update
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, isPacked: !i.isPacked } : i));
    
    try {
      await fetch(`/api/trips/${tripId}/packing`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isPacked: !item.isPacked })
      });
    } catch (err) {
      toast.error("Failed to update item");
      // Revert on error
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isPacked: item.isPacked } : i));
    }
  };

  const deleteItem = async (id) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/packing?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const packedCount = items.filter(i => i.isPacked).length;
  const progress = items.length > 0 ? (packedCount / items.length) * 100 : 0;

  const groupedItems = useMemo(() => {
    const groups = {};
    items.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [items]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-black border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 pb-32">
      {/* Header */}
      <div className="space-y-6 border-b-4 border-black pb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="rounded-none border-2 border-transparent hover:border-black p-0 h-auto hover:bg-transparent -ml-1 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Trip</span>
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2 block">EQUIPMENT_LOG // V1.0</span>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              Packing <span className="text-gray-300">List</span>
            </h1>
          </div>
          
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[200px]">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest">Readiness</span>
              <span className="text-xs font-black italic">{Math.round(progress)}% Packed</span>
            </div>
            <Progress value={progress} className="h-2 rounded-none border border-black bg-gray-100 [&>div]:bg-green-500" />
          </div>
        </div>
      </div>

      {/* Add Item Bar */}
      <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Input 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add new essential item..." 
            className="h-14 rounded-none border-2 border-black font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
          />
        </div>
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-14 rounded-none border-2 border-black font-black uppercase italic text-[10px] tracking-widest px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all bg-white"
        >
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <Button type="submit" className="h-14 bg-black text-white rounded-none font-black uppercase italic px-8 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:shadow-none transition-all">
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </form>

      {/* Checklist Sections */}
      <div className="space-y-12">
        {CATEGORIES.map((cat) => {
          const catItems = groupedItems[cat.value] || [];
          if (catItems.length === 0 && items.length > 0) return null;

          return (
            <div key={cat.value} className="space-y-4">
              <div className="flex items-center gap-4">
                <cat.icon className={`h-5 w-5 ${cat.color}`} />
                <h3 className="text-sm font-black uppercase tracking-widest">{cat.label}</h3>
                <div className="flex-1 border-t-2 border-dashed border-gray-200" />
                <span className="text-[10px] font-mono text-gray-400">{catItems.length} items</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {catItems.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`flex items-center justify-between p-4 border-2 border-black transition-all group ${
                        item.isPacked ? "bg-gray-50 opacity-60" : "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                      }`}
                    >
                      <div 
                        className="flex items-center gap-3 cursor-pointer flex-1"
                        onClick={() => toggleItem(item)}
                      >
                        {item.isPacked ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300" />
                        )}
                        <span className={`text-xs font-bold uppercase tracking-tight ${item.isPacked ? "line-through text-gray-400" : "text-black"}`}>
                          {item.name}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {catItems.length === 0 && (
                  <div className="col-span-full py-8 border-2 border-black border-dashed flex flex-col items-center justify-center opacity-30">
                    <span className="text-[10px] font-black uppercase">No items in {cat.label}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center border-4 border-black border-dashed">
            <Backpack className="h-12 w-12 text-gray-300 mb-4 animate-bounce" />
            <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Your packing list is empty.</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase mt-2">Start adding items above to stay organized!</p>
          </div>
        )}
      </div>
    </div>
  );
}