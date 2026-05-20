import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api/auth';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
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
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.length > 50) errs.name = 'Name too long';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await authAPI.register({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
      });
      login(data);
      toast.success(`Welcome to PromptVault, ${data.user.name}!`);
      const isAdmin = data.user.role === 'admin' || data.user.role === 'superadmin';
      navigate(isAdmin ? '/dashboard' : '/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const strengthScore = (() => {
    const pw = form.password;
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strengthScore];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][strengthScore];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-24 pt-24"
    >
      {/* Background orbs */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none animate-orb-2" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none animate-orb-1" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 gradient-border">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block font-display font-bold text-xl mb-6">
              Prompt<span className="gradient-text">Vault</span>
            </Link>
            <h1 className="font-display text-2xl font-bold text-white mb-2">Create an account</h1>
            <p className="text-sm text-white/40">Start exploring AI prompts for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 text-center"
              >
                {errors.general}
              </motion.div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                autoComplete="name"
                className={`input-glass ${errors.name ? 'border-red-500/50' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>

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
                className={`input-glass ${errors.email ? 'border-red-500/50' : ''}`}
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
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className={`input-glass pr-11 ${errors.password ? 'border-red-500/50' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strengthScore ? strengthColor : 'rgba(255,255,255,0.08)' }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}

              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className={`input-glass ${errors.confirm ? 'border-red-500/50' : ''}`}
              />
              {errors.confirm && <p className="text-xs text-red-400 mt-1">{errors.confirm}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl btn-glow font-semibold text-white text-sm mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account →'
              )}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-white/20">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <p className="text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
