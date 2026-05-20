import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { promptsAPI } from '../api/prompts';
import FilterBar from '../components/prompts/FilterBar';
import PromptGrid from '../components/prompts/PromptGrid';

// ─── Floating orb ─────────────────────────────────────────
function Orb({ className }) {
  return (
    <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />
  );
}

// ─── Stats ─────────────────────────────────────────────────
function StatItem({ value, label }) {
  return (
    <div className="text-center">
      <p className="font-display text-3xl font-bold gradient-text">{value}</p>
      <p className="text-xs text-white/40 mt-1">{label}</p>
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────
function Hero({ onExplore }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background orbs */}
      <Orb className="w-[600px] h-[600px] bg-violet-600/20 top-0 -left-48 animate-orb-1" />
      <Orb className="w-[500px] h-[500px] bg-fuchsia-600/15 bottom-0 -right-32 animate-orb-2" />
      <Orb className="w-[300px] h-[300px] bg-blue-600/10 top-1/3 right-1/4 animate-pulse-slow" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Label pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-violet-500/20 text-xs font-medium text-violet-300 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          AI Prompt Discovery Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-none mb-6"
        >
          Discover & Copy
          <span className="block gradient-text mt-2">AI Prompts</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed text-balance"
        >
          Explore a curated library of high-quality prompts for image and video generation.
          Find the perfect prompt, copy it, and create stunning AI art instantly.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
        >
          <button
            onClick={onExplore}
            className="btn-glow w-full sm:w-auto px-8 py-3.5 rounded-2xl text-base font-semibold text-white"
          >
            Explore Prompts →
          </button>
          <Link
            to="/register"
            className="w-full sm:w-auto text-center px-8 py-3.5 rounded-2xl text-base font-semibold glass border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all"
          >
            Get Started Free
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="inline-flex items-center gap-5 sm:gap-10 glass rounded-2xl px-5 sm:px-10 py-4 sm:py-5 mb-20 max-w-full"
        >
          <StatItem value="1000+" label="Prompts" />
          <div className="w-px h-8 bg-white/10" />
          <StatItem value="12+" label="Categories" />
          <div className="w-px h-8 bg-white/10" />
          <StatItem value="100%" label="Free to Copy" />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/20 uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-violet-400 opacity-60" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Home page ─────────────────────────────────────────────
export default function Home() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ search: '', category: 'all', type: 'all' });

  const gridRef = useState(null)[0];
  const sectionRef = { current: null };

  const fetchPrompts = useCallback(async (currentFilters, currentPage) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 12 };
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.category !== 'all') params.category = currentFilters.category;
      if (currentFilters.type !== 'all') params.type = currentFilters.type;

      const { data } = await promptsAPI.getAll(params);
      setPrompts(data.prompts);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      // silently fail — grid will show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts(filters, page);
  }, [filters, page, fetchPrompts]);

  const handleFilterChange = (newFilters) => {
    setFilters((f) => ({ ...f, ...newFilters }));
    setPage(1);
  };

  const scrollToGrid = () => {
    document.getElementById('prompts-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hero */}
      <Hero onExplore={scrollToGrid} />

      {/* Prompts section */}
      <section id="prompts-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="section-title mb-1">
            Browse <span className="gradient-text">Prompts</span>
          </h2>
          <p className="text-sm text-white/40">
            Filter, search, and copy prompts for any AI image generator
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        </motion.div>

        {/* Grid */}
        <PromptGrid
          prompts={prompts}
          loading={loading}
          total={total}
          page={page}
          pages={pages}
          onPageChange={(p) => {
            setPage(p);
            document.getElementById('prompts-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </section>
    </motion.div>
  );
}
