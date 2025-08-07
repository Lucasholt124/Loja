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

  const { count: favoritesCount, loading: favLoading } = useWishlistCount(Boolean(user));

  return (
    <header className="flex flex-wrap items-center justify-between px-4 py-2">
      <div className="flex w-full flex-wrap items-center justify-between ">
        <Link
          href="/"
          className="mx-auto cursor-pointer text-2xl font-bold text-blue-500 hover:opacity-50 sm:mx-0"
        >
          Loja
        </Link>

        <Form
          action="/search"
          className="mt-2 max-w-md sm:mx-4 sm:mt-0 sm:w-auto sm:flex-1"
        >
          <input
            className="w-full max-w-4xl rounded bg-gray-100 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            type="text"
            name="query"
            placeholder="Pesquisar produtos"
          />
        </Form>

        <div className="mt-4 flex flex-1 items-center justify-end space-x-4 sm:mt-0">
          {/* Favoritos */}
          <ClerkLoaded>
            <SignedIn>
              <Link
                href="/favorites"
                className="relative flex flex-1 items-center justify-center space-x-2 rounded bg-rose-500 px-4 py-2 font-bold text-white hover:bg-rose-600 sm:flex-none sm:justify-start"
              >
                <Heart className="size-6" />
                <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {favLoading ? "…" : favoritesCount}
                </span>
                <span>Favoritos</span>
              </Link>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="relative flex flex-1 items-center justify-center space-x-2 rounded bg-rose-500 px-4 py-2 font-bold text-white hover:bg-rose-600 sm:flex-none sm:justify-start">
                  <Heart className="size-6" />
                  <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    0
                  </span>
                  <span>Favoritos</span>
                </button>
              </SignInButton>
            </SignedOut>
          </ClerkLoaded>

          {/* Cesta */}
          <Link
            href="/basket"
            className="relative flex flex-1 items-center justify-center space-x-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 sm:flex-none sm:justify-start"
          >
            <TrolleyIcon className="size-6" />
            <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {itemCount}
            </span>
            <span>Minha Cesta</span>
          </Link>

          <ClerkLoaded>
            <SignedIn>
              <Link
                href="/orders"
                className="relative flex flex-1 items-center justify-center space-x-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 sm:flex-none sm:justify-start"
              >
                <PackageIcon className="size-6" />
                <span>Meus pedidos</span>
              </Link>
            </SignedIn>

            {user ? (
              <div className="flex items-center space-x-2">
                <UserButton />
                <div className="hidden text-xs sm:block">
                  <p className="text-gray-400">Bem-vindo de volta</p>
                  <p className="font-bold">{user.fullName}</p>
                </div>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="rounded bg-gray-100 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-200">
                  Entrar
                </button>
              </SignInButton>
            )}
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
};

export default Header;