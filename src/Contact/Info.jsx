import React from 'react';
import './Info.css';

function Info() {
  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>CONTACT US</h1>
      </div>
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
    </div>
  );
}

export default Info;