import { useNavigate } from "react-router-dom";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

export default function ContactStaffPage() {
  const navigate = useNavigate();

  // DESCO staff contact
  const phone = "+233256764450"; // WhatsApp + international
  const localPhone = "+233256764450"; // For tel: link
  const whatsappMessage = encodeURIComponent(
    "Hello DESCO, I need assistance with my order."
  );

  return (
    <div className="max-w-md mx-auto p-6 text-center bg-white shadow-lg rounded mt-8">
      <h2 className="text-2xl font-bold text-desco mb-6">
        Contact DESCO Staff
      </h2>

      <p className="text-gray-700 mb-6">
        Our team is here to help you with any questions or order support.
        Reach out to us via phone or WhatsApp.
      </p>

      <div className="flex flex-col gap-4 mb-6">
        {/* Call Staff Button */}
        <a
          href={`tel:${localPhone}`}
          className="inline-flex items-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 justify-center transition"
        >
          <FaPhoneAlt size={18} />
          Call Staff
        </a>

        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${phone}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 justify-center transition"
        >
          <FaWhatsapp size={22} />
          Chat on WhatsApp
        </a>
      </div>

      <button
        onClick={() => navigate("/")}
        className="bg-yellow-500 text-black py-2 px-6 rounded-lg hover:bg-yellow-600 transition"
      >
        Go Home
      </button>
    </div>
  );
}
