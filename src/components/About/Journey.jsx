import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Journey.css";

gsap.registerPlugin(ScrollTrigger);

const timeline = [
  {
    year: "2016",
    title: "THE BEGINNING",
    text: "Cromic was founded with a simple idea — to create eyewear that feels different."
  },
  {
    year: "2018",
    title: "FIRST COLLECTION",
    text: "Launched our first collection combining minimal design with premium craftsmanship."
  },
  {
    year: "2020",
    title: "GLOBAL REACH",
    text: "Expanded worldwide, sharing our vision with eyewear lovers across the globe."
  },
  {
    year: "2024",
    title: "BEYOND TOMORROW",
    text: "Continuing to innovate and set new standards for the future."
  },
  {
    year: "2026",
    title: "THE NEXT FRONTIER",
    text: "Pushing the boundaries of sustainable smart eyewear and global presence."
  }
];

export default function Journey() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance animation timeline (Triggers when top enters 70% viewport)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          once: true,
        }
      });

      // Background Lens graphic scale & opacity
      tl.fromTo(".journey-bg-wrapper", {
        opacity: 0,
        scale: 1,
        y: 40
      }, {
        opacity: 0.12,
        scale: 1.06,
        y: 0,
        duration: 1.8,
        ease: "power3.out"
      }, 0);

      // Section label reveal
      tl.fromTo(".journey-left span", {
        opacity: 0,
        y: 20
      }, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: "power2.out"
      }, 0.3);

      // Heading lines mask reveal
      tl.fromTo(".heading-line", {
        yPercent: 100
      }, {
        yPercent: 0,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.15
      }, 0.5);

      const items = gsap.utils.toArray(".timeline-item");

      // 2. Responsive drawing and scroll progress
      let mm = gsap.matchMedia();

      mm.add("(min-width: 992px)", () => {
        // Draw the background timeline line from left to right
        tl.fromTo(".timeline-line", {
          scaleX: 0,
          transformOrigin: "left center"
        }, {
          scaleX: 1,
          duration: 1.2,
          ease: "power2.out"
        }, 0.8);

        // Progress line horizontal scrub
        gsap.to(".timeline-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 55%",
            end: "bottom 45%",
            scrub: 0.5,
            onUpdate: (self) => {
              updateMilestones(self.progress);
            }
          }
        });
      });

      mm.add("(max-width: 991px)", () => {
        // Draw the background timeline line from top to bottom
        tl.fromTo(".timeline-line", {
          scaleY: 0,
          transformOrigin: "top center"
        }, {
          scaleY: 1,
          duration: 1.2,
          ease: "power2.out"
        }, 0.8);

        // Progress line vertical scrub
        gsap.to(".timeline-progress", {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".journey-right",
            start: "top 60%",
            end: "bottom 60%",
            scrub: 0.5,
            onUpdate: (self) => {
              updateMilestones(self.progress);
            }
          }
        });
      });

      // 3. Background Lens parallax movement
      gsap.to(".journey-bg", {
        y: 80,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

      // 4. Milestone items entry stagger
      items.forEach((item, index) => {
        const dot = item.querySelector(".dot");
        const year = item.querySelector(".year");
        const title = item.querySelector("h4");
        const text = item.querySelector("p");

        const startTime = 1.0 + (index * 0.15); // 150ms stagger

        tl.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.6, ease: "back.out(1.4)" }, startTime);
        tl.fromTo(year, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, startTime + 0.1);
        tl.fromTo(title, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, startTime + 0.15);
        tl.fromTo(text, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, startTime + 0.25);
      });

      // Milestone state updater based on scroll progress
      const updateMilestones = (progress) => {
        let activeIdx = 0;
        if (progress < 0.125) {
          activeIdx = 0;
        } else if (progress >= 0.125 && progress < 0.375) {
          activeIdx = 1;
        } else if (progress >= 0.375 && progress < 0.625) {
          activeIdx = 2;
        } else if (progress >= 0.625 && progress < 0.875) {
          activeIdx = 3;
        } else {
          activeIdx = 4;
        }

        items.forEach((item, index) => {
          if (index < activeIdx) {
            item.classList.add("completed");
            item.classList.remove("active", "inactive");
          } else if (index === activeIdx) {
            item.classList.add("active");
            item.classList.remove("completed", "inactive");
          } else {
            item.classList.add("inactive");
            item.classList.remove("active", "completed");
          }
        });
      };

      // Set initial status as inactive
      items.forEach((item) => {
        item.classList.add("inactive");
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="journey" ref={sectionRef}>
      <div className="journey-bg-wrapper">
        <div className="journey-bg"></div>
      </div>
      
      <div className="container">
        <div className="journey-left">
          <span>OUR JOURNEY</span>
          <h2 className="journey-heading">
            <span className="heading-line-mask">
              <span className="heading-line">A JOURNEY OF</span>
            </span>
            <span className="heading-line-mask">
              <span className="heading-line">PASSION & PURPOSE.</span>
            </span>
          </h2>
        </div>

        <div className="journey-right">
          <div className="timeline-line">
            <div className="timeline-progress"></div>
          </div>

          {timeline.map((item, index) => (
            <div className="timeline-item" key={index}>
              <span className="year">{item.year}</span>
              <div className="dot"></div>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}