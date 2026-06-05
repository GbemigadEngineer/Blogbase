const Subscriber = require("../models/Subscriber");
const Tag = require("../models/Tag");
const emailService = require("../services/emailService");

// @desc    Subscribe (save unconfirmed, send verification email)
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

    const validTags = await Tag.find({ _id: { $in: tags } });
    if (validTags.length !== tags.length) {
      return res.status(400).json({
        success: false,
        message: "One or more tags are invalid",
      });
    }

    let subscriber = await Subscriber.findOne({ email: email.toLowerCase() });

    if (subscriber) {
      if (subscriber.confirmedAt) {
        // Already confirmed — update their preferences
        subscriber.displayName = displayName;
        subscriber.tags = tags;
        subscriber.isActive = true;
        await subscriber.save();
        return res.status(200).json({
          success: false,
          message: "This email is already subscribed. Your preferences have been updated.",
        });
      } else {
        // Exists but not confirmed — resend verification
        subscriber.displayName = displayName;
        subscriber.tags = tags;
        await subscriber.save();

        try {
          await emailService.sendVerificationEmail(subscriber);
        } catch (emailErr) {
          console.error("Verification email failed:", emailErr.message);
        }

        return res.status(200).json({
          success: true,
          message: "Verification email resent. Please check your inbox.",
        });
      }
    }

    // New subscriber — save as unconfirmed
    subscriber = await Subscriber.create({
      displayName,
      email,
      tags,
      isActive: false,
      confirmedAt: null,
    });

    try {
      await emailService.sendVerificationEmail(subscriber);
    } catch (emailErr) {
      console.error("Verification email failed:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Almost there! Please check your email to confirm your subscription.",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Confirm subscription via token
// @route   GET /api/subscriptions/confirm/:token
// @access  Public
const confirmSubscription = async (req, res, next) => {
  try {
    const subscriber = await Subscriber.findOne({
      confirmToken: req.params.token,
    });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired confirmation link",
      });
    }

    if (subscriber.confirmedAt) {
      return res.status(200).json({
        success: true,
        message: "Subscription already confirmed.",
      });
    }

    subscriber.confirmedAt = new Date();
    subscriber.isActive = true;
    subscriber.confirmToken = null;
    await subscriber.save();

    try {
      await emailService.sendWelcomeEmail(subscriber);
    } catch (emailErr) {
      console.error("Welcome email failed:", emailErr.message);
    }

    res.json({
      success: true,
      message: "Subscription confirmed! Welcome to Blogbase.",
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
      return res.status(404).json({
        success: false,
        message: "Invalid unsubscribe link",
      });
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
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const subscriber = await Subscriber.findOne({
      email: email.toLowerCase(),
      isActive: true,
      confirmedAt: { $ne: null },
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
      .select("-unsubscribeToken -confirmToken")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: subscribers.length,
      data: subscribers,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  subscribe,
  confirmSubscription,
  unsubscribe,
  verifySubscription,
  getSubscribers,
};