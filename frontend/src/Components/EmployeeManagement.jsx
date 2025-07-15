import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import { Users, PlusCircle } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const roles = ["Developer", "Designer", "Manager", "Analyst", "Support"];

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    experience: "",
    joining_date: "",
    salary: "",
    email: "", // Added email field
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:8000/dashboard/employees/");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, role, experience, joining_date, salary, email } = formData;
    if (!name || !role || !experience || !joining_date || !salary || !email)
      return;

    try {
      await axios.post("http://localhost:8000/dashboard/employees/", formData);
      setFormData({
        name: "",
        role: "",
        experience: "",
        joining_date: "",
        salary: "",
        email: "",
      });
      fetchEmployees();
    } catch (err) {
      console.error("Error adding employee:", err);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full min-h-screen bg-[#00031c] pt-24 p-6 text-white">
        <motion.div initial="hidden" animate="show" variants={fadeInUp}>
          <div className="flex items-center gap-3 mb-8">
            <Users size={28} className="text-blue-400" />
            <h1 className="text-3xl font-bold">Employee Management</h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mb-8 p-4 bg-[#0a0f2b] border border-gray-700 rounded-xl grid sm:grid-cols-3 gap-4"
          >
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="experience"
              placeholder="Experience (years)"
              value={formData.experience}
              onChange={handleInputChange}
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
              min="0"
            />
            <input
              type="date"
              name="joining_date"
              value={formData.joining_date}
              onChange={handleInputChange}
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
            />
            <input
              type="number"
              name="salary"
              placeholder="Salary"
              value={formData.salary}
              onChange={handleInputChange}
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
            />
            <button
              type="submit"
              className="col-span-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} /> Add Employee
            </button>
          </form>

          <h2 className="text-xl font-semibold mb-4">All Employees</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="bg-[#0a0f2b] border border-gray-700 rounded-lg p-4 hover:border-white transition"
              >
                <h3 className="text-lg font-medium text-white">{emp.name}</h3>
                <p className="text-sm text-gray-400">Role: {emp.role}</p>
                <p className="text-sm text-gray-400">
                  Experience: {emp.experience} years
                </p>
                <p className="text-sm text-gray-400">
                  Joining Date: {emp.joining_date}
                </p>
                <p className="text-sm text-gray-400">Salary: ₹{emp.salary}</p>
                <p className="text-sm text-gray-400">Email: {emp.email}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeManagement;
