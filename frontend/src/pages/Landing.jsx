import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch from live backend using environment variable
  const API = import.meta.env.VITE_API_URL || "https://desco-preorder-store.onrender.com";

  useEffect(() => {
    const fetchLandingImages = async () => {
      try {
        const res = await fetch(`${API}/api/landing-images`);
        const data = await res.json();
        setImages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Landing images fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingImages();
  }, [API]);

  const heroImage = images.length > 0 ? images[0].image : null;

  // Cards content
  const processSteps = [
    {
      title: "Secure Your Item with Full Payment",
      desc: "Pay the full product price at checkout to reserve your product in the upcoming batch."
    },
    {
      title: "Shipping Timeline",
      desc: "We commit to under 60 days from pre-order payment to when the product leaves our warehouse. You will receive updates via email or phone call."
    },
    {
      title: "Delivery",
      desc: "A small shipping fee is applied once the product arrives at our fulfillment center. Your order will be dispatched after payment."
    }
  ];

  const keyPoints = [
    "Product is reserved only after full payment at checkout.",
    "Estimated wait is under two months from order to shipment.",
    "Shipping fee is paid separately once product is ready.",
    "You will receive notifications at every major step via email or SMS."
  ];

  return (
    <div className="flex flex-col min-h-screen bg-desco-light">
      <main className="flex-1 flex flex-col items-center px-4 py-6 max-w-6xl mx-auto">
        {/* HERO IMAGE */}
        {heroImage && (
          <div className="w-full mb-6">
            <img
              src={heroImage}
              alt="DESCO Landing"
              className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* STORE TITLE */}
        <h1 className="text-3xl sm:text-4xl font-bold text-desco mb-4 text-center">
          Welcome to Desco Preorder Store
        </h1>

        <p className="text-gray-700 text-center text-base sm:text-lg mb-6 max-w-3xl">
          Quality home appliances on preorder. Explore top categories and order with ease. Our pre-order system ensures fair access, accurate inventory planning, and timely delivery.
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <button
            onClick={() => navigate("/register")}
            className="bg-desco hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition-transform hover:scale-105"
          >
            Sign Up
          </button>
          <button
            onClick={() => navigate("/login")}
            className="bg-white border border-desco text-desco px-6 py-3 rounded-lg shadow-lg transition-transform hover:scale-105"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/home")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg transition-transform hover:scale-105"
          >
            🛒 Shop Now
          </button>
        </div>

        {/* PRE-ORDER PROCESS STEPS */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {processSteps.map((step, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow p-5 flex flex-col gap-2">
              <h3 className="font-bold text-lg text-blue-700">{step.title}</h3>
              <p className="text-gray-700 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* KEY POINTS */}
        <div className="w-full bg-white rounded-xl shadow p-5 mb-8">
          <h3 className="font-bold text-lg text-blue-700 mb-3">Key Points to Remember</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
            {keyPoints.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>

        {/* ACCOUNT DASHBOARD */}
        <div className="w-full bg-white rounded-xl shadow p-5 mb-8">
          <h3 className="font-bold text-lg text-blue-700 mb-3">Your Account Dashboard</h3>
          <p className="text-gray-700 text-sm">
            After signing up or logging in, you can track all your pre-orders and know the current status of your products until they arrive.
          </p>
        </div>

        {/* READY TO GET STARTED */}
        <div className="w-full bg-white rounded-xl shadow p-5 mb-12 text-center">
          <h3 className="font-bold text-lg text-blue-700 mb-3">Ready to Get Started?</h3>
          <p className="text-gray-700 text-sm mb-4">
            Sign up for a new account or log in to securely place your pre-orders and manage your reservations effortlessly.
          </p>
          <p className="text-gray-700 text-sm font-semibold">With Desco Imports — Happy Shopping!</p>
        </div>
      </main>
    </div>
  );
}
