const rawProducts = [
  {
    id: "1",
    name: "ANIMA X1 001",
    price: "$245.00",
    category: "Square",
    image: "https://i.pinimg.com/736x/69/e9/d6/69e9d6174ca43746724d5f8de4d71ce0.jpg",
    variants: {
      tortoise: {
        code: "001",
        name: "ANIMA X1",
        color: "Tortoise",
        price: "$245.00",
        thumb: "https://i.pinimg.com/webp/1200x/6e/e2/20/6ee2205d8b8c37fff650fcb3b3f1153f.webp",
        images: [
          "https://i.pinimg.com/1200x/29/d6/7a/29d67a1e0dcbffcdb74a6f04664eb538.jpg",
          "https://x8.adencys.com/img/products/ANIMA-X1-002/1.2.jpg",
          "https://x8.adencys.com/img/products/ANIMA-X1-002/1.3.jpg",
          "https://i.pinimg.com/736x/d5/ff/bd/d5ffbdcbe6582ef38dcda0fbaa2a9dab.jpg",
        ],
        description: "METICULOUSLY CRAFTED TO TURN HEADS, THESE OVERSIZED YET GEOMETRICALLY BALANCED FRAMES WITH UNIQUELY ANGLED TEMPLES WERE CRAFTED WITH YOU IN MIND. ESCAPE FROM THE MUNDANE QUOTIDIAN ROUTINE AND RELEASE THE INNER YOU.",
        details: "Premium handcrafted acetate frame designed for luxury and comfort.",
        size: "Lens Width 52mm · Bridge 20mm · Temple Length 145mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
      olive: {
        code: "002",
        name: "ANIMA X1",
        color: "Olive",
        price: "$245.00",
        thumb: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300",
        images: [
          "https://cdn.shopify.com/s/files/1/0586/8768/4711/files/CGSN_9261_01_50-2.webp?v=1779871360",
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200",
          "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=1200",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200",
        ],
        description: "METICULOUSLY CRAFTED TO TURN HEADS, THESE OVERSIZED YET GEOMETRICALLY BALANCED FRAMES WITH UNIQUELY ANGLED TEMPLES WERE CRAFTED WITH YOU IN MIND. ESCAPE FROM THE MUNDANE QUOTIDIAN ROUTINE AND RELEASE THE INNER YOU.",
        details: "Elegant olive finish with lightweight construction for everyday wear.",
        size: "Lens Width 52mm · Bridge 20mm · Temple Length 145mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
      red: {
        code: "003",
        name: "ANIMA X1",
        color: "Ruby Red",
        price: "$245.00",
        thumb: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=300",
        images: [
          "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=1200",
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200",
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200",
        ],
        description: "METICULOUSLY CRAFTED TO TURN HEADS, THESE OVERSIZED YET GEOMETRICALLY BALANCED FRAMES WITH UNIQUELY ANGLED TEMPLES WERE CRAFTED WITH YOU IN MIND. ESCAPE FROM THE MUNDANE QUOTIDIAN ROUTINE AND RELEASE THE INNER YOU.",
        details: "Bold ruby red acetate frame crafted for statement styling.",
        size: "Lens Width 52mm · Bridge 20mm · Temple Length 145mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
      black: {
        code: "004",
        name: "ANIMA X1",
        color: "Black",
        price: "$245.00",
        thumb: "/assets/p1.png",
        images: [
          "/assets/p1.png",
          "/assets/p2.png",
          "/assets/p3.png",
        ],
        description: "METICULOUSLY CRAFTED TO TURN HEADS, THESE OVERSIZED YET GEOMETRICALLY BALANCED FRAMES WITH UNIQUELY ANGLED TEMPLES WERE CRAFTED WITH YOU IN MIND. ESCAPE FROM THE MUNDANE QUOTIDIAN ROUTINE AND RELEASE THE INNER YOU.",
        details: "Classic black luxury frame with premium finishing and durability.",
        size: "Lens Width 52mm · Bridge 20mm · Temple Length 145mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
    },
  },
  {
    id: "2",
    name: "ANIMA X1 002",
    price: "$245.00",
    category: "Luxury",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200",
    variants: {
      olive: {
        code: "002",
        name: "ANIMA X1",
        color: "Olive",
        price: "$245.00",
        thumb: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300",
        images: [
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200",
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200",
          "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=1200",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200",
        ],
        description: "METICULOUSLY CRAFTED TO TURN HEADS, THESE OVERSIZED YET GEOMETRICALLY BALANCED FRAMES WITH UNIQUELY ANGLED TEMPLES WERE CRAFTED WITH YOU IN MIND. ESCAPE FROM THE MUNDANE QUOTIDIAN ROUTINE AND RELEASE THE INNER YOU.",
        details: "Elegant olive finish with lightweight construction for everyday wear.",
        size: "Lens Width 52mm · Bridge 20mm · Temple Length 145mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
      tortoise: {
        code: "001",
        name: "ANIMA X1",
        color: "Tortoise",
        price: "$245.00",
        thumb: "https://x8.adencys.com/img/products/ANIMA-X1-002/1.1.jpg",
        images: [
          "https://x8.adencys.com/img/products/ANIMA-X1-002/1.1.jpg",
          "https://x8.adencys.com/img/products/ANIMA-X1-002/1.2.jpg",
          "https://x8.adencys.com/img/products/ANIMA-X1-002/1.3.jpg",
          "https://i.pinimg.com/736x/d5/ff/bd/d5ffbdcbe6582ef38dcda0fbaa2a9dab.jpg",
        ],
        description: "METICULOUSLY CRAFTED TO TURN HEADS, THESE OVERSIZED YET GEOMETRICALLY BALANCED FRAMES WITH UNIQUELY ANGLED TEMPLES WERE CRAFTED WITH YOU IN MIND. ESCAPE FROM THE MUNDANE QUOTIDIAN ROUTINE AND RELEASE THE INNER YOU.",
        details: "Premium handcrafted acetate frame designed for luxury and comfort.",
        size: "Lens Width 52mm · Bridge 20mm · Temple Length 145mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
    },
  },
  {
    id: "3",
    name: "ANIMA X1 003",
    price: "$245.00",
    category: "Classic",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200",
    variants: {
      red: {
        code: "003",
        name: "ANIMA X1",
        color: "Ruby Red",
        price: "$245.00",
        thumb: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=300",
        images: [
          "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=1200",
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200",
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200",
        ],
        description: "METICULOUSLY CRAFTED TO TURN HEADS, THESE OVERSIZED YET GEOMETRICALLY BALANCED FRAMES WITH UNIQUELY ANGLED TEMPLES WERE CRAFTED WITH YOU IN MIND. ESCAPE FROM THE MUNDANE QUOTIDIAN ROUTINE AND RELEASE THE INNER YOU.",
        details: "Bold ruby red acetate frame crafted for statement styling.",
        size: "Lens Width 52mm · Bridge 20mm · Temple Length 145mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
      black: {
        code: "004",
        name: "ANIMA X1",
        color: "Black",
        price: "$245.00",
        thumb: "/assets/p1.png",
        images: [
          "/assets/p1.png",
          "/assets/p2.png",
          "/assets/p3.png",
        ],
        description: "METICULOUSLY CRAFTED TO TURN HEADS, THESE OVERSIZED YET GEOMETRICALLY BALANCED FRAMES WITH UNIQUELY ANGLED TEMPLES WERE CRAFTED WITH YOU IN MIND. ESCAPE FROM THE MUNDANE QUOTIDIAN ROUTINE AND RELEASE THE INNER YOU.",
        details: "Classic black luxury frame with premium finishing and durability.",
        size: "Lens Width 52mm · Bridge 20mm · Temple Length 145mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
    },
  },
  {
    id: "4",
    name: "ANIMA X1 004",
    price: "$245.00",
    category: "Square",
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=1200",
    variants: {
      black: {
        code: "004",
        name: "ANIMA X1",
        color: "Black",
        price: "$245.00",
        thumb: "/assets/p1.png",
        images: [
          "/assets/p1.png",
          "/assets/p2.png",
          "/assets/p3.png",
        ],
        description: "METICULOUSLY CRAFTED TO TURN HEADS, THESE OVERSIZED YET GEOMETRICALLY BALANCED FRAMES WITH UNIQUELY ANGLED TEMPLES WERE CRAFTED WITH YOU IN MIND. ESCAPE FROM THE MUNDANE QUOTIDIAN ROUTINE AND RELEASE THE INNER YOU.",
        details: "Classic black luxury frame with premium finishing and durability.",
        size: "Lens Width 52mm · Bridge 20mm · Temple Length 145mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
      tortoise: {
        code: "001",
        name: "ANIMA X1",
        color: "Tortoise",
        price: "$245.00",
        thumb: "https://x8.adencys.com/img/products/ANIMA-X1-002/1.1.jpg",
        images: [
          "https://x8.adencys.com/img/products/ANIMA-X1-002/1.1.jpg",
          "https://x8.adencys.com/img/products/ANIMA-X1-002/1.2.jpg",
          "https://x8.adencys.com/img/products/ANIMA-X1-002/1.3.jpg",
          "https://i.pinimg.com/736x/d5/ff/bd/d5ffbdcbe6582ef38dcda0fbaa2a9dab.jpg",
        ],
        description: "METICULOUSLY CRAFTED TO TURN HEADS, THESE OVERSIZED YET GEOMETRICALLY BALANCED FRAMES WITH UNIQUELY ANGLED TEMPLES WERE CRAFTED WITH YOU IN MIND. ESCAPE FROM THE MUNDANE QUOTIDIAN ROUTINE AND RELEASE THE INNER YOU.",
        details: "Premium handcrafted acetate frame designed for luxury and comfort.",
        size: "Lens Width 52mm · Bridge 20mm · Temple Length 145mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
    },
  },
  {
    id: "5",
    name: "ANIMA X2 001",
    price: "$245.00",
    category: "Luxury",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200",
    variants: {
      tortoise: {
        code: "001",
        name: "ANIMA X2",
        color: "Tortoise",
        price: "$245.00",
        thumb: "https://x8.adencys.com/img/products/ANIMA-X1-002/1.1.jpg",
        images: [
          "https://x8.adencys.com/img/products/ANIMA-X1-002/1.1.jpg",
          "https://x8.adencys.com/img/products/ANIMA-X1-002/1.2.jpg",
        ],
        description: "THE ANIMA X2 OFFERS AN ULTRA-LIGHTWEIGHT AVIATOR INSPIRATION FEATURING AN EXTENDED BRIDGE DETAIL AND SIGNATURE HAND-SCULPTED ACETATE.",
        details: "Ultra-premium composite frames with heavy-duty metal core reinforcement.",
        size: "Lens Width 54mm · Bridge 18mm · Temple Length 140mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
      black: {
        code: "002",
        name: "ANIMA X2",
        color: "Black",
        price: "$245.00",
        thumb: "/assets/p1.png",
        images: [
          "/assets/p1.png",
          "/assets/p2.png",
          "/assets/p3.png",
        ],
        description: "THE ANIMA X2 OFFERS AN ULTRA-LIGHTWEIGHT AVIATOR INSPIRATION FEATURING AN EXTENDED BRIDGE DETAIL AND SIGNATURE HAND-SCULPTED ACETATE.",
        details: "Ultra-premium composite frames with heavy-duty metal core reinforcement.",
        size: "Lens Width 54mm · Bridge 18mm · Temple Length 140mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
    },
  },
  {
    id: "6",
    name: "ANIMA X2 002",
    price: "$245.00",
    category: "Classic",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200",
    variants: {
      olive: {
        code: "002",
        name: "ANIMA X2",
        color: "Olive",
        price: "$245.00",
        thumb: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300",
        images: [
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200",
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200",
        ],
        description: "ELEGANT SCULPTED GEOMETRIC LINES HIGHLIGHTED BY A MODERN OLIVE SHEEN. BUILT FOR THE CLASSIC AFICIONADO.",
        details: "Lightweight and robust composite structure with high UV protection lens.",
        size: "Lens Width 54mm · Bridge 18mm · Temple Length 140mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
    },
  },
  {
    id: "7",
    name: "ANIMA X2 003",
    price: "$245.00",
    category: "Square",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200",
    variants: {
      red: {
        code: "003",
        name: "ANIMA X2",
        color: "Ruby Red",
        price: "$245.00",
        thumb: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=300",
        images: [
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200",
          "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=1200",
        ],
        description: "BOLD STYLING WITH A TIMELESS SQUARE SILHOUETTE. RED CARPET COMPATIBILITY WITH A REFINED CASUAL AESTHETIC.",
        details: "Hand-finished premium acetate with gradient polarized lens.",
        size: "Lens Width 54mm · Bridge 18mm · Temple Length 140mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
    },
  },
  {
    id: "8",
    name: "ANIMA X2 004",
    price: "$245.00",
    category: "Luxury",
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=1200",
    variants: {
      black: {
        code: "004",
        name: "ANIMA X2",
        color: "Black",
        price: "$245.00",
        thumb: "/assets/p1.png",
        images: [
          "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=1200",
          "/assets/p1.png",
        ],
        description: "THE ULTIMATE SHIELD IN DEEP GLOSS BLACK. MINIMALIST DETAILING ON THE SIDES OFFERS A REFINED MODERN MONOCHROME.",
        details: "Scratch-resistant polycarbonate lenses offering total UV400 block.",
        size: "Lens Width 54mm · Bridge 18mm · Temple Length 140mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
    },
  },
  {
    id: "9",
    name: "ANIMA X1 005",
    price: "$245.00",
    category: "Luxury",
    image: "https://i.pinimg.com/1200x/45/4c/1d/454c1dae3e08a4f1f361f119e74f969f.jpg",
    variants: {
      tortoise: {
        code: "005",
        name: "ANIMA X1",
        color: "Tortoise",
        price: "$245.00",
        thumb: "https://x8.adencys.com/img/products/ANIMA-X1-002/1.1.jpg",
        images: [
          "https://i.pinimg.com/1200x/45/4c/1d/454c1dae3e08a4f1f361f119e74f969f.jpg",
          "https://x8.adencys.com/img/products/ANIMA-X1-002/1.1.jpg",
        ],
        description: "THE PRESTIGIOUS 005 EDITION OF ANIMA X1. ELEVATING LUXURY EYEWEAR TO NEW LIMITS WITH UNCOMPROMISING GEOMETRIES.",
        details: "Full custom layout frame with signature metal core visible temples.",
        size: "Lens Width 52mm · Bridge 20mm · Temple Length 145mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
    },
  },
  {
    id: "10",
    name: "ANIMA X1 006",
    price: "$245.00",
    category: "Classic",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200",
    variants: {
      black: {
        code: "006",
        name: "ANIMA X1",
        color: "Black",
        price: "$245.00",
        thumb: "/assets/p1.png",
        images: [
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200",
          "/assets/p1.png",
        ],
        description: "A TRUE REDEFINITION OF VINTAGE EYEWEAR IN CONTEMPORARY CRAFTSMANSHIP. CLEAN AND ABSOLUTE.",
        details: "Handmade in Italy from 100% bio-degradable custom acetate.",
        size: "Lens Width 52mm · Bridge 20mm · Temple Length 145mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
    },
  },
  {
    id: "11",
    name: "ANIMA X1 007",
    price: "$245.00",
    category: "Square",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200",
    variants: {
      olive: {
        code: "007",
        name: "ANIMA X1",
        color: "Olive",
        price: "$245.00",
        thumb: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300",
        images: [
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200",
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200",
        ],
        description: "THE 007 COLLECTION HIGHLIGHTS REVOLUTIONARY POLARIZATION IN A CRISP SQUARED FORM.",
        details: "Optically correct, distortion-free impact-resistant lenses.",
        size: "Lens Width 52mm · Bridge 20mm · Temple Length 145mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
    },
  },
  {
    id: "12",
    name: "CROMIC",
    price: "$245.00",
    category: "Luxury",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200",
    variants: {
      tortoise: {
        code: "X-CROMIC",
        name: "CROMIC",
        color: "Tortoise",
        price: "$245.00",
        thumb: "https://x8.adencys.com/img/products/ANIMA-X1-002/1.1.jpg",
        images: [
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200",
          "https://x8.adencys.com/img/products/ANIMA-X1-002/1.1.jpg",
        ],
        description: "THE BRAND'S NAMESAKE SILHOUETTE. DESIGNED FOR EXTRAORDINARY STYLING, BOLD INDEPENDENT ATMOSPHERES.",
        details: "Signature gold hinges with laser-etched insignia on inner temples.",
        size: "Lens Width 50mm · Bridge 22mm · Temple Length 150mm",
        shipping: "Free worldwide shipping. Easy returns within 30 days.",
      },
    },
  },
];

export const products = rawProducts.map((product) => {
  let secondaryImage = null;
  const variants = product.variants || {};
  const variantKeys = Object.keys(variants);
  const firstVariantKey = variantKeys[0];

  if (firstVariantKey) {
    const variant = variants[firstVariantKey];
    if (variant && Array.isArray(variant.images) && variant.images.length > 0) {
      // Find an image that's different from the primary image
      secondaryImage = variant.images.find((img) => img !== product.image) || variant.images[0];
    }
  }

  // Custom visual overrides for specific products to ensure ultra-premium aesthetics
  if (product.id === "1") {
    secondaryImage = "https://x8.adencys.com/img/products/ANIMA-X1-002/1.2.jpg";
  }

  return {
    ...product,
    secondaryImage: secondaryImage || product.image,
  };
});

