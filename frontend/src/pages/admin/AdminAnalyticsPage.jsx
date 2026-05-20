import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "../../services/api";

const AdminAnalyticsPage = () => {
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => api.get("/analytics/overview").then((res) => res.data),
  });

  const { data: articleData, isLoading: articleLoading } = useQuery({
    queryKey: ["analytics-articles"],
    queryFn: () =>
      api.get("/analytics/articles?sortBy=views").then((res) => res.data),
  });

  const { data: subscriberData, isLoading: subscriberLoading } = useQuery({
    queryKey: ["analytics-subscribers"],
    queryFn: () => api.get("/analytics/subscribers").then((res) => res.data),
  });

  // Format article data for chart
  const articleChartData = articleData?.data?.slice(0, 10).map((a) => ({
    name: a.title.length > 20 ? a.title.substring(0, 20) + "..." : a.title,
    views: a.views,
    likes: a.likes,
    shares: a.shares,
  }));

  // Format subscriber growth data for chart
  const subscriberChartData = subscriberData?.data?.map((s) => ({
    name: `${s._id.year}/${String(s._id.month).padStart(2, "0")}`,
    subscribers: s.count,
  }));

  const overview = overviewData?.data;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Track your content performance
        </p>
      </div>

      {/* Overview Stats */}
      {overviewLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-pink-50 dark:bg-gray-900 rounded-2xl h-24"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Total Views",
              value: overview?.engagement?.totalViews?.toLocaleString(),
            },
            {
              label: "Total Likes",
              value: overview?.engagement?.totalLikes?.toLocaleString(),
            },
            {
              label: "Total Shares",
              value: overview?.engagement?.totalShares?.toLocaleString(),
            },
            {
              label: "Subscribers",
              value: overview?.subscribers?.toLocaleString(),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-950 p-5"
            >
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {stat.label}
              </p>
              <p className="font-display font-black text-2xl text-gray-900 dark:text-white">
                {stat.value ?? "0"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Article Performance Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-950 p-6 mb-6">
        <h2 className="font-display font-black text-xl text-gray-900 dark:text-white mb-6">
          Article Performance
        </h2>
        {articleLoading ? (
          <div className="animate-pulse bg-pink-50 dark:bg-gray-800 rounded-xl h-64" />
        ) : articleChartData?.length === 0 ? (
          <p className="text-center text-gray-400 py-10">
            No article data yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={articleChartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #fce7f3",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
              <Bar
                dataKey="views"
                fill="#ec4899"
                radius={[4, 4, 0, 0]}
                name="Views"
              />
              <Bar
                dataKey="likes"
                fill="#f9a8d4"
                radius={[4, 4, 0, 0]}
                name="Likes"
              />
              <Bar
                dataKey="shares"
                fill="#fbcfe8"
                radius={[4, 4, 0, 0]}
                name="Shares"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Subscriber Growth Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-950 p-6">
        <h2 className="font-display font-black text-xl text-gray-900 dark:text-white mb-6">
          Subscriber Growth
        </h2>
        {subscriberLoading ? (
          <div className="animate-pulse bg-pink-50 dark:bg-gray-800 rounded-xl h-64" />
        ) : subscriberChartData?.length === 0 ? (
          <p className="text-center text-gray-400 py-10">
            No subscriber data yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={subscriberChartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #fce7f3",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="subscribers"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ fill: "#ec4899", r: 4 }}
                name="Subscribers"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
