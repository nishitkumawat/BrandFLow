import React from "react";

const navItems = ["Home", "About", "Help Center", "Pricing"];

const Nav = () => {
  return (
    <header
      className="fixed top-0 left-0 w-full shadow z-50 transition-all duration-400"
      style={{ backgroundColor: "#00031c" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="text-xl font-bold text-gray-300 hover:text-white transition">
            BrandFlow
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-10">
            {navItems.map((item, i) => (
              <a
                key={i}
                href="#"
                className="group relative text-gray-400 hover:text-white transition duration-500"
              >
                <span>{item}</span>
                <span
                  className="absolute left-1/2 -bottom-1 w-0 h-[2px] 
                    group-hover:w-full group-hover:left-0 group-hover:opacity-100 
                    opacity-0 transition-all duration-300"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, #3b82f6 0%, #3b82f6aa 40%, transparent 80%)",
                    borderRadius: "9999px",
                  }}
                ></span>
              </a>
            ))}

            {/* Dropdown */}
            <div className="relative group">
              <button className="relative text-gray-400 hover:text-white group transition duration-300">
                <span>All Pages</span>
                <span
                  className="absolute left-1/2 -bottom-1 w-0 h-[2px] 
                    group-hover:w-full group-hover:left-0 group-hover:opacity-100 
                    opacity-0 transition-all duration-300"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, #3b82f6 0%, #3b82f6aa 40%, transparent 80%)",
                    borderRadius: "9999px",
                  }}
                ></span>
              </button>
              <div className="absolute top-full mt-2 w-40 bg-[#00031c] border border-gray-700 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto">
                {["Blog", "Contact"].map((label, index) => (
                  <a
                    key={index}
                    href="#"
                    className="block px-4 py-2 text-gray-400 hover:text-white relative group transition"
                  >
                    <span>{label}</span>
                    <span
                      className="absolute left-1/2 -bottom-1 w-0 h-[2px] 
                        group-hover:w-full group-hover:left-0 group-hover:opacity-100 
                        opacity-0 transition-all duration-300"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, #3b82f6 0%, #3b82f6aa 40%, transparent 80%)",
                        borderRadius: "9999px",
                      }}
                    ></span>
                  </a>
                ))}
              </div>
            </div>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <a
              href="#"
              className="relative hidden md:inline-flex items-center px-6 py-2 border border-gray-400 text-gray-300 rounded-full transition duration-300 hover:text-white hover:border-white hover:shadow-[0_0_10px_2px_rgba(255,255,255,0.4)]"
            >
              Get Started
            </a>

            {/* Mobile button */}
            <button className="md:hidden p-2 text-gray-400">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Nav;
