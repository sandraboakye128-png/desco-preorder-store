import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
        <CheckCircle className="mx-auto text-green-600 w-16 h-16 mb-4" />

        <h1 className="text-2xl font-bold text-desco mb-3">
          Order Placed Successfully 🎉
        </h1>

        <p className="text-gray-700 mb-6 leading-relaxed">
          Thank you for shopping with <strong>DESCO Preorder Store</strong>.
          <br />
          Your order has been received and is currently being processed.
          Our team will contact you shortly to confirm delivery details.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/home")}
            className="bg-desco text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            🛒 Continue Shopping
          </button>

          <button
            onClick={() => navigate("/contact-staff")}
            className="border border-desco text-desco px-6 py-3 rounded-lg hover:bg-desco hover:text-white transition"
          >
            📞 Contact Staff
          </button>
        </div>
      </div>
    </div>
  );
}
