import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, BookOpen, Feather, User,
  LayoutDashboard, BookMarked, PenLine, ChevronDown, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowUserMenu(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  // Define navigation links based on role
  const getNavLinks = () => {
    const defaultLinks = [
      { label: 'Home', href: '/' },
      { label: 'Library', href: '/library' },
    ];

    if (!user) {
      return defaultLinks;
    }

    if (user.role === 'admin') {
      return [
        { label: 'Home', href: '/' },
        { label: 'Library', href: '/library' },
        { label: 'Admin Dashboard', href: '/admin' },
        { label: 'Profile', href: '/profile' },
      ];
    }

    return [
      { label: 'Home', href: '/' },
      { label: 'Library', href: '/library' },
      { label: 'Create Story', href: '/create' },
      { label: 'My Stories', href: '/my-stories' },
      { label: 'Profile', href: '/profile' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#fff7ef]/85 backdrop-blur-md shadow-[0_4px_24px_rgba(59,23,20,0.06)] border-b border-[#ead5c9]/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c77966] to-[#7a4a3a] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <BookOpen size={18} className="text-[#fff7ef]" />
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="text-[#3b1714] font-bold tracking-tight text-lg leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Whispering
              </span>
              <span
                className="text-[#c77966] text-xs font-medium tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Quills
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative text-sm font-medium transition-colors duration-200 group ${
                  location.pathname === link.href
                    ? 'text-[#c77966]'
                    : 'text-[#7a4a3a] hover:text-[#3b1714]'
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#c77966] transition-all duration-200 ${
                  location.pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-[#ead5c9] bg-[#fff7ef] hover:border-[#d99b8a] hover:shadow-sm transition-all"
                  >
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/lorelei/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-7 h-7 rounded-full bg-[#f7eadc] object-cover"
                    />
                    <span className="text-sm font-medium text-[#7a4a3a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {user.name}
                    </span>
                    <ChevronDown size={13} className={`text-[#7a4a3a] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-gradient-to-br from-[#fffdfa] to-[#fff7ef] border border-[#eadfd2] rounded-2xl shadow-[0_10px_35px_rgba(59,23,20,0.12)] overflow-hidden"
                      >
                        <div className="p-3 border-b border-[#ead5c9] flex items-center gap-2">
                          <img
                            src={user.avatar || `https://api.dicebear.com/7.x/lorelei/svg?seed=${user.name}`}
                            alt={user.name}
                            className="w-8 h-8 rounded-full bg-[#f7eadc] object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#3b1714] truncate" style={{ fontFamily: "'Poppins', sans-serif" }}>{user.name}</p>
                            <p className="text-[10px] text-[#7a4a3a]/60 truncate" style={{ fontFamily: "'Poppins', sans-serif" }}>{user.email}</p>
                          </div>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/profile"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#7a4a3a] hover:bg-[#f7eadc] hover:text-[#3b1714] transition-colors"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            <User size={15} className="text-[#d99b8a]" />
                            My Profile
                          </Link>
                          <Link
                            to="/my-stories"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#7a4a3a] hover:bg-[#f7eadc] hover:text-[#3b1714] transition-colors"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            <BookMarked size={15} className="text-[#d99b8a]" />
                            My Stories
                          </Link>
                          <Link
                            to="/create"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#7a4a3a] hover:bg-[#f7eadc] hover:text-[#3b1714] transition-colors"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            <PenLine size={15} className="text-[#d99b8a]" />
                            Write a Story
                          </Link>
                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#7a4a3a] hover:bg-[#f7eadc] hover:text-[#3b1714] transition-colors"
                              style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                              <LayoutDashboard size={15} className="text-[#d99b8a]" />
                              Admin Panel
                            </Link>
                          )}
                        </div>
                        <div className="p-2 border-t border-[#ead5c9]">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-semibold text-[#7a4a3a] hover:text-[#3b1714] transition-all"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#b56855] transition-all"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Join Community
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-[#7a4a3a] hover:bg-[#ead5c9] transition-colors"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#fff7ef]/95 backdrop-blur-lg border-t border-[#ead5c9]/50 overflow-hidden shadow-lg"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block px-4 py-2.5 rounded-lg text-[#7a4a3a] hover:bg-[#f7eadc] hover:text-[#3b1714] font-medium transition-colors"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <div className="pt-2 border-t border-[#ead5c9] mt-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-2 space-y-2 border-t border-[#ead5c9] mt-2">
                  <Link
                    to="/login"
                    className="block text-center px-4 py-2.5 border border-[#d99b8a] text-[#7a4a3a] rounded-full font-medium hover:bg-[#f7eadc] transition-colors"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white rounded-full font-semibold"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <Feather size={14} />
                    Join Community
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
