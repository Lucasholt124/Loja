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

  // Progress bar visuals
  const progressColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["#3b82f6", "#8b5cf6", "#ec4899"]
  );
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      // Diminui a sensibilidade para ativar o modo scroll
      setIsScrolled(window.scrollY > 20);
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

  // Keyboard shortcut
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

  if (!mounted || !isLoaded) {
    return (
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-xl">
        <div className="h-1 bg-gray-100 animate-pulse" />
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-200" />
            <div className="hidden lg:block flex-1 max-w-xl h-10 animate-pulse rounded-lg bg-gray-200" />
            <div className="flex gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
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
      {/* Promo Banner - Esconde ao rolar (Translate Y) */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 h-9 overflow-hidden bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 transition-transform duration-300 ease-in-out ${
          isScrolled ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="relative flex h-full items-center justify-center gap-2 px-4 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="size-3 text-yellow-300" fill="currentColor" />
          </motion.div>
          <p className="text-[10px] font-bold text-white sm:text-xs">
            <span className="hidden sm:inline">Frete Grátis +R$200 • </span>
            <span className="inline-flex items-center gap-1">
              <Percent className="size-3" />
              Até 50% OFF
            </span>
          </p>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`fixed z-40 w-full transition-all duration-300 ease-in-out ${
          isScrolled
            ? "top-0 border-b border-gray-200/80 bg-white/95 py-2 shadow-md backdrop-blur-xl"
            : "top-9 border-b border-transparent bg-white py-3 lg:py-4"
        }`}
      >
        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px]"
          style={{
            width: progressWidth,
            background: progressColor,
            opacity: isScrolled ? 1 : 0
          }}
        />

        <div className="mx-auto w-full max-w-screen-2xl px-4 lg:px-6">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="group relative flex items-center gap-2 text-xl font-black sm:text-2xl"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Loja
                </span>
                <div className="absolute -right-2 -top-1">
                  <Sparkles className="size-3 text-violet-600" fill="currentColor" />
                </div>
              </motion.div>
            </Link>

            {/* Search - Desktop (Reduzido para h-10) */}
            <Form
              action="/search"
              className="hidden flex-1 max-w-xl lg:block xl:max-w-2xl transition-all"
            >
              <div className={`group relative transition-all ${searchFocused ? "scale-[1.01]" : "scale-100"}`}>
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                <input
                  ref={searchInputRef}
                  type="search"
                  name="query"
                  placeholder="Buscar... (⌘K)"
                  autoComplete="off"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  // Altura reduzida para h-10
                  className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm font-medium outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-blue-500/10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                  <kbd className="hidden rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 xl:inline-block">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </Form>

            {/* Desktop Actions (Botões mais compactos) */}
            <div className="hidden items-center gap-2 lg:flex">
              {/* Favoritos */}
              {user ? (
                <Link href="/favorites">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-rose-50 to-pink-50 px-3 text-sm font-bold text-rose-600 transition-colors hover:from-rose-100 hover:to-pink-100"
                  >
                    <Heart className="size-4" fill={favoritesCount > 0 ? "currentColor" : "none"} />
                    <span className="hidden xl:inline">Favoritos</span>
                    {favoritesCount > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white">
                        {favoritesCount}
                      </span>
                    )}
                  </motion.div>
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <button className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold text-gray-600 hover:bg-gray-100">
                    <Heart className="size-4" />
                  </button>
                </SignInButton>
              )}

              {/* Carrinho */}
              <div className="relative" ref={basketPreviewRef}>
                <motion.button
                  onClick={() => setShowBasketPreview(!showBasketPreview)}
                  onMouseEnter={() => setShowBasketPreview(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-shadow hover:shadow-lg hover:shadow-blue-500/30"
                >
                  <TrolleyIcon className="size-5" />
                  <span className="hidden xl:inline">Cesta</span>
                  {itemCount > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-white text-[10px] text-blue-600">
                      {itemCount}
                    </span>
                  )}
                </motion.button>

                {/* Basket Preview Dropdown */}
                <AnimatePresence>
                  {showBasketPreview && itemCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      onMouseLeave={() => setShowBasketPreview(false)}
                      className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black/5"
                    >
                      <div className="bg-gray-50 p-3 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700">Resumo da Cesta</h3>
                      </div>

                      <div className="max-h-60 overflow-y-auto p-2 space-y-2">
                        {basketItems.slice(0, 3).map((item) => (
                          <div key={item.product._id} className="flex gap-3 rounded-lg p-2 hover:bg-gray-50">
                            <div className="size-10 shrink-0 rounded bg-gray-100 flex items-center justify-center">
                               <ShoppingBag className="size-5 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs font-bold text-gray-800">{item.product.name}</p>
                              <div className="flex justify-between text-xs mt-1">
                                <span className="text-gray-500">x{item.quantity}</span>
                                <span className="font-bold text-blue-600">{formatBRL((item.product.price || 0) * item.quantity)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-100 p-3 bg-gray-50">
                        <div className="flex justify-between mb-3 text-sm">
                          <span className="font-semibold text-gray-600">Total:</span>
                          <span className="font-black text-gray-900">{formatBRL(basketTotal)}</span>
                        </div>
                        <Link href="/basket" onClick={() => setShowBasketPreview(false)}>
                          <button className="w-full rounded-lg bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700">
                            Ver Cesta Completa
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User/Login */}
              {user ? (
                <div className="flex items-center gap-2 pl-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-bold text-gray-700 hover:bg-gray-50">
                    <LogIn className="size-4" />
                    <span>Entrar</span>
                  </button>
                </SignInButton>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 lg:hidden">
              <Link href="/basket">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 p-2 text-white shadow-md"
                >
                  <TrolleyIcon className="size-5" />
                  {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
                      {itemCount}
                    </span>
                  )}
                </motion.div>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg border border-gray-200 p-2 active:bg-gray-50"
              >
                <Menu className="size-5 text-gray-700" />
                {favoritesCount > 0 && (
                    <span className="absolute top-3 right-3 size-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>
            </div>
          </div>

          {/* Search Mobile (Mais compacto) */}
          <Form action="/search" className="pb-2 pt-2 lg:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                name="query"
                placeholder="Buscar produtos..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </Form>
        </div>
      </header>

      {/* Mobile Menu Overlay (Mantido similar, apenas ajustes visuais) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-full w-[80vw] max-w-sm overflow-y-auto bg-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b bg-gray-50 p-4">
                <h2 className="font-bold text-gray-900">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)} className="rounded-full bg-gray-200 p-1">
                  <X className="size-5 text-gray-600" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                 <ClerkLoaded>
                    {user ? (
                        <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3">
                            <UserButton />
                            <div>
                                <p className="text-xs text-gray-500">Logado como</p>
                                <p className="text-sm font-bold text-gray-900">{user.fullName}</p>
                            </div>
                        </div>
                    ) : (
                        <SignInButton mode="modal">
                            <button className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white">
                                Entrar na Conta
                            </button>
                        </SignInButton>
                    )}
                 </ClerkLoaded>

                 <div className="space-y-1">
                    <Link href="/favorites" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between rounded-xl p-3 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <Heart className="size-5 text-rose-500" />
                            <span className="font-medium text-gray-700">Favoritos</span>
                        </div>
                        {favoritesCount > 0 && <span className="text-xs font-bold text-rose-500">{favoritesCount}</span>}
                    </Link>
                    <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50">
                        <PackageIcon className="size-5 text-blue-500" />
                        <span className="font-medium text-gray-700">Meus Pedidos</span>
                    </Link>
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;