import { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import "./Hero.css";
import { useSiteSettings } from "../../context/SiteSettingsContext";

// Component to render individual video stream programmatically to prevent duplicate reload requests and unmounting
function HeroVideo({ src, poster, isActive, nextSlide, shouldLoop }) {
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch((err) => {
        console.warn("Autoplay was prevented:", err.message);
      });
    } else {
      video.pause();
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      muted
      loop={shouldLoop}
      playsInline
      preload="auto"
      poster={poster || undefined}
      onLoadedData={() => setIsReady(true)}
      onEnded={nextSlide}
      className={`hero-video ${isReady ? "video-ready" : ""}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        pointerEvents: "none",
        opacity: isReady ? 1 : 0,
        transition: "opacity 0.8s ease-in-out",
        zIndex: 0
      }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

function TypingText({ text, enabled }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      return;
    }
    
    setDisplayedText("");
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [text, enabled]);

  return <p>{displayedText}</p>;
}

const defaultHeroBanners = [
  {
    id: "default-1",
    title: "VISION\nREDEFINED",
    subtitle: "Timeless design.\nMade to be seen.",
    hero_image: "https://i.pinimg.com/1200x/c7/fd/85/c7fd8584952f24e8e93b3ac61ff32de0.jpg",
    button_text: "EXPLORE COLLECTION",
    button_link: "/shop",
    tag: "NEW COLLECTION 2026"
  }
];

function Hero() {
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [intervalSec, setIntervalSec] = useState(8);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        const heroRes = await API.get("/dashboard/hero", { signal: controller.signal });

        if (!controller.signal.aborted) {
          const rawBanners = Array.isArray(heroRes.data) ? heroRes.data : [];
          const active = rawBanners
            .filter((b) => b.active_status === 1 || b.active_status === true)
            .sort((a, b) => (a.banner_order || 0) - (b.banner_order || 0));
          
          setBanners(active);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Failed to load hero data:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (settings && settings.hero_slide_interval) {
      setIntervalSec(settings.hero_slide_interval);
    }
  }, [settings]);

  const displayBanners = banners.length > 0 ? banners : defaultHeroBanners;

  const nextSlide = () => {
    if (displayBanners.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % displayBanners.length);
  };

  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const timer = setInterval(nextSlide, intervalSec * 1000);
    return () => clearInterval(timer);
  }, [displayBanners, intervalSec, activeIndex]);

  if (loading) return null;

  return (
    <section className="hero">
      {displayBanners.map((b, index) => {
        const isActive = index === activeIndex;
        const titleText = b.title || "VISION\nREDEFINED";
        
        return (
          <div
            key={b.id || b._id || index}
            className={`hero-slide ${isActive ? "active" : ""}`}
            style={{
              position: "absolute",
              inset: 0,
              opacity: isActive ? 1 : 0,
              transition: "opacity 1.2s ease-in-out",
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            {b.hero_video ? (
              <HeroVideo
                src={b.hero_video}
                poster={b.hero_image}
                isActive={isActive}
                shouldLoop={displayBanners.length === 1}
                nextSlide={displayBanners.length > 1 ? nextSlide : undefined}
              />
            ) : (
              <img
                src={b.hero_image || defaultHeroBanners[0].hero_image}
                alt={b.title || "Vision Redefined"}
                className="hero-image-bg"
              />
            )}

            {/* Dark Vignette Overlay */}
            <div className="hero-overlay-dark"></div>

            {/* Main Content Area */}
            <div className="hero-content-inner">
              <div className="hero-left-content">
                <div className="hero-badge">
                  <span className="hero-line"></span>
                  <span className="hero-tag-text">{b.tag || "NEW COLLECTION 2026"}</span>
                </div>

                <h1 className="hero-serif-title">
                  {titleText.split("\n").map((line, i) => (
                    <span key={i} style={{ display: "block" }}>{line}</span>
                  ))}
                </h1>

                <div className="hero-line sub-line"></div>

                <div className="hero-subtitle-box">
                  <p>{b.subtitle || "Timeless design.\nMade to be seen."}</p>
                </div>

                {settings.show_hero_primary_cta !== false && (
                  <div className="hero-cta-wrapper">
                    <a href={b.button_link || "/shop"} className="hero-explore-btn">
                      <span>{b.button_text || "EXPLORE COLLECTION"}</span>
                      <span className="arrow">⟶</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Bar: Scroll Indicator (Left) & Features List (Right) */}
            <div className="hero-bottom-bar">
              <div 
                className="hero-scroll-btn" 
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
              >
                <div className="scroll-circle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </div>
                <span className="scroll-text">SCROLL</span>
              </div>

              <div className="hero-features-list">
                <span>PREMIUM MATERIALS</span>
                <span className="feature-divider">|</span>
                <span>TIMELESS DESIGN</span>
                <span className="feature-divider">|</span>
                <span>HANDCRAFTED</span>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default Hero;