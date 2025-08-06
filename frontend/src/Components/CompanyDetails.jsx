import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Sidebar from "../Components/Sidebar";
import { Briefcase } from "lucide-react";

const CompanyPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    company_name: "",
    phone_no: "",
    company_phone_no: "",
    company_address: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/company/",
        formData
      );
      setMessage("✅ Company data submitted successfully.");
      setFormData({
        email: "",
        username: "",
        company_name: "",
        phone_no: "",
        company_phone_no: "",
        company_address: "",
      });
    } catch (error) {
      setMessage("❌ Failed to submit company data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full min-h-screen bg-[#00031c] pt-24 p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Briefcase size={28} className="text-yellow-400" />
            <h1 className="text-3xl font-bold">Company Profile</h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid sm:grid-cols-2 gap-4 bg-[#0a0f2b] p-6 rounded-xl border border-gray-700"
          >
            {[
              { label: "Email", name: "email" },
              { label: "Username", name: "username" },
              { label: "Company Name", name: "company_name" },
              { label: "Phone Number", name: "phone_no" },
              { label: "Company Phone Number", name: "company_phone_no" },
              { label: "Company Address", name: "company_address" },
            ].map(({ label, name }) => (
              <div key={name} className="col-span-1">
                <label className="block text-sm text-gray-300 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#1a1f3c] border border-gray-600 rounded p-2 text-white focus:outline-none"
                />
              </div>
            ))}

            <div className="col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white transition"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>

            {message && (
              <div className="col-span-2 text-green-400 font-medium mt-2 text-center">
                {message}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyPage;
