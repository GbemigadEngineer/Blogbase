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
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});
const FROM = `"${process.env.EMAIL_FROM_NAME || "Blogbase"}" <${process.env.EMAIL_FROM}>`;

// ─── Verification Email ───────────────────────────────────────────────────────
// const sendVerificationEmail = async (subscriber) => {
//   const confirmUrl = `${process.env.CLIENT_URL}/confirm/${subscriber.confirmToken}`;

//   await transporter.sendMail({
//     from: FROM,
//     to: subscriber.email,
//     subject: "Confirm your Blogbase subscription",
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 32px;">
//         <h2 style="color: #111; font-size: 24px; margin-bottom: 8px;">
//           Confirm your subscription
//         </h2>
//         <p style="color: #666; margin-bottom: 24px;">
//           Hey ${subscriber.displayName}, thanks for subscribing to Blogbase.
//           Click the button below to confirm your email address and activate your subscription.
//         </p>
//         <a href="${confirmUrl}" style="
//           display: inline-block;
//           padding: 12px 24px;
//           background: #ec4899;
//           color: white;
//           text-decoration: none;
//           border-radius: 999px;
//           font-weight: bold;
//           font-size: 14px;
//         ">Confirm Subscription</a>
//         <p style="color: #999; font-size: 12px; margin-top: 32px;">
//           If you didn't subscribe to Blogbase, you can safely ignore this email.
//           This link expires in 24 hours.
//         </p>
//       </div>
//     `,
//   });
//   console.log("Email sent:", info.messageId);
// };
const sendVerificationEmail = async (subscriber) => {
  const confirmUrl = `${process.env.CLIENT_URL}/confirm/${subscriber.confirmToken}`;

  try {
    const info = await transporter.sendMail({
      from: FROM,
      to: subscriber.email,
      subject: "Confirm your Blogbase subscription",
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 32px;">
        <h2 style="color: #111; font-size: 24px; margin-bottom: 8px;">
          Confirm your subscription
        </h2>
        <p style="color: #666; margin-bottom: 24px;">
          Hey ${subscriber.displayName}, thanks for subscribing to Blogbase.
          Click the button below to confirm your email address and activate your subscription.
        </p>
        <a href="${confirmUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          background: #ec4899;
          color: white;
          text-decoration: none;
          border-radius: 999px;
          font-weight: bold;
          font-size: 14px;
        ">Confirm Subscription</a>
        <p style="color: #999; font-size: 12px; margin-top: 32px;">
          If you didn't subscribe to Blogbase, you can safely ignore this email.
          This link expires in 24 hours.
        </p>
      </div>
    `, // keep existing html
    });
    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Email error full details:", err);
    throw err;
  }
};
// ─── Welcome Email ────────────────────────────────────────────────────────────
const sendWelcomeEmail = async (subscriber) => {
  const unsubscribeUrl = `${process.env.CLIENT_URL}/unsubscribe/${subscriber.unsubscribeToken}`;

  await transporter.sendMail({
    from: FROM,
    to: subscriber.email,
    subject: "Welcome to Blogbase!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 32px;">
        <h2 style="color: #111; font-size: 24px; margin-bottom: 8px;">
          You are in, ${subscriber.displayName}!
        </h2>
        <p style="color: #666; margin-bottom: 16px;">
          Your subscription to Blogbase is now active. You will receive email
          notifications whenever new articles are published on the topics you follow.
        </p>
        <p style="color: #666; margin-bottom: 24px;">
          You can also comment on articles using your display name
          <strong>${subscriber.displayName}</strong>.
        </p>
        <a href="${process.env.CLIENT_URL}" style="
          display: inline-block;
          padding: 12px 24px;
          background: #ec4899;
          color: white;
          text-decoration: none;
          border-radius: 999px;
          font-weight: bold;
          font-size: 14px;
        ">Start Reading</a>
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999;">
          Don't want these emails?
          <a href="${unsubscribeUrl}" style="color: #ec4899;">Unsubscribe</a>
        </p>
      </div>
    `,
  });
};

// ─── New Article Notification ─────────────────────────────────────────────────
const notifySubscribers = async (article) => {
  // Only notify confirmed active subscribers
  const subscribers = await Subscriber.find({
    tags: article.tag._id,
    isActive: true,
    confirmedAt: { $ne: null },
  }).select("email displayName unsubscribeToken");

  if (subscribers.length === 0) return;

  const articleUrl = `${process.env.CLIENT_URL}/articles/${article.slug}`;

  const emailPromises = subscribers.map((sub) => {
    const unsubscribeUrl = `${process.env.CLIENT_URL}/unsubscribe/${sub.unsubscribeToken}`;

    return transporter.sendMail({
      from: FROM,
      to: sub.email,
      subject: `New article: ${article.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 32px;">
          <p style="color: #ec4899; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
            ${article.tag.name}
          </p>
          <h2 style="color: #111; font-size: 24px; margin-bottom: 8px;">
            ${article.title}
          </h2>
          <p style="color: #666; margin-bottom: 24px;">
            ${article.excerpt || ""}
          </p>
          <a href="${articleUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background: #ec4899;
            color: white;
            text-decoration: none;
            border-radius: 999px;
            font-weight: bold;
            font-size: 14px;
          ">Read Article</a>
          <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">
            You are receiving this because you subscribed to the
            <strong>${article.tag.name}</strong> tag on Blogbase.
            <a href="${unsubscribeUrl}" style="color: #ec4899;">Unsubscribe</a>
          </p>
        </div>
      `,
    });
  });

  await Promise.allSettled(emailPromises);
  console.log(
    `Notified ${subscribers.length} subscriber(s) about: "${article.title}"`,
  );
};

module.exports = { sendVerificationEmail, sendWelcomeEmail, notifySubscribers };
