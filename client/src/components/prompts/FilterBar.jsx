import { useRef } from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  'All',
  'Portrait',
  'Sci-Fi',
  'Fantasy',
  'Architecture',
  'Nature',
  'Abstract',
  'Landscape',
  'Fashion',
  'Anime',
  'Horror',
  'Surreal',
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'photo', label: '📷 Photo' },
  { value: 'video', label: '🎬 Video' },
];

export default function FilterBar({ filters, onFilterChange }) {
  const scrollRef = useRef(null);

  const handleCategory = (cat) => {
    onFilterChange({ category: cat.toLowerCase() === 'all' ? 'all' : cat });
  };

  const handleType = (type) => {
    onFilterChange({ type });
  };

  const handleSearch = (e) => {
    onFilterChange({ search: e.target.value });
  };

  const clearFilters = () => {
    onFilterChange({ search: '', category: 'all', type: 'all' });
  };

  const hasActiveFilters =
    filters.search || filters.category !== 'all' || filters.type !== 'all';

  return (
    <div className="space-y-4">
      {/* Search row */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-0">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search prompts, tags, categories..."
            value={filters.search}
            onChange={handleSearch}
            className="input-glass pl-10 pr-4"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 glass rounded-xl p-1 flex-shrink-0">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleType(opt.value)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                filters.type === opt.value
                  ? 'bg-violet-500/30 text-violet-300 border border-violet-500/30'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Clear button */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={clearFilters}
            className="px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 glass border border-white/5 transition-all"
          >
            Clear
          </motion.button>
        )}
      </div>

      {/* Category chips — horizontally scrollable */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto no-scrollbar pb-1"
      >
        {CATEGORIES.map((cat) => {
          const value = cat.toLowerCase() === 'all' ? 'all' : cat;
          const isActive = filters.category === value || (cat === 'All' && filters.category === 'all');
          return (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`chip whitespace-nowrap flex-shrink-0 ${isActive ? 'active' : ''}`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
