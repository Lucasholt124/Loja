"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import WishlistButton from "@/components/WishlistButton";
import { Heart, Search, Trash2 } from "lucide-react";

type Product = {
  slug: string;
  name: string;
  price: number | null;
  stock?: number | null;
  image: string | null;
};

type Props = { products: Product[] };

export default function FavoritesView({ products }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"nome" | "preco-asc" | "preco-desc">("nome");

  const [list, setList] = useState<Product[]>(products);
  useEffect(() => setList(products), [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? list.filter((p) => p.name.toLowerCase().includes(q)) : list;

    const arr = [...base];
    if (sort === "nome") arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "preco-asc") arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sort === "preco-desc") arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return arr;
  }, [list, query, sort]);

  const formatBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleClearAll = async () => {
    if (!list.length) return;
    if (!confirm("Tem certeza que deseja remover todos os favoritos?")) return;
    await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setList([]); // remoção otimista
  };

  if (!list.length) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-500 ring-1 ring-rose-100">
          <Heart className="size-7" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">Você ainda não tem favoritos</h2>
        <p className="mx-auto mb-6 max-w-md text-gray-500">
          Clique no coração dos produtos para salvá-los aqui.
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
    <div className="w-full">
      {/* HERO */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border bg-white p-8 shadow-sm">
        <div className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-rose-100/60 blur-2xl" />
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-600 ring-1 ring-rose-200">
              <Heart className="size-4" /> Seus Favoritos
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Produtos que você ama</h1>
            <p className="mt-1 text-gray-600">{list.length} item(s) salvos</p>
          </div>

          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <Trash2 className="size-4" />
            Limpar tudo
          </button>
        </div>

        {/* CONTROLES */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar nos favoritos..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-9 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Search
              aria-hidden
              className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-gray-600">
              Ordenar por:
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="nome">Nome (A–Z)</option>
              <option value="preco-asc">Preço (menor)</option>
              <option value="preco-desc">Preço (maior)</option>
            </select>
          </div>
        </div>
      </div>

      {/* GRID */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-12 text-center text-gray-600 shadow-sm">
          Nenhum favorito corresponde à busca “{query}”.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <li
              key={p.slug}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                    sem imagem
                  </div>
                )}

                {typeof p.price === "number" && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                    {formatBRL(p.price)}
                  </span>
                )}

                <div className="absolute right-2 top-2">
                  <WishlistButton
                    productSlug={p.slug}
                    onToggle={(fav) => {
                      if (!fav) setList((prev) => prev.filter((i) => i.slug !== p.slug));
                    }}
                  />
                </div>

                {p.stock != null && p.stock <= 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-semibold text-white">
                    Esgotado
                  </span>
                )}
              </div>

              <div className="p-4">
                <Link
                  href={`/product/${p.slug}`}
                  className="block truncate text-base font-semibold text-gray-900 transition hover:text-blue-600"
                >
                  {p.name}
                </Link>

                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/product/${p.slug}`}
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Ver produto
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}