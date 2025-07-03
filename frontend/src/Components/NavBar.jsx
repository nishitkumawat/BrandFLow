import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Star,
  Play,
} from "lucide-react";
import Button from "./Button";

const NavBar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              <a href="#">InvestX</a>
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            {/* <Link> */}
            <Button variant="ghost" size="sm" className="ml-3">
              Login
            </Button>
            {/* </Link> */}

            {/* <Link> */}
            <Button variant="primary" size="md">
              Get Started
            </Button>
            {/* </Link> */}
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
