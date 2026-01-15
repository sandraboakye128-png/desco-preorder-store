import { Navigate } from "react-router-dom";

const ADMIN_PANEL_PASSWORD = "desco-admin-2026";

export default function AdminGuard({ children }) {
  const unlocked = sessionStorage.getItem("admin_unlocked");

  if (unlocked !== "true") {
    const input = prompt("🔐 Enter Admin Panel Password");

    if (input === ADMIN_PANEL_PASSWORD) {
      sessionStorage.setItem("admin_unlocked", "true");
      return children;
    } else {
      alert("❌ Wrong admin password");
      return <Navigate to="/" />;
    }
  }

  return children;
}
