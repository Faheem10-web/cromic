import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";
import "./MobileDrawer.css";
import "./DesktopOverlay.css";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  // Logo Change
  const logoSrc =
    theme === "dark"
      ? "/assets/white.logo.png"
      : isHomePage && !isScrolled
      ? "/assets/white.logo.png"
      : "/assets/logo.png";

  const overlayLogoSrc =
    theme === "dark"
      ? "/assets/white.logo.png"
      : "/assets/logo.png";

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

      if (
        currentScrollY > lastScrollY.current &&
        currentScrollY > 120
      ) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }

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
        `}
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

            <button
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
                0
              </span>
            </button>

            {/* THEME TOGGLE */}
            <div className="header-toggle-container">
              <ThemeToggle />
            </div>

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
              <button className="desktop-menu-action-btn" aria-label="Search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <button className="desktop-menu-action-btn" aria-label="Cart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span className="desktop-menu-cart-count">0</span>
              </button>
            </div>
          </div>

          <div className="desktop-menu-links">
            {["HOME", "SHOP", "PRODUCT", "ABOUT", "CONTACT", "LOGIN"].map((name, i) => {
              const linkPath =
                name === "LOGIN" ? "/login" :
                name === "PRODUCT" ? "/product/1" :
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

          <div className="desktop-menu-theme-toggle">
            <ThemeToggle />
          </div>
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

          {/* Theme Section */}
          <div className="drawer-theme-section">
            <span className="drawer-theme-label">THEME</span>
            <div className="drawer-toggle-wrapper-inner">
              <ThemeToggle />
            </div>
          </div>

          <div className="drawer-divider"></div>

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
            <Link to="/product/1" className="drawer-link-item" onClick={() => setIsMenuOpen(false)}>
              <span>PRODUCT</span>
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
    </>
  );
}

export default Header;