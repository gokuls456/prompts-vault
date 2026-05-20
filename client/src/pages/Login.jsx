import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api/auth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data);
      toast.success(`Welcome back, ${data.user.name}!`);
      const isAdmin = data.user.role === 'admin' || data.user.role === 'superadmin';
      navigate(isAdmin ? '/dashboard' : '/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 pt-16"
    >
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none animate-orb-1" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none animate-orb-2" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="glass rounded-3xl p-8 gradient-border">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block font-display font-bold text-xl mb-6">
              Prompt<span className="gradient-text">Vault</span>
            </Link>
            <h1 className="font-display text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-sm text-white/40">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* General error */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 text-center"
              >
                {errors.general}
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={`input-glass ${errors.email ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`input-glass pr-11 ${errors.password ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-sm"
                  tabIndex={-1}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl btn-glow font-semibold text-white text-sm mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In →'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-white/20">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-white/40">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>


      </motion.div>
    </motion.div>
  );
}
