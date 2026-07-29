import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./CategoryShowcase.css";

function CardWrapper({ item, index, total }) {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  
  // Track scroll progression specifically for each card viewport area
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Replicating cinematic scaling down and slight dimming of the active card as the next one stacks over it
  const cardScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const cardOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.6]);
  
  // Replicating inner parallax zoom & motion for images and content layers as seen frame-by-frame
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0px", "-40px"]);

  return (
    <div ref={containerRef} className="editorial-card-track">
      <motion.div
        className={`editorial-card ${index % 2 === 1 ? "reverse-layout" : ""}`}
        onClick={() => navigate("/shop")}
        style={{
          scale: index === total - 1 ? 1 : cardScale,
          opacity: index === total - 1 ? 1 : cardOpacity,
          zIndex: index + 1,
          cursor: "pointer",
        }}
      >
        <div className="editorial-left container">
          <motion.div style={{ y: textY }} className="content-inner-wrapper">
            <span className="brand-label">COLLECTION</span>
            <p className="brand-subtitle">{item.subtitle}</p>
            <div className="divider"></div>

            <div className="editorial-heading">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              >
                {item.title}
              </motion.h2>
              <span className="collection-number">{item.id}</span>
            </div>

            <p className="editorial-desc">{item.desc}</p>

            <div className="editorial-bottom">
              <div className="thumb-box">
                <img src={item.thumb} alt={item.title} loading="lazy" />
              </div>
              <Link
                to="/shop"
                className="explore-cta"
                onClick={(e) => e.stopPropagation()}
              >
                Explore Collection →
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="editorial-right">
          <motion.div className="image-overflow-container" style={{ y: imgY }}>
            <motion.img
              src={item.image}
              alt={item.title}
              loading="lazy"
              initial={{ scale: 1.04 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function CategoryShowcase() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileSlideIndex, setMobileSlideIndex] = useState(0);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40 && mobileSlideIndex < categories.length - 1) {
      setMobileSlideIndex((prev) => prev + 1);
    } else if (distance < -40 && mobileSlideIndex > 0) {
      setMobileSlideIndex((prev) => prev - 1);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await API.get("/categories", { 
          params: { status: "active" },
          signal: controller.signal
        });
        
        if (!controller.signal.aborted) {
          const allCats = Array.isArray(res.data) ? res.data : [];
          
          const defaultShowcaseMap = {
            avant: {
              title: "AVANT",
              subtitle: "Future Expression",
              desc: "Bold contemporary designs embracing innovation",
              image: "https://i.pinimg.com/1200x/c7/fd/85/c7fd8584952f24e8e93b3ac61ff32de0.jpg",
            },
            heritage: {
              title: "HERITAGE",
              subtitle: "Timeless Design",
              desc: "Iconic eyewear refined with modern craft",
              image: "https://i.pinimg.com/1200x/0b/35/65/0b35653ee75d43b2e7506fddfcb8d6e7.jpg",
            },
            titanium: {
              title: "TITANIUM",
              subtitle: "Precision Crafted",
              desc: "Ultra-light titanium frames engineered for luxury",
              image: "https://x8.adencys.com/img/products/ANIMA-X1-001/1.1.jpg",
            },
          };

          const targetSlugs = ["avant", "heritage", "titanium"];
          const cards = targetSlugs.map((slugKey, i) => {
            const foundCat = allCats.find((c) => c.slug.toLowerCase() === slugKey || c.name.toLowerCase() === slugKey);
            const def = defaultShowcaseMap[slugKey];
            return {
              id: `0${i + 1}`,
              title: (foundCat?.name || def.title).toUpperCase(),
              subtitle: def.subtitle,
              desc: foundCat?.description || def.desc,
              image: foundCat?.image || def.image,
              thumb: foundCat?.image || def.image,
            };
          });

          setCategories(cards);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Failed to fetch showcase categories:", err);
          setCategories([
            {
              id: "01",
              title: "AVANT",
              subtitle: "Future Expression",
              desc: "Bold contemporary designs embracing innovation",
              image: "https://i.pinimg.com/1200x/c7/fd/85/c7fd8584952f24e8e93b3ac61ff32de0.jpg",
              thumb: "https://i.pinimg.com/1200x/c7/fd/85/c7fd8584952f24e8e93b3ac61ff32de0.jpg",
            },
            {
              id: "02",
              title: "HERITAGE",
              subtitle: "Timeless Design",
              desc: "Iconic eyewear refined with modern craft",
              image: "https://i.pinimg.com/1200x/0b/35/65/0b35653ee75d43b2e7506fddfcb8d6e7.jpg",
              thumb: "https://i.pinimg.com/1200x/0b/35/65/0b35653ee75d43b2e7506fddfcb8d6e7.jpg",
            },
            {
              id: "03",
              title: "TITANIUM",
              subtitle: "Precision Crafted",
              desc: "Ultra-light titanium frames engineered for luxury",
              image: "https://x8.adencys.com/img/products/ANIMA-X1-001/1.1.jpg",
              thumb: "https://x8.adencys.com/img/products/ANIMA-X1-001/1.1.jpg",
            },
          ]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchCategories();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <section className="editorial-showcase">
        <div className="editorial-stack-container" style={{ padding: "4rem 0" }}>
          <div className="editorial-card-track" style={{ minHeight: "70vh", opacity: 0.1, backgroundColor: "var(--hover, #222)", borderRadius: "12px", margin: "2rem 0" }}></div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="editorial-showcase">
      {/* DESKTOP COLLECTIONS STACK */}
      <div className="editorial-stack-container">
        {categories.map((item, index) => (
          <CardWrapper 
            key={item.id} 
            item={item} 
            index={index} 
            total={categories.length} 
          />
        ))}
      </div>

      {/* MOBILE TOUCH SLIDER CAROUSEL (Active on screens <= 768px) */}
      <div className="editorial-mobile-slider-wrapper">
        {/* Top Header Label matching reference image */}
        <div className="mobile-section-header">
          <span className="section-badge">
            <span className="sparkle">✦</span> FEATURED COLLECTION
          </span>
          <div className="section-badge-underline"></div>
        </div>

        {/* Floating Rounded Card Frame */}
        <div className="editorial-mobile-card-container">
          <div 
            className="editorial-mobile-slider-track"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ transform: `translateX(-${mobileSlideIndex * 100}%)` }}
          >
            {categories.map((item) => (
              <div key={item.id} className="editorial-mobile-slide">
                {/* Background Media & Overlay */}
                <div className="editorial-mobile-bg">
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <div className="editorial-mobile-overlay"></div>
                </div>

                {/* Floating Collection Number on Right */}
                <div className="editorial-mobile-number">
                  <span>{item.id}</span>
                  <div className="number-vert-line"></div>
                </div>

                {/* Card Content Layout */}
                <div className="editorial-mobile-content">
                  <div className="editorial-mobile-middle">
                    <p className="brand-subtitle">{item.subtitle}</p>
                    <h1 className="editorial-main-title">{item.title}</h1>
                    <div className="title-underline"></div>
                    <p className="editorial-desc">{item.desc}</p>
                  </div>

                  <div className="editorial-mobile-bottom-bar">
                    <Link to="/shop" className="card-cta-button">
                      <span>SHOP NOW</span>
                      <span className="cta-arrow-icon">⟶</span>
                    </Link>

                    <div className="mobile-slider-controls">
                      <div className="mobile-slider-dots">
                        {categories.map((cat, idx) => (
                          <div key={cat.id} className="dot-wrapper">
                            <button
                              type="button"
                              className={`mobile-dot ${idx === mobileSlideIndex ? "active" : ""}`}
                              onClick={() => setMobileSlideIndex(idx)}
                              aria-label={`Go to slide ${cat.id}`}
                            >
                              <span>{cat.id}</span>
                            </button>
                            {idx < categories.length - 1 && <span className="dot-sep">|</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CategoryShowcase;