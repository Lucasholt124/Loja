"use client";

import { useState, useMemo, useEffect } from "react";
import ProductThumb from "@/components/ProductThumb";
import { Product } from "@/sanity.types";
import {
  X,
  Grid3x3,
  Rows3,
  Search,

  ChevronDown,
  ArrowUp,
  Package,
  SlidersHorizontal,
} from "lucide-react";
import ProductsPagination from "./ProductsPagination";
import { AnimatePresence, motion } from "framer-motion";

interface ProductsViewProps {
  products: Product[];
  categories?: Array<{ _id: string; title: string; slug: string }>;
  selectedCategory?: string | null;
}

export default function ProductsView({
  products,
  categories = [],
  selectedCategory: initialCategory = null,
}: ProductsViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [sortBy, setSortBy] = useState<"recent" | "price-asc" | "price-desc" | "name">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const itemsPerPage = 12;

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter((p) => {
        const cats = p.categories || [];
        return cats.some((cat: any) => cat._id === selectedCategory || cat._ref === selectedCategory);
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        (p.name?.toLowerCase().includes(query) ||
        p.description?.toString().toLowerCase().includes(query))
      );
    }

    switch (sortBy) {
      case "price-asc": filtered.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case "price-desc": filtered.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case "name": filtered.sort((a, b) => (a.name || "").localeCompare(b.name || "")); break;
      default: break;
    }

    return filtered;
  }, [products, selectedCategory, sortBy, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedProducts = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleFilterChange = (category: string | null) => {
    setIsLoading(true);
    setSelectedCategory(category);
    setCurrentPage(1);
    setTimeout(() => setIsLoading(false), 300);
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen space-y-4">
      {/* --- STICKY CONTROL BAR (Compacta) --- */}
      <div className="sticky top-[56px] z-30 -mx-4 flex flex-col gap-2 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-xl transition-all sm:mx-0 sm:top-[64px] sm:rounded-b-2xl sm:px-6">

        {/* Linha 1: Busca e Controles */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">

          {/* Busca (Expande em mobile) */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar produtos..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-8 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Ações (Sort & View) */}
          <div className="flex items-center justify-between gap-2 md:justify-end">
            {/* Toggle Filtros Mobile (Só aparece se houver categorias) */}
            {categories.length > 0 && (
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-bold transition-all md:hidden ${
                  selectedCategory
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-200 bg-white text-gray-600"
                }`}
              >
                <SlidersHorizontal className="size-4" />
                <span className="text-xs">Filtros</span>
              </button>
            )}

            {/* Ordenação (Compacta) */}
            <div className="relative min-w-[140px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-3 pr-8 text-xs font-bold text-gray-700 outline-none transition-all focus:border-blue-500 sm:text-sm"
              >
                <option value="recent">Mais Recentes</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="name">Nome (A-Z)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>

            {/* View Toggle */}
            <div className="hidden h-10 items-center rounded-xl border border-gray-200 bg-gray-50 p-1 sm:flex">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-1.5 transition-all ${
                  viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Grid3x3 className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-1.5 transition-all ${
                  viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Rows3 className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Linha 2: Categorias (Desktop: Tags Horizontal / Mobile: Dropdown) */}
        {categories.length > 0 && (
          <>
            {/* Desktop: Scroll Horizontal Limpo */}
            <div className="hidden items-center gap-2 overflow-x-auto pb-1 scrollbar-hide md:flex">
              <button
                onClick={() => handleFilterChange(null)}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                  selectedCategory === null
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleFilterChange(cat._id)}
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                    selectedCategory === cat._id
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* Mobile: Painel Expansível */}
            <AnimatePresence>
              {showMobileFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden md:hidden"
                >
                  <div className="grid grid-cols-2 gap-2 pb-2 pt-2">
                    <button
                      onClick={() => { handleFilterChange(null); setShowMobileFilters(false); }}
                      className={`rounded-lg border px-3 py-2 text-xs font-bold ${
                        selectedCategory === null ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200"
                      }`}
                    >
                      Todos
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => { handleFilterChange(cat._id); setShowMobileFilters(false); }}
                        className={`truncate rounded-lg border px-3 py-2 text-xs font-bold ${
                          selectedCategory === cat._id ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200"
                        }`}
                      >
                        {cat.title}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* --- STATUS BAR (Resultados e Filtros Ativos) --- */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-gray-500">
          Mostrando <strong className="text-gray-900">{paginatedProducts.length}</strong> de {filteredAndSorted.length} resultados
        </p>

        {(selectedCategory || searchQuery) && (
          <button
            onClick={clearAllFilters}
            className="text-xs font-bold text-red-500 hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* --- GRID DE PRODUTOS --- */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : paginatedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-6">
            <Package className="size-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Nenhum produto encontrado</h3>
          <p className="text-sm text-gray-500">Tente mudar os filtros ou a busca.</p>
          <button
            onClick={clearAllFilters}
            className="mt-4 rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            Limpar tudo
          </button>
        </div>
      ) : (
        <div
          className={`transition-all ${
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
          }`}
        >
          {paginatedProducts.map((product) => (
            <div key={product._id} className="transition-opacity duration-300">
              <ProductThumb product={product} />
            </div>
          ))}
        </div>
      )}

      {/* --- PAGINAÇÃO --- */}
      {totalPages > 1 && !isLoading && (
        <div className="pt-4">
          <ProductsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              scrollToTop();
            }}
          />
        </div>
      )}

      {/* Scroll Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 flex size-10 items-center justify-center rounded-full bg-black text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
          >
            <ArrowUp className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}