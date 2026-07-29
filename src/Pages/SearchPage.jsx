import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../services/api";
import "./Product.css";
import "./SearchPage.css";

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const limit = 8;

  useEffect(() => {
    const controller = new AbortController();
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await API.get("/products/search", {
          params: { q: query, page: pageParam, limit },
          signal: controller.signal
        });
        if (!controller.signal.aborted) {
          setProducts(res.data.products || []);
          setTotal(res.data.total || 0);
          setError(null);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Search page fetch failed:", err);
          setError("Unable to retrieve search results. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSearchResults();
    return () => controller.abort();
  }, [query, pageParam]);

  const handlePageChange = (newPage) => {
    setSearchParams({ q: query, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <section className="gallery gtop">
      <div className="container">
        
        {/* Search Header Info */}
        <div className="gallery-top search-page-header">
          <div className="search-header-info">
            <h2>SEARCH RESULTS</h2>
            <p>
              Showing {products.length} of {total} results for "<strong>{query}</strong>"
            </p>
          </div>
        </div>

        {/* Results grid */}
        {loading ? (
          <div className="gallery-grid">
            {[1, 2, 3, 4].map((n) => (
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
          <div className="search-error">{error}</div>
        ) : products.length === 0 ? (
          <div className="search-page-empty">
            <h3>NO PRODUCTS FOUND</h3>
            <p>We couldn't find any products matching your search query. Try checking for typos or search for one of our categories:</p>
            <div className="suggested-pills">
              {["Square", "Luxury", "Classic", "Titanium"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSearchParams({ q: s, page: "1" })}
                  className="suggestion-pill-btn"
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="gallery-grid">
              {products.map((item) => (
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
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="search-pagination">
                <button
                  disabled={pageParam === 1}
                  onClick={() => handlePageChange(pageParam - 1)}
                  className="pagination-btn"
                >
                  PREV
                </button>
                <span className="pagination-info">
                  PAGE {pageParam} OF {totalPages}
                </span>
                <button
                  disabled={pageParam === totalPages}
                  onClick={() => handlePageChange(pageParam + 1)}
                  className="pagination-btn"
                >
                  NEXT
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default SearchPage;
