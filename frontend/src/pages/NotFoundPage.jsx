import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display font-black text-9xl text-pink-100 dark:text-pink-950 select-none">
          404
        </p>
        <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white -mt-6 mb-4">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3 rounded-full transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
