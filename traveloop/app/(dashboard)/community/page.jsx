"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Compass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommunityPostCard from "@/components/community/CommunityPostCard";
import TrendingDestinations from "@/components/community/TrendingDestinations";
import CommunityFilters from "@/components/community/CommunityFilters";
import CommentSheet from "@/components/community/CommentSheet";
import ShareExperienceDialog from "@/components/community/ShareExperienceDialog";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function CommunityPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);
  
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({});

  const fetchPosts = useCallback(async (isNew = false) => {
    if (isNew) setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: isNew ? 1 : page,
        q: search,
        sortBy,
        ...filters,
      });
      
      const res = await fetch(`/api/community?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (isNew) {
          setPosts(data.posts);
          setPage(2);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
          setPage(prev => prev + 1);
        }
        setHasMore(data.posts.length === 10);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, filters]);

  useEffect(() => {
    fetchPosts(true);
  }, [search, sortBy, filters]);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleDeletePost = async (postId) => {
    try {
      const res = await fetch(`/api/community/${postId}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast.success("Post deleted");
      }
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10 pb-24">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center justify-center p-3 bg-black text-white rounded-none border-b-4 border-r-4 border-blue-600 mb-2">
            <Users className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Community <span className="text-blue-600">Tab</span>
          </h1>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">// EXPLORE_TRAVEL_STORIES //</p>
        </motion.div>

        {/* Trending Strip */}
        <motion.div variants={itemVariants} initial="hidden" animate="show">
          <TrendingDestinations onSelectDestination={(d) => setSearch(d)} />
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div variants={itemVariants} initial="hidden" animate="show">
          <CommunityFilters 
            onSearch={setSearch}
            onSort={setSortBy}
            onGroupBy={setSortBy}
            onFilter={setFilters}
          />
        </motion.div>

        {/* Post Feed */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-12"
        >
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <CommunityPostCard 
                key={post.id}
                post={post}
                currentUserId={session?.user?.id}
                onOpenComments={(id) => setSelectedPostForComments(id)}
                onDelete={handleDeletePost}
              />
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="mt-4 font-black uppercase tracking-widest text-[10px] animate-pulse text-black">Scanning the globe...</p>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 border-4 border-black border-dashed bg-gray-50">
              <Compass className="h-16 w-16 text-gray-300 mb-4 animate-bounce" />
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Quiet on the front...</h3>
              <p className="text-[10px] font-mono text-gray-400 mt-2 tracking-widest uppercase">Be the first to break the silence!</p>
              <Button 
                onClick={() => setIsShareOpen(true)}
                className="mt-6 bg-black text-white rounded-none border-b-4 border-r-4 border-gray-600 font-black uppercase tracking-widest text-xs h-12 px-8 hover:bg-blue-600 transition-all"
              >
                Share Your First Trip
              </Button>
            </div>
          )}

          {hasMore && !loading && (
            <div className="flex justify-center pt-8">
              <Button 
                variant="outline"
                onClick={() => fetchPosts()}
                className="rounded-none border-2 border-black font-black uppercase tracking-widest text-xs px-10 h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Load More Experiences
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsShareOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-blue-600 text-white p-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 group transition-all"
      >
        <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
        <span className="font-black uppercase tracking-widest text-xs pr-2">Share Experience</span>
      </motion.button>

      {/* Overlays */}
      <ShareExperienceDialog 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)}
        onPostCreated={handlePostCreated}
      />

      <CommentSheet 
        postId={selectedPostForComments}
        isOpen={!!selectedPostForComments}
        onClose={() => setSelectedPostForComments(null)}
      />
    </div>
  );
}
