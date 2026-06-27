import { useEffect, useState } from "react";
import "./Story.css";

const images = [

  "https://images.pexels.com/photos/30271002/pexels-photo-30271002.jpeg",
  "https://images.pexels.com/photos/36846593/pexels-photo-36846593.jpeg",
  "https://images.pexels.com/photos/5752267/pexels-photo-5752267.jpeg",
];

const Story = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="story-section">
      <div className="story-top">
        <div className="story-left">
          <span className="story-label">OUR STORY</span>

          <h2>
            Crafted <br />
            Beyond <span>Vision</span>
          </h2>
        </div>

        <div className="story-right">
          <p>
            meticulously crafted to turn heads, these oversized yet geometrically balanced frames with uniquely angled temples were crafted with you in mind. Escape from the mundane quotidian routine and release the inner you.
          </p>

          <button>Explore Brand</button>
        </div>
      </div>

      <div className="story-image">
        <img
          key={currentImage}
          src={images[currentImage]}
          alt="Eyewear"
          className="story-img"
        />
      </div>
    </section>
  );
};

export default Story;