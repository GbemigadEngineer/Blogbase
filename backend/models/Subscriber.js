const mongoose = require("mongoose");
const crypto = require("crypto");

const subscriberSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
      maxlength: [50, "Display name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    isActive: {
      type: Boolean,
      default: false, // false until email is confirmed
    },
    unsubscribeToken: {
      type: String,
      unique: true,
    },
    confirmToken: {
      type: String,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

subscriberSchema.pre("save", function () {
  if (!this.unsubscribeToken) {
    this.unsubscribeToken = crypto.randomBytes(32).toString("hex");
  }
  if (!this.confirmToken) {
    this.confirmToken = crypto.randomBytes(32).toString("hex");
  }
});

subscriberSchema.index({ tags: 1, isActive: 1 });

module.exports = mongoose.model("Subscriber", subscriberSchema);
