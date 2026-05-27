import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Bookmark, Share2, Clock, ArrowLeft,
  ThumbsUp, Send, ChevronRight, Edit3, Trash2, Eye
} from 'lucide-react';
import { storyApi } from '../api/storyApi';
import { userApi } from '../api/userApi';
import type { Story } from '../data/stories';
import StoryCard from '../components/StoryCard';

export default function StoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<any>(null);
  const [moreStories, setMoreStories] = useState<Story[]>([]);
  const [authorStats, setAuthorStats] = useState({ totalStories: 0, followersCount: 0, totalLikesReceived: 0, isFollowing: false });
  const [loading, setLoading] = useState(true);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const parsed = JSON.parse(userJson);
        setCurrentUser(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, [id]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!id || !currentUser) return;
      try {
        const savedStories = await userApi.getSavedStories();
        const isCurrentlySaved = savedStories.some((s: any) => (s._id || s.id) === id);
        setIsSaved(isCurrentlySaved);
      } catch (e) {
        console.error("Failed to check saved status:", e);
      }
    };
    checkSavedStatus();
  }, [id, currentUser]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToastNotification = (message: string, type: 'success' | 'info' | 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setStoryError(null);
        const data = await storyApi.getStoryById(id);
        if (!data) {
          setStoryError("Story not found in the Whispering Library.");
          return;
        }
        
        const mappedStory = {
          ...data,
          id: data._id,
          authorName: data.author?.name || 'Unknown Author',
          authorAvatar: data.author?.avatar,
          authorBio: data.author?.bio || 'A passionate storyteller.',
          likes: Array.isArray(data.likes) ? data.likes.length : (data.likes || 0),
          likesRaw: data.likes || [],
          commentsCount: Array.isArray(data.comments) ? data.comments.length : (data.comments || 0),
        };
        setStory(mappedStory);

        // Fetch author profile
        const authorId = data.author?._id || data.author;
        if (authorId) {
          try {
            const authorData = await userApi.getUserStatsAndProfile(authorId);
            let isFollowingAuthor = false;
            const currentUId = currentUser?.id || currentUser?._id || currentUser?._id || currentUser?.id;
            if (currentUId && authorData.user?.followers) {
              isFollowingAuthor = authorData.user.followers.some((fId: any) => fId.toString() === currentUId.toString());
            }
            setAuthorStats({
              totalStories: authorData.stats.totalStories,
              followersCount: authorData.stats.followersCount,
              totalLikesReceived: authorData.stats.totalLikesReceived,
              isFollowing: isFollowingAuthor
            });
          } catch (statError) {
            console.error('Failed to load author stats:', statError);
          }
        }

        // Fetch related stories
        const relatedData = await storyApi.getStories(mappedStory.category);
        const mappedRelated = relatedData
          .filter((s: any) => s._id !== mappedStory.id)
          .slice(0, 3)
          .map((s: any) => ({
            ...s,
            id: s._id,
            author: s.author?.name || 'Unknown Author',
            authorAvatar: s.author?.avatar,
            likes: Array.isArray(s.likes) ? s.likes.length : (s.likes || 0),
            comments: Array.isArray(s.comments) ? s.comments.length : (s.comments || 0),
            views: s.views || 0,
          }));
        setMoreStories(mappedRelated);

      } catch (error: any) {
        console.error('Failed to load story details:', error);
        setStoryError(error.response?.data?.message || 'Unable to connect to Whispering Quills server.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      showToastNotification('Please log in to follow authors.', 'error');
      navigate('/login');
      return;
    }
    const authorId = story?.author?._id || story?.author;
    if (!authorId) return;

    try {
      setFollowLoading(true);
      const res = await userApi.toggleFollowUser(authorId);
      setAuthorStats(prev => ({
        ...prev,
        followersCount: res.followersCount,
        isFollowing: res.isFollowing
      }));
      showToastNotification(res.isFollowing ? '✦ Now following this author!' : 'Unfollowed author.', 'success');
    } catch (e: any) {
      console.error(e);
      showToastNotification(e.response?.data?.message || 'Could not toggle follow.', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !id) return;
    try {
      const newComment = await storyApi.addComment(id, commentText);
      setStory((prev: any) => ({
        ...prev,
        comments: [newComment, ...(prev.comments || [])],
        commentsCount: prev.commentsCount + 1,
      }));
      setCommentText('');
      showToastNotification('✦ Response posted successfully!', 'success');
    } catch (error) {
      console.error('Failed to post comment', error);
      showToastNotification('Could not post comment. Make sure you are logged in.', 'error');
    }
  };

  const hasLiked = currentUser && story && Array.isArray(story.likesRaw) 
    ? story.likesRaw.some((like: any) => {
        const likeId = typeof like === 'object' ? (like._id || like.id) : like;
        const currentUId = currentUser.id || currentUser._id;
        return likeId === currentUId;
      })
    : false;

  const handleLike = async () => {
    if (!id) return;
    if (!currentUser) {
      showToastNotification('Please log in to like this story.', 'error');
      return;
    }
    
    const alreadyLiked = hasLiked;
    const originalLikes = story.likes;
    const originalLikesRaw = story.likesRaw || [];
    
    let newLikesRaw = [...originalLikesRaw];
    const uId = currentUser.id || currentUser._id;
    
    if (alreadyLiked) {
      newLikesRaw = newLikesRaw.filter((like: any) => {
        const likeId = typeof like === 'object' ? (like._id || like.id) : like;
        return likeId !== uId;
      });
    } else {
      newLikesRaw.push(uId);
    }
    
    setStory((prev: any) => ({
      ...prev,
      likes: alreadyLiked ? Math.max(0, originalLikes - 1) : originalLikes + 1,
      likesRaw: newLikesRaw
    }));
    
    showToastNotification(alreadyLiked ? 'Tale unliked' : '✦ Story Liked! Added magic to this tale', 'success');

    try {
      const res = await storyApi.likeStory(id);
      setStory((prev: any) => ({
        ...prev,
        likes: res.likes.length,
        likesRaw: res.likes,
      }));
    } catch (error) {
      console.error('Failed to like story', error);
      setStory((prev: any) => ({
        ...prev,
        likes: originalLikes,
        likesRaw: originalLikesRaw
      }));
      showToastNotification('Could not like story. Please log in first.', 'error');
    }
  };

  const handleSave = async () => {
    if (!id || !story) return;
    if (!currentUser) {
      showToastNotification('Please log in to save stories.', 'error');
      return;
    }
    try {
      const res = await userApi.toggleSaveStory(id);
      setIsSaved(res.isSaved);
      showToastNotification(res.isSaved ? '✦ Tale saved to your library bookmarks!' : 'Removed from saved stories', 'success');
    } catch (e: any) {
      console.error(e);
      showToastNotification(e.response?.data?.message || 'Could not toggle bookmark.', 'error');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToastNotification('✦ Share link copied to clipboard!', 'success');
  };

  const handleDeleteStory = async () => {
    if (!window.confirm("Are you certain you wish to delete this magical tale? This action is permanent and cannot be undone.")) return;
    try {
      await storyApi.deleteStory(id!);
      showToastNotification("✦ The tale has been permanently returned to the stars.", "success");
      setTimeout(() => {
        navigate('/library');
      }, 1500);
    } catch (e: any) {
      console.error(e);
      showToastNotification(e.message || "Could not delete story.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#f7eadc] paper-texture">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#d99b8a] border-t-[#c77966] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#7a4a3a] italic font-serif">Unrolling the parchment scroll...</p>
        </div>
      </div>
    );
  }

  if (storyError || !story) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4 bg-[#f7eadc] paper-texture">
        <div className="bg-[#fff7ef] border-2 border-[#eadfd2] rounded-3xl p-8 max-w-md w-full text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-[#d99b8a] rounded-tl-md" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-[#d99b8a] rounded-tr-md" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-[#d99b8a] rounded-bl-md" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-[#d99b8a] rounded-br-md" />
          
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4 border border-[#ead5c9]">
            <BookOpen size={24} className="text-[#c77966]" />
          </div>
          <h3 className="text-2xl font-bold text-[#3b1714] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Tale Not Found
          </h3>
          <p className="text-sm text-[#7a4a3a] leading-relaxed mb-6 font-serif italic" style={{ fontFamily: "'Lora', serif" }}>
            {storyError || "Story not found in the Whispering Library."}
          </p>
          <Link 
            to="/library" 
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white text-sm font-semibold rounded-full hover:shadow-md transition-all cursor-pointer"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Browse Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-20 paper-texture">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border border-[#eadfd2] backdrop-blur-md bg-gradient-to-r from-[#3b1714] to-[#5a2723] text-[#fff7ef]`}
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <span className="text-sm font-semibold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Cover Image */}
      <div className="relative h-64 md:h-80 lg:h-[420px] overflow-hidden shadow-md">
        <img
          src={story.coverImage}
          alt={story.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f7eadc] via-[#3b1714]/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#3b1714]/30 to-transparent" />

        {/* Back button */}
        <div className="absolute top-24 left-4 sm:left-8 z-20">
          <Link
            to="/library"
            className="flex items-center gap-1.5 px-4 py-2 bg-black/35 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-semibold hover:bg-black/50 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <ArrowLeft size={14} />
            Back to Library
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-16 relative z-10">
          {/* Main Story Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Story Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-3xl border border-[#eadfd2] shadow-[0_10px_35px_rgba(59,23,20,0.06)] p-6 sm:p-8"
            >
              <span
                className="inline-block px-3 py-1 bg-[#f7eadc]/80 border border-[#ead5c9]/60 text-[#c77966] text-[10px] font-bold uppercase tracking-wider rounded-md mb-4"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {story.category}
              </span>

              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#3b1714] leading-tight mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {story.title}
              </h1>

              {/* Author & Stats Row */}
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#ead5c9]/70">
                <div className="flex items-center gap-3">
                  <img
                    src={story.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.authorName || 'Author')}&background=8E7C68&color=fff&size=150`}
                    alt={story.authorName}
                    className="w-11 h-11 rounded-full border border-[#ead5c9] bg-[#f7eadc] object-cover"
                  />
                  <div>
                    <Link
                      to="/profile"
                      className="text-sm font-bold text-[#3b1714] hover:text-[#c77966] transition-colors"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {story.authorName}
                    </Link>
                    <p className="text-[11px] text-[#7a4a3a]/80" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Published {new Date(story.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-[#7a4a3a]">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#d99b8a]" />
                    {story.readTime || '5 min'} read
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Heart size={14} className="text-[#c77966]" />
                    {story.likes.toLocaleString()}
                  </span>
                  {typeof story.views === 'number' && (
                    <span className="flex items-center gap-1.5">
                      <Eye size={14} className="text-[#7a4a3a]/80" />
                      {story.views === 0 ? 'New Tale' : `${story.views.toLocaleString()} views`}
                    </span>
                  )}
                </div>
              </div>

              {/* Action row controls */}
              {(() => {
                const uId = currentUser?.id || currentUser?._id;
                const authorId = story.author?._id || story.author;
                const isOwner = uId && authorId && uId.toString() === authorId.toString();
                const isAdmin = currentUser?.role === 'admin' || currentUser?.user?.role === 'admin';
                
                return (
                  <div className="flex items-center gap-2 pt-4 flex-wrap">
                    <button 
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-full hover:shadow-md transition-all cursor-pointer ${
                        hasLiked 
                          ? 'bg-[#3b1714] text-white hover:bg-[#5a2723]' 
                          : 'bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white hover:scale-105'
                      }`}
                    >
                      <Heart size={13} className={hasLiked ? 'fill-white text-red-500' : ''} />
                      <span style={{ fontFamily: "'Poppins', sans-serif" }}>{hasLiked ? 'Liked' : 'Like'}</span>
                    </button>
                    <button 
                      onClick={handleSave}
                      className={`flex items-center gap-2 px-4 py-2 border text-xs font-bold rounded-full transition-all hover:scale-105 cursor-pointer ${
                        isSaved 
                          ? 'bg-[#c77966] border-[#c77966] text-white hover:bg-[#b56855]' 
                          : 'bg-[#fff7ef] border-[#ead5c9] text-[#7a4a3a] hover:border-[#c77966]'
                      }`}
                    >
                      <Bookmark size={13} className={isSaved ? 'fill-white text-[#fff7ef]' : ''} />
                      <span style={{ fontFamily: "'Poppins', sans-serif" }}>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                    <button 
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 bg-[#fff7ef] border border-[#ead5c9] text-[#7a4a3a] text-xs font-bold rounded-full hover:border-[#c77966] hover:bg-[#ead5c9]/30 transition-all hover:scale-105 cursor-pointer"
                    >
                      <Share2 size={13} />
                      <span style={{ fontFamily: "'Poppins', sans-serif" }}>Share</span>
                    </button>

                    {(isOwner || isAdmin) && (
                      <>
                        <Link 
                          to={`/create?edit=${story.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-bold rounded-full transition-all hover:scale-105"
                        >
                          <Edit3 size={13} />
                          <span style={{ fontFamily: "'Poppins', sans-serif" }}>Edit</span>
                        </Link>
                        <button 
                          onClick={handleDeleteStory}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full transition-all hover:scale-105 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span style={{ fontFamily: "'Poppins', sans-serif" }}>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                );
              })()}
            </motion.div>

            {/* Story Text Parchment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-3xl border border-[#eadfd2] shadow-[0_4px_24px_rgba(59,23,20,0.04)] p-6 sm:p-10"
            >
              {/* Summary note block */}
              <div className="p-4 sm:p-5 bg-[#f7eadc]/60 rounded-2xl border-l-4 border-[#c77966] mb-8 border border-[#ead5c9]/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
                <p
                  className="text-sm text-[#7a4a3a] italic leading-relaxed"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  <span className="text-[#c77966] font-bold not-italic">Prologue Overview: </span>
                  {story.summary}
                </p>
              </div>

              {/* Decorative divider */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 h-px bg-[#ead5c9]/60" />
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d99b8a]/60" />
                  <div className="w-2.5 h-2.5 rounded-full border border-[#d99b8a]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d99b8a]/60" />
                </div>
                <div className="flex-1 h-px bg-[#ead5c9]/60" />
              </div>

              {/* Immersive Reading prose wrapper */}
              <div className="max-w-2xl mx-auto">
                <div
                  className="prose text-[#3b1714] leading-[2.0] text-[17px] md:text-lg space-y-6 select-text selection:bg-[#f2d9ce]"
                  style={{ fontFamily: "'Lora', serif" }}
                  dangerouslySetInnerHTML={{ __html: story.content }}
                />
              </div>

              {/* End ornament divider */}
              <div className="flex items-center gap-3 mt-10">
                <div className="flex-1 h-px bg-[#ead5c9]/60" />
                <span className="text-[#d99b8a] text-lg font-bold">✦</span>
                <div className="flex-1 h-px bg-[#ead5c9]/60" />
              </div>

              {/* Story tags */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {story.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 bg-[#f7eadc]/60 border border-[#ead5c9]/70 text-[#7a4a3a] rounded-full hover:border-[#c77966] cursor-pointer transition-all hover:scale-[1.03]"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Response Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-3xl border border-[#eadfd2] shadow-[0_4px_24px_rgba(59,23,20,0.04)] p-6 sm:p-8"
            >
              <h3
                className="text-lg font-bold text-[#3b1714] mb-6 flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                <MessageCircle size={18} className="text-[#c77966]" />
                {story.commentsCount} Responses
              </h3>

              {/* Comment editor box */}
              <div className="flex gap-3 mb-8 p-4 bg-[#f7eadc]/40 rounded-2xl border border-[#ead5c9]/60 shadow-[inset_0_1px_3px_rgba(59,23,20,0.02)]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c77966] to-[#d99b8a] flex items-center justify-center flex-shrink-0 text-white font-bold shadow-sm">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : 'Y'}
                </div>
                <div className="flex-1">
                  <textarea
                    rows={2}
                    placeholder="Share your thoughts on this story..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-transparent text-sm text-[#3b1714] placeholder-[#7a4a3a]/50 resize-none focus:outline-none"
                    style={{ fontFamily: "'Lora', serif" }}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handlePostComment}
                      disabled={!commentText.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white text-xs font-bold rounded-full hover:shadow-md disabled:opacity-50 transition-all cursor-pointer"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      <Send size={11} />
                      Post Response
                    </button>
                  </div>
                </div>
              </div>

              {/* Responses stack */}
              <div className="space-y-4">
                {(!story.comments || story.comments.length === 0) ? (
                  <p className="text-center py-6 text-sm text-[#7a4a3a]/80 italic" style={{ fontFamily: "'Lora', serif" }}>
                    No responses yet. Be the first to leave a thought.
                  </p>
                ) : (
                  story.comments.map((comment: any) => (
                    <div key={comment._id || comment.id} className="p-4 bg-[#fffdfa]/50 border border-[#ead5c9]/50 rounded-2xl flex gap-3.5 shadow-[0_2px_10px_rgba(59,23,20,0.02)]">
                      <img
                        src={comment.user?.avatar || `https://api.dicebear.com/7.x/lorelei/svg?seed=${comment.user?.name}`}
                        alt={comment.user?.name || 'User'}
                        className="w-9 h-9 rounded-full bg-[#f7eadc] border border-[#ead5c9]/60 object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <span className="text-sm font-bold text-[#3b1714] mr-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {comment.user?.name || 'User'}
                            </span>
                            <span className="text-[11px] text-[#7a4a3a]/70 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-[#7a4a3a] leading-relaxed mb-2 font-serif italic" style={{ fontFamily: "'Lora', serif" }}>
                          {comment.text}
                        </p>
                        <button className="flex items-center gap-1.5 text-xs text-[#7a4a3a]/65 hover:text-[#c77966] transition-colors cursor-pointer">
                          <ThumbsUp size={11} />
                          <span style={{ fontFamily: "'Poppins', sans-serif" }}>0</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Immersive Author Sidebar */}
          <div className="space-y-4">
            {/* Author Profile Note */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.16 }}
              className="bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl border border-[#eadfd2] p-5 shadow-[0_6px_24px_rgba(59,23,20,0.04)] lg:mt-16 flex flex-col items-center text-center"
            >
              <h4
                className="text-[10px] text-[#7a4a3a] font-bold uppercase tracking-widest mb-4 w-full text-left border-b border-[#ead5c9]/60 pb-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                About the Author
              </h4>
              
              <img
                src={story.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.authorName || 'Author')}&background=8E7C68&color=fff&size=150`}
                alt={story.authorName}
                className="w-16 h-16 rounded-full border-2 border-[#ead5c9] bg-[#f7eadc] mb-3 object-cover shadow-sm"
              />
              
              <Link
                to="/profile"
                className="text-base font-extrabold text-[#3b1714] hover:text-[#c77966] transition-colors mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {story.authorName}
              </Link>
              
              <p className="text-[10px] text-[#c77966] font-bold tracking-wide uppercase mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {story.category} Writer
              </p>
              
              <p className="text-xs text-[#7a4a3a] leading-relaxed mb-4 font-serif italic max-w-[220px]" style={{ fontFamily: "'Lora', serif" }}>
                "{story.authorBio || 'A passionate storyteller who weaves magic into every word.'}"
              </p>
              
              <div className="flex gap-4 mb-4 border-y border-[#ead5c9]/50 py-2 w-full">
                <div className="text-center flex-1">
                  <p className="text-base font-extrabold text-[#3b1714]" style={{ fontFamily: "'Playfair Display', serif" }}>{authorStats.totalStories}</p>
                  <p className="text-[10px] text-[#7a4a3a] font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>Stories</p>
                </div>
                <div className="text-center flex-1 border-x border-[#ead5c9]/45">
                  <p className="text-base font-extrabold text-[#3b1714]" style={{ fontFamily: "'Playfair Display', serif" }}>{authorStats.followersCount}</p>
                  <p className="text-[10px] text-[#7a4a3a] font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>Followers</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-base font-extrabold text-[#3b1714]" style={{ fontFamily: "'Playfair Display', serif" }}>{authorStats.totalLikesReceived}</p>
                  <p className="text-[10px] text-[#7a4a3a] font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>Likes</p>
                </div>
              </div>

              {(() => {
                const authorId = story.author?._id || story.author;
                const currentUId = currentUser?.id || currentUser?._id;
                const isSelf = currentUId && authorId && currentUId.toString() === authorId.toString();

                if (isSelf) {
                  return (
                    <span className="text-[10px] text-[#c77966] font-bold tracking-wider uppercase bg-[#ead5c9]/40 px-4 py-1.5 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Your masterwork
                    </span>
                  );
                }

                return (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`w-full py-2.5 text-xs font-bold tracking-wider uppercase rounded-full hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                      authorStats.isFollowing
                        ? 'bg-[#3b1714] text-white hover:bg-[#5a2723]'
                        : 'bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white hover:scale-[1.02]'
                    }`}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {followLoading ? 'Thinking...' : authorStats.isFollowing ? 'Following' : 'Follow Author'}
                  </button>
                );
              })()}
            </motion.div>

            {/* Tale statistics panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22 }}
              className="bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl border border-[#eadfd2] p-5 shadow-[0_6px_24px_rgba(59,23,20,0.04)]"
            >
              <h4
                className="text-[10px] text-[#7a4a3a] font-bold uppercase tracking-widest mb-4 border-b border-[#ead5c9]/60 pb-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Story Stats
              </h4>
              <div className="space-y-3 font-medium">
                {[
                  { label: 'Total Likes', value: story.likes.toLocaleString(), icon: Heart },
                  { label: 'Responses', value: story.commentsCount.toString(), icon: MessageCircle },
                  { label: 'Read Time', value: story.readTime, icon: Clock },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#7a4a3a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      <item.icon size={13} className="text-[#d99b8a]" />
                      {item.label}
                    </div>
                    <span className="font-extrabold text-[#3b1714]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recommendation list */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.28 }}
              className="bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl border border-[#eadfd2] p-5 shadow-[0_6px_24px_rgba(59,23,20,0.04)]"
            >
              <div className="flex items-center justify-between mb-4 border-b border-[#ead5c9]/60 pb-2">
                <h4
                  className="text-[10px] text-[#7a4a3a] font-bold uppercase tracking-widest"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  You Might Like
                </h4>
                <Link
                  to="/library"
                  className="flex items-center gap-0.5 text-xs text-[#c77966] font-bold hover:text-[#7a4a3a] transition-colors"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  See all <ChevronRight size={13} />
                </Link>
              </div>
              <div className="space-y-3">
                {moreStories.length === 0 ? (
                  <p className="text-xs italic text-[#7a4a3a] text-center py-4">No related whispers found yet.</p>
                ) : (
                  moreStories.map((s, i) => (
                    <StoryCard key={s.id} story={s} index={i} variant="compact" />
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
