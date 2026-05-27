import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, BookOpen, User, Feather, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const perks = [
  'Publish unlimited stories',
  'Build your reader community',
  'Access exclusive writing tools',
  'Monthly featured author spotlight',
];

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', agree: false });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agree) {
      alert("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setIsLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/library');
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen paper-texture flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background decoratives */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-56 h-56 rounded-full bg-[#d99b8a]/10 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-[#c77966]/8 blur-3xl" />
      </div>

      <div className="w-full max-w-5xl relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side — Benefits */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c77966] to-[#7a4a3a] flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-[#3b1714]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Whispering Quills
              </span>
            </Link>

            <h2
              className="text-4xl font-bold text-[#3b1714] leading-tight mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Begin your storytelling journey today.
            </h2>
            <p
              className="text-[#7a4a3a] leading-relaxed mb-8"
              style={{ fontFamily: "'Lora', serif" }}
            >
              Join a community of passionate writers and readers from around the world.
              Your stories deserve to be heard.
            </p>
          </div>

          <div className="space-y-4">
            {perks.map((perk, i) => (
              <motion.div
                key={perk}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#c77966] to-[#d99b8a] flex items-center justify-center flex-shrink-0">
                  <Check size={13} className="text-white" strokeWidth={3} />
                </div>
                <span className="text-sm text-[#3b1714] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {perk}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Sample author stats */}
          <div className="mt-10 p-5 bg-[#fff7ef] rounded-2xl border border-[#ead5c9]">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {['Eleanor', 'Sebastian', 'Arabella', 'Priya'].map((name) => (
                  <img
                    key={name}
                    src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${name}&backgroundColor=d99b8a`}
                    alt={name}
                    className="w-8 h-8 rounded-full border-2 border-[#fff7ef] bg-[#ead5c9]"
                  />
                ))}
              </div>
              <span className="text-sm text-[#7a4a3a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                +12,847 storytellers
              </span>
            </div>
            <p className="text-xs text-[#7a4a3a]/70 italic" style={{ fontFamily: "'Lora', serif" }}>
              "The best writing community I've ever been part of."
            </p>
          </div>
        </motion.div>

        {/* Right side — Form */}
        <div>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c77966] to-[#7a4a3a] flex items-center justify-center shadow-xl">
                <BookOpen size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-[#3b1714]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Whispering Quills
              </span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-[#fff7ef] rounded-3xl border border-[#ead5c9] shadow-2xl overflow-hidden"
          >
            <div className="h-1.5 bg-gradient-to-r from-[#c77966] via-[#d99b8a] to-[#c77966]" />
            <div className="px-8 py-8">
              <div className="mb-6 text-center">
                <h1
                  className="text-2xl font-bold text-[#3b1714] mb-1.5"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Create your account
                </h1>
                <p className="text-sm text-[#7a4a3a]" style={{ fontFamily: "'Lora', serif" }}>
                  Free forever. Your stories, your voice.
                </p>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex-1 h-px bg-[#ead5c9]" />
                <Feather size={14} className="text-[#d99b8a]" />
                <div className="flex-1 h-px bg-[#ead5c9]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#7a4a3a] uppercase tracking-widest mb-2"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <User size={17} className="text-[#d99b8a]" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Eleanor Whitmore"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-[#f7eadc] border border-[#ead5c9] rounded-xl text-sm text-[#3b1714] placeholder-[#7a4a3a]/40 focus:outline-none focus:ring-2 focus:ring-[#d99b8a] focus:border-transparent transition-all"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#7a4a3a] uppercase tracking-widest mb-2"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Mail size={17} className="text-[#d99b8a]" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-[#f7eadc] border border-[#ead5c9] rounded-xl text-sm text-[#3b1714] placeholder-[#7a4a3a]/40 focus:outline-none focus:ring-2 focus:ring-[#d99b8a] focus:border-transparent transition-all"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#7a4a3a] uppercase tracking-widest mb-2"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Lock size={17} className="text-[#d99b8a]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      required
                      minLength={6}
                      className="w-full pl-11 pr-12 py-3.5 bg-[#f7eadc] border border-[#ead5c9] rounded-xl text-sm text-[#3b1714] placeholder-[#7a4a3a]/40 focus:outline-none focus:ring-2 focus:ring-[#d99b8a] focus:border-transparent transition-all"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d99b8a] hover:text-[#7a4a3a] transition-colors"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {form.password.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            form.password.length >= level * 2
                              ? level <= 2 ? 'bg-red-400' : level === 3 ? 'bg-yellow-400' : 'bg-green-400'
                              : 'bg-[#ead5c9]'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="agree"
                    name="agree"
                    checked={form.agree}
                    onChange={handleChange}
                    required
                    className="w-4 h-4 mt-0.5 accent-[#c77966] rounded flex-shrink-0"
                  />
                  <label htmlFor="agree" className="text-xs text-[#7a4a3a] leading-relaxed"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    I agree to the{' '}
                    <Link to="/terms" className="text-[#c77966] hover:underline">Terms of Service</Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-[#c77966] hover:underline">Privacy Policy</Link>
                  </label>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:from-[#b56855] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating your account...
                    </>
                  ) : (
                    <>
                      <Feather size={18} />
                      Start Your Story
                    </>
                  )}
                </motion.button>
              </form>

              <p
                className="text-center text-sm text-[#7a4a3a] mt-5"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Already a member?{' '}
                <Link to="/login" className="font-semibold text-[#c77966] hover:text-[#3b1714] transition-colors">
                  Sign in →
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
