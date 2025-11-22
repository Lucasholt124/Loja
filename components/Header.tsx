"use client";

import {
  ClerkLoaded,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Form from "next/form";
import { PackageIcon, TrolleyIcon } from "@sanity/icons";
import {
  Heart,
  Search,
  Menu,
  X,
  Sparkles,
  ShoppingBag,
  LogIn,
  ChevronDown,
  Percent,
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import useBasketStore from "@/lib/store";
import { useWishlistCount } from "@/lib/useWishlistCount";

const Header = () => {
  const { user, isLoaded } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showBasketPreview, setShowBasketPreview] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const basketPreviewRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { scrollYProgress } = useScroll();

  const itemCount = useBasketStore((state) =>
    state.items.reduce((total: number, item: any) => total + item.quantity, 0)
  );

  const basketItems = useBasketStore((state) => state.items);
  const basketTotal = useMemo(() =>
    basketItems.reduce((total, item) => total + (item.product.price || 0) * item.quantity, 0),
    [basketItems]
  );

  const { count: favoritesCount = 0 } = useWishlistCount(!!user);

  // Progress bar color transform
  const progressColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["#3b82f6", "#8b5cf6", "#ec4899"]
  );

  // Progress bar width transform
  const progressWidth = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", "100%"]
  );

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close basket preview when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (basketPreviewRef.current && !basketPreviewRef.current.contains(event.target as Node)) {
        setShowBasketPreview(false);
      }
    };

    if (showBasketPreview) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showBasketPreview]);

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Loading skeleton
  if (!mounted || !isLoaded) {
    return (
      <header className="fixed top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-xl">
        {/* Progress Bar Skeleton */}
        <div className="h-1 bg-gradient-to-r from-blue-200 via-violet-200 to-fuchsia-200 animate-pulse" />

        <div className="mx-auto w-full max-w-screen-2xl px-4 lg:px-6">
          <div className="flex items-center justify-between gap-4 py-3 lg:py-4">
            <div className="h-10 w-24 animate-pulse rounded-xl bg-gradient-to-r from-gray-200 to-gray-300" />
            <div className="hidden lg:block flex-1 max-w-xl h-11 animate-pulse rounded-xl bg-gradient-to-r from-gray-200 to-gray-300" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-24 animate-pulse rounded-xl bg-gradient-to-r from-gray-200 to-gray-300" style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          </div>
        </div>
      </header>
    );
  }

  const formatBRL = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <>
      {/* Promo Banner */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 overflow-hidden bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600"
      >
        <div className="relative flex items-center justify-center gap-2 px-4 py-2 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="size-4 text-yellow-300" fill="currentColor" />
          </motion.div>
          <p className="text-xs font-bold text-white sm:text-sm">
            <span className="hidden sm:inline">🔥 Frete Grátis em compras acima de R$ 200 • </span>
            <span className="inline-flex items-center gap-1">
              <Percent className="size-3" />
              Até 50% OFF em produtos selecionados
            </span>
          </p>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="size-4 text-yellow-300" fill="currentColor" />
          </motion.div>
        </div>
      </motion.div>

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-10 z-40 w-full transition-all duration-500 ${
          isScrolled
            ? "border-b-2 border-gray-200/80 bg-white/98 shadow-2xl shadow-blue-500/10 backdrop-blur-xl"
            : "border-b border-transparent bg-white/95 backdrop-blur-lg"
        }`}
      >
        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-1"
          style={{
            width: progressWidth,
            background: progressColor,
            boxShadow: "0 0 10px currentColor",
          }}
        />

        <div className="mx-auto w-full max-w-screen-2xl px-4 lg:px-6">
          {/* Main Layout */}
          <div className="flex items-center justify-between gap-2 py-2.5 sm:gap-4 sm:py-3 lg:py-4">
            {/* Logo */}
            <Link
              href="/"
              className="group relative flex items-center gap-2 text-xl font-black sm:text-2xl lg:text-3xl"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <span className="relative bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Loja
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                  />
                </span>
                <motion.div
                  className="absolute -right-2 -top-1"
                  animate={{ rotate: [0, 15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="size-3 text-violet-600 sm:size-4" fill="currentColor" />
                </motion.div>
              </motion.div>
            </Link>

            {/* Search - Desktop */}
            <Form
              action="/search"
              className="hidden flex-1 max-w-xl lg:block xl:max-w-2xl"
            >
              <motion.div
                animate={{
                  scale: searchFocused ? 1.02 : 1,
                }}
                className="group relative"
              >
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400 transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-blue-600" />
                <input
                  ref={searchInputRef}
                  type="search"
                  name="query"
                  placeholder="Buscar produtos... (⌘K)"
                  autoComplete="off"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="h-12 w-full rounded-2xl border-2 border-gray-200 bg-gradient-to-r from-gray-50/50 to-blue-50/50 pl-12 pr-4 text-sm font-semibold outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:shadow-2xl focus:shadow-blue-500/20 focus:ring-4 focus:ring-blue-500/10"
                />

                {/* Keyboard shortcut hint */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-focus-within:opacity-0 group-hover:opacity-100">
                  <kbd className="hidden rounded-lg bg-gray-200 px-2 py-1 text-xs font-bold text-gray-600 xl:inline-block">
                    ⌘K
                  </kbd>
                </div>
              </motion.div>
            </Form>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-2 lg:flex">
              {/* Favoritos */}
              {user ? (
                <Link href="/favorites">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2.5 font-bold text-white shadow-lg shadow-rose-500/30 transition-all hover:shadow-xl hover:shadow-rose-500/50"
                  >
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                    />

                    <div className="relative flex items-center gap-2">
                      <Heart className="size-5" fill="currentColor" strokeWidth={0} />
                      <span className="hidden xl:inline">Favoritos</span>
                      <AnimatePresence>
                        {favoritesCount > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex size-6 items-center justify-center rounded-full bg-white text-xs font-black text-rose-600 shadow-lg"
                          >
                            {favoritesCount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2.5 font-bold text-white shadow-lg shadow-rose-500/30"
                  >
                    <div className="relative flex items-center gap-2">
                      <Heart className="size-5" strokeWidth={2} />
                      <span className="hidden xl:inline">Favoritos</span>
                    </div>
                  </motion.button>
                </SignInButton>
              )}

              {/* Carrinho com Preview */}
              <div className="relative" ref={basketPreviewRef}>
                <motion.button
                  onClick={() => setShowBasketPreview(!showBasketPreview)}
                  onMouseEnter={() => setShowBasketPreview(true)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/50"
                >
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                  />

                  <div className="relative flex items-center gap-2">
                    <TrolleyIcon className="size-5" />
                    <span className="hidden xl:inline">Cesta</span>
                    <AnimatePresence>
                      {itemCount > 0 && (
                        <motion.span
                          key={itemCount}
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.2, 1] }}
                          exit={{ scale: 0 }}
                          className="flex size-6 items-center justify-center rounded-full bg-white text-xs font-black text-blue-600 shadow-lg"
                        >
                          {itemCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>

                {/* Basket Preview Dropdown */}
                <AnimatePresence>
                  {showBasketPreview && itemCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      onMouseLeave={() => setShowBasketPreview(false)}
                      className="absolute right-0 top-full mt-2 w-96 overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-2xl"
                    >
                      <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-4">
                        <h3 className="flex items-center gap-2 text-lg font-black text-white">
                          <ShoppingBag className="size-5" />
                          Sua Cesta ({itemCount} {itemCount === 1 ? "item" : "itens"})
                        </h3>
                      </div>

                      <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                        {basketItems.slice(0, 3).map((item) => (
                          <div key={item.product._id} className="flex gap-3 rounded-xl border-2 border-gray-100 bg-gray-50 p-3">
                            <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-white">
                              <ShoppingBag className="size-8 text-gray-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-bold text-gray-900">
                                {item.product.name}
                              </p>
                              <div className="mt-1 flex items-center justify-between">
                                <span className="text-xs text-gray-600">
                                  Qtd: {item.quantity}
                                </span>
                                <span className="text-sm font-black text-blue-600">
                                  {formatBRL((item.product.price || 0) * item.quantity)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {basketItems.length > 3 && (
                          <p className="text-center text-sm font-semibold text-gray-600">
                            +{basketItems.length - 3} {basketItems.length - 3 === 1 ? "item" : "itens"}
                          </p>
                        )}
                      </div>

                      <div className="border-t-2 border-gray-200 bg-gray-50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-600">Subtotal:</span>
                          <span className="text-xl font-black text-gray-900">
                            {formatBRL(basketTotal)}
                          </span>
                        </div>

                        <Link href="/basket" onClick={() => setShowBasketPreview(false)}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3 font-black text-white shadow-lg transition-all hover:shadow-xl"
                          >
                            Ver Cesta Completa
                          </motion.button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Pedidos */}
              {user && (
                <Link href="/orders">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-bold text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <div className="flex items-center gap-2">
                      <PackageIcon className="size-5" />
                      <span className="hidden xl:inline">Pedidos</span>
                    </div>
                  </motion.div>
                </Link>
              )}

              {/* User/Login */}
              {user ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-2 transition-all hover:border-blue-500 hover:shadow-lg"
                >
                  <UserButton />
                  <div className="hidden max-w-[120px] 2xl:block">
                    <p className="truncate text-xs font-bold text-gray-900">
                      {user.firstName || user.fullName}
                    </p>
                    <p className="text-xs text-gray-500">Minha Conta</p>
                  </div>
                  <ChevronDown className="size-4 text-gray-400" />
                </motion.div>
              ) : (
                <SignInButton mode="modal">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-bold text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50"
                  >
                    <LogIn className="size-5" />
                    <span>Entrar</span>
                  </motion.button>
                </SignInButton>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 lg:hidden">
              {/* Carrinho Mobile */}
              <Link href="/basket">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 p-2.5 text-white shadow-lg"
                >
                  <TrolleyIcon className="size-5" />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        key={itemCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.3, 1] }}
                        className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-red-500 text-xs font-black text-white shadow-lg"
                      >
                        {itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>

              {/* Menu Mobile */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative rounded-xl border-2 border-gray-200 bg-white p-2.5 transition-all active:scale-95"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <X className="size-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <Menu className="size-5" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Notification dot */}
                {favoritesCount > 0 && (
                  <span className="absolute right-0 top-0 flex size-3">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex size-3 rounded-full bg-red-600" />
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Search Mobile */}
          <Form action="/search" className="pb-3 lg:hidden">
            <div className="group relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-600" />
              <input
                type="search"
                name="query"
                placeholder="Buscar produtos..."
                autoComplete="off"
                className="h-11 w-full rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50/50 to-blue-50/50 pl-10 pr-4 text-sm font-semibold outline-none transition-all focus:border-blue-500 focus:bg-white focus:shadow-lg"
              />
            </div>
          </Form>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-white shadow-2xl lg:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Menu */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 bg-gradient-to-r from-blue-600 to-violet-600 p-4">
                <h2 className="text-lg font-black text-white">Menu</h2>
                <motion.button
                  whileTap={{ scale: 0.9, rotate: 90 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full bg-white/20 p-2 backdrop-blur-sm"
                >
                  <X className="size-5 text-white" />
                </motion.button>
              </div>

              {/* Conteúdo do Menu */}
              <div className="flex flex-col gap-3 p-4">
                <ClerkLoaded>
                  {user ? (
                    <>
                      {/* User Info */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/50 p-4"
                      >
                        <UserButton />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500">Olá,</p>
                          <p className="text-sm font-black text-gray-900">
                            {user.fullName}
                          </p>
                        </div>
                      </motion.div>

                      {/* Favoritos */}
                      <Link href="/favorites" onClick={() => setMobileMenuOpen(false)}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative overflow-hidden flex items-center justify-between rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 p-4 font-bold text-white shadow-lg"
                        >
                          <div className="relative flex items-center gap-3">
                            <Heart className="size-6" fill="currentColor" strokeWidth={0} />
                            <span className="text-lg">Favoritos</span>
                          </div>
                          {favoritesCount > 0 && (
                            <span className="flex size-8 items-center justify-center rounded-full bg-white text-sm font-black text-rose-600">
                              {favoritesCount}
                            </span>
                          )}
                        </motion.div>
                      </Link>

                      {/* Pedidos */}
                      <Link href="/orders" onClick={() => setMobileMenuOpen(false)}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white p-4 font-bold text-gray-700 transition-all active:bg-gray-50"
                        >
                          <PackageIcon className="size-6" />
                          <span className="text-lg">Meus Pedidos</span>
                        </motion.div>
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* Login */}
                      <SignInButton mode="modal">
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative overflow-hidden w-full rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 p-4 font-black text-white shadow-lg"
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="relative flex items-center justify-center gap-2">
                            <LogIn className="size-6" />
                            Entrar na Conta
                          </span>
                        </motion.button>
                      </SignInButton>

                      {/* Favoritos (Guest) */}
                      <SignInButton mode="modal">
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 p-4 font-bold text-white shadow-lg"
                        >
                          <Heart className="size-6" />
                          <span className="text-lg">Ver Favoritos</span>
                        </motion.button>
                      </SignInButton>
                    </>
                  )}
                </ClerkLoaded>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;