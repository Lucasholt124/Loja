"use client";

import useBasketStore from "@/lib/store";
import { Product } from "@/sanity.types";
import React, { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";

interface AddToBasketButtonProps {
  product: Product;
  disabled?: boolean;
}

const AddToBasketButton = ({ product, disabled }: AddToBasketButtonProps) => {
  const { addItem, removeItem, getItemCount } = useBasketStore();
  const itemCount = getItemCount(product._id);

  const [isClient, setIsClient] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAdd = () => {
    if (disabled) return;
    addItem(product);
    setJustAdded(true);
    setIsAnimating(true);
    setTimeout(() => {
      setJustAdded(false);
      setIsAnimating(false);
    }, 2000);
  };

  const handleRemove = () => {
    if (itemCount === 0 || disabled) return;
    removeItem(product._id);
  };

  if (!isClient) {
    return (
      <div className="flex h-14 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  // Modo: Sem itens no carrinho
  if (itemCount === 0) {
    return (
      <button
        onClick={handleAdd}
        disabled={disabled}
        className={`group relative overflow-hidden rounded-2xl px-8 py-4 font-bold shadow-2xl transition-all duration-300 ${
          disabled
            ? "cursor-not-allowed bg-gray-200 text-gray-400 shadow-none"
            : "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-blue-500/40 hover:shadow-blue-500/60 hover:-translate-y-1 active:scale-95"
        }`}
      >
        {!disabled && (
          <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}
        <span className="relative flex items-center justify-center gap-3">
          <ShoppingBag className="size-6" />
          <span className="text-lg">Adicionar ao Carrinho</span>
        </span>
      </button>
    );
  }

  // Modo: Com itens no carrinho (contador)
  return (
    <div className="flex flex-col gap-3">
      {/* Feedback de adição */}
      {justAdded && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 p-3 text-green-700 animate-fade-in">
          <Check className="size-5" />
          <span className="text-sm font-bold">Adicionado ao carrinho!</span>
        </div>
      )}

      {/* Contador com animação */}
      <div className="flex items-center gap-3">
        {/* Botão Remover */}
        <button
          onClick={handleRemove}
          disabled={disabled}
          className={`group relative flex size-14 items-center justify-center rounded-2xl font-bold shadow-lg transition-all duration-300 ${
            disabled
              ? "cursor-not-allowed bg-gray-200 text-gray-400"
              : "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-red-500/30 hover:shadow-red-500/50 hover:scale-110 active:scale-95"
          }`}
        >
          <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <Minus className="relative size-6" strokeWidth={3} />
        </button>

        {/* Display do contador com animação */}
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white px-6 py-3 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Quantidade
          </span>
          <span
            className={`text-4xl font-black text-gray-900 transition-all duration-300 ${
              isAnimating ? "scale-125 text-blue-600" : "scale-100"
            }`}
          >
            {itemCount}
          </span>
        </div>

        {/* Botão Adicionar */}
        <button
          onClick={handleAdd}
          disabled={disabled}
          className={`group relative flex size-14 items-center justify-center rounded-2xl font-bold shadow-lg transition-all duration-300 ${
            disabled
              ? "cursor-not-allowed bg-gray-200 text-gray-400"
              : "bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-110 active:scale-95"
          }`}
        >
          <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <Plus className="relative size-6" strokeWidth={3} />
        </button>
      </div>

      {/* Info adicional */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-600">
          {itemCount} {itemCount === 1 ? "item" : "itens"} no carrinho
        </span>
        <button
          onClick={() => {
            for (let i = 0; i < itemCount; i++) {
              removeItem(product._id);
            }
          }}
          className="font-bold text-red-600 transition-colors hover:text-red-700 hover:underline"
        >
          Remover tudo
        </button>
      </div>
    </div>
  );
};

export default AddToBasketButton;