import { useState } from "react";
import { Link } from "react-router-dom";
import { products } from "../data/products";
import "./Product.css";

function Product() {
  const [filter, setFilter] = useState("All");

  const filteredProducts =
    filter === "All"
      ? products
      : products.filter(
          (item) => item.category === filter
        );

  return (
    <section className="gallery">
      <div className="container">

        {/* FILTER */}

        <div className="gallery-top">

          <div className="gallery-filter">
            {[
              "All",
              "Square",
              "Luxury",
              "Classic",
            ].map((cat) => (
              <button
                key={cat}
                className={
                  filter === cat
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter(cat)
                }
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

        </div>

        {/* PRODUCTS */}

        <div className="gallery-grid">

          {filteredProducts.map(
            (item) => (
              <Link
                to={`/product/${item.id}`}
                className="gallery-card"
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
            )
          )}

        </div>

      </div>
    </section>
  );
}

export default Product;
