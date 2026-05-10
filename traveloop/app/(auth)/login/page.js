"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, User, Lock, Compass, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { ease: "easeOut", duration: 0.4 } },
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    const result = await signIn("credentials", {
      username: values.username,
      password: values.password,
      redirect: false,
    });
    setIsLoading(false);

    if (result?.error) {
      toast.error("Invalid credentials. Check your username and password.");
    } else {
      toast.success("Welcome back, Explorer! 🌍");
      router.push("/dashboard");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 bg-blue-500" />
          <span className="text-xs font-mono text-gray-400 uppercase tracking-[0.2em]">
            PORTAL_ACCESS // SCREEN_01
          </span>
        </div>
        <h1 className="text-4xl font-black text-black italic uppercase tracking-tighter leading-none mb-2">
          Welcome
          <br />
          <span className="text-blue-500">Back.</span>
        </h1>
        <p className="text-sm text-gray-500 font-mono">
          Enter your credentials to continue your journey.
        </p>
      </div>

      {/* Avatar */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="flex justify-center mb-10"
      >
        <div className="relative">
          {/* Rotating dashed ring */}
          <div className="absolute -inset-3 rounded-full border-2 border-dashed border-blue-300 animate-spin [animation-duration:12s]" />
          <Avatar className="h-24 w-24 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <AvatarImage src="" />
            <AvatarFallback className="bg-black text-white">
              <Compass className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
          {/* Status dot */}
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 border-2 border-white rounded-full" />
        </div>
      </motion.div>

      {/* Form */}
      <Form {...form}>
        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="show"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Username */}
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                    <User className="h-3 w-3" /> TRAVELER_ID
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="your_username"
                        {...field}
                        className="h-12 border-2 border-black rounded-none bg-white font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500 transition-colors pr-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:shadow-[3px_3px_0px_0px_rgba(59,130,246,1)] transition-shadow"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold uppercase" />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Password */}
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                    <Lock className="h-3 w-3" /> SECURE_KEY
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="h-12 border-2 border-black rounded-none bg-white font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:shadow-[3px_3px_0px_0px_rgba(59,130,246,1)] transition-shadow pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-blue-500 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold uppercase" />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Submit */}
          <motion.div variants={itemVariants} className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-black text-white rounded-none font-black uppercase tracking-tighter italic text-lg border-b-4 border-r-4 border-gray-600 hover:bg-gray-900 active:translate-y-1 active:translate-x-1 active:border-b-0 active:border-r-0 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span className="w-2 h-2 bg-blue-400 inline-block" />
                  INITIATE_LOGIN
                  <span className="w-2 h-2 bg-blue-400 inline-block" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.form>
      </Form>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 pt-6 border-t-2 border-dashed border-gray-200"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-mono">
            No account yet?
          </span>
          <Link
            href="/signup"
            className="group flex items-center gap-2 text-sm font-black uppercase italic text-black hover:text-blue-600 transition-colors"
          >
            REGISTER_NOW
            <span className="inline-block transform group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>

        {/* Passport stamp decoration */}
        <div className="mt-6 flex items-center gap-4 opacity-20">
          <div className="flex-1 border-t border-gray-300" />
          <div className="border-2 border-gray-400 rounded-full px-4 py-1 rotate-[-8deg]">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
              TRAVELOOP ✈
            </span>
          </div>
          <div className="flex-1 border-t border-gray-300" />
        </div>
      </motion.div>
    </motion.div>
  );
}