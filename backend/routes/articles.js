const express = require('express');
const router = express.Router();
const {
  getArticles,
  getAdminArticles,
  getArticle,
  createArticle,
  updateArticle,
  togglePublish,
  deleteArticle,
  reactToArticle,
  shareArticle,
} = require('../controllers/articleController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Public
router.get('/', getArticles);
router.get('/:slug', getArticle);
router.post('/:id/react', reactToArticle);
router.post('/:id/share', shareArticle);

// Admin
router.get('/admin/all', protect, getAdminArticles);
router.post('/', protect, upload.single('coverImage'), createArticle);
router.put('/:id', protect, upload.single('coverImage'), updateArticle);
router.patch('/:id/publish', protect, togglePublish);
router.delete('/:id', protect, deleteArticle);

module.exports = router;