import React from 'react';
import './OurPhilosophy.css';

const OurPhilosophy = () => {
  const pillars = [
    {
      id: 1,
      title: "PRECISION",
      description: "Engineered with meticulous attention to every detail for perfect balance and fit.",
      // Compass / Caliper Icon
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v2M10 12l-4 9M14 12l4 9M9 17h6" />
        </svg>
      )
    },
    {
      id: 2,
      title: "TIMELESS DESIGN",
      description: "Inspired by classic silhouettes, reimagined for the modern era with a contemporary edge.",
      // Diamond Icon
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l4 5-10 13L2 8z" />
          <path d="M11 3 8 8l4 13 4-13-3-5" />
          <path d="M2 8h20" />
        </svg>
      )
    },
    {
      id: 3,
      title: "HANDCRAFTED",
      description: "Expertly handcrafted by skilled artisans using the finest materials.",
      // Hand Icon
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5m0 0V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6m0 0V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8M6 14v-2a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v4M6 14c0 4 2.5 6 6 6h3a5 5 0 0 0 5-5v-4" />
        </svg>
      )
    },
    {
      id: 4,
      title: "INNOVATION",
      description: "Continuously pushing the boundaries of materials, comfort and performance.",
      // Sparkle / Star Icon
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c0 4.5 3.5 9 8 9-4.5 0-8 3.5-8 9 0-4.5-3.5-9-8-9 4.5 0 8-3.5 8-9Z" />
        </svg>
      )
    }
  ];

  return (
    <section className="philosophy-section">
      <div className="philosophy-container">
        {/* Header Block */}
        <div className="philosophy-header">
          <p className="philosophy-subtitle">OUR PHILOSOPHY</p>
          <h2 className="philosophy-title">DESIGN. FUNCTION. HERITAGE.</h2>
          <p className="philosophy-intro">
            Every frame is a balance of precision engineering and timeless design.<br />
            We obsess over every detail to deliver unmatched quality.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="philosophy-grid">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="philosophy-card">
              <div className="philosophy-icon-wrapper">
                {pillar.icon}
              </div>
              <h3 className="pillar-title">{pillar.title}</h3>
              <p className="pillar-description">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurPhilosophy;