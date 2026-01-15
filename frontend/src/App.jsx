import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Purchases from "./pages/Purchases";
import About from "./pages/About";
import Admin from "./pages/Admin";
import ContactStaff from "./pages/ContactStaff";
import OrderSuccess from "./pages/OrderSuccess"; // ✅ ADDED
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import AdminGuard from "./routes/AdminGuard";

function App() {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/success" element={<OrderSuccess />} /> {/* ✅ FIX */}

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <Admin />
                </AdminGuard>
              }
            />

            <Route path="/profile" element={<Profile />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact-staff" element={<ContactStaff />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}

export default App;
