import React from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";

export default function ProductCard({ id, name, price, image }) {
  const { addToCart } = useCart();

  const formatNumber = (n) =>
    !isNaN(Number(n)) ? Number(n).toLocaleString() : "0";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow border border-blue-100 flex flex-col overflow-hidden"
    >
      {/* IMAGE */}
      <div className="flex justify-center items-center p-2">
        <img
          src={image || "https://via.placeholder.com/200"}
          alt={name}
          className="h-24 sm:h-28 object-contain"
        />
      </div>

      {/* CONTENT */}
      <div className="px-3 pb-3 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 text-center">
          {name}
        </h3>

        <p className="text-desco font-bold text-sm mt-1 text-center">
          ₵{formatNumber(price)}
        </p>

        <button
          onClick={() =>
            addToCart({ id, name, price: Number(price), image })
          }
          className="mt-auto bg-desco text-white text-sm py-1.5 rounded-md hover:opacity-90 transition"
        >
          Add
        </button>
      </div>
    </motion.div>
  );
}
