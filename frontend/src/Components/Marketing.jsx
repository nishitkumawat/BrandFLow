import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import { Image, Download, Copy, Sparkles } from "lucide-react";
import ScrollBar from "../Components/ScrollBar";

const API_BASE = "http://127.0.0.1:8000"; // backend API base

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Marketing() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate image from prompt
  const generateImage = async (e) => {
    e.preventDefault();
    if (!prompt) return;

    setIsGenerating(true);
    try {
      const response = await axios.post(
        `${API_BASE}/utilities/generate-marketing-image/`,
        {
          prompt,
        }
      );

      // Assuming your backend returns base64 image and caption
      setGeneratedImage(`data:image/png;base64,${response.data.image}`);
      setCaption(response.data.caption || "Generated marketing image");
      setCopied(false);
    } catch (err) {
      console.error("Error generating image:", err);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download image
  const downloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `marketing-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy prompt to clipboard
  const copyToClipboard = () => {
    if (!caption) return;

    navigator.clipboard
      .writeText(caption)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  return (
    <div className="flex">
      <Sidebar /><ScrollBar />
      <div className="ml-64 w-full min-h-screen bg-[#00031c] pt-24 p-6 text-white">
        <motion.div initial="hidden" animate="show" variants={fadeInUp}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Sparkles size={28} className="text-purple-400" />
            <h1 className="text-3xl font-bold">Marketing Content Generator</h1>
          </div>

          {/* Prompt Form */}
          <form
            onSubmit={generateImage}
            className="mb-8 p-4 bg-[#0a0f2b] border border-gray-700 rounded-xl"
          >
            <div className="mb-4">
              <label
                htmlFor="prompt"
                className="block text-sm font-medium mb-2"
              >
                Describe your marketing image
              </label>
              <textarea
                id="prompt"
                placeholder="e.g., 'Create a summer sale poster with bright colors, showing 50% discount'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-[#1a1f3c] p-3 rounded text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                rows={4}
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating}
              className="bg-purple-600 text-white py-2 px-6 rounded hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                "Generating..."
              ) : (
                <>
                  <Sparkles size={18} /> Generate Image
                </>
              )}
            </button>
          </form>

          {/* Results Section */}
          {generatedImage && (
            <div className="bg-[#0a0f2b] border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Image size={20} className="text-purple-400" /> Your Generated
                Content
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Image Preview */}
                <div className="border border-gray-600 rounded-lg overflow-hidden">
                  <img
                    src={generatedImage}
                    alt="Generated marketing content"
                    className="w-full h-auto object-contain"
                  />
                </div>

                {/* Caption and Actions */}
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Generated Caption
                    </label>
                    <div className="bg-[#1a1f3c] p-3 rounded border border-gray-600 relative">
                      <p className="text-white">{caption}</p>
                      <button
                        onClick={copyToClipboard}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white transition"
                        title="Copy to clipboard"
                      >
                        <Copy size={18} />
                      </button>
                      {copied && (
                        <span className="absolute top-2 right-10 text-xs text-green-400">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={downloadImage}
                      className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <Download size={16} /> Download Image
                    </button>

                    <button
                      onClick={() => {
                        setPrompt("");
                        setGeneratedImage(null);
                      }}
                      className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
                    >
                      Generate Another
                    </button>
                  </div>

                  <div className="mt-6 text-sm text-gray-400">
                    <p className="font-medium">Tips for better results:</p>
                    <ul className="list-disc ml-5 mt-1 space-y-1">
                      <li>Be specific about colors, style, and elements</li>
                      <li>Include your brand name and key offers</li>
                      <li>Mention the mood or emotion you want to convey</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sample Prompts */}
          {!generatedImage && (
            <div className="mt-12">
              <h3 className="text-lg font-medium mb-3 text-gray-300">
                Try these prompt ideas:
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  "Create a vibrant summer sale banner with 50% off text, tropical background, and shopping bags",
                  "Generate an elegant jewelry ad with diamond ring close-up, black background, and luxury aesthetic",
                  "Design a food delivery app promotion with smartphone mockup, delicious burger image, and discount tag",
                  "Make a fitness center poster with muscular trainer, gym equipment, and 'Join Now' call-to-action",
                  "Create a real estate flyer with modern house, price tag, and contact information overlay",
                  "Generate a coffee shop promotion with steaming cup, cozy atmosphere, and loyalty program details",
                ].map((sample, index) => (
                  <div
                    key={index}
                    onClick={() => setPrompt(sample)}
                    className="p-3 bg-[#1a1f3c] rounded border border-gray-700 hover:border-purple-500 cursor-pointer transition"
                  >
                    <p className="text-sm text-gray-300">{sample}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
