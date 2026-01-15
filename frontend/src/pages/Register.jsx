import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        // 🔥 THIS MUST MATCH YOUR DATABASE COLUMN
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError("Server not responding.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-700">
          DESCO Preorder
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Create your account to start shopping
        </p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-blue-200 p-2 mb-3 rounded focus:outline-blue-500"
            required
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-blue-200 p-2 mb-3 rounded focus:outline-blue-500"
            required
          />

          <div className="relative mb-3">
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-blue-200 p-2 rounded pr-14 focus:outline-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-2 text-sm text-blue-600"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
          >
            Create Account
          </button>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          {success && <p className="text-green-600 text-sm mt-3">{success}</p>}
        </form>

        <p className="text-center text-sm mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
