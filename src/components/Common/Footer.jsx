import { useState } from "react";
import "./Footer.css";

function Footer() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (sectionName) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };

  return (
    <footer className="footer">

      <div className="footer-newsletter">
        <div className="footer-logo">
          <img src="/assets/flogo.png" alt="Cromic Eyewear" />
        </div>

        <p className="footer-subtitle">
          JOIN THE LIST. STAY AHEAD.
        </p>

        <form className="footer-form">

          <input
            type="text"
            placeholder="NAME*"
          />

          <input
            type="email"
            placeholder="EMAIL*"
          />

          <button type="submit">
            SUBSCRIBE
          </button>

        </form>

      </div>

      <div className="footer-links">

        <div className="footer-column">
          <button 
            className="accordion-trigger"
            onClick={() => toggleSection("get-in-touch")}
            aria-expanded={openSection === "get-in-touch"}
          >
            <h4>GET IN TOUCH</h4>
            <span className="accordion-icon">{openSection === "get-in-touch" ? "−" : "+"}</span>
          </button>
          <div className={`accordion-content ${openSection === "get-in-touch" ? "is-open" : ""}`}>
            <div className="accordion-inner">
              <a href="/">info@anima.com</a>
            </div>
          </div>
        </div>

        <div className="footer-column">
          <button 
            className="accordion-trigger"
            onClick={() => toggleSection("connect")}
            aria-expanded={openSection === "connect"}
          >
            <h4>CONNECT</h4>
            <span className="accordion-icon">{openSection === "connect" ? "−" : "+"}</span>
          </button>
          <div className={`accordion-content ${openSection === "connect" ? "is-open" : ""}`}>
            <div className="accordion-inner">
              <a href="/">Instagram</a>
              <a href="/">Pinterest</a>
            </div>
          </div>
        </div>

        <div className="footer-column">
          <button 
            className="accordion-trigger"
            onClick={() => toggleSection("content")}
            aria-expanded={openSection === "content"}
          >
            <h4>CONTENT</h4>
            <span className="accordion-icon">{openSection === "content" ? "−" : "+"}</span>
          </button>
          <div className={`accordion-content ${openSection === "content" ? "is-open" : ""}`}>
            <div className="accordion-inner">
              <a href="/">Collections</a>
              <a href="/">About</a>
              <a href="/">Journal</a>
              <a href="/">Contact</a>
            </div>
          </div>
        </div>

        <div className="footer-column">
          <button 
            className="accordion-trigger"
            onClick={() => toggleSection("legal")}
            aria-expanded={openSection === "legal"}
          >
            <h4>LEGAL</h4>
            <span className="accordion-icon">{openSection === "legal" ? "−" : "+"}</span>
          </button>
          <div className={`accordion-content ${openSection === "legal" ? "is-open" : ""}`}>
            <div className="accordion-inner">
              <a href="/">Privacy Policy</a>
              <a href="/">Terms & Conditions</a>
              <a href="/">Shipping & Returns</a>
            </div>
          </div>
        </div>

        <div className="footer-column footer-top">
          <a href="#top">BACK TO TOP</a>
        </div>

      </div>

      <div className="footer-bottom">

        <span>
          ANIMA® 2026
        </span>

        <span>
          Crafted For Those Who See Differently.
        </span>

      </div>

    </footer>
  );
}

export default Footer;