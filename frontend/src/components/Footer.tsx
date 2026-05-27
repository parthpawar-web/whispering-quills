import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Heart, Globe, Send, Code2, Feather } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build account links dynamically
  const accountLinks = (() => {
    if (!user) {
      return [
        { label: 'Sign In', href: '/login' },
        { label: 'Register', href: '/register' },
      ];
    }

    const links = [
      { label: 'Profile', href: '/profile' },
      { label: 'My Stories', href: '/my-stories' },
      { label: 'Write a Story', href: '/create' },
    ];

    if (user.role === 'admin') {
      links.push({ label: 'Admin Dashboard', href: '/admin' });
    }

    return links;
  })();

  return (
    <footer className="bg-[#3b1714] text-[#f7eadc]">
      {/* Decorative border */}
      <div className="h-1 bg-gradient-to-r from-[#7a4a3a] via-[#d99b8a] to-[#7a4a3a]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c77966] to-[#7a4a3a] flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-[#f7eadc]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Whispering Quills
                </span>
              </div>
            </div>
            <p
              className="text-[#d99b8a] leading-relaxed text-sm mb-6 max-w-xs"
              style={{ fontFamily: "'Lora', serif" }}
            >
              A magical corner of the internet where whispers of the soul are penned to parchment,
              and readers discover worlds they never knew existed.
            </p>
            <div className="flex items-center gap-3">
              {[Globe, Send, Code2].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-full border border-[#7a4a3a]/80 flex items-center justify-center text-[#d99b8a] hover:bg-[#7a4a3a] hover:text-white hover:scale-110 hover:shadow-[0_0_10px_rgba(217,155,138,0.2)] active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
 
          {/* Quick Links */}
          <div>
            <h4
              className="text-sm font-bold text-[#f7eadc] uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Explore
            </h4>
            <ul className="space-y-2.5">
              {['Library', 'Featured Stories', 'New Arrivals', 'Community', 'Authors'].map((item) => (
                <li key={item}>
                  <Link
                    to="/library"
                    className="text-sm text-[#d99b8a] hover:text-[#f7eadc] transition-colors flex items-center gap-1.5 group"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <span className="w-1 h-1 rounded-full bg-[#c77966] group-hover:w-2 transition-all" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
 
          {/* Account */}
          <div>
            <h4
              className="text-sm font-bold text-[#f7eadc] uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Account
            </h4>
            <ul className="space-y-2.5">
              {accountLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-sm text-[#d99b8a] hover:text-[#f7eadc] transition-colors flex items-center gap-1.5 group"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <span className="w-1 h-1 rounded-full bg-[#c77966] group-hover:w-2 transition-all" />
                    {item.label}
                  </Link>
                </li>
              ))}
              {user && (
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-[#d99b8a] hover:text-[#f7eadc] transition-colors flex items-center gap-1.5 group"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <span className="w-1 h-1 rounded-full bg-[#c77966] group-hover:w-2 transition-all" />
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
 
        {/* Newsletter */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-[#4d1f1b] to-[#3b1714] border border-[#7a4a3a]/80 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#c77966]/25 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]">
                <Feather size={18} className="text-[#d99b8a]" />
              </div>
              <div>
                <h4
                  className="font-bold text-[#f7eadc] text-base"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Whispers delivered to your door
                </h4>
                <p className="text-xs text-[#d99b8a]/90 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Subscribe for weekly hand-crafted highlights
                </p>
              </div>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 md:w-56 px-4.5 py-2.5 bg-[#3b1714] border border-[#7a4a3a]/80 rounded-full text-sm text-[#f7eadc] placeholder-[#7a4a3a]/70 focus:outline-none focus:border-[#d99b8a] focus:ring-1 focus:ring-[#d99b8a]/50 transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              />
              <button
                className="px-6 py-2.5 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white text-sm font-semibold rounded-full hover:shadow-lg hover:from-[#b56855] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
 
        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-[#4d1f1b] flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#7a4a3a]">
          <p style={{ fontFamily: "'Poppins', sans-serif" }}>
            © 2024 Whispering Quills. All rights reserved. Crafted with{' '}
            <Heart size={11} className="inline text-[#c77966]" /> for storytellers.
          </p>
          <div className="flex items-center gap-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Link to="/privacy" className="hover:text-[#d99b8a] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#d99b8a] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
