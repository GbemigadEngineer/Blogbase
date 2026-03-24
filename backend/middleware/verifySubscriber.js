const Subscriber = require("../models/Subscriber");

const verifySubscriber = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required to comment" });
  }

  const subscriber = await Subscriber.findOne({
    email: email.toLowerCase(),
    isActive: true,
  });

  if (!subscriber) {
    return res.status(403).json({
      success: false,
      message: "You must be a subscriber to comment. Please subscribe first.",
    });
  }

  req.subscriber = subscriber;
  next();
};

module.exports = { verifySubscriber };
