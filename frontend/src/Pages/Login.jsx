import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "../../../frontend/src/Components/Footer"; // Adjust if needed
import Scrollbar from "../Components/ScrollBar";
import bgImage from "../assets/background.png"; // Make sure this image exists
import axios from "axios";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    // Handle login logic here
    axios
      .post("http://localhost:8000/authentication/login/", {
        email: email,
        password: password,
      })
      .then((res) => {
        alert("true: " + res.data.user.email); // ✅ backend msg
        navigate("/dashboard");
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.error || "Unknown error";
        console.error(errorMsg);
        alert("false: " + errorMsg); // ✅ shows backend error
      });
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Scrollbar />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur bg-[#00031c]/60 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="text-xl font-bold text-gray-300 hover:text-white transition cursor-pointer"
              onClick={() => navigate("/")}
            >
              BrandFlow
            </div>
          </div>
        </div>
      </header>

      {/* Background + Login */}
      <div
        className="relative flex-grow min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundColor: "#00031c", // fallback if image fails
        }}
      >
        <main className="relative z-10 flex justify-center items-center min-h-screen bg-[#00031c]/70 backdrop-blur-sm pt-24 px-4">
          <motion.div
            className="w-full max-w-md bg-[#0a0f2b] p-6 border border-gray-700 rounded-lg shadow-lg"
            initial="hidden"
            animate="show"
            variants={fadeInUp}
          >
            <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-[#1a1f3c] text-white border border-gray-600 focus:outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-[#1a1f3c] text-white border border-gray-600 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Sign In
              </button>
            </form>

            <p className="mt-4 text-sm text-center text-gray-400">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="text-blue-500 hover:underline cursor-pointer"
              >
                Create one
              </span>
            </p>
          </motion.div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
