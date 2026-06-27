import { useState, useEffect } from "react";
import "./CampaignSection.css";

const SLIDES = [
  {
    tag: "CAMPAIGN 2026",
    heading: "SEE THE WORLD DIFFERENTLY.",
    paragraph:
      "Crafted for those who embrace individuality, creativity and modern luxury.",
  },
  {
    tag: "THE VISION",
    heading: "BEYOND THE ORDINARY.",
    paragraph:
      "Precision-engineered design that blends seamlessly with your daily lifestyle.",
  },
  {
    tag: "THE CRAFT",
    heading: "TIMELESS ELEGANCE.",
    paragraph:
      "Redefining the standards of modern aesthetics for the future explorer.",
  },
];

function CampaignSection() {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimate(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % SLIDES.length);
        setAnimate(true);
      }, 600);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="campaign">

      {/* FULL WIDTH VIDEO */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="campaign-video"
      >
        <source src="/assets/h4.mkv" type="video/mp4" />
      </video>

      <div className="campaign-overlay"></div>

      {/* CONTENT INSIDE CONTAINER */}
      <div className="campaign-content">
        <div
          className={`container ${
            animate ? "fade-in" : "fade-out"
          }`}
        >
          <span className="tag">
            {SLIDES[index].tag}
          </span>

          <h3 className="story-heading">
            {SLIDES[index].heading}
          </h3>

          <p className="story-paragraph">
            {SLIDES[index].paragraph}
          </p>

          <a href="/" className="explore-btn">
            Explore Story →
          </a>
        </div>
      </div>

    </section>
  );
}

export default CampaignSection;