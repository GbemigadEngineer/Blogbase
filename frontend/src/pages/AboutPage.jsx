import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-block bg-gradient-to-r from-pink-100 to-pink-50 dark:from-pink-950 dark:to-gray-900 rounded-full px-4 py-1 mb-6">
          <span className="text-pink-600 dark:text-pink-400 text-sm font-semibold">
            The story behind Blogbase
          </span>
        </div>
        <h1 className="font-display font-black text-5xl md:text-6xl text-gray-900 dark:text-white leading-tight mb-6">
          Not your typical
          <span className="block bg-gradient-to-r from-pink-500 to-pink-300 bg-clip-text text-transparent">
            blog.
          </span>
        </h1>
      </div>

      {/* Content */}
      <div className="space-y-8 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
        <p>
          Blogbase is not a media outlet. It is not a newsletter trying to hit a
          publishing schedule. It is not optimised for SEO or chasing trending
          topics. It is none of those things.
        </p>

        <p>
          What it is — is a personal corner of the internet where I write about
          things I actually care about. Sports, football, politics, life in
          Nigeria, opinions I have been sitting on for too long. When I feel
          like writing, I write. When I do not, I do not. Simple as that.
        </p>

        <div className="border-l-4 border-pink-500 pl-6 py-2">
          <p className="font-display font-black text-2xl text-gray-900 dark:text-white italic">
            "A hobby that came to life."
          </p>
        </div>

        <p>
          The idea for Blogbase came from a simple frustration — I had opinions
          and nowhere intentional to put them. Social media felt too noisy, too
          performative. I wanted a space that was mine. So I built one.
        </p>

        <p>
          Every article here represents a genuine thought, a real opinion,
          something I felt strongly enough about to sit down and write. There
          are no sponsored posts, no advertisers to answer to, no editorial
          calendar. Just writing, when it happens.
        </p>

        <p>
          If something I write resonates with you, I am glad. If it does not,
          that is fine too. This was never about building an audience — it just
          turned out that way.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-pink-100 dark:border-pink-950 my-12" />

      {/* What to expect */}
      <div className="mb-12">
        <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white mb-6">
          What you will find here
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              tag: "Sports",
              desc: "Match reactions, hot takes, and football opinions nobody asked for.",
            },
            {
              tag: "Manchester United",
              desc: "Dedicated coverage of the club I have followed my whole life.",
            },
            {
              tag: "Politics",
              desc: "Global political commentary from an African perspective.",
            },
            {
              tag: "Nigerian Politics",
              desc: "The chaos, the comedy, and the occasional hope of Nigerian politics.",
            },
          ].map((item) => (
            <div
              key={item.tag}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-950 p-5"
            >
              <span className="text-pink-500 text-xs font-bold uppercase tracking-wider">
                {item.tag}
              </span>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-pink-50 to-white dark:from-pink-950 dark:to-gray-900 rounded-2xl border border-pink-100 dark:border-pink-950 p-8 text-center">
        <h3 className="font-display font-black text-2xl text-gray-900 dark:text-white mb-3">
          Stay in the loop
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Subscribe to get notified when new articles drop. No spam, just
          articles — when they happen.
        </p>
        <Link
          to="/subscribe"
          className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3 rounded-full transition-colors"
        >
          Subscribe for free
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
