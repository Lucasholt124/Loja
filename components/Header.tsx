"use client";

import {
  ClerkLoaded,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Form from "next/form";
import { PackageIcon, TrolleyIcon } from "@sanity/icons";
import { Heart, Search, Menu, X, Sparkles } from "lucide-react";
import useBasketStore from "@/lib/store";
import { useWishlistCount } from "@/lib/useWishlistCount";

const Header = () => {
  const { user } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const itemCount = useBasketStore((state) =>
    state.items.reduce((total: number, item: any) => total + item.quantity, 0)
  );

  const { count: favoritesCount = 0, loading: favLoading } = useWishlistCount(!!user);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-gray-200/80 bg-white/95 shadow-lg backdrop-blur-xl"
            : "border-b border-transparent bg-white/90 backdrop-blur-md"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4 lg:px-6">
          {/* Desktop & Mobile Unified Layout */}
          <div className="flex items-center justify-between gap-2 py-2.5 sm:gap-4 sm:py-3 lg:py-4">
            {/* Logo com efeito premium */}
            <Link
              href="/"
              className="group relative flex items-center gap-2 text-2xl font-black tracking-tight lg:text-3xl"
            >
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30" />
              <span className="relative bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
                Loja
              </span>
              <Sparkles className="relative size-5 text-violet-600 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:rotate-12" />
            </Link>

            {/* Search - Desktop */}
            <Form
              action="/search"
              role="search"
              aria-label="Pesquisar produtos"
              className="hidden flex-1 max-w-2xl lg:block"
            >
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                <input
                  type="search"
                  name="query"
                  placeholder="Buscar produtos incríveis..."
                  autoComplete="off"
                  className="h-12 w-full rounded-2xl border-2 border-gray-200 bg-gray-50/50 pl-12 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10"
                />
              </div>
            </Form>

            {/* Actions - Desktop */}
            <div className="hidden items-center gap-2 lg:flex">
              <ClerkLoaded>
                <SignedIn>
                  <Link
                    href="/favorites"
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-rose-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-0.5"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative flex items-center gap-2">
                      <Heart className="size-5" fill="currentColor" />
                      <span>Favoritos</span>
                      {favoritesCount > 0 && (
                        <span className="flex size-6 items-center justify-center rounded-full bg-white text-xs font-black text-rose-600 shadow-sm">
                          {favLoading ? "…" : favoritesCount}
                        </span>
                      )}
                    </div>
                  </Link>
                </SignedIn>

                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-rose-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-0.5">
                      <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="relative flex items-center gap-2">
                        <Heart className="size-5" />
                        <span>Favoritos</span>
                        <span className="flex size-6 items-center justify-center rounded-full bg-white text-xs font-black text-rose-600">
                          0
                        </span>
                      </div>
                    </button>
                  </SignInButton>
                </SignedOut>
              </ClerkLoaded>

              <Link
                href="/basket"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex items-center gap-2">
                  <TrolleyIcon className="size-5" />
                  <span>Cesta</span>
                  {itemCount > 0 && (
                    <span className="flex size-6 items-center justify-center rounded-full bg-white text-xs font-black text-blue-600 shadow-sm animate-pulse">
                      {itemCount}
                    </span>
                  )}
                </div>
              </Link>

              <ClerkLoaded>
                <SignedIn>
                  <Link
                    href="/orders"
                    className="rounded-2xl border-2 border-gray-200 bg-white px-5 py-2.5 font-bold text-gray-700 transition-all duration-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-2">
                      <PackageIcon className="size-5" />
                      <span>Pedidos</span>
                    </div>
                  </Link>
                </SignedIn>
              </ClerkLoaded>

              <ClerkLoaded>
                {user ? (
                  <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-2 transition-all duration-300 hover:border-blue-500 hover:bg-blue-50">
                    <UserButton />
                    <div className="max-w-[120px]">
                      <p className="text-xs font-medium text-gray-500">Olá,</p>
                      <p className="truncate text-sm font-bold text-gray-900">
                        {user.fullName}
                      </p>
                    </div>
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <button className="rounded-2xl border-2 border-gray-200 bg-white px-5 py-2.5 font-bold text-gray-700 transition-all duration-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:-translate-y-0.5">
                      Entrar
                    </button>
                  </SignInButton>
                )}
              </ClerkLoaded>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 lg:hidden">
              <Link
                href="/basket"
                className="relative rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 p-2.5 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <TrolleyIcon className="size-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-xl border-2 border-gray-200 bg-white p-2.5 text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50 active:scale-95"
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <Form action="/search" className="pb-3 lg:hidden">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-600" />
              <input
                type="search"
                name="query"
                placeholder="Buscar..."
                autoComplete="off"
                className="h-11 w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:shadow-lg"
              />
            </div>
          </Form>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingTop: "calc(env(safe-area-inset-top) + 4rem)" }}
          >
            <div className="flex flex-col gap-3 p-4">
              <ClerkLoaded>
                <SignedIn>
                  <Link
                    href="/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 p-4 font-bold text-white shadow-lg transition-transform active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="size-5" fill="currentColor" />
                      <span>Favoritos</span>
                    </div>
                    {favoritesCount > 0 && (
                      <span className="flex size-7 items-center justify-center rounded-full bg-white text-sm font-black text-rose-600">
                        {favoritesCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-white p-4 font-bold text-gray-700 transition-all active:scale-95"
                  >
                    <PackageIcon className="size-5" />
                    <span>Meus Pedidos</span>
                  </Link>
                </SignedIn>

                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 p-4 font-bold text-white shadow-lg transition-transform active:scale-95">
                      <Heart className="size-5" />
                      Ver Favoritos
                    </button>
                  </SignInButton>
                </SignedOut>

                {user ? (
                  <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
                    <UserButton />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Conectado como</p>
                      <p className="text-sm font-bold text-gray-900">{user.fullName}</p>
                    </div>
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <button className="rounded-xl border-2 border-blue-600 bg-blue-50 p-4 font-bold text-blue-600 transition-all active:scale-95">
                      Entrar na Conta
                    </button>
                  </SignInButton>
                )}
              </ClerkLoaded>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;