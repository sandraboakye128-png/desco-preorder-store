import React, { useEffect, useState } from "react";

/* ================= PASSWORD CONFIG ================= */
const ADMIN_PANEL_PASSWORD = "desco-admin-2026";

export default function Admin() {
  const API = import.meta.env.VITE_API_URL || "https://desco-preorder-store.onrender.com";
  const token = localStorage.getItem("token");

  /* ================= PASSWORD UNLOCK ================= */
  const [unlocked, setUnlocked] = useState(
    sessionStorage.getItem("admin_unlocked") === "true"
  );
  useEffect(() => {
    if (!unlocked) {
      const input = prompt("🔐 Enter Admin Panel Password");
      if (input === ADMIN_PANEL_PASSWORD) {
        sessionStorage.setItem("admin_unlocked", "true");
        setUnlocked(true);
      } else {
        alert("❌ Wrong admin password");
        window.location.href = "/";
      }
    }
  }, [unlocked]);

  if (!unlocked) return null;

  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [landingImages, setLandingImages] = useState([]);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    images: [],
  });
  const [previews, setPreviews] = useState([]);
  const [landingFile, setLandingFile] = useState(null);

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

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchLandingImages();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch(`${API}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  };
  const fetchOrders = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No admin token found");
      setOrders([]);
      return;
    }

    const res = await fetch(`${API}/api/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status}`);
    }

    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Admin orders fetch error:", err);
    setOrders([]);
  }
};


  const fetchLandingImages = async () => {
    const res = await fetch(`${API}/api/landing-images`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setLandingImages(Array.isArray(data) ? data : []);
  };

  /* ================= HELPERS ================= */
  const formatNumber = (n) =>
    !isNaN(Number(n)) ? `₵${Number(n).toLocaleString()}` : "₵0";

  /* ================= PRODUCT FORM ================= */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setForm({ ...form, images: files });
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) return alert("Fill all fields");

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("price", form.price);
    fd.append("category", form.category);
    form.images.forEach((img) => fd.append("images", img));

    const url = editing ? `${API}/api/products/${editing}` : `${API}/api/products`;

    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      body: fd,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return alert("Failed to save product");

    resetForm();
    fetchProducts();
  };

  const resetForm = () => {
    setForm({ name: "", price: "", category: "", images: [] });
    setEditing(null);
    setPreviews([]);
  };

  const editProduct = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, price: p.price, category: p.category, images: [] });
    setPreviews([p.image1, p.image2, p.image3].filter(Boolean));
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return;
    await fetch(`${API}/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
  };

  /* ================= LANDING IMAGES ================= */
  const uploadLandingImage = async () => {
    if (!landingFile) return alert("Select image");
    const fd = new FormData();
    fd.append("image", landingFile);
    const res = await fetch(`${API}/api/landing-images`, {
      method: "POST",
      body: fd,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return alert("Failed to upload image");
    setLandingFile(null);
    fetchLandingImages();
  };

  const deleteLandingImage = async (id) => {
    if (!window.confirm("Delete image?")) return;
    await fetch(`${API}/api/landing-images/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchLandingImages();
  };

  /* ================= ORDERS ================= */
  const completeOrder = async (id) => {
    await fetch(`${API}/api/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "completed" }),
    });
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Delete order?")) return;
    await fetch(`${API}/api/orders/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchOrders();
  };

  const downloadInvoice = async (id) => {
    try {
      const res = await fetch(`${API}/api/orders/${id}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Invoice download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Desco-Invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download invoice");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-desco-light min-h-screen space-y-10">
      <h1 className="text-3xl font-bold text-desco">🔐 DESCO Admin Dashboard</h1>

      {/* ===== PRODUCTS ===== */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="font-bold mb-4 text-desco">Add / Edit Product</h2>
        <form
          onSubmit={handleSubmitProduct}
          className="grid md:grid-cols-4 gap-3"
        >
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border p-2 rounded"
            required
          >
            <option value="">Select Category</option>
            {categories.slice(1).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />

          {previews.length > 0 && (
            <div className="flex gap-2 col-span-full flex-wrap">
              {previews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  className="h-20 w-20 object-cover rounded border"
                />
              ))}
            </div>
          )}

          <button className="bg-desco text-white px-4 py-2 rounded col-span-full">
            {editing ? "Update Product" : "Add Product"}
          </button>
        </form>

        {/* Product Table */}
        <div className="mt-6">
          <h3 className="font-bold mb-2 text-desco">All Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-desco-light text-desco-dark">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Images</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="text-center border">
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{formatNumber(p.price)}</td>
                    <td>{p.category}</td>
                    <td className="flex justify-center gap-1">
                      {[p.image1, p.image2, p.image3].map((img, i) => (
                        <img
                          key={i}
                          src={img || "https://via.placeholder.com/80"}
                          className="h-16 w-16 object-cover rounded border"
                        />
                      ))}
                    </td>
                    <td className="flex justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => editProduct(p)}
                        className="bg-desco text-white px-2 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="bg-red-600 text-white px-2 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== LANDING IMAGES ===== */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="font-bold mb-4 text-desco">Landing Page Images</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="file"
            onChange={(e) => setLandingFile(e.target.files[0])}
          />
          <button
            onClick={uploadLandingImage}
            className="bg-desco text-white px-4 py-2 rounded"
          >
            Upload
          </button>
        </div>

        {landingFile && (
          <div className="inline-block mb-2">
            <img
              src={URL.createObjectURL(landingFile)}
              className="h-24 w-24 object-cover rounded border"
            />
            <button
              onClick={() => setLandingFile(null)}
              className="bg-red-600 text-white px-2 rounded ml-2"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          {landingImages.map((img) => (
            <div key={img.id} className="relative">
              <img
                src={img.image}
                className="h-24 w-full object-cover rounded border"
              />
              <button
                onClick={() => deleteLandingImage(img.id)}
                className="absolute top-1 right-1 bg-red-600 text-white px-2 rounded"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ===== ORDERS ===== */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="font-bold mb-4 text-desco">Customer Orders</h2>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-desco-light text-desco-dark">
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Products</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border text-center">
                    <td>{o.id}</td>
                    <td>{o.full_name}</td>
                    <td>{o.phone}</td>
                    <td>{o.delivery_address}</td>
                    <td className="text-left">
                      {o.products?.map((p, i) => (
                        <div key={i}>
                          {p.name} × {p.quantity} @ {formatNumber(p.price)}
                        </div>
                      ))}
                    </td>
                    <td>{formatNumber(o.total_price)}</td>
                    <td>{o.status}</td>
                    <td className="flex flex-wrap gap-1 justify-center">
                      {o.status !== "completed" && (
                        <button
                          onClick={() => completeOrder(o.id)}
                          className="bg-green-600 text-white px-2 rounded"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => deleteOrder(o.id)}
                        className="bg-red-600 text-white px-2 rounded"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => downloadInvoice(o.id)}
                        className="bg-desco text-white px-2 rounded"
                      >
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
