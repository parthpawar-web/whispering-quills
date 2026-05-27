import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen paper-texture flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c77966] to-[#d99b8a] flex items-center justify-center mx-auto mb-6 shadow-xl">
            <BookOpen size={40} className="text-white" />
          </div>

          <div className="mb-4">
            <span className="text-8xl font-bold text-[#ead5c9]" style={{ fontFamily: "'Playfair Display', serif" }}>
              404
            </span>
          </div>

          <h1 className="text-3xl font-bold text-[#3b1714] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            This page has been lost in the library stacks.
          </h1>

          <p className="text-[#7a4a3a] mb-8 leading-relaxed" style={{ fontFamily: "'Lora', serif" }}>
            The tale you're searching for has wandered off between the shelves. Perhaps it's been borrowed by another reader, or maybe it never existed at all.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white font-semibold rounded-full hover:shadow-md transition-all"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <Home size={16} />
              Return Home
            </Link>
            <Link
              to="/library"
              className="flex items-center gap-2 px-6 py-3 border-2 border-[#ead5c9] text-[#7a4a3a] font-semibold rounded-full hover:border-[#d99b8a] transition-all"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <ArrowLeft size={16} />
              Browse Library
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
