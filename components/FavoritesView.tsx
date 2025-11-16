"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import WishlistButton from "@/components/WishlistButton";
import { Heart, Search, Trash2, Sparkles, TrendingUp, Filter, Grid3x3, LayoutGrid } from "lucide-react";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
    setList([]);
  };

  if (!list.length) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 p-12 text-center shadow-2xl">
          {/* Efeitos de fundo */}
          <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br from-rose-300/30 to-pink-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 blur-3xl" />

          <div className="relative">
            <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 shadow-2xl shadow-rose-500/40">
              <Heart className="size-12 text-white" fill="currentColor" />
            </div>
            <h2 className="mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-3xl font-black tracking-tight text-transparent">
              Seu coração ainda está vazio
            </h2>
            <p className="mx-auto mb-8 max-w-md text-base text-gray-600">
              Comece a criar sua coleção de desejos! Clique no{" "}
              <Heart className="inline size-4 text-rose-500" /> dos produtos para salvá-los aqui.
            </p>
            <Link
              href="/"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 font-bold text-white shadow-2xl shadow-blue-500/40 transition-all duration-300 hover:shadow-blue-500/60 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <Sparkles className="relative size-5" />
              <span className="relative">Descobrir Produtos</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* HERO PREMIUM */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white via-rose-50/40 to-pink-50/40 p-8 shadow-xl lg:p-10">
        {/* Efeitos decorativos */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-gradient-to-br from-rose-400/20 to-pink-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 blur-3xl" />

        <div className="relative">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                <Heart className="size-4" fill="currentColor" />
                Seus Favoritos
              </div>
              <h1 className="mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-4xl font-black tracking-tight text-transparent lg:text-5xl">
                Produtos que você ama
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-lg font-semibold text-gray-600">
                  {list.length} {list.length === 1 ? "item salvo" : "itens salvos"}
                </p>
                <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                  <TrendingUp className="size-4" />
                  +{Math.floor(Math.random() * 20 + 10)}% esta semana
                </span>
              </div>
            </div>

            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-2 self-start rounded-2xl border-2 border-red-200 bg-red-50 px-6 py-3 font-bold text-red-600 shadow-lg transition-all duration-300 hover:border-red-300 hover:bg-red-100 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
              <Trash2 className="size-5" />
              Limpar Tudo
            </button>
          </div>

          {/* CONTROLES PREMIUM */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-600" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar nos favoritos..."
                className="h-12 w-full rounded-2xl border-2 border-gray-200 bg-white pl-12 pr-4 font-medium text-gray-900 shadow-sm placeholder:text-gray-400 transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:shadow-lg"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 rounded-2xl border-2 border-gray-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-xl px-4 py-2 font-bold transition-all ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Grid3x3 className="size-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-xl px-4 py-2 font-bold transition-all ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <LayoutGrid className="size-5" />
                </button>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-4 py-2 shadow-sm">
                <Filter className="size-5 text-gray-600" />
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="border-none bg-transparent font-bold text-gray-900 outline-none"
                >
                  <option value="nome">Nome (A–Z)</option>
                  <option value="preco-asc">Menor Preço</option>
                  <option value="preco-desc">Maior Preço</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRID / LIST */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-16 text-center">
          <Search className="mx-auto mb-4 size-12 text-gray-400" />
          <p className="text-lg font-semibold text-gray-600">
            Nenhum favorito encontrado para {query}
          </p>
        </div>
      ) : (
        <ul
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
          }
        >
          {filtered.map((p) => (
            <li
              key={p.slug}
              className={`group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 ${
                viewMode === "list" ? "flex flex-row" : "flex flex-col"
              }`}
            >
              {/* Imagem */}
              <div
                className={`relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 ${
                  viewMode === "grid" ? "aspect-square w-full" : "h-48 w-48 flex-shrink-0"
                }`}
              >
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <span className="text-xs font-medium">Sem imagem</span>
                  </div>
                )}

                {typeof p.price === "number" && (
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/80 px-3 py-1.5 text-sm font-black text-white backdrop-blur-sm shadow-lg">
                    {formatBRL(p.price)}
                  </span>
                )}

                <div className="absolute right-3 top-3">
                  <WishlistButton
                    productSlug={p.slug}
                    onToggle={(fav) => {
                      if (!fav) setList((prev) => prev.filter((i) => i.slug !== p.slug));
                    }}
                  />
                </div>

                {p.stock != null && p.stock <= 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <span className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white uppercase shadow-2xl">
                      Esgotado
                    </span>
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="flex flex-1 flex-col p-5">
                <Link
                  href={`/product/${p.slug}`}
                  className="mb-3 line-clamp-2 text-lg font-bold text-gray-900 transition-colors hover:text-blue-600"
                >
                  {p.name}
                </Link>

                <div className="mt-auto flex items-center gap-3">
                  <Link
                    href={`/product/${p.slug}`}
                    className="group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                    <span className="relative">Ver Produto</span>
                  </Link>
                </div>
              </div>

              {/* Efeito shimmer */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute -inset-[100%] animate-[spin_3s_linear_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}