import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Tag,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Twitter,
  Facebook,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import api from "../services/api";

const ArticlePage = () => {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [commentEmail, setCommentEmail] = useState("");
  const [commentSuccess, setCommentSuccess] = useState("");
  const [commentError, setCommentError] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch article
  const { data, isLoading, isError } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => api.get(`/articles/${slug}`).then((res) => res.data),
  });

  // Fetch comments
  const { data: commentsData } = useQuery({
    queryKey: ["comments", data?.data?._id],
    queryFn: () =>
      api.get(`/articles/${data.data._id}/comments`).then((res) => res.data),
    enabled: !!data?.data?._id,
  });

  // React mutation
  const reactMutation = useMutation({
    mutationFn: ({ id, type }) => api.post(`/articles/${id}/react`, { type }),
    onSuccess: () => queryClient.invalidateQueries(["article", slug]),
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: (id) => api.post(`/articles/${id}/share`),
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: (payload) =>
      api.post(`/articles/${data.data._id}/comments`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", data.data._id]);
      setComment("");
      setCommentEmail("");
      setReplyTo(null);
      setCommentSuccess("Comment posted successfully!");
      setCommentError("");
      setTimeout(() => setCommentSuccess(""), 3000);
    },
    onError: (err) => {
      setCommentError(err.response?.data?.message || "Failed to post comment");
      setCommentSuccess("");
    },
  });

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = data?.data?.title;
    shareMutation.mutate(data.data._id);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${title} ${url}`,
    };

    window.open(urls[platform], "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentEmail || !comment) return;
    commentMutation.mutate({
      email: commentEmail,
      content: comment,
      parentComment: replyTo || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-8 bg-pink-50 dark:bg-gray-900 rounded mb-4 w-3/4" />
        <div className="h-96 bg-pink-50 dark:bg-gray-900 rounded-2xl mb-8" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-pink-50 dark:bg-gray-900 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg mb-4">Article not found.</p>
        <Link to="/" className="text-pink-500 font-semibold hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const article = data.data;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-pink-500 transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to articles
      </Link>

      {/* Tag */}
      <div className="flex items-center gap-1.5 mb-4">
        <Tag size={13} className="text-pink-500" />
        <span className="text-pink-500 text-xs font-bold uppercase tracking-wider">
          {article.tag?.name}
        </span>
      </div>

      {/* Title */}
      <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white leading-tight mb-6">
        {article.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-pink-100 dark:border-pink-950">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} />
          {new Date(article.publishedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye size={14} />
          {article.views} views
        </span>
        <span className="flex items-center gap-1.5">
          <ThumbsUp size={14} />
          {article.likes} likes
        </span>
      </div>

      {/* Cover Image */}
      {article.coverImage?.url && (
        <div className="rounded-2xl overflow-hidden mb-10 h-80 md:h-96">
          <img
            src={article.coverImage.url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-lg dark:prose-invert max-w-none mb-12
          prose-headings:font-display prose-headings:font-black
          prose-p:text-gray-600 dark:prose-p:text-gray-300
          prose-a:text-pink-500 hover:prose-a:text-pink-600
          prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Like / Dislike / Share */}
      <div className="flex flex-wrap items-center gap-4 py-8 border-t border-b border-pink-100 dark:border-pink-950 mb-12">
        <button
          onClick={() =>
            reactMutation.mutate({ id: article._id, type: "like" })
          }
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-pink-50 dark:bg-gray-900 text-pink-500 font-semibold hover:bg-pink-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ThumbsUp size={16} />
          {article.likes}
        </button>
        <button
          onClick={() =>
            reactMutation.mutate({ id: article._id, type: "dislike" })
          }
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-500 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ThumbsDown size={16} />
          {article.dislikes}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <Share2 size={14} /> Share
          </span>
          <button
            onClick={() => handleShare("twitter")}
            title="Share on Twitter"
            className="p-2 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-500 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Twitter size={16} />
          </button>
          <button
            onClick={() => handleShare("facebook")}
            title="Share on Facebook"
            className="p-2 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-500 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Facebook size={16} />
          </button>
          <button
            onClick={() => handleShare("whatsapp")}
            title="Share on WhatsApp"
            className="p-2 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-500 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={handleCopy}
            title="Copy link"
            className="p-2 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-500 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors"
          >
            {copied ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mb-12">
        <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white mb-8">
          Comments ({commentsData?.count || 0})
        </h2>

        {/* Comment Form */}
        <div className="bg-pink-50 dark:bg-gray-900 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">
            {replyTo ? "Write a reply" : "Leave a comment"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            You must be a subscriber to comment.{" "}
            <Link
              to="/subscribe"
              className="text-pink-500 hover:underline font-semibold"
            >
              Subscribe here
            </Link>
          </p>

          {replyTo && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">
                Replying to a comment
              </span>
              <button
                onClick={() => setReplyTo(null)}
                className="text-xs text-pink-500 hover:underline"
              >
                Cancel
              </button>
            </div>
          )}

          <form onSubmit={handleComment} className="space-y-3">
            <input
              type="email"
              placeholder="Your subscriber email"
              value={commentEmail}
              onChange={(e) => setCommentEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-pink-100 dark:border-pink-900 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 text-sm"
              required
            />
            <textarea
              placeholder="Write your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-pink-100 dark:border-pink-900 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 text-sm resize-none"
              required
            />
            {commentSuccess && (
              <p className="text-green-500 text-sm">{commentSuccess}</p>
            )}
            {commentError && (
              <p className="text-red-500 text-sm">{commentError}</p>
            )}
            <button
              type="submit"
              disabled={commentMutation.isPending}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2.5 rounded-full transition-colors disabled:opacity-50 text-sm"
            >
              {commentMutation.isPending ? "Posting..." : "Post Comment"}
            </button>
          </form>
        </div>

        {/* Comments List */}
        {commentsData?.data?.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        )}

        <div className="space-y-6">
          {commentsData?.data?.map((c) => (
            <div
              key={c._id}
              className="border-l-2 border-pink-100 dark:border-pink-950 pl-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {c.displayName}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                {c.content}
              </p>
              <button
                onClick={() => setReplyTo(c._id)}
                className="text-xs text-pink-500 hover:underline font-semibold"
              >
                Reply
              </button>

              {/* Replies */}
              {c.replies?.length > 0 && (
                <div className="mt-4 space-y-4 ml-4 border-l-2 border-pink-50 dark:border-pink-950 pl-4">
                  {c.replies.map((reply) => (
                    <div key={reply._id}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">
                          {reply.displayName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(reply.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
