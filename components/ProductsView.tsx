"use client";

import { useState, useMemo } from "react";
import ProductThumb from "@/components/ProductThumb";

import { Product } from "@/sanity.types";
import { SlidersHorizontal, X, Grid3x3, Rows3 } from "lucide-react";
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

  const itemsPerPage = 12;

  // Filtrar e ordenar produtos
  const filteredAndSorted = useMemo(() => {
    let filtered = [...products];

console.log('Produto exemplo:', products[0]);
console.log('Categorias do produto:', products[0]?.categories);
  console.log('selectedCategory:', selectedCategory);

    // Filtrar por categoria
   if (selectedCategory) {
  filtered = filtered.filter((p) => {
    const categories = p.categories || [];
    return categories.some((cat: any) => {
      // Suporta categoria expandida (_id) ou referência (_ref)
      return cat._id === selectedCategory || cat._ref === selectedCategory;
    });
  });
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
      // "recent" mantém ordem original
    }

    return filtered;
  }, [products, selectedCategory, sortBy]);

  // Paginar
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedProducts = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset página ao mudar filtros
  const handleFilterChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: typeof sortBy) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  return (
    <div className="w-full space-y-6">
      {/* Barra de Filtros - Mobile & Desktop */}
      <div className="sticky top-[72px] z-30 -mx-4 bg-white/95 px-4 py-3 shadow-md backdrop-blur-lg sm:top-[80px] sm:mx-0 sm:rounded-2xl sm:border-2 sm:border-gray-200 sm:px-6 sm:shadow-lg">
        <div className="flex flex-col gap-3">
          {/* Linha 1: Controles principais */}
          <div className="flex items-center justify-between gap-3">
            {/* Botão Filtros Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 font-bold text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50 lg:hidden"
            >
              <SlidersHorizontal className="size-5" />
              <span>Filtros</span>
              {selectedCategory && (
                <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  1
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-xl border-2 border-gray-200 bg-white p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Grid3x3 className="size-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Rows3 className="size-5" />
              </button>
            </div>

            {/* Ordenar - Desktop */}
            <div className="hidden items-center gap-2 lg:flex">
              <span className="text-sm font-semibold text-gray-600">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
                className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 font-bold text-gray-900 transition-all hover:border-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="recent">Mais Recentes</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="name">Nome (A-Z)</option>
              </select>
            </div>

            {/* Ordenar - Mobile */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
              className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 transition-all hover:border-blue-500 lg:hidden"
            >
              <option value="recent">Recentes</option>
              <option value="price-asc">Menor €</option>
              <option value="price-desc">Maior €</option>
              <option value="name">A-Z</option>
            </select>
          </div>

          {/* Linha 2: Categorias Desktop */}
          {categories.length > 0 && (
            <div className="hidden items-center gap-2 overflow-x-auto pb-2 lg:flex [scrollbar-width:thin]">
              <button
                onClick={() => handleFilterChange(null)}
                className={`shrink-0 rounded-xl border-2 px-4 py-2 font-bold transition-all ${
                  selectedCategory === null
                    ? "border-blue-500 bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-500 hover:bg-blue-50"
                }`}
              >
                Todas Categorias
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleFilterChange(cat._id)}
                  className={`shrink-0 rounded-xl border-2 px-4 py-2 font-bold transition-all ${
                    selectedCategory === cat._id
                      ? "border-blue-500 bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-500 hover:bg-blue-50"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtros Mobile - Dropdown */}
        {showFilters && categories.length > 0 && (
          <div className="mt-3 space-y-2 rounded-xl border-2 border-gray-200 bg-gray-50 p-4 lg:hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Categorias</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  handleFilterChange(null);
                  setShowFilters(false);
                }}
                className={`w-full rounded-lg border-2 px-4 py-2.5 text-left font-bold transition-all ${
                  selectedCategory === null
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-700"
                }`}
              >
                Todas Categorias
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => {
                    handleFilterChange(cat._id);
                    setShowFilters(false);
                  }}
                  className={`w-full rounded-lg border-2 px-4 py-2.5 text-left font-bold transition-all ${
                    selectedCategory === cat._id
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contador de Resultados */}
      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 sm:px-6">
        <p className="text-sm font-semibold text-gray-600">
          Exibindo <span className="text-blue-600">{paginatedProducts.length}</span> de{" "}
          <span className="text-blue-600">{filteredAndSorted.length}</span> produtos
        </p>
        {selectedCategory && (
          <button
            onClick={() => handleFilterChange(null)}
            className="flex items-center gap-1 text-sm font-bold text-red-600 hover:underline"
          >
            <X className="size-4" />
            Limpar filtro
          </button>
        )}
      </div>

      {/* Grid de Produtos */}
      {paginatedProducts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-16 text-center">
          <p className="text-lg font-bold text-gray-600">
            Nenhum produto encontrado com os filtros selecionados.
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
          }
        >
          {paginatedProducts.map((product) => (
            <ProductThumb key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <ProductsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}