"use client";

import React, { useState, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { Heart, Reply, Send, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function CommentSheet({ postId, isOpen, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/community/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments(prev => [...prev, comment]);
        setNewComment("");
        toast.success("Comment added! 💬");
      }
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-l-4 border-black rounded-none">
        <SheetHeader className="p-6 border-b-4 border-black bg-white">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="font-black italic uppercase tracking-tighter text-2xl flex items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                Comments <span className="text-blue-500">({comments.length})</span>
              </SheetTitle>
              <p className="text-[10px] font-mono text-gray-400 tracking-widest uppercase mt-1">// DISCUSSION_THREAD //</p>
            </div>
            <button onClick={onClose} className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 border-2 border-black" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-gray-200" />
                    <div className="h-10 w-full bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment, idx) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-3"
                >
                  <Avatar className="h-8 w-8 border-2 border-black rounded-none flex-shrink-0">
                    <AvatarImage src={comment.user?.profileImage} />
                    <AvatarFallback className="bg-black text-white text-[10px] font-black uppercase">
                      {comment.user?.firstName?.[0]}{comment.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-tight">
                        {comment.user?.firstName} {comment.user?.lastName}
                      </span>
                      <span className="text-[8px] font-mono text-gray-400 uppercase">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="bg-white border-2 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs leading-relaxed">
                      {comment.content}
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <button className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="h-2.5 w-2.5" /> Like
                      </button>
                      <button className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 transition-colors">
                        <Reply className="h-2.5 w-2.5" /> Reply
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <MessageCircle className="h-12 w-12" />
              <p className="text-xs font-black uppercase tracking-widest">No comments yet.<br/>Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t-4 border-black bg-white">
          <div className="relative">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              disabled={posting}
              className="h-12 border-2 border-black rounded-none font-mono text-xs pr-12 focus-visible:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
            />
            <button
              onClick={handlePostComment}
              disabled={posting || !newComment.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black text-white hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
