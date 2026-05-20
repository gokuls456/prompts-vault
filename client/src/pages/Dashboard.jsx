import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { promptsAPI, usersAPI } from '../api/prompts';
import PromptForm from '../components/admin/PromptForm';
import UserTable from '../components/admin/UserTable';
import Modal from '../components/ui/Modal';
import { GridSkeleton } from '../components/ui/Skeleton';

// ─── Stat card ─────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/30">{label}</p>
        <span className={`text-2xl`}>{icon}</span>
      </div>
      <p className={`font-display text-4xl font-bold ${color}`}>{value}</p>
    </motion.div>
  );
}

// ─── Prompt table row ───────────────────────────────────────
function PromptRow({ prompt, onEdit, onDelete, deleting }) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-dark-800 flex-shrink-0">
            <img
              src={prompt.image}
              alt={prompt.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <span className="text-sm font-medium text-white/80 truncate max-w-[200px]">
            {prompt.title}
          </span>
        </div>
      </td>
      <td className="px-5 py-3.5 hidden sm:table-cell">
        <span className="text-xs text-white/40">{prompt.category}</span>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
          prompt.type === 'video'
            ? 'bg-blue-500/20 text-blue-300'
            : 'bg-violet-500/20 text-violet-300'
        }`}>
          {prompt.type}
        </span>
      </td>
      <td className="px-5 py-3.5 hidden md:table-cell text-xs text-white/30">
        {new Date(prompt.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(prompt)}
            className="px-3 py-1 rounded-lg text-xs glass text-white/40 hover:text-violet-300 hover:border-violet-500/30 transition-all"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete(prompt)}
            disabled={deleting === prompt._id}
            className="px-3 py-1 rounded-lg text-xs glass text-white/40 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-40"
          >
            {deleting === prompt._id ? '...' : '🗑️ Delete'}
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Dashboard page ─────────────────────────────────────────
const ALL_TABS = ['Overview', 'Prompts', 'Add Prompt', 'Users'];

export default function Dashboard() {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const TABS = isSuperAdmin ? ALL_TABS : ALL_TABS.filter((t) => t !== 'Users');

  // Data
  const [prompts, setPrompts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Form state
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [savingForm, setSavingForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all prompts (no pagination for admin view)
  const fetchPrompts = useCallback(async () => {
    setLoadingPrompts(true);
    try {
      const { data } = await promptsAPI.getAll({ limit: 100 });
      setPrompts(data.prompts);
    } catch {
      toast.error('Failed to load prompts');
    } finally {
      setLoadingPrompts(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data } = await usersAPI.getAll();
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
    fetchUsers();
  }, [fetchPrompts, fetchUsers]);

  // Open form for create
  const handleAddNew = () => {
    setEditingPrompt(null);
    setFormModalOpen(true);
    setActiveTab('Add Prompt');
  };

  // Open form for edit
  const handleEdit = (prompt) => {
    setEditingPrompt(prompt);
    setFormModalOpen(true);
    setActiveTab('Prompts');
  };

  // Save (create or update)
  const handleSave = async (formData) => {
    setSavingForm(true);
    try {
      if (editingPrompt) {
        await promptsAPI.update(editingPrompt._id, formData);
        toast.success('Prompt updated successfully');
      } else {
        await promptsAPI.create(formData);
        toast.success('Prompt created successfully');
      }
      setFormModalOpen(false);
      setEditingPrompt(null);
      fetchPrompts();
      setActiveTab('Prompts');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save prompt');
    } finally {
      setSavingForm(false);
    }
  };

  // Delete
  const handleDelete = async (prompt) => {
    if (!window.confirm(`Delete "${prompt.title}"? This cannot be undone.`)) return;
    setDeletingId(prompt._id);
    try {
      await promptsAPI.delete(prompt._id);
      toast.success('Prompt deleted');
      fetchPrompts();
    } catch {
      toast.error('Failed to delete prompt');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-dark-900 pt-16"
    >
      {/* Dashboard header */}
      <div className="glass border-b border-white/5 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-white/30">Admin Dashboard</p>
                <p className="text-sm font-medium text-white">{user?.name}</p>
              </div>
              {/* Tab nav */}
              <div className="hidden sm:flex items-center gap-1">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAddNew}
                className="btn-glow px-4 py-2 rounded-xl text-xs font-semibold text-white hidden sm:flex items-center gap-1.5"
              >
                <span>+</span> New Prompt
              </button>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="sm:hidden flex gap-1 pb-2 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                  activeTab === tab ? 'bg-violet-500/20 text-violet-300' : 'text-white/40'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* ── Overview ── */}
          {activeTab === 'Overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div>
                <h1 className="font-display text-2xl font-bold text-white mb-1">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
                  <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
                </h1>
                <p className="text-sm text-white/40">Here's what's happening with your vault today.</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Prompts" value={prompts.length} icon="✨" color="gradient-text" />
                <StatCard label="Photo Prompts" value={prompts.filter((p) => p.type === 'photo').length} icon="📷" color="text-violet-400" />
                <StatCard label="Video Prompts" value={prompts.filter((p) => p.type === 'video').length} icon="🎬" color="text-blue-400" />
                <StatCard label="Total Users" value={users.length} icon="👥" color="text-fuchsia-400" />
              </div>

              {/* Recent prompts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white">Recent Prompts</h2>
                  <button
                    onClick={() => setActiveTab('Prompts')}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    View all →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prompts.slice(0, 6).map((p) => (
                    <div key={p._id} className="glass rounded-xl p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-dark-800 flex-shrink-0">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/80 truncate">{p.title}</p>
                        <p className="text-xs text-white/30 mt-0.5">{p.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Prompts table ── */}
          {activeTab === 'Prompts' && (
            <motion.div
              key="prompts"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Manage Prompts</h2>
                  <p className="text-sm text-white/40 mt-0.5">{prompts.length} total</p>
                </div>
                <button
                  onClick={handleAddNew}
                  className="btn-glow px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
                >
                  <span className="text-lg leading-none">+</span> Add Prompt
                </button>
              </div>

              {loadingPrompts ? (
                <GridSkeleton count={6} />
              ) : (
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Title</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-white/30 hidden sm:table-cell">Category</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Type</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-white/30 hidden md:table-cell">Created</th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {prompts.map((p) => (
                            <PromptRow
                              key={p._id}
                              prompt={p}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              deleting={deletingId}
                            />
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                    {prompts.length === 0 && (
                      <div className="text-center py-16 text-white/30 text-sm">
                        No prompts yet.{' '}
                        <button onClick={handleAddNew} className="text-violet-400 hover:text-violet-300">
                          Add the first one →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Add Prompt ── */}
          {activeTab === 'Add Prompt' && (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl"
            >
              <div className="glass rounded-2xl p-6 md:p-8">
                <PromptForm
                  prompt={null}
                  onSave={handleSave}
                  onCancel={() => setActiveTab('Overview')}
                  loading={savingForm}
                />
              </div>
            </motion.div>
          )}

          {/* ── Users ── */}
          {activeTab === 'Users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Manage Users</h2>
                  <p className="text-sm text-white/40 mt-0.5">{users.length} registered users</p>
                </div>
              </div>

              {loadingUsers ? (
                <div className="glass rounded-2xl p-8 text-center text-white/30 text-sm">
                  Loading users...
                </div>
              ) : (
                <UserTable users={users} onRefresh={fetchUsers} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit prompt modal */}
      <Modal isOpen={formModalOpen && !!editingPrompt} onClose={() => setFormModalOpen(false)} size="md">
        <div className="p-6">
          <PromptForm
            prompt={editingPrompt}
            onSave={handleSave}
            onCancel={() => setFormModalOpen(false)}
            loading={savingForm}
          />
        </div>
      </Modal>
    </motion.div>
  );
}
