const Article = require("../models/Article");
const Comment = require("../models/Comment");
const Subscriber = require("../models/Subscriber");

// @desc    Get overall dashboard stats
// @route   GET /api/analytics/overview
// @access  Private
const getOverview = async (req, res, next) => {
  try {
    const [
      totalArticles,
      publishedArticles,
      totalSubscribers,
      totalComments,
      engagementTotals,
    ] = await Promise.all([
      Article.countDocuments(),
      Article.countDocuments({ isPublished: true }),
      Subscriber.countDocuments({ isActive: true }),
      Comment.countDocuments({ isDeleted: false, isApproved: true }),
      Article.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
            totalLikes: { $sum: "$likes" },
            totalDislikes: { $sum: "$dislikes" },
            totalShares: { $sum: "$shares" },
          },
        },
      ]),
    ]);

    const totals = engagementTotals[0] || {
      totalViews: 0,
      totalLikes: 0,
      totalDislikes: 0,
      totalShares: 0,
    };

    res.json({
      success: true,
      data: {
        articles: {
          total: totalArticles,
          published: publishedArticles,
          drafts: totalArticles - publishedArticles,
        },
        subscribers: totalSubscribers,
        comments: totalComments,
        engagement: totals,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get per-article stats
// @route   GET /api/analytics/articles
// @access  Private
const getArticleStats = async (req, res, next) => {
  try {
    const { tag, from, to, sortBy = "views" } = req.query;

    const filter = { isPublished: true };
    if (tag) filter.tag = tag;
    if (from || to) {
      filter.publishedAt = {};
      if (from) filter.publishedAt.$gte = new Date(from);
      if (to) filter.publishedAt.$lte = new Date(to);
    }

    const allowedSorts = [
      "views",
      "likes",
      "dislikes",
      "shares",
      "publishedAt",
    ];
    const sort = allowedSorts.includes(sortBy)
      ? { [sortBy]: -1 }
      : { views: -1 };

    const articles = await Article.find(filter)
      .populate("tag", "name")
      .select("title slug views likes dislikes shares publishedAt tag")
      .sort(sort)
      .limit(50);

    res.json({ success: true, count: articles.length, data: articles });
  } catch (err) {
    next(err);
  }
};

// @desc    Get subscriber growth over time
// @route   GET /api/analytics/subscribers
// @access  Private
const getSubscriberGrowth = async (req, res, next) => {
  try {
    const growth = await Subscriber.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({ success: true, data: growth });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOverview, getArticleStats, getSubscriberGrowth };
