const Tag = require("../models/Tag");

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
const getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json({ success: true, count: tags.length, data: tags });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a tag
// @route   POST /api/tags
// @access  Private (admin)
const createTag = async (req, res, next) => {
  try {
    const tag = await Tag.create(req.body);
    res.status(201).json({ success: true, data: tag });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a tag
// @route   PUT /api/tags/:id
// @access  Private (admin)
const updateTag = async (req, res, next) => {
  try {
    const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tag)
      return res.status(404).json({ success: false, message: "Tag not found" });
    res.json({ success: true, data: tag });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a tag
// @route   DELETE /api/tags/:id
// @access  Private (admin)
const deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag)
      return res.status(404).json({ success: false, message: "Tag not found" });
    if (tag.isDefault) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot delete a default tag" });
    }
    await tag.deleteOne();
    res.json({ success: true, message: "Tag deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTags, createTag, updateTag, deleteTag };
