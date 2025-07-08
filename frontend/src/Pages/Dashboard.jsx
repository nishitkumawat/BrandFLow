import React from "react";
import Sidebar from "../Components/Sidebar";
import Footer from "../Components/Footer";
import { motion } from "framer-motion";

const Dashboard = () => {
  const features = [
    {
      title: "Employee Management",
      desc: "Manage employee records and performance.",
    },
    { title: "Notification System", desc: "Stay informed with timely alerts." },
    {
      title: "Teams & Task Tracking",
      desc: "Organize tasks and collaborate in teams.",
    },
    {
      title: "Document & Asset Management",
      desc: "Store, share, and secure documents.",
    },
    {
      title: "Calendar Integration",
      desc: "Schedule meetings and sync with calendars.",
    },
    {
      title: "Client Management",
      desc: "Track client interactions and relationships.",
    },
    {
      title: "Budgeting & Expense Tracking",
      desc: "Monitor expenses and plan budgets.",
    },
  ];

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
            Manage your workforce, streamline operations, and make smarter
            decisions from one centralized dashboard.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="p-6 bg-[#0a0f2b] border border-gray-700 rounded-xl hover:border-blue-500 hover:shadow-[0_0_10px_2px_rgba(59,130,246,0.2)] transition"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-2">{feature.title}</h2>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="pl-64">
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
