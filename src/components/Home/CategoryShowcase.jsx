import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "./CategoryShowcase.css";

const categories = [
  {
    id: "01",
    title: "TITANIUM",
    subtitle: "Precision Crafted",
    desc: "Ultra-light titanium frames engineered for exceptional comfort, durability and everyday luxury.",
    image: "https://x8.adencys.com/img/products/ANIMA-X1-001/1.1.jpg",
    thumb: "https://images.pexels.com/photos/37208696/pexels-photo-37208696.jpeg",
  },
  {
    id: "02",
    title: "HERITAGE",
    subtitle: "Timeless Design",
    desc: "Classic silhouettes inspired by iconic eyewear culture, refined with contemporary craftsmanship.",
    image: "https://i.pinimg.com/1200x/51/55/70/515570e3d25da043d70cc9b9212091c1.jpg",
    thumb: "https://images.unsplash.com/photo-1577803645773-f96470509666?w=500",
  },
  {
    id: "03",
    title: "AVANT",
    subtitle: "Future Expression",
    desc: "Bold contemporary designs created for individuals who embrace innovation and modern luxury.",
    image: "https://i.pinimg.com/1200x/c7/fd/85/c7fd8584952f24e8e93b3ac61ff32de0.jpg",
    thumb: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500",
  },
];

function CardWrapper({ item, index, total }) {
  const containerRef = useRef(null);
  
  // Track scroll progression specifically for each card viewport area
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Replicating cinematic scaling down and slight dimming of the active card as the next one stacks over it
  const cardScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const cardOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.6]);
  
  // Replicating inner parallax zoom & motion for images and content layers as seen frame-by-frame
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0px", "-40px"]);

  return (
    <div ref={containerRef} className="editorial-card-track">
      <motion.div
        className="editorial-card"
        style={{
          scale: index === total - 1 ? 1 : cardScale,
          opacity: index === total - 1 ? 1 : cardOpacity,
          zIndex: index + 1,
        }}
      >
        <div className="editorial-left container">
          <motion.div style={{ y: textY }} className="content-inner-wrapper">
            <span className="brand-label">COLLECTION</span>
            <p className="brand-subtitle">{item.subtitle}</p>
            <div className="divider"></div>

            <div className="editorial-heading">
              <motion.h2
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              >
                {item.title}
              </motion.h2>
              <span className="collection-number">{item.id}</span>
            </div>

            <p className="editorial-desc">{item.desc}</p>

            <div className="editorial-bottom">
              <div className="thumb-box">
                <img src={item.thumb} alt={item.title} />
              </div>
              <a href="/" className="explore-cta">Explore Collection →</a>
            </div>
          </motion.div>
        </div>

        <div className="editorial-right">
          <motion.div className="image-overflow-container" style={{ y: imgY }}>
            <motion.img
              src={item.image}
              alt={item.title}
              initial={{ scale: 1.15 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function CategoryShowcase() {
  return (
    <section className="editorial-showcase">
      {/* COLLECTIONS STACK */}
      <div className="editorial-stack-container">
        {categories.map((item, index) => (
          <CardWrapper 
            key={item.id} 
            item={item} 
            index={index} 
            total={categories.length} 
          />
        ))}
      </div>
    </section>
  );
}

export default CategoryShowcase;