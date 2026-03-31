const express = require('express');
const router = express.Router();
const {
  getOverview,
  getArticleStats,
  getSubscriberGrowth,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect); // All analytics routes are admin only

router.get('/overview', getOverview);
router.get('/articles', getArticleStats);
router.get('/subscribers', getSubscriberGrowth);

module.exports = router;