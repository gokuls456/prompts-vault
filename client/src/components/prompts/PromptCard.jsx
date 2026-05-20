import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function TypeBadge({ type }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm ${
        type === 'video'
          ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30'
          : 'bg-violet-500/30 text-violet-200 border border-violet-400/30'
      }`}
    >
      {type === 'video' ? '▶' : '◼'} {type}
    </span>
  );
}

export default function PromptCard({ prompt, onClick }) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const hideTimer = useRef(null);

  const openPanel = () => {
    clearTimeout(hideTimer.current);
    setShowPanel(true);
  };
  const closePanel = () => {
    hideTimer.current = setTimeout(() => setShowPanel(false), 80);
  };
  const togglePanel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (showPanel) { clearTimeout(hideTimer.current); setShowPanel(false); }
    else openPanel();
  };

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.description);
      setCopied(true);
      toast.success('Prompt copied!', { duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onClick(prompt)}
      className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
    >
      {/* ── Image ── */}
      {!imgError ? (
        <img
          src={prompt.image}
          alt={prompt.title}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${showPanel ? 'scale-110' : 'scale-100'}`}
          src={showBefore && prompt.beforeImage ? prompt.beforeImage : prompt.image}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-dark-800 to-dark-700 flex items-center justify-center">
          <span className="text-5xl opacity-20">🖼️</span>
        </div>
      )}

      {/* Gradient vignette — always present */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10 pointer-events-none" />

      {/* ── Top badges — always visible ── */}
      <div className="absolute top-3 left-3 z-20">
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/50 backdrop-blur-md border border-white/10 text-white/70">
          {prompt.category}
        </span>
      </div>
      <div className="absolute top-3 right-3 z-20">
        <TypeBadge type={prompt.type} />
      </div>

      {/* ── Before / After toggle — only if beforeImage exists ── */}
      {prompt.beforeImage && (
        <div className="absolute bottom-3 right-3 z-30 flex items-center gap-0.5 glass rounded-full p-0.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowBefore(false); }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
              !showBefore ? 'bg-violet-500/80 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            After
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowBefore(true); }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
              showBefore ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            Before
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────
          BEFORE state — title + tag preview
          Fades out & slides down on hover
      ───────────────────────────────────────── */}
      <div
        className={`absolute inset-x-0 bottom-0 z-10 p-4 transition-all duration-400 ease-in-out ${
          showPanel ? 'opacity-0 translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
        onMouseEnter={openPanel}
        onMouseLeave={closePanel}
        onTouchStart={togglePanel}
      >
        <h3 className="font-semibold text-sm text-white leading-snug line-clamp-2 mb-2">
          {prompt.title}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {prompt.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] text-white/40">#{tag}</span>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────
          AFTER state — glass panel slides up
          Reveals full detail + copy button
      ───────────────────────────────────────── */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 p-4 transition-transform duration-500 ${
          showPanel ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
        onMouseEnter={openPanel}
        onMouseLeave={closePanel}
        onTouchStart={(e) => { e.stopPropagation(); openPanel(); }}
      >
        {/* glass backdrop */}
        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{
            background: 'rgba(10, 15, 30, 0.88)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-semibold text-sm text-white leading-snug line-clamp-2">
            {prompt.title}
          </h3>

          {/* Prompt snippet */}
          <p className="text-[11px] text-white/50 leading-relaxed line-clamp-3">
            {prompt.description}
          </p>

          {/* Tags */}
          {prompt.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prompt.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/8 text-white/50"
                >
                  #{tag}
                </span>
              ))}
              {prompt.tags.length > 4 && (
                <span className="text-[10px] text-white/25">+{prompt.tags.length - 4}</span>
              )}
            </div>
          )}

          {/* Variants */}
          {prompt.variants?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prompt.variants.slice(0, 3).map((v) => (
                <span
                  key={v}
                  className="px-2 py-0.5 rounded-full text-[10px] bg-violet-500/15 border border-violet-500/25 text-violet-400"
                >
                  {v}
                </span>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCopy}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 ${
                copied
                  ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                  : 'btn-glow text-white'
              }`}
            >
              {copied ? '✓ Copied!' : '⎘ Copy Prompt'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClick(prompt); }}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
              title="View details"
            >
              ↗
            </button>
          </div>
        </div>
      </div>

      {/* Gradient border glow on hover */}
      <div
        className={`absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none ${showPanel ? 'opacity-100' : 'opacity-0'}`}
        style={{
          boxShadow: 'inset 0 0 0 1px rgba(139,92,246,0.4)',
        }}
      />
    </motion.div>
  );
}

