const Comment = require("../models/Comment");
const Article = require("../models/Article");

// @desc    Get comments for an article
// @route   GET /api/articles/:id/comments
// @access  Public
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({
      article: req.params.id,
      parentComment: null,
      isApproved: true,
      isDeleted: false,
    })
      .select("displayName content createdAt")
      .populate({
        path: "replies",
        match: { isApproved: true, isDeleted: false },
        select: "displayName content createdAt",
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: comments.length, data: comments });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a comment (subscriber only)
// @route   POST /api/articles/:id/comments
// @access  Subscriber
const addComment = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article || !article.isPublished) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    const comment = await Comment.create({
      article: req.params.id,
      subscriber: req.subscriber._id,
      displayName: req.subscriber.displayName,
      content: req.body.content,
      parentComment: req.body.parentComment || null,
    });

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a comment (admin)
// @route   DELETE /api/articles/:articleId/comments/:commentId
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });

    // Soft delete so reply threads aren't broken
    comment.isDeleted = true;
    comment.content = "[This comment has been removed]";
    await comment.save();

    res.json({ success: true, message: "Comment removed" });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle approve a comment (admin)
// @route   PATCH /api/articles/:articleId/comments/:commentId/approve
// @access  Private
const toggleApprove = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });

    comment.isApproved = !comment.isApproved;
    await comment.save();

    res.json({
      success: true,
      message: comment.isApproved ? "Comment approved" : "Comment unapproved",
      data: { isApproved: comment.isApproved },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all comments for admin
// @route   GET /api/articles/comments/all
// @access  Private
const getAllComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ isDeleted: false })
      .populate("article", "title slug")
      .select("displayName content isApproved createdAt article")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: comments.length, data: comments });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getComments,
  addComment,
  deleteComment,
  toggleApprove,
  getAllComments,
};
