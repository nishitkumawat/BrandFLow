import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import ScrollBar from "../Components/ScrollBar";
import {
  PlusCircle,
  MinusCircle,
  DollarSign,
  Loader2,
  Wallet,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const api = axios.create({
  baseURL: "http://localhost:8000/dashboard",
  headers: {
    "Content-Type": "application/json",
  },
});

const Budget = () => {
  const [summary, setSummary] = useState({});
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/budget-summary/");
      setSummary(res.data);

      // 👇 Pre-fill input field with current budget
      if (res.data.budget !== undefined) {
        setAmount(res.data.budget.toString());
      }
    } catch (err) {
      console.error("Error fetching budget summary:", err);
      alert("Failed to fetch budget summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const updateBudget = async (action) => {
    if (!amount) return;
    setIsSubmitting(true);
    try {
      let payload = { action, amount: parseFloat(amount) };

      await api.post("/budget-update/", payload);
      setAmount("");
      fetchSummary();
    } catch (err) {
      console.error("Error updating budget:", err);
      alert("Failed to update budget. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="flex">
      <Sidebar /><ScrollBar />
      <div className="ml-64 w-full min-h-screen bg-[#00031c] pt-24 p-6 text-white">
        <motion.div initial="hidden" animate="show" variants={fadeInUp}>
          {/* Page Title */}
          <div className="flex items-center gap-3 mb-8">
            <Wallet size={28} className="text-green-400" />
            <h1 className="text-3xl font-bold">Budget & Expenses</h1>
          </div>

          {/* Budget Control */}
          <div className="flex items-center gap-3">
            <input
              type="number"
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none w-40"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              onClick={() => updateBudget("increase")}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded flex items-center gap-2 transition"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <PlusCircle size={18} />
              )}
              Increase
            </button>
            <button
              onClick={() => updateBudget("decrease")}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2 transition"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <MinusCircle size={18} />
              )}
              Decrease
            </button>
            <button
              onClick={() => updateBudget("update")}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2 transition"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <DollarSign size={18} />
              )}
              Update
            </button>
          </div>

          {/* Expenses Summary */}
          <h2 className="text-xl font-semibold mb-4">Expense Breakdown</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin text-green-400" size={32} />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-[#0a0f2b] border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white">Salaries</h3>
                <p className="text-gray-300 text-xl">
                  ₹{summary.salaries || 0}
                </p>
              </div>
              <div className="bg-[#0a0f2b] border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white">
                  Project Expenses
                </h3>
                <p className="text-gray-300 text-xl">
                  ₹{summary.project_expenses || 0}
                </p>
              </div>
              <div className="bg-[#0a0f2b] border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white">
                  Total Expenses
                </h3>
                <p className="text-gray-300 text-xl">
                  ₹{summary.total_expenses || 0}
                </p>
              </div>
            </div>
          )}

          {/* Remaining Budget */}
          <div
            className={`mt-6 p-6 rounded-xl text-xl font-bold flex items-center gap-2 ${
              (summary.remaining || 0) < 0 ? "bg-red-600" : "bg-green-600"
            }`}
          >
            <DollarSign />
            Remaining: ₹{summary.remaining || 0}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Budget;
