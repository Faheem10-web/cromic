import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useSiteSettings } from "./context/SiteSettingsContext";

export default function SmoothScroll() {
  const { settings } = useSiteSettings();
  const location = useLocation();

  useEffect(() => {
    if (settings.enable_smooth_scroll === false) return;

    // Detect mobile touch devices
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const isMobileWidth = window.innerWidth < 768;

    // Initialize global Lenis instance
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      // On mobile touch devices, allow responsive native touch feedback
      smoothTouch: false,
      autoRaf: false, // Driven explicitly via rAF loop for 60 FPS precision
      anchors: true,
    });

    window.lenis = lenis;

    // Explicit requestAnimationFrame loop for 60 FPS synchronization
    let rafId;
    function updateRaf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(updateRaf);
    }
    rafId = requestAnimationFrame(updateRaf);

    // Sync GSAP / ScrollTrigger if loaded on window
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    }

    // Refresh Lenis on window resize and page load
    const handleResize = () => {
      lenis.resize();
    };

    const handleLoad = () => {
      lenis.resize();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("load", handleLoad);

    // Smooth anchor link click handler
    const handleAnchorClick = (e) => {
      const targetAnchor = e.target.closest("a[href^='#']");
      if (targetAnchor) {
        const hash = targetAnchor.getAttribute("href");
        if (hash && hash !== "#") {
          const el = document.querySelector(hash);
          if (el) {
            e.preventDefault();
            lenis.scrollTo(el, { offset: -80 });
          }
        }
      }
    };
    document.addEventListener("click", handleAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("load", handleLoad);
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
      window.lenis = null;
    };
  }, [settings.enable_smooth_scroll]);

  // Refresh Lenis layout on route changes
  useEffect(() => {
    if (window.lenis) {
      window.lenis.resize();
    }
  }, [location.pathname]);

  return null;
}