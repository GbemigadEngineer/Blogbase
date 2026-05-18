import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Users,
  MessageSquare,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2,
} from "lucide-react";
import api from "../../services/api";

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-950 p-6">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <div className="p-2 bg-pink-50 dark:bg-gray-800 rounded-xl">
        <Icon size={18} className="text-pink-500" />
      </div>
    </div>
    <p className="font-display font-black text-3xl text-gray-900 dark:text-white mb-1">
      {value ?? "—"}
    </p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
  </div>
);

const AdminDashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => api.get("/analytics/overview").then((res) => res.data),
  });

  const overview = data?.data;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Welcome back. Here's how your blog is doing.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-pink-50 dark:bg-gray-900 rounded-2xl h-32"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Articles Stats */}
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Articles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={FileText}
              label="Total Articles"
              value={overview?.articles?.total}
            />
            <StatCard
              icon={FileText}
              label="Published"
              value={overview?.articles?.published}
              sub="Live on site"
            />
            <StatCard
              icon={FileText}
              label="Drafts"
              value={overview?.articles?.drafts}
              sub="Not yet published"
            />
            <StatCard
              icon={Users}
              label="Subscribers"
              value={overview?.subscribers}
              sub="Active subscribers"
            />
          </div>

          {/* Engagement Stats */}
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Engagement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Eye}
              label="Total Views"
              value={overview?.engagement?.totalViews?.toLocaleString()}
            />
            <StatCard
              icon={ThumbsUp}
              label="Total Likes"
              value={overview?.engagement?.totalLikes?.toLocaleString()}
            />
            <StatCard
              icon={ThumbsDown}
              label="Total Dislikes"
              value={overview?.engagement?.totalDislikes?.toLocaleString()}
            />
            <StatCard
              icon={Share2}
              label="Total Shares"
              value={overview?.engagement?.totalShares?.toLocaleString()}
            />
          </div>

          {/* Comments */}
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Comments
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={MessageSquare}
              label="Total Comments"
              value={overview?.comments}
              sub="Approved comments"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
