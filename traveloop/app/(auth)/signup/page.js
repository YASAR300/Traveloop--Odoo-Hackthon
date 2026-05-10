"use client";

import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import {
  Loader2,
  Camera,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  AtSign,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

const signupSchema = z.object({
  username: z.string().min(3, { message: "Min 3 characters" }),
  firstName: z.string().min(2, { message: "Min 2 characters" }),
  lastName: z.string().min(2, { message: "Min 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Min 6 characters" }),
  phone: z.string().min(10, { message: "Min 10 digits required" }),
  city: z.string().min(1, { message: "City is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  additionalInfo: z.string().max(500, { message: "Max 500 characters" }).optional(),
});

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { y: 12, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { ease: "easeOut", duration: 0.35 } },
};

// Reusable field wrapper with icon
function FieldWrapper({ icon: Icon, label, children }) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 mb-1.5">
        <Icon className="h-3 w-3" /> {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "h-11 border-2 border-black rounded-none bg-white font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(59,130,246,1)]";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      city: "",
      country: "",
      additionalInfo: "",
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, profileImage: imageUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Account created! Welcome to Traveloop! ✈️");
        router.push("/login");
      } else {
        toast.error(data.message || "Registration failed. Try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-blue-500" />
          <span className="text-xs font-mono text-gray-400 uppercase tracking-[0.2em]">
            NEW_ENTITY_ENROLLMENT // SCREEN_02
          </span>
        </div>
        <h1 className="text-4xl font-black text-black italic uppercase tracking-tighter leading-none mb-2">
          Start Your
          <br />
          <span className="text-blue-500">Journey.</span>
        </h1>
        <p className="text-sm text-gray-500 font-mono">
          Create your explorer profile to get started.
        </p>
      </div>

      {/* Photo Upload */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="flex justify-center mb-8"
      >
        <CldUploadWidget
          uploadPreset="ml_default"
          onSuccess={(result) => {
            const url = result?.info?.secure_url;
            if (url) {
              setImageUrl(url);
              toast.success("Photo uploaded! Looking great! 📸");
            }
          }}
        >
          {({ open }) => (
            <div
              onClick={() => open()}
              className="relative group cursor-pointer"
            >
              {/* Animated ring */}
              <div className="absolute -inset-3 rounded-full border-2 border-dashed border-blue-300 animate-spin [animation-duration:12s]" />
              <Avatar className="h-24 w-24 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] transition-shadow">
                <AvatarImage src={imageUrl} />
                <AvatarFallback className="bg-black text-white group-hover:bg-blue-600 transition-colors">
                  <Camera className="h-9 w-9" />
                </AvatarFallback>
              </Avatar>
              {/* Upload badge */}
              <div className="absolute -bottom-1 -right-1 bg-blue-500 border-2 border-white p-1.5 shadow-md">
                <Camera className="h-3 w-3 text-white" />
              </div>
              {/* Hover label */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                  UPLOAD_PHOTO
                </span>
              </div>
            </div>
          )}
        </CldUploadWidget>
      </motion.div>

      {/* Form */}
      <Form {...form}>
        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="show"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Name row */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-1.5">
                    <User className="h-3 w-3" /> First Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} className={inputClass} />
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold uppercase" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-1.5">
                    <User className="h-3 w-3" /> Last Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} className={inputClass} />
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold uppercase" />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Email & Phone */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@email.com"
                      {...field}
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold uppercase" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-1.5">
                    <Phone className="h-3 w-3" /> Phone
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+91 9999999999"
                      {...field}
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold uppercase" />
                </FormItem>
              )}
            />
          </motion.div>

          {/* City & Country */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> City
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Mumbai" {...field} className={inputClass} />
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold uppercase" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-1.5">
                    <Globe className="h-3 w-3" /> Country
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="India" {...field} className={inputClass} />
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold uppercase" />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Username & Password */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-1.5">
                    <AtSign className="h-3 w-3" /> Username
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="john_doe" {...field} className={inputClass} />
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold uppercase" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-1.5">
                    <Lock className="h-3 w-3" /> Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••"
                        {...field}
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold uppercase" />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Additional Info */}
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-1.5">
                    <FileText className="h-3 w-3" /> Additional Information
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your travel style, favorite destinations..."
                      {...field}
                      className="min-h-[90px] border-2 border-black rounded-none bg-white font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500 resize-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(59,130,246,1)] transition-all"
                    />
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold uppercase" />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Submit Button */}
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
                  REGISTER_ENTITY
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
        transition={{ delay: 0.8 }}
        className="mt-8 pt-6 border-t-2 border-dashed border-gray-200"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-mono">
            Already an explorer?
          </span>
          <Link
            href="/login"
            className="group flex items-center gap-2 text-sm font-black uppercase italic text-black hover:text-blue-600 transition-colors"
          >
            LOGIN_NOW
            <span className="inline-block transform group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>

        {/* Passport stamp decoration */}
        <div className="mt-6 flex items-center gap-4 opacity-20">
          <div className="flex-1 border-t border-gray-300" />
          <div className="border-2 border-gray-400 rounded-full px-4 py-1 rotate-[8deg]">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
              ✈ EXPLORER
            </span>
          </div>
          <div className="flex-1 border-t border-gray-300" />
        </div>
      </motion.div>
    </motion.div>
  );
}