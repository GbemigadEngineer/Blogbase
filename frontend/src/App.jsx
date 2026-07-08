import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import ArticlePage from "./pages/ArticlePage";
import SubscribePage from "./pages/SubscribePage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminArticlesPage from "./pages/admin/AdminArticlesPage";
import AdminCreateArticlePage from "./pages/admin/AdminCreateArticlePage";
import AdminEditArticlePage from "./pages/admin/AdminEditArticlePage";
import AdminTagsPage from "./pages/admin/AdminTagsPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage";
import ConfirmPage from './pages/ConfirmPage';
import AboutPage from './pages/AboutPage';

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="articles/:slug" element={<ArticlePage />} />
        <Route path="subscribe" element={<SubscribePage />} />
        <Route path="unsubscribe/:token" element={<SubscribePage />} />
        <Route path="confirm/:token" element={<ConfirmPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>

      {/* Admin auth */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="articles" element={<AdminArticlesPage />} />
        <Route path="articles/create" element={<AdminCreateArticlePage />} />
        <Route path="articles/edit/:id" element={<AdminEditArticlePage />} />
        <Route path="tags" element={<AdminTagsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
