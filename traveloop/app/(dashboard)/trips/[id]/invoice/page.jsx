"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, Download, ArrowLeft, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function TripInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/trips/${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (err) {
        toast.error("Could not load invoice data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-20 text-center font-black uppercase italic">Generating Invoice...</div>;

  const totalSpent = data?.totalSpent || 0;
  const tax = totalSpent * 0.18; // 18% GST example
  const grandTotal = totalSpent + tax;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Button 
        onClick={() => router.back()} 
        variant="ghost" 
        className="mb-8 font-black uppercase italic text-xs hover:bg-black hover:text-white rounded-none border-2 border-transparent hover:border-black transition-all"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Itinerary
      </Button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-4 border-black p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
      >
        {/* Paid Stamp */}
        <div className="absolute top-10 right-10 border-4 border-green-600 text-green-600 px-6 py-2 font-black uppercase italic text-3xl rotate-12 opacity-50">
          PAID
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-16 border-b-4 border-black pb-8">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-2">INVOICE</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Traveloop #TRP-{id?.slice(-6).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">TRAVELOOP INC.</h2>
            <p className="text-[10px] font-bold uppercase text-gray-400">Global Travel Operations</p>
            <p className="text-[10px] font-bold uppercase text-gray-400">Bangalore, India</p>
          </div>
        </div>

        {/* Trip Details */}
        <div className="grid grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">BILL TO:</h3>
            <p className="text-xl font-black uppercase italic tracking-tight">{data?.trip?.user?.firstName} {data?.trip?.user?.lastName}</p>
            <p className="text-sm font-bold text-gray-500 uppercase">{data?.trip?.name}</p>
          </div>
          <div className="text-right">
            <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">DATE:</h3>
            <p className="text-xl font-black uppercase italic tracking-tight">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full mb-16 border-collapse">
          <thead>
            <tr className="border-b-4 border-black">
              <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Description</th>
              <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Type</th>
              <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data?.trip?.sections.map((section) => (
              <tr key={section.id} className="border-b-2 border-black hover:bg-gray-50 transition-colors">
                <td className="py-6 font-black uppercase italic tracking-tight text-lg">{section.title}</td>
                <td className="py-6 text-right font-bold text-xs uppercase">{section.sectionType}</td>
                <td className="py-6 text-right font-black italic text-lg">₹{section.sectionBudgets.reduce((s, b) => s + b.amount, 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculation */}
        <div className="flex justify-end">
          <div className="w-full md:w-1/2 space-y-4">
            <div className="flex justify-between items-center text-sm font-bold uppercase">
              <span>Subtotal</span>
              <span className="font-black italic">₹{totalSpent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold uppercase">
              <span>Tax (GST 18%)</span>
              <span className="font-black italic">₹{tax.toLocaleString()}</span>
            </div>
            <div className="h-1 bg-black" />
            <div className="flex justify-between items-center py-2">
              <span className="text-2xl font-black uppercase italic tracking-tighter">GRAND TOTAL</span>
              <span className="text-3xl font-black italic tracking-tighter">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-20 border-t-2 border-black pt-8 flex items-center gap-4 text-green-600">
          <CheckCircle2 className="h-6 w-6" />
          <p className="text-[10px] font-black uppercase tracking-widest">This is a system generated invoice. No signature required.</p>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex justify-center gap-4 mt-12">
        <Button onClick={() => window.print()} className="h-12 border-2 border-black bg-white text-black rounded-none font-black uppercase italic text-xs px-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
          <Printer className="h-4 w-4 mr-2" /> Print Invoice
        </Button>
        <Button className="h-12 border-2 border-black bg-black text-white rounded-none font-black uppercase italic text-xs px-8 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:shadow-none transition-all">
          <Download className="h-4 w-4 mr-2" /> Download PDF
        </Button>
      </div>
    </div>
  );
}
