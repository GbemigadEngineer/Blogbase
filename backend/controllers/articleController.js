const Article = require("../models/Article");
const { cloudinary } = require("../config/cloudinary");
const emailService = require("../services/emailService");
const crypto = require("crypto");

// Helper: hash IP for anonymous like tracking
const hashIp = (ip) => crypto.createHash("sha256").update(ip).digest("hex");

// @desc    Get all published articles
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    if (req.query.tag) filter.tag = req.query.tag;
    if (req.query.search) filter.$text = { $search: req.query.search };

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate("tag", "name slug")
        .select("-likedBy -dislikedBy -content")
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit),
      Article.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: articles.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: articles,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all articles including drafts (admin)
// @route   GET /api/articles/admin/all
// @access  Private
const getAdminArticles = async (req, res, next) => {
  try {
    const articles = await Article.find()
      .populate("tag", "name slug")
      .select("-likedBy -dislikedBy -content")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: articles.length, data: articles });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single article by slug
// @route   GET /api/articles/:slug
// @access  Public
const getArticle = async (req, res, next) => {
  try {
    const article = await Article.findOne({
      slug: req.params.slug,
      isPublished: true,
    })
      .populate("tag", "name slug")
      .populate("commentCount");

    if (!article)
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });

    // Increment view count (fire and forget)
    Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } }).exec();

    res.json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
};

// @desc    Create article
// @route   POST /api/articles
// @access  Private
const createArticle = async (req, res, next) => {
  try {
    const articleData = { ...req.body };

    if (req.file) {
      articleData.coverImage = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    const article = await Article.create(articleData);
    await article.populate("tag", "name slug");

    res.status(201).json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private
const updateArticle = async (req, res, next) => {
  try {
    let article = await Article.findById(req.params.id);
    if (!article)
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });

    // If new image uploaded, delete old from Cloudinary
    if (req.file && article.coverImage?.publicId) {
      await cloudinary.uploader.destroy(article.coverImage.publicId);
    }

    if (req.file) {
      req.body.coverImage = { url: req.file.path, publicId: req.file.filename };
    }

    article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("tag", "name slug");

    res.json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
};

// @desc    Publish / unpublish article
// @route   PATCH /api/articles/:id/publish
// @access  Private
const togglePublish = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id).populate("tag");
    if (!article)
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });

    const wasUnpublished = !article.isPublished;
    article.isPublished = !article.isPublished;
    await article.save();

    // Send notifications only when newly published
    if (wasUnpublished && article.isPublished) {
      emailService.notifySubscribers(article).catch(console.error);
    }

    res.json({
      success: true,
      message: article.isPublished
        ? "Article published"
        : "Article unpublished",
      data: { isPublished: article.isPublished },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private
const deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article)
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });

    if (article.coverImage?.publicId) {
      await cloudinary.uploader.destroy(article.coverImage.publicId);
    }

    await article.deleteOne();
    res.json({ success: true, message: "Article deleted" });
  } catch (err) {
    next(err);
  }
};

// @desc    Like or dislike an article
// @route   POST /api/articles/:id/react
// @access  Public
const reactToArticle = async (req, res, next) => {
  try {
    const { type } = req.body;
    if (!["like", "dislike"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Reaction must be like or dislike" });
    }

    const article = await Article.findById(req.params.id);
    if (!article)
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });

    const hashedIp = hashIp(req.ip);
    const alreadyLiked = article.likedBy.includes(hashedIp);
    const alreadyDisliked = article.dislikedBy.includes(hashedIp);

    let update = { $inc: {}, $push: {}, $pull: {} };

    if (type === "like") {
      if (alreadyLiked) {
        update.$inc.likes = -1;
        update.$pull.likedBy = hashedIp;
      } else {
        update.$inc.likes = 1;
        update.$push.likedBy = hashedIp;
        if (alreadyDisliked) {
          update.$inc.dislikes = -1;
          update.$pull.dislikedBy = hashedIp;
        }
      }
    } else {
      if (alreadyDisliked) {
        update.$inc.dislikes = -1;
        update.$pull.dislikedBy = hashedIp;
      } else {
        update.$inc.dislikes = 1;
        update.$push.dislikedBy = hashedIp;
        if (alreadyLiked) {
          update.$inc.likes = -1;
          update.$pull.likedBy = hashedIp;
        }
      }
    }

    const updated = await Article.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).select("likes dislikes");

    res.json({
      success: true,
      data: { likes: updated.likes, dislikes: updated.dislikes },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Increment share count
// @route   POST /api/articles/:id/share
// @access  Public
const shareArticle = async (req, res, next) => {
  try {
    await Article.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } });
    res.json({ success: true, message: "Share recorded" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getArticles,
  getAdminArticles,
  getArticle,
  createArticle,
  updateArticle,
  togglePublish,
  deleteArticle,
  reactToArticle,
  shareArticle,
};
