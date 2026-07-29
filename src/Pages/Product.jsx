import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Product.css";
import { useSiteSettings } from "../context/SiteSettingsContext";

function Product() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("All");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { settings } = useSiteSettings();

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          API.get("/products", { params: { limit: 100 }, signal: controller.signal }),
          API.get("/categories", { params: { status: "active" }, signal: controller.signal })
        ]);
        
        if (!controller.signal.aborted) {
          const catData = Array.isArray(catRes.data) ? catRes.data : [];
          const activeCategories = catData.map((c) => c.name);
          
          setCategories(activeCategories.length > 0 ? activeCategories : ["Square", "Luxury", "Classic", "Titanium", "Heritage", "Avant"]);
          
          const fetchedProds = Array.isArray(prodRes.data) ? prodRes.data : [];
          setProducts(fetchedProds);
          setError(null);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Failed to fetch shop data:", err);
          setProducts([]);
          setCategories(["Square", "Luxury", "Classic", "Titanium", "Heritage", "Avant"]);
          setError("Failed to load products from server.");
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

  const filterOptions = ["All", "Square", "Luxury", "Classic"];

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
    <section className="gallery gtop">
      <div className="container">

        {/* FILTER */}
        <div className="gallery-top">
          {/* Desktop Filter Tabs */}
          <div className="gallery-filter desktop-only-filters">
            {filterOptions.map((cat) => (
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
                {filterOptions.map((cat) => (
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
        </div>

        {/* PRODUCTS */}

        {loading ? (
          <div className="gallery-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="gallery-card skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-info-block">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-price"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="gallery-error" style={{ padding: "8rem 0", textAlign: "center", color: "#ff4a4a", fontSize: "0.8rem" }}>{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="gallery-empty" style={{ padding: "8rem 0", textAlign: "center", opacity: 0.5, fontSize: "0.8rem" }}>NO PRODUCTS FOUND</div>
        ) : (
          <div className="gallery-grid">
            {filteredProducts.map((item) => (
              <Link
                to={`/product/${item.id}`}
                className={`gallery-card ${settings?.enable_image_hover === false ? "hover-disabled" : ""}`}
                key={item.id}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <article>
                  <div className="gallery-image">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="primary-image"
                      draggable="false"
                    />
                    {item.secondaryImage && (
                      <img
                        src={item.secondaryImage}
                        alt={`${item.name} alternate`}
                        className="secondary-image"
                        draggable="false"
                      />
                    )}
                  </div>

                  <div className="gallery-info">
                    <h4>{item.name}</h4>
                    <span>{item.price}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

export default Product;
