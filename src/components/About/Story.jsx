import { useEffect, useState } from "react";
import API from "../../services/api";
import "./Story.css";

const Story = () => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchAbout = async () => {
      try {
        setLoading(true);
        const res = await API.get("/about", { signal: controller.signal });
        if (!controller.signal.aborted && res.data) {
          setAboutData(res.data);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Failed to load dynamic About Section:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchAbout();
    return () => controller.abort();
  }, []);

  if (loading || !aboutData) return null;

  return (
    <section className="story-section">
      <div className="story-top">
        <div className="story-left">
          <h2>
            {aboutData.heading_line_1} <br />
            {aboutData.heading_line_2} <span>{aboutData.highlighted_word}</span>
          </h2>
        </div>

        <div className="story-right">
          <p>
            {aboutData.description}
          </p>

          <button onClick={() => window.location.href = aboutData.button_url || "/"}>
            {aboutData.button_text || "Explore Brand"}
          </button>
        </div>
      </div>

      <div className="story-image">
        <img
          src={aboutData.image_url}
          alt="Eyewear"
          className="story-img"
        />
      </div>
    </section>
  );
};

export default Story;