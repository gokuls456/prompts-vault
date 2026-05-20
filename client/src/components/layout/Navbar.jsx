import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import ProfileModal from '../profile/ProfileModal';

const VaultIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="4" stroke="url(#vg)" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="3" stroke="url(#vg)" strokeWidth="1.5" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="url(#vg)" strokeWidth="1.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="vg" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a78bfa" />
        <stop offset="1" stopColor="#d946ef" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    ...(isAdmin ? [{ label: 'Dashboard', to: '/dashboard' }] : []),
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/5 shadow-glass' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
              <VaultIcon />
            </motion.div>
            <span className="font-display font-bold text-xl tracking-tight">
              Prompt<span className="gradient-text">Vault</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'text-violet-400 bg-violet-500/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2.5 glass px-3 py-1.5 rounded-xl hover:border-violet-500/30 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      : user.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-white/80">{user.name}</span>
                  <svg
                    className={`w-4 h-4 text-white/40 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden shadow-glass border border-white/10"
                    >
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-xs text-white/40">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'superadmin'
                            ? 'bg-amber-500/20 text-amber-300'
                            : isAdmin
                            ? 'bg-violet-500/20 text-violet-300'
                            : 'bg-white/10 text-white/50'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      {isAdmin && (
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <span>⚙️</span> Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => { setDropdownOpen(false); setProfileOpen(true); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <span>✏️</span> Edit Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                      >
                        <span>🚪</span> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors px-4 py-2"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn-glow text-sm font-semibold text-white px-5 py-2 rounded-xl"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden pb-4 bg-dark-900/95 backdrop-blur-xl border-t border-white/5"
            >
              <div className="flex flex-col gap-1 pt-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === link.to
                        ? 'text-violet-400 bg-violet-500/10'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 mt-1 border-t border-white/5">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {user.avatar
                          ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          : user.name[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-white/70">{user.name}</span>
                    </div>
                    <button
                      onClick={() => { setMenuOpen(false); setProfileOpen(true); }}
                      className="px-4 py-2.5 text-sm text-white/70 text-left hover:bg-white/5 rounded-lg transition-colors"
                    >
                      ✏️ Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2.5 text-sm text-red-400 text-left hover:bg-red-500/5 rounded-lg transition-colors"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 pt-2 border-t border-white/5 mt-1">
                    <Link to="/login" className="flex-1 text-center px-4 py-2.5 text-sm text-white/60 hover:text-white border border-white/10 rounded-xl transition-colors">
                      Sign in
                    </Link>
                    <Link to="/register" className="flex-1 text-center btn-glow px-4 py-2.5 text-sm font-semibold text-white rounded-xl">
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </motion.nav>
  );
}
