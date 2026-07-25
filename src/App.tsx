import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { usePageTracking } from "@/hooks/usePageTracking";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScriptInjector from "./components/ScriptInjector";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

// Public routes (code split — pulled in only when navigated to)
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const DynamicPage = lazy(() => import("./pages/DynamicPage"));
const FunnelPage = lazy(() => import("./pages/FunnelPage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Admin routes — split into their own chunk, never load for public visitors
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminHeroEditor = lazy(() => import("./pages/AdminHeroEditor"));
const AdminServicesEditor = lazy(() => import("./pages/AdminServicesEditor"));
const AdminCaseStudiesEditor = lazy(() => import("./pages/AdminCaseStudiesEditor"));
const AdminPlatformsEditor = lazy(() => import("./pages/AdminPlatformsEditor"));
const AdminTestimonialsEditor = lazy(() => import("./pages/AdminTestimonialsEditor"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminAboutEditor = lazy(() => import("./pages/AdminAboutEditor"));
const AdminCTAEditor = lazy(() => import("./pages/AdminCTAEditor"));
const AdminBlogEditor = lazy(() => import("./pages/AdminBlogEditor"));
const AdminScriptsEditor = lazy(() => import("./pages/AdminScriptsEditor"));
const AdminAuditRequests = lazy(() => import("./pages/AdminAuditRequests"));
const AdminBrandingEditor = lazy(() => import("./pages/AdminBrandingEditor"));
const AdminPageBuilder = lazy(() => import("./pages/AdminPageBuilder"));
const AdminPageEditor = lazy(() => import("./pages/AdminPageEditor"));
const AdminProcessEditor = lazy(() => import("./pages/AdminProcessEditor"));
const AdminDashboardShowcaseEditor = lazy(() => import("./pages/AdminDashboardShowcaseEditor"));
const AdminFooterEditor = lazy(() => import("./pages/AdminFooterEditor"));
const AdminMediaLibrary = lazy(() => import("./pages/AdminMediaLibrary"));
const AdminFunnels = lazy(() => import("./pages/AdminFunnels"));
const AdminFunnelEditor = lazy(() => import("./pages/AdminFunnelEditor"));
const AdminFunnelLeads = lazy(() => import("./pages/AdminFunnelLeads"));
const AdminFAQEditor = lazy(() => import("./pages/AdminFAQEditor"));
const AdminMetricsEditor = lazy(() => import("./pages/AdminMetricsEditor"));
const AdminPartnerLogosEditor = lazy(() => import("./pages/AdminPartnerLogosEditor"));
const AdminWhyFeaturesEditor = lazy(() => import("./pages/AdminWhyFeaturesEditor"));
const AdminSectionHeadersEditor = lazy(() => import("./pages/AdminSectionHeadersEditor"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

function AppRoutes() {
  usePageTracking();
  return (
    <>
      <ScriptInjector />
      <Suspense fallback={<RouteFallback />}>
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
            <Route path="funnels" element={<AdminFunnels />} />
            <Route path="funnels/:funnelId" element={<AdminFunnelEditor />} />
            <Route path="funnels/:funnelId/leads" element={<AdminFunnelLeads />} />
            <Route path="faqs" element={<AdminFAQEditor />} />
            <Route path="metrics" element={<AdminMetricsEditor />} />
            <Route path="partner-logos" element={<AdminPartnerLogosEditor />} />
            <Route path="why-features" element={<AdminWhyFeaturesEditor />} />
            <Route path="section-headers" element={<AdminSectionHeadersEditor />} />
          </Route>
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/f/:slug" element={<FunnelPage />} />
          <Route path="/p/:slug" element={<DynamicPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
