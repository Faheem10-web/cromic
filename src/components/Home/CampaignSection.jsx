import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Gem, Feather, ShieldCheck } from "lucide-react";
import API from "../../services/api";
import "./CampaignSection.css";

function CampaignSection() {
  const defaultThumbnail = "https://i.pinimg.com/736x/38/db/59/38db59fe904bcf6478757288c3e82aca.jpg";

  const [slides, setSlides] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState(defaultThumbnail);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const defaultSlides = [
    {
      tag: "THE CAMPAIGN",
      heading: "BEYOND THE ORDINARY.",
      paragraph: "Precision-engineered design that blends seamlessly with your daily lifestyle.",
      image_url: "https://i.pinimg.com/1200x/c7/fd/85/c7fd8584952f24e8e93b3ac61ff32de0.jpg"
    },
    {
      tag: "THE VISION",
      heading: "ARCHITECTURAL ELEGANCE.",
      paragraph: "Crafted with lightweight titanium and premium polarized lenses.",
      image_url: "https://i.pinimg.com/1200x/0b/35/65/0b35653ee75d43b2e7506fddfcb8d6e7.jpg"
    },
    {
      tag: "HERITAGE",
      heading: "TIMELESS LUXURY.",
      paragraph: "Iconic eyewear designed for statement style.",
      image_url: "https://x8.adencys.com/img/products/ANIMA-X1-001/1.1.jpg"
    }
  ];

  useEffect(() => {
    const controller = new AbortController();
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const res = await API.get("/campaign", { signal: controller.signal });
        if (!controller.signal.aborted && res.data) {
          if (Array.isArray(res.data.slides) && res.data.slides.length > 0) {
            setSlides(res.data.slides);
          } else {
            setSlides(defaultSlides);
          }
          if (res.data.video_url) {
            setVideoUrl(res.data.video_url);
          }
          if (res.data.video_thumbnail_url) {
            setVideoThumbnailUrl(res.data.video_thumbnail_url);
          } else {
            setVideoThumbnailUrl(defaultThumbnail);
          }
        } else {
          setSlides(defaultSlides);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Failed to load campaign content:", err);
          setSlides(defaultSlides);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchCampaign();
    return () => controller.abort();
  }, []);

  const displaySlides = slides.length > 0 ? slides : defaultSlides;

  useEffect(() => {
    if (!displaySlides || displaySlides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % displaySlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [displaySlides]);

  if (loading) return null;

  const activeSlide = displaySlides[index] || defaultSlides[0];

  return (
    <section className="campaign-section">
      {/* Full Background Media (Video or Image) */}
      {videoUrl ? (
        <video
          key={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="campaign-bg-media"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <img
          src={activeSlide.image_url || defaultSlides[0].image_url}
          alt={activeSlide.heading}
          className="campaign-bg-media"
        />
      )}

      {/* Dark Vignette Overlay */}
      <div className="campaign-overlay"></div>

      {/* Vertical Pagination Dots on Far Left */}
      <div className="campaign-vertical-dots">
        {displaySlides.map((_, i) => (
          <button
            key={i}
            className={`v-dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Left Content Area */}
      <div className="campaign-content-wrapper">
        <div className="container">
          <motion.div
            key={index}
            className="campaign-text-block"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="campaign-tag">
              {activeSlide.tag || "THE CAMPAIGN"}
            </span>

            <h1 className="campaign-heading">
              {activeSlide.heading || "BEYOND THE ORDINARY."}
            </h1>

            <Link to="/about" className="campaign-explore-btn">
              <span>EXPLORE STORY</span>
              <span className="arrow">⟶</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar: 3 Feature Icons + Video Thumbnail Box */}
      <div className="campaign-bottom-bar">
        <div className="container">
          <div className="bottom-divider-line"></div>

          <div className="bottom-bar-row">
            {/* 3 Features with Circle Outlines */}
            <div className="campaign-features">
              <div className="c-feature-item">
                <div className="c-icon-circle">
                  <Gem size={15} color="#ffffff" strokeWidth={1.5} />
                </div>
                <span>PRECISION CRAFTED</span>
              </div>

              <div className="c-divider"></div>

              <div className="c-feature-item">
                <div className="c-icon-circle">
                  <Feather size={15} color="#ffffff" strokeWidth={1.5} />
                </div>
                <span>PREMIUM MATERIALS</span>
              </div>

              <div className="c-divider"></div>

              <div className="c-feature-item">
                <div className="c-icon-circle">
                  <ShieldCheck size={15} color="#ffffff" strokeWidth={1.5} />
                </div>
                <span>TIMELESS DESIGN</span>
              </div>
            </div>

            {/* Video Thumbnail Box on Right */}
            <div 
              className="campaign-video-thumb-box"
              onClick={() => setIsVideoModalOpen(true)}
            >
              <img
                src={videoThumbnailUrl || defaultThumbnail}
                alt="Video Preview"
              />
              <div className="play-icon-circle">
                <span className="play-triangle">▶</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal if thumbnail is clicked */}
      {isVideoModalOpen && (
        <div className="video-modal-backdrop" onClick={() => setIsVideoModalOpen(false)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setIsVideoModalOpen(false)}>✕</button>
            {videoUrl ? (
              <video src={videoUrl} controls autoPlay className="modal-video-player" />
            ) : (
              <div className="no-video-placeholder">
                <p>Campaign video preview active.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default CampaignSection;