import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Tag } from "lucide-react";
import api from "../../services/api";

const AdminArticlesPage = () => {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: () => api.get("/articles/admin/all").then((res) => res.data),
  });

  const publishMutation = useMutation({
    mutationFn: (id) => api.patch(`/articles/${id}/publish`),
    onSuccess: () => queryClient.invalidateQueries(["admin-articles"]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-articles"]);
      setDeleteId(null);
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white">
            Articles
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage your articles
          </p>
        </div>
        <Link
          to="/admin/articles/create"
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-5 py-2.5 rounded-full transition-colors text-sm"
        >
          <Plus size={16} />
          New Article
        </Link>
      </div>

      {/* Articles List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-pink-50 dark:bg-gray-900 rounded-2xl h-24"
            />
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">No articles yet.</p>
          <Link
            to="/admin/articles/create"
            className="text-pink-500 font-semibold hover:underline"
          >
            Create your first article
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.data.map((article) => (
            <div
              key={article._id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-950 p-5 flex items-center gap-4"
            >
              {/* Cover thumbnail */}
              {article.coverImage?.url ? (
                <img
                  src={article.coverImage.url}
                  alt={article.title}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-950 dark:to-gray-800 flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-black text-xl text-pink-300 dark:text-pink-800">
                    {article.title.charAt(0)}
                  </span>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white truncate mb-1">
                  {article.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Tag size={11} />
                    {article.tag?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(article.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      article.isPublished
                        ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                    }`}
                  >
                    {article.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Publish toggle */}
                <button
                  onClick={() => publishMutation.mutate(article._id)}
                  disabled={publishMutation.isPending}
                  title={article.isPublished ? "Unpublish" : "Publish"}
                  className="p-2 rounded-xl text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {article.isPublished ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

                {/* Edit */}
                <Link
                  to={`/admin/articles/edit/${article._id}`}
                  className="p-2 rounded-xl text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Edit size={16} />
                </Link>

                {/* Delete */}
                <button
                  onClick={() => setDeleteId(article._id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-950 p-8 max-w-sm w-full">
            <h3 className="font-display font-black text-xl text-gray-900 dark:text-white mb-2">
              Delete article?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. The article and its cover image will
              be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-full border border-pink-100 dark:border-pink-900 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:border-pink-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArticlesPage;
