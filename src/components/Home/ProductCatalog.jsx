import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import "./ProductCatalog.css";
import ProductCard from "../Common/ProductCard";
import { useSiteSettings } from "../../context/SiteSettingsContext";

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);
  const { settings } = useSiteSettings();

  const availableCategories = ["All", "Square", "Luxury", "Classic"];

  const sliderRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const prodRes = await API.get("/products", { 
          params: { limit: 50 },
          signal: controller.signal
        });

        if (!controller.signal.aborted) {
          const data = Array.isArray(prodRes.data) ? prodRes.data : [];
          setProducts(data);
          setError(null);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("API failed to load products:", err.message);
          setProducts([]);
          setError("Failed to load products from server.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchCatalog();
    return () => controller.abort();
  }, []);

  const getProductCategory = (item) => {
    if (typeof item.category === "string" && item.category.trim()) return item.category.trim();
    if (item.category && typeof item.category === "object" && item.category.name) return item.category.name.trim();
    if (item.category_id && typeof item.category_id === "object" && item.category_id.name) return item.category_id.name.trim();
    if (typeof item.tags === "string" && item.tags.trim()) return item.tags.trim();
    return "Classic";
  };

  const filteredProducts =
    filter === "All"
      ? products
      : products.filter((item) => {
          const itemCat = getProductCategory(item).toLowerCase();
          const itemTags = (typeof item.tags === "string" ? item.tags : "").toLowerCase();
          const targetFilter = filter.toLowerCase();
          return itemCat.includes(targetFilter) || targetFilter.includes(itemCat) || itemTags.includes(targetFilter);
        });

  const displayedProducts =
    isMobile && filter === "All"
      ? filteredProducts.slice(0, 4)
      : filteredProducts;

  const handleMouseDown = (e) => {
    if (!sliderRef.current || window.innerWidth <= 535) return;
    isDown.current = true;
    sliderRef.current.classList.add("dragging");
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    if (sliderRef.current) sliderRef.current.classList.remove("dragging");
  };

  const handleMouseUp = () => {
    isDown.current = false;
    if (sliderRef.current) sliderRef.current.classList.remove("dragging");
  };

  const handleMouseMove = (e) => {
    if (!isDown.current || !sliderRef.current || window.innerWidth <= 535) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.8;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const mobileFilterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileFilterRef.current && !mobileFilterRef.current.contains(e.target)) {
        setIsMobileFilterOpen(false);
      }
    };
    if (isMobileFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileFilterOpen]);

  return (
    <section className="catalog">
      <div className="container">
        
        {/* Top Header Navigation */}
        <div className="catalog-top">
          {/* Desktop Filter Tabs */}
          <div className="catalog-filters desktop-only-filters">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                className={filter === cat ? "active" : ""}
                onClick={() => setFilter(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Mobile Filter Toggle Button & Dropdown */}
          <div className="mobile-filter-toggle-container" ref={mobileFilterRef}>
            <button 
              type="button"
              className={`mobile-filter-btn ${isMobileFilterOpen ? "open" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileFilterOpen((prev) => !prev);
              }}
            >
              <span>FILTER: <strong>{filter.toUpperCase()}</strong></span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="filter-chevron">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isMobileFilterOpen && (
              <div className="mobile-filter-dropdown">
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`mobile-filter-option ${filter === cat ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilter(cat);
                      setIsMobileFilterOpen(false);
                    }}
                  >
                    <span>{cat.toUpperCase()}</span>
                    {filter === cat && <span className="check-mark">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/shop" className="shop-link">
            SHOP THE COLLECTION
          </Link>
        </div>

        {/* Dynamic Product Layout (Slider on Desktop/Tablet, Grid on Mobile) */}
        <div className="slider-wrapper">
          {loading ? (
            null
          ) : error ? (
            <div className="catalog-error" style={{ padding: "6rem 0", textAlign: "center", color: "#ff4a4a", fontSize: "0.8rem", letterSpacing: "1px" }}>{error}</div>
          ) : displayedProducts.length === 0 ? (
            <div className="catalog-empty" style={{ padding: "6rem 0", textAlign: "center", opacity: 0.5, fontSize: "0.8rem", letterSpacing: "1px" }}>NO PRODUCTS FOUND</div>
          ) : (
            <div
              ref={sliderRef}
              className="products-slider"
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              {displayedProducts.map((item) => (
                <ProductCard key={item.id} product={item} disableHover={settings?.enable_image_hover === false} />
              ))}
            </div>
          )}
        </div>

        <div className="mobile-shop-link-wrapper">
          <Link to="/shop" className="shop-link mobile-only-shop-link">
            SHOP THE COLLECTION
          </Link>
        </div>

      </div>
    </section>
  );
}

export default ProductCatalog;