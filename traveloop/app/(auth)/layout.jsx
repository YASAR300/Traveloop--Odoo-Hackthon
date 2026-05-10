import React from "react";
import { Toaster } from "sonner";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <Toaster position="top-right" richColors />

      {/* Subtle grid background */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, #000 39px, #000 40px),
                           repeating-linear-gradient(90deg, transparent, transparent 39px, #000 39px, #000 40px)`,
        }}
      />

      {/* Form container */}
      <div className="relative z-10 w-full max-w-md px-6 py-12">
        {children}
      </div>
    </div>
  );
}
