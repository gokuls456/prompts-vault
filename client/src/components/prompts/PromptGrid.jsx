import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PromptCard from './PromptCard';
import PromptModal from './PromptModal';
import { GridSkeleton } from '../ui/Skeleton';

export default function PromptGrid({ prompts, loading, total, page, pages, onPageChange }) {
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  const handleCardClick = useCallback((prompt) => {
    setSelectedPrompt(prompt);
  }, []);

  if (loading) return <GridSkeleton count={12} />;

  if (!loading && prompts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center text-3xl mb-6">
          🔍
        </div>
        <h3 className="text-xl font-semibold text-white/70 mb-2">No prompts found</h3>
        <p className="text-sm text-white/30 max-w-xs">
          Try adjusting your search or filter to discover more prompts.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      {/* Result count */}
      <p className="text-sm text-white/30 mb-5">
        Showing <span className="text-white/60 font-medium">{prompts.length}</span> of{' '}
        <span className="text-white/60 font-medium">{total}</span> prompts
      </p>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {prompts.map((prompt) => (
            <PromptCard key={prompt._id} prompt={prompt} onClick={handleCardClick} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl glass text-sm text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
                    p === page
                      ? 'bg-violet-500/30 text-violet-300 border border-violet-500/40'
                      : 'glass text-white/40 hover:text-white/70'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className="px-4 py-2 rounded-xl glass text-sm text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      )}

      {/* Prompt detail modal */}
      <PromptModal
        prompt={selectedPrompt}
        isOpen={!!selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
      />
    </>
  );
}
