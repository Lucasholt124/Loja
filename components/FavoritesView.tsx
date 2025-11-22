"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, LayoutGroup, Variants } from "framer-motion";
import WishlistButton from "@/components/WishlistButton";
import {
  Heart,
  Search,
  Trash2,
  Sparkles,
  TrendingUp,
  Filter,
  Grid3x3,
  LayoutGrid,
  ShoppingBag,
  Share2,
  X,
  CheckCircle2,
  AlertCircle,
  Tag,
  Package,
  ArrowRight,
  BarChart3,
  Clock,
  Flame,
} from "lucide-react";

type Product = {
  slug: string;
  name: string;
  price: number | null;
  stock?: number | null;
  image: string | null;
};

type Props = { products: Product[] };

export default function FavoritesView({ products }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"nome" | "preco-asc" | "preco-desc">("nome");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [list, setList] = useState<Product[]>(products);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  useEffect(() => setList(products), [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? list.filter((p) => p.name.toLowerCase().includes(q)) : list;

    const arr = [...base];
    if (sort === "nome") arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "preco-asc") arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sort === "preco-desc") arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return arr;
  }, [list, query, sort]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = list.reduce((sum, p) => sum + (p.price ?? 0), 0);
    const inStock = list.filter((p) => (p.stock ?? 0) > 0).length;
    const avgPrice = list.length > 0 ? total / list.length : 0;

    return { total, inStock, avgPrice, count: list.length };
  }, [list]);

  const formatBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleClearAll = async () => {
    setIsClearing(true);

    try {
      await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });

      setList([]);
      setShowClearModal(false);
      showNotification("success", "Todos os favoritos foram removidos!");
    } catch (error) {
      showNotification("error", "Erro ao limpar favoritos. Tente novamente.");
    } finally {
      setIsClearing(false);
    }
  };

  const handleShare = async (product: Product) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Confira ${product.name}`,
          url: `/product/${product.slug}`,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.origin + `/product/${product.slug}`);
      showNotification("success", "Link copiado para área de transferência!");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
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

  // Empty State
  if (!list.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <div className="relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 p-12 text-center shadow-2xl">
          {/* Efeitos de fundo animados */}
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
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 blur-3xl"
          />

          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto mb-6 flex size-24 items-center justify-center"
            >
              <div className="absolute inset-0 animate-ping rounded-full bg-rose-500/30" />
              <div className="relative flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 shadow-2xl shadow-rose-500/40">
                <Heart className="size-12 text-white" fill="currentColor" strokeWidth={0} />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-3xl font-black tracking-tight text-transparent"
            >
              Seu coração ainda está vazio
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto mb-8 max-w-md text-base text-gray-600"
            >
              Comece a criar sua coleção de desejos! Clique no{" "}
              <Heart className="inline size-4 text-rose-500" /> dos produtos para salvá-los aqui.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 font-bold text-white shadow-2xl shadow-blue-500/40 transition-all duration-300"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <Sparkles className="relative size-5" />
                  <span className="relative">Descobrir Produtos</span>
                  <ArrowRight className="relative size-5 transition-transform group-hover:translate-x-1" />
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed right-4 top-20 z-50 max-w-md"
          >
            <div
              className={`flex items-center gap-3 rounded-2xl border-2 p-4 shadow-2xl backdrop-blur-xl ${
                notification.type === "success"
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="size-6 text-green-600" strokeWidth={2.5} />
              ) : (
                <AlertCircle className="size-6 text-red-600" strokeWidth={2.5} />
              )}
              <p
                className={`font-bold ${
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
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 border-gray-200 bg-white p-8 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-xl">
                  <Trash2 className="size-7 text-white" strokeWidth={2.5} />
                </div>
                <button
                  onClick={() => setShowClearModal(false)}
                  className="rounded-full p-2 transition-colors hover:bg-gray-100"
                >
                  <X className="size-5" />
                </button>
              </div>

              <h3 className="mb-3 text-2xl font-black text-gray-900">Limpar todos favoritos?</h3>
              <p className="mb-6 text-gray-600">
                Esta ação removerá todos os {list.length} produtos da sua lista de favoritos. Esta ação não pode ser desfeita.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearModal(false)}
                  disabled={isClearing}
                  className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 font-bold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={isClearing}
                  className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                >
                  {isClearing ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="size-5 rounded-full border-2 border-white border-t-transparent"
                      />
                      Removendo...
                    </span>
                  ) : (
                    "Sim, Limpar Tudo"
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* HERO PREMIUM */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white via-rose-50/40 to-pink-50/40 p-6 shadow-xl sm:p-8 lg:p-10"
      >
        {/* Efeitos decorativos */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-gradient-to-br from-rose-400/20 to-pink-400/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 blur-3xl"
        />

        <div className="relative">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                <Heart className="size-4" fill="currentColor" strokeWidth={0} />
                Seus Favoritos
              </div>
              <h1 className="mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl lg:text-5xl">
                Produtos que você ama
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-lg font-semibold text-gray-600">
                  {list.length} {list.length === 1 ? "item salvo" : "itens salvos"}
                </p>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700 ring-1 ring-emerald-300">
                  <TrendingUp className="size-4" strokeWidth={2.5} />
                  Popular
                </span>
              </div>
            </div>

            <motion.button
              onClick={() => setShowClearModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 self-start rounded-2xl border-2 border-red-200 bg-red-50 px-6 py-3 font-bold text-red-600 shadow-lg transition-all duration-300 hover:border-red-300 hover:bg-red-100 hover:shadow-xl"
            >
              <Trash2 className="size-5" strokeWidth={2.5} />
              Limpar Tudo
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                label: "Valor Total",
                value: formatBRL(stats.total),
                icon: Tag,
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                label: "Preço Médio",
                value: formatBRL(stats.avgPrice),
                icon: BarChart3,
                gradient: "from-violet-500 to-purple-500",
              },
              {
                label: "Em Estoque",
                value: `${stats.inStock}/${stats.count}`,
                icon: Package,
                gradient: "from-green-500 to-emerald-500",
              },
              {
                label: "Itens",
                value: stats.count,
                icon: Heart,
                gradient: "from-rose-500 to-pink-500",
              },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative overflow-hidden rounded-2xl border-2 border-white bg-white/80 p-4 backdrop-blur-sm transition-all hover:shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6`}
                  >
                    <stat.icon className="size-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {stat.label}
                    </p>
                    <p className="truncate text-xl font-black text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CONTROLES */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400 transition-colors" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar nos favoritos..."
                className="h-12 w-full rounded-2xl border-2 border-gray-200 bg-white pl-12 pr-4 font-semibold text-gray-900 shadow-sm placeholder:text-gray-400 transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:shadow-lg"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 rounded-2xl border-2 border-gray-200 bg-white p-1 shadow-sm">
                <motion.button
                  onClick={() => setViewMode("grid")}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-xl px-4 py-2 font-bold transition-all ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg scale-105"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Grid3x3 className="size-5" strokeWidth={2.5} />
                </motion.button>
                <motion.button
                  onClick={() => setViewMode("list")}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-xl px-4 py-2 font-bold transition-all ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg scale-105"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <LayoutGrid className="size-5" strokeWidth={2.5} />
                </motion.button>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-4 py-2 shadow-sm">
                <Filter className="size-5 text-gray-600" strokeWidth={2} />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="border-none bg-transparent font-bold text-gray-900 outline-none"
                >
                  <option value="nome">Nome (A–Z)</option>
                  <option value="preco-asc">Menor Preço</option>
                  <option value="preco-desc">Maior Preço</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* GRID / LIST */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-[400px] items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 p-8"
        >
          <div className="text-center">
            <Search className="mx-auto mb-4 size-16 text-gray-400" />
            <h3 className="mb-2 text-xl font-black text-gray-900">Nenhum favorito encontrado</h3>
            <p className="text-gray-600">
              Nenhum resultado para {query}
            </p>
          </div>
        </motion.div>
      ) : (
        <LayoutGroup>
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-4"
            }
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <motion.li
                  key={p.slug}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onHoverStart={() => setHoveredProduct(p.slug)}
                  onHoverEnd={() => setHoveredProduct(null)}
                  className={`group relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-white shadow-lg transition-all duration-300 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 ${
                    viewMode === "list" ? "flex flex-row" : "flex flex-col"
                  }`}
                >
                  {/* Imagem */}
                  <div
                    className={`relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 ${
                      viewMode === "grid" ? "aspect-square w-full" : "h-56 w-56 flex-shrink-0 sm:h-64 sm:w-64"
                    }`}
                  >
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <Package className="size-16 opacity-30" />
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    {/* Price Badge */}
                    {typeof p.price === "number" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1.5 backdrop-blur-sm shadow-xl"
                      >
                        <Tag className="size-3.5 text-yellow-400" strokeWidth={2.5} />
                        <span className="text-sm font-black text-white">
                          {formatBRL(p.price)}
                        </span>
                      </motion.div>
                    )}

                    {/* Actions */}
                    <div className="absolute right-3 top-3 flex flex-col gap-2">
                      <WishlistButton
                        productSlug={p.slug}
                        onToggle={(fav) => {
                          if (!fav) {
                            setList((prev) => prev.filter((i) => i.slug !== p.slug));
                            showNotification("success", "Produto removido dos favoritos");
                          }
                        }}
                      />

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleShare(p)}
                        className="flex size-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg backdrop-blur-sm transition-all hover:bg-blue-500 hover:text-white hover:shadow-xl"
                        title="Compartilhar"
                      >
                        <Share2 className="size-4" strokeWidth={2.5} />
                      </motion.button>
                    </div>

                    {/* Stock Badge */}
                    {p.stock != null && (
                      <>
                        {p.stock <= 0 ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                            <span className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white uppercase shadow-2xl">
                              Esgotado
                            </span>
                          </div>
                        ) : p.stock <= 5 ? (
                          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 shadow-lg animate-pulse">
                            <Flame className="size-3.5 text-white" fill="white" strokeWidth={2} />
                            <span className="text-xs font-black text-white">
                              Últimas {p.stock}!
                            </span>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex flex-1 flex-col p-5">
                    <Link
                      href={`/product/${p.slug}`}
                      className="mb-3 line-clamp-2 text-lg font-bold text-gray-900 transition-colors hover:text-blue-600"
                    >
                      {p.name}
                    </Link>

                    {/* Quick Info */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {p.stock != null && p.stock > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700 ring-1 ring-green-300">
                          <Package className="size-3" strokeWidth={2.5} />
                          Em estoque
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-300">
                        <Clock className="size-3" strokeWidth={2.5} />
                        Entrega rápida
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                      <Link href={`/product/${p.slug}`} className="flex-1">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="group/btn relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-bold text-white shadow-lg transition-all"
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="relative">Ver Produto</span>
                          <ArrowRight className="relative size-4 transition-transform group-hover/btn:translate-x-1" />
                        </motion.div>
                      </Link>

                      {p.stock != null && p.stock > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 font-bold text-gray-700 transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <ShoppingBag className="size-5" strokeWidth={2.5} />
                          <span className="hidden sm:inline">Comprar</span>
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Efeito shimmer */}
                  <AnimatePresence>
                    {hoveredProduct === p.slug && (
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
              ))}
            </AnimatePresence>
          </motion.ul>
        </LayoutGroup>
      )}
    </div>
  );
}