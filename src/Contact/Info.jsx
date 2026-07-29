import './Info.css';
import { useSiteSettings } from "../context/SiteSettingsContext";

function Info() {
  const { settings } = useSiteSettings();

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>CONTACT US</h1>
      </div>
      
      {settings.enable_contact_form === false ? (
        <div style={{ 
          textAlign: "center", 
          padding: "3.5rem 2rem", 
          border: "1px solid var(--borders)", 
          background: "var(--hover)", 
          borderRadius: "6px", 
          marginTop: "2rem",
          maxWidth: "600px",
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          <p style={{ 
            fontSize: "0.85rem", 
            color: "var(--secondary-text)", 
            letterSpacing: "1px", 
            textTransform: "uppercase",
            lineHeight: "1.6",
            margin: 0
          }}>
            Our contact form is temporarily offline. Please send us an email at info@anima.com or call us directly.
          </p>
        </div>
      ) : (
        <form className="contact-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">FIRST NAME</label>
              <input type="text" id="firstName" name="firstName" />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">LAST NAME</label>
              <input type="text" id="lastName" name="lastName" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input type="email" id="email" name="email" />
          </div>

          <div className="form-group">
            <label htmlFor="topic">TOPIC</label>
            <select id="topic" name="topic">
              <option value="orders">Orders & Shipping</option>
              <option value="support">Support</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="message">MESSAGE</label>
            <textarea id="message" name="message" rows="5"></textarea>
          </div>

          <button type="submit" className="submit-btn">SEND</button>
        </form>
      )}
    </div>
  );
}

export default Info;