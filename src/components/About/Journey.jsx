import "./Journey.css";

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
  return (
    <section className="journey">
      <div className="journey-bg"></div>
      
      <div className="container">
        <div className="journey-left">
          <span>OUR JOURNEY</span>
          <h2>
            A JOURNEY OF
            <br />
            PASSION & PURPOSE.
          </h2>
        </div>

        <div className="journey-right">
          <div className="timeline-line"></div>

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