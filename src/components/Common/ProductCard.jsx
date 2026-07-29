import React from "react";
import { Link } from "react-router-dom";

function ProductCard({ product, disableHover }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className={`product-card ${disableHover ? "hover-disabled" : ""}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <div className="product-image">
        <img
          src={product.image}
          alt={product.name}
          className="primary-image"
          draggable="false"
          loading="lazy"
        />
        {product.secondaryImage && (
          <img
            src={product.secondaryImage}
            alt={`${product.name} alternate`}
            className="secondary-image"
            draggable="false"
            loading="lazy"
          />
        )}
      </div>

      <div className="product-info">
        <h4>{product.name}</h4>
        <span>{product.price}</span>
      </div>
    </Link>
  );
}

export default ProductCard;
