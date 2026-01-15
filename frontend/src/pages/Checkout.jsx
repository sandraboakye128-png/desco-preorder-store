import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";

export default function Checkout() {
  const { cart, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();

  // ✅ Use live backend from env
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    delivery_address: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      alert("Please log in to checkout");
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cart || cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    const payload = {
      user_id: user.id,
      full_name: form.full_name,
      phone: form.phone,
      delivery_address: form.delivery_address,
      products: cart.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        quantity: p.quantity || 1,
      })),
      total_price: totalPrice,
    };

    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Checkout failed");
        return;
      }

      clearCart();
      navigate("/success"); // Matches App.jsx route
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Checkout</h1>

      <form className="bg-white p-6 rounded shadow space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={form.full_name}
          required
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={form.phone}
          required
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <textarea
          placeholder="Delivery Address"
          value={form.delivery_address}
          required
          onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <p className="font-bold">Total: ₵{Number(totalPrice).toLocaleString()}</p>
        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
        >
          Place Order
        </button>
      </form>
    </div>
  );
}
