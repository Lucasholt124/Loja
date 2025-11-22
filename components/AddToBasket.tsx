"use client";

import useBasketStore from "@/lib/store";
import { Product } from "@/sanity.types";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  ShoppingBag,
  Check,
  Trash2,
  Zap,

  ShoppingCart,

  Package,
} from "lucide-react";

interface AddToBasketButtonProps {
  product: Product;
  disabled?: boolean;
}

const AddToBasketButton = ({ product, disabled }: AddToBasketButtonProps) => {
  const { addItem, removeItem, getItemCount } = useBasketStore();
  const itemCount = getItemCount(product._id);

  const [isClient, setIsClient] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [, setIsAnimating] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const isOutOfStock = product.stock != null && product.stock <= 0;
  const isLowStock = product.stock != null && product.stock > 0 && product.stock <= 5;
  const availableStock = (product.stock ?? 999) - itemCount;
  const canAddMore = !isOutOfStock && availableStock > 0;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAdd = () => {
    if (disabled || !canAddMore) return;

    // Haptic feedback
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([30, 20, 30]);
    }

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

    // Haptic feedback
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }

    removeItem(product._id);
  };

  const handleRemoveAll = () => {
    // Haptic feedback
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([50, 30, 50]);
    }

    for (let i = 0; i < itemCount; i++) {
      removeItem(product._id);
    }
    setShowRemoveConfirm(false);
  };

  // Loading skeleton
  if (!isClient) {
    return (
      <div className="flex h-12 items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="size-6 rounded-full border-2 border-gray-300 border-t-blue-600"
        />
      </div>
    );
  }

  // Modo: Sem itens no carrinho
  if (itemCount === 0) {
    return (
      <div className="space-y-2">
        {/* Stock warning */}
        {isLowStock && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 ring-1 ring-orange-200"
          >
            <Zap className="size-3.5 text-orange-600" fill="currentColor" strokeWidth={2} />
            <span className="text-xs font-bold text-orange-700">
              Apenas {product.stock} em estoque!
            </span>
          </motion.div>
        )}

        <motion.button
          onClick={handleAdd}
          disabled={disabled || isOutOfStock || !canAddMore}
          whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          className={`group relative w-full overflow-hidden rounded-xl px-6 py-3 font-bold shadow-lg transition-all duration-300 ${
            disabled || isOutOfStock || !canAddMore
              ? "cursor-not-allowed bg-gray-200 text-gray-400 shadow-none"
              : "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50"
          }`}
        >
          {!disabled && !isOutOfStock && canAddMore && (
            <>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </>
          )}

          <span className="relative flex items-center justify-center gap-2">
            <ShoppingBag className="size-5" strokeWidth={2.5} />
            <span className="text-base">
              {isOutOfStock
                ? "Esgotado"
                : !canAddMore
                ? "Limite atingido"
                : "Adicionar ao Carrinho"}
            </span>
          </span>
        </motion.button>

        {/* Info adicional */}
        {!isOutOfStock && product.price && product.price > 100 && (
          <div className="flex items-center justify-center gap-1.5 text-xs">
            <Zap className="size-3.5 text-green-600" strokeWidth={2.5} />
            <span className="font-semibold text-green-600">Frete grátis neste produto</span>
          </div>
        )}
      </div>
    );
  }

  // Modo: Com itens no carrinho (contador COMPACTO)
  return (
    <div className="space-y-2.5">
      {/* Feedback de adição */}
      <AnimatePresence>
        {justAdded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-2.5 text-white shadow-lg shadow-green-500/30"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <Check className="size-5" strokeWidth={3} />
            </motion.div>
            <span className="text-sm font-black">Adicionado!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock warning */}
      {!canAddMore && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 ring-1 ring-red-200"
        >
          <Package className="size-3.5 text-red-600" strokeWidth={2.5} />
          <span className="text-xs font-bold text-red-700">
            Você adicionou todo o estoque disponível
          </span>
        </motion.div>
      )}

      {/* Contador COMPACTO */}
      <div className="flex items-center gap-2">
        {/* Botão Remover */}
        <motion.button
          onClick={handleRemove}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.1 }}
          whileTap={{ scale: disabled ? 1 : 0.9 }}
          className={`group relative flex size-11 shrink-0 items-center justify-center rounded-xl font-bold shadow-lg transition-all duration-300 ${
            disabled
              ? "cursor-not-allowed bg-gray-200 text-gray-400"
              : "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-red-500/30 hover:shadow-red-500/50"
          }`}
        >
          <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <Minus className="relative size-5" strokeWidth={3} />
        </motion.button>

        {/* Display do contador COMPACTO */}
        <div className="flex flex-1 items-center justify-between rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white px-4 py-2.5 shadow-md">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-4 text-gray-400" strokeWidth={2.5} />
            <span className="text-xs font-semibold text-gray-500">
              {itemCount} {itemCount === 1 ? "item" : "itens"}
            </span>
          </div>

          <motion.span
            key={itemCount}
            initial={{ scale: 1.5, color: "#3b82f6" }}
            animate={{ scale: 1, color: "#111827" }}
            className="text-2xl font-black tabular-nums"
          >
            {itemCount}
          </motion.span>
        </div>

        {/* Botão Adicionar */}
        <motion.button
          onClick={handleAdd}
          disabled={disabled || !canAddMore}
          whileHover={{ scale: disabled || !canAddMore ? 1 : 1.1 }}
          whileTap={{ scale: disabled || !canAddMore ? 1 : 0.9 }}
          className={`group relative flex size-11 shrink-0 items-center justify-center rounded-xl font-bold shadow-lg transition-all duration-300 ${
            disabled || !canAddMore
              ? "cursor-not-allowed bg-gray-200 text-gray-400"
              : "bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-blue-500/30 hover:shadow-blue-500/50"
          }`}
          title={!canAddMore ? "Estoque esgotado" : "Adicionar mais"}
        >
          <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <Plus className="relative size-5" strokeWidth={3} />
        </motion.button>
      </div>

      {/* Info e ações */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          {availableStock > 0 ? (
            <>
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-semibold text-gray-600">
                {availableStock} disponível{availableStock !== 1 ? "is" : ""}
              </span>
            </>
          ) : (
            <>
              <div className="size-2 rounded-full bg-red-500" />
              <span className="font-semibold text-red-600">Sem estoque</span>
            </>
          )}
        </div>

        {/* Botão Remover Tudo */}
        <div className="relative">
          <AnimatePresence>
            {showRemoveConfirm ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute bottom-full right-0 mb-2 rounded-lg border-2 border-red-200 bg-white p-2 shadow-xl"
              >
                <p className="mb-2 whitespace-nowrap text-xs font-bold text-gray-900">
                  Remover {itemCount} {itemCount === 1 ? "item" : "itens"}?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleRemoveAll}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-red-700 active:scale-95"
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setShowRemoveConfirm(false)}
                    className="rounded-lg border-2 border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
                  >
                    Não
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <button
            onClick={() => setShowRemoveConfirm(!showRemoveConfirm)}
            className="flex items-center gap-1 text-xs font-bold text-red-600 transition-all hover:text-red-700 active:scale-95"
          >
            <Trash2 className="size-3.5" strokeWidth={2.5} />
            <span>Remover</span>
          </button>
        </div>
      </div>

      {/* Total parcial */}
      {product.price && (
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-violet-50 px-4 py-2.5 ring-1 ring-blue-200/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">Subtotal:</span>
            <span className="text-lg font-black text-gray-900">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(product.price * itemCount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddToBasketButton;