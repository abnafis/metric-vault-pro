import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHeroEditor from "./pages/AdminHeroEditor";
import AdminServicesEditor from "./pages/AdminServicesEditor";
import AdminCaseStudiesEditor from "./pages/AdminCaseStudiesEditor";
import AdminPlatformsEditor from "./pages/AdminPlatformsEditor";
import AdminTestimonialsEditor from "./pages/AdminTestimonialsEditor";
import AdminSettings from "./pages/AdminSettings";
import AdminAboutEditor from "./pages/AdminAboutEditor";
import AdminCTAEditor from "./pages/AdminCTAEditor";
import AdminBlogEditor from "./pages/AdminBlogEditor";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ResetPassword from "./pages/ResetPassword";
import AdminScriptsEditor from "./pages/AdminScriptsEditor";
import AdminAuditRequests from "./pages/AdminAuditRequests";
import AdminBrandingEditor from "./pages/AdminBrandingEditor";
import AdminPageBuilder from "./pages/AdminPageBuilder";
import AdminPageEditor from "./pages/AdminPageEditor";
import AdminProcessEditor from "./pages/AdminProcessEditor";
import AdminDashboardShowcaseEditor from "./pages/AdminDashboardShowcaseEditor";
import AdminFooterEditor from "./pages/AdminFooterEditor";
import AdminMediaLibrary from "./pages/AdminMediaLibrary";
import ScriptInjector from "./components/ScriptInjector";
import NotFound from "./pages/NotFound";
import DynamicPage from "./pages/DynamicPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScriptInjector />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="hero" element={<AdminHeroEditor />} />
              <Route path="services" element={<AdminServicesEditor />} />
              <Route path="process" element={<AdminProcessEditor />} />
              <Route path="case-studies" element={<AdminCaseStudiesEditor />} />
              <Route path="dashboard-showcase" element={<AdminDashboardShowcaseEditor />} />
              <Route path="platforms" element={<AdminPlatformsEditor />} />
              <Route path="testimonials" element={<AdminTestimonialsEditor />} />
              <Route path="about" element={<AdminAboutEditor />} />
              <Route path="cta" element={<AdminCTAEditor />} />
              <Route path="blog" element={<AdminBlogEditor />} />
              <Route path="scripts" element={<AdminScriptsEditor />} />
              <Route path="audit-requests" element={<AdminAuditRequests />} />
              <Route path="footer" element={<AdminFooterEditor />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="branding" element={<AdminBrandingEditor />} />
              <Route path="pages" element={<AdminPageBuilder />} />
              <Route path="pages/:pageId" element={<AdminPageEditor />} />
              <Route path="media" element={<AdminMediaLibrary />} />
            </Route>
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/p/:slug" element={<DynamicPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
