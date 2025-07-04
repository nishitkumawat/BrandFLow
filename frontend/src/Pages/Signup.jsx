import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "../Components/Footer";
import bgImage from "../assets/background.png"; // Ensure path is correct
import Scrollbar from "../Components/ScrollBar";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const Signup = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Scrollbar />
      {/* Background Image Container */}
      <div
        className="relative flex-grow min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundColor: "#00031c",
        }}
      >
        {/* Transparent Blur Layer */}
        <div className="relative z-10 min-h-screen bg-[#00031c]/70 backdrop-blur-sm pt-20  flex flex-col justify-between">
          {/* Brand Name */}
          <div
            className="absolute top-6 left-6 text-xl font-bold text-gray-300 hover:text-white cursor-pointer transition z-50"
            onClick={() => navigate("/")}
          >
            BrandFlow
          </div>

          {/* Signup Form */}
          <div className="flex justify-center items-center flex-1 pb-10">
            {" "}
            {/* Bottom padding added here */}
            <motion.div
              className="w-full max-w-md min-h-[500px] bg-[#0a0f2b] p-6 border border-gray-700 rounded-lg shadow-lg flex flex-col justify-center"
              initial="hidden"
              animate="show"
              variants={fadeInUp}
            >
              <h2 className="text-2xl font-semibold text-center mb-6">
                Create an Account
              </h2>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full px-4 py-2 bg-[#1a1f3c] border border-gray-600 rounded focus:outline-none text-white"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 bg-[#1a1f3c] border border-gray-600 rounded focus:outline-none text-white"
                />
                <input
                  type="password"
                  placeholder="Password"
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

          {/* Footer with no side padding */}
          <div className="px-0">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
