import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const lastScrollY = useRef(0);
  const location = useLocation();

  // Home page check
  const isHomePage = location.pathname === "/";

  // Logo Change
  const logoSrc =
    isHomePage && !isScrolled
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
     CLOSE MENU
  ========================= */

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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

          </div>
        </div>
      </header>

      {/* =========================
          FULLSCREEN MENU
      ========================= */}

      <div
        className={`nav-overlay ${isMenuOpen ? "is-visible" : ""
          }`}
      >
        <div className="nav-overlay-inner">

          <div className="nav-links">

            <Link to="/">
              HOME
            </Link>

            <Link to="/shop">
              SHOP
            </Link>

            <Link to="/product/1">
              PRODUCT
            </Link>

            <Link to="/about">
              ABOUT
            </Link>

            <Link to="/contact">
              CONTACT
            </Link>

            <Link to="/login">
              Login
            </Link>

          </div>

          <div className="nav-footer">
            <p>Premium Eyewear</p>
            <p>Crafted For Modern Vision</p>
          </div>

        </div>
      </div>
    </>
  );
}

export default Header;