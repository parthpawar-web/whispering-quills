import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Feather, Star, MessageCircle, TrendingUp, ArrowRight } from 'lucide-react';
import StoryCard from '../components/StoryCard';
import { api } from '../services/api';

export default function Community() {
  const [trendingStories, setTrendingStories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);

  useEffect(() => {
    // Fetch authors from API
    api.getAuthors().then(data => {
      setAuthors(data);
    }).catch(console.error);

    // Fetch trending stories from API
    api.getStories().then(data => {
      const mapped = data.map((s: any) => ({
        ...s,
        id: s._id,
        author: s.author?.name || 'Unknown',
        authorAvatar: s.author?.avatar,
        likes: Array.isArray(s.likes) ? s.likes.length : (s.likes || 0),
        comments: Array.isArray(s.comments) ? s.comments.length : (s.comments || 0),
      }));
      // Sort by likes descending to get trending
      mapped.sort((a: any, b: any) => b.likes - a.likes);
      setTrendingStories(mapped.slice(0, 4));
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#fff7ef] to-[#f7eadc] border-b border-[#ead5c9] py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px w-10 bg-[#d99b8a]" />
              <Users size={16} className="text-[#c77966]" />
              <div className="h-px w-10 bg-[#d99b8a]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[#3b1714] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Our Community
            </h1>
            <p className="text-lg text-[#7a4a3a] max-w-xl mx-auto" style={{ fontFamily: "'Lora', serif" }}>
              Meet the storytellers, dreamers, and readers who make Whispering Quills extraordinary.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Authors */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#3b1714]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Featured Authors
            </h2>
            <button className="flex items-center gap-1 text-sm text-[#c77966] font-semibold hover:text-[#7a4a3a] transition-colors" style={{ fontFamily: "'Poppins', sans-serif" }}>
              View all <ArrowRight size={15} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {authors.map((user, i) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#fff7ef] rounded-2xl border border-[#ead5c9] shadow-sm p-6 hover:shadow-lg transition-all text-center group"
              >
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <img src={user.avatar || `https://api.dicebear.com/7.x/lorelei/svg?seed=${user.name}`} alt={user.name} className="w-full h-full rounded-full border-4 border-[#ead5c9] bg-[#f7eadc]" />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-[#c77966] to-[#d99b8a] flex items-center justify-center">
                    <Feather size={12} className="text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#3b1714] mb-1 group-hover:text-[#c77966] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>{user.name}</h3>
                <p className="text-xs text-[#c77966] font-semibold mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>Author</p>
                <p className="text-sm text-[#7a4a3a] leading-relaxed mb-4 line-clamp-2" style={{ fontFamily: "'Lora', serif" }}>{user.bio || 'A passionate storyteller.'}</p>
                <div className="flex justify-center gap-6 mb-4">
                  <div>
                    <p className="text-lg font-bold text-[#3b1714]" style={{ fontFamily: "'Playfair Display', serif" }}>{user.stories}</p>
                    <p className="text-xs text-[#7a4a3a]" style={{ fontFamily: "'Poppins', sans-serif" }}>Stories</p>
                  </div>
                </div>
                <button className="w-full py-2.5 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white text-sm font-semibold rounded-full hover:shadow-md transition-all" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Follow Author
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trending Stories */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp size={20} className="text-[#c77966]" />
            <h2 className="text-3xl font-bold text-[#3b1714]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Trending This Week
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trendingStories.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        </div>

        {/* Discussion board preview */}
        <div className="bg-gradient-to-br from-[#fff7ef] to-[#f7eadc] rounded-2xl border border-[#ead5c9] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c77966] to-[#d99b8a] flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#3b1714] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Join the Conversation
          </h2>
          <p className="text-[#7a4a3a] mb-6 max-w-md mx-auto" style={{ fontFamily: "'Lora', serif" }}>
            Share your thoughts, get feedback on your writing, and connect with fellow storytellers in our community forums.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white font-bold rounded-full hover:shadow-lg transition-all" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Star size={16} />
            Join the Community
          </Link>
        </div>
      </div>
    </div>
  );
}
