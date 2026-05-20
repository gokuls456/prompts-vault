const express = require('express');
const router = express.Router();
const {
  getPrompts,
  getPrompt,
  createPrompt,
  updatePrompt,
  deletePrompt,
  getCategories,
} = require('../controllers/promptController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/categories', getCategories);
router.get('/', getPrompts);
router.get('/:id', getPrompt);

// Admin-only routes
const promptUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'beforeImage', maxCount: 1 },
]);
router.post('/', protect, adminOnly, promptUpload, createPrompt);
router.put('/:id', protect, adminOnly, promptUpload, updatePrompt);
router.delete('/:id', protect, adminOnly, deletePrompt);

module.exports = router;
