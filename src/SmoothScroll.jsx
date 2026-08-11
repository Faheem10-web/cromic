import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useSiteSettings } from "./context/SiteSettingsContext";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScroll() {
  const { settings } = useSiteSettings();
  const location = useLocation();

  useEffect(() => {
    if (settings.enable_smooth_scroll === false) return;

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Initialize global Lenis instance with ultra-luxury inertia scroll physics
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.8,
      // On mobile touch devices, allow responsive native touch feedback
      smoothTouch: false,
      autoRaf: false, // Driven explicitly via GSAP ticker loop
      anchors: true,
    });

    window.lenis = lenis;

    // Sync GSAP / ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Coordinate with GSAP ticker loop for unified frame steps
    const tickHandler = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickHandler);
    gsap.ticker.lagSmoothing(0);

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
      gsap.ticker.remove(tickHandler);
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