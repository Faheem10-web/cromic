import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { X } from "lucide-react";
import "./Header.css";
import "./MobileDrawer.css";
import "./DesktopOverlay.css";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import { useSiteSettings } from "../../context/SiteSettingsContext";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const getInitialCartCount = () => {
    try {
      const cartData = localStorage.getItem("cart");
      if (cartData) {
        const items = JSON.parse(cartData);
        return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      }
    } catch (e) {}
    return 0;
  };

  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(getInitialCartCount);
  const { settings } = useSiteSettings();
  const showThemeToggle = settings.show_navbar_theme_toggle !== false && 
                          settings.theme_mode !== "always-dark" && 
                          settings.theme_mode !== "always-light";

  const updateCartCount = () => {
    setCartCount(getInitialCartCount());
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);
    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  // Debounced live search with AbortController cancellation
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();

    const delayDebounceFn = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await API.get(`/products/search?q=${encodeURIComponent(searchQuery)}&limit=5`, {
          signal: controller.signal
        });
        if (!controller.signal.aborted) {
          setSearchResults(res.data.products || []);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Search failed:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
  }, [searchQuery]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    } else {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  // ESC key to close search
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setIsMenuOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={index} style={{ backgroundColor: "rgba(255, 255, 255, 0.25)", color: "#fff", padding: "0 2px", borderRadius: "2px" }}>
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const lastScrollY = useRef(0);
  const location = useLocation();
  const { theme } = useTheme();
  const overlayRef = useRef(null);

  const lastPath = useRef(location.pathname);
  if (location.pathname !== lastPath.current) {
    setIsMenuOpen(false);
    lastPath.current = location.pathname;
  }

  // Home page check
  const isHomePage = location.pathname === "/";

  // Determine if the navbar current background is dark
  const hasDarkNavbar =
    theme === "dark" ||
    settings.navbar_black_background !== false ||
    (isHomePage && !isScrolled);

  const logoSrc = hasDarkNavbar ? "/assets/cromic.png" : "/assets/logo.png";
  const overlayLogoSrc = "/assets/cromic.png";

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  /* =========================
     SCROLL
  ========================= */

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 50);

      // Keep the navbar visible at all times to prevent layout movement/shifting issues
      setIsHidden(false);

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  /* =========================
     BODY LOCK
  ========================= */

  useEffect(() => {
    document.body.style.overflow =
      isMenuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  /* =========================
     KEYBOARD NAVIGATION ACCESSIBILITY
  ========================= */

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  // Trap focus inside menu when open
  useEffect(() => {
    if (!isMenuOpen || !overlayRef.current) return;

    const focusableElements = overlayRef.current.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex="0"]'
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    const handleTabKey = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener("keydown", handleTabKey);
    return () => window.removeEventListener("keydown", handleTabKey);
  }, [isMenuOpen]);

  return (
    <>
      <header
        className={`
          header-main
          ${isScrolled ? "is-scrolled" : ""}
          ${isHidden ? "is-hidden" : ""}
          ${!isHomePage ? "inner-page" : ""}
          ${settings.navbar_black_background !== false ? "force-black-navbar" : ""}
        `}
        style={{ position: settings.navbar_sticky_mode === false ? "absolute" : "fixed" }}
      >
        <div className="header-container">

          {/* LOGO */}

          <Link
            to="/"
            className="header-logo"
          >
            <img
              src={logoSrc}
              alt="Cromic Eyewear"
            />
          </Link>

          {/* MENU */}

          <button
            className={`header-menu-toggle ${isMenuOpen ? "is-active" : ""
              }`}
            onClick={toggleMenu}
            aria-label="Toggle Menu"
            aria-expanded={isMenuOpen}
          >
            <span className="menu-bar"></span>
            <span className="menu-bar"></span>
            <span className="menu-bar"></span>
          </button>

          {/* ACTIONS */}

          <div className="header-actions">

            {/* SEARCH */}

            <button
              className="action-btn"
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
            >
              <svg
                className="action-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                />
                <line
                  x1="21"
                  y1="21"
                  x2="16.65"
                  y2="16.65"
                />
              </svg>
            </button>

            <span className="header-divider"></span>

            {/* CART */}

            <Link
              to="/cart"
              className="action-btn is-cart"
              aria-label="Cart"
            >
              <svg
                className="action-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line
                  x1="3"
                  y1="6"
                  x2="21"
                  y2="6"
                />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>

              <span className="cart-count">
                {cartCount}
              </span>
            </Link>

            {/* THEME TOGGLE */}
            {showThemeToggle && (
              <div className="header-toggle-container">
                <ThemeToggle />
              </div>
            )}

            {/* CTA */}
            <Link to="/login" className="header-cta-btn">
              LOGIN
            </Link>

          </div>
        </div>
      </header>

      {/* =========================
          FULLSCREEN MENU / DRAWER
      ========================= */}

      <div
        ref={overlayRef}
        className={`nav-overlay ${isMenuOpen ? "is-visible" : ""}`}
        onClick={() => setIsMenuOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Desktop Full-Screen Overlay Menu */}
        <div 
          className="desktop-overlay-container"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="desktop-menu-header">
            <Link to="/" className="desktop-menu-logo" onClick={() => setIsMenuOpen(false)}>
              <img src={overlayLogoSrc} alt="Cromic Eyewear" />
            </Link>
            
            <button
              className="desktop-menu-close"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close Menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="desktop-menu-right-actions">
              <button 
                className="desktop-menu-action-btn" 
                aria-label="Search"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSearchOpen(true);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <Link to="/cart" className="desktop-menu-action-btn" aria-label="Cart" onClick={() => setIsMenuOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span className="desktop-menu-cart-count">{cartCount}</span>
              </Link>
            </div>
          </div>

          <div className="desktop-menu-links">
            {["HOME", "SHOP", "ABOUT", "CONTACT", "LOGIN"].map((name, i) => {
              const linkPath =
                name === "LOGIN" ? "/login" :
                name === "SHOP" ? "/shop" :
                name === "ABOUT" ? "/about" :
                name === "CONTACT" ? "/contact" : "/";
              return (
                <Link 
                  key={name}
                  to={linkPath} 
                  className="desktop-menu-link-item"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ "--item-index": i }}
                >
                  {name}
                </Link>
              );
            })}
          </div>

          <div className="desktop-menu-footer">
            <p className="desktop-menu-footer-title">PREMIUM EYEWEAR</p>
            <p className="desktop-menu-footer-subtitle">Crafted For Modern Vision</p>
          </div>

          {showThemeToggle && (
            <div className="desktop-menu-theme-toggle">
              <ThemeToggle />
            </div>
          )}
        </div>

        {/* Mobile/Tablet Drawer Container */}
        <div 
          className="drawer-container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="drawer-header">
            <Link to="/" className="drawer-logo" onClick={() => setIsMenuOpen(false)}>
              <img src={logoSrc} alt="Cromic Eyewear" />
            </Link>
            <button
              className="drawer-close"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close Menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="drawer-divider"></div>

          {/* Quick Actions (Search & Cart) inside Drawer */}
          <div className="drawer-quick-actions">
            <button 
              className="drawer-quick-btn"
              onClick={() => {
                setIsMenuOpen(false);
                setIsSearchOpen(true);
              }}
              aria-label="Search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>SEARCH</span>
            </button>

            <span className="drawer-quick-sep"></span>

            <Link 
              to="/cart" 
              className="drawer-quick-btn is-cart"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Cart"
            >
              <div className="drawer-cart-badge-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span className="drawer-cart-count">{cartCount}</span>
              </div>
              <span>CART</span>
            </Link>
          </div>

          <div className="drawer-divider"></div>

          {/* Theme Section */}
          {showThemeToggle && (
            <>
              <div className="drawer-theme-section">
                <span className="drawer-theme-label">THEME</span>
                <div className="drawer-toggle-wrapper-inner">
                  <ThemeToggle />
                </div>
              </div>
              <div className="drawer-divider"></div>
            </>
          )}

          {/* Navigation Links */}
          <div className="drawer-links">
            <Link to="/" className="drawer-link-item" onClick={() => setIsMenuOpen(false)}>
              <span>HOME</span>
              <span className="link-arrow">+</span>
            </Link>
            <Link to="/shop" className="drawer-link-item" onClick={() => setIsMenuOpen(false)}>
              <span>SHOP</span>
              <span className="link-arrow">+</span>
            </Link>
            <Link to="/about" className="drawer-link-item" onClick={() => setIsMenuOpen(false)}>
              <span>ABOUT</span>
            </Link>
            <Link to="/contact" className="drawer-link-item" onClick={() => setIsMenuOpen(false)}>
              <span>CONTACT</span>
            </Link>
            <Link to="/login" className="drawer-link-item drawer-link-login" onClick={() => setIsMenuOpen(false)}>
              <span>LOGIN</span>
            </Link>
          </div>

          <div className="drawer-footer">
            <p>Premium Eyewear</p>
            <p>Crafted For Modern Vision</p>
          </div>

        </div>
      </div>

      {/* SEARCH OVERLAY PANEL */}
      {isSearchOpen && (
        <div className="search-overlay-bar" ref={searchContainerRef}>
          <div className="search-container-inner">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                ref={searchInputRef}
                type="text"
                className="search-input-field"
                placeholder="SEARCH CROMIC FRAME EYEWEAR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-submit-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <button type="button" className="search-close-btn" onClick={() => setIsSearchOpen(false)}>
                <X size={20} />
              </button>
            </form>

            {/* Results dropdown */}
            {(searchLoading || searchQuery.trim()) && (
              <div className="search-results-dropdown">
                {searchLoading ? (
                  <div className="search-skeletons">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="search-skeleton-item">
                        <div className="skeleton-thumb"></div>
                        <div className="skeleton-info">
                          <div className="skeleton-line short"></div>
                          <div className="skeleton-line long"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="search-results-list">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        to={`/product/${item.id}`}
                        className="search-result-item"
                        onClick={() => setIsSearchOpen(false)}
                      >
                        <img src={item.image} alt={item.name} className="result-thumb" />
                        <div className="result-info">
                          <span className="result-name">{highlightText(item.name, searchQuery)}</span>
                          <span className="result-cat-price">
                            {item.category} • {item.price}
                          </span>
                        </div>
                      </Link>
                    ))}
                    <div className="search-more-results" onClick={handleSearchSubmit}>
                      View all results for "{searchQuery}" →
                    </div>
                  </div>
                ) : (
                  <div className="search-empty-state">
                    <p>No products found matching "{searchQuery}"</p>
                    <div className="search-suggestions">
                      <span>SUGGESTIONS:</span>
                      {["Square", "Luxury", "Classic", "Titanium"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="suggestion-btn"
                          onClick={() => {
                            setSearchQuery(s);
                            searchInputRef.current?.focus();
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Header;