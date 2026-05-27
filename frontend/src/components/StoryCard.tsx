import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Clock, BookOpen, Feather, Eye } from 'lucide-react';
import type { Story } from '../data/stories';
import { storyApi } from '../api/storyApi';

interface StoryCardProps {
  story: Story & { authorAvatar?: string; authorName?: string; publishedAt?: string; views?: number };
  index?: number;
  variant?: 'default' | 'featured' | 'compact';
}

export default function StoryCard({ story, index = 0, variant = 'default' }: StoryCardProps) {
  const [imgError, setImgError] = useState(false);
  const [likesCount, setLikesCount] = useState(story.likes || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  const authorName = story.authorName || story.author || 'Unknown Author';
  const avatarSrc = story.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=8E7C68&color=fff&size=150`;

  const categoryColors: Record<string, string> = {
    Fantasy: 'bg-[#7a4a3a]/10 text-[#7a4a3a] border border-[#7a4a3a]/20',
    Romance: 'bg-rose-50 text-rose-700 border border-rose-100',
    Mystery: 'bg-slate-50 text-slate-700 border border-slate-100',
    Adventure: 'bg-amber-50 text-amber-800 border border-amber-100',
    'Fairy Tale': 'bg-pink-50 text-pink-700 border border-pink-100',
    Horror: 'bg-red-50 text-red-700 border border-red-100',
    'Sci-Fi': 'bg-blue-50 text-blue-700 border border-blue-100',
    Historical: 'bg-yellow-50 text-yellow-800 border border-yellow-100',
    Children: 'bg-green-50 text-green-700 border border-green-100',
    Poetry: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (likeLoading) return;
    try {
      setLikeLoading(true);
      const res = await storyApi.likeStory(story.id);
      if (res && res.likes) {
        setLikesCount(res.likes.length);
      } else if (res && typeof res.likesCount === 'number') {
        setLikesCount(res.likesCount);
      } else {
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Failed to like story:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  const renderCoverImage = (heightClass: string) => {
    if (!story.coverImage || imgError) {
      return (
        <div className={`w-full ${heightClass} bg-[#fdfaf7] border-b border-[#ead5c9] flex flex-col items-center justify-center p-4 text-center`}>
          <Feather className="text-[#d99b8a] mb-1.5" size={24} />
          <span className="text-xs italic text-[#7a4a3a] font-serif">No cover image</span>
        </div>
      );
    }
    return (
      <img
        src={story.coverImage}
        alt={story.title}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    );
  };

  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          y: -4, 
          boxShadow: "0 18px 48px rgba(59,23,20,0.12)",
          borderColor: "rgba(199, 121, 102, 0.4)"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 22, delay: index * 0.08 }}
        className="story-card group relative bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl overflow-hidden border border-[#eadfd2] shadow-[0_8px_28px_rgba(59,23,20,0.06)] transition-all duration-300 cursor-pointer h-full flex flex-col"
      >
        <div className="relative h-52 overflow-hidden flex-shrink-0 border-b border-[#eadfd2]">
          {renderCoverImage('h-52')}
          <div className="absolute inset-0 bg-gradient-to-t from-[#3b1714]/70 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm bg-white/85 text-[#7a4a3a] border border-[#ead5c9]/60 tracking-wider uppercase"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
              {story.category}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <img
                src={avatarSrc}
                alt={authorName}
                className="w-6 h-6 rounded-full bg-[#ead5c9] border border-white"
              />
              <span className="text-white text-xs font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {authorName}
              </span>
            </div>
            <div className="flex items-center gap-1 text-white/90 text-xs font-medium">
              <Clock size={12} />
              <span>{story.readTime || '10 min'}</span>
            </div>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3
            className="text-lg font-bold text-[#3b1714] mb-2 leading-snug group-hover:text-[#c77966] transition-colors line-clamp-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {story.title}
          </h3>
          <p
            className="text-sm text-[#7a4a3a]/85 leading-relaxed mb-4 line-clamp-3 flex-1 text-ellipsis overflow-hidden font-serif italic"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {story.summary}
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-[#ead5c9]/60 mt-auto flex-shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLike}
                disabled={likeLoading}
                className="flex items-center gap-1 text-xs text-[#7a4a3a] hover:text-[#c77966] transition-colors font-medium cursor-pointer"
              >
                <Heart size={13} className="text-[#c77966]" />
                {likesCount.toLocaleString()}
              </button>
              <span className="flex items-center gap-1 text-xs text-[#7a4a3a] font-medium">
                <MessageCircle size={13} className="text-[#d99b8a]" />
                {story.comments}
              </span>
              {typeof story.views === 'number' && (
                <span className="flex items-center gap-1 text-xs text-[#7a4a3a]/80 font-medium">
                  <Eye size={13} />
                  {story.views === 0 ? 'New Tale' : `${story.views.toLocaleString()} views`}
                </span>
              )}
            </div>
            <Link
              to={`/story/${story.id}`}
              className="flex items-center gap-1.5 text-xs font-bold text-[#c77966] hover:text-[#7a4a3a] transition-colors cursor-pointer"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <BookOpen size={13} />
              Read Story
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/story/${story.id}`} className="block">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ 
            y: -2, 
            boxShadow: "0 8px 24px -6px rgba(59,23,20,0.08)",
            borderColor: "rgba(199, 121, 102, 0.3)"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.08 }}
          className="group flex gap-3 p-3 bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-xl border border-[#eadfd2] hover:border-[#c77966]/40 transition-all duration-200 cursor-pointer shadow-sm"
        >
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-[#ead5c9]/45">
            {(!story.coverImage || imgError) ? (
              <div className="w-full h-full bg-[#fdfaf7] flex items-center justify-center">
                <Feather className="text-[#d99b8a]" size={16} />
              </div>
            ) : (
              <img
                src={story.coverImage}
                alt={story.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-[#c77966] font-bold tracking-wider uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {story.category}
            </span>
            <h4
              className="text-sm font-bold text-[#3b1714] leading-snug line-clamp-1 group-hover:text-[#c77966] transition-colors"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {story.title}
            </h4>
            <p className="text-xs text-[#7a4a3a]/80 truncate font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {authorName}
            </p>
            <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-[#7a4a3a]">
              <span className="flex items-center gap-0.5">
                <Heart size={10} className="text-[#c77966]" /> {likesCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-0.5">
                <Clock size={10} /> {story.readTime || '10 min'}
              </span>
              {typeof story.views === 'number' && (
                <span className="flex items-center gap-0.5">
                  <Eye size={10} /> {story.views === 0 ? 'New Tale' : `${story.views.toLocaleString()} views`}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -3, 
        boxShadow: "0 16px 36px rgba(59,23,20,0.1)",
        borderColor: "rgba(199, 121, 102, 0.4)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.07 }}
      className="story-card group bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] rounded-2xl border border-[#eadfd2] shadow-[0_8px_24px_-4px_rgba(59,23,20,0.05)] overflow-hidden transition-all duration-300 flex flex-col cursor-pointer"
    >
      <div className="relative h-44 overflow-hidden border-b border-[#eadfd2]">
        {renderCoverImage('h-44')}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span
          className={`absolute top-3 left-3 text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm border border-[#ead5c9]/60 ${categoryColors[story.category] || 'bg-[#ead5c9] text-[#7a4a3a]'}`}
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {story.category}
        </span>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/45 backdrop-blur-sm rounded-full px-2 py-0.5">
          <Clock size={11} className="text-white/90" />
          <span className="text-white/95 text-[11px] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>{story.readTime || '10 min'}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={avatarSrc}
            alt={authorName}
            className="w-7 h-7 rounded-full bg-[#ead5c9] border-2 border-white object-cover"
          />
          <div>
            <p className="text-xs font-bold text-[#7a4a3a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {authorName}
            </p>
            <p className="text-[10px] text-[#7a4a3a]/65 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {story.publishedAt ? new Date(story.publishedAt).toLocaleDateString() : 'Recently'}
            </p>
          </div>
        </div>

        <h3
          className="text-base font-bold text-[#3b1714] mb-2 leading-snug group-hover:text-[#c77966] transition-colors line-clamp-2 flex-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {story.title}
        </h3>

        <p
          className="text-xs text-[#7a4a3a]/80 leading-relaxed line-clamp-2 mb-3 font-serif italic"
          style={{ fontFamily: "'Lora', serif" }}
        >
          {story.summary}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {story.tags && story.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-bold px-2 py-0.5 bg-[#f7eadc]/60 border border-[#ead5c9]/60 text-[#7a4a3a]/90 rounded-full"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#ead5c9]/70">
          <div className="flex items-center gap-4 text-xs font-medium text-[#7a4a3a]">
            <button 
              onClick={handleLike}
              disabled={likeLoading}
              className="flex items-center gap-1 hover:text-[#c77966] transition-colors cursor-pointer"
            >
              <Heart size={14} className="text-[#c77966]" />
              <span>{likesCount.toLocaleString()}</span>
            </button>
            <span className="flex items-center gap-1">
              <MessageCircle size={14} className="text-[#d99b8a]" />
              <span>{story.comments}</span>
            </span>
            {typeof story.views === 'number' && (
              <span className="flex items-center gap-1 text-[#7a4a3a]/80">
                <Eye size={14} />
                <span>{story.views === 0 ? 'New Tale' : `${story.views.toLocaleString()}`}</span>
              </span>
            )}
          </div>
          <Link
            to={`/story/${story.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white text-xs font-bold rounded-full hover:shadow-md transition-all cursor-pointer"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <BookOpen size={12} />
            Read
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
