import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeImage, setActiveImage] = useState(0);

  // ✅ Live backend URL from environment variable
  const API = import.meta.env.VITE_API_URL || "https://desco-preorder-store.onrender.com";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/api/products`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading products:", err);
      }
    };

    fetchProducts();
  }, [API]);

  const categories = [
    "All",
    "Home Appliances",
    "Electronics",
    "Kitchen Essentials",
    "Beauty & Care",
    "Health & Wellness",
    "Office & Accessories",
    "Other Materials",
  ];

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter(
          (p) =>
            (p.category || "Other Materials").toLowerCase() ===
            activeCategory.toLowerCase()
        );

  const getImages = (product) =>
    [product.image1, product.image2, product.image3].filter(Boolean);

  return (
    <div className="bg-blue-50 min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        {/* HERO */}
        <div className="bg-gradient-to-r from-blue-700 to-sky-500 rounded-xl mb-5 p-4 text-white shadow">
          <h1 className="text-xl sm:text-2xl font-extrabold">DESCO Preorder Store</h1>
          <p className="text-sm mt-1 opacity-95">
            Quality appliances & essentials — preorder with ease.
          </p>
        </div>

        {/* CATEGORIES */}
        <div className="flex flex-wrap justify-center gap-2 mb-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                activeCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => {
                setSelectedProduct(product);
                setActiveImage(0);
              }}
            >
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                image={
                  product.image1?.startsWith("http")
                    ? product.image1
                    : `${API}${product.image1}`
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3"
          >
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setSelectedProduct(null)}
            />

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl max-w-lg w-full z-50 overflow-hidden"
            >
              <div className="p-4">
                <img
                  src={
                    getImages(selectedProduct)[activeImage]?.startsWith("http")
                      ? getImages(selectedProduct)[activeImage]
                      : `${API}${getImages(selectedProduct)[activeImage]}`
                  }
                  className="w-full h-56 object-contain"
                  alt={selectedProduct.name}
                />

                <h2 className="mt-4 font-bold text-gray-800 text-lg text-center">
                  {selectedProduct.name}
                </h2>

                <p className="text-center text-blue-600 font-extrabold text-xl mt-2">
                  ₵{Number(selectedProduct.price).toLocaleString()}
                </p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => addToCart(selectedProduct)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 border py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
