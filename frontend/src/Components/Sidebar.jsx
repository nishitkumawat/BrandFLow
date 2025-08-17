import React from "react";
import {
  Home,
  Users,
  Bell,
  Layers,
  FileText,
  Calendar,
  Briefcase,
  DollarSign,
  LogOut,
  Building2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // localStorage.clear(); // Uncomment if needed
    navigate("/");
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-[#0a0f2b] shadow-lg text-white z-40">
      <div className="text-white text-xl font-semibold p-5 border-b border-gray-700">
        BrandFlow
      </div>

      <nav className="px-4 py-5 text-sm">
        <div className="mb-6 mt-6">
          <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            Core Modules
          </h3>
          <ul className="space-y-2">
            <li className="pl-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-2 py-1 hover:text-blue-400 transition"
              >
                <Home size={16} /> Home
              </Link>
            </li>
            <li className="pl-2">
              <Link
                to="/employees"
                className="flex items-center gap-2 px-2 py-1 hover:text-blue-400 transition"
              >
                <Users size={16} /> Employee Management
              </Link>
            </li>
            <li className="pl-2">
              <Link
                to="/notification"
                className="flex items-center gap-2 px-2 py-1 hover:text-blue-400 transition"
              >
                <Bell size={16} /> Notification System
              </Link>
            </li>
            <li className="pl-2">
              <Link
                to="/teams"
                className="flex items-center gap-2 px-2 py-1 hover:text-blue-400 transition"
              >
                <Layers size={16} /> Teams & Task Tracking
              </Link>
            </li>
            <li className="pl-2">
              <Link
                to="/documents"
                className="flex items-center gap-2 px-2 py-1 hover:text-blue-400 transition"
              >
                <FileText size={16} /> Document Management
              </Link>
            </li>
          </ul>
        </div>

        <div className="mb-6 pt-10">
          <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            Utilities & Tools
          </h3>
          <ul className="space-y-2">
            <li className="pl-2">
              <Link
                to="/marketing"
                className="flex items-center gap-2 px-2 py-1 hover:text-blue-400 transition"
              >
                <Calendar size={16} /> Marketing
              </Link>
            </li>
            <li className="pl-2">
              <Link
                to="/clients"
                className="flex items-center gap-2 px-2 py-1 hover:text-blue-400 transition"
              >
                <Briefcase size={16} /> Client Management
              </Link>
            </li>
            <li className="pl-2">
              <Link
                to="/budgeting"
                className="flex items-center gap-2 px-2 py-1 hover:text-blue-400 transition"
              >
                <DollarSign size={16} /> Budget & Expenses
              </Link>
            </li>
            <li className="pl-2">
              <Link
                to="/company"
                className="flex items-center gap-2 px-2 py-1 hover:text-blue-400 transition"
              >
                <Building2 size={16} /> Company Profile
              </Link>
            </li>
          </ul>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-2 py-1 text-red-400 hover:text-red-500 transition text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
