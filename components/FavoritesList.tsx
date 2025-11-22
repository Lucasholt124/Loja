"use client";

import React, { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import useFavoritesStore from "@/lib/favoritesStore";
import {
  Heart,
  Trash2,
  Search,
  X,
  Share2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Tag,
  Package,
  Zap,
  Grid3x3,
  LayoutGrid,
  Filter,
  ChevronDown,
} from "lucide-react";

const FavoritesList: React.FC = () => {
  const items = useFavoritesStore((s) => s.items);
  const remove = useFavoritesStore((s) => s.remove);
  const clear = useFavoritesStore((s) => s.clear);

  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<"recent" | "name" | "price">("recent");
  const [showClearModal, setShowClearModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = q ? items.filter((i) => i.title.toLowerCase().includes(q)) : items;

    if (sort === "name") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "price") {
      result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    return result;
  }, [items, query, sort]);

  const formatBRL = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleClearAll = () => {
    clear();
    setShowClearModal(false);
    showNotification("success", "Todos os favoritos foram removidos!");
  };

  const handleRemove = (id: string, title: string) => {
    remove(id);
    showNotification("success", `${title} removido dos favoritos`);
  };

  const handleShare = async (item: any) => {
    const url = item.slug ? `/product/${item.slug}` : `/product/${item.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Confira ${item.title}`,
          url: window.location.origin + url,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.origin + url);
      showNotification("success", "Link copiado!");
    }
  };

  // Variants com tipagem correta
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Empty state
  if (!items.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-2xl px-4 sm:px-6"
      >
        <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 p-8 text-center shadow-2xl">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br from-rose-300/30 to-pink-300/30 blur-3xl"
          />

          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto mb-4 flex size-20 items-center justify-center"
            >
              <div className="absolute inset-0 animate-ping rounded-full bg-rose-500/30" />
              <div className="relative flex size-full items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 shadow-2xl shadow-rose-500/40">
                <Heart className="size-10 text-white" fill="currentColor" strokeWidth={0} />
              </div>
            </motion.div>

            <h2 className="mb-2 text-2xl font-black tracking-tight text-gray-900">
              Você ainda não tem favoritos
            </h2>

            <p className="mx-auto mb-6 max-w-md text-sm text-gray-600">
              Clique no coração dos produtos para salvá-los aqui e acessar depois com facilidade.
            </p>

            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-bold text-white shadow-2xl shadow-blue-500/40 sm:w-auto"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <Sparkles className="relative size-4" />
                <span className="relative">Explorar produtos</span>
                <ArrowRight className="relative size-4 transition-transform group-hover:translate-x-1" />
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed left-4 right-4 top-20 z-50 mx-auto max-w-md sm:left-auto sm:right-4"
          >
            <div
              className={`flex items-center gap-2 rounded-xl border-2 p-3 shadow-2xl backdrop-blur-xl ${
                notification.type === "success"
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="size-5 shrink-0 text-green-600" strokeWidth={2.5} />
              ) : (
                <AlertCircle className="size-5 shrink-0 text-red-600" strokeWidth={2.5} />
              )}
              <p
                className={`text-sm font-bold ${
                  notification.type === "success" ? "text-green-900" : "text-red-900"
                }`}
              >
                {notification.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear All Modal */}
      <AnimatePresence>
        {showClearModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearModal(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-4 right-4 top-1/2 z-50 mx-auto w-full max-w-md -translate-y-1/2 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-2xl sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-xl">
                  <Trash2 className="size-6 text-white" strokeWidth={2.5} />
                </div>
                <button
                  onClick={() => setShowClearModal(false)}
                  className="rounded-full p-2 transition-colors hover:bg-gray-100 active:scale-95"
                >
                  <X className="size-5" />
                </button>
              </div>

              <h3 className="mb-2 text-xl font-black text-gray-900">Limpar favoritos?</h3>
              <p className="mb-6 text-sm text-gray-600">
                Esta ação removerá todos os {items.length} produtos da sua lista.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="order-2 flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClearAll}
                  className="order-1 flex-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-95 sm:order-2"
                >
                  Sim, Limpar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* HEADER COMPACTO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white via-rose-50/40 to-pink-50/40 p-4 shadow-xl sm:p-5"
      >
        <div className="relative">
          {/* Title Row */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
                <Heart className="size-5 text-white" fill="currentColor" strokeWidth={0} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
                  Favoritos
                </h1>
                <p className="text-sm font-semibold text-gray-600">{items.length} itens</p>
              </div>
            </div>

            <motion.button
              onClick={() => setShowClearModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 shadow-lg transition-all hover:border-red-300 hover:bg-red-100"
            >
              <Trash2 className="size-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Limpar</span>
            </motion.button>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="h-10 w-full rounded-xl border-2 border-gray-200 bg-white pl-10 pr-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-1 rounded-xl border-2 border-gray-200 bg-white p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg px-3 py-2 transition-all ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Grid3x3 className="size-4" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg px-3 py-2 transition-all ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <LayoutGrid className="size-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-2 transition-all hover:border-blue-400 active:scale-95"
              >
                <Filter className="size-4 text-gray-600" strokeWidth={2} />
                <span className="text-sm font-bold text-gray-900">
                  {sort === "recent" ? "Recente" : sort === "name" ? "A-Z" : "€"}
                </span>
                <ChevronDown
                  className={`size-4 text-gray-400 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full z-10 mt-2 min-w-[180px] overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-2xl"
                  >
                    {[
                      { value: "recent", label: "Mais Recentes" },
                      { value: "name", label: "Nome (A-Z)" },
                      { value: "price", label: "Preço" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSort(option.value as any);
                          setShowFilters(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                          sort === option.value
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* GRID */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-[300px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6"
        >
          <div className="text-center">
            <Search className="mx-auto mb-3 size-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-black text-gray-900">Nada encontrado</h3>
            <p className="mb-4 text-sm text-gray-600">Nenhum resultado para {query}</p>
            <button
              onClick={() => setQuery("")}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-black active:scale-95"
            >
              Limpar busca
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-3"
          }
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => {
              const href = item.slug ? `/product/${item.slug}` : `/product/${item.id}`;

              return (
                <motion.li
                  key={item.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onHoverStart={() => setHoveredItem(item.id)}
                  onHoverEnd={() => setHoveredItem(null)}
                  className={`group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg transition-all duration-300 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 ${
                    viewMode === "list" ? "flex flex-col sm:flex-row" : "flex flex-col"
                  }`}
                >
                  {/* Imagem */}
                  <div
                    className={`relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 ${
                      viewMode === "grid" ? "aspect-square w-full" : "h-48 w-full sm:h-auto sm:w-48"
                    }`}
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <Package className="size-12 opacity-30" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    {/* Price Badge */}
                    {typeof item.price === "number" && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 backdrop-blur-sm shadow-xl">
                        <Tag className="size-3 text-yellow-400" strokeWidth={2.5} />
                        <span className="text-xs font-black text-white">
                          {formatBRL(item.price)}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute right-2 top-2 flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemove(item.id, item.title)}
                        className="flex size-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg backdrop-blur-sm transition-all hover:bg-rose-500 hover:text-white"
                        aria-label="Remover"
                      >
                        <Trash2 className="size-3.5" strokeWidth={2.5} />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleShare(item)}
                        className="flex size-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg backdrop-blur-sm transition-all hover:bg-blue-500 hover:text-white"
                        aria-label="Compartilhar"
                      >
                        <Share2 className="size-3.5" strokeWidth={2.5} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex flex-1 flex-col p-4">
                    <Link
                      href={href}
                      className="mb-2 line-clamp-2 text-base font-bold text-gray-900 transition-colors hover:text-blue-600"
                    >
                      {item.title}
                    </Link>

                    {/* Quick Info */}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                        <Package className="size-2.5" strokeWidth={2.5} />
                        Estoque
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                        <Zap className="size-2.5" strokeWidth={2.5} />
                        Rápido
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex flex-col gap-2 sm:flex-row">
                      <Link href={href} className="flex-1">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="group/btn relative flex items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg"
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="relative">Ver Produto</span>
                          <ArrowRight className="relative size-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </motion.div>
                      </Link>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRemove(item.id, item.title)}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 sm:flex-initial"
                      >
                        <Trash2 className="size-4" strokeWidth={2.5} />
                        <span className="sm:hidden">Remover</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Shimmer */}
                  <AnimatePresence>
                    {hoveredItem === item.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pointer-events-none absolute inset-0"
                      >
                        <motion.div
                          className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 1.5, ease: "linear" }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
};

export default FavoritesList;