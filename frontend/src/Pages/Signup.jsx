import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Footer from "../Components/Footer";
import Scrollbar from "../Components/ScrollBar";
import bgImage from "../assets/background.png";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    axios
      .post("http://localhost:8000/authentication/signup/", {
        name,
        email,
        password,
      })
      .then((res) => {
        alert("true: " + res.data.message);
        navigate("/dashboard");
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.error || "Signup failed";
        alert("false: " + errorMsg);
      });
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Scrollbar />
      <div
        className="relative flex-grow min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundColor: "#00031c",
        }}
      >
        <div className="relative z-10 min-h-screen bg-[#00031c]/70 backdrop-blur-sm pt-20 flex flex-col justify-between">
          <div
            className="absolute top-6 left-6 text-xl font-bold text-gray-300 hover:text-white cursor-pointer transition z-50"
            onClick={() => navigate("/")}
          >
            BrandFlow
          </div>

          <div className="flex justify-center items-center flex-1 pb-10">
            <motion.div
              className="w-full max-w-md min-h-[500px] bg-[#0a0f2b] p-6 border border-gray-700 rounded-lg shadow-lg flex flex-col justify-center"
              initial="hidden"
              animate="show"
              variants={fadeInUp}
            >
              <h2 className="text-2xl font-semibold text-center mb-6">
                Create an Account
              </h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a1f3c] border border-gray-600 rounded focus:outline-none text-white"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a1f3c] border border-gray-600 rounded focus:outline-none text-white"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a1f3c] border border-gray-600 rounded focus:outline-none text-white"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a1f3c] border border-gray-600 rounded focus:outline-none text-white"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Sign Up
                </button>
              </form>
              <p className="mt-4 text-sm text-center text-gray-400">
                Already have an account?{" "}
                <span
                  className="text-blue-500 hover:underline cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  Log In
                </span>
              </p>
            </motion.div>
          </div>

          <div className="px-0">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
