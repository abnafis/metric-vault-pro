import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView, trackScrollDepth, initDataLayer } from "@/lib/dataLayer";

/** Tracks page_view on route changes and scroll milestones */
export function usePageTracking() {
  const location = useLocation();
  const milestonesRef = useRef<Set<number>>(new Set());

  // Page view on route change
  useEffect(() => {
    initDataLayer();
    // Small delay to let document.title update
    const t = setTimeout(() => trackPageView(), 100);
    milestonesRef.current = new Set();
    return () => clearTimeout(t);
  }, [location.pathname]);

  // Scroll depth tracking
  useEffect(() => {
    const milestones = [25, 50, 75, 90];
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      const pct = Math.round((window.scrollY / h) * 100);
      for (const m of milestones) {
        if (pct >= m && !milestonesRef.current.has(m)) {
          milestonesRef.current.add(m);
          trackScrollDepth(m);
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);
}
