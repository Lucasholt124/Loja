// components/FavoritesList.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useFavoritesStore from "@/lib/favoritesStore";
import { HeartIcon, TrashIcon } from "@sanity/icons";

const FavoritesList: React.FC = () => {
  const items = useFavoritesStore((s) => s.items);
  const remove = useFavoritesStore((s) => s.remove);
  const clear = useFavoritesStore((s) => s.clear);

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.title.toLowerCase().includes(q));
  }, [items, query]);

  const formatBRL = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleClearAll = () => {
    if (!items.length) return;
    if (window.confirm("Tem certeza que deseja limpar todos os favoritos?")) {
      clear();
    }
  };

  // Empty state
  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-500 ring-1 ring-rose-100">
          <HeartIcon className="size-7" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">
          Você ainda não tem favoritos
        </h2>
        <p className="mx-auto mb-6 max-w-md text-gray-500">
          Clique no coração dos produtos para salvá-los aqui e acessar depois com facilidade.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Explorar produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Favoritos</h1>
          <p className="text-sm text-gray-500">{items.length} item(s) salvos</p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar nos favoritos..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-9 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <TrashIcon className="size-4" />
            Limpar tudo
          </button>
        </div>
      </div>

      {/* Resultado da busca sem itens */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
          <p className="mb-2 text-lg font-semibold">Nada encontrado</p>
          <p className="mb-4 text-gray-500">
            Nenhum favorito corresponde a “{query}”.
          </p>
          <button
            onClick={() => setQuery("")}
            className="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Limpar busca
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const href = item.slug ? `/product/${item.slug}` : `/product/${item.id}`;
            return (
              <li
                key={item.id}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Imagem */}
                <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      sem imagem
                    </div>
                  )}

                  {/* Preço */}
                  {typeof item.price === "number" && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                      {formatBRL(item.price)}
                    </span>
                  )}

                  {/* Remover (ícone) */}
                  <button
                    aria-label="Remover dos favoritos"
                    onClick={() => remove(item.id)}
                    className="absolute right-2 top-2 inline-flex items-center justify-center rounded-full bg-white/90 p-2 text-gray-700 shadow ring-1 ring-black/5 transition hover:bg-white hover:text-rose-600"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>

                {/* Conteúdo */}
                <div className="p-4">
                  <Link
                    href={href}
                    className="block text-base font-semibold text-gray-900 transition hover:text-blue-600"
                  >
                    {item.title}
                  </Link>

                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={href}
                      className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      Ver produto
                    </Link>

                    <button
                      onClick={() => remove(item.id)}
                      className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FavoritesList;