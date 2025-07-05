import React from "react";
import { Home, Users, Briefcase, Megaphone, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user session data if any (e.g., localStorage, cookies)
    // localStorage.clear();
    navigate("/");
  };

  return <></>;
};

export default Sidebar;
