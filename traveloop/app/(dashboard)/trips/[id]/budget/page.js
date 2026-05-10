"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  DollarSign, 
  PieChart, 
  ArrowLeft, 
  Plus, 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Receipt,
  AlertCircle,
  ChevronRight,
  Plane,
  Hotel,
  Utensils,
  Target,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

const CATEGORIES = {
  TRANSPORT: { icon: Plane, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  HOTEL: { icon: Hotel, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200" },
  FOOD: { icon: Utensils, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
  ACTIVITY: { icon: Target, color: "text-green-500", bg: "bg-green-50", border: "border-green-200" },
  MISCELLANEOUS: { icon: FileText, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
};

export default function TripBudgetPage() {
  const { id: tripId } = useParams();
  const router = useRouter();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBudget = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}/sections`);
      if (res.ok) {
        const data = await res.json();
        setSections(data);
      }
    } catch (err) {
      toast.error("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [tripId]);

  const allBudgets = useMemo(() => {
    const list = [];
    sections.forEach(s => {
      s.sectionBudgets?.forEach(b => {
        list.push({ ...b, sectionTitle: s.title });
      });
    });
    return list;
  }, [sections]);

  const totalSpent = useMemo(() => allBudgets.reduce((acc, b) => acc + b.amount, 0), [allBudgets]);
  
  const byCategory = useMemo(() => {
    const cats = {};
    allBudgets.forEach(b => {
      cats[b.category] = (cats[b.category] || 0) + b.amount;
    });
    return cats;
  }, [allBudgets]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
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
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2 block">FINANCIAL_MODULE // ALPHA</span>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              Budget <span className="text-gray-300">Tracker</span>
            </h1>
          </div>
        </div>

        <div className="bg-black text-white p-6 shadow-[8px_8px_0px_0px_rgba(59,130,246,1)] min-w-[280px]">
          <span className="text-[10px] font-black uppercase text-gray-400 block mb-1 tracking-widest">Total Estimated Cost</span>
          <div className="text-4xl font-black tracking-tighter italic">₹{totalSpent.toLocaleString()}</div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Summary & Charts */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-sm font-black uppercase italic mb-6 flex items-center gap-2">
              <PieChart className="h-4 w-4" /> Category Breakdown
            </h3>
            
            <div className="space-y-6">
              {Object.entries(CATEGORIES).map(([key, config]) => {
                const amount = byCategory[key] || 0;
                const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <config.icon className={`h-3 w-3 ${config.color}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{key}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold italic">₹{amount.toLocaleString()}</span>
                    </div>
                    <Progress value={percentage} className={`h-2 rounded-none border border-black bg-gray-100 ${config.bg} [&>div]:bg-current ${config.color}`} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-black border-dashed p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-1 shrink-0" />
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase">Budget Insight</h4>
                <p className="text-xs font-bold leading-relaxed text-blue-800">
                  Your <span className="underline decoration-2">Transport</span> costs are currently 45% of your total budget. Consider booking flights early to save more.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detailed List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-black">
              All Expenses
            </h3>
            <span className="text-[10px] font-mono text-gray-400">{allBudgets.length} items</span>
          </div>

          <div className="space-y-4">
            {allBudgets.length > 0 ? (
              allBudgets.map((item, idx) => {
                const config = CATEGORIES[item.category] || CATEGORIES.MISCELLANEOUS;
                return (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 border-2 border-black flex items-center justify-center ${config.bg}`}>
                        <config.icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase italic tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
                          {item.description || "Untitled Expense"}
                        </h4>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          {item.sectionTitle} • {item.category}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-black tracking-tighter">₹{item.amount.toLocaleString()}</div>
                      {item.unitCost && item.quantity > 1 && (
                        <div className="text-[8px] font-mono text-gray-400 uppercase">
                          ₹{item.unitCost} x {item.quantity}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="h-40 border-2 border-black border-dashed flex flex-col items-center justify-center bg-gray-50">
                <Wallet className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No expenses recorded yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}