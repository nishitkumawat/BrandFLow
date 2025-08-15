import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import { Users, PlusCircle, Pencil } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

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

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get("http://localhost:8000/dashboard/clients/");
      setClients(res.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const isDataUnchanged = () => {
    if (!originalData) return false;
    return Object.keys(formData).every(
      (key) => formData[key] === originalData[key]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, org_name, contact_number, email } = formData;

    if (!name || !org_name || !contact_number || !email) {
      alert("Please fill in all fields.");
      return;
    }

    if (isEditMode && isDataUnchanged()) {
      alert(
        "No changes detected. Please update some fields before submitting."
      );
      return;
    }

    try {
      const payload = { ...formData };

      if (isEditMode && editClientId) {
        payload.id = editClientId;
      }

      await axios.post("http://localhost:8000/dashboard/clients/", payload);

      setFormData({
        name: "",
        org_name: "",
        contact_number: "",
        email: "",
      });
      setIsEditMode(false);
      setEditClientId(null);
      setOriginalData(null);
      fetchClients();
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Error submitting the form. Check console for details.");
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
      <Sidebar />
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
            />

            <button
              type="submit"
              className="col-span-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} />
              {isEditMode ? "Update Client" : "Add Client"}
            </button>
          </form>

          <h2 className="text-xl font-semibold mb-4">All Clients</h2>
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
        </motion.div>
      </div>
    </div>
  );
};

export default ClientManagement;
