import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ProductCatalog.css";

import { products as allProducts } from "../../data/products";

const catalogProductIds = ["1", "2", "3", "4", "9", "10", "11", "12"];
const products = catalogProductIds.map((id) => allProducts.find((p) => p.id === id)).filter(Boolean);

function ProductCatalog() {
  const [filter, setFilter] = useState("All");
  const [favorites, setFavorites] = useState({});

  const sliderRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const filteredProducts =
    filter === "All"
      ? products
      : products.filter((item) => item.category === filter);

  const toggleFavorite = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMouseDown = (e) => {
    if (!sliderRef.current || window.innerWidth <= 425) return;
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
    if (!isDown.current || !sliderRef.current || window.innerWidth <= 425) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.8;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <section className="catalog">
      <div className="container">
        
        {/* Top Header Navigation */}
        <div className="catalog-top">
          <div className="catalog-filters">
            {["All", "Square", "Luxury", "Classic"].map((cat) => (
              <button
                key={cat}
                className={filter === cat ? "active" : ""}
                onClick={() => setFilter(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

         <Link to="/shop" className="shop-link">
  SHOP THE COLLECTION
</Link>
        </div>

        {/* Dynamic Product Layout (Slider on Desktop/Tablet, Grid on Mobile) */}
        <div className="slider-wrapper">
          <div
            ref={sliderRef}
            className="products-slider"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {filteredProducts.map((item) => (
              <Link
                to={`/product/${item.id}`}
                className="product-card"
                key={item.id}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <div className="product-image">
                  <img src={item.image} alt={item.name} className="primary-image" draggable="false" />
                  {item.secondaryImage && (
                    <img src={item.secondaryImage} alt={`${item.name} alternate`} className="secondary-image" draggable="false" />
                  )}
                </div>

                <div className="product-info">
                  <h4>{item.name}</h4>
                  <span>{item.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default ProductCatalog;