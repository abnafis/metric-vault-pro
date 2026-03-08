import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { BarChart3 } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Page Not Found";
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background bg-grid-pattern">
      <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
      <div className="relative z-10 text-center space-y-6">
        <BarChart3 className="w-12 h-12 text-primary mx-auto" />
        <h1 className="text-6xl font-extrabold text-foreground">404</h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="btn-primary-glow inline-flex items-center gap-2 text-sm"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
