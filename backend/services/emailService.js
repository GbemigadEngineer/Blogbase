const nodemailer = require("nodemailer");
const Subscriber = require("../models/Subscriber");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = `"${process.env.EMAIL_FROM_NAME || "Blogbase"}" <${process.env.EMAIL_FROM}>`;

// ─── Welcome Email ───────────────────────────────────────────────────────────
const sendWelcomeEmail = async (subscriber) => {
  const unsubscribeUrl = `${process.env.CLIENT_URL}/unsubscribe/${subscriber.unsubscribeToken}`;

  await transporter.sendMail({
    from: FROM,
    to: subscriber.email,
    subject: "Welcome to Blogbase 🎉",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2>Hey ${subscriber.displayName}, you're in!</h2>
        <p>Thanks for subscribing to Blogbase. You'll now receive email notifications
        whenever a new article is published on the topics you follow.</p>
        <p>You can also <strong>comment on articles</strong> using your display name
        <strong>${subscriber.displayName}</strong>.</p>
        <hr />
        <p style="font-size: 12px; color: #999;">
          Don't want these emails? <a href="${unsubscribeUrl}">Unsubscribe</a>
        </p>
      </div>
    `,
  });
};

// ─── New Article Notification ─────────────────────────────────────────────────
const notifySubscribers = async (article) => {
  // Find all active subscribers who follow this article's tag
  const subscribers = await Subscriber.find({
    tags: article.tag._id,
    isActive: true,
  }).select("email displayName unsubscribeToken");

  if (subscribers.length === 0) return;

  const articleUrl = `${process.env.CLIENT_URL}/articles/${article.slug}`;

  // Send individually so each has a unique unsubscribe link
  const emailPromises = subscribers.map((sub) => {
    const unsubscribeUrl = `${process.env.CLIENT_URL}/unsubscribe/${sub.unsubscribeToken}`;

    return transporter.sendMail({
      from: FROM,
      to: sub.email,
      subject: `New article: ${article.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2>${article.title}</h2>
          <p><strong>Tag:</strong> ${article.tag.name}</p>
          <p>${article.excerpt || ""}</p>
          <a href="${articleUrl}" style="
            display: inline-block;
            padding: 10px 20px;
            background: #1a1a1a;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 12px;
          ">Read Article →</a>
          <hr style="margin-top: 32px;" />
          <p style="font-size: 12px; color: #999;">
            You're receiving this because you subscribed to the
            <strong>${article.tag.name}</strong> tag on Blogbase.<br />
            <a href="${unsubscribeUrl}">Unsubscribe</a>
          </p>
        </div>
      `,
    });
  });

  // allSettled so one failed email doesn't block the rest
  await Promise.allSettled(emailPromises);
  console.log(
    `📧 Notified ${subscribers.length} subscriber(s) about: "${article.title}"`,
  );
};

module.exports = { sendWelcomeEmail, notifySubscribers };
