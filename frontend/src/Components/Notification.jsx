import React, { useState, useEffect } from "react";
import Layout from "../Layout/Layout";
import { Bell } from "lucide-react";
import axios from "axios";

const roles = ["All", "Developer", "Designer", "Manager", "Analyst", "Support"];

const Notification = () => {
  const [formData, setFormData] = useState({
    selectedRole: "All",
    minSalary: "",
    maxSalary: "",
    subject: "",
    message: "",
    important: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:8000/dashboard/send-notification/",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      alert("Email sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send email.");
    }
  };

  return (
    <Layout title="Notification System" icon={Bell}>
      <form
        onSubmit={handleSubmit}
        className="bg-[#0a0f2b] border border-gray-700 rounded-xl p-6 grid sm:grid-cols-2 gap-4"
      >
        <select
          name="selectedRole"
          value={formData.selectedRole}
          onChange={handleChange}
          className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="minSalary"
          placeholder="Min Salary"
          value={formData.minSalary}
          onChange={handleChange}
          className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600"
        />

        <input
          type="number"
          name="maxSalary"
          placeholder="Max Salary"
          value={formData.maxSalary}
          onChange={handleChange}
          className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600"
        />

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 col-span-full"
        />

        <textarea
          name="message"
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
          className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 col-span-full h-32"
        />

        <label className="flex items-center gap-2 text-gray-300 col-span-full">
          <input
            type="checkbox"
            name="important"
            checked={formData.important}
            onChange={handleChange}
          />
          Mark as Important
        </label>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 py-2 rounded text-white col-span-full"
        >
          Send Notification
        </button>
      </form>
    </Layout>
  );
};

export default Notification;
