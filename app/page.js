"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Globe, Monitor, Play, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("js");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running...");

    const res = await fetch("/api/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });

    const data = await res.json();
    setOutput(data.output);
    setIsRunning(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 dark:from-purple-900 dark:via-pink-900 dark:to-red-900">
      <div className="container mx-auto px-4 py-8">
        <motion.header
          className="text-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg flex items-center justify-center gap-3">
            <Rocket className="w-12 h-12" />
            Online Compiler
          </h1>
          <p className="text-white/90 text-lg">
            Write, compile, and run code in python & javacript language
          </p>
        </motion.header>

        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 mb-6 border border-white/20"
            variants={itemVariants}
          >
            <motion.div className="mb-4" variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Select Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full md:w-48 px-4 py-3 border-2 border-purple-300 dark:border-purple-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium transition-all duration-200 hover:border-purple-400"
              >
                <option value="js">🟨 JavaScript</option>
                <option value="py">🐍 Python</option>
              </select>
            </motion.div>

            <motion.div className="mb-6" variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Code Editor
              </label>
              <textarea
                rows="12"
                placeholder="Write your awesome code here..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-300 dark:border-purple-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono resize-none transition-all duration-200 hover:border-purple-400"
              />
            </motion.div>

            <motion.div className="flex justify-center" variants={itemVariants}>
              <motion.button
                onClick={runCode}
                disabled={isRunning}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isRunning ? (
                  <span className="flex items-center">
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Running...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Run Code
                  </span>
                )}
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-white/20"
            variants={itemVariants}
          >
            <motion.h2
              className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
              variants={itemVariants}
            >
              <ArrowRight className="w-5 h-5" />
              Output Console
            </motion.h2>
            <motion.div
              className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-[120px] shadow-inner"
              variants={itemVariants}
            >
              <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap leading-relaxed">
                {output || (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Your output will appear here...
                  </span>
                )}
              </pre>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
