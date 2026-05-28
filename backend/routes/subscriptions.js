const express = require("express");
const router = express.Router();
const {
  subscribe,
  confirmSubscription,
  unsubscribe,
  verifySubscription,
  getSubscribers,
} = require("../controllers/subscriptionController");
const { protect } = require("../middleware/auth");

/**
 * @swagger
 * /subscriptions:
 *   post:
 *     summary: Subscribe to tags (sends verification email)
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - displayName
 *               - email
 *               - tags
 *             properties:
 *               displayName:
 *                 type: string
 *                 example: FootballFan
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f1a2b3c4d5e6f7a8b9c0d1"]
 *     responses:
 *       201:
 *         description: Verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Missing required fields or invalid tags
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", subscribe);

/**
 * @swagger
 * /subscriptions/confirm/{token}:
 *   get:
 *     summary: Confirm subscription via token from email
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Confirmation token sent in email
 *     responses:
 *       200:
 *         description: Subscription confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Invalid or expired confirmation link
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/confirm/:token", confirmSubscription);

/**
 * @swagger
 * /subscriptions/unsubscribe/{token}:
 *   get:
 *     summary: Unsubscribe via token from email link
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Unsubscribe token sent in email
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Invalid unsubscribe link
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/unsubscribe/:token", unsubscribe);

/**
 * @swagger
 * /subscriptions/verify:
 *   post:
 *     summary: Verify if an email is a confirmed active subscriber
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Subscription status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 isSubscriber:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Subscriber'
 */
router.post("/verify", verifySubscription);

/**
 * @swagger
 * /subscriptions:
 *   get:
 *     summary: Get all subscribers (admin)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all subscribers
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
 *                     $ref: '#/components/schemas/Subscriber'
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", protect, getSubscribers);

module.exports = router;
