"use client";

import { imageUrl } from "@/lib/imageUrl";
import { Product } from "@/sanity.types";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Heart, Zap, Star, Eye, TrendingUp, ShoppingBag, Flame } from "lucide-react";
import useBasketStore from "@/lib/store";

const formatBRL = (value?: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);

interface ProductThumbProps {
  product: Product;
  showRating?: boolean;
}

const ProductThumb = ({ product, showRating = true }: ProductThumbProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null);
  const [loadingRating, setLoadingRating] = useState(true);
  const [viewersCount, setViewersCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { addItem, getItemCount } = useBasketStore();

  const itemCount = getItemCount(product._id);
  const isOutOfStock = product.stock != null && product.stock <= 0;
  const isLowStock = product.stock != null && product.stock > 0 && product.stock <= 5;
  const availableStock = (product.stock ?? 0) - itemCount;
  const canAddMore = !isOutOfStock && availableStock > 0;
  const stockPercentage = product.stock ? Math.min((product.stock / 20) * 100, 100) : 0;

  const thumbnailImage = product.images?.[0];
  const href = product.slug?.current ? `/product/${product.slug.current}` : "#";
  const disabled = isOutOfStock || !product.slug?.current;

  // Animação de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Simulação de visualizações (substituir por real em produção)
  useEffect(() => {
    const randomViewers = Math.floor(Math.random() * 50) + 10;
    setViewersCount(randomViewers);

    const interval = setInterval(() => {
      setViewersCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(5, Math.min(99, prev + change));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Buscar avaliações
  useEffect(() => {
    if (showRating && product.slug?.current) {
      setLoadingRating(true);
      fetch(`/api/reviews/average?productSlug=${encodeURIComponent(product.slug.current)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.count > 0) {
            setRating({ average: data.average, count: data.count });
          }
        })
        .catch((error) => console.error("Error loading ratings:", error))
        .finally(() => setLoadingRating(false));
    } else {
      setLoadingRating(false);
    }
  }, [product.slug?.current, showRating]);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);

    // Haptic feedback para mobile
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    try {
      await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, productSlug: product.slug?.current }),
      });
    } catch (error) {
      console.log("Wishlist toggle:", error);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || !canAddMore) return;

    // Haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }

    addItem(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <Link
      href={href}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={[
        "group relative flex h-full flex-col overflow-hidden",
        "rounded-3xl border border-gray-200/80 bg-white shadow-md backdrop-blur-sm",
        "transition-all duration-500 ease-out",
        "hover:border-transparent hover:shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-3 hover:scale-[1.02]",
        "active:scale-[0.98]",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2",
        disabled ? "pointer-events-none opacity-60" : "",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      ].join(" ")}
      style={{ transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
    >
      {/* Gradiente de borda animado */}
      <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100 -z-10" />

      {/* Badge TOP AVALIADO */}
      {!isOutOfStock && rating && rating.average >= 4.5 && (
        <div className="absolute left-2.5 top-2.5 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-2.5 py-1.5 shadow-lg backdrop-blur-md animate-pulse-subtle">
          <Star className="size-3.5 drop-shadow-sm" fill="white" stroke="white" strokeWidth={1.5} />
          <span className="text-[10px] font-black uppercase tracking-wider text-white drop-shadow">
            Top Rated
          </span>
        </div>
      )}

      {/* Badge TRENDING */}
      {!isOutOfStock && viewersCount > 20 && (
        <div className="absolute left-2.5 top-12 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 shadow-md backdrop-blur-md">
          <TrendingUp className="size-3 text-white" strokeWidth={2.5} />
          <span className="text-[10px] font-bold text-white">Em alta</span>
        </div>
      )}

      {/* Contador de visualizações */}
      {!isOutOfStock && (
        <div className="absolute right-2.5 top-12 z-20 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 shadow-lg backdrop-blur-md">
          <Eye className="size-3 text-white animate-pulse" strokeWidth={2} />
          <span className="text-[10px] font-bold text-white tabular-nums">
            {viewersCount}
          </span>
        </div>
      )}

      {/* Wishlist Button */}
      {!disabled && (
        <button
          onClick={handleWishlistClick}
          className={[
            "absolute right-2.5 top-2.5 z-20 flex size-9 items-center justify-center rounded-full shadow-lg backdrop-blur-md",
            "transition-all duration-300 hover:scale-110 active:scale-90",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rose-500",
            isWishlisted
              ? "bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/50"
              : "bg-white/95 hover:bg-rose-500 shadow-black/10"
          ].join(" ")}
          aria-label={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart
            className={[
              "size-4.5 transition-all duration-300",
              isWishlisted
                ? "fill-white text-white scale-110"
                : "text-gray-700"
            ].join(" ")}
            strokeWidth={2}
          />
        </button>
      )}

      {/* Imagem do Produto */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        {thumbnailImage ? (
          <>
            <Image
              src={imageUrl(thumbnailImage).url()}
              alt={product.name ?? "Produto"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-4 transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-3"
              loading="lazy"
              decoding="async"
            />
            {/* Overlay gradient sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Efeito de brilho */}
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute -inset-[100%] animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center text-gray-400">
              <ShoppingBag className="mx-auto size-16 mb-3 opacity-40" strokeWidth={1.5} />
              <span className="text-xs font-semibold">Sem imagem</span>
            </div>
          </div>
        )}

        {/* Badge Estoque Baixo - APRIMORADO */}
        {isLowStock && !isOutOfStock && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
            <div className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 px-3 py-2 shadow-xl backdrop-blur-sm animate-pulse-glow">
              <Flame className="size-4 text-white animate-bounce" fill="white" strokeWidth={1.5} />
              <span className="flex-1 text-xs font-black uppercase tracking-wide text-white drop-shadow">
                Últimas {product.stock} unidades!
              </span>
            </div>
          </div>
        )}

        {/* Overlay Esgotado */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-md">
            <div className="text-center space-y-2">
              <div className="inline-block rounded-2xl bg-black/90 px-6 py-3.5 shadow-2xl border border-white/10">
                <span className="block text-sm font-black uppercase tracking-widest text-white">
                  Esgotado
                </span>
              </div>
              <p className="text-xs font-semibold text-white/90">
                Voltar em breve
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo do Card */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Título */}
        <h2
          className="mb-2.5 line-clamp-2 min-h-[2.75rem] text-[15px] sm:text-base font-bold leading-snug text-gray-900 transition-colors duration-300 group-hover:text-blue-600"
          title={product.name ?? ""}
        >
          {product.name || "Produto sem nome"}
        </h2>

        {/* Avaliações */}
        {showRating && (
          <div className="mb-3 flex items-center gap-2 min-h-[22px]">
            {loadingRating ? (
              <div className="flex items-center gap-1.5">
                <div className="size-4 animate-pulse rounded-full bg-gray-200" />
                <div className="h-3.5 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            ) : rating && rating.count > 0 ? (
              <>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={[
                        "size-3.5 transition-all duration-300",
                        i < Math.floor(rating.average)
                          ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                          : i < rating.average
                          ? "fill-amber-300 text-amber-300"
                          : "fill-gray-200 text-gray-200"
                      ].join(" ")}
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-700">
                  {rating.average.toFixed(1)}
                </span>
                <span className="text-xs font-medium text-gray-400">
                  ({rating.count})
                </span>
              </>
            ) : (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-gray-200 text-gray-200" strokeWidth={0} />
                ))}
                <span className="ml-1 text-xs font-medium text-gray-400">Seja o primeiro</span>
              </div>
            )}
          </div>
        )}

        {/* Descrição */}
        <div className="mb-4 flex-1 text-[13px] leading-relaxed text-gray-600">
          <div className="line-clamp-2">
            {Array.isArray(product.description) && product.description.length > 0 ? (
              <PortableText value={product.description} />
            ) : (
              <span className="italic text-gray-400">Descrição disponível em breve.</span>
            )}
          </div>
        </div>

        {/* Barra de Estoque Visual */}
        {!isOutOfStock && product.stock != null && product.stock <= 20 && (
          <div className="mb-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-600">Estoque</span>
              <span className={[
                "font-bold",
                stockPercentage < 30 ? "text-red-600" : stockPercentage < 60 ? "text-orange-600" : "text-emerald-600"
              ].join(" ")}>
                {product.stock} un.
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={[
                  "h-full rounded-full transition-all duration-500",
                  stockPercentage < 30
                    ? "bg-gradient-to-r from-red-500 to-rose-600"
                    : stockPercentage < 60
                    ? "bg-gradient-to-r from-orange-500 to-amber-500"
                    : "bg-gradient-to-r from-emerald-500 to-green-600"
                ].join(" ")}
                style={{ width: `${stockPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Preço e Benefícios */}
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[26px] sm:text-3xl font-black text-gray-900 tracking-tight leading-none">
                {formatBRL(product.price || 0)}
              </p>
              {(product.price ?? 0) > 100 && (
                <div className="mt-1.5 flex items-center gap-1">
                  <Zap className="size-3.5 text-emerald-600" fill="currentColor" />
                  <span className="text-xs font-bold text-emerald-600">
                    Frete GRÁTIS
                  </span>
                </div>
              )}
            </div>

            {product.stock != null && product.stock > 5 && (
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 px-3 py-1.5 ring-1 ring-emerald-200/50">
                <span className="text-[11px] font-black uppercase tracking-wide text-emerald-700">
                  Disponível
                </span>
              </div>
            )}
          </div>

          {/* Info do carrinho */}
          {itemCount > 0 && !isOutOfStock && (
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2.5 ring-1 ring-blue-200/50">
              <ShoppingBag className="size-4 text-blue-600" strokeWidth={2} />
              <span className="flex-1 text-xs font-bold text-blue-700">
                {itemCount} no carrinho
              </span>
              <span className="text-xs font-semibold text-blue-600">
                {availableStock} disponível
              </span>
            </div>
          )}

          {/* Botão CTA - APRIMORADO */}
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              disabled={!canAddMore}
              className={[
                "group/btn relative w-full overflow-hidden rounded-2xl py-3.5 sm:py-4 font-black text-[15px] uppercase tracking-wide shadow-xl transition-all duration-300",
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2",
                !canAddMore
                  ? "cursor-not-allowed bg-gray-400 text-white/80 shadow-gray-400/20"
                  : addedToCart
                  ? "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-green-500/40 focus-visible:ring-green-500/50 scale-105"
                  : "bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 text-white shadow-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 focus-visible:ring-blue-500/50"
              ].join(" ")}
            >
              {/* Efeito shimmer no botão */}
              {!addedToCart && canAddMore && (
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100">
                  <div className="absolute -inset-[100%] animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                </div>
              )}

              <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow">
                {!canAddMore ? (
                  "Limite atingido"
                ) : addedToCart ? (
                  <>
                    <span className="text-2xl">✓</span>
                    Adicionado!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-5 animate-pulse-subtle" strokeWidth={2.5} />
                    Adicionar ao Carrinho
                  </>
                )}
              </span>

              {/* Efeito de pulso no CTA */}
              {!addedToCart && canAddMore && (
                <div className="absolute inset-0 animate-pulse-ring rounded-2xl bg-blue-400/30" />
              )}
            </button>
          )}

          {/* Botão Esgotado */}
          {isOutOfStock && (
            <button
              disabled
              className="w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 py-3.5 font-bold uppercase tracking-wide text-gray-400 cursor-not-allowed"
            >
              Indisponível
            </button>
          )}
        </div>
      </div>

      {/* Efeito de hover brilhante nas bordas */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-fuchsia-500/10" />
      </div>
    </Link>
  );
};

export default ProductThumb;