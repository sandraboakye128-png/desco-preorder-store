import { useEffect, useState } from "react";

export default function Purchases() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL ||  "https://desco-preorder-store.onrender.com";
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch(`${API}/api/orders/user/${user.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        else setOrders([]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Orders fetch error:", err);
        setLoading(false);
      });
  }, [API, user]);

  const formatMoney = (amount) => {
    const num = Number(amount);
    return !isNaN(num) ? num.toLocaleString() : "0";
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading your orders...</p>
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Please log in to view your purchases.</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
        My DESCO Purchases
      </h2>

      {orders.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-600">You haven’t placed any preorder yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-600">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono text-xs">{order.id}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    order.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <p className="text-gray-700">
                <strong>Date:</strong>{" "}
                {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
              </p>

              <p className="text-gray-700">
                <strong>Total:</strong>{" "}
                <span className="text-blue-600 font-bold">₵{formatMoney(order.total_price)}</span>
              </p>

              <div className="mt-3">
                <p className="font-semibold text-gray-700 mb-1">Items</p>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {Array.isArray(order.products) && order.products.length > 0 ? (
                    order.products.map((item, i) => (
                      <li key={i}>
                        {item.name} × {item.quantity}
                      </li>
                    ))
                  ) : (
                    <li>No items</li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
