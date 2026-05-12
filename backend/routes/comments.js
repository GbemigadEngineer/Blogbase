const express = require("express");
const router = express.Router();
const {
  getComments,
  addComment,
  deleteComment,
  toggleApprove,
  getAllComments,
} = require("../controllers/commentController");
const { protect } = require("../middleware/auth");
const { verifySubscriber } = require("../middleware/verifySubscriber");

/**
 * @swagger
 * /articles/{id}/comments:
 *   get:
 *     summary: Get all comments for an article
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Article ID
 *     responses:
 *       200:
 *         description: List of comments
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
 *                     $ref: '#/components/schemas/Comment'
 */
router.get("/:id/comments", getComments);

/**
 * @swagger
 * /articles/{id}/comments:
 *   post:
 *     summary: Add a comment to an article (subscribers only)
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Article ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - content
 *             properties:
 *               email:
 *                 type: string
 *                 example: subscriber@example.com
 *               content:
 *                 type: string
 *                 example: Great article!
 *               parentComment:
 *                 type: string
 *                 description: Parent comment ID for replies
 *                 example: 64f1a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       403:
 *         description: Must be a subscriber to comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/comments", verifySubscriber, addComment);

/**
 * @swagger
 * /articles/comments/all:
 *   get:
 *     summary: Get all comments (admin)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all comments
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
 *                     $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/comments/all", protect, getAllComments);

/**
 * @swagger
 * /articles/{articleId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment (admin)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Article ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:articleId/comments/:commentId", protect, deleteComment);

/**
 * @swagger
 * /articles/{articleId}/comments/{commentId}/approve:
 *   patch:
 *     summary: Toggle approve/unapprove a comment (admin)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Article ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment approval status toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     isApproved:
 *                       type: boolean
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/:articleId/comments/:commentId/approve", protect, toggleApprove);

module.exports = router;
