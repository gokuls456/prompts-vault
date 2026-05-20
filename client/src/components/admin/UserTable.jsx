import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { usersAPI } from '../../api/prompts';
import { useAuth } from '../../contexts/AuthContext';

function RoleBadge({ role }) {
  const styles = {
    superadmin: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    admin:      'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    user:       'bg-white/5 text-white/50 border border-white/10',
  };
  const icons = { superadmin: '👑', admin: '🛡️', user: '👤' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[role] ?? styles.user}`}>
      {icons[role]} {role}
    </span>
  );
}

export default function UserTable({ users, onRefresh }) {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const handleDelete = async (target) => {
    if (!window.confirm(`Delete user "${target.name}"? This cannot be undone.`)) return;
    setDeletingId(target._id);
    try {
      await usersAPI.delete(target._id);
      toast.success(`User "${target.name}" deleted`);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRoleChange = async (target, newRole) => {
    const label = newRole === 'admin' ? 'Grant admin access to' : 'Remove admin access from';
    if (!window.confirm(`${label} "${target.name}"?`)) return;
    setUpdatingId(target._id);
    try {
      await usersAPI.updateRole(target._id, newRole);
      toast.success(`Role updated to ${newRole}`);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  // Decide what actions to show for a given target user
  const renderActions = (target) => {
    const isSelf = target._id === currentUser?._id;
    if (isSelf) return <span className="text-xs text-white/20 px-3">You</span>;
    if (target.role === 'superadmin') return <span className="text-xs text-amber-400/50 px-3">👑 Master</span>;

    const canDelete = isSuperAdmin || target.role === 'user';
    const canToggleAdmin = isSuperAdmin; // only superadmin can promote/demote admins

    return (
      <div className="flex items-center justify-end gap-2">
        {/* Grant / Revoke admin — superadmin only */}
        {canToggleAdmin && (
          target.role === 'admin' ? (
            <button
              onClick={() => handleRoleChange(target, 'user')}
              disabled={updatingId === target._id}
              className="px-2.5 py-1 rounded-lg text-xs glass text-white/40 hover:text-orange-300 hover:border-orange-500/30 transition-all disabled:opacity-40"
              title="Remove admin access"
            >
              {updatingId === target._id ? '...' : '🛡️ Remove Admin'}
            </button>
          ) : (
            <button
              onClick={() => handleRoleChange(target, 'admin')}
              disabled={updatingId === target._id}
              className="px-2.5 py-1 rounded-lg text-xs glass text-white/40 hover:text-violet-300 hover:border-violet-500/30 transition-all disabled:opacity-40"
              title="Grant admin access"
            >
              {updatingId === target._id ? '...' : '🛡️ Make Admin'}
            </button>
          )
        )}

        {/* Non-superadmin admins can only promote users */}
        {!isSuperAdmin && target.role === 'user' && (
          <button
            onClick={() => handleRoleChange(target, 'admin')}
            disabled={updatingId === target._id}
            className="px-2.5 py-1 rounded-lg text-xs glass text-white/40 hover:text-violet-300 hover:border-violet-500/30 transition-all disabled:opacity-40"
          >
            {updatingId === target._id ? '...' : '🛡️ Make Admin'}
          </button>
        )}

        {/* Delete */}
        {canDelete && (
          <button
            onClick={() => handleDelete(target)}
            disabled={deletingId === target._id}
            className="px-2.5 py-1 rounded-lg text-xs glass text-white/40 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-40"
            title="Delete user"
          >
            {deletingId === target._id ? '...' : '🗑️'}
          </button>
        )}

        {/* Admin protected from regular admins */}
        {!isSuperAdmin && target.role === 'admin' && (
          <span className="text-xs text-white/20 px-3">Protected</span>
        )}
      </div>
    );
  };

  if (users.length === 0) {
    return <div className="text-center py-16 text-white/30 text-sm">No users found.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl glass">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-white/30">User</th>
            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-white/30 hidden sm:table-cell">Email</th>
            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Role</th>
            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-white/30 hidden md:table-cell">Joined</th>
            <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {users.map((u) => (
              <motion.tr
                key={u._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      u.role === 'superadmin'
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                        : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                    }`}>
                      {u.name[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-white/80 truncate max-w-[120px]">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-white/40 hidden sm:table-cell">
                  <span className="truncate max-w-[200px] block">{u.email}</span>
                </td>
                <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                <td className="px-5 py-4 text-white/30 text-xs hidden md:table-cell">
                  {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-5 py-4">{renderActions(u)}</td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

