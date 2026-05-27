import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Feather, BookOpen, Star, ArrowRight, Sparkles,
  Users, BookMarked, TrendingUp, Quote
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import StoryCard from '../components/StoryCard';
import { api } from '../services/api';
import type { Story } from '../data/stories';

// Decorative SVG elements
const BookSVG = () => (
  <svg viewBox="0 0 120 100" className="w-full h-full" fill="none">
    <rect x="10" y="15" width="45" height="70" rx="3" fill="#c77966" opacity="0.3" />
    <rect x="12" y="15" width="43" height="70" rx="2" fill="#d99b8a" opacity="0.4" />
    <rect x="55" y="15" width="45" height="70" rx="3" fill="#7a4a3a" opacity="0.25" />
    <rect x="14" y="25" width="30" height="2" rx="1" fill="#3b1714" opacity="0.3" />
    <rect x="14" y="32" width="24" height="2" rx="1" fill="#3b1714" opacity="0.2" />
    <rect x="14" y="39" width="28" height="2" rx="1" fill="#3b1714" opacity="0.2" />
    <rect x="57" y="25" width="30" height="2" rx="1" fill="#3b1714" opacity="0.3" />
    <rect x="57" y="32" width="22" height="2" rx="1" fill="#3b1714" opacity="0.2" />
    <rect x="57" y="39" width="26" height="2" rx="1" fill="#3b1714" opacity="0.2" />
    <line x1="55" y1="15" x2="55" y2="85" stroke="#3b1714" strokeWidth="1.5" opacity="0.4" />
    <ellipse cx="55" cy="50" rx="2" ry="35" fill="#3b1714" opacity="0.1" />
  </svg>
);

const FeatherSVG = () => (
  <svg viewBox="0 0 80 120" className="w-full h-full" fill="none">
    <path d="M40 10 Q60 20 55 50 Q50 80 40 110" stroke="#c77966" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
    <path d="M40 10 Q20 20 25 50 Q30 80 40 110" stroke="#d99b8a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
    <path d="M40 20 Q55 25 52 40" stroke="#7a4a3a" strokeWidth="1" opacity="0.3"/>
    <path d="M40 30 Q54 35 51 50" stroke="#7a4a3a" strokeWidth="1" opacity="0.3"/>
    <path d="M40 40 Q53 45 50 60" stroke="#7a4a3a" strokeWidth="1" opacity="0.3"/>
    <path d="M40 20 Q25 25 28 40" stroke="#7a4a3a" strokeWidth="1" opacity="0.3"/>
    <path d="M40 30 Q26 35 29 50" stroke="#7a4a3a" strokeWidth="1" opacity="0.3"/>
    <path d="M40 40 Q27 45 30 60" stroke="#7a4a3a" strokeWidth="1" opacity="0.3"/>
  </svg>
);

const InkBottleSVG = () => (
  <svg viewBox="0 0 80 100" className="w-full h-full" fill="none">
    <rect x="25" y="10" width="30" height="12" rx="4" fill="#7a4a3a" opacity="0.5"/>
    <rect x="20" y="22" width="40" height="55" rx="6" fill="#3b1714" opacity="0.3"/>
    <rect x="22" y="24" width="36" height="51" rx="5" fill="#c77966" opacity="0.2"/>
    <ellipse cx="40" cy="65" rx="15" ry="8" fill="#3b1714" opacity="0.15"/>
    <rect x="30" y="12" width="20" height="3" rx="1.5" fill="#f7eadc" opacity="0.5"/>
  </svg>
);

export default function Home() {
  const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeStats, setHomeStats] = useState([
    { icon: BookMarked, label: 'Stories Published', value: '0' },
    { icon: Users, label: 'Authors Worldwide', value: '0' },
    { icon: Star, label: 'Reader Reviews', value: '0' },
    { icon: TrendingUp, label: 'Story Likes', value: '0' },
  ]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const stories = await api.getStories();
        const mappedStories = stories.map((s: any) => ({
          ...s,
          id: s._id,
          author: s.author?.name || 'Unknown Author',
          authorAvatar: s.author?.avatar,
          likes: Array.isArray(s.likes) ? s.likes.length : (s.likes || 0),
          comments: Array.isArray(s.comments) ? s.comments.length : (s.comments || 0),
        }));
        
        const featured = await api.getStories(undefined, undefined, true);
        const mappedFeatured = featured.map((s: any) => ({
          ...s,
          id: s._id,
          author: s.author?.name || 'Unknown Author',
          authorAvatar: s.author?.avatar,
          likes: Array.isArray(s.likes) ? s.likes.length : (s.likes || 0),
          comments: Array.isArray(s.comments) ? s.comments.length : (s.comments || 0),
        }));

        setFeaturedStories(mappedFeatured);
        setRecentStories(mappedStories.slice(0, 4));

        const authors = await api.getAuthors();
        const totalComments = mappedStories.reduce((acc: number, s: any) => acc + (s.comments || 0), 0);
        const totalLikes = mappedStories.reduce((acc: number, s: any) => acc + (s.likes || 0), 0);

        setHomeStats([
          { icon: BookMarked, label: 'Stories Published', value: mappedStories.length.toLocaleString() },
          { icon: Users, label: 'Authors Worldwide', value: authors.length.toLocaleString() },
          { icon: Star, label: 'Reader Reviews', value: totalComments.toLocaleString() },
          { icon: TrendingUp, label: 'Story Likes', value: totalLikes.toLocaleString() },
        ]);
      } catch (error) {
        console.error('Failed to load stories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 min-h-[85vh] flex items-center overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-8 w-24 h-24 opacity-30 animate-float">
            <FeatherSVG />
          </div>
          <div className="absolute top-32 right-12 w-28 h-28 opacity-25 animate-float" style={{ animationDelay: '1s' }}>
            <BookSVG />
          </div>
          <div className="absolute bottom-32 left-16 w-20 h-20 opacity-20 animate-float" style={{ animationDelay: '2s' }}>
            <InkBottleSVG />
          </div>
          <div className="absolute bottom-20 right-20 w-16 h-16 opacity-20 animate-sway">
            <FeatherSVG />
          </div>

          {/* Decorative circles */}
          <div className="absolute top-40 left-1/4 w-64 h-64 rounded-full bg-[#d99b8a]/10 blur-3xl" />
          <div className="absolute bottom-40 right-1/4 w-80 h-80 rounded-full bg-[#c77966]/8 blur-3xl" />

          {/* Scattered stars */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#c77966]"
              style={{
                top: `${15 + Math.random() * 70}%`,
                left: `${5 + Math.random() * 90}%`,
                opacity: 0.2 + Math.random() * 0.3,
              }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}

          {/* Decorative ornamental borders */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d99b8a] to-transparent opacity-40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Side: Hero Text Content */}
            <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#fff7ef] border border-[#ead5c9] rounded-full shadow-sm mb-8 lg:self-start"
              >
                <Sparkles size={14} className="text-[#c77966]" />
                <span className="text-xs font-semibold text-[#7a4a3a] uppercase tracking-widest" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  A World of Stories Awaits
                </span>
                <Sparkles size={14} className="text-[#c77966]" />
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#3b1714] leading-[1.05] tracking-tight mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Every Whisper
                <br />
                <span className="italic" style={{ color: '#c77966' }}>Holds a Story.</span>
              </motion.h1>

              {/* Ornamental divider */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center justify-center lg:justify-start gap-3 mb-8 w-full"
              >
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#d99b8a]" />
                <div className="w-2 h-2 rounded-full bg-[#c77966]" />
                <div className="w-4 h-4 rounded-full border-2 border-[#d99b8a] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c77966]" />
                </div>
                <div className="w-2 h-2 rounded-full bg-[#c77966]" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#d99b8a] lg:from-[#d99b8a] lg:to-transparent" />
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-base md:text-lg text-[#7a4a3a] leading-relaxed mb-10 max-w-2xl"
                style={{ fontFamily: "'Lora', serif" }}
              >
                Discover thousands of hand-crafted tales from a global community of{' '}
                <em>authentic authors</em>. Where imagination meets the timeless art of storytelling.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full"
              >
                <Link
                  to="/create"
                  className="group flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#3b1714] to-[#7a4a3a] text-[#f7eadc] font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-[#4d1f1b] hover:to-[#8a5540] transition-all duration-300 text-base"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <Feather size={18} className="group-hover:rotate-12 transition-transform" />
                  Start Writing
                </Link>
                <Link
                  to="/library"
                  className="group flex items-center gap-2.5 px-8 py-4 bg-[#fff7ef] border-2 border-[#d99b8a] text-[#7a4a3a] font-semibold rounded-full shadow-md hover:shadow-lg hover:border-[#c77966] hover:text-[#3b1714] hover:bg-white transition-all duration-300 text-base"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <BookOpen size={18} />
                  Explore Library
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-6 w-full"
              >
                {[
                  'Free to Join',
                  homeStats[0].value !== '0' ? `${homeStats[0].value} Stories` : '3,400+ Stories',
                  homeStats[1].value !== '0' ? `${homeStats[1].value} Storytellers` : 'Global Authors',
                  'New Daily Tales'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-xs text-[#7a4a3a]/70" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d99b8a]" />
                    {item}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Side: Elegant Story Preview/Book Card */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="relative bg-gradient-to-br from-[#fff7ef] to-[#f7eadc] border-2 border-[#ead5c9] p-8 rounded-3xl shadow-2xl overflow-hidden group max-w-sm mx-auto"
              >
                {/* Decorative corners */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#d99b8a] rounded-tl-md" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#d99b8a] rounded-tr-md" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#d99b8a] rounded-bl-md" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#d99b8a] rounded-br-md" />

                {/* Cover Image */}
                <div className="relative h-64 rounded-2xl overflow-hidden mb-6 shadow-md bg-[#ead5c9] flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop"
                    alt="Vintage Book Cover"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3b1714]/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="px-2 py-0.5 bg-[#c77966] text-[#fff7ef] text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Featured Volume
                    </span>
                    <h3 className="text-[#fff7ef] font-bold text-lg mt-1 line-clamp-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                      The Whispering Quill
                    </h3>
                  </div>
                </div>

                {/* Book Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#c77966] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      WQ
                    </div>
                    <span className="text-xs font-semibold text-[#7a4a3a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      By Whispering Library
                    </span>
                  </div>
                  
                  <p className="text-xs text-[#7a4a3a]/80 leading-relaxed italic" style={{ fontFamily: "'Lora', serif" }}>
                    "Every story is a quiet whisper, waiting for the right ears to find it..."
                  </p>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-[#7a4a3a]/60 border-t border-[#ead5c9]/60" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    <span>8 Min Read</span>
                    <span className="flex items-center gap-1"><Sparkles size={11} className="text-[#c77966]" /> Classical Prose</span>
                  </div>
                </div>

                {/* Floating ornaments */}
                <div className="absolute -bottom-6 -right-6 w-20 h-20 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FeatherSVG />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-[#3b1714]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {homeStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#c77966]/20 flex items-center justify-center">
                    <stat.icon size={20} className="text-[#d99b8a]" />
                  </div>
                </div>
                <p
                  className="text-2xl md:text-3xl font-bold text-[#f7eadc] mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-[#d99b8a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <Star size={16} className="text-[#c77966]" />
            <span className="text-xs font-bold tracking-widest uppercase text-[#c77966]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Editor's Choice
            </span>
            <Star size={16} className="text-[#c77966]" />
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#3b1714] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Featured Whispers
          </h2>
          <p className="text-[#7a4a3a] max-w-xl mx-auto" style={{ fontFamily: "'Lora', serif" }}>
            Handpicked tales from the Whispering Library.
          </p>
        </motion.div>

        {featuredStories.length === 0 ? (
          <div className="py-16 text-center bg-[#fff7ef] rounded-3xl border-2 border-dashed border-[#ead5c9] mb-10 max-w-lg mx-auto relative overflow-hidden">
            <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-[#d99b8a]/50 rounded-tl-md" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-[#d99b8a]/50 rounded-tr-md" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-[#d99b8a]/50 rounded-bl-md" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-[#d99b8a]/50 rounded-br-md" />
            <p className="text-[#7a4a3a] italic font-serif text-lg">No featured whispers yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-stretch">
            {featuredStories.map((story, i) => (
              <div key={story.id} className="h-full">
                <StoryCard story={story} index={i} variant="featured" />
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            to="/library"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#d99b8a] text-[#7a4a3a] font-semibold rounded-full hover:bg-[#fff7ef] hover:border-[#c77966] hover:text-[#3b1714] transition-all duration-200"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            View All Stories
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-[#fff7ef] border-y border-[#ead5c9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2
              className="text-4xl md:text-5xl font-bold text-[#3b1714] mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Your Story, Your Stage
            </h2>
            <p className="text-[#7a4a3a]" style={{ fontFamily: "'Lora', serif" }}>
              Three simple steps to share your imagination with the world
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Feather,
                title: 'Write Your Tale',
                description: 'Use our elegant editor to craft your story. Add illustrations, tags, and choose your genre.',
                color: 'from-[#c77966] to-[#d99b8a]'
              },
              {
                step: '02',
                icon: BookOpen,
                title: 'Publish & Share',
                description: 'With one click, your story reaches thousands of readers who love authentic storytelling.',
                color: 'from-[#7a4a3a] to-[#c77966]'
              },
              {
                step: '03',
                icon: Users,
                title: 'Build Community',
                description: 'Connect with readers and fellow authors. Receive feedback, grow your following, inspire others.',
                color: 'from-[#3b1714] to-[#7a4a3a]'
              }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center p-8 bg-[#f7eadc] rounded-2xl border border-[#ead5c9] hover:shadow-lg transition-shadow"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span
                    className="text-xs font-black tracking-widest text-[#d99b8a] bg-[#fff7ef] border border-[#ead5c9] px-3 py-1 rounded-full"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    STEP {item.step}
                  </span>
                </div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-5 shadow-md`}>
                  <item.icon size={28} className="text-white" />
                </div>
                <h3
                  className="text-xl font-bold text-[#3b1714] mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-[#7a4a3a]/80 leading-relaxed text-sm" style={{ fontFamily: "'Lora', serif" }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Stories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#3b1714]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Fresh From the Quill
            </h2>
            <p className="text-[#7a4a3a] mt-1 text-sm" style={{ fontFamily: "'Lora', serif" }}>
              Stories published this week
            </p>
          </div>
          <Link
            to="/library"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#c77966] hover:text-[#7a4a3a] transition-colors"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            See All <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentStories.map((story, i) => (
            <StoryCard key={story.id} story={story} index={i} />
          ))}
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#fff7ef] to-[#f7eadc] border-2 border-[#ead5c9] rounded-3xl p-12 shadow-xl relative overflow-hidden"
          >
            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#d99b8a] rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#d99b8a] rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#d99b8a] rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#d99b8a] rounded-br-lg" />

            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c77966] to-[#7a4a3a] flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Feather size={28} className="text-white" />
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-[#3b1714] mb-4 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Your story is worth telling.
            </h2>
            <p className="text-[#7a4a3a] mb-8 text-lg leading-relaxed" style={{ fontFamily: "'Lora', serif" }}>
              Join thousands of authors who have found their voice on Whispering Quills.
              Every great story begins with a single, brave word.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:from-[#b56855] transition-all text-base"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Feather size={18} />
                Begin Your Journey
              </Link>
              <Link
                to="/library"
                className="flex items-center gap-2 px-8 py-4 text-[#7a4a3a] font-semibold hover:text-[#3b1714] transition-colors text-base"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <BookOpen size={18} />
                Browse Stories
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
