import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-desco-light flex justify-center pt-14 px-4">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-2xl font-bold text-desco mb-6 text-center">
          My Profile
        </h2>

        <div className="space-y-4 text-gray-700">
          <p>
            <span className="font-semibold">Full Name:</span>{" "}
            {user.full_name}
          </p>

          <p>
            <span className="font-semibold">Email:</span>{" "}
            {user.email}
          </p>

          <p>
            <span className="font-semibold">Account Type:</span>{" "}
            {user.role}
          </p>
        </div>

        <div className="mt-8 flex justify-between">
          <Link
            to="/home"
            className="bg-desco text-white px-5 py-2 rounded-lg hover:opacity-90"
          >
            Go to Shop
          </Link>

          <Link
            to="/purchases"
            className="border border-desco text-desco px-5 py-2 rounded-lg hover:bg-desco hover:text-white transition"
          >
            My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;
