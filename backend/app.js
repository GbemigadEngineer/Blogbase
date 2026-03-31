const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const rateLimit = require("express-rate-limit");

const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

// Route imports
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const tagRoutes = require("./routes/tags");
const commentRoutes = require("./routes/comments");
const subscriptionRoutes = require("./routes/subscriptions");
const analyticsRoutes = require("./routes/analytics");

const app = express();

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet());

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api", limiter);

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Logging (dev only) ──────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Blogbase API is running 🚀" });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/articles", commentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/analytics", analyticsRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
