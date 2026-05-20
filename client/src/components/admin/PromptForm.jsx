import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { uploadToCloudinary } from '../../api/cloudinary';

const CATEGORIES = [
  'Portrait', 'Sci-Fi', 'Fantasy', 'Architecture', 'Nature',
  'Abstract', 'Landscape', 'Fashion', 'Anime', 'Horror', 'Surreal',
];

const INITIAL_FORM = {
  title: '',
  description: '',
  type: 'photo',
  category: 'Portrait',
  tags: '',
  variants: '',
  imageUrl: '',
  beforeImageUrl: '',
};

export default function PromptForm({ prompt, onSave, onCancel, loading }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'file'
  const [preview, setPreview] = useState('');
  const fileRef = useRef(null);

  const [beforeImageFile, setBeforeImageFile] = useState(null);
  const [beforeImageMode, setBeforeImageMode] = useState('url');
  const [beforePreview, setBeforePreview] = useState('');
  const beforeFileRef = useRef(null);

  // Populate form when editing
  useEffect(() => {
    if (prompt) {
      setForm({
        title: prompt.title || '',
        description: prompt.description || '',
        type: prompt.type || 'photo',
        category: prompt.category || 'Portrait',
        tags: prompt.tags?.join(', ') || '',
        variants: prompt.variants?.join(', ') || '',
        imageUrl: prompt.image || '',
        beforeImageUrl: prompt.beforeImage || '',
      });
      setPreview(prompt.image || '');
      setImageMode('url');
      setBeforePreview(prompt.beforeImage || '');
      setBeforeImageMode('url');
      setBeforeImageFile(null);
    } else {
      setForm(INITIAL_FORM);
      setPreview('');
      setImageFile(null);
      setBeforePreview('');
      setBeforeImageFile(null);
    }
  }, [prompt]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'imageUrl') setPreview(value);
    if (name === 'beforeImageUrl') setBeforePreview(value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    if (imageMode === 'url' && !form.imageUrl.trim()) {
      toast.error('Image URL is required');
      return;
    }
    if (imageMode === 'file' && !imageFile && !prompt) {
      toast.error('Please select an image file');
      return;
    }

    const tagsArray = form.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
    const variantsArray = form.variants.split(',').map((v) => v.trim()).filter(Boolean);

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('description', form.description.trim());
    formData.append('type', form.type);
    formData.append('category', form.category);
    formData.append('tags', JSON.stringify(tagsArray));
    formData.append('variants', JSON.stringify(variantsArray));

    try {
      // Main image
      if (imageMode === 'file' && imageFile) {
        const cdnUrl = await uploadToCloudinary(imageFile);
        formData.append('image', cdnUrl || imageFile); // cdnUrl if production, file if local
        if (!cdnUrl) formData.set('image', imageFile);
      } else if (imageMode === 'url' && form.imageUrl.trim()) {
        formData.append('image', form.imageUrl.trim());
      } else if (prompt?.image) {
        formData.append('image', prompt.image);
      }

      // Before image
      if (beforeImageMode === 'file' && beforeImageFile) {
        const cdnUrl = await uploadToCloudinary(beforeImageFile);
        if (cdnUrl) formData.append('beforeImage', cdnUrl);
        else formData.append('beforeImage', beforeImageFile);
      } else if (beforeImageMode === 'url' && form.beforeImageUrl.trim()) {
        formData.append('beforeImage', form.beforeImageUrl.trim());
      } else if (prompt?.beforeImage) {
        formData.append('beforeImage', prompt.beforeImage);
      }
    } catch {
      toast.error('Image upload failed');
      return;
    }

    onSave(formData);
  };

  const isEdit = !!prompt;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-display text-xl font-bold text-white">
        {isEdit ? '✏️ Edit Prompt' : '✨ Add New Prompt'}
      </h2>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">
          Title *
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Cyberpunk Neon Portrait"
          className="input-glass"
          maxLength={120}
        />
      </div>

      {/* Description / Prompt */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">
          Prompt Text *
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Full prompt text that users will copy..."
          rows={5}
          className="input-glass resize-none"
          maxLength={2000}
        />
        <p className="text-xs text-white/20 mt-1 text-right">{form.description.length}/2000</p>
      </div>

      {/* Type + Category row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">
            Type *
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="input-glass appearance-none cursor-pointer"
          >
            <option value="photo">📷 Photo</option>
            <option value="video">🎬 Video</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">
            Category *
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="input-glass appearance-none cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">
          Tags <span className="text-white/20 font-normal normal-case">(comma-separated)</span>
        </label>
        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder="cyberpunk, portrait, neon, realistic"
          className="input-glass"
        />
      </div>

      {/* Variants */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">
          Variants <span className="text-white/20 font-normal normal-case">(comma-separated)</span>
        </label>
        <input
          name="variants"
          value={form.variants}
          onChange={handleChange}
          placeholder="4K, Cinematic, Ultra-realistic"
          className="input-glass"
        />
      </div>

      {/* Image */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">
          Image *
        </label>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-3">
          {['url', 'file'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => { setImageMode(mode); setImageFile(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                imageMode === mode
                  ? 'bg-violet-500/30 text-violet-300 border border-violet-500/30'
                  : 'glass text-white/40 hover:text-white/60'
              }`}
            >
              {mode === 'url' ? '🔗 Image URL' : '📁 Upload File'}
            </button>
          ))}
        </div>

        {imageMode === 'url' ? (
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="input-glass"
          />
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/40 cursor-pointer transition-colors text-center"
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            {imageFile ? (
              <p className="text-sm text-white/60">{imageFile.name}</p>
            ) : (
              <>
                <span className="text-2xl mb-2">📤</span>
                <p className="text-sm text-white/40">Click to upload (JPG, PNG, GIF, WebP — max 5 MB)</p>
              </>
            )}
          </div>
        )}

        {/* Preview */}
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 rounded-xl overflow-hidden h-40 bg-dark-800"
          >
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </motion.div>
        )}
      </div>

      {/* Before Image (optional) */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">
          Before Image <span className="text-white/20 font-normal normal-case">(optional — shows before/after toggle on card)</span>
        </label>

        <div className="flex gap-2 mb-3">
          {['url', 'file'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => { setBeforeImageMode(mode); setBeforeImageFile(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                beforeImageMode === mode
                  ? 'bg-violet-500/30 text-violet-300 border border-violet-500/30'
                  : 'glass text-white/40 hover:text-white/60'
              }`}
            >
              {mode === 'url' ? '🔗 Image URL' : '📁 Upload File'}
            </button>
          ))}
          {(beforePreview || beforeImageFile) && (
            <button
              type="button"
              onClick={() => { setBeforePreview(''); setBeforeImageFile(null); setForm(f => ({...f, beforeImageUrl: ''})); }}
              className="px-3 py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 glass transition-all"
            >
              ✕ Remove
            </button>
          )}
        </div>

        {beforeImageMode === 'url' ? (
          <input
            name="beforeImageUrl"
            value={form.beforeImageUrl}
            onChange={handleChange}
            placeholder="https://example.com/before.jpg"
            className="input-glass"
          />
        ) : (
          <div
            onClick={() => beforeFileRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/40 cursor-pointer transition-colors text-center"
          >
            <input
              ref={beforeFileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setBeforeImageFile(file);
                setBeforePreview(URL.createObjectURL(file));
              }}
              className="hidden"
            />
            {beforeImageFile ? (
              <p className="text-sm text-white/60">{beforeImageFile.name}</p>
            ) : (
              <>
                <span className="text-2xl mb-2">📤</span>
                <p className="text-sm text-white/40">Click to upload before image</p>
              </>
            )}
          </div>
        )}

        {beforePreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 rounded-xl overflow-hidden h-40 bg-dark-800"
          >
            <img src={beforePreview} alt="Before Preview" className="w-full h-full object-cover" />
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl glass text-sm font-medium text-white/50 hover:text-white transition-all"
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 rounded-xl btn-glow text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : isEdit ? (
            'Update Prompt'
          ) : (
            'Create Prompt'
          )}
        </motion.button>
      </div>
    </form>
  );
}
