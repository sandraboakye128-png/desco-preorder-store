import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Cart() {
  const cartContext = useCart();

  const cart = cartContext?.cart || [];
  const removeFromCart = cartContext?.removeFromCart || (() => {});
  const totalPrice = cartContext?.totalPrice || 0;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-desco mb-6">Your Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white p-4 rounded shadow mb-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    item.image?.startsWith("http")
                      ? item.image
                      : `${import.meta.env.VITE_API_URL}${item.image}`
                  }
                  alt={item.name}
                  className="h-16 w-16 object-contain"
                />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-desco font-bold">₵{item.price.toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-600 font-bold"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="bg-white p-4 rounded shadow mt-4 flex justify-between items-center">
            <p className="font-bold text-lg">Total: ₵{totalPrice.toLocaleString()}</p>
            <Link
              to="/checkout"
              className="bg-desco text-white px-6 py-2 rounded"
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
