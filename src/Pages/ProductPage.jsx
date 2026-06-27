import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { products } from "../data/products";
import "./ProductPage.css";

function ProductPage() {
  const { id } = useParams();

  // Find product by id (defaulting to the first product to avoid blank/broken page)
  const productData = products.find((p) => String(p.id) === id) || products[0];

  const productVariants = productData.variants;
  const variantKeys = Object.keys(productVariants);

  const [selectedColor, setSelectedColor] = useState(variantKeys[0]);
  const [openSection, setOpenSection] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryRef = useRef(null);

  // Reset selectedColor when route id changes
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setSelectedColor(variantKeys[0]);
  }

  const product = productVariants[selectedColor] || Object.values(productVariants)[0];

  useEffect(() => {
    if (galleryRef.current) {
      galleryRef.current.scrollLeft = 0;
      setActiveIndex(0);
    }
  }, [selectedColor]);

  const handleScroll = () => {
    if (galleryRef.current) {
      const { scrollLeft, clientWidth } = galleryRef.current;
      if (clientWidth > 0) {
        const index = Math.round(scrollLeft / clientWidth);
        if (index !== activeIndex && index >= 0 && index < product.images.length) {
          setActiveIndex(index);
        }
      }
    }
  };

  const scrollToSlide = (index) => {
    if (galleryRef.current) {
      const width = galleryRef.current.clientWidth;
      galleryRef.current.scrollTo({
        left: index * width,
        behavior: "smooth"
      });
      setActiveIndex(index);
    }
  };

  const nextSlide = () => {
    const nextIdx = (activeIndex + 1) % product.images.length;
    scrollToSlide(nextIdx);
  };

  const prevSlide = () => {
    const prevIdx = (activeIndex - 1 + product.images.length) % product.images.length;
    scrollToSlide(prevIdx);
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  // --- PREMIUM ZOOM EVENT HANDLERS ---
  const handleMouseMove = (e) => {
    const container = e.currentTarget;
    const img = container.querySelector("img");
    if (!img) return;

    const { left, top, width, height } = container.getBoundingClientRect();
    // മൗസ് കോർഡിനേറ്റ്സ് പെർസെന്റേജിലേക്ക് മാറ്റുന്നു
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    // വീഡിയോയിലെ പോലെ കൃത്യമായി ആ പോയിന്റിലേക്ക് transform-origin സെറ്റ് ചെയ്യുന്നു
    img.style.transformOrigin = `${x}% ${y}%`;
  };

  const handleMouseLeave = (e) => {
    const img = e.currentTarget.querySelector("img");
    if (img) {
      // മൗസ് പുറത്തേക്ക് പോകുമ്പോൾ പഴയ പടിയാക്കുന്നു
      img.style.transformOrigin = "center center";
    }
  };

  const priceStr = product.price || "";
  const currencySymbol = priceStr.match(/^[^0-9.]+/)?.[0] || "$";
  const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  let installmentAmount = "0.00";
  if (!isNaN(numericPrice)) {
    installmentAmount = (numericPrice / 4).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <main className="product-page">
      <section className="gallery">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedColor}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="gallery-scroll-container"
            ref={galleryRef}
            onScroll={handleScroll}
          >
            {product.images.map((img, index) => (
              <div 
                className="gallery-item" 
                key={index}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <img src={img} alt={`${product.name} view ${index + 1}`} />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="gallery-meta-ui">
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{
                width: `${((activeIndex + 1) / product.images.length) * 100}%`
              }}
            />
          </div>
          <span className="gallery-counter">
            {String(activeIndex + 1).padStart(2, "0")} / {String(product.images.length).padStart(2, "0")}
          </span>
        </div>

        {/* Thumbnail Gallery (Visible on Mobile only) */}
        <div className="thumbnail-gallery">
          <button type="button" className="thumb-arrow left-arrow" onClick={prevSlide}>&lt;</button>
          <div className="thumb-list">
            {product.images.map((img, index) => (
              <button
                key={index}
                type="button"
                className={`thumb-item ${activeIndex === index ? "active" : ""}`}
                onClick={() => scrollToSlide(index)}
              >
                <img src={img} alt="thumbnail" />
              </button>
            ))}
          </div>
          <button type="button" className="thumb-arrow right-arrow" onClick={nextSlide}>&gt;</button>
        </div>
      </section>

      <aside className="product-info">
        <div className="info-inner">
          <div className="title-row">
            <h1 className="brand-title">{product.name}</h1>
            <span className="variant-code">{product.code}</span>
          </div>
          <span className="product-subtitle">SIGNATURE COLLECTION</span>

          <div className="product-price-container">
            <span className="product-price">{product.price}</span>
            <span className="tax-info">Inclusive of all taxes</span>
            <div className="shop-pay-info">
              Pay in 4 interest-free installments of {currencySymbol}{installmentAmount} with <span className="shop-pay-logo">shop <span>Pay</span></span> <a href="#" className="learn-more-link" onClick={(e) => e.preventDefault()}>Learn more</a>
            </div>
          </div>

          <div className="color-selector">
            {Object.entries(productVariants).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={`color-thumb ${selectedColor === key ? "active" : ""}`}
                onClick={() => setSelectedColor(key)}
              >
                <img src={item.thumb} alt={item.color} />
              </button>
            ))}
          </div>

          <button type="button" className="add-to-cart-btn">ADD TO CART</button>
          <button type="button" className="add-to-wishlist-btn">
            <span className="heart-icon">♡</span> ADD TO WISHLIST
          </button>

          <p className="editorial-description">
            {product.description}
          </p>

          <div className="accordion-group">
            {/* PRODUCT DETAILS */}
            <div className="accordion-row-item">
              <button type="button" className="accordion-trigger-btn" onClick={() => toggleSection("details")}>
                <span>PRODUCT DETAILS</span>
                <span className="status-icon">{openSection === "details" ? "−" : "+"}</span>
              </button>
              <AnimatePresence initial={false}>
                {openSection === "details" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="accordion-dropdown-overflow"
                  >
                    <div className="accordion-dropdown-body">
                      <p>{product.details}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SIZE & FIT */}
            <div className="accordion-row-item">
              <button type="button" className="accordion-trigger-btn" onClick={() => toggleSection("size")}>
                <span>SIZE & FIT</span>
                <span className="status-icon">{openSection === "size" ? "−" : "+"}</span>
              </button>
              <AnimatePresence initial={false}>
                {openSection === "size" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="accordion-dropdown-overflow"
                  >
                    <div className="accordion-dropdown-body">
                      <p>{product.size}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* COLOR/VARIANT */}
            <div className="accordion-row-item">
              <button type="button" className="accordion-trigger-btn" onClick={() => toggleSection("variant")}>
                <div className="inline-label-dots">
                  <span>COLOR/VARIANT</span>
                  <span className="color-dot pink"></span>
                </div>
                <div className="right-dots-container">
                  <span className="mini-dot orange"></span>
                  <span className="mini-dot sage"></span>
                  <span className="mini-dot blue"></span>
                </div>
              </button>
              <AnimatePresence initial={false}>
                {openSection === "variant" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="accordion-dropdown-overflow"
                  >
                    <div className="accordion-dropdown-body">
                      <p>Selected aesthetic tint: <strong>{product.color}</strong></p>
                      
                      {/* Color Selector Inside Accordion (Visible on Mobile only) */}
                      <div className="color-selector-accordion">
                        {Object.entries(productVariants).map(([key, item]) => (
                          <button
                            key={key}
                            type="button"
                            className={`color-thumb ${selectedColor === key ? "active" : ""}`}
                            onClick={() => setSelectedColor(key)}
                          >
                            <img src={item.thumb} alt={item.color} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SHIPPING & RETURNS */}
            <div className="accordion-row-item">
              <button type="button" className="accordion-trigger-btn" onClick={() => toggleSection("shipping")}>
                <span>SHIPPING & RETURNS</span>
                <span className="status-icon">{openSection === "shipping" ? "−" : "+"}</span>
              </button>
              <AnimatePresence initial={false}>
                {openSection === "shipping" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="accordion-dropdown-overflow"
                  >
                    <div className="accordion-dropdown-body">
                      <p>{product.shipping}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="share-row">
            <button type="button" className="share-btn">Share</button>
          </div>
        </div>
      </aside>
    </main>
  );
}

export default ProductPage;
