const Admin = require("../models/Admin");
const Tag = require("../models/Tag");

const DEFAULT_TAGS = [
  { name: "Sports", isDefault: true },
  { name: "Manchester United", isDefault: true },
  { name: "Politics", isDefault: true },
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
    }

    // Seed default tags
    for (const tagData of DEFAULT_TAGS) {
      const exists = await Tag.findOne({ name: tagData.name });
      if (!exists) {
        await Tag.create(tagData);
      }
    }
    console.log("✅ Default tags seeded");
  } catch (err) {
    console.error("Seed error:", err.message);
  }
};

module.exports = seedAdmin;
