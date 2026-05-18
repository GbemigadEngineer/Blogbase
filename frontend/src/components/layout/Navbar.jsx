import { Link } from "react-router-dom";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-pink-100 dark:border-pink-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="font-display font-black text-2xl text-gray-900 dark:text-white tracking-tight"
          >
            Blog<span className="text-pink-500">base</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/subscribe"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
            >
              Subscribe
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-pink-50 dark:bg-gray-800 text-pink-500 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-pink-50 dark:bg-gray-800 text-pink-500 dark:text-pink-400"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-700 dark:text-gray-300"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-pink-100 dark:border-pink-950 flex flex-col gap-4">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-pink-500"
            >
              Home
            </Link>
            <Link
              to="/subscribe"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-pink-500"
            >
              Subscribe
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
