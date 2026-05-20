const User = require('../models/User');

// GET /api/users  (admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// DELETE /api/users/:id  (admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    // Only superadmin can delete admins; regular admins cannot
    if (target.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete the master admin' });
    }
    if (target.role === 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only the master admin can delete other admins' });
    }

    await target.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// PATCH /api/users/:id/role  (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Nobody can assign or revoke superadmin via API
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be "user" or "admin"' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    if (target.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot change the master admin\'s role' });
    }

    // Regular admins cannot promote/demote other admins
    if (target.role === 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only the master admin can change admin roles' });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

