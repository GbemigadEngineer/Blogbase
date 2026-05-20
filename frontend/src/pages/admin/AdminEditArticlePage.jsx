import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, X } from "lucide-react";
import api from "../../services/api";
import RichTextEditor from "../../components/ui/RichTextEditor";

const AdminEditArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tag, setTag] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [error, setError] = useState("");

  // Fetch tags
  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: () => api.get("/tags").then((res) => res.data),
  });

  // Fetch single article by ID from new endpoint
  const { data: articleData, isLoading } = useQuery({
    queryKey: ["admin-article", id],
    queryFn: () => api.get(`/articles/admin/${id}`).then((res) => res.data),
  });

  // Populate form when article loads
  useEffect(() => {
    if (articleData?.data) {
      const article = articleData.data;
      setTitle(article.title || "");
      setContent(article.content || "");
      setExcerpt(article.excerpt || "");
      setTag(article.tag?._id || "");
      if (article.coverImage?.url) {
        setExistingImage(article.coverImage.url);
        setCoverPreview(article.coverImage.url);
      }
    }
  }, [articleData]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (formData) =>
      api.put(`/articles/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-articles"]);
      navigate("/admin/articles");
    },
    onError: (err) =>
      setError(err.response?.data?.message || "Failed to update article"),
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
      setExistingImage(null);
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    setCoverPreview(null);
    setExistingImage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!title || !content || !tag) {
      setError("Title, content and tag are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("excerpt", excerpt);
    formData.append("tag", tag);
    if (coverImage) formData.append("coverImage", coverImage);

    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-pink-50 dark:bg-gray-900 rounded w-1/3" />
        <div className="h-12 bg-pink-50 dark:bg-gray-900 rounded-xl" />
        <div className="h-12 bg-pink-50 dark:bg-gray-900 rounded-xl" />
        <div className="h-64 bg-pink-50 dark:bg-gray-900 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/articles"
          className="p-2 rounded-xl text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white">
            Edit Article
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Update your article
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Title <span className="text-pink-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            className="w-full px-4 py-3 rounded-xl border border-pink-100 dark:border-pink-900 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 text-sm"
            required
          />
        </div>

        {/* Tag */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Tag <span className="text-pink-500">*</span>
          </label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-pink-100 dark:border-pink-900 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:border-pink-400 text-sm"
            required
          >
            <option value="">Select a tag</option>
            {tagsData?.data?.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Excerpt
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short description of the article"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-pink-100 dark:border-pink-900 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 text-sm resize-none"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Cover Image
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          {coverPreview ? (
            <div className="relative rounded-xl overflow-hidden h-48">
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-pink-200 dark:border-pink-900 cursor-pointer hover:border-pink-400 transition-colors bg-pink-50 dark:bg-gray-900">
              <Upload size={24} className="text-pink-300 mb-2" />
              <span className="text-sm text-gray-500">
                Click to upload cover image
              </span>
              <span className="text-xs text-gray-400 mt-1">
                JPG, PNG, WEBP up to 5MB
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Content <span className="text-pink-500">*</span>
          </label>
          {content !== undefined && content !== null && (
            <RichTextEditor value={content} onChange={setContent} />
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3 rounded-full transition-colors disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
          <Link
            to="/admin/articles"
            className="px-6 py-3 rounded-full border border-pink-100 dark:border-pink-900 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:border-pink-300 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AdminEditArticlePage;
