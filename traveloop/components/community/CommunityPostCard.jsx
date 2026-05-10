"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, CheckCircle2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const reactions = [
  { emoji: "❤️", label: "Love" },
  { emoji: "🌍", label: "Inspiring" },
  { emoji: "😍", label: "Stunning" },
  { emoji: "🔥", label: "Epic" },
  { emoji: "😂", label: "Fun" },
];

export default function CommunityPostCard({ post, currentUserId, onLike, onOpenComments, onDelete }) {
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(null);

  const handleLike = async (emoji) => {
    try {
      const res = await fetch(`/api/community/${post.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji: emoji?.emoji || "❤️" }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
        if (data.liked && emoji) setSelectedReaction(emoji.emoji);
        else if (!data.liked) setSelectedReaction(null);
      }
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/community?post=${post.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Post link copied to clipboard! 📤");
  };

  const handleAddToWishlist = async () => {
    try {
      const res = await fetch("/api/user/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: post.destination }),
      });
      if (res.ok) {
        toast.success("Added to your wishlist! 🔖");
      }
    } catch (error) {
      toast.error("Failed to add to wishlist");
    }
  };

  const isOwner = post.userId === currentUserId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex gap-4 group"
    >
      {/* Left: Avatar */}
      <div className="flex-shrink-0">
        <div className="relative">
          <Avatar className="h-12 w-12 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <AvatarImage src={post.user?.profileImage} />
            <AvatarFallback className="bg-blue-500 text-white font-black uppercase rounded-none">
              {post.user?.firstName?.[0]}{post.user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          {post.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-white border-2 border-black rounded-full p-0.5">
              <CheckCircle2 className="h-3 w-3 text-blue-500 fill-blue-500" />
            </div>
          )}
        </div>
      </div>

      {/* Right: Content Box */}
      <div className="flex-1 min-w-0">
        <div className="bg-white border-2 border-black rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
          {/* Header */}
          <div className="p-4 border-b-2 border-black bg-gray-50 flex items-center justify-between">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-black uppercase tracking-tight text-xs truncate">
                  {post.user?.firstName} {post.user?.lastName}
                </span>
                {post.isVerified && (
                  <Badge variant="outline" className="h-4 px-1 border-black rounded-none text-[8px] font-black uppercase bg-blue-100 text-blue-700">
                    Verified
                  </Badge>
                )}
                <span className="text-gray-400 font-mono text-[9px] uppercase">• {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 font-mono text-[10px] uppercase truncate">
                <span className="text-blue-600 font-bold">📍 {post.destination || "Global Explorer"}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={handleAddToWishlist}
                className="p-1.5 hover:bg-gray-200 transition-colors border-2 border-transparent hover:border-black rounded-none"
                title="Add to Wishlist"
              >
                <Bookmark className="h-3.5 w-3.5" />
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 hover:bg-gray-200 transition-colors border-2 border-transparent hover:border-black rounded-none">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <DropdownMenuItem onClick={handleShare} className="font-mono text-[10px] uppercase tracking-widest cursor-pointer">
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-mono text-[10px] uppercase tracking-widest cursor-pointer text-orange-600">
                    Report Post
                  </DropdownMenuItem>
                  {isOwner && (
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(post.id)}
                      className="font-mono text-[10px] uppercase tracking-widest cursor-pointer text-red-600"
                    >
                      Delete Post
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="relative">
              <p className={`text-sm font-medium leading-relaxed text-gray-800 ${!isExpanded ? "line-clamp-3" : ""}`}>
                {post.content}
              </p>
              {post.content.length > 150 && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-600 font-black uppercase text-[10px] mt-1 hover:underline underline-offset-2"
                >
                  {isExpanded ? "Show Less" : "Read More"}
                </button>
              )}
            </div>

            {post.trip && (
              <div className="inline-flex items-center gap-2 px-2 py-1 bg-black text-white rounded-none font-mono text-[10px] uppercase tracking-wider">
                <span className="text-blue-400">#</span> Trip: {post.trip.name}
              </div>
            )}

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {post.images.slice(0, 3).map((img, idx) => (
                  <div key={idx} className="relative flex-shrink-0 w-32 h-32 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <img src={img} alt="Post content" className="w-full h-full object-cover" />
                    {idx === 2 && post.images.length > 3 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-xs">
                        +{post.images.length - 3} MORE
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-2 border-t-2 border-black flex items-center justify-between bg-white">
            <div className="flex items-center gap-1">
              {/* Like/Reaction */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowReactions(true)}
                  onMouseLeave={() => setShowReactions(false)}
                  onClick={() => handleLike()}
                  className={`h-9 px-3 flex items-center gap-2 border-2 border-black rounded-none font-black text-[10px] uppercase tracking-widest transition-all ${
                    isLiked ? "bg-red-50 text-red-600 border-red-600 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]" : "bg-white text-black hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  }`}
                >
                  {selectedReaction ? <span>{selectedReaction}</span> : <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-red-600" : ""}`} />}
                  {likesCount}
                </button>

                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      onMouseEnter={() => setShowReactions(true)}
                      onMouseLeave={() => setShowReactions(false)}
                      className="absolute bottom-full left-0 mb-2 p-1.5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 z-50"
                    >
                      {reactions.map((r) => (
                        <button
                          key={r.label}
                          onClick={() => {
                            handleLike(r);
                            setShowReactions(false);
                          }}
                          className="hover:scale-150 transition-transform p-1 text-lg"
                          title={r.label}
                        >
                          {r.emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Comments */}
              <Button
                variant="outline"
                onClick={() => onOpenComments?.(post.id)}
                className="h-9 px-3 gap-2 border-2 border-black rounded-none font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white text-black"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {post.commentsCount}
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={handleShare}
              className="h-9 px-3 gap-2 border-2 border-black rounded-none font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white text-black"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
