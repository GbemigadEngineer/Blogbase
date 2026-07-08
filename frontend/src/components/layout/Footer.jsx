import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-pink-100 dark:border-pink-950 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link
            to="/"
            className="font-display font-black text-2xl text-gray-900 dark:text-white"
          >
            Blog<span className="text-pink-500">base</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-pink-500 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/subscribe"
              className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-pink-500 transition-colors"
            >
              Subscribe
            </Link>
            <Link
              to="/about"
              className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
            >
              About
            </Link>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-pink-500 transition-colors"
            >
              Twitter
            </a>
          </div>
          <p className="text-sm text-gray-400">
            {year} Blogbase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
