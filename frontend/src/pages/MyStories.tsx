import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Heart, MessageCircle, Eye, Edit3,
  Trash2, Plus, BarChart2, Clock, Star, TrendingUp
} from 'lucide-react';
import { storyApi } from '../api/storyApi';

export default function MyStories() {
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [myStories, setMyStories] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'most-viewed' | 'most-liked' | 'recently-edited'>('newest');

  useEffect(() => {
    const fetchMyStories = async () => {
      try {
        setLoading(true);
        const data = await storyApi.getMyStories();
        const mappedStories = data.map((s: any) => ({
          ...s,
          id: s._id,
          authorName: s.author?.name || 'Unknown Author',
          authorAvatar: s.author?.avatar,
          likes: Array.isArray(s.likes) ? s.likes.length : (s.likes || 0),
          comments: Array.isArray(s.comments) ? s.comments.length : (s.comments || 0),
          views: s.views || 0,
        }));
        
        setMyStories(mappedStories.filter((s: any) => !s.title.startsWith('[Draft]')));
        setDrafts(mappedStories.filter((s: any) => s.title.startsWith('[Draft]')));
      } catch (error) {
        console.error('Failed to fetch my stories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyStories();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await storyApi.deleteStory(deleteId);
      setMyStories(prev => prev.filter(s => s.id !== deleteId));
      setDrafts(prev => prev.filter(s => s.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error('Failed to delete story:', error);
      alert('Could not delete story.');
    }
  };

  const totalStories = myStories.length + drafts.length;
  const totalLikes = myStories.reduce((acc, s) => acc + (s.likes || 0), 0) + drafts.reduce((acc, s) => acc + (s.likes || 0), 0);
  const totalComments = myStories.reduce((acc, s) => acc + (s.comments || 0), 0) + drafts.reduce((acc, s) => acc + (s.comments || 0), 0);
  const avgRating = totalStories > 0 ? (totalLikes / totalStories).toFixed(1) : '0.0';

  const bestStory = myStories.length > 0 ? myStories.reduce((best, story) => (story.likes > (best.likes || 0) ? story : best), myStories[0]) : null;
  const bestStoryTitle = bestStory ? bestStory.title : 'No Whispers Published';
  const bestStoryLikes = bestStory ? `${bestStory.likes.toLocaleString()} likes` : '0 likes';

  // Derived metrics
  const storiesThisWeek = [...myStories, ...drafts].filter(s => {
    const created = new Date(s.createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return created >= oneWeekAgo;
  }).length;

  const maxLikes = Math.max(...[...myStories, ...drafts].map(s => s.likes || 0), 0);

  const statCards = [
    { 
      label: storiesThisWeek > 0 ? `+${storiesThisWeek} this week` : 'Steady shelf', 
      value: `${totalStories} ${totalStories === 1 ? 'Story' : 'Stories'}`, 
      icon: BookOpen, 
      color: 'from-[#c77966] to-[#d99b8a]' 
    },
    { 
      label: `Most liked: ${maxLikes}`, 
      value: `${totalLikes} ${totalLikes === 1 ? 'Like' : 'Likes'}`, 
      icon: Heart, 
      color: 'from-[#7a4a3a] to-[#c77966]' 
    },
    { 
      label: 'Comments', 
      value: totalComments === 0 ? 'No conversations yet' : `${totalComments} Comments`, 
      icon: MessageCircle, 
      color: 'from-[#3b1714] to-[#7a4a3a]' 
    },
    { 
      label: 'Avg. Likes / Tale', 
      value: 'Growing steadily', 
      icon: Star, 
      color: 'from-[#d99b8a] to-[#c77966]' 
    },
  ];

  const stories = activeTab === 'published' ? myStories : drafts;

  // Sorting
  const sortedStories = [...stories].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'most-viewed') {
      return (b.views || 0) - (a.views || 0);
    }
    if (sortBy === 'most-liked') {
      return b.likes - a.likes;
    }
    if (sortBy === 'recently-edited') {
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    }
    return 0;
  });

  const getDynamicPulseText = (story: any) => {
    const timeDiff = Date.now() - new Date(story.updatedAt || story.createdAt).getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 2) {
      const isNew = Date.now() - new Date(story.createdAt).getTime() < 1000 * 60 * 60 * 24 * 2;
      return isNew ? "Freshly published" : "Recently updated";
    }
    if (story.views > 0 && story.views <= 5) {
      return "Readers are beginning to discover this tale";
    }
    if (story.comments === 0) {
      return "No conversations yet";
    }
    if (story.likes > 3) {
      return "Growing steadily";
    }
    return "Readers engaged this week";
  };

  return (
    <div className="min-h-screen pt-20 pb-20 paper-texture">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#fff7ef] to-[#f7eadc] border-b border-[#ead5c9] py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px w-8 bg-[#d99b8a]" />
              <span className="text-xs font-bold tracking-widest uppercase text-[#c77966]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                My Collection
              </span>
            </div>
            <h1
              className="text-4xl font-extrabold text-[#3b1714] tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              My Stories
            </h1>
            <p className="text-[#7a4a3a] mt-1 text-sm font-serif italic" style={{ fontFamily: "'Lora', serif" }}>
              Your literary shelf — crafted with care and devotion
            </p>
          </motion.div>
          <Link
            to="/create"
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#b56855] hover:to-[#c77966] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 text-sm cursor-pointer"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <Plus size={16} />
            Write New Story
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -3, 
                boxShadow: "0 10px 25px -5px rgba(59,23,20,0.08)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 22, delay: i * 0.05 }}
              className="bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl border border-[#eadfd2] p-4 sm:py-3.5 sm:px-4.5 shadow-[0_4px_16px_-4px_rgba(59,23,20,0.05)] transition-all duration-300 flex flex-col items-start"
            >
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2.5 shadow-[0_3px_8px_-1px_rgba(199,121,102,0.18)]`}>
                <stat.icon size={15} className="text-white" />
              </div>
              
              <p
                className={`font-extrabold text-[#3b1714] tracking-tight leading-none ${
                  stat.value.length > 18 
                    ? 'text-[14px] sm:text-[15px] whitespace-nowrap' 
                    : stat.value.length > 12 
                    ? 'text-[16px] sm:text-[18px] whitespace-nowrap'
                    : 'text-xl sm:text-[22px]'
                }`}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {stat.value}
              </p>
              
              {/* Decorative separator */}
              <div className="h-[1px] w-6 bg-[#d99b8a]/40 my-1.5" />

              <p className="text-[11px] font-semibold text-[#7a4a3a] leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tabs & Sorting dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 p-1 bg-[#fffdfa] border border-[#ead5c9]/85 rounded-xl w-fit shadow-[0_2px_10px_-3px_rgba(59,23,20,0.04)]">
            {(['published', 'drafts'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize cursor-pointer ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white shadow-sm'
                    : 'text-[#7a4a3a] hover:text-[#3b1714]'
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {tab} {tab === 'published' ? `(${myStories.length})` : `(${drafts.length})`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7a4a3a] font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-[#fffdfa] border border-[#ead5c9]/80 rounded-xl text-xs font-semibold text-[#7a4a3a] hover:border-[#c77966] focus:border-[#c77966] transition-colors outline-none cursor-pointer shadow-[0_2px_10px_-3px_rgba(59,23,20,0.04)]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <option value="newest">Newest</option>
              <option value="most-viewed">Most Viewed</option>
              <option value="most-liked">Most Liked</option>
              <option value="recently-edited">Recently Edited</option>
            </select>
          </div>
        </div>

        {/* Stories list */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-[#d99b8a] border-t-[#c77966] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#7a4a3a] font-serif italic" style={{ fontFamily: "'Lora', serif" }}>Loading whispers...</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-16 bg-[#fff7ef]/75 backdrop-blur-md rounded-2xl border border-[#ead5c9] p-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#f7eadc]/60 flex items-center justify-center mx-auto mb-4 border border-[#ead5c9]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
                <BookOpen size={24} className="text-[#c77966] animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-[#3b1714] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Your shelf awaits its next masterpiece.
              </h3>
              <p className="text-sm text-[#7a4a3a]/80 mb-6 max-w-sm mx-auto font-serif italic" style={{ fontFamily: "'Lora', serif" }}>
                Readers are waiting to discover your tales. Put pen to parchment and let your imagination soar.
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all text-sm cursor-pointer"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Plus size={16} />
                Write Your First Story
              </Link>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {sortedStories.map((story, i) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  whileHover={{ 
                    y: -3, 
                    boxShadow: "0 18px 48px rgba(59,23,20,0.125)",
                    borderColor: "rgba(199, 121, 102, 0.4)"
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 24,
                    delay: i * 0.05 
                  }}
                  className={`group rounded-2xl ring-1 ring-[#fffdfa] inset border border-[#eadfd2] shadow-[0_12px_32px_rgba(59,23,20,0.07)] overflow-hidden transition-all duration-300 ${
                    activeTab === 'published' 
                      ? 'bg-gradient-to-br from-[#fffdfa] to-[#f9f1e8]' 
                      : 'bg-gradient-to-br from-[#faf3eb] to-[#e8dccb]/95'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 sm:p-5 sm:py-4">
                    {/* Cover Wrap */}
                    <div className="relative flex-shrink-0 group overflow-hidden rounded-xl w-full sm:w-28 h-24 sm:h-20 shadow-sm border border-[#ead5c9]/40">
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {activeTab === 'drafts' && (
                        <div className="absolute inset-0 bg-[#3b1714]/40 flex items-center justify-center backdrop-blur-[1px]">
                          <span className="text-[10px] text-white font-bold bg-[#7a4a3a]/80 px-2 py-0.5 rounded-full tracking-wider border border-white/20" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            DRAFT
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span
                              className="text-[10px] text-[#c77966] font-bold tracking-wider uppercase"
                              style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                              {story.category}
                            </span>
                            
                            {/* Badges */}
                            {activeTab === 'published' ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-[#7c8f77]/10 text-[#3a4f37] border border-[#7c8f77]/25 rounded-md" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Published
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-[#7a4a3a]/10 text-[#7a4a3a] border border-[#7a4a3a]/25 rounded-md" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Draft
                              </span>
                            )}
                            
                            {story.featured && (
                              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-[#c77966]/15 text-[#3b1714] border border-[#c77966]/25 rounded-md" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Editor's Pick
                              </span>
                            )}

                            {story.likes > 4 && (
                              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-[#d99b8a]/20 text-[#7a4a3a] border border-[#d99b8a]/35 rounded-md animate-pulse" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Trending
                              </span>
                            )}
                          </div>
                          
                          <h3
                            className="text-xl font-bold text-[#3b1714] leading-snug line-clamp-1 group-hover:text-[#c77966] transition-colors duration-300"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {story.title}
                          </h3>
                        </div>
                      </div>

                      <p
                        className="text-xs text-[#7a4a3a]/85 mb-2 line-clamp-1 italic font-serif"
                        style={{ fontFamily: "'Lora', serif" }}
                      >
                        {story.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-medium text-[#7a4a3a]/90" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        <span className="flex items-center gap-1.5">
                          <Heart size={12} className="text-[#c77966]/90" />
                          {story.likes.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageCircle size={12} className="text-[#d99b8a]/90" />
                          {story.comments}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Eye size={12} className="text-[#7a4a3a]/80" />
                          {story.views === 0 ? "New Tale" : `${story.views.toLocaleString()} views`}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-[#7a4a3a]/80" />
                          {story.readTime || '5 min'}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-[#7a4a3a]/70 border-l border-[#ead5c9] pl-3">
                          Edited {new Date(story.updatedAt || story.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Visually Grouped Vertical Action Rail */}
                    <div className="flex items-center sm:flex-col gap-1 p-1 bg-[#f7eadc]/45 border border-[#ead5c9]/45 rounded-2xl shadow-[inset_0_1px_3px_rgba(59,23,20,0.02)] justify-end mt-4 sm:mt-0 flex-shrink-0">
                      {/* View tooltip */}
                      <div className="relative group/tooltip">
                        <Link
                          to={`/story/${story.id}`}
                          className="w-9 h-9 rounded-xl hover:bg-[#c77966]/15 text-[#7a4a3a] hover:text-[#c77966] transition-all duration-300 flex items-center justify-center cursor-pointer hover:shadow-[0_4px_12px_rgba(199,121,102,0.15)] hover:scale-105 active:scale-95"
                        >
                          <Eye size={15} />
                        </Link>
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#3b1714] text-[#fff7ef] text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-all duration-250 ease-out pointer-events-none whitespace-nowrap z-20 shadow-md font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          Read Tale
                        </span>
                      </div>

                      {/* Edit tooltip */}
                      <div className="relative group/tooltip">
                        <Link
                          to={`/create?edit=${story.id}`}
                          className="w-9 h-9 rounded-xl hover:bg-[#c77966]/15 text-[#7a4a3a] hover:text-[#c77966] transition-all duration-300 flex items-center justify-center cursor-pointer hover:shadow-[0_4px_12px_rgba(199,121,102,0.15)] hover:scale-105 active:scale-95"
                        >
                          <Edit3 size={15} />
                        </Link>
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#3b1714] text-[#fff7ef] text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-all duration-250 ease-out pointer-events-none whitespace-nowrap z-20 shadow-md font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          Refine Prose
                        </span>
                      </div>

                      {/* Delete tooltip */}
                      <div className="relative group/tooltip">
                        <button
                          onClick={() => setDeleteId(story.id)}
                          className="w-9 h-9 rounded-xl hover:bg-red-50 text-[#7a4a3a] hover:text-red-500 transition-all duration-300 flex items-center justify-center cursor-pointer hover:shadow-[0_4px_12px_rgba(239,68,68,0.15)] hover:scale-105 active:scale-95"
                        >
                          <Trash2 size={15} />
                        </button>
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-red-500 text-white text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-all duration-250 ease-out pointer-events-none whitespace-nowrap z-20 shadow-md font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          Delete Tale
                        </span>
                      </div>

                      {/* Analytics tooltip */}
                      <div className="relative group/tooltip">
                        <button 
                          className="w-9 h-9 rounded-xl hover:bg-[#c77966]/15 text-[#7a4a3a] hover:text-[#c77966] transition-all duration-300 flex items-center justify-center cursor-pointer hover:shadow-[0_4px_12px_rgba(199,121,102,0.15)] hover:scale-105 active:scale-95"
                        >
                          <BarChart2 size={15} />
                        </button>
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#3b1714] text-[#fff7ef] text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-all duration-250 ease-out pointer-events-none whitespace-nowrap z-20 shadow-md font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          Tale Insights
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Editorial Footer Strip */}
                  <div className="px-5 py-2.5 bg-[#3b1714]/[0.015] border-t border-[#ead5c9]/45 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Tiny glowing dot */}
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c77966] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c77966]"></span>
                      </span>
                      <span className="text-[11px] text-[#7a4a3a] italic font-serif" style={{ fontFamily: "'Lora', serif" }}>
                        {getDynamicPulseText(story)}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#7a4a3a]/65 uppercase tracking-widest font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Tale Pulse
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Softer Editorial Insights Panel */}
        {myStories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-gradient-to-br from-[#fffdfa] to-[#f7eadc] rounded-2xl p-6 text-[#3b1714] shadow-md border border-[#eadfd2]"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-[#c77966]" />
              <h3 className="font-extrabold text-[#3b1714] tracking-tight text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                Your Writing Insights
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Best performing', value: bestStoryTitle, sub: bestStoryLikes },
                { label: 'Total Stories', value: totalStories.toString(), sub: `${myStories.length} Published, ${drafts.length} Drafts` },
                { label: 'Avg. Likes / story', value: `${avgRating} ★`, sub: 'Calculated from all stories' },
                { label: 'Total Comments', value: totalComments.toLocaleString(), sub: 'Engagement on all quills' },
              ].map(item => (
                <div key={item.label} className="p-4 bg-[#fffdfa]/60 border border-[#ead5c9]/50 rounded-2xl min-w-0 transition-all duration-300 hover:shadow-[0_6px_15px_rgba(59,23,20,0.03)] hover:-translate-y-0.5">
                  <p className="text-[10px] text-[#c77966] font-bold tracking-widest uppercase mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>{item.label}</p>
                  <p className="text-[15px] font-extrabold text-[#3b1714] truncate leading-tight" style={{ fontFamily: "'Playfair Display', serif" }} title={item.value}>{item.value}</p>
                  <p className="text-[11px] text-[#7a4a3a]/80 mt-1 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-[#3b1714]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="bg-[#fff7ef] rounded-2xl border border-[#ead5c9] p-7 max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-[#3b1714] text-center mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Delete this story?
            </h3>
            <p className="text-sm text-[#7a4a3a] text-center mb-6 font-serif italic" style={{ fontFamily: "'Lora', serif" }}>
              This action cannot be undone. Your story and all its comments will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 border-2 border-[#ead5c9] text-[#7a4a3a] font-semibold rounded-xl hover:border-[#d99b8a] transition-colors cursor-pointer"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
