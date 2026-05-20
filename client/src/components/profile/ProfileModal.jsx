import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/auth';
import { uploadToCloudinary } from '../../api/cloudinary';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm({ name: user?.name || '', email: user?.email || '', currentPassword: '', newPassword: '' });
      setAvatarFile(null);
      setPreview(user?.avatar || null);
      setErrors({});
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    if (form.newPassword && form.newPassword.length < 6) errs.newPassword = 'Min 6 characters';
    if (form.newPassword && !form.currentPassword) errs.currentPassword = 'Required to set a new password';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('email', form.email);
    if (form.currentPassword) fd.append('currentPassword', form.currentPassword);
    if (form.newPassword) fd.append('newPassword', form.newPassword);
    if (avatarFile) {
      const cdnUrl = await uploadToCloudinary(avatarFile);
      if (cdnUrl) fd.append('avatarUrl', cdnUrl);
      else fd.append('avatar', avatarFile);
    }

    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(fd);
      updateUser(data.user);
      toast.success('Profile updated!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-3xl p-6 w-full max-w-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">Edit Profile</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Avatar picker */}
                <div className="flex justify-center mb-2">
                  <button type="button" onClick={() => fileRef.current?.click()} className="relative group">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl font-bold text-white ring-2 ring-violet-500/30 group-hover:ring-violet-500/60 transition-all">
                      {preview
                        ? <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                        : user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[11px] text-white font-semibold">Change</span>
                    </div>
                  </button>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarChange} />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    className={`input-glass ${errors.name ? 'border-red-500/50' : ''}`} />
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    className={`input-glass ${errors.email ? 'border-red-500/50' : ''}`} />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                </div>

                {/* Password divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-white/20">Change password (optional)</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {/* Current password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">Current Password</label>
                  <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange}
                    placeholder="Leave blank to keep unchanged"
                    className={`input-glass ${errors.currentPassword ? 'border-red-500/50' : ''}`} />
                  {errors.currentPassword && <p className="text-xs text-red-400 mt-1">{errors.currentPassword}</p>}
                </div>

                {/* New password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-1.5">New Password</label>
                  <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange}
                    placeholder="Min 6 characters"
                    className={`input-glass ${errors.newPassword ? 'border-red-500/50' : ''}`} />
                  {errors.newPassword && <p className="text-xs text-red-400 mt-1">{errors.newPassword}</p>}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-sm glass border border-white/10 text-white/50 hover:text-white transition-all">
                    Cancel
                  </button>
                  <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2.5 rounded-xl btn-glow text-sm font-semibold text-white disabled:opacity-50">
                    {loading
                      ? <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </span>
                      : 'Save Changes'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
