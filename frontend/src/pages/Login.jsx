import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState("");
  const navigate = useNavigate();

  // ✅ Use live API URL from environment variable
  const API = import.meta.env.VITE_API_URL || "https://desco-preorder-store.onrender.com";

  // Set welcome message based on logged-in user
  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      const u = JSON.parse(user);
      setWelcomeMsg(`Welcome back, ${u.name}! Continue shopping with DESCO.`);
    } else {
      setWelcomeMsg("Login to manage your preorders and shop quality home appliances.");
    }
  }, []);

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Save user and token to localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token || "");
      localStorage.setItem("is_staff", data.user.role === "admin" ? "true" : "false");

      // Redirect to profile
      navigate("/profile");
    } catch (err) {
      console.error("Login fetch error:", err);
      setError("Server not responding.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-700">
          DESCO Preorder
        </h2>

        <p className="text-center text-gray-600 mb-6">{welcomeMsg}</p>

        <form onSubmit={handleLogin}>
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
            Login
          </button>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </form>

        <p className="text-center text-sm mt-5">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
