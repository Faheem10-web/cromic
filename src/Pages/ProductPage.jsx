import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, ChevronDown } from "lucide-react";
import API from "../services/api";
import "./ProductPage.css";
import { useSiteSettings } from "../context/SiteSettingsContext";

function ProductPage() {
  const { id } = useParams();

  const [productData, setProductData] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { settings } = useSiteSettings();

  // Track viewport for mobile bar
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch product data with AbortController cancellation
  useEffect(() => {
    const controller = new AbortController();
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/products/${id}`, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setProductData(res.data);
          const keys = Object.keys(res.data.variants || {});
          if (keys.length > 0) setSelectedColor(keys[0]);
          setSelectedImage(0);
          setError(null);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Failed to load product:", err);
          setError("Failed to load product.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchProduct();
    return () => controller.abort();
  }, [id]);

  // Drawer ESC key + scroll lock
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { setActiveDrawer(null); setOpenAccordion(null); } };
    if (activeDrawer) {
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeDrawer]);

  const productVariants = productData?.variants || {};
  const product = productVariants[selectedColor] || Object.values(productVariants)[0];

  const handleMouseMove = (e) => {
    const img = e.currentTarget.querySelector("img");
    if (!img) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
  };

  const handleMouseLeave = (e) => {
    const img = e.currentTarget.querySelector("img");
    if (img) img.style.transformOrigin = "center center";
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddToCart = () => {
    if (addingToCart) return;
    setAddingToCart(true);
    setTimeout(() => {
      setAddingToCart(false);
      try {
        const cartData = localStorage.getItem("cart");
        let cart = cartData ? JSON.parse(cartData) : [];
        const existingIndex = cart.findIndex(
          (item) => item.id === productData.id && item.color === product.color
        );
        if (existingIndex > -1) {
          cart[existingIndex].quantity += quantity;
        } else {
          cart.push({
            id: productData.id,
            name: productData.name,
            price: productData.price,
            image: product.images[0],
            color: product.color,
            quantity,
          });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cart-updated"));
      } catch (err) {
        console.error(err);
      }
      triggerToast(`Added ${quantity} × ${productData?.name} to your bag`);
    }, 900);
  };

  const renderDrawerContent = () => {
    switch (activeDrawer) {
      case "details":
        return (
          <div className="pp-drawer-content">
            <h2>Product Details</h2>
            <p>{product.details || "Meticulously designed with classic elements and finished with ultra-refined details."}</p>
            <div className="pp-specs">
              {[
                ["SKU", productData?.sku || `SKU-${productData?.id?.slice(-6)?.toUpperCase()}`],
                ["Frame Material", productData?.frame_material || settings?.frame_material || "Premium Cellulose Acetate"],
                ["Lens Technology", productData?.lens_technology || settings?.lens_technology || "100% UVA/UVB Protection"],
                ["Frame Color", product?.color],
                ["Dimensions", product?.size || "Lens 52mm · Bridge 20mm · Temple 145mm"],
                ["Warranty", productData?.warranty || settings?.warranty || "2-Year International Warranty"],
                ["Origin", productData?.origin || settings?.origin || "Handcrafted in Italy"],
                ["Includes", productData?.includes || settings?.includes || "Premium leather case, microfiber cloth"],
              ].map(([label, value]) => (
                <div className="pp-spec-row" key={label}>
                  <span className="pp-spec-label">{label}</span>
                  <span className="pp-spec-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case "shipping":
        return (
          <div className="pp-drawer-content">
            <h2>Delivery &amp; Returns</h2>
            {product?.shipping ? (
              <div className="pp-info-block">
                <p style={{ whiteSpace: "pre-line" }}>{product.shipping}</p>
              </div>
            ) : (
              <>
                <div className="pp-info-block">
                  <h3>{settings?.shipping_standard_title || "Complimentary Delivery"}</h3>
                  <p>{settings?.shipping_standard_desc || "Free standard shipping on all orders, securely packaged in our signature luxury box."}</p>
                </div>
                <div className="pp-info-block">
                  <h3>{settings?.shipping_express_title || "Shipping Options"}</h3>
                  <p style={{ whiteSpace: "pre-line" }}>
                    {settings?.shipping_express_desc || "Standard (3-5 business days) — Complimentary\nExpress (1-2 business days) — $15.00"}
                  </p>
                </div>
                <div className="pp-info-block">
                  <h3>{settings?.returns_title || "Returns"}</h3>
                  <p>{settings?.returns_desc || "Returns accepted within 30 days in original packaging with security seals intact."}</p>
                </div>
              </>
            )}
          </div>
        );
      case "appointment":
        return (
          <div className="pp-drawer-content">
            {productData?.appointment_info ? (
              <>
                <h2>Book an Appointment</h2>
                <div className="pp-info-block">
                  <p style={{ whiteSpace: "pre-line" }}>{productData.appointment_info}</p>
                </div>
              </>
            ) : (
              <>
                <h2>{settings?.appointment_title || "Book an Appointment"}</h2>
                <p>{settings?.appointment_desc || "Experience our signature in-store styling service with a dedicated client advisor."}</p>
                <div className="pp-info-block">
                  <h3>How to Book</h3>
                  <p style={{ whiteSpace: "pre-line" }}>
                    {settings?.appointment_how || "Call us at +1 (800) 555-CROMIC Monday–Saturday: 9AM–6PM EST, or email concierge@concierge.com"}
                  </p>
                </div>
              </>
            )}
          </div>
        );
      case "contact":
        return (
          <div className="pp-drawer-content">
            <h2>Contact Us</h2>
            {productData?.contact_info ? (
              <div className="pp-info-block">
                <p style={{ whiteSpace: "pre-line" }}>{productData.contact_info}</p>
              </div>
            ) : (
              <>
                <div className="pp-contact-item">
                  <strong>Client Advisor Helpline</strong>
                  <span>{settings?.contact_phone || "+1 (800) 555-CROMIC"}</span>
                  <span className="pp-caption">{settings?.contact_hours || "Monday – Saturday: 9:00 AM – 6:00 PM EST"}</span>
                </div>
                <div className="pp-contact-item">
                  <strong>Email Support</strong>
                  <span>{settings?.contact_email || "concierge@cromic.com"}</span>
                  <span className="pp-caption">{settings?.contact_response || "We respond within 24 hours."}</span>
                </div>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="pp-outer" style={{ minHeight: "80vh" }}>
        <div className="pp-layout" style={{ opacity: 0.15 }}>
          <section className="pp-gallery" style={{ minHeight: "500px", backgroundColor: "var(--hover, #111)", borderRadius: "8px" }}></section>
          <aside className="pp-info-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ height: "40px", width: "70%", backgroundColor: "var(--hover, #111)", borderRadius: "4px" }}></div>
            <div style={{ height: "24px", width: "40%", backgroundColor: "var(--hover, #111)", borderRadius: "4px" }}></div>
            <div style={{ height: "50px", width: "100%", backgroundColor: "var(--hover, #111)", borderRadius: "4px" }}></div>
          </aside>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pp-error">
        <p>{error || "Product not found"}</p>
        <Link to="/shop">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="pp-outer">
      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="pp-toast"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="pp-breadcrumbs" aria-label="Breadcrumb navigation">
        <Link to="/">Home</Link>
        <span className="pp-breadcrumb-separator">|</span>
        <Link to="/shop">
          Glasses
        </Link>
        <span className="pp-breadcrumb-separator">|</span>
        <span className="pp-breadcrumb-current">{productData.name}</span>
      </nav>

      <div className="pp-layout">
        {/* LEFT: COMPACT GALLERY — MAIN IMAGE + THUMBNAIL STRIP */}
        <section className="pp-gallery">
          {/* Thumbnail strip — vertical on desktop */}
          <div className="pp-gallery-body">
            <div className="pp-thumbs">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`pp-thumb-btn ${selectedImage === idx ? "active" : ""}`}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`View ${productData.name} image ${idx + 1}`}
                >
                  <img src={img} alt={`${productData.name} thumbnail ${idx + 1}`} loading="lazy" />
                </button>
              ))}
            </div>

            {/* Main image / Mobile Swipeable Touch Slider */}
            <div
              className="pp-gallery-main"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={`${selectedColor}-${selectedImage}`}
                  src={product.images[selectedImage]}
                  alt={`${productData.name} view ${selectedImage + 1}`}
                  className="pp-main-img"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset }) => {
                    const swipe = offset.x;
                    if (swipe < -50 && selectedImage < product.images.length - 1) {
                      setSelectedImage(selectedImage + 1);
                    } else if (swipe > 50 && selectedImage > 0) {
                      setSelectedImage(selectedImage - 1);
                    }
                  }}
                  loading="eager"
                />
              </AnimatePresence>

              {/* Mobile Slider Pagination Dots */}
              {product.images.length > 1 && (
                <div className="pp-slider-dots">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`pp-dot ${selectedImage === idx ? "active" : ""}`}
                      onClick={() => setSelectedImage(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Image counter badge */}
              <span className="pp-img-counter">{selectedImage + 1} / {product.images.length}</span>
            </div>
          </div>
        </section>

        {/* RIGHT: STICKY PRODUCT INFO PANEL */}
        <aside className="pp-info-panel">
          <div className="pp-info-inner">

            {/* Title + Heart */}
            <div className="pp-header-row">
              <div className="pp-header-text">
                <h1 className="pp-title">{productData.name}</h1>
                <p className="pp-subtitle">{product.description || productData.short_description || "Premium Eyewear Frame"}</p>
              </div>
              <button
                type="button"
                className={`pp-wishlist-btn ${isWishlisted ? "active" : ""}`}
                onClick={() => {
                  setIsWishlisted(!isWishlisted);
                  triggerToast(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
                }}
                aria-label="Toggle wishlist"
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} />
              </button>
            </div>

            {/* Price */}
            <div className="pp-price">{product.price}</div>

            {/* Colour Row */}
            <div className="pp-colour-row">
              <span className="pp-colour-label">Colour</span>
              <span className="pp-colour-value">{product.color}</span>
            </div>

            {/* Color Swatches — show even if single variant */}
            {Object.keys(productVariants).length >= 1 && (
              <div className="pp-swatches">
                {Object.entries(productVariants).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    className={`pp-swatch ${selectedColor === key ? "active" : ""}`}
                    onClick={() => { setSelectedColor(key); setSelectedImage(0); }}
                    title={item.color}
                  >
                    <img src={item.thumb || item.images[0]} alt={item.color} />
                  </button>
                ))}
              </div>
            )}

            {/* ADD TO BAG */}
            <button
              type="button"
              className={`pp-add-btn ${addingToCart ? "loading" : ""}`}
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? "ADDING TO BAG..." : "ADD TO BAG"}
            </button>

            {/* Delivery Row */}
            <div className="pp-delivery-row">
              <span className="pp-delivery-text">Delivery estimated in 1-4 business days</span>
              <button type="button" className="pp-find-store-btn" onClick={() => setActiveDrawer("store")}>
                Find In Store
              </button>
            </div>

            {/* Accordion */}
            <div className="pp-accordion">
              {[
                { key: "details", label: "Product Details" },
                { key: "shipping", label: "Delivery & Returns" },
                { key: "appointment", label: "Book An Appointment" },
                { key: "contact", label: "Contact Us" },
              ].map(({ key, label }) => (
                <div className="pp-accordion-item" key={key}>
                  <button
                    type="button"
                    className="pp-accordion-trigger"
                    onClick={() => {
                      if (openAccordion === key) {
                        setOpenAccordion(null);
                        setActiveDrawer(null);
                      } else {
                        setOpenAccordion(key);
                        setActiveDrawer(key);
                      }
                    }}
                  >
                    <span>{label}</span>
                    <ChevronDown
                      size={15}
                      className={`pp-chevron ${openAccordion === key ? "open" : ""}`}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
              ))}
            </div>

          </div>
        </aside>
      </div>

      {/* MOBILE STICKY BUY BAR */}
      {isMobile && (
        <div className="pp-mobile-bar">
          <div className="pp-mobile-bar-info">
            <span className="pp-mobile-bar-name">{productData.name}</span>
            <span className="pp-mobile-bar-price">{product.price}</span>
          </div>
          <button
            type="button"
            className="pp-mobile-bar-btn"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? "ADDING..." : "ADD TO BAG"}
          </button>
        </div>
      )}

      {/* DRAWER OVERLAY */}
      <AnimatePresence>
        {activeDrawer && activeDrawer !== "store" && (
          <>
            <motion.div
              className="pp-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => { setActiveDrawer(null); setOpenAccordion(null); }}
            />
            <motion.div
              className={`pp-drawer ${isMobile ? "bottom" : "side"}`}
              initial={isMobile ? { y: "100%" } : { x: "100%" }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: "100%" } : { x: "100%" }}
              transition={{ type: "tween", ease: [0.25, 0.46, 0.45, 0.94], duration: 0.32 }}
            >
              {isMobile && (
                <div
                  className="pp-drawer-handle"
                  onClick={() => { setActiveDrawer(null); setOpenAccordion(null); }}
                />
              )}
              <button
                type="button"
                className="pp-drawer-close"
                onClick={() => { setActiveDrawer(null); setOpenAccordion(null); }}
                aria-label="Close"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
              <div className="pp-drawer-scroll">
                {renderDrawerContent()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductPage;
