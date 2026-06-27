import "./Lookbook.css";
import { HiArrowLongRight } from "react-icons/hi2";
const looks = [
  {
    title: "Men's Opticals",
    image:
      "https://i.pinimg.com/1200x/bd/c2/90/bdc2901ba727dcc2372f247696e8b002.jpg",
  },
  {
    title: "Women's Opticals",
    image:
      "https://x8.adencys.com/img/promotions.jpg",
  },
];

function Lookbook() {
  return (
    <section className="lookbook">

      {looks.map((item, index) => (
        <div className="lookbook-card" key={index}>

          <img
            src={item.image}
            alt={item.title}
          />

          <div className="lookbook-overlay"></div>

          <div className="lookbook-content">

            <span className="lookbook-label">
              LOOKBOOK
            </span>

            <h2>
              {item.title}
            </h2>
            <a href="/" className="shop-link">
              Shop
              <HiArrowLongRight size={22} />
            </a>
          </div>

        </div>
      ))}

    </section>
  );
}

export default Lookbook;