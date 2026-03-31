const mongoose = require("mongoose");
const slugify = require("slugify");

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tag name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Tag name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

tagSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true, strict: true });
});

module.exports = mongoose.model("Tag", tagSchema);
