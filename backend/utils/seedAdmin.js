const Admin = require("../models/Admin");
const Tag = require("../models/Tag");

const DEFAULT_TAGS = [
  { name: "Sports", isDefault: true },
  { name: "Technology", isDefault: true },
  { name: "Football", isDefault: true },
  { name: "Manchester United", isDefault: true },
  { name: "Global Politics", isDefault: true },
  { name: "Nigerian Politics", isDefault: true },
];

const seedAdmin = async () => {
  try {
    // Seed admin
    const adminExists = await Admin.findOne();
    if (!adminExists) {
      await Admin.create({
        username: process.env.ADMIN_USERNAME || "admin",
        password: process.env.ADMIN_PASSWORD || "changeme123",
      });
      console.log(
        `✅ Admin account created (username: ${process.env.ADMIN_USERNAME || "admin"})`,
      );
    } else {
      console.log("✅ Admin account already exists");
    }

    // Seed default tags
    for (const tagData of DEFAULT_TAGS) {
      const exists = await Tag.findOne({ name: tagData.name });
      if (!exists) {
        const tag = new Tag(tagData);
        await tag.save();
      }
    }
    console.log("✅ Default tags seeded");
  } catch (err) {
    console.error("Seed error:", err.message);
    console.error('Full error: ', err);
  }
};

module.exports = seedAdmin;
