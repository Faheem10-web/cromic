import { useEffect, useState, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import Header from "./components/Common/Header";
import Footer from "./components/Common/Footer";
import Product from "./Pages/Product";
import Contact from "./Pages/Contact";
import ProductPage from "./Pages/ProductPage";
import About from "./Pages/About";
import SmoothScroll from "./SmoothScroll";
import ScrollToTop from "./ScrollToTop";
import Login from "./Pages/Login";
import AdminDashboard from "./Pages/AdminDashboard";
import SearchPage from "./Pages/SearchPage";
import Cart from "./Pages/Cart";
import InstallPWA from "./components/Common/InstallPWA";
import { useSiteSettings } from "./context/SiteSettingsContext";

// Dynamic custom fluid trailing cursor with 60/120fps hardware acceleration
function CustomCursor({ enabled }) {
  const dotRef = useRef(null);
  const trailRef = useRef(null);
  const posRef = useRef({ x: -100, y: -100 });
  const trailPosRef = useRef({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const moveCursor = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    const handleHoverStart = (e) => {
      const isTarget = !!e.target.closest("a, button, [role='button'], input, select, textarea");
      if (trailRef.current) {
        trailRef.current.style.width = isTarget ? "44px" : "28px";
        trailRef.current.style.height = isTarget ? "44px" : "28px";
      }
    };

    window.addEventListener("mousemove", moveCursor, { passive: true });
    window.addEventListener("mouseover", handleHoverStart, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    let animFrame;
    const loop = () => {
      const targetX = posRef.current.x;
      const targetY = posRef.current.y;

      const currentTrail = trailPosRef.current;
      const dx = targetX - currentTrail.x;
      const dy = targetY - currentTrail.y;
      
      currentTrail.x += dx * 0.18;
      currentTrail.y += dy * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${currentTrail.x}px, ${currentTrail.y}px, 0) translate(-50%, -50%)`;
      }

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleHoverStart);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [enabled, visible]);

  if (!enabled) return null;

  return (
    <>
      <div 
        ref={dotRef}
        className="custom-cursor-dot"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "6px",
          height: "6px",
          backgroundColor: "var(--primary-text)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 99999,
          mixBlendMode: "difference",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.2s ease"
        }}
      />
      <div 
        ref={trailRef}
        className="custom-cursor-trail"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "28px",
          height: "28px",
          border: "1px solid var(--primary-text)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 99998,
          transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease",
          mixBlendMode: "difference",
          opacity: visible ? 0.7 : 0
        }}
      />
    </>
  );
}

// ─── Luxury Full-Screen Cinematic Intro Loader ──────────────────────────────
function PageLoader({ enabled }) {
  const [phase, setPhase] = useState("visible"); // visible | fading-out | hidden
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setPhase("hidden");
      document.body.style.overflow = "";
      return;
    }

    // Preload hero images & logo
    const logoImg = new Image();
    logoImg.src = "/assets/cromic.png";

    const heroImg = new Image();
    heroImg.src = "https://i.pinimg.com/1200x/c7/fd/85/c7fd8584952f24e8e93b3ac61ff32de0.jpg";

    // Disable scrolling while intro is visible
    document.body.style.overflow = "hidden";
    setPhase("visible");

    // Smoothly animate progress bar 0% -> 100% over 1.4 seconds (1400ms)
    const duration = 1400; // ms
    const startTime = performance.now();
    let animFrame;

    const updateProgress = (now) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (pct < 100) {
        animFrame = requestAnimationFrame(updateProgress);
      } else {
        // Complete intro & fade out
        setTimeout(() => {
          setPhase("fading-out");
          document.body.classList.add("intro-revealed");

          setTimeout(() => {
            document.body.style.overflow = "";
            setPhase("hidden");
          }, 500);
        }, 150);
      }
    };

    animFrame = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animFrame);
      document.body.style.overflow = "";
    };
  }, [enabled]);

  if (phase === "hidden") return null;

  const isFadingOut = phase === "fading-out";

  return (
    <div
      id="cromic-intro-loader"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        opacity: isFadingOut ? 0 : 1,
        transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: isFadingOut ? "none" : "all",
      }}
    >
      {/* Luxury Centered Logo */}
      <img
        src="/assets/cromic.png"
        alt="CROMIC"
        style={{
          width: "200px",
          height: "auto",
          display: "block",
          animation: "introLogoBreath 2.8s ease-in-out infinite",
          marginBottom: "32px",
          willChange: "transform, opacity"
        }}
      />

      {/* Subtitle Text */}
      <p
        style={{
          color: "rgba(255, 255, 255, 0.75)",
          fontSize: "13px",
          fontFamily: "'Cinzel', 'Playfair Display', 'Inter', serif",
          fontWeight: 500,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          margin: "0 0 20px 0",
          animation: "introTextPulse 1.4s ease-in-out infinite"
        }}
      >
        ENTER THE VISION
      </p>

      {/* Progress Track */}
      <div
        style={{
          width: "180px",
          height: "2px",
          backgroundColor: "rgba(255, 255, 255, 0.12)",
          borderRadius: "999px",
          overflow: "hidden",
          position: "relative"
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            backgroundColor: "#ffffff",
            borderRadius: "999px",
            transition: "width 80ms linear",
            boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)"
          }}
        />
      </div>

      <style>{`
        @keyframes introLogoBreath {
          0%, 100% {
            transform: scale(1);
            opacity: 0.88;
          }
          50% {
            transform: scale(1.03);
            opacity: 1;
            filter: drop-shadow(0 0 16px rgba(255, 255, 255, 0.18));
          }
        }
        @keyframes introTextPulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.9; }
        }
        @media (prefers-reduced-motion: reduce) {
          #cromic-intro-loader img,
          #cromic-intro-loader p {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const { settings, loading } = useSiteSettings();

  // Sync Dynamic Favicon
  useEffect(() => {
    if (loading || !settings.favicon_url) return;
    
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = settings.favicon_url;
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = settings.favicon_url;
      document.head.appendChild(newLink);
    }
  }, [settings.favicon_url, loading]);

  // Sync Section Animations Visibility
  useEffect(() => {
    if (loading) return;

    if (settings.enable_section_animations === false) {
      document.body.classList.add("no-animations");
    } else {
      document.body.classList.remove("no-animations");
    }
  }, [settings.enable_section_animations, loading]);

  return (
    <>
      <ScrollToTop />
      <SmoothScroll />
      <CustomCursor enabled={!isAdminPath && settings.enable_cursor_effect !== false} />
      <PageLoader enabled={!isAdminPath} />
      {!isAdminPath && <InstallPWA />}
      
      {!isAdminPath && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/shop" element={<Product />} />
        <Route path="/about" element={<About />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Home />} />
      </Routes>
      
      {!isAdminPath && <Footer />}
    </>
  );
}

export default App;