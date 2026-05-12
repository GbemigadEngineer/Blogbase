const express = require("express");
const router = express.Router();
const {
  getOverview,
  getArticleStats,
  getSubscriberGrowth,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");

router.use(protect);

/**
 * @swagger
 * /analytics/overview:
 *   get:
 *     summary: Get overall dashboard stats
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     articles:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         published:
 *                           type: number
 *                         drafts:
 *                           type: number
 *                     subscribers:
 *                       type: number
 *                     comments:
 *                       type: number
 *                     engagement:
 *                       type: object
 *                       properties:
 *                         totalViews:
 *                           type: number
 *                         totalLikes:
 *                           type: number
 *                         totalDislikes:
 *                           type: number
 *                         totalShares:
 *                           type: number
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/overview", getOverview);

/**
 * @swagger
 * /analytics/articles:
 *   get:
 *     summary: Get per-article stats
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [views, likes, dislikes, shares, publishedAt]
 *         description: Sort articles by this field
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag ID
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: Article stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/articles", getArticleStats);

/**
 * @swagger
 * /analytics/subscribers:
 *   get:
 *     summary: Get subscriber growth over time
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscriber growth data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: object
 *                         properties:
 *                           year:
 *                             type: number
 *                           month:
 *                             type: number
 *                       count:
 *                         type: number
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/subscribers", getSubscriberGrowth);

module.exports = router;
