import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Header from "./components/Common/Header";
import Footer from "./components/Common/Footer";
import Product from "./Pages/Product";
import Contact from "./Pages/Contact";
import ProductPage from "./Pages/ProductPage";
import About from "./Pages/About";
import SmoothScroll from "./SmoothScroll";







function App() {
  return (
    <>
    <SmoothScroll/>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Product />} />
        <Route path="/about" element={<About />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/contact" element={<Contact />} />

      </Routes>
      <Footer />
    </>
  );
}

export default App;