import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Feather, Image, Tag, BookOpen, Sparkles,
  Clock, Eye, ChevronDown, Save, Send
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { categories } from '../data/stories';
import { storyApi } from '../api/storyApi';

export default function CreateStory() {
  const [form, setForm] = useState({
    title: '',
    category: '',
    coverImage: '',
    content: '',
    tags: '',
  });
  const [aiSummary, setAiSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [publishStep, setPublishStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  useEffect(() => {
    const fetchStoryToEdit = async () => {
      if (!editId) return;
      try {
        setIsLoading(true);
        const story = await storyApi.getStoryById(editId);
        setForm({
          title: story.title || '',
          category: story.category || '',
          coverImage: story.coverImage || '',
          content: story.content || '',
          tags: Array.isArray(story.tags) ? story.tags.join(', ') : '',
        });
        setAiSummary(story.summary || '');
      } catch (error) {
        console.error('Failed to load story for editing:', error);
        alert('Failed to load story for editing.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStoryToEdit();
  }, [editId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (isDraft: boolean) => {
    if (!form.title.trim() || !form.content.trim()) {
      alert("Please provide at least a title and some content.");
      return;
    }
    setIsLoading(true);
    try {
      const storyData = {
        ...form,
        summary: aiSummary || form.content.slice(0, 150) + '...',
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        isDraft,
      };

      if (editId) {
        await storyApi.updateStory(editId, storyData);
      } else {
        await storyApi.createStory(storyData);
      }

      if (isDraft) {
        navigate('/my-stories');
      } else {
        setPublishStep(true);
      }
    } catch (error: any) {
      console.error('Failed to save story:', error);
      alert(error.message || 'Failed to save story.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setAiSummary(
        form.content
          ? `In this captivating ${form.category || 'story'}, the narrative unfolds with rich detail and emotional depth. ${form.title ? `"${form.title}"` : 'This tale'} takes readers on a journey through carefully crafted scenes and compelling characters. A truly memorable addition to the literary world.`
          : 'Write your story first, then generate an AI summary!'
      );
      setIsGenerating(false);
    }, 2000);
  };

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen pt-20 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#fff7ef] to-[#f7eadc] border-b border-[#ead5c9] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-8 bg-[#d99b8a]" />
              <span className="text-xs font-bold tracking-widest uppercase text-[#c77966]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                New Story
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold text-[#3b1714]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Craft Your Tale
            </h1>
            <p className="text-[#7a4a3a] mt-2" style={{ fontFamily: "'Lora', serif" }}>
              Every great story begins with a blank page and a brave heart.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#fff7ef] rounded-2xl border border-[#ead5c9] p-6 shadow-sm"
            >
              <label
                className="flex items-center gap-2 text-xs font-bold text-[#7a4a3a] uppercase tracking-widest mb-3"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Feather size={14} className="text-[#c77966]" />
                Story Title
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="The name your story will live by..."
                className="w-full bg-transparent text-2xl md:text-3xl font-bold text-[#3b1714] placeholder-[#7a4a3a]/30 focus:outline-none border-b-2 border-[#ead5c9] focus:border-[#d99b8a] pb-3 transition-colors"
                style={{ fontFamily: "'Playfair Display', serif" }}
              />
            </motion.div>

            {/* Category & Cover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              {/* Category */}
              <div className="bg-[#fff7ef] rounded-2xl border border-[#ead5c9] p-5 shadow-sm">
                <label
                  className="flex items-center gap-2 text-xs font-bold text-[#7a4a3a] uppercase tracking-widest mb-3"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <Tag size={14} className="text-[#c77966]" />
                  Category
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full appearance-none px-4 py-3 bg-[#f7eadc] border border-[#ead5c9] rounded-xl text-sm text-[#3b1714] focus:outline-none focus:border-[#d99b8a] cursor-pointer pr-8"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <option value="">Select a genre...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a4a3a] pointer-events-none" />
                </div>
              </div>

              {/* Cover Image */}
              <div className="bg-[#fff7ef] rounded-2xl border border-[#ead5c9] p-5 shadow-sm">
                <label
                  className="flex items-center gap-2 text-xs font-bold text-[#7a4a3a] uppercase tracking-widest mb-3"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <Image size={14} className="text-[#c77966]" />
                  Cover Image URL
                </label>
                <input
                  type="url"
                  name="coverImage"
                  value={form.coverImage}
                  onChange={handleChange}
                  placeholder="https://unsplash.com/..."
                  className="w-full px-4 py-3 bg-[#f7eadc] border border-[#ead5c9] rounded-xl text-sm text-[#3b1714] placeholder-[#7a4a3a]/40 focus:outline-none focus:border-[#d99b8a] transition-colors"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#fff7ef] rounded-2xl border border-[#ead5c9] p-5 shadow-sm"
            >
              <label
                className="flex items-center gap-2 text-xs font-bold text-[#7a4a3a] uppercase tracking-widest mb-3"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Tag size={14} className="text-[#c77966]" />
                Tags <span className="text-[#7a4a3a]/50 normal-case font-normal">(comma separated)</span>
              </label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="magic, lantern, village, dreams..."
                className="w-full px-4 py-3 bg-[#f7eadc] border border-[#ead5c9] rounded-xl text-sm text-[#3b1714] placeholder-[#7a4a3a]/40 focus:outline-none focus:border-[#d99b8a] transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              />
            </motion.div>

            {/* Story Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[#fff7ef] rounded-2xl border border-[#ead5c9] shadow-sm overflow-hidden"
            >
              {/* Editor toolbar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[#ead5c9] bg-[#f7eadc] flex-wrap">
                <span className="text-xs font-bold text-[#7a4a3a] uppercase tracking-widest mr-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Story
                </span>
                {['B', 'I', 'U', '❝', '—', '§'].map((tool) => (
                  <button
                    key={tool}
                    className="w-7 h-7 rounded flex items-center justify-center text-sm text-[#7a4a3a] hover:bg-[#ead5c9] transition-colors font-medium"
                    title={tool}
                  >
                    {tool}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-3 text-xs text-[#7a4a3a]/60" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    ~{readTime} min read
                  </span>
                  <span>{wordCount.toLocaleString()} words</span>
                </div>
              </div>

              <div className="p-6">
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder={`Begin your story here...\n\nOnce upon a time, in a world not unlike our own...`}
                  rows={18}
                  className="w-full bg-transparent text-[#3b1714] placeholder-[#7a4a3a]/30 focus:outline-none leading-[1.9] resize-none text-base"
                  style={{ fontFamily: "'Lora', serif" }}
                />
              </div>
            </motion.div>

            {/* AI Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#fff7ef] to-[#f7eadc] rounded-2xl border border-[#ead5c9] p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c77966] to-[#d99b8a] flex items-center justify-center">
                    <Sparkles size={15} className="text-white" />
                  </div>
                  <div>
                    <h3
                      className="text-sm font-bold text-[#3b1714]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      AI Story Summary
                    </h3>
                    <p className="text-xs text-[#7a4a3a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Auto-generate a captivating blurb
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={generateSummary}
                  disabled={isGenerating}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white text-xs font-semibold rounded-full hover:shadow-md transition-all disabled:opacity-70"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      Generate
                    </>
                  )}
                </motion.button>
              </div>

              {aiSummary ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[#fff7ef] rounded-xl border border-[#ead5c9]"
                >
                  <p className="text-sm text-[#7a4a3a] leading-relaxed italic" style={{ fontFamily: "'Lora', serif" }}>
                    "{aiSummary}"
                  </p>
                  <button
                    className="mt-2 text-xs text-[#c77966] font-semibold hover:text-[#7a4a3a] transition-colors"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Summary generated successfully.
                  </button>
                </motion.div>
              ) : (
                <div className="p-4 bg-[#fff7ef] rounded-xl border border-dashed border-[#ead5c9] text-center">
                  <p className="text-sm text-[#7a4a3a]/50 italic" style={{ fontFamily: "'Lora', serif" }}>
                    Your AI-generated summary will appear here...
                  </p>
                </div>
              )}
            </motion.div>

            {/* Publish button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={() => handleSave(false)}
                className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-[#3b1714] to-[#7a4a3a] text-[#f7eadc] font-bold rounded-2xl shadow-lg hover:shadow-xl hover:from-[#4d1f1b] transition-all"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Send size={18} />
                Publish Story
              </button>
              <button
                onClick={() => handleSave(true)}
                className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-[#ead5c9] text-[#7a4a3a] font-semibold rounded-2xl hover:border-[#d99b8a] hover:text-[#3b1714] transition-all"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Save size={18} />
                Save Draft
              </button>
            </motion.div>

            {publishStep && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 bg-[#3b1714]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setPublishStep(false)}
              >
                <div
                  className="bg-[#fff7ef] rounded-3xl border border-[#ead5c9] p-8 max-w-sm w-full text-center shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c77966] to-[#d99b8a] flex items-center justify-center mx-auto mb-4">
                    <Feather size={28} className="text-white" />
                  </div>
                  <h3
                    className="text-2xl font-bold text-[#3b1714] mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Story Published!
                  </h3>
                  <p className="text-sm text-[#7a4a3a] mb-6" style={{ fontFamily: "'Lora', serif" }}>
                    Your tale is now live and waiting to be discovered by readers around the world.
                  </p>
                  <button
                    onClick={() => navigate('/my-stories')}
                    className="w-full py-3 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white font-bold rounded-xl"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    View My Stories
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar Preview */}
          <div className="space-y-5">
            {/* Live Preview Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#fff7ef] rounded-2xl border border-[#ead5c9] shadow-sm overflow-hidden sticky top-24"
            >
              <div className="bg-[#f7eadc] px-5 py-3 border-b border-[#ead5c9] flex items-center gap-2">
                <Eye size={14} className="text-[#c77966]" />
                <span className="text-xs font-bold text-[#7a4a3a] uppercase tracking-widest" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Card Preview
                </span>
              </div>

              {/* Preview */}
              <div className="p-5">
                <div className="rounded-xl overflow-hidden border border-[#ead5c9] bg-[#f7eadc]">
                  {/* Cover image preview */}
                  <div className="h-36 relative overflow-hidden">
                    {form.coverImage ? (
                      <img
                        src={form.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=60';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ead5c9] to-[#f7eadc]">
                        <BookOpen size={32} className="text-[#d99b8a]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {form.category && (
                      <span className="absolute top-2 left-2 text-xs bg-white/80 px-2 py-0.5 rounded-full text-[#7a4a3a] font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {form.category}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3
                      className="font-bold text-[#3b1714] leading-snug mb-2 line-clamp-2 text-base"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {form.title || 'Your Story Title'}
                    </h3>
                    <p
                      className="text-xs text-[#7a4a3a]/70 line-clamp-2 mb-3 leading-relaxed"
                      style={{ fontFamily: "'Lora', serif" }}
                    >
                      {form.content
                        ? form.content.slice(0, 100) + (form.content.length > 100 ? '...' : '')
                        : 'Your story preview will appear here...'}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {form.tags.split(',').filter(t => t.trim()).slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-[#f7eadc] border border-[#ead5c9] text-[#7a4a3a] rounded-full"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-[#7a4a3a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        <Clock size={11} />
                        ~{readTime} min read
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white rounded-full font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Read
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Writing tips */}
              <div className="px-5 pb-5">
                <div className="p-4 bg-[#f7eadc] rounded-xl border border-[#ead5c9]">
                  <h4
                    className="text-xs font-bold text-[#7a4a3a] uppercase tracking-wider mb-3 flex items-center gap-1.5"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <Sparkles size={12} className="text-[#c77966]" />
                    Writing Tips
                  </h4>
                  <ul className="space-y-1.5">
                    {[
                      'Hook readers in the first line',
                      'Show, don\'t tell emotions',
                      'Use sensory details',
                      'End with impact',
                    ].map(tip => (
                      <li key={tip} className="flex items-start gap-1.5 text-xs text-[#7a4a3a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        <span className="text-[#c77966] mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
