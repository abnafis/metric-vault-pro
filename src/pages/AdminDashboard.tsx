import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BarChart3, LogOut } from "lucide-react";

const AdminDashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/70">
        <div className="section-container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-glow-blue" />
            <span className="font-bold text-foreground">TrackRight Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="section-container py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back. Your admin panel is ready for content management.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            { label: "Testimonials", value: "6" },
            { label: "Case Studies", value: "3" },
            { label: "Platforms", value: "6" },
          ].map((s) => (
            <div key={s.label} className="glass-card p-6 text-center">
              <p className="text-3xl font-bold gradient-text">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
