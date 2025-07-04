import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Nav from "../../../frontend/src/Components/Nav";
import Footer from "../../../frontend/src/Components/Footer";
import { Sparkles, ArrowRight, ArrowUp } from "lucide-react";
import Scrollbar from "../Components/ScrollBar";
import axios from "axios";
import bgImage from "../assets/background.png"; // adjust path as per your folder structure

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 1 } },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const GlowingCircle = ({
  className = "",
  size = "80px",
  color = "rgba(59,130,246,0.2)",
}) => (
  <div
    className={`absolute rounded-full blur-xl ${className}`}
    style={{
      width: size,
      height: size,
      backgroundColor: color,
    }}
  ></div>
);

const LandingPage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen text-gray-400 bg-[#00031c] overflow-hidden pt-24">
      <div
        className=" inset-0 z-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          height: "100vh",
        }}
      >
        <Scrollbar />
        <Nav />

        {/* Hero Section */}
        <motion.div
          id="home"
          className="relative z-10 text-center space-y-4 mt-10 "
          initial="hidden"
          animate="show"
          variants={staggerContainer}
        >
          <motion.div
            className="relative flex justify-center items-center gap-4 text-sm text-gray-400"
            variants={fadeInUp}
          >
            <img
              src="https://wpriverthemes.com/nexux/wp-content/themes/nexux/icons/sub-title-left.svg"
              alt="subtitle"
              className="w-5 h-5"
            />
            <div className="relative flex items-center justify-center">
              <div className="absolute w-32 h-32 bg-blue-500 blur-3xl rounded-full opacity-50 z-[-1]" />
              <p className="relative z-10">A.I Driven</p>
            </div>
            <img
              src="https://wpriverthemes.com/nexux/wp-content/themes/nexux/icons/sub-title-right.svg"
              alt="subtitle"
              className="w-5 h-5"
            />
          </motion.div>

          <motion.h1
            className="text-white text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
            variants={fadeInUp}
          >
            Transform Your Business <br />
            with AI-Powered Solutions
          </motion.h1>

          <motion.p
            className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto flex items-center justify-center gap-2"
            variants={fadeInUp}
          >
            <Sparkles className="text-blue-500 animate-pulse" size={20} />
            Our AI platform automates repetitive tasks
          </motion.p>
        </motion.div>
      </div>
      {/* About Section */}
      <motion.section
        id="about"
        className="mt-20 text-center relative px-4 sm:px-12"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div
          className="relative flex justify-center items-center gap-2 text-sm text-gray-400 mb-4"
          variants={fadeInUp}
        >
          <img
            src="https://wpriverthemes.com/nexux/wp-content/themes/nexux/icons/sub-title-left.svg"
            alt="subtitle"
            className="w-5 h-5"
          />
          <div className="relative flex items-center justify-center">
            <div className="absolute w-32 h-32 bg-blue-500 blur-3xl rounded-full opacity-50 z-[-1]" />
            <p className="relative z-10">About Us</p>
          </div>
          <img
            src="https://wpriverthemes.com/nexux/wp-content/themes/nexux/icons/sub-title-right.svg"
            alt="subtitle"
            className="w-5 h-5"
          />
        </motion.div>
        <motion.h2
          className="text-white text-sm sm:text-base font-medium mb-6 px-6 sm:px-16 lg:px-24"
          variants={fadeInUp}
        >
          We are a passionate team of innovators dedicated to transforming the
          way businesses create and manage content. At the heart of our mission
          is a belief that artificial intelligence isn’t just a tool—it’s a
          creative partner that can supercharge productivity and unlock new
          levels of efficiency.
          <br />
          Our platform is built to assist marketers, creators, entrepreneurs,
          and growing brands by automating repetitive tasks, generating content
          ideas, and ensuring quality and consistency across all touchpoints.
          Whether you’re drafting social media posts, blog articles, ad copy, or
          brand messaging, our AI tools help you do it faster—and smarter.
        </motion.h2>

        <motion.a
          href="#"
          variants={fadeInUp}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative inline-flex items-center justify-center p-[1px] font-medium text-white transition-all rounded-xl group bg-gradient-to-br from-blue-600 to-blue-500 group-hover:from-blue-500 group-hover:to-blue-600 hover:text-white focus:outline-none focus:ring"
        >
          <span className="relative px-6 py-2 transition-all ease-in bg-[#00031c] rounded-xl group-hover:bg-opacity-0 flex items-center gap-2">
            More About Us <ArrowRight className="w-4 h-4" />
          </span>
        </motion.a>

        <motion.div
          className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          variants={staggerContainer}
        >
          {[
            "Content Ideas",
            "Writer's Assist",
            "Quality Control",
            "Faster Workflow",
            "Increased Output",
            "Super-Brain",
            "Style Variations",
          ].map((text, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center p-4 border rounded-lg border-gray-700 transition duration-300 hover:text-white hover:border-white hover:shadow-[0_0_10px_2px_rgba(220,220,220,0.2)]"
              whileHover={{ scale: 1.05 }}
              variants={fadeInUp}
            >
              <Sparkles className="text-blue-500 mb-2" />
              <p className="text-sm text-white">{text}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Help Center Section */}
      <motion.section
        id="help"
        className="mt-24 text-center relative px-4 sm:px-12"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div
          className="relative flex justify-center items-center gap-2 text-sm text-gray-400 mb-4"
          variants={fadeInUp}
        >
          <img
            src="https://wpriverthemes.com/nexux/wp-content/themes/nexux/icons/sub-title-left.svg"
            alt="subtitle"
            className="w-5 h-5"
          />
          <div className="relative flex items-center justify-center">
            <div className="absolute w-32 h-32 bg-blue-500 blur-3xl rounded-full opacity-50 z-[-1]" />
            <p className="relative z-10">Help Center</p>
          </div>

          <img
            src="https://wpriverthemes.com/nexux/wp-content/themes/nexux/icons/sub-title-right.svg"
            alt="subtitle"
            className="w-5 h-5"
          />
        </motion.div>

        <motion.h2
          className="text-white text-2xl sm:text-3xl font-bold mb-10"
          variants={fadeInUp}
        >
          Find Answers to Common Questions
        </motion.h2>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
          variants={staggerContainer}
        >
          {[
            {
              title: "How does the AI generate content?",
              desc: "Our platform uses open-source models trained on marketing content to generate tailored outputs.",
            },
            {
              title: "Can I customize the tone and style?",
              desc: "Yes, you can choose different tones like professional, friendly, bold, and more.",
            },
            {
              title: "What happens when I run out of credits?",
              desc: "You can easily top-up or upgrade your plan from the dashboard.",
            },
            {
              title: "Is my data safe?",
              desc: "Absolutely. We don’t store your content and follow best security practices.",
            },
            {
              title: "Can I integrate this with my CMS?",
              desc: "Yes, our API makes it simple to connect your content workflow.",
            },
            {
              title: "Do you offer enterprise support?",
              desc: "Yes, contact us for a custom solution tailored to your business needs.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="border border-gray-700 rounded-2xl p-5 text-left hover:border-white transition-all bg-[#0a0f2b] hover:shadow-[0_0_12px_2px_rgba(255,255,255,0.1)]"
              whileHover={{ scale: 1.03 }}
              variants={fadeInUp}
            >
              <h4 className="text-white font-semibold text-lg mb-2">
                {item.title}
              </h4>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Gemini Chatbot Box */}
        <motion.div
          className="mt-16 max-w-3xl mx-auto p-6 rounded-2xl bg-[#0a0f2b] border border-gray-700 shadow-md text-left"
          variants={fadeInUp}
          whileHover={{ scale: 1.01 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Gemini Chatbot
          </h3>
          <div
            className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 bg-[#00031c] text-sm text-gray-300"
            id="chatbox"
          >
            <div className="mb-2">
              <strong className="text-blue-400">Gemini:</strong> Hi there! How
              can I help you today?
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your question..."
              className="flex-1 px-4 py-2 rounded-lg bg-[#1a1f3c] text-white border border-gray-600 focus:outline-none"
              id="chatInput"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const input = e.target.value.trim();
                  if (!input) return;

                  const chatbox = document.getElementById("chatbox");

                  // Append user's message
                  const userDiv = document.createElement("div");
                  userDiv.innerHTML = `<strong class="text-green-400">You:</strong> ${input}`;
                  chatbox.appendChild(userDiv);

                  // Scroll to bottom
                  chatbox.scrollTop = chatbox.scrollHeight;

                  // Clear input
                  e.target.value = "";

                  // Send to Django backend
                  axios
                    .post("http://localhost:8000/api/chat/", {
                      message: input,
                    })
                    .then((res) => {
                      const replyDiv = document.createElement("div");
                      replyDiv.innerHTML = `<strong class="text-blue-400">Gemini:</strong> ${res.data.reply}`;
                      chatbox.appendChild(replyDiv);
                      chatbox.scrollTop = chatbox.scrollHeight;
                    })
                    .catch((err) => {
                      const errorDiv = document.createElement("div");
                      errorDiv.innerHTML = `<strong class="text-red-400">Error:</strong> Something went wrong.`;
                      chatbox.appendChild(errorDiv);
                      chatbox.scrollTop = chatbox.scrollHeight;
                    });
                }
              }}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Send
            </button>
          </div>
        </motion.div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        id="price"
        className="mt-24 text-center relative px-4 sm:px-12"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div
          className="relative flex justify-center items-center gap-2 text-sm text-gray-400 mb-4"
          variants={fadeInUp}
        >
          <img
            src="https://wpriverthemes.com/nexux/wp-content/themes/nexux/icons/sub-title-left.svg"
            alt="subtitle"
            className="w-5 h-5"
          />
          <div className="relative flex items-center justify-center">
            <div className="absolute w-32 h-32 bg-blue-500 blur-3xl rounded-full opacity-50 z-[-1]" />
            <p className="relative z-10">Pricing</p>
          </div>
          <img
            src="https://wpriverthemes.com/nexux/wp-content/themes/nexux/icons/sub-title-right.svg"
            alt="subtitle"
            className="w-5 h-5"
          />
        </motion.div>

        <motion.h2
          className="text-white text-2xl sm:text-3xl font-bold mb-10"
          variants={fadeInUp}
        >
          Choose a Plan That Fits Your Business
        </motion.h2>

        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
          variants={staggerContainer}
        >
          {[
            {
              title: "Starter",
              price: "$19/mo",
              features: ["10 AI Credits", "Basic Support", "Email Automation"],
              gradient: "from-blue-700 to-blue-500",
            },
            {
              title: "Pro",
              price: "$49/mo",
              features: [
                "50 AI Credits",
                "Priority Support",
                "Social Media Tools",
              ],
              gradient: "from-purple-700 to-indigo-500",
            },
            {
              title: "Enterprise",
              price: "$99/mo",
              features: [
                "Unlimited AI Credits",
                "24/7 Support",
                "Custom Workflows",
              ],
              gradient: "from-pink-600 to-red-500",
            },
          ].map((plan, i) => (
            <motion.div
              key={i}
              className="border border-gray-700 rounded-2xl p-6 bg-[#0a0f2b] hover:shadow-[0_0_20px_3px_rgba(255,255,255,0.1)] transition-all text-left flex flex-col justify-between"
              whileHover={{ scale: 1.05 }}
              variants={fadeInUp}
            >
              <h3 className="text-white text-xl font-semibold mb-2">
                {plan.title}
              </h3>
              <p className="text-3xl font-bold text-blue-400 mb-4">
                {plan.price}
              </p>
              <ul className="space-y-2 mb-6 text-sm text-gray-300">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Sparkles className="text-blue-500 w-4 h-4" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2 text-white rounded-lg font-medium bg-gradient-to-r ${plan.gradient} hover:opacity-90`}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
          aria-label="Scroll to Top"
        >
          <ArrowUp />
        </motion.button>
      )}

      <Footer />
    </div>
  );
};

export default LandingPage;
