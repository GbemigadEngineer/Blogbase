import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Calendar, Tag, ThumbsUp, Eye } from "lucide-react";
import api from "../services/api";

const HomePage = () => {
  const [selectedTag, setSelectedTag] = useState("");
  const [page, setPage] = useState(1);

  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: () => api.get("/tags").then((res) => res.data),
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["articles", page, selectedTag],
    queryFn: () =>
      api
        .get("/articles", {
          params: { page, limit: 9, tag: selectedTag || undefined },
        })
        .then((res) => res.data),
  });

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-16 px-4">
        <div className="inline-block bg-gradient-to-r from-pink-100 to-pink-50 dark:from-pink-950 dark:to-gray-900 rounded-full px-4 py-1 mb-6">
          <span className="text-pink-600 dark:text-pink-400 text-sm font-semibold">
            A personal publication
          </span>
        </div>
        <h1 className="font-display font-black text-5xl md:text-7xl text-gray-900 dark:text-white leading-tight mb-6">
          Stories worth
          <span className="block bg-gradient-to-r from-pink-500 to-pink-300 bg-clip-text text-transparent">
            reading.
          </span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto mb-8">
          Articles on sports, politics, and everything in between. Subscribe to
          get notified when new pieces drop.
        </p>
        <Link
          to="/subscribe"
          className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3 rounded-full transition-colors"
        >
          Subscribe for free
        </Link>
      </div>

      {/* Tag Filter */}
      {tagsData?.data?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => {
              setSelectedTag("");
              setPage(1);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              selectedTag === ""
                ? "bg-pink-500 text-white border-pink-500"
                : "border-pink-200 dark:border-pink-900 text-gray-600 dark:text-gray-400 hover:border-pink-400"
            }`}
          >
            All
          </button>
          {tagsData.data.map((tag) => (
            <button
              key={tag._id}
              onClick={() => {
                setSelectedTag(tag._id);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                selectedTag === tag._id
                  ? "bg-pink-500 text-white border-pink-500"
                  : "border-pink-200 dark:border-pink-900 text-gray-600 dark:text-gray-400 hover:border-pink-400"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Articles Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-pink-50 dark:bg-gray-900 rounded-2xl h-72"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-20 text-gray-500">
          Failed to load articles. Please try again.
        </div>
      )}

      {!isLoading && !isError && data?.data?.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No articles published yet.</p>
        </div>
      )}

      {!isLoading && !isError && data?.data?.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((article, index) => (
              <Link
                key={article._id}
                to={`/articles/${article.slug}`}
                className={`group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-pink-100 dark:border-pink-950 hover:border-pink-300 dark:hover:border-pink-700 hover:shadow-lg hover:shadow-pink-100 dark:hover:shadow-pink-950 transition-all duration-300 ${
                  index === 0 ? "md:col-span-2 lg:col-span-2" : ""
                }`}
              >
                {/* Cover Image */}
                {article.coverImage?.url ? (
                  <div
                    className={`overflow-hidden ${index === 0 ? "h-64" : "h-48"}`}
                  >
                    <img
                      src={article.coverImage.url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div
                    className={`bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-950 dark:to-gray-900 ${index === 0 ? "h-64" : "h-48"} flex items-center justify-center`}
                  >
                    <span className="font-display font-black text-4xl text-pink-200 dark:text-pink-900">
                      {article.title.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Tag */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <Tag size={12} className="text-pink-500" />
                    <span className="text-pink-500 text-xs font-bold uppercase tracking-wider">
                      {article.tag?.name}
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className={`font-display font-black text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors leading-tight mb-3 ${
                      index === 0 ? "text-2xl" : "text-lg"
                    }`}
                  >
                    {article.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                    {article.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(article.publishedAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {article.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={12} />
                      {article.likes}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-5 py-2 rounded-full border border-pink-200 dark:border-pink-900 text-sm font-semibold text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:border-pink-400 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-5 py-2 rounded-full border border-pink-200 dark:border-pink-900 text-sm font-semibold text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:border-pink-400 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
