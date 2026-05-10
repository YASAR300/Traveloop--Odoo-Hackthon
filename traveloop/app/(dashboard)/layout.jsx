import React from "react";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Sticky top navbar */}
        <Navbar />

        {/* Full-width scrollable content — no sidebar per wireframe */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
