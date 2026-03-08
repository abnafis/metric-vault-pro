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
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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
              <Route path="hero" element={<div className="text-foreground">Hero Section — coming soon</div>} />
              <Route path="services" element={<div className="text-foreground">Services — coming soon</div>} />
              <Route path="case-studies" element={<div className="text-foreground">Case Studies — coming soon</div>} />
              <Route path="platforms" element={<div className="text-foreground">Platforms — coming soon</div>} />
              <Route path="testimonials" element={<div className="text-foreground">Testimonials — coming soon</div>} />
              <Route path="about" element={<div className="text-foreground">About Section — coming soon</div>} />
              <Route path="cta" element={<div className="text-foreground">CTA Section — coming soon</div>} />
              <Route path="footer" element={<div className="text-foreground">Footer — coming soon</div>} />
              <Route path="settings" element={<div className="text-foreground">Settings — coming soon</div>} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
