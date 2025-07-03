// src/Components/BlueScrollbar.jsx
import React, { useEffect } from "react";

const Scrollbar = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      ::-webkit-scrollbar {
        width: 10px;
      }
      ::-webkit-scrollbar-track {
        background: #00031c;
      }
      ::-webkit-scrollbar-thumb {
        background: #3b82f6;
        border-radius: 8px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #2563eb;
      }

      /* Firefox */
      html {
        scrollbar-width: thin;
        scrollbar-color: #3b82f6 #00031c;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default Scrollbar;
