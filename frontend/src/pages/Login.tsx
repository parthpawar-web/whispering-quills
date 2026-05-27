import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, BookOpen, Feather, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate('/library');
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen paper-texture flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background decoratives */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-48 h-48 rounded-full bg-[#d99b8a]/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-[#c77966]/8 blur-3xl" />
        {/* Decorative lines */}
        <div className="absolute top-1/4 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-[#ead5c9] to-transparent" />
        <div className="absolute bottom-1/4 right-0 w-1/3 h-px bg-gradient-to-l from-transparent via-[#ead5c9] to-transparent" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Floating Book decoration */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c77966] to-[#7a4a3a] flex items-center justify-center shadow-xl">
              <BookOpen size={28} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-[#3b1714]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Whispering Quills
            </span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#fff7ef] rounded-3xl border border-[#ead5c9] shadow-2xl overflow-hidden"
        >
          {/* Card header accent */}
          <div className="h-1.5 bg-gradient-to-r from-[#c77966] via-[#d99b8a] to-[#c77966]" />

          <div className="px-8 py-8">
            {/* Heading */}
            <div className="mb-7 text-center">
              <h1
                className="text-2xl font-bold text-[#3b1714] mb-1.5"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Sign in to your account
              </h1>
              <p className="text-sm text-[#7a4a3a]" style={{ fontFamily: "'Lora', serif" }}>
                Welcome back, storyteller. Your tales await.
              </p>
            </div>

            {/* Ornament */}
            <div className="flex items-center gap-2 mb-7">
              <div className="flex-1 h-px bg-[#ead5c9]" />
              <Feather size={14} className="text-[#d99b8a]" />
              <div className="flex-1 h-px bg-[#ead5c9]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  className="block text-xs font-semibold text-[#7a4a3a] uppercase tracking-widest mb-2"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Mail size={17} className="text-[#d99b8a]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-[#f7eadc] border border-[#ead5c9] rounded-xl text-sm text-[#3b1714] placeholder-[#7a4a3a]/40 focus:outline-none focus:ring-2 focus:ring-[#d99b8a] focus:border-transparent transition-all"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="text-xs font-semibold text-[#7a4a3a] uppercase tracking-widest"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#c77966] hover:text-[#7a4a3a] transition-colors"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock size={17} className="text-[#d99b8a]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
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
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 accent-[#c77966] rounded"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-[#7a4a3a]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:from-[#b56855] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#ead5c9]" />
                <span className="text-xs text-[#7a4a3a]/60" style={{ fontFamily: "'Poppins', sans-serif" }}>or</span>
                <div className="flex-1 h-px bg-[#ead5c9]" />
              </div>

              {/* Google Sign in */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#f7eadc] border border-[#ead5c9] rounded-xl text-sm font-medium text-[#3b1714] hover:border-[#d99b8a] hover:shadow-sm transition-all"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </form>

            {/* Register link */}
            <p
              className="text-center text-sm text-[#7a4a3a] mt-6"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[#c77966] hover:text-[#3b1714] transition-colors">
                Create one free →
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-[#7a4a3a]/60 mt-5 italic"
          style={{ fontFamily: "'Lora', serif" }}
        >
          "Every story begins with a single brave word."
        </motion.p>
      </div>
    </div>
  );
}
