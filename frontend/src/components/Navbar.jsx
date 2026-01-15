import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Menu, X } from "lucide-react";
import DescoLogo from "../assets/desco-logo.png";

export default function Navbar() {
  const cartContext = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // ---------------------------------
  // SAFE CART NORMALIZATION (🔥 FIX)
  // ---------------------------------
  const cartItems =
    cartContext?.cartItems ||
    cartContext?.cart ||
    [];

  const totalItems = cartItems.reduce(
    (sum, item) => sum + Number(item.qty || item.quantity || 1),
    0
  );

  // ------------------------------
  // User info
  // ------------------------------
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* TOP NAVBAR */}
      <nav className="bg-desco text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center space-x-3">
            <button onClick={() => setMenuOpen(true)} className="focus:outline-none">
              <Menu size={24} />
            </button>

            <Link to="/" className="flex items-center space-x-2">
              <img src={DescoLogo} alt="DESCO" className="h-10 w-auto" />
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-bold tracking-wide">DESCO</span>
                <span className="text-xs opacity-80 -mt-1">Preorder Store</span>
              </div>
            </Link>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-6">
            {!user && (
              <>
                <Link to="/login" className="hover:text-blue-200">Login</Link>
                <Link to="/register" className="hover:text-blue-200">Register</Link>
              </>
            )}

            {user && (
              <>
                <Link to="/profile" className="hover:text-blue-200">Profile</Link>
                <button onClick={handleLogout} className="hover:text-blue-200">
                  Logout
                </button>
              </>
            )}

            {/* ADMIN PANEL */}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="text-yellow-300 font-bold hover:text-yellow-400"
              >
                🔐 Admin Panel
              </Link>
            )}

            {/* CART */}
            <Link to="/cart" className="relative flex items-center hover:text-blue-200">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* MOBILE CART */}
          <div className="md:hidden">
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white text-gray-800 shadow-lg transform transition-transform duration-300 z-50 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-bold text-desco">DESCO Menu</h2>
          <button onClick={() => setMenuOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col px-6 py-6 space-y-4">
          <button
            onClick={() => {
              setMenuOpen(false);
              navigate("/home");
            }}
            className="text-left hover:text-desco"
          >
            🏠 Home
          </button>

          <Link to="/profile" onClick={() => setMenuOpen(false)} className="hover:text-desco">
            👤 Profile
          </Link>

          <Link to="/purchases" onClick={() => setMenuOpen(false)} className="hover:text-desco">
            🛍 Purchases
          </Link>

          <Link to="/contact-staff" onClick={() => setMenuOpen(false)} className="hover:text-desco">
            📞 Contact Staff
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="font-semibold text-desco"
            >
              🔐 Admin Panel
            </Link>
          )}

          <div className="pt-4 border-t"></div>

          {!user && (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="hover:text-desco">
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="hover:text-desco">
                Register
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="text-left text-red-600 hover:underline"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </>
  );
}
