"use client";
import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react"; // Certifique-se de ter lucide-react instalado

const Loader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="relative">
        {/* Anéis de onda */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0, scale: 2.5 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border border-blue-500/30"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          className="absolute inset-0 rounded-full border border-blue-500/30"
        />

        {/* Ícone Central */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex size-20 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/30"
        >
          <ShoppingBag className="size-8 text-white" strokeWidth={2.5} />
        </motion.div>
      </div>
    </div>
  );
};

export default Loader;