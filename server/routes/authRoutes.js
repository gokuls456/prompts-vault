const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, logout, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name too long'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), updateProfile);

module.exports = router;
