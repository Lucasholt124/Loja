"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import ProductThumb from "@/components/ProductThumb";
import { Product } from "@/sanity.types";
import {

  X,
  Grid3x3,
  Rows3,
  Search,
  TrendingUp,
  Sparkles,
  ArrowUp,
  Filter,
  Package,

  ChevronDown,
} from "lucide-react";
import ProductsPagination from "./ProductsPagination";

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
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isSticky, setIsSticky] = useState(false);

  const itemsPerPage = 12;
  const lastScrollY = useRef(0);
  const filterRef = useRef<HTMLDivElement>(null);

  // Detectar scroll para mostrar/ocultar header e botão scroll-top
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show/hide scroll to top
      setShowScrollTop(currentScrollY > 400);

      // Sticky behavior
      if (filterRef.current) {
        const rect = filterRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 72);
      }

      // Auto-hide header on scroll down (mobile)
      if (window.innerWidth < 1024) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          setHeaderVisible(false);
        } else {
          setHeaderVisible(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filtrar, buscar e ordenar produtos
  const filteredAndSorted = useMemo(() => {
    let filtered = [...products];

    // Filtrar por categoria
    if (selectedCategory) {
      filtered = filtered.filter((p) => {
        const categories = p.categories || [];
        return categories.some((cat: any) =>
          cat._id === selectedCategory || cat._ref === selectedCategory
        );
      });
    }

    // Filtrar por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        (p.name?.toLowerCase().includes(query) ||
        p.description?.toString().toLowerCase().includes(query))
      );
    }

    // Ordenar
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
    }

    return filtered;
  }, [products, selectedCategory, sortBy, searchQuery]);

  // Paginar
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedProducts = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset página ao mudar filtros
  const handleFilterChange = (category: string | null) => {
    setIsLoading(true);
    setSelectedCategory(category);
    setCurrentPage(1);

    // Haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }

    setTimeout(() => setIsLoading(false), 300);
  };

  const handleSortChange = (sort: typeof sortBy) => {
    setIsLoading(true);
    setSortBy(sort);
    setCurrentPage(1);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="relative w-full space-y-4 sm:space-y-6">
      {/* Barra de Filtros - Sticky Header */}
      <div
        ref={filterRef}
        className={[
          "sticky z-40 -mx-4 bg-white/98 px-4 py-3 backdrop-blur-xl transition-all duration-300 sm:mx-0 sm:rounded-3xl sm:px-6",
          isSticky
            ? "top-[60px] shadow-2xl shadow-blue-500/10 sm:top-[72px]"
            : "top-[72px] shadow-lg sm:top-[80px]",
          headerVisible ? "translate-y-0" : "-translate-y-32 lg:translate-y-0",
          "border-2 border-gray-100",
        ].join(" ")}
      >
        {/* Barra de progresso sutil */}
        {isSticky && (
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 rounded-t-3xl" />
        )}

        <div className="flex flex-col gap-3">
          {/* Linha 1: Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full rounded-2xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 font-semibold text-gray-900 placeholder-gray-400 transition-all duration-300 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-200 p-1 transition-all hover:bg-gray-300 active:scale-90"
              >
                <X className="size-4 text-gray-600" />
              </button>
            )}
          </div>

          {/* Linha 2: Controles principais */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botão Filtros Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={[
                "relative flex items-center gap-2 rounded-xl border-2 px-3 py-2 font-bold transition-all duration-300 sm:px-4 lg:hidden",
                showFilters
                  ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 active:scale-95",
              ].join(" ")}
            >
              <Filter className="size-5" />
              <span className="hidden sm:inline">Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-xs font-black text-white shadow-lg animate-pulse">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-0.5 rounded-xl border-2 border-gray-200 bg-gray-50 p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Visualização em grade"
                className={[
                  "rounded-lg px-2.5 py-2 transition-all duration-300 sm:px-3",
                  viewMode === "grid"
                    ? "bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg scale-105"
                    : "text-gray-500 hover:bg-white hover:text-gray-700 active:scale-95",
                ].join(" ")}
              >
                <Grid3x3 className="size-5" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="Visualização em lista"
                className={[
                  "rounded-lg px-2.5 py-2 transition-all duration-300 sm:px-3",
                  viewMode === "list"
                    ? "bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg scale-105"
                    : "text-gray-500 hover:bg-white hover:text-gray-700 active:scale-95",
                ].join(" ")}
              >
                <Rows3 className="size-5" strokeWidth={2.5} />
              </button>
            </div>

            {/* Ordenar */}
            <div className="relative flex-1 sm:max-w-xs">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
                className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-3 py-2 pr-10 text-sm font-bold text-gray-900 transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 sm:px-4 sm:text-base"
              >
                <option value="recent">🆕 Mais Recentes</option>
                <option value="price-asc">💰 Menor Preço</option>
                <option value="price-desc">💎 Maior Preço</option>
                <option value="name">🔤 Nome (A-Z)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Linha 3: Categorias Desktop com Scroll Horizontal */}
          {categories.length > 0 && (
            <div className="hidden lg:block">
              <div className="relative">
                {/* Gradient fade nas bordas */}
                <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-white to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent" />

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
                  <button
                    onClick={() => handleFilterChange(null)}
                    className={[
                      "group relative shrink-0 overflow-hidden rounded-xl border-2 px-5 py-2.5 font-bold transition-all duration-300 hover:scale-105 active:scale-95",
                      selectedCategory === null
                        ? "border-transparent bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 text-white shadow-xl shadow-blue-500/30"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50",
                    ].join(" ")}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Sparkles className="size-4" />
                      Todas Categorias
                    </span>
                    {selectedCategory === null && (
                      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    )}
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => handleFilterChange(cat._id)}
                      className={[
                        "group relative shrink-0 overflow-hidden rounded-xl border-2 px-5 py-2.5 font-bold transition-all duration-300 hover:scale-105 active:scale-95",
                        selectedCategory === cat._id
                          ? "border-transparent bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 text-white shadow-xl shadow-blue-500/30"
                          : "border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50",
                      ].join(" ")}
                    >
                      <span className="relative z-10">{cat.title}</span>
                      {selectedCategory === cat._id && (
                        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtros Mobile - Dropdown Animado */}
        {showFilters && categories.length > 0 && (
          <div className="mt-3 animate-slide-down space-y-3 overflow-hidden rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-4 shadow-xl lg:hidden">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-black text-gray-900">
                <Filter className="size-5 text-blue-600" />
                Categorias
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="rounded-full bg-gray-200 p-1.5 transition-all hover:bg-gray-300 active:scale-90"
              >
                <X className="size-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  handleFilterChange(null);
                  setShowFilters(false);
                }}
                className={[
                  "w-full rounded-xl border-2 px-4 py-3 text-left font-bold transition-all duration-300 active:scale-95",
                  selectedCategory === null
                    ? "border-blue-500 bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-400",
                ].join(" ")}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="size-4" />
                  Todas Categorias
                </span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => {
                    handleFilterChange(cat._id);
                    setShowFilters(false);
                  }}
                  className={[
                    "w-full rounded-xl border-2 px-4 py-3 text-left font-bold transition-all duration-300 active:scale-95",
                    selectedCategory === cat._id
                      ? "border-blue-500 bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-400",
                  ].join(" ")}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contador de Resultados + Active Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-50 via-violet-50 to-purple-50 px-4 py-3 ring-1 ring-blue-200/50 sm:px-6">
          <Package className="size-5 text-blue-600" strokeWidth={2.5} />
          <p className="text-sm font-bold text-gray-700">
            Exibindo{" "}
            <span className="text-lg font-black text-blue-600">
              {paginatedProducts.length}
            </span>{" "}
            de{" "}
            <span className="text-lg font-black text-violet-600">
              {filteredAndSorted.length}
            </span>{" "}
            produto{filteredAndSorted.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Active Filters Tags */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {selectedCategory && (
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-bold text-blue-700 ring-1 ring-blue-300">
                {categories.find((c) => c._id === selectedCategory)?.title}
                <button
                  onClick={() => handleFilterChange(null)}
                  className="rounded-full bg-blue-200 p-0.5 transition-all hover:bg-blue-300 active:scale-90"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-bold text-violet-700 ring-1 ring-violet-300">
                Busca: {searchQuery.slice(0, 20)}{searchQuery.length > 20 ? "..." : ""}
                <button
                  onClick={() => handleSearchChange("")}
                  className="rounded-full bg-violet-200 p-0.5 transition-all hover:bg-violet-300 active:scale-90"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-4 py-1.5 text-sm font-bold text-red-700 ring-1 ring-red-300 transition-all hover:bg-red-200 active:scale-95"
            >
              <X className="size-3.5" />
              Limpar tudo
            </button>
          </div>
        )}
      </div>

      {/* Grid de Produtos com Loading State */}
      {isLoading ? (
        <div className={
          viewMode === "grid"
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
            : "space-y-4"
        }>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl border-2 border-gray-200 bg-gray-50 p-6"
            >
              <div className="aspect-square w-full rounded-2xl bg-gray-200" />
              <div className="mt-4 space-y-3">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
                <div className="h-10 w-full rounded-xl bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : paginatedProducts.length === 0 ? (
        // Empty State Melhorado
        <div className="flex min-h-[400px] items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8 sm:p-16">
          <div className="text-center">
            <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100">
              <Search className="size-12 text-blue-600" strokeWidth={1.5} />
            </div>
            <h3 className="mb-3 text-2xl font-black text-gray-900">
              Nenhum produto encontrado
            </h3>
            <p className="mb-6 text-gray-600">
              Tente ajustar seus filtros ou fazer uma nova busca
            </p>
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-bold text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 active:scale-95"
            >
              <X className="size-5" />
              Limpar Filtros
            </button>
          </div>
        </div>
      ) : (
        <div
          className={[
            "transition-all duration-500",
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4",
          ].join(" ")}
        >
          {paginatedProducts.map((product, index) => (
            <div
              key={product._id}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: "backwards",
              }}
            >
              <ProductThumb product={product} />
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && !isLoading && (
        <div className="animate-fade-in">
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

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-2xl shadow-blue-500/40 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-blue-500/60 active:scale-95 sm:bottom-8 sm:right-8"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="size-6" strokeWidth={3} />
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/30" />
        </button>
      )}

      {/* Badge "Tendências" flutuante */}
      {filteredAndSorted.length > 0 && !selectedCategory && !searchQuery && (
        <div className="fixed bottom-24 left-6 z-40 hidden sm:block animate-bounce-slow">
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2 shadow-2xl shadow-orange-500/40 backdrop-blur-sm">
            <TrendingUp className="size-5 text-white" strokeWidth={2.5} />
            <span className="text-sm font-black text-white">
              {filteredAndSorted.length} Produtos em Alta!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}