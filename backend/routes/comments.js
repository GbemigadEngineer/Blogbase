const express = require('express');
const router = express.Router();
const {
  getComments,
  addComment,
  deleteComment,
  toggleApprove,
  getAllComments,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { verifySubscriber } = require('../middleware/verifySubscriber');

// Public
router.get('/:id/comments', getComments);

// Subscriber only
router.post('/:id/comments', verifySubscriber, addComment);

// Admin
router.get('/comments/all', protect, getAllComments);
router.delete('/:articleId/comments/:commentId', protect, deleteComment);
router.patch('/:articleId/comments/:commentId/approve', protect, toggleApprove);

module.exports = router;