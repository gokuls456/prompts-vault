import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';

function TypeBadge({ type }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
        type === 'video'
          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
      }`}
    >
      {type === 'video' ? '🎬' : '📷'} {type}
    </span>
  );
}

export default function PromptModal({ prompt, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!prompt) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.description);
      setCopied(true);
      toast.success('Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
        {/* Image side */}
        <div className="relative bg-dark-800 md:rounded-l-2xl overflow-hidden">
          {!imgError ? (
            <img
              src={prompt.image}
              alt={prompt.title}
              className="w-full h-full object-cover min-h-[280px] md:min-h-0"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full min-h-[280px] flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-700">
              <span className="text-6xl opacity-20">🖼️</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/20" />

          {/* Category + type overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/50 backdrop-blur-sm border border-white/10 text-white/80">
              {prompt.category}
            </span>
            <TypeBadge type={prompt.type} />
          </div>
        </div>

        {/* Content side */}
        <div className="p-6 md:p-8 flex flex-col gap-5 overflow-y-auto max-h-[90vh] md:max-h-none">
          <div>
            <h2 className="font-display text-2xl font-bold text-white leading-tight mb-2">
              {prompt.title}
            </h2>
            {prompt.createdBy?.name && (
              <p className="text-xs text-white/30">
                by <span className="text-white/50">{prompt.createdBy.name}</span>
              </p>
            )}
          </div>

          {/* Prompt text */}
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2">
              Prompt
            </p>
            <div className="glass rounded-xl p-4 text-sm text-white/80 leading-relaxed">
              {prompt.description}
            </div>
          </div>

          {/* Tags */}
          {prompt.tags?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="chip"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Variants */}
          {prompt.variants?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2">
                Variants
              </p>
              <div className="flex flex-wrap gap-2">
                {prompt.variants.map((v) => (
                  <span
                    key={v}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-violet-500/15 border border-violet-500/30 text-violet-300"
                  >
                    ✦ {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Copy button */}
          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              copied
                ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                : 'btn-glow text-white'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Copied to clipboard!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Prompt
              </>
            )}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
