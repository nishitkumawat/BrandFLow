import React from "react";
import logo from "../assets/logo.png"; // adjust path if needed

const Footer = () => {
  return (
    <footer className="px-6 pt-8 md:px-16 lg:px-36 w-full bg-[#00031c] text-gray-400">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-700 pb-10">
        {/* Logo and Description */}
        <div className="md:max-w-96">
          <img className="w-12 h-auto" src={logo} alt="BrandFlow" />
          <p className="mt-6 text-sm">
            BrandFlow revolutionizes how businesses create compelling content
            through artificial intelligence. Our platform empowers marketers,
            entrepreneurs, and creators to generate high-quality, engaging
            content in minutes instead of hours. With advanced AI trained on
            successful marketing campaigns across industries, BrandFlow
            understands what resonates with audiences and helps you craft
            messages that convert.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
          {/* First Column */}
          <div>
            <h2 className="font-semibold text-gray-300 mb-5">BrandFlow</h2>
            <ul className="text-sm space-y-2">
              {["Home", "About us", "Contact us", "Privacy policy"].map(
                (link, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="relative group hover:text-white transition duration-300"
                    >
                      <span>{link}</span>
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
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Second Column */}
          <div>
            <h2 className="font-semibold text-gray-300 mb-5">Get in touch</h2>
            <div className="text-sm space-y-2">
              <p>+91 12345 67890</p>
              <p>support@.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <p className="pt-4 text-center text-sm text-gray-500 pb-5">
        Copyright {new Date().getFullYear()} © BrandFlow. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
