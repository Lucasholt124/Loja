"use client";

import { Product } from "@/sanity.types";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup, Variants } from "framer-motion";
import ProductThumb from "./ProductThumb";
import {
  Grid3x3,
  Rows3,
  LayoutGrid,
  ArrowUp,
  Loader2,
  Package,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";

interface ProductGridProps {
  products: Product[];
  layout?: "grid" | "list" | "masonry";
  showLayoutToggle?: boolean;
  enableInfiniteScroll?: boolean;
  itemsPerPage?: number;
  showScrollTop?: boolean;
  enableAnimations?: boolean;
  emptyStateType?: "default" | "search" | "filter";
  onLayoutChange?: (layout: "grid" | "list" | "masonry") => void;
}

const ProductGrid = ({
  products,
  layout: initialLayout = "grid",
  showLayoutToggle = true,
  enableInfiniteScroll = false,
  itemsPerPage = 12,
  showScrollTop = true,
  enableAnimations = true,
  emptyStateType = "default",
  onLayoutChange,
}: ProductGridProps) => {
  const [layout, setLayout] = useState<"grid" | "list" | "masonry">(initialLayout);
  const [displayedItems, setDisplayedItems] = useState(itemsPerPage);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const displayedProducts = useMemo(() => {
    return enableInfiniteScroll ? products.slice(0, displayedItems) : products;
  }, [products, displayedItems, enableInfiniteScroll]);

  const hasMore = displayedItems < products.length;

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 400);
    };

    if (showScrollTop) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [showScrollTop]);

  // Infinite scroll observer
  useEffect(() => {
    if (!enableInfiniteScroll || !loadMoreRef.current || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enableInfiniteScroll, hasMore, displayedItems, isLoading]);

  const loadMore = async () => {
    setIsLoading(true);

    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    setDisplayedItems((prev) => Math.min(prev + itemsPerPage, products.length));
    setIsLoading(false);
  };

  const handleLayoutChange = (newLayout: "grid" | "list" | "masonry") => {
    // Haptic feedback
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(30);
    }

    setLayout(newLayout);
    onLayoutChange?.(newLayout);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    // Haptic feedback
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([50, 30, 50]);
    }

    // Simular refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsRefreshing(false);
  };

  // Layout configurations
  const layoutConfig = {
    grid: {
      container: "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr",
      icon: Grid3x3,
      label: "Grade",
    },
    list: {
      container: "flex flex-col gap-4 sm:gap-5",
      icon: Rows3,
      label: "Lista",
    },
    masonry: {
      container: "columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3 xl:columns-4 space-y-4 sm:space-y-5",
      icon: LayoutGrid,
      label: "Masonry",
    },
  };

  const currentConfig = layoutConfig[layout];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: enableAnimations ? 0.05 : 0,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
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
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Empty States
  const emptyStates = {
    default: {
      icon: Package,
      title: "Nenhum produto encontrado",
      description: "Não há produtos disponíveis no momento.",
      action: null,
    },
    search: {
      icon: Search,
      title: "Nenhum resultado encontrado",
      description: "Tente ajustar sua busca ou filtros.",
      action: { label: "Limpar Busca", onClick: () => {} },
    },
    filter: {
      icon: Filter,
      title: "Nenhum produto corresponde aos filtros",
      description: "Tente remover alguns filtros para ver mais produtos.",
      action: { label: "Limpar Filtros", onClick: () => {} },
    },
  };

  const emptyState = emptyStates[emptyStateType];
  const EmptyIcon = emptyState.icon;

  // Empty State Component
  if (!products || products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-8 sm:p-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 shadow-lg sm:size-24"
        >
          <EmptyIcon className="size-10 text-blue-600 sm:size-12" strokeWidth={1.5} />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-3 text-center text-xl font-black text-gray-900 sm:text-2xl"
        >
          {emptyState.title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 max-w-md text-center text-sm text-gray-600 sm:text-base"
        >
          {emptyState.description}
        </motion.p>

        {emptyState.action && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={emptyState.action.onClick}
            className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-bold text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 active:scale-95"
          >
            <RefreshCw className="size-5 transition-transform group-hover:rotate-180" strokeWidth={2.5} />
            {emptyState.action.label}
          </motion.button>
        )}

        {/* Decorative Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
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
            className="absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br from-blue-400/20 to-violet-400/20 blur-3xl"
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
            className="absolute -bottom-10 -left-10 size-40 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20 blur-3xl"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      {/* Header with Layout Toggle */}
      {showLayoutToggle && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-between rounded-2xl border-2 border-gray-200 bg-gradient-to-r from-white to-gray-50/50 p-3 shadow-lg backdrop-blur-sm sm:mb-6 sm:p-4"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-50 to-violet-50 px-3 py-2 ring-1 ring-blue-200/50">
              <TrendingUp className="size-4 text-blue-600 sm:size-5" strokeWidth={2.5} />
              <span className="text-sm font-bold text-gray-900 sm:text-base">
                {products.length} {products.length === 1 ? "Produto" : "Produtos"}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-2 text-green-700 ring-1 ring-green-200/50 transition-all hover:scale-110 hover:shadow-md active:scale-95 disabled:opacity-50"
              aria-label="Atualizar"
            >
              <RefreshCw
                className={`size-4 sm:size-5 ${isRefreshing ? "animate-spin" : ""}`}
                strokeWidth={2.5}
              />
            </button>
          </div>

          {/* Layout Toggle */}
          <div className="flex items-center gap-1 rounded-xl border-2 border-gray-200 bg-white p-1 shadow-sm">
            {(Object.keys(layoutConfig) as Array<keyof typeof layoutConfig>).map((key) => {
              const config = layoutConfig[key];
              const Icon = config.icon;
              const isActive = layout === key;

              return (
                <button
                  key={key}
                  onClick={() => handleLayoutChange(key)}
                  className={[
                    "group relative rounded-lg px-2.5 py-1.5 transition-all duration-300 sm:px-3 sm:py-2",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg scale-105"
                      : "text-gray-600 hover:bg-gray-100 hover:scale-105 active:scale-95",
                  ].join(" ")}
                  aria-label={`Layout ${config.label}`}
                  title={config.label}
                >
                  <Icon
                    className="size-4 sm:size-5"
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeLayout"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/20 to-violet-600/20"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Products Grid */}
      <LayoutGroup>
        <motion.div
          ref={gridRef}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={currentConfig.container}
        >
          <AnimatePresence mode="popLayout">
            {displayedProducts.map((product, index) => (
              <motion.div
                key={product._id}
                layout
                variants={enableAnimations ? itemVariants : undefined}
                initial={enableAnimations ? "hidden" : undefined}
                animate={enableAnimations ? "visible" : undefined}
                exit={enableAnimations ? "exit" : undefined}
                transition={{
                  layout: { duration: 0.3 },
                }}
                className={[
                  "h-full",
                  layout === "masonry" ? "break-inside-avoid" : "",
                ].join(" ")}
              >
                <ProductThumb product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {/* Infinite Scroll Trigger */}
      {enableInfiniteScroll && hasMore && (
        <div ref={loadMoreRef} className="mt-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            {isLoading && (
              <div className="flex items-center gap-3 rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-violet-50 px-6 py-3 shadow-lg">
                <Loader2 className="size-5 animate-spin text-blue-600" strokeWidth={2.5} />
                <span className="text-sm font-bold text-blue-900">
                  Carregando mais produtos...
                </span>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Loading More Indicator */}
      {isLoading && !enableInfiniteScroll && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-center"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-white shadow-xl shadow-blue-500/30">
            <Loader2 className="size-5 animate-spin" strokeWidth={2.5} />
            <span className="text-sm font-bold">Carregando...</span>
          </div>
        </motion.div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && showScrollButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-2xl shadow-blue-500/40 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-blue-500/60 active:scale-95 sm:bottom-8 sm:right-8"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="size-6" strokeWidth={3} />

          {/* Pulse Ring */}
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-400/30"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.button>
      )}

      {/* Stats Bar (se tiver mais produtos para carregar) */}
      {enableInfiniteScroll && !hasMore && displayedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex flex-col items-center gap-4 rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 text-center shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-6 text-green-600" fill="currentColor" />
            <h3 className="text-lg font-black text-green-900">
              Você viu todos os produtos!
            </h3>
          </div>
          <p className="text-sm text-green-700">
            {products.length} {products.length === 1 ? "produto exibido" : "produtos exibidos"}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ProductGrid;