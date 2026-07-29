import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import "./Lookbook.css";
import { HiArrowLeft, HiArrowRight, HiArrowLongRight } from "react-icons/hi2";

const defaultMenImages = [
  "https://i.pinimg.com/1200x/ef/bf/7f/efbf7f315360dfeb44b5837f937a5fe.jpg",
  "https://i.pinimg.com/1200x/b1/48/0b/b1480b502149be9afc8769b976086b24.jpg",
  "https://i.pinimg.com/736x/16/e3/c8/16e3c803108b8b4f8a29347376d1ff18.jpg",
  "https://i.pinimg.com/1200x/f2/7a/d0/f27ad0e1535c849592443b189441a239.jpg"
];

const defaultWomenImages = [
  "https://res.cloudinary.com/ddluoarzr/image/upload/f_auto,q_auto/v1784856533/c1e3097c27038e2dffbe9f518e227289_fy23o6.jpg",
  "https://i.pinimg.com/736x/21/6b/c4/216bc4440041891f2c1829749206590e.jpg",
  "https://i.pinimg.com/1200x/dd/1d/64/dd1d648053c844d679ab23349818f7c6.jpg",
  "https://i.pinimg.com/1200x/ba/d6/d8/bad6d85eb2ee5bdf24f3dead62767225.jpg"
];

function LookbookCard({ item, index }) {
  const isMens = item.look_key === "mens" || (item.category && item.category.toLowerCase().includes("men")) || (item.title && item.title.toLowerCase().includes("men"));
  const defaultFallback = isMens ? defaultMenImages : defaultWomenImages;

  // Prioritize database config images over local default placeholders
  const images = (Array.isArray(item.images) && item.images.filter(Boolean).length > 0)
    ? item.images.filter(Boolean)
    : (item.image_url ? [item.image_url] : defaultFallback);

  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 3000); // 3 seconds rotation interval

    return () => clearInterval(interval);
  }, [images]);

  return (
    <motion.div 
      className="lookbook-card" 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="lookbook-slider-wrapper">
        {images.map((img, idx) => (
          <motion.img
            key={img + idx}
            src={img}
            alt={item.title}
            loading="lazy"
            initial={{ opacity: 0 }}
            animate={{ opacity: idx === currentIdx ? 1 : 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none"
            }}
          />
        ))}
      </div>

      <div className="lookbook-overlay"></div>

      {images.length > 1 && (
        <div className="lookbook-dots-container">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`lookbook-dot ${idx === currentIdx ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIdx(idx);
              }}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}

      <div className="lookbook-content">
        <span className="lookbook-label">LOOKBOOK</span>
        <h2>{item.title}</h2>
        <Link to="/shop" className="lookbook-shop-link">
          <span>Shop Collection</span>
          <HiArrowLongRight size={18} />
        </Link>
      </div>
    </motion.div>
  );
}

function Lookbook() {
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchLooks = async () => {
      try {
        setLoading(true);
        const res = await API.get("/lookbook", { signal: controller.signal });
        if (!controller.signal.aborted && Array.isArray(res.data) && res.data.length > 0) {
          setLooks(res.data);
        } else {
          setLooks(defaultLooks);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Failed to fetch lookbook data:", err);
          setLooks(defaultLooks);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchLooks();
    return () => controller.abort();
  }, []);

  const defaultLooks = [
    {
      title: "Men's Opticals",
      category: "mens",
      image_url: "https://i.pinimg.com/1200x/ef/bf/7f/efbf7f315360dfeb44b5837f937a5fe.jpg",
      images: [
        "https://i.pinimg.com/1200x/ef/bf/7f/efbf7f315360dfeb44b5837f937a5fe.jpg",
        "https://i.pinimg.com/1200x/b1/48/0b/b1480b502149be9afc8769b976086b24.jpg",
        "https://i.pinimg.com/736x/16/e3/c8/16e3c803108b8b4f8a29347376d1ff18.jpg",
        "https://i.pinimg.com/1200x/f2/7a/d0/f27ad0e1535c849592443b189441a239.jpg"
      ]
    },
    {
      title: "Women's Opticals",
      category: "womens",
      image_url: "https://i.pinimg.com/736x/21/6b/c4/216bc4440041891f2c1829749206590e.jpg",
      images: [
        "https://i.pinimg.com/736x/21/6b/c4/216bc4440041891f2c1829749206590e.jpg",
        "https://i.pinimg.com/1200x/dd/1d/64/dd1d648053c844d679ab23349818f7c6.jpg",
        "https://i.pinimg.com/1200x/ba/d6/d8/bad6d85eb2ee5bdf24f3dead62767225.jpg",
        "https://res.cloudinary.com/ddluoarzr/image/upload/f_auto,q_auto/v1784856533/c1e3097c27038e2dffbe9f518e227289_fy23o6.jpg"
      ]
    }
  ];

  const displayLooks = looks.length > 0 ? looks : defaultLooks;

  if (loading) return null;

  return (
    <section className="lookbook-section">
      <div className="container lookbook-container">
        {/* Section Top Header matching reference screenshot */}
        <div className="lookbook-header">
          <div className="lookbook-header-left">
            <span className="lookbook-section-label">FEATURED COLLECTION</span>
            <h2 className="lookbook-section-title">CURATED FOR YOU</h2>
          </div>
          <div className="lookbook-header-arrows">
            <button className="arrow-btn prev" aria-label="Previous Lookbook">
              <HiArrowLeft size={16} />
            </button>
            <button className="arrow-btn next active" aria-label="Next Lookbook">
              <HiArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Divider Line */}
        <div className="lookbook-header-line"></div>

        {/* Cards Grid */}
        <div className="lookbook-grid">
          {displayLooks.map((item, index) => (
            <LookbookCard key={item._id || item.category || index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Lookbook;