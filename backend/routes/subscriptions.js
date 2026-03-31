const express = require('express');
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  verifySubscription,
  getSubscribers,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.post('/', subscribe);
router.get('/unsubscribe/:token', unsubscribe);
router.post('/verify', verifySubscription);
router.get('/', protect, getSubscribers);

module.exports = router;