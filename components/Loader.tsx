"use client";
import React from "react";

const Loader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="size-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent shadow-lg" />
    </div>
  );
};

export default Loader;
