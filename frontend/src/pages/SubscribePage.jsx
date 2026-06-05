import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";
import api from "../services/api";

const SubscribePage = () => {
  const { token } = useParams();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Fetch tags
  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: () => api.get("/tags").then((res) => res.data),
  });

  // Unsubscribe mutation
  const unsubscribeMutation = useMutation({
    mutationFn: (t) => api.get(`/subscriptions/unsubscribe/${t}`),
  });

  // Auto unsubscribe if token in URL
  useEffect(() => {
    if (token) {
      unsubscribeMutation.mutate(token);
    }
  }, [token]);

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: (data) => api.post("/subscriptions", data),
    onSuccess: (res) => {
      if (res.data.success) {
        setSuccess(true);
        setSubmittedEmail(email);
        setError("");
        setDisplayName("");
        setEmail("");
        setSelectedTags([]);
      } else {
        setError(res.data.message);
        setSuccess(false);
      }
    },
    onError: (err) => {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
      setSuccess(false);
    },
  });
  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!displayName || !email || selectedTags.length === 0) {
      setError("Please fill in all fields and select at least one tag.");
      return;
    }
    subscribeMutation.mutate({ displayName, email, tags: selectedTags });
  };

  // Unsubscribe page
  if (token) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        {unsubscribeMutation.isPending && (
          <p className="text-gray-500">Processing your request...</p>
        )}
        {unsubscribeMutation.isSuccess && (
          <div>
            <XCircle size={48} className="text-pink-500 mx-auto mb-4" />
            <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white mb-2">
              Unsubscribed
            </h2>
            <p className="text-gray-500 mb-6">
              You have been successfully unsubscribed from Blogbase.
            </p>
            <Link
              to="/"
              className="text-pink-500 font-semibold hover:underline"
            >
              Back to home
            </Link>
          </div>
        )}
        {unsubscribeMutation.isError && (
          <div>
            <p className="text-red-500 mb-4">
              Invalid or expired unsubscribe link.
            </p>
            <Link
              to="/"
              className="text-pink-500 font-semibold hover:underline"
            >
              Back to home
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-block bg-gradient-to-r from-pink-100 to-pink-50 dark:from-pink-950 dark:to-gray-900 rounded-full px-4 py-1 mb-4">
          <span className="text-pink-600 dark:text-pink-400 text-sm font-semibold">
            Free forever
          </span>
        </div>
        <h1 className="font-display font-black text-4xl text-gray-900 dark:text-white mb-3">
          Subscribe to Blogbase
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Get notified when new articles are published on the topics you care
          about. Subscribers can also comment on articles.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-950 p-8">
        {success ? (
          <div className="text-center py-6">
            <CheckCircle size={48} className="text-pink-500 mx-auto mb-4" />
            <h3 className="font-display font-black text-xl text-gray-900 dark:text-white mb-2">
              Check your email!
            </h3>
            <p className="text-gray-500 text-sm mb-2">
              We sent a confirmation link to
            </p>
            <p className="font-bold text-gray-900 dark:text-white text-sm mb-6">
              {submittedEmail}
            </p>
            <p className="text-gray-400 text-xs mb-6">
              Click the link in the email to activate your subscription. Check
              your spam folder if you do not see it.
            </p>
            <Link
              to="/"
              className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2.5 rounded-full transition-colors text-sm"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                placeholder="How you'll appear in comments"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-pink-100 dark:border-pink-900 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 text-sm"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-pink-100 dark:border-pink-900 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 text-sm"
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Topics you care about
              </label>
              <div className="flex flex-wrap gap-2">
                {tagsData?.data?.map((tag) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => toggleTag(tag._id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                      selectedTags.includes(tag._id)
                        ? "bg-pink-500 text-white border-pink-500"
                        : "border-pink-200 dark:border-pink-900 text-gray-600 dark:text-gray-400 hover:border-pink-400"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-full transition-colors disabled:opacity-50"
            >
              {subscribeMutation.isPending
                ? "Subscribing..."
                : "Subscribe for free"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              No spam. Unsubscribe at any time.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubscribePage;
