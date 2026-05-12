const express = require("express");
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
} = require("../controllers/articleController");
const { protect } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Get all published articles
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of articles per page
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search articles by text
 *     responses:
 *       200:
 *         description: List of published articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 total:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *                 currentPage:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 */
router.get("/", getArticles);

/**
 * @swagger
 * /articles/admin/all:
 *   get:
 *     summary: Get all articles including drafts (admin)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all articles
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
router.get("/admin/all", protect, getAdminArticles);

/**
 * @swagger
 * /articles/{slug}:
 *   get:
 *     summary: Get a single published article by slug
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Article slug
 *     responses:
 *       200:
 *         description: Article details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:slug", getArticle);

/**
 * @swagger
 * /articles/{id}/react:
 *   post:
 *     summary: Like or dislike an article
 *     tags: [Articles]
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
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [like, dislike]
 *                 example: like
 *     responses:
 *       200:
 *         description: Reaction recorded
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
 *                     likes:
 *                       type: number
 *                     dislikes:
 *                       type: number
 *       404:
 *         description: Article not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/react", reactToArticle);

/**
 * @swagger
 * /articles/{id}/share:
 *   post:
 *     summary: Increment share count
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Article ID
 *     responses:
 *       200:
 *         description: Share recorded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post("/:id/share", shareArticle);

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Create a new article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - tag
 *             properties:
 *               title:
 *                 type: string
 *                 example: My Article Title
 *               content:
 *                 type: string
 *                 example: <p>Article content here</p>
 *               tag:
 *                 type: string
 *                 example: 64f1a2b3c4d5e6f7a8b9c0d1
 *               excerpt:
 *                 type: string
 *                 example: A short description
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Article created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", protect, upload.single("coverImage"), createArticle);

/**
 * @swagger
 * /articles/{id}:
 *   put:
 *     summary: Update an article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Article ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tag:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Article updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", protect, upload.single("coverImage"), updateArticle);

/**
 * @swagger
 * /articles/{id}/publish:
 *   patch:
 *     summary: Toggle publish/unpublish an article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Article ID
 *     responses:
 *       200:
 *         description: Publish status toggled
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
 *                     isPublished:
 *                       type: boolean
 *       404:
 *         description: Article not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/:id/publish", protect, togglePublish);

/**
 * @swagger
 * /articles/{id}:
 *   delete:
 *     summary: Delete an article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Article ID
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Article not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", protect, deleteArticle);

module.exports = router;
