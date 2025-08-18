import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import { File, Upload, Trash2, Download } from "lucide-react";
import ScrollBar from "../Components/ScrollBar";

const API_BASE = "http://127.0.0.1:8000"; // backend API base

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  // Fetch documents
  const fetchDocs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/utilities/documents/`);
      setDocuments(res.data);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Upload document
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    try {
      await axios.post(`${API_BASE}/utilities/documents/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTitle("");
      setDescription("");
      setFile(null);
      fetchDocs();
    } catch (err) {
      console.error("Error uploading document:", err);
    }
  };

  // Delete document
  const deleteDoc = async (id) => {
    try {
      await axios.delete(`${API_BASE}/utilities/documents/${id}/`);
      fetchDocs();
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  return (
    <div className="flex">
      <Sidebar /><ScrollBar />
      <div className="ml-64 w-full min-h-screen bg-[#00031c] pt-24 p-6 text-white">
        <motion.div initial="hidden" animate="show" variants={fadeInUp}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <File size={28} className="text-blue-400" />
            <h1 className="text-3xl font-bold">Document Management</h1>
          </div>

          {/* Upload Form */}
          <form
            onSubmit={handleUpload}
            className="mb-8 p-4 bg-[#0a0f2b] border border-gray-700 rounded-xl grid sm:grid-cols-3 gap-4"
          >
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
            />
            <button
              type="submit"
              className="col-span-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Upload size={18} /> Upload Document
            </button>
          </form>

          {/* Documents List */}
          <h2 className="text-xl font-semibold mb-4">All Documents</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="relative bg-[#0a0f2b] border border-gray-700 rounded-lg p-4 hover:border-white transition"
              >
                {/* Delete Button at Top Right */}
                <button
                  onClick={() => deleteDoc(doc.id)}
                  className="absolute top-4 right-4 text-red-400 hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>

                <h3 className="text-lg font-medium flex items-center gap-2">
                  <File size={18} className="text-blue-400" /> {doc.title}
                </h3>
                <p className="text-sm text-gray-400">{doc.description}</p>
                <a
                  href={`${API_BASE}${doc.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 mt-2"
                >
                  <Download size={16} /> Download
                </a>

                {/* Versions */}
                {doc.versions?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500">Versions:</p>
                    <ul className="list-disc ml-4 text-sm">
                      {doc.versions.map((v) => (
                        <li key={v.id}>
                          <a
                            href={`${API_BASE}${v.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400"
                          >
                            Version {v.id} –{" "}
                            {new Date(v.uploaded_at).toLocaleString()}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
