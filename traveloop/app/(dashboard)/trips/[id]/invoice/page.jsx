"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  ArrowLeft, 
  Download, 
  FileText, 
  CheckCircle, 
  Plus, 
  Building2, 
  Calendar, 
  MapPin, 
  User,
  Loader2,
  AlertTriangle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { generateInvoicePdf } from "@/lib/generateInvoicePdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Components ---

const BudgetInsights = ({ totalBudget, totalSpent }) => {
  const remaining = totalBudget - totalSpent;
  const isOver = remaining < 0;

  const data = remaining >= 0 
    ? [
        { name: 'Spent', value: totalSpent, color: '#3b82f6' }, // Blue
        { name: 'Remaining', value: remaining, color: '#22c55e' } // Green
      ]
    : [
        { name: 'Budget', value: totalBudget, color: '#3b82f6' }, // Blue
        { name: 'Over Budget', value: Math.abs(remaining), color: '#ef4444' } // Red
      ];

  return (
    <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full">
      <h3 className="text-sm font-black uppercase italic tracking-tighter mb-4">budget Insights</h3>
      
      <div className="flex-1 min-h-[120px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={40}
              outerRadius={55}
              paddingAngle={5}
              dataKey="value"
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#000" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-1 font-mono text-[10px] uppercase font-bold">
        <div className="flex justify-between">
          <span>Total Budget:</span>
          <span>${totalBudget.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>total spent:</span>
          <span>${totalSpent.toLocaleString()}</span>
        </div>
        <div className={`flex justify-between border-t-2 border-black pt-1 ${isOver ? 'text-red-500' : 'text-green-600'}`}>
          <span>Remaining:</span>
          <span>{isOver ? "-" : ""}${Math.abs(remaining).toLocaleString()}</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        onClick={() => router.push(`/trips/${tripId}/budget`)}
        className="mt-6 w-full rounded-none border-2 border-black font-black uppercase italic text-[10px] h-8 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
      >
        View Full Budget
      </Button>
    </div>
  );
};

const ExpenseTable = ({ items, searchQuery, filterCategory, sortBy }) => {
  const filteredItems = useMemo(() => {
    let result = items.filter(item => 
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterCategory !== "all") {
      result = result.filter(item => item.category.toLowerCase() === filterCategory.toLowerCase());
    }

    if (sortBy === "amount-desc") result.sort((a, b) => b.amount - a.amount);
    else if (sortBy === "amount-asc") result.sort((a, b) => a.amount - b.amount);
    else if (sortBy === "category") result.sort((a, b) => a.category.localeCompare(b.category));

    return result;
  }, [items, searchQuery, filterCategory, sortBy]);

  const rows = [...filteredItems];
  while (rows.length < 8) {
    rows.push({ id: `empty-${rows.length}`, isEmpty: true });
  }

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={i} className="bg-yellow-200">{part}</span> 
        : part
    );
  };

  return (
    <div className="border-4 border-black bg-white overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <table className="w-full border-collapse">
        <thead className="bg-black text-white">
          <tr className="text-[10px] font-black uppercase italic tracking-widest text-left">
            <th className="p-4 border-r border-white/20 w-12">#</th>
            <th className="p-4 border-r border-white/20">Category</th>
            <th className="p-4 border-r border-white/20">Description</th>
            <th className="p-4 border-r border-white/20">Qty/details</th>
            <th className="p-4 border-r border-white/20">Unit Cost</th>
            <th className="p-4">Amount</th>
          </tr>
        </thead>
        <tbody className="font-mono text-xs">
          <AnimatePresence mode="popLayout">
            {rows.map((item, idx) => (
              <motion.tr 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`border-b-2 border-black h-12 ${item.isEmpty ? 'bg-gray-50/50' : 'hover:bg-blue-50/50 transition-colors'}`}
              >
                <td className="p-4 border-r-2 border-black text-center font-black">{!item.isEmpty && idx + 1}</td>
                <td className="p-4 border-r-2 border-black font-black uppercase italic text-[10px]">
                  {!item.isEmpty && highlightText(item.category.toLowerCase(), searchQuery)}
                </td>
                <td className="p-4 border-r-2 border-black">
                  {!item.isEmpty && highlightText(item.description || "", searchQuery)}
                </td>
                <td className="p-4 border-r-2 border-black font-bold">
                  {!item.isEmpty && (item.billingDetails || item.quantity)}
                </td>
                <td className="p-4 border-r-2 border-black">
                  {!item.isEmpty && `$${(item.unitCost || item.amount).toLocaleString()}`}
                </td>
                <td className="p-4 font-black">
                  {!item.isEmpty && `$${item.amount.toLocaleString()}`}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

// --- Main Page ---

export default function TripInvoicePage() {
  const { id: tripId } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [newTraveler, setNewTraveler] = useState("");
  const [showAddTraveler, setShowAddTraveler] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}/invoice`);
      if (res.ok) setData(await res.json());
    } catch (err) {
      toast.error("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [tripId]);

  const handleUpdateStatus = async () => {
    const newStatus = data.trip.invoiceStatus === "paid" ? "pending" : "paid";
    try {
      const res = await fetch(`/api/trips/${tripId}/invoice`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setData({ ...data, trip: { ...data.trip, invoiceStatus: newStatus } });
        toast.success(`Invoice marked as ${newStatus}! ✅`);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleAddTraveler = async () => {
    if (!newTraveler.trim()) return;
    const updatedTravelers = [...(data.trip.travelerNames || []), newTraveler];
    try {
      const res = await fetch(`/api/trips/${tripId}/invoice`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ travelerNames: updatedTravelers })
      });
      if (res.ok) {
        setData({ ...data, trip: { ...data.trip, travelerNames: updatedTravelers } });
        setNewTraveler("");
        setShowAddTraveler(false);
        toast.success("Traveler added!");
      }
    } catch (err) {
      toast.error("Failed to add traveler");
    }
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      generateInvoicePdf(data);
      toast.success("Invoice generated! 📄");
    } catch (err) {
      toast.error("Failed to generate PDF");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-black" />
    </div>
  );

  if (!data) return (
    <div className="h-screen w-full flex items-center justify-center bg-white flex-col gap-4">
      <AlertTriangle className="h-10 w-10 text-red-500" />
      <h2 className="text-xl font-black uppercase italic tracking-tighter">Invoice not found</h2>
      <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
    </div>
  );

  const { trip, lineItems, subtotal, tax, discount, grandTotal, budget } = data;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col no-scrollbar">
      
      {/* UNIQUE NAVBAR */}
      <nav className="h-20 bg-white border-b-4 border-black sticky top-0 z-50 flex items-center px-6 gap-6 no-print">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Traveloop</h1>
        
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoices......" 
              className="h-12 pl-12 border-4 border-black rounded-none font-mono text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-10 px-4 border-2 border-black rounded-none font-black uppercase italic text-[10px] tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <SlidersHorizontal className="h-3 w-3 mr-2" /> Filter
            </SelectTrigger>
            <SelectContent className="rounded-none border-2 border-black">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="transport">Travel</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="activity">Activity</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-10 px-4 border-2 border-black rounded-none font-black uppercase italic text-[10px] tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <ArrowUpDown className="h-3 w-3 mr-2" /> Sort ↕
            </SelectTrigger>
            <SelectContent className="rounded-none border-2 border-black">
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="amount-desc">Amount High→Low</SelectItem>
              <SelectItem value="amount-asc">Amount Low→High</SelectItem>
              <SelectItem value="category">Category A→Z</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-10 h-10 border-2 border-black rounded-full bg-gray-100 flex items-center justify-center font-black">
            {trip.user?.firstName?.[0] || "U"}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-8 invoice-container">
        
        {/* Back Navigation */}
        <button 
          onClick={() => router.push('/trips')} 
          className="flex items-center gap-2 text-xs font-black uppercase italic text-gray-500 hover:text-black transition-colors no-print"
        >
          <ArrowLeft className="h-3 w-3" /> back to My Trips
        </button>

        {/* Invoice Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row gap-8 w-full"
        >
          {/* Left Section */}
          <div className="flex-1 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex gap-8 relative overflow-hidden">
            <div className="w-32 h-32 bg-gray-100 border-2 border-black shrink-0 flex items-center justify-center overflow-hidden">
              {trip.coverImage ? (
                <img src={trip.coverImage} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="h-12 w-12 text-gray-300" />
              )}
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-1">{trip.name}</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> 
                  {trip.startDate ? format(new Date(trip.startDate), "MMM dd") : "TBA"} – {trip.endDate ? format(new Date(trip.endDate), "MMM dd, yyyy") : "TBA"} 
                  <span className="mx-2">•</span>
                  <MapPin className="h-3 w-3" /> {trip.stops?.length} cities
                </p>
                <p className="text-[10px] font-black text-blue-500 uppercase italic mt-1 flex items-center gap-1">
                  <User className="h-3 w-3" /> created by {trip.user?.firstName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 border-t-2 border-dashed border-gray-100 pt-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Invoice Id</p>
                    <p className="font-mono text-sm font-bold">{trip.invoiceId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Traveler Details:</p>
                    <div className="flex flex-col gap-1">
                      {trip.travelerNames?.map((name, i) => (
                        <span key={i} className="text-xs font-bold">{name}</span>
                      ))}
                      {!showAddTraveler ? (
                        <button 
                          onClick={() => setShowAddTraveler(true)}
                          className="text-[9px] font-black text-blue-500 uppercase italic flex items-center gap-1 hover:underline mt-1 no-print"
                        >
                          <Plus className="h-2.5 w-2.5" /> Add Traveler
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 mt-1 no-print">
                          <Input 
                            autoFocus
                            value={newTraveler}
                            onChange={(e) => setNewTraveler(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddTraveler()}
                            className="h-6 w-24 text-[10px] border-2 border-black rounded-none px-2"
                          />
                          <button onClick={handleAddTraveler}><CheckCircle className="h-3.5 w-3.5 text-green-500" /></button>
                          <button onClick={() => setShowAddTraveler(false)}><X className="h-3.5 w-3.5 text-red-500" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Generated date</p>
                    <p className="font-mono text-sm font-bold">
                      {trip.invoiceGeneratedAt ? format(new Date(trip.invoiceGeneratedAt), "MMMM dd, yyyy") : format(new Date(), "MMMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Payment status</p>
                    <Badge className={`rounded-none border-2 border-black font-black uppercase italic text-[9px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      trip.invoiceStatus === "paid" ? "bg-green-500 text-white" : "bg-amber-400 text-black"
                    }`}>
                      {trip.invoiceStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Budget Insights */}
          <div className="w-full lg:w-72">
            <BudgetInsights totalBudget={budget.totalBudget} totalSpent={subtotal} />
          </div>
        </motion.div>

        {/* Expense Table */}
        <div className="space-y-0">
          <ExpenseTable 
            items={lineItems} 
            searchQuery={searchQuery} 
            filterCategory={filterCategory} 
            sortBy={sortBy} 
          />
          
          {/* Footer Totals */}
          <div className="flex justify-end pt-8 pr-4">
            <div className="w-full max-w-md space-y-4 font-mono">
              <div className="space-y-2 text-sm border-b-2 border-black pb-4">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-400 uppercase text-[10px]">Subtotal</span>
                  <span className="font-black">$ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-400 uppercase text-[10px]">tax({trip.taxPercent}%)</span>
                  <span className="font-black">$ {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-400 uppercase text-[10px]">Discount</span>
                  <span className="font-black">$ {discount.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-4 px-6 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-lg font-black uppercase italic tracking-tighter">Grand Total</span>
                <span className="text-2xl font-black">$ {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-10 pb-20 no-print">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleDownload}
              disabled={isExporting}
              className="h-12 border-4 border-black rounded-none font-black uppercase italic text-xs px-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Download Invoice
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.print()}
              className="h-12 border-4 border-black rounded-none font-black uppercase italic text-xs px-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
            >
              <FileText className="h-4 w-4 mr-2" /> Export as PDF
            </Button>
          </div>

          <Button 
            onClick={handleUpdateStatus}
            className={`h-12 border-4 border-black rounded-none font-black uppercase italic text-xs px-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all ${
              trip.invoiceStatus === "paid" ? "bg-green-600 hover:bg-green-700" : "bg-black hover:bg-gray-900"
            }`}
          >
            {trip.invoiceStatus === "paid" ? <><CheckCircle className="h-4 w-4 mr-2" /> Paid</> : "Mark as paid"}
          </Button>
        </div>

      </main>
    </div>
  );
}
