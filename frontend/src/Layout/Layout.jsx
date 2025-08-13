import React from "react";
import Sidebar from "../Components/Sidebar";

const Layout = ({ children, title, icon: Icon }) => {
  return (
    <div className="flex">
      {/* Sidebar stays fixed on the left */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-64 w-full min-h-screen bg-[#00031c] pt-24 p-6 text-white">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          {Icon && <Icon size={28} className="text-blue-400" />}
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>

        {/* Page Body */}
        {children}
      </div>
    </div>
  );
};

export default Layout;
