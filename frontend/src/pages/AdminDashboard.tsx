import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, MessageCircle, TrendingUp, Shield,
  Trash2, Edit3, Eye, Search, ChevronDown, BarChart2,
  AlertCircle, Check, X, Ban, Star
} from 'lucide-react';
import { adminApi } from '../api/adminApi';

export default function AdminDashboard() {
  const [storySearch, setStorySearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [activeSection, setActiveSection] = useState<'overview' | 'stories' | 'users'>('overview');
  const [stories, setStories] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalStories: 0, totalComments: 0, totalLikes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'author' | 'reader' | 'admin'>('all');
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const fetchedUsers = await adminApi.getUsers();
        setAllUsers(fetchedUsers);
        
        const fetchedStories = await adminApi.getStories();
        const mappedStories = fetchedStories.map((s: any) => ({
          ...s,
          id: s._id,
          author: s.author?.name || 'Unknown',
          authorId: s.author?._id || s.author,
          authorAvatar: s.author?.avatar,
          likes: Array.isArray(s.likes) ? s.likes.length : (s.likes || 0),
          comments: Array.isArray(s.comments) ? s.comments.length : (s.comments || 0),
        }));
        setStories(mappedStories);

        const adminStats = await adminApi.getStats();
        setStats({
          totalUsers: adminStats.metrics?.totalUsers ?? fetchedUsers.length,
          totalStories: adminStats.metrics?.totalStories ?? mappedStories.length,
          totalComments: adminStats.metrics?.totalComments ?? 0,
          totalLikes: adminStats.metrics?.totalLikes ?? mappedStories.reduce((acc: number, s: any) => acc + (s.likes || 0), 0)
        });

        if (adminStats.recentActivity && Array.isArray(adminStats.recentActivity)) {
          const mappedActivities = adminStats.recentActivity.map((act: any) => {
            let icon = BookOpen;
            let color = 'text-[#c77966] bg-rose-50';
            if (act.type === 'user') {
              icon = Users;
              color = 'text-blue-500 bg-blue-50';
            } else if (act.type === 'comment') {
              icon = MessageCircle;
              color = 'text-purple-500 bg-purple-50';
            }
            return {
              ...act,
              icon,
              color,
              time: act.time ? new Date(act.time).toLocaleDateString() : 'Just now'
            };
          });
          setActivities(mappedActivities);
        } else {
          // Fallback derivation
          const derivedActs: any[] = [];
          mappedStories.slice(0, 3).forEach(story => {
            derivedActs.push({
              type: 'story',
              message: `New quill "${story.title}" was published by ${story.author}`,
              time: story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'Just now',
              icon: BookOpen,
              color: 'text-[#c77966] bg-[#c77966]/10 border border-[#c77966]/20'
            });
          });
          fetchedUsers.slice(0, 2).forEach(u => {
            derivedActs.push({
              type: 'user',
              message: `New storyteller "${u.name}" joined the circle`,
              time: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Just now',
              icon: Users,
              color: 'text-amber-700 bg-amber-50 border border-amber-100'
            });
          });
          setActivities(derivedActs);
        }
      } catch (err: any) {
        console.error('Failed to load admin stats:', err);
        setError(err.message || 'Unable to connect to Whispering Quills server.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you absolutely sure you wish to delete this user? All their stories will be permanently removed.")) return;
    try {
      await adminApi.deleteUser(userId);
      setAllUsers(prev => prev.filter(u => u._id !== userId && u.id !== userId));
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Could not delete user.');
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!window.confirm("Are you absolutely sure you wish to delete this story?")) return;
    try {
      await adminApi.deleteStory(storyId);
      setStories(prev => prev.filter(s => s.id !== storyId));
      setStats(prev => ({ ...prev, totalStories: prev.totalStories - 1 }));
    } catch (error) {
      console.error('Failed to delete story:', error);
      alert('Could not delete story.');
    }
  };

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      sub: `${stats.totalUsers} registered`,
      icon: Users,
      color: 'from-[#c77966] to-[#d99b8a]',
      trend: '+8.2%'
    },
    {
      label: 'Total Stories',
      value: stats.totalStories.toLocaleString(),
      sub: `${stats.totalStories} published`,
      icon: BookOpen,
      color: 'from-[#7a4a3a] to-[#c77966]',
      trend: '+12.4%'
    },
    {
      label: 'Total Comments',
      value: stats.totalComments.toLocaleString(),
      sub: `${stats.totalComments} comments`,
      icon: MessageCircle,
      color: 'from-[#3b1714] to-[#7a4a3a]',
      trend: '+5.7%'
    },
    {
      label: 'Total Likes',
      value: stats.totalLikes.toLocaleString(),
      sub: `${stats.totalLikes} likes`,
      icon: TrendingUp,
      color: 'from-[#d99b8a] to-[#c77966]',
      trend: '+0.2%'
    },
  ];

  const filteredStories = stories.filter(s =>
    (s.title && s.title.toLowerCase().includes(storySearch.toLowerCase())) ||
    (s.author && s.author.toLowerCase().includes(storySearch.toLowerCase()))
  );

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()));
    
    let matchesRole = true;
    if (roleFilter === 'author') {
      matchesRole = stories.some(s => (s.authorId || s.author) === u._id);
    } else if (roleFilter === 'reader') {
      matchesRole = !stories.some(s => (s.authorId || s.author) === u._id) && u.role !== 'admin';
    } else if (roleFilter === 'admin') {
      matchesRole = u.role === 'admin';
    }
    
    return matchesSearch && matchesRole;
  });

  const totalStoriesCount = stories.length;
  const categoryCounts: { [key: string]: number } = {};
  stories.forEach(s => {
    if (s.category) {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    }
  });
  const computedCategories = Object.keys(categoryCounts).map(name => ({
    name,
    pct: totalStoriesCount > 0 ? Math.round((categoryCounts[name] / totalStoriesCount) * 100) : 0
  })).sort((a, b) => b.pct - a.pct).slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#f7eadc] paper-texture">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#d99b8a] border-t-[#c77966] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#7a4a3a] italic font-serif">Opening administrative ledgers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4 bg-[#f7eadc] paper-texture">
        <div className="bg-[#fff7ef] border-2 border-[#eadfd2] rounded-3xl p-8 max-w-md w-full text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-[#d99b8a] rounded-tl-md" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-[#d99b8a] rounded-tr-md" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-[#d99b8a] rounded-bl-md" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-[#d99b8a] rounded-br-md" />
          
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 border border-red-200">
            <AlertCircle size={24} className="text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-[#3b1714] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Unable to Connect
          </h3>
          <p className="text-sm text-[#7a4a3a] leading-relaxed mb-6 font-serif italic" style={{ fontFamily: "'Lora', serif" }}>
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2.5 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white text-sm font-semibold rounded-full hover:shadow-md transition-all cursor-pointer"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20 paper-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-8"
        >
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c77966] to-[#7a4a3a] flex items-center justify-center shadow-md">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#c77966] uppercase tracking-widest" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Administration
              </p>
              <h1 className="text-3xl font-extrabold text-[#3b1714]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Admin Dashboard
              </h1>
            </div>
          </div>
          <p className="text-sm text-[#7a4a3a] font-serif italic" style={{ fontFamily: "'Lora', serif" }}>
            Welcome back, Administrator. Altering story coordinates and circles below.
          </p>
        </motion.div>

        {/* Section selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#fffdfa] border border-[#eadfd2] rounded-xl w-fit mb-6 shadow-[0_2px_10px_-3px_rgba(59,23,20,0.04)]">
          {(['overview', 'stories', 'users'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize cursor-pointer ${
                activeSection === tab
                  ? 'bg-gradient-to-r from-[#3b1714] to-[#7a4a3a] text-white shadow-sm'
                  : 'text-[#7a4a3a] hover:text-[#3b1714]'
              }`}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -3, 
                boxShadow: "0 10px 25px -5px rgba(59,23,20,0.08)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 22, delay: i * 0.05 }}
              className="bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl border border-[#eadfd2] p-4 sm:py-3.5 sm:px-4.5 shadow-[0_4px_16px_-4px_rgba(59,23,20,0.05)] transition-all duration-300 flex flex-col items-start"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-[0_3px_8px_-1px_rgba(199,121,102,0.18)]`}>
                  <card.icon size={15} className="text-white" />
                </div>
                <span className="text-[9px] font-bold text-green-700 bg-green-50 border border-green-200/50 px-2 py-0.5 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {card.trend}
                </span>
              </div>
              
              <p
                className="text-xl sm:text-2xl font-extrabold text-[#3b1714] tracking-tight leading-none"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {card.value}
              </p>
              
              {/* Decorative separator */}
              <div className="h-[1px] w-6 bg-[#d99b8a]/40 my-1.5" />

              <p className="text-[11px] font-semibold text-[#7a4a3a] leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {card.label}
              </p>
              <p className="text-[10px] text-[#7a4a3a]/65" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {card.sub}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Block */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl border border-[#eadfd2] shadow-sm p-5 sm:p-6"
            >
              <h3 className="font-extrabold text-[#3b1714] mb-4 flex items-center gap-2 border-b border-[#ead5c9]/60 pb-2 text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                <BarChart2 size={16} className="text-[#c77966]" />
                Platform Activity Log
              </h3>
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <p className="text-xs italic text-[#7a4a3a]/80 text-center py-6 font-serif">No records found yet.</p>
                ) : (
                  activities.map((activity, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-[#fffdfa]/60 border border-[#ead5c9]/45 rounded-xl transition-all duration-300 hover:shadow-sm"
                    >
                      <div className={`w-8 h-8 rounded-full ${activity.color} flex items-center justify-center flex-shrink-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]`}>
                        <activity.icon size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#3b1714] font-medium truncate" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {activity.message}
                        </p>
                      </div>
                      <span className="text-[10px] text-[#7a4a3a]/65 font-bold flex-shrink-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {activity.time}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Side insights */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl border border-[#eadfd2] shadow-sm p-5">
                <h4 className="font-extrabold text-[#3b1714] mb-3 border-b border-[#ead5c9]/60 pb-1.5 text-xs uppercase tracking-widest" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Category Breakdown
                </h4>
                <div className="space-y-3">
                  {computedCategories.length === 0 ? (
                    <p className="text-xs italic text-[#7a4a3a]/85 text-center py-4 font-serif">No records found yet.</p>
                  ) : (
                    computedCategories.map((cat) => (
                      <div key={cat.name}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-[#7a4a3a] font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>{cat.name}</span>
                          <span className="text-[#c77966] font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>{cat.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-[#ead5c9]/60 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${cat.pct}%` }}
                            transition={{ duration: 0.7 }}
                            className="h-full bg-gradient-to-r from-[#c77966] to-[#d99b8a] rounded-full"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Stories active section */}
        {activeSection === 'stories' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl border border-[#eadfd2] shadow-sm overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-[#ead5c9]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#fffdfa]/80">
              <h3 className="font-extrabold text-[#3b1714] flex items-center gap-2 text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                <BookOpen size={16} className="text-[#c77966]" />
                Manage Stories ({filteredStories.length})
              </h3>
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d99b8a]" />
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={storySearch}
                  onChange={e => setStorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#f7eadc]/60 border border-[#ead5c9] rounded-xl text-xs text-[#3b1714] placeholder-[#7a4a3a]/40 focus:outline-none focus:border-[#c77966] transition-all"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f7eadc]/40 text-[#7a4a3a] text-[10px] font-bold uppercase tracking-widest border-b border-[#eadfd2]/60">
                    <th className="px-5 py-3.5 text-left font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>Story</th>
                    <th className="px-4 py-3.5 text-left font-bold hidden sm:table-cell" style={{ fontFamily: "'Poppins', sans-serif" }}>Author</th>
                    <th className="px-4 py-3.5 text-left font-bold hidden md:table-cell" style={{ fontFamily: "'Poppins', sans-serif" }}>Category</th>
                    <th className="px-4 py-3.5 text-center font-bold hidden lg:table-cell" style={{ fontFamily: "'Poppins', sans-serif" }}>Likes</th>
                    <th className="px-4 py-3.5 text-center font-bold hidden lg:table-cell" style={{ fontFamily: "'Poppins', sans-serif" }}>Status</th>
                    <th className="px-5 py-3.5 text-right font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ead5c9]/50 text-xs">
                  {filteredStories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-[#7a4a3a] italic font-serif">
                        No records found yet.
                      </td>
                    </tr>
                  ) : (
                    filteredStories.map((story, i) => (
                      <motion.tr
                        key={story.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-[#f7eadc]/35 transition-colors duration-200"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={story.coverImage}
                              alt={story.title}
                              className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-[#ead5c9]/45"
                            />
                            <div>
                              <p className="font-bold text-[#3b1714] line-clamp-1 text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {story.title}
                              </p>
                              <p className="text-[10px] text-[#7a4a3a]/65 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                {story.readTime || '5 min'} • {new Date(story.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <img src={story.authorAvatar} alt={story.author} className="w-6.5 h-6.5 rounded-full bg-[#ead5c9] object-cover" />
                            <span className="text-xs font-semibold text-[#7a4a3a]" style={{ fontFamily: "'Poppins', sans-serif" }}>{story.author}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-[#f7eadc]/80 border border-[#ead5c9] text-[#7a4a3a] rounded-md uppercase tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {story.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell font-bold text-[#3b1714]">
                          {story.likes.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-green-50 text-green-700 border border-green-200/50" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Published
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link 
                              to={`/story/${story.id}`}
                              className="w-7 h-7 rounded-lg text-[#7a4a3a] hover:bg-[#ead5c9]/60 hover:text-[#3b1714] transition-colors flex items-center justify-center" 
                              title="View"
                            >
                              <Eye size={14} />
                            </Link>
                            <Link 
                              to={`/create?edit=${story.id}`}
                              className="w-7 h-7 rounded-lg text-[#7a4a3a] hover:bg-[#ead5c9]/60 hover:text-[#c77966] transition-colors flex items-center justify-center" 
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </Link>
                            <button 
                              onClick={() => handleDeleteStory(story.id)}
                              className="w-7 h-7 rounded-lg text-[#7a4a3a] hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center cursor-pointer" 
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-[#ead5c9]/70 flex items-center justify-between bg-[#fffdfa]/50">
              <span className="text-[11px] font-semibold text-[#7a4a3a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Showing {filteredStories.length} of {stories.length} stories
              </span>
            </div>
          </motion.div>
        )}

        {/* Users active section */}
        {activeSection === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl border border-[#eadfd2] shadow-sm overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-[#ead5c9]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#fffdfa]/80">
              <h3 className="font-extrabold text-[#3b1714] flex items-center gap-2 text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                <Users size={16} className="text-[#c77966]" />
                Manage Users ({filteredUsers.length})
              </h3>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d99b8a]" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#f7eadc]/60 border border-[#ead5c9] rounded-xl text-xs text-[#3b1714] placeholder-[#7a4a3a]/40 focus:outline-none focus:border-[#c77966] transition-all"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </div>
                <div className="relative">
                  <select 
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value as any)}
                    className="appearance-none pl-3 pr-7 py-2 bg-[#f7eadc]/60 border border-[#ead5c9] rounded-xl text-xs text-[#7a4a3a] focus:outline-none cursor-pointer font-semibold" 
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <option value="all">All roles</option>
                    <option value="author">Authors</option>
                    <option value="reader">Readers</option>
                    <option value="admin">Admins</option>
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7a4a3a] pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f7eadc]/40 text-[#7a4a3a] text-[10px] font-bold uppercase tracking-widest border-b border-[#eadfd2]/60">
                    <th className="px-5 py-3.5 text-left font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>User</th>
                    <th className="px-4 py-3.5 text-left font-bold hidden sm:table-cell" style={{ fontFamily: "'Poppins', sans-serif" }}>Email</th>
                    <th className="px-4 py-3.5 text-center font-bold hidden md:table-cell" style={{ fontFamily: "'Poppins', sans-serif" }}>Stories</th>
                    <th className="px-4 py-3.5 text-center font-bold hidden lg:table-cell" style={{ fontFamily: "'Poppins', sans-serif" }}>Followers</th>
                    <th className="px-4 py-3.5 text-center font-bold hidden lg:table-cell" style={{ fontFamily: "'Poppins', sans-serif" }}>Role</th>
                    <th className="px-5 py-3.5 text-right font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ead5c9]/50 text-xs">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-[#7a4a3a] italic font-serif">
                        No records found yet.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, i) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-[#f7eadc]/35 transition-colors duration-200"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8E7C68&color=fff&size=150`}
                              alt={user.name}
                              className="w-8.5 h-8.5 rounded-full bg-[#ead5c9] object-cover border border-[#ead5c9]/45"
                            />
                            <div>
                              <p className="font-bold text-[#3b1714]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                {user.name}
                              </p>
                              <p className="text-[10px] text-[#7a4a3a]/65 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Joined {new Date(user.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell font-semibold text-[#7a4a3a]">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell font-bold text-[#3b1714]">
                          {stories.filter(s => (s.authorId || s.author) === user._id).length}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell font-bold text-[#3b1714]">
                          {user.followers ? user.followers.length : 0}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            user.role === 'admin'
                              ? 'bg-[#c77966]/10 text-[#c77966] border border-[#c77966]/20'
                              : 'bg-blue-50 text-blue-700 border border-blue-200/50'
                          }`} style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {user.role === 'admin' ? 'Admin' : 'Author'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link 
                              to="/profile"
                              className="w-7 h-7 rounded-lg text-[#7a4a3a] hover:bg-[#ead5c9]/60 hover:text-[#3b1714] transition-colors flex items-center justify-center" 
                              title="View Profile"
                            >
                              <Eye size={14} />
                            </Link>
                            <button 
                              onClick={() => handleDeleteUser(user._id || user.id)}
                              className="w-7 h-7 rounded-lg text-[#7a4a3a] hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center cursor-pointer" 
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-[#ead5c9]/70 flex items-center justify-between bg-[#fffdfa]/50">
              <span className="text-[11px] font-semibold text-[#7a4a3a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Showing {filteredUsers.length} of {allUsers.length} users
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
