"use client";

import {
  ClerkLoaded,
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
  const { user, isLoaded } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const itemCount = useBasketStore((state) =>
    state.items.reduce((total: number, item: any) => total + item.quantity, 0)
  );

  const { count: favoritesCount = 0 } = useWishlistCount(!!user);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Previne hydration error
  if (!mounted || !isLoaded) {
    return (
      <header className="fixed top-0 z-40 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-screen-2xl px-4 lg:px-6">
          <div className="flex items-center justify-between gap-4 py-3 lg:py-4">
            <Link href="/" className="text-2xl font-black lg:text-3xl">
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Loja
              </span>
            </Link>
            <div className="h-10 w-32 animate-pulse rounded-xl bg-gray-100" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className={`fixed top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-gray-200/80 bg-white/95 shadow-lg backdrop-blur-xl"
            : "border-b border-transparent bg-white/90 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4 lg:px-6">
          {/* Layout Principal */}
          <div className="flex items-center justify-between gap-2 py-2.5 sm:gap-4 sm:py-3 lg:py-4">
            {/* Logo */}
            <Link
              href="/"
              className="group relative flex items-center gap-2 text-xl font-black sm:text-2xl lg:text-3xl"
            >
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
                Loja
              </span>
              <Sparkles className="size-4 text-violet-600 opacity-0 transition-all duration-300 group-hover:rotate-12 group-hover:opacity-100 sm:size-5" />
            </Link>

            {/* Search - Desktop */}
            <Form
              action="/search"
              className="hidden flex-1 max-w-xl lg:block xl:max-w-2xl"
            >
              <div className="group relative">
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                <input
                  type="search"
                  name="query"
                  placeholder="Buscar produtos..."
                  autoComplete="off"
                  className="h-11 w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:shadow-lg"
                />
              </div>
            </Form>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-2 lg:flex">
              {/* Favoritos */}
              {user ? (
                <Link
                  href="/favorites"
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <div className="relative flex items-center gap-2">
                    <Heart className="size-5" fill="currentColor" />
                    <span className="hidden xl:inline">Favoritos</span>
                    {favoritesCount > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-white text-xs font-black text-rose-600">
                        {favoritesCount}
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5">
                    <div className="relative flex items-center gap-2">
                      <Heart className="size-5" />
                      <span className="hidden xl:inline">Favoritos</span>
                    </div>
                  </button>
                </SignInButton>
              )}

              {/* Carrinho */}
              <Link
                href="/basket"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="relative flex items-center gap-2">
                  <TrolleyIcon className="size-5" />
                  <span className="hidden xl:inline">Cesta</span>
                  {itemCount > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-white text-xs font-black text-blue-600 animate-pulse">
                      {itemCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* Pedidos */}
              {user && (
                <Link
                  href="/orders"
                  className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 font-bold text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50"
                >
                  <div className="flex items-center gap-2">
                    <PackageIcon className="size-5" />
                    <span className="hidden xl:inline">Pedidos</span>
                  </div>
                </Link>
              )}

              {/* User/Login */}
              {user ? (
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-2 transition-all hover:border-blue-500">
                  <UserButton />
                  <div className="hidden max-w-[100px] 2xl:block">
                    <p className="truncate text-xs font-bold text-gray-900">
                      {user.firstName || user.fullName}
                    </p>
                  </div>
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 font-bold text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50">
                    Entrar
                  </button>
                </SignInButton>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 lg:hidden">
              {/* Carrinho Mobile */}
              <Link
                href="/basket"
                className="relative rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 p-2 text-white shadow-lg active:scale-95"
              >
                <TrolleyIcon className="size-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Menu Mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-xl border-2 border-gray-200 bg-white p-2 transition-all active:scale-95"
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          {/* Search Mobile */}
          <Form action="/search" className="pb-3 lg:hidden">
            <div className="group relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-600" />
              <input
                type="search"
                name="query"
                placeholder="Buscar..."
                autoComplete="off"
                className="h-10 w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
              />
            </div>
          </Form>
        </div>
      </header>

      {/* Menu Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Menu */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
              <h2 className="text-lg font-black text-gray-900">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Conteúdo do Menu */}
            <div className="flex flex-col gap-3 p-4">
              <ClerkLoaded>
                {user ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
                      <UserButton />
                      <div>
                        <p className="text-xs text-gray-500">Olá,</p>
                        <p className="text-sm font-bold text-gray-900">
                          {user.fullName}
                        </p>
                      </div>
                    </div>

                    {/* Favoritos */}
                    <Link
                      href="/favorites"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 p-4 font-bold text-white shadow-lg active:scale-95"
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

                    {/* Pedidos */}
                    <Link
                      href="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-white p-4 font-bold text-gray-700 active:scale-95"
                    >
                      <PackageIcon className="size-5" />
                      <span>Meus Pedidos</span>
                    </Link>
                  </>
                ) : (
                  <>
                    {/* Login */}
                    <SignInButton mode="modal">
                      <button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 p-4 font-bold text-white shadow-lg active:scale-95">
                        Entrar na Conta
                      </button>
                    </SignInButton>

                    {/* Favoritos (Guest) */}
                    <SignInButton mode="modal">
                      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 p-4 font-bold text-white shadow-lg active:scale-95">
                        <Heart className="size-5" />
                        Ver Favoritos
                      </button>
                    </SignInButton>
                  </>
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