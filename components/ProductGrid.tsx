// SEU ARQUIVO ProductGrid CORRIGIDO

"use client";

import { Product } from "@/sanity.types";
import React from "react";
import {  motion } from "framer-motion";
import ProductThumb from "./ProductThumb";

const ProductGrid = ({ products }: { products: Product[] }) => {
  return (
    // --- ALTERAÇÃO 1 ---
    // Adicionamos `grid-flow-row-dense` para um melhor preenchimento (opcional, mas bom)
    // e `items-stretch` para forçar os itens a terem a mesma altura.
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-stretch">
      {products?.map((product) => {
        // O `key` deve estar no elemento mais externo do map.
        return (
          <motion.div
            key={product._id} // Movi a key para o elemento pai, que é a motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            // --- ALTERAÇÃO 2 (A MAIS IMPORTANTE) ---
            // Removemos 'flex' e 'justify-center'.
            // O próprio grid já cuida do alinhamento horizontal.
            // O `h-full` garante que este contêiner de animação ocupe toda a altura
            // que o `items-stretch` do grid pai está fornecendo.
            className="h-full"
          >
            {/* O ProductThumb já tem a classe h-full, então ele vai herdar a altura */}
            <ProductThumb product={product} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProductGrid;