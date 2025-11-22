"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Hash,
  Loader2,
} from "lucide-react";

interface ProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

export default function ProductsPagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 12,
  totalItems,
}: ProductsPaginationProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showJumpTo, setShowJumpTo] = useState(false);
  const [jumpToPage, setJumpToPage] = useState("");
  const [inputError, setInputError] = useState(false);

  // Progress da paginação (0-100%)
  const progress = (currentPage / totalPages) * 100;

  // Reset jump input quando fecha
  useEffect(() => {
    if (!showJumpTo) {
      setJumpToPage("");
      setInputError(false);
    }
  }, [showJumpTo]);

  const handlePageChange = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return;

    // Haptic feedback
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(30);
    }

    setIsTransitioning(true);
    onPageChange(page);

    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage, 10);

    if (isNaN(page) || page < 1 || page > totalPages) {
      setInputError(true);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([50, 30, 50]); // Vibração de erro
      }
      setTimeout(() => setInputError(false), 500);
      return;
    }

    handlePageChange(page);
    setShowJumpTo(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJumpToPage();
    } else if (e.key === "Escape") {
      setShowJumpTo(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showJumpTo) return; // Não interfere quando está no input

      if (e.key === "ArrowLeft" && currentPage > 1) {
        handlePageChange(currentPage - 1);
      } else if (e.key === "ArrowRight" && currentPage < totalPages) {
        handlePageChange(currentPage + 1);
      } else if (e.key === "Home") {
        handlePageChange(1);
      } else if (e.key === "End") {
        handlePageChange(totalPages);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, showJumpTo]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = window.innerWidth < 640 ? 3 : 5;

    if (totalPages <= maxVisible + 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Sempre mostra primeira página
    pages.push(1);

    const showLeftEllipsis = currentPage > maxVisible - 1;
    const showRightEllipsis = currentPage < totalPages - (maxVisible - 2);

    if (showLeftEllipsis) {
      pages.push("left-ellipsis");
    }

    // Páginas ao redor da atual
    const start = Math.max(2, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages - 1, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      if (i < totalPages) {
        pages.push(i);
      }
    }

    if (showRightEllipsis && !pages.includes(totalPages - 1)) {
      pages.push("right-ellipsis");
    }

    // Sempre mostra última página
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="w-full space-y-4">
      {/* Progress Bar */}
      <div className="overflow-hidden rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 p-0.5 shadow-inner">
        <div className="h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 shadow-lg shadow-blue-500/30 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>
        </div>
      </div>

      {/* Pagination Container */}
      <div className="flex flex-col gap-4 rounded-3xl border-2 border-gray-100 bg-gradient-to-br from-white via-gray-50/50 to-white p-4 shadow-xl backdrop-blur-sm sm:p-6">
        {/* Main Pagination Controls */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          {/* First Page - Desktop */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || isTransitioning}
            className="group hidden size-11 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-600 shadow-sm transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md hover:scale-105 disabled:pointer-events-none disabled:opacity-30 active:scale-95 sm:flex"
            title="Primeira página (Home)"
            aria-label="Ir para primeira página"
          >
            <ChevronsLeft className="size-5 transition-transform group-hover:-translate-x-0.5" strokeWidth={2.5} />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isTransitioning}
            className="group flex size-11 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md hover:scale-105 disabled:pointer-events-none disabled:opacity-30 active:scale-95 sm:size-12"
            title="Página anterior (←)"
            aria-label="Ir para página anterior"
          >
            <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-0.5 sm:size-6" strokeWidth={2.5} />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {getPageNumbers().map((page, index) => {
              if (typeof page === "string") {
                return (
                  <button
                    key={page}
                    onClick={() => setShowJumpTo(true)}
                    className="flex size-10 items-center justify-center rounded-xl text-gray-400 transition-all duration-300 hover:text-blue-600 hover:scale-110 active:scale-95 sm:size-11"
                    title="Ir para página..."
                  >
                    <span className="text-lg font-black">...</span>
                  </button>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={isTransitioning}
                  className={[
                    "relative flex size-10 items-center justify-center rounded-xl border-2 font-bold transition-all duration-300 sm:size-11 sm:text-base",
                    isActive
                      ? "scale-110 border-transparent bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 text-white shadow-xl shadow-blue-500/40 ring-2 ring-blue-300 ring-offset-2"
                      : "border-gray-200 bg-white text-gray-700 shadow-sm hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md hover:scale-105 active:scale-95",
                    isTransitioning && "pointer-events-none",
                  ].join(" ")}
                  aria-label={`Ir para página ${pageNum}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="relative z-10">{pageNum}</span>
                  {isActive && (
                    <>
                      <div className="absolute inset-0 animate-shimmer rounded-xl bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      <div className="absolute inset-0 animate-pulse-ring rounded-xl bg-blue-400/20" />
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isTransitioning}
            className="group flex size-11 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md hover:scale-105 disabled:pointer-events-none disabled:opacity-30 active:scale-95 sm:size-12"
            title="Próxima página (→)"
            aria-label="Ir para próxima página"
          >
            <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5 sm:size-6" strokeWidth={2.5} />
          </button>

          {/* Last Page - Desktop */}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || isTransitioning}
            className="group hidden size-11 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-600 shadow-sm transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md hover:scale-105 disabled:pointer-events-none disabled:opacity-30 active:scale-95 sm:flex"
            title="Última página (End)"
            aria-label="Ir para última página"
          >
            <ChevronsRight className="size-5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Bottom Info & Actions */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          {/* Page Info */}
          <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-50 via-violet-50 to-purple-50 px-4 py-2 ring-1 ring-blue-200/50">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-600">Página</span>
              <span className="flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 px-2.5 py-0.5 text-base font-black text-white shadow-lg min-w-[32px]">
                {isTransitioning ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  currentPage
                )}
              </span>
              <span className="text-sm font-semibold text-gray-600">de</span>
              <span className="flex items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 px-2.5 py-0.5 text-base font-black text-white shadow-lg min-w-[32px]">
                {totalPages}
              </span>
            </div>
          </div>

          {/* Jump to Page */}
          {showJumpTo ? (
            <div className="flex items-center gap-2 rounded-xl bg-white p-2 ring-2 ring-blue-500 animate-slide-down">
              <Hash className="size-4 text-blue-600" strokeWidth={2.5} />
              <input
                type="number"
                min="1"
                max={totalPages}
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`1-${totalPages}`}
                autoFocus
                className={[
                  "w-20 rounded-lg border-2 px-2 py-1 text-center text-sm font-bold transition-all focus:outline-none focus:ring-2",
                  inputError
                    ? "border-red-500 bg-red-50 text-red-700 ring-red-500/50 animate-shake"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/50",
                ].join(" ")}
              />
              <button
                onClick={handleJumpToPage}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-1 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
              >
                Ir
              </button>
              <button
                onClick={() => setShowJumpTo(false)}
                className="rounded-lg bg-gray-200 px-2 py-1 text-sm font-bold text-gray-700 transition-all hover:bg-gray-300 active:scale-95"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowJumpTo(true)}
              className="group flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md hover:scale-105 active:scale-95"
            >
              <Hash className="size-4 transition-transform group-hover:rotate-12" strokeWidth={2.5} />
              <span>Ir para...</span>
            </button>
          )}

          {/* Total Items (if provided) */}
          {totalItems !== undefined && (
            <div className="hidden items-center gap-1.5 text-sm font-semibold text-gray-600 lg:flex">
              <div className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1">
                <span className="text-gray-500">Total:</span>
                <span className="font-black text-blue-600">{totalItems}</span>
                <span className="text-gray-500">itens</span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile: First/Last Quick Actions */}
        <div className="flex items-center justify-center gap-2 sm:hidden">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || isTransitioning}
            className="flex items-center gap-1.5 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 active:scale-95"
          >
            <ChevronsLeft className="size-4" strokeWidth={2.5} />
            Primeira
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || isTransitioning}
            className="flex items-center gap-1.5 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 active:scale-95"
          >
            Última
            <ChevronsRight className="size-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Keyboard Hints - Desktop Only */}
        <div className="hidden items-center justify-center gap-4 border-t border-gray-200 pt-3 lg:flex">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <kbd className="rounded bg-gray-100 px-2 py-1 font-mono font-bold text-gray-700 ring-1 ring-gray-300">←</kbd>
            <kbd className="rounded bg-gray-100 px-2 py-1 font-mono font-bold text-gray-700 ring-1 ring-gray-300">→</kbd>
            <span>Navegar</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-gray-700 ring-1 ring-gray-300">Home</kbd>
            <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-gray-700 ring-1 ring-gray-300">End</kbd>
            <span>Primeira/Última</span>
          </div>
        </div>
      </div>
    </div>
  );
}