"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Image from "next/image";

export default function AdminDashboard() {
  const [kpis, setKpis] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedUser, setSelectedUser] = useState(null);
  const usersPerPage = 10;
  const router = useRouter();

  // Fallback image (SVG placeholder)
  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e5e7eb'/%3E%3Cpath d='M50 60c-10 0-18-8-18-18s8-18 18-18 18 8 18 18-8 18-18 18zm0-30c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12-5.4-12-12-12z' fill='%236b7280'/%3E%3Cpath d='M70 80H30c-2.2 0-4-1.8-4-4v-4c0-6.6 5.4-12 12-12h24c6.6 0 12 5.4 12 12v4c0 2.2-1.8 4-4 4z' fill='%236b7280'/%3E%3C/svg%3E";

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetch("http://localhost:4004/kpis", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setKpis)
      .catch(() => setError("Failed to load KPIs"));
    fetch("http://localhost:4004/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setError("Failed to load stats"));
    fetch("http://localhost:4004/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => setError("Failed to load users"));
  }, [router]);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-orange-300 to-pink-300 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 text-red-600 text-center animate-pulse">{error}</div>
    </div>
  );
  if (!kpis || !stats) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-orange-300 to-pink-300 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 text-gray-800 text-center animate-pulse">Loading...</div>
    </div>
  );

  // Prepare data for Recharts
  const chartData = stats.uploadsPerDay.map((upload, index) => ({
    day: `Day ${index + 1}`,
    uploads: upload,
    designs: stats.designsPerDay[index],
    users: stats.usersPerDay[index],
  }));

  // Sort and paginate users
  const sortedUsers = [...users].sort((a, b) =>
    sortOrder === "desc" ? b.loginCount - a.loginCount : a.loginCount - b.loginCount
  );
  const totalPages = Math.ceil(users.length / usersPerPage);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleSort = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-orange-300 to-pink-300 flex">
      {/* Sidebar */}
      <div className="w-16 bg-white shadow-lg rounded-r-2xl py-8 flex flex-col items-center space-y-6">
        <div
          className={`p-3 rounded-full cursor-pointer transition-all duration-200 ${
            activeTab === "dashboard" ? "bg-pink-500 text-white" : "text-gray-600 hover:bg-pink-100"
          }`}
          onClick={() => setActiveTab("dashboard")}
          title="Dashboard"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>
        <div
          className={`p-3 rounded-full cursor-pointer transition-all duration-200 ${
            activeTab === "users" ? "bg-pink-500 text-white" : "text-gray-600 hover:bg-pink-100"
          }`}
          onClick={() => setActiveTab("users")}
          title="Users"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {activeTab === "dashboard" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold animate-bounce">
                  D
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mt-4">Desigih Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Keep spreading joy with your insights!</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center transform transition-all duration-300 hover:scale-105 bg-gradient-to-br from-pink-100 to-yellow-100">
                  <div className="text-lg font-semibold text-gray-700">Uploads</div>
                  <div className="text-3xl font-bold text-pink-600">{kpis.uploads}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center transform transition-all duration-300 hover:scale-105 bg-gradient-to-br from-yellow-100 to-orange-100">
                  <div className="text-lg font-semibold text-gray-700">Designs</div>
                  <div className="text-3xl font-bold text-orange-600">{kpis.designs}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center transform transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-100 to-pink-100">
                  <div className="text-lg font-semibold text-gray-700">Users</div>
                  <div className="text-3xl font-bold text-yellow-600">{kpis.users}</div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Stats (Last 7 Days)</h2>
              <div className="bg-white p-6 rounded-2xl shadow-lg bg-gradient-to-br from-gray-50 to-white space-y-8">
                {/* Uploads Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-pink-500 mb-4">Uploads Per Day</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="uploads"
                        stroke="#ec4899"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#ec4899" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Designs Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-orange-500 mb-4">Designs Per Day</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="designs"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#f97316" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Users Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-yellow-500 mb-4">Users Per Day</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#eab308"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#eab308" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {activeTab === "users" && (
            <div className="bg-white p-6 rounded-2xl shadow-lg bg-gradient-to-br from-gray-50 to-white">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">User List</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-700">
                  <thead>
                    <tr className="bg-pink-100">
                      <th className="p-3 rounded-tl-2xl">ID</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Name</th>
                      <th className="p-3 cursor-pointer" onClick={handleSort}>
                        Login Count {sortOrder === "desc" ? "↓" : "↑"}
                      </th>
                      <th className="p-3">Created At</th>
                      <th className="p-3">Updated At</th>
                      <th className="p-3 rounded-tr-2xl">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-gray-200 hover:bg-pink-50 transition-all duration-200"
                      >
                        <td className="p-3">{user._id.slice(0, 8)}...</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">{user.name}</td>
                        <td className="p-3">{user.loginCount}</td>
                        <td className="p-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">{new Date(user.updatedAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-pink-500 hover:text-pink-600 transition-all duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-pink-500 text-white rounded-xl disabled:bg-gray-300 hover:bg-pink-600 transition-all duration-200"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-pink-500 text-white rounded-xl disabled:bg-gray-300 hover:bg-pink-600 transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* User Details Modal */}
          {selectedUser && (
            <>
              {/* Overlay with lower opacity */}
              <div className="fixed inset-0 bg-gray-900 bg-opacity-30 z-40 transition-opacity duration-300" />
              <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 transform transition-all duration-300 scale-100 animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">User Details</h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-500 hover:text-gray-700 transition-all duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <div className="flex justify-center">
                      <Image
                        src={selectedUser.image || fallbackImage}
                        alt={`${selectedUser.name}'s profile picture`}
                        width={100}
                        height={100}
                        className="rounded-full shadow-md hover:scale-105 transition-all duration-200"
                        onError={(e) => (e.target.src = fallbackImage)}
                      />
                    </div>
                    <p><span className="font-semibold text-pink-500">ID:</span> {selectedUser._id}</p>
                    <p><span className="font-semibold text-pink-500">Email:</span> {selectedUser.email}</p>
                    <p><span className="font-semibold text-pink-500">Name:</span> {selectedUser.name}</p>
                    <p><span className="font-semibold text-pink-500">Login Count:</span> {selectedUser.loginCount}</p>
                    <p><span className="font-semibold text-pink-500">Created At:</span> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                    <p><span className="font-semibold text-pink-500">Updated At:</span> {new Date(selectedUser.updatedAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="mt-6 w-full bg-pink-500 text-white py-3 rounded-xl hover:bg-pink-600 transition-all duration-200 font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}

          <p className="text-center text-sm text-gray-600 mt-8">
            Designed with ❤️ by <span className="font-semibold text-pink-500">Desigih</span>
          </p>
        </div>
      </div>
    </div>
  );
}