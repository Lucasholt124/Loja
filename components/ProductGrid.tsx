"use client";

import { Product } from "@/sanity.types";
import React from "react";
import { motion } from "framer-motion";
import ProductThumb from "./ProductThumb";

interface ProductGridProps {
  products: Product[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  if (!products || products.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-16 text-center">
        <p className="text-lg font-bold text-gray-600">
          Nenhum produto encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr">
      {products.map((product, index) => (
        <motion.div
          key={product._id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.3,
            delay: index * 0.05, // Animação escalonada
          }}
          className="h-full"
        >
          <ProductThumb product={product} />
        </motion.div>
      ))}
    </div>
  );
};

export default ProductGrid;