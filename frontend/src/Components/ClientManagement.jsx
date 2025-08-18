import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import { Users, PlusCircle, Pencil, Loader2 } from "lucide-react";
import ScrollBar from "../Components/ScrollBar";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    org_name: "",
    contact_number: "",
    email: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editClientId, setEditClientId] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/dashboard/clients/");
      setClients(res.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
      alert("Failed to fetch clients. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isDataUnchanged = () => {
    if (!originalData) return false;
    return Object.keys(formData).every(
      (key) => formData[key] === originalData[key]
    );
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      alert("Email is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const url = "/dashboard/clients/"; // Always POST to the same endpoint

      // Include the client ID in the formData if in edit mode
      const requestData = isEditMode
        ? { ...formData, id: editClientId }
        : formData;

      const response = await api.post(url, requestData);
      console.log("Success:", response.data);

      // Reset form and refresh client list
      setFormData({
        name: "",
        org_name: "",
        contact_number: "",
        email: "",
      });
      setIsEditMode(false);
      setEditClientId(null);
      fetchClients();
    } catch (error) {
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      alert(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEdit = (client) => {
    const data = {
      name: client.name,
      org_name: client.org_name,
      contact_number: client.contact_number,
      email: client.email,
    };
    setFormData(data);
    setOriginalData(data);
    setIsEditMode(true);
    setEditClientId(client.id);
  };

  return (
    <div className="flex">
      <Sidebar /><ScrollBar />
      <div className="ml-64 w-full min-h-screen bg-[#00031c] pt-24 p-6 text-white">
        <motion.div initial="hidden" animate="show" variants={fadeInUp}>
          <div className="flex items-center gap-3 mb-8">
            <Users size={28} className="text-blue-400" />
            <h1 className="text-3xl font-bold">Client Management</h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mb-8 p-4 bg-[#0a0f2b] border border-gray-700 rounded-xl grid sm:grid-cols-2 gap-4"
          >
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
              required
            />
            <input
              type="text"
              name="org_name"
              placeholder="Organization Name"
              value={formData.org_name}
              onChange={handleInputChange}
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
            />
            <input
              type="text"
              name="contact_number"
              placeholder="Contact Number"
              value={formData.contact_number}
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
              required
            />

            <button
              type="submit"
              disabled={isSubmitting || isDataUnchanged()}
              className={`col-span-full py-2 rounded transition flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Processing...
                </>
              ) : (
                <>
                  <PlusCircle size={18} />
                  {isEditMode ? "Update Client" : "Add Client"}
                </>
              )}
            </button>
          </form>

          <h2 className="text-xl font-semibold mb-4">All Clients</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin text-blue-400" size={32} />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="relative bg-[#0a0f2b] border border-gray-700 rounded-lg p-4 hover:border-white transition"
                >
                  <button
                    onClick={() => handleEdit(client)}
                    className="absolute top-4 right-4 text-blue-400 hover:text-blue-500"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>

                  <h3 className="text-lg font-medium text-white">
                    {client.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Organization: {client.org_name}
                  </p>
                  <p className="text-sm text-gray-400">
                    Contact: {client.contact_number}
                  </p>
                  <p className="text-sm text-gray-400">Email: {client.email}</p>
                  <p className="text-sm text-gray-400">
                    Project: {client.project || "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ClientManagement;
