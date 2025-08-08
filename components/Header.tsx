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
import React from "react";
import Form from "next/form";
import { PackageIcon, TrolleyIcon } from "@sanity/icons";
import { Heart } from "lucide-react";
import useBasketStore from "@/lib/store";
import { useWishlistCount } from "@/lib/useWishlistCount";

const Header = () => {
  const { user } = useUser();

  const itemCount = useBasketStore((state) =>
    state.items.reduce((total: number, item: any) => total + item.quantity, 0)
  );

  const { count: favoritesCount = 0, loading: favLoading } = useWishlistCount(!!user);

  return (
    <header
      className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur"
      // Evita corte no topo em iPhones com notch/standalone
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto w-full max-w-screen-2xl px-3 sm:px-4">
        <div className="grid grid-cols-2 items-center gap-2 py-1.5 sm:grid-cols-3 md:grid-cols-12 md:gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="order-1 col-span-1 justify-self-start text-2xl font-bold text-blue-600 hover:opacity-80 md:col-span-2"
          >
            Loja
          </Link>

          {/* Busca (um pouco menor) */}
          <Form
            action="/search"
            role="search"
            aria-label="Pesquisar produtos"
            className="order-3 col-span-2 min-w-0 md:order-2 md:col-span-5"
          >
            <div className="relative">
              <input
                type="search"
                name="query"
                placeholder="Pesquisar produtos"
                autoComplete="off"
                className="h-9 w-full min-w-0 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </Form>

          {/* Ações */}
          <div className="order-2 col-span-1 flex items-center justify-end gap-1.5 overflow-x-auto md:order-3 md:col-span-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Favoritos */}
            <ClerkLoaded>
              <SignedIn>
                <Link
                    href="/favorites"
                    aria-label="Favoritos"
                    className="relative inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-rose-600 px-3 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
                  >
                    <Heart className="h-5 w-5" />
                    <span className="hidden md:inline">Favoritos</span>
                    <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {favLoading ? "…" : favoritesCount}
                    </span>
                </Link>
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal" >
                  <button
                    aria-label="Favoritos (entrar para ver)"
                    className="relative inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-rose-600 px-3 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
                  >
                    <Heart className="h-5 w-5" />
                    <span className="hidden md:inline">Favoritos</span>
                    <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                      0
                    </span>
                  </button>
                </SignInButton>
              </SignedOut>
            </ClerkLoaded>

            {/* Cesta */}
            <Link
              href="/basket"
              aria-label="Minha Cesta"
              className="relative inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <TrolleyIcon className="h-5 w-5" />
              <span className="hidden md:inline">Minha Cesta</span>
              <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {itemCount}
              </span>
            </Link>

            {/* Meus pedidos (agora aparece também no mobile) */}
            <ClerkLoaded>
              <SignedIn>
                <Link
                  href="/orders"
                  aria-label="Meus pedidos"
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                >
                  <PackageIcon className="h-5 w-5" />
                  <span className="hidden md:inline">Meus pedidos</span>
                </Link>
              </SignedIn>
            </ClerkLoaded>

            {/* Usuário / Entrar */}
            <ClerkLoaded>
              {user ? (
                <div className="ml-1 flex shrink-0 items-center gap-2">
                  <UserButton />
                  {/* Mostra nome só do md pra cima pra evitar quebrar no mobile */}
                  <div className="hidden max-w-[140px] text-left md:block">
                    <p className="text-xs leading-none text-gray-500">Bem-vindo de volta</p>
                    <p className="truncate text-sm font-semibold leading-tight">
                      {user.fullName}
                    </p>
                  </div>
                </div>
              ) : (
                <SignInButton mode="modal" >
                  <button className="inline-flex h-10 shrink-0 items-center rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40">
                    Entrar
                  </button>
                </SignInButton>
              )}
            </ClerkLoaded>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;