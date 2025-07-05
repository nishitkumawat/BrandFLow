// Dashboard.jsx
import React from "react";
import Sidebar from "../Components/Sidebar";
import Nav from "../Components/Nav";
import Footer from "../Components/Footer";
import { motion } from "framer-motion";

const Dashboard = () => {
  return (
    <div className="bg-[#00031c] min-h-screen text-white pl-64">
      <Sidebar />
      <div className="pt-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-3xl font-bold mb-4">Welcome to Your Dashboard</h1>
          <p className="text-gray-400 max-w-2xl">
            Analyze your team's performance, manage employees, and run marketing
            campaigns—all from one place.
          </p>
        </motion.div>

        {/* Sample Section */}
        <motion.div
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.2 } },
          }}
        >
          {["Team Overview", "Employee Stats", "Marketing Metrics"].map(
            (section, i) => (
              <motion.div
                key={i}
                className="p-6 bg-[#0a0f2b] border border-gray-700 rounded-xl hover:border-blue-500 hover:shadow-[0_0_10px_2px_rgba(59,130,246,0.2)]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
              >
                <h2 className="text-xl font-semibold mb-2">{section}</h2>
                <p className="text-gray-400 text-sm">
                  Insights and analytics about {section.toLowerCase()}.
                </p>
              </motion.div>
            )
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
