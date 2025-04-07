"use client";

import {
  ClerkLoaded,
  SignedIn,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import Form from "next/form";
import { PackageIcon, TrolleyIcon } from "@sanity/icons";
import useBasketStore from "@/lib/store";

const Header = () => {
  const { user } = useUser();
  const itemCount = useBasketStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

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
            className=" w-full max-w-4xl rounded bg-gray-100 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            type="text"
            name="query"
            placeholder="Pesquisar produtos"
          />
        </Form>

        <div className="mt-4 flex flex-1 items-center justify-end space-x-4 sm:mt-0">
          <Link
            href="/basket"
            className="relative flex flex-1 items-center justify-center space-x-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 sm:flex-none sm:justify-start"
          >
            <TrolleyIcon className="size-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
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
                  <p className="text-gray-400">Bem vindo de volta</p>
                  <p className="font-bold">{user.fullName}</p>
                </div>
              </div>
            ) : (
              <SignInButton mode="modal" />
            )}
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
};

export default Header;
