const Subscriber = require("../models/Subscriber");
const Tag = require("../models/Tag");
const emailService = require("../services/emailService");

// @desc    Subscribe
// @route   POST /api/subscriptions
// @access  Public
const subscribe = async (req, res, next) => {
  try {
    const { displayName, email, tags } = req.body;

    if (!displayName || !email || !tags || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Display name, email, and at least one tag are required",
      });
    }

    // Validate tags exist
    const validTags = await Tag.find({ _id: { $in: tags } });
    if (validTags.length !== tags.length) {
      return res
        .status(400)
        .json({ success: false, message: "One or more tags are invalid" });
    }

    // Upsert: update existing or create new
    const subscriber = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase() },
      { displayName, tags, isActive: true },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    await emailService.sendWelcomeEmail(subscriber);

    res.status(201).json({
      success: true,
      message: "Subscribed successfully! You can now comment on articles.",
      data: {
        displayName: subscriber.displayName,
        email: subscriber.email,
        tags: subscriber.tags,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Unsubscribe via token
// @route   GET /api/subscriptions/unsubscribe/:token
// @access  Public
const unsubscribe = async (req, res, next) => {
  try {
    const subscriber = await Subscriber.findOne({
      unsubscribeToken: req.params.token,
    });

    if (!subscriber) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid unsubscribe link" });
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.json({
      success: true,
      message: "You have been unsubscribed successfully.",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify subscriber status
// @route   POST /api/subscriptions/verify
// @access  Public
const verifySubscription = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const subscriber = await Subscriber.findOne({
      email: email.toLowerCase(),
      isActive: true,
    }).select("displayName email tags");

    if (!subscriber) {
      return res.json({ success: true, isSubscriber: false });
    }

    res.json({
      success: true,
      isSubscriber: true,
      data: { displayName: subscriber.displayName, tags: subscriber.tags },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all subscribers (admin)
// @route   GET /api/subscriptions
// @access  Private
const getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Subscriber.find()
      .populate("tags", "name")
      .select("-unsubscribeToken")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: subscribers.length, data: subscribers });
  } catch (err) {
    next(err);
  }
};

module.exports = { subscribe, unsubscribe, verifySubscription, getSubscribers };
