import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, BookOpen, X, ChevronDown } from 'lucide-react';
import StoryCard from '../components/StoryCard';
import { categories, type Story } from '../data/stories';
import { storyApi } from '../api/storyApi';

const sortOptions = ['Newest First', 'Most Liked', 'Most Read', 'Oldest First'];

export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest First');
  const [showFilters, setShowFilters] = useState(false);

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounced search query or just fetch on effect
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        // Only pass search query if it's longer than 2 chars or empty
        const searchParam = searchQuery.length > 2 ? searchQuery : undefined;
        const res = await storyApi.getStories(selectedCategory, searchParam);
        
        const mappedStories = res.map((s: any) => ({
          ...s,
          id: s._id,
          author: s.author?.name || 'Unknown Author',
          authorAvatar: s.author?.avatar,
          likes: Array.isArray(s.likes) ? s.likes.length : (s.likes || 0),
          comments: Array.isArray(s.comments) ? s.comments.length : (s.comments || 0),
        }));
        
        setStories(mappedStories);
      } catch (error) {
        console.error('Failed to fetch stories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce
    const timeoutId = setTimeout(() => {
      fetchStories();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory]);

  const filteredStories = useMemo(() => {
    let sorted = [...stories];
    
    // We already fetch by search and category, so we just need to sort locally 
    // or do an additional local filter if the search was < 3 chars
    if (searchQuery && searchQuery.length <= 2) {
      const q = searchQuery.toLowerCase();
      sorted = sorted.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.author.toLowerCase().includes(q) ||
          (s.summary && s.summary.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'Most Liked':
        sorted.sort((a, b) => b.likes - a.likes);
        break;
      case 'Most Read':
        sorted.sort((a, b) => b.comments - a.comments);
        break;
      case 'Oldest First':
        sorted.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        break;
      case 'Newest First':
      default:
        sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
    }

    return sorted;
  }, [stories, sortBy, searchQuery]);

  const allCategories = ['All', ...categories];

  return (
    <div className="min-h-screen pt-20 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#fff7ef] to-[#f7eadc] border-b border-[#ead5c9] py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px w-12 bg-[#d99b8a]" />
              <BookOpen size={16} className="text-[#c77966]" />
              <div className="h-px w-12 bg-[#d99b8a]" />
            </div>
            <h1
              className="text-5xl md:text-6xl font-bold text-[#3b1714] mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Welcome to the Library.
            </h1>
            <p
              className="text-lg text-[#7a4a3a] max-w-xl mx-auto mb-8"
              style={{ fontFamily: "'Lora', serif" }}
            >
              Browse thousands of stories spanning every genre, emotion, and imagination.
            </p>

            {/* Search bar */}
            <div className="max-w-xl mx-auto relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search size={19} className="text-[#d99b8a]" />
              </div>
              <input
                type="text"
                placeholder="Search stories, authors, or themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-14 py-4 bg-[#fff7ef] border-2 border-[#ead5c9] rounded-2xl text-[#3b1714] placeholder-[#7a4a3a]/40 focus:outline-none focus:border-[#d99b8a] shadow-sm transition-all text-sm"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7a4a3a] hover:text-[#c77966] transition-colors"
                >
                  <X size={17} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                  selectedCategory === cat
                    ? 'bg-[#3b1714] text-[#f7eadc] border-[#3b1714] shadow-md'
                    : 'bg-[#fff7ef] text-[#7a4a3a] border-[#ead5c9] hover:border-[#d99b8a] hover:text-[#3b1714]'
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#fff7ef] border border-[#ead5c9] rounded-xl text-xs font-medium text-[#7a4a3a] hover:border-[#d99b8a] transition-colors"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <SlidersHorizontal size={14} />
              Filter
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-[#fff7ef] border border-[#ead5c9] rounded-xl text-xs font-medium text-[#7a4a3a] focus:outline-none focus:border-[#d99b8a] cursor-pointer"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {sortOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7a4a3a] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[#7a4a3a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <span className="font-semibold text-[#3b1714]">{filteredStories.length}</span> stories found
            {selectedCategory !== 'All' && (
              <span> in <span className="text-[#c77966] font-semibold">{selectedCategory}</span></span>
            )}
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="text-xs text-[#c77966] hover:text-[#7a4a3a] font-medium flex items-center gap-1 transition-colors"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <X size={13} /> Clear filters
            </button>
          )}
        </div>

        {/* Story Grid */}
        {filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredStories.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 rounded-full bg-[#fff7ef] border-2 border-[#ead5c9] flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-[#d99b8a]" />
            </div>
            <h3
              className="text-2xl font-bold text-[#3b1714] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              The Whispering Library is waiting for its first tale.
            </h3>
            <p className="text-[#7a4a3a] mb-6" style={{ fontFamily: "'Lora', serif" }}>
              Be the first to fill the silence with your words.
            </p>
            <a
              href="/create"
              className="px-6 py-3 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white font-semibold rounded-full text-sm hover:shadow-md transition-all inline-block"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Write First Story
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}
