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
import ScriptInjector from "./components/ScriptInjector";
import NotFound from "./pages/NotFound";

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
              {/* Future content management routes */}
              <Route path="hero" element={<AdminHeroEditor />} />
              <Route path="services" element={<AdminServicesEditor />} />
              <Route path="case-studies" element={<AdminCaseStudiesEditor />} />
              <Route path="platforms" element={<AdminPlatformsEditor />} />
              <Route path="testimonials" element={<AdminTestimonialsEditor />} />
              <Route path="about" element={<AdminAboutEditor />} />
              <Route path="cta" element={<AdminCTAEditor />} />
              <Route path="blog" element={<AdminBlogEditor />} />
              <Route path="scripts" element={<AdminScriptsEditor />} />
              <Route path="footer" element={<AdminSettings />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
