import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Feather, BookOpen, Heart, Users, Edit3,
  Calendar, Award, Star, MessageCircle, Mail, AlertCircle
} from 'lucide-react';

import StoryCard from '../components/StoryCard';
import { storyApi } from '../api/storyApi';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'stories' | 'liked' | 'about'>('stories');
  const navigate = useNavigate();
  const { user, updateUserLocal } = useAuth();
  
  const [userStories, setUserStories] = useState<any[]>([]);
  const [likedStories, setLikedStories] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);

  // Edit Profile modal forms
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    avatar: '',
    bio: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const [profileLoading, setProfileLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        setProfileLoading(true);
        setApiError(null);

        // Fetch stories
        const myStories = await storyApi.getMyStories();
        setUserStories(myStories.map((s: any) => ({
          ...s,
          id: s._id,
          authorName: s.author?.name || 'Unknown Author',
          authorAvatar: s.author?.avatar,
          likes: Array.isArray(s.likes) ? s.likes.length : (s.likes || 0),
          comments: Array.isArray(s.comments) ? s.comments.length : (s.comments || 0),
          views: s.views || 0,
        })));

        const liked = await userApi.getLikedStories();
        const mappedLiked = liked.map((s: any) => ({
          ...s,
          id: s._id,
          authorName: s.author?.name || 'Unknown Author',
          authorAvatar: s.author?.avatar,
          likes: Array.isArray(s.likes) ? s.likes.length : (s.likes || 0),
          comments: Array.isArray(s.comments) ? s.comments.length : (s.comments || 0),
          views: s.views || 0,
        }));
        setLikedStories(mappedLiked);

        // Fetch stats
        const { stats } = await userApi.getUserStatsAndProfile(user._id);
        setUserStats(stats);

      } catch (error: any) {
        console.error('Failed to load profile details:', error);
        setApiError(error.message || 'Unable to connect to Whispering Quills server.');
      } finally {
        setProfileLoading(false);
      }
    };

    if (!user) {
      navigate('/login');
      return;
    }

    initializeProfile();
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    setIsSaving(true);
    try {
      const updatedUser = await userApi.updateProfile(editForm);
      updateUserLocal(updatedUser);
      setToast({ message: '✦ Profile revised successfully!', type: 'success' });
      setShowEditModal(false);
    } catch (error: any) {
      console.error(error);
      setToast({ message: error.message || 'Could not save profile changes.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const totalStoriesCount = userStats?.totalStories ?? userStories.length;
  const totalLikesCount = userStats?.totalLikesReceived ?? userStories.reduce((acc, s) => acc + (s.likes || 0), 0);
  const followersCount = userStats?.followersCount ?? (user?.followers?.length || 0);
  const followingCount = userStats?.followingCount ?? (user?.following?.length || 0);

  const earnedAchievements = [];
  if (totalStoriesCount >= 1) {
    earnedAchievements.push({
      icon: Star,
      label: 'Rising Star',
      desc: '1+ stories published',
      color: 'text-[#c77966] bg-[#c77966]/10 border border-[#c77966]/20',
    });
  }
  if (totalStoriesCount >= 10) {
    earnedAchievements.push({
      icon: Feather,
      label: 'Prolific Writer',
      desc: '10+ stories published',
      color: 'text-[#7a4a3a] bg-[#7a4a3a]/10 border border-[#7a4a3a]/20',
    });
  }
  if (totalLikesCount >= 20) {
    earnedAchievements.push({
      icon: Heart,
      label: 'Beloved Author',
      desc: '20+ likes received',
      color: 'text-[#3b1714] bg-[#3b1714]/10 border border-[#3b1714]/20',
    });
  }
  if (followersCount >= 1) {
    earnedAchievements.push({
      icon: Users,
      label: 'Community Pillar',
      desc: '1+ followers',
      color: 'text-[#c77966] bg-[#c77966]/10 border border-[#c77966]/20',
    });
  }

  if (!user) return null;

  if (profileLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#f7eadc] paper-texture">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#d99b8a] border-t-[#c77966] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#7a4a3a] italic font-serif">Leafing through the author index...</p>
        </div>
      </div>
    );
  }

  if (apiError) {
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
            {apiError}
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
      {/* Profile Hero Section */}
      <div className="relative bg-gradient-to-br from-[#3b1714] to-[#5a2723] pt-16 pb-32 shadow-md">
        {/* Decorative circular patterns */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-[#f7eadc]"
              style={{
                width: `${120 + i * 60}px`,
                height: `${120 + i * 60}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Avatar Wrap */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative flex-shrink-0"
            >
              <div className="w-28 h-28 rounded-full border-4 border-[#d99b8a] shadow-2xl overflow-hidden bg-[#fffdfa]">
                <img src={user.avatar || `https://api.dicebear.com/7.x/lorelei/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#c77966] border-2 border-[#3b1714] flex items-center justify-center hover:bg-[#d99b8a] transition-colors cursor-pointer"
              >
                <Edit3 size={13} className="text-white" />
              </button>
            </motion.div>

            {/* User Meta info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 text-center sm:text-left"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                <h1
                  className="text-3xl font-extrabold text-[#f7eadc]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 bg-white/20 border border-white/35 text-white rounded-md text-[10px] font-bold tracking-wider uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {user.role === 'admin' ? 'Platform Admin' : 'Story Writer'}
                </span>
              </div>
              <p className="text-[#d99b8a] text-sm mb-3 font-serif italic" style={{ fontFamily: "'Lora', serif" }}>
                @{user.name.toLowerCase().replace(/\s/g, '_')} • {user.bio || 'A passionate storyteller.'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#d99b8a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <span className="flex items-center gap-1.5"><Mail size={12} className="text-[#d99b8a]" /> {user.email}</span>
                <span className="flex items-center gap-1.5"><Calendar size={12} className="text-[#d99b8a]" /> Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2024'}</span>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2 flex-shrink-0"
            >
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-md"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Edit3 size={13} />
                Edit Profile
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Stats Card Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl border border-[#eadfd2] shadow-[0_10px_35px_rgba(59,23,20,0.08)] mb-6 overflow-hidden"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#eadfd2]/60">
            {[
              { label: 'Stories', value: totalStoriesCount, icon: BookOpen },
              { label: 'Likes Received', value: totalLikesCount.toLocaleString(), icon: Heart },
              { label: 'Comments Received', value: (userStats?.totalCommentsReceived ?? 0).toLocaleString(), icon: MessageCircle },
              { label: 'Followers', value: followersCount, icon: Users },
              { label: 'Following', value: followingCount, icon: Users },
            ].map((stat, idx) => (
              <div key={stat.label} className={`py-4 sm:py-5 text-center flex flex-col items-center justify-center ${idx >= 4 ? 'col-span-2 md:col-span-1' : ''}`}>
                <p
                  className="text-2xl sm:text-3xl font-extrabold text-[#3b1714] mb-0.5"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-[11px] font-semibold text-[#7a4a3a] flex items-center justify-center gap-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <stat.icon size={13} className="text-[#c77966]/90" />
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl border border-[#eadfd2] shadow-[0_4px_20px_rgba(59,23,20,0.03)] p-5 mb-6"
        >
          <h3
            className="text-xs font-bold text-[#3b1714] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#ead5c9]/60 pb-2"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <Award size={15} className="text-[#c77966]" />
            Storyteller Achievements
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {earnedAchievements.length === 0 ? (
              <div className="col-span-full py-4 text-center">
                <p className="text-xs italic text-[#7a4a3a]/80 font-serif">No achievements unlocked yet. Keep writing your whispers.</p>
              </div>
            ) : (
              earnedAchievements.map((ach, i) => (
                <motion.div
                  key={ach.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -2, boxShadow: "0 6px 15px rgba(59,23,20,0.03)" }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-center gap-2.5 p-3.5 bg-[#fffdfa]/60 border border-[#ead5c9]/50 rounded-xl transition-all duration-300"
                >
                  <div className={`w-8.5 h-8.5 rounded-full ${ach.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <ach.icon size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#3b1714]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {ach.label}
                    </p>
                    <p className="text-[10px] text-[#7a4a3a]/90 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {ach.desc}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Custom Tab selectors */}
        <div className="flex items-center gap-1 p-1 bg-[#fffdfa] border border-[#eadfd2] rounded-xl w-fit mb-6 shadow-[0_2px_10px_-3px_rgba(59,23,20,0.04)]">
          {([
            { id: 'stories', label: 'Stories', icon: BookOpen },
            { id: 'liked', label: 'Liked', icon: Heart },
            { id: 'about', label: 'About', icon: Feather },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white shadow-sm'
                  : 'text-[#7a4a3a] hover:text-[#3b1714]'
              }`}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content area */}
        <div className="min-h-[250px] mb-6">
          {activeTab === 'stories' && (
            userStories.length === 0 ? (
              <div className="py-16 text-center bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl border border-[#eadfd2] p-8 shadow-sm">
                <p className="text-lg italic text-[#7a4a3a] font-serif mb-4">Ready to share your next tale? Your readers are waiting.</p>
                <Link to="/create" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white font-semibold rounded-full hover:shadow-md transition-all text-xs cursor-pointer">
                  <Feather size={12} /> Write a Story
                </Link>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
              >
                {userStories.map((story, i) => (
                  <StoryCard key={story.id} story={story} index={i} />
                ))}
              </motion.div>
            )
          )}

          {activeTab === 'liked' && (
            likedStories.length === 0 ? (
              <div className="py-16 text-center bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl border border-[#eadfd2] p-8 shadow-sm">
                <p className="text-lg italic text-[#7a4a3a] font-serif">You haven’t liked any stories yet.</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
              >
                {likedStories.map((story, i) => (
                  <StoryCard key={story.id} story={story} index={i} />
                ))}
              </motion.div>
            )
          )}

          {activeTab === 'about' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl border border-[#eadfd2] p-6 sm:p-8 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3
                    className="text-xl font-bold text-[#3b1714] mb-3.5 border-b border-[#ead5c9]/60 pb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    About {user.name.split(' ')[0]}
                  </h3>
                  <p className="text-sm text-[#7a4a3a] leading-relaxed mb-5 font-serif italic" style={{ fontFamily: "'Lora', serif" }}>
                    {user.bio || `${user.name.split(' ')[0]} began writing at the age of seven, composing small stories on scraps of paper that she would leave for her family to find. Now she shares her tales with a global audience.`}
                  </p>
                  
                  <div className="space-y-1 w-full">
                    {[
                      { label: 'Favorite genres', value: 'Fantasy, Fairy Tale, Romance' },
                      { label: 'Writing since', value: user.createdAt ? new Date(user.createdAt).getFullYear() : '2024' },
                      { label: 'Languages', value: 'English, French' },
                      { label: 'Inspired by', value: 'Angela Carter, Ursula K. Le Guin' },
                      { label: 'Stories', value: userStats?.totalStories ?? 0 },
                      { label: 'Likes received', value: userStats?.totalLikesReceived ?? 0 },
                      { label: 'Comments received', value: userStats?.totalCommentsReceived ?? 0 },
                      { label: 'Followers', value: userStats?.followersCount ?? (user?.followers?.length || 0) },
                      { label: 'Following', value: userStats?.followingCount ?? (user?.following?.length || 0) },
                    ].map(item => (
                      <div key={item.label} className="flex gap-3 py-1.5 border-b border-[#ead5c9]/35 last:border-0">
                        <span className="text-[10px] font-bold text-[#7a4a3a] uppercase tracking-wider w-32 flex-shrink-0 mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {item.label}
                        </span>
                        <span className="text-sm font-medium text-[#3b1714]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3
                    className="text-xl font-bold text-[#3b1714] mb-3.5 border-b border-[#ead5c9]/60 pb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Writing Philosophy
                  </h3>
                  <blockquote className="border-l-4 border-[#c77966] pl-5 mb-6">
                    <p className="text-base italic text-[#7a4a3a] leading-relaxed font-serif" style={{ fontFamily: "'Lora', serif" }}>
                      "Every story I write is a letter to someone who needs to know they're not alone in feeling what they feel."
                    </p>
                  </blockquote>
                  <div className="space-y-2 mt-6">
                    <h4 className="text-xs font-bold text-[#3b1714] uppercase tracking-wider mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Most Used Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['magic', 'memory', 'healing', 'folklore', 'identity', 'longing', 'wonder', 'ancient'].map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1 bg-[#f7eadc]/60 border border-[#ead5c9]/70 text-[#7a4a3a] rounded-full hover:border-[#c77966] cursor-pointer transition-all hover:scale-[1.03]"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer CTA */}
        {userStories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-br from-[#fffdfa] to-[#f7eadc]/80 rounded-2xl border border-[#eadfd2] shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c77966] to-[#d99b8a] flex items-center justify-center shadow-md">
                <MessageCircle size={22} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold text-[#3b1714] text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Ready to share your next tale?
                </h4>
                <p className="text-xs text-[#7a4a3a]/90 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Your readers are waiting. Put pen to parchment and write.
                </p>
              </div>
            </div>
            <Link
              to="/create"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white font-semibold rounded-full hover:shadow-lg transition-all text-sm cursor-pointer whitespace-nowrap"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <Feather size={16} />
              Write a Story
            </Link>
          </motion.div>
        )}
      </div>

      {/* Revise Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#3b1714]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#fff7ef] rounded-3xl border border-[#eadfd2] p-7 max-w-md w-full shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-[#3b1714] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Revise Profile
              </h3>
              <p className="text-xs text-[#7a4a3a]/80 mb-5 font-serif italic">Altering your storyteller profile credentials.</p>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#7a4a3a] uppercase tracking-wider mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Pen Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#f7eadc]/60 border border-[#ead5c9] rounded-xl text-sm text-[#3b1714] placeholder-[#7a4a3a]/40 focus:outline-none focus:ring-2 focus:ring-[#d99b8a] focus:border-transparent transition-all"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7a4a3a] uppercase tracking-wider mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    value={editForm.avatar}
                    onChange={e => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#f7eadc]/60 border border-[#ead5c9] rounded-xl text-sm text-[#3b1714] placeholder-[#7a4a3a]/40 focus:outline-none focus:ring-2 focus:ring-[#d99b8a] focus:border-transparent transition-all"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7a4a3a] uppercase tracking-wider mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Biography
                  </label>
                  <textarea
                    rows={4}
                    value={editForm.bio}
                    onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#f7eadc]/60 border border-[#ead5c9] rounded-xl text-sm text-[#3b1714] placeholder-[#7a4a3a]/40 focus:outline-none focus:ring-2 focus:ring-[#d99b8a] focus:border-transparent transition-all resize-none"
                    style={{ fontFamily: "'Lora', serif" }}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 border-2 border-[#ead5c9] text-[#7a4a3a] font-semibold rounded-full hover:border-[#d99b8a] transition-all text-sm cursor-pointer"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white font-bold rounded-full hover:shadow-lg transition-all text-sm disabled:opacity-70 cursor-pointer"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
