"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:4004/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      localStorage.setItem("adminToken", data.token);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-300 via-orange-300 to-pink-300 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md transform transition-all duration-500 hover:scale-105">
        <div className="p-8 md:p-10 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold animate-bounce">
              D
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mt-4">Welcome to Desigih!</h2>
            <p className="text-gray-500 mt-2">Log in to spread some joy!</p>
          </div>
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6 text-center animate-pulse">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition duration-200"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-pink-500 text-white py-3 rounded-xl hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 transition duration-200 font-semibold flex items-center justify-center gap-2"
            >
              <span>Let’s Go!</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Designed with ❤️ by <span className="font-semibold text-pink-500">Desigih</span>
          </p>
        </div>
      </div>
    </div>
  );
}