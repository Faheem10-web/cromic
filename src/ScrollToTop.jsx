import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  // Disable default browser scroll restoration globally on mount
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const resetScroll = () => {
      // Standard window scroll reset
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Reset Lenis smooth scroll if active
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      }
    };

    // 1. Reset scroll instantly on route change
    resetScroll();

    // 2. Reset on next animation frame to catch post-render layout changes
    const animId = requestAnimationFrame(resetScroll);

    // 3. Reset after a short timeout to catch async-rendered/fetched content
    const timeoutId50 = setTimeout(resetScroll, 50);
    const timeoutId100 = setTimeout(resetScroll, 100);
    const timeoutId200 = setTimeout(resetScroll, 200);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(timeoutId50);
      clearTimeout(timeoutId100);
      clearTimeout(timeoutId200);
    };
  }, [pathname]);

  return null;
}
