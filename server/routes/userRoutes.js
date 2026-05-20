const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, updateUserRole } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

// All user management routes are admin-only
router.use(protect, adminOnly);

router.get('/', getUsers);
router.delete('/:id', deleteUser);
router.patch('/:id/role', updateUserRole);

module.exports = router;
