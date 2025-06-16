"use client";

import { motion } from "framer-motion";

export default function Spinner() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex justify-center items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="rounded-full h-12 w-12 border-4 border-b-transparent border-white"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}
