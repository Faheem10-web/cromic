import "./Hero.css";

function Hero() {
  return (
    <section className="hero">


      <video
        autoPlay
        muted
        loop
        playsInline
        className="hero-video"
      >
        {/* <source src="/assets/h4.mkv" type="video/mp4" /> */}
        {/* <source src="/assets/hero.mp4" type="video/mp4" /> */}
        <source src="/assets/hero3.mkv" type="video/mp4" />
      </video>

      <div className="hero-content">
        <div className="container">
          <h1>
            THE NEW <br />
            BLACK ARROW
          </h1>

          <p>
            The classic PO3269S pairs an all-black finish
            with a silver-outlined Persol Arrow
          </p>



        </div>
      </div>
    </section>
  );
}

export default Hero;