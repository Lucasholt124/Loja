"use client";

import { imageUrl } from "@/lib/imageUrl";
import { Product } from "@/sanity.types";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Heart, Zap, TrendingUp, Star } from "lucide-react";
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
  const { addItem, getItemCount } = useBasketStore();

  const itemCount = getItemCount(product._id);
  const isOutOfStock = product.stock != null && product.stock <= 0;
  const isLowStock = product.stock != null && product.stock > 0 && product.stock <= 5;
  const availableStock = (product.stock ?? 0) - itemCount;
  const canAddMore = !isOutOfStock && availableStock > 0;

  const thumbnailImage = product.images?.[0];
  const href = product.slug?.current ? `/product/${product.slug.current}` : "#";
  const disabled = isOutOfStock || !product.slug?.current;

  // Buscar avaliações do produto
  useEffect(() => {
    if (showRating && product.slug?.current) {
      fetch(`/api/reviews/average?productSlug=${product.slug.current}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.average) {
            setRating({ average: data.average, count: data.count });
          }
        })
        .catch(() => {});
    }
  }, [product.slug?.current, showRating]);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);

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
        "group relative flex h-full flex-col overflow-hidden rounded-2xl",
        "border-2 border-gray-200 bg-white shadow-sm transition-all duration-300",
        "hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30",
        disabled ? "pointer-events-none opacity-60" : "",
      ].join(" ")}
    >
      {/* Badge Popular */}
      {!isOutOfStock && rating && rating.average >= 4.5 && (
        <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
          <TrendingUp className="size-3" />
          TOP AVALIADO
        </div>
      )}

      {/* Wishlist Button */}
      {!disabled && (
        <button
          onClick={handleWishlistClick}
          className={`absolute right-3 top-3 z-20 flex size-10 items-center justify-center rounded-full backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
            isWishlisted
              ? "bg-rose-500"
              : "bg-white/90 hover:bg-rose-500"
          }`}
          aria-label={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart
            className={`size-5 transition-colors ${
              isWishlisted
                ? "fill-white text-white"
                : "text-gray-600 group-hover:fill-white group-hover:text-white"
            }`}
          />
        </button>
      )}

      {/* Imagem */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {thumbnailImage ? (
          <>
            <Image
              src={imageUrl(thumbnailImage).url()}
              alt={product.name ? `${product.name}` : "Produto"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-6 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-2"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto size-12 mb-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <span className="text-xs font-medium">Sem imagem</span>
            </div>
          </div>
        )}

        {/* Badge Estoque Baixo */}
        {isLowStock && !isOutOfStock && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5 shadow-lg backdrop-blur-sm animate-pulse">
            <Zap className="size-3 text-white" fill="currentColor" />
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              Últimas {product.stock} un!
            </span>
          </div>
        )}

        {/* Overlay Esgotado */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center">
              <span className="block rounded-xl bg-black/80 px-6 py-3 text-sm font-black uppercase tracking-widest text-white shadow-2xl">
                Esgotado
              </span>
              <p className="mt-2 text-xs font-semibold text-white/80">
                Em breve
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-5">
        {/* Título */}
        <h2
          className="mb-2 line-clamp-2 min-h-[2.5rem] text-base font-bold leading-tight text-gray-900 transition-colors duration-200 group-hover:text-blue-600"
          title={product.name || ""}
        >
          {product.name || "Produto sem nome"}
        </h2>

        {/* Avaliações */}
        {showRating && rating && rating.count > 0 && (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${
                    i < Math.floor(rating.average)
                      ? "fill-yellow-400 text-yellow-400"
                      : i < rating.average
                      ? "fill-yellow-400/50 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-600">
              {rating.average.toFixed(1)} ({rating.count})
            </span>
          </div>
        )}

        {/* Descrição */}
        <div className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">
          <div className="line-clamp-2">
            {Array.isArray(product.description) && product.description.length > 0 ? (
              <PortableText value={product.description} />
            ) : (
              <span className="italic text-gray-400">Descrição em breve.</span>
            )}
          </div>
        </div>

        {/* Preço e CTA */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-black text-gray-900 tracking-tight">
                {formatBRL(product.price || 0)}
              </p>
              {(product.price ?? 0) > 100 && (
                <p className="text-xs font-semibold text-green-600 mt-0.5">
                  Frete grátis
                </p>
              )}
            </div>

            {product.stock != null && product.stock > 5 && (
              <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                Disponível
              </span>
            )}
          </div>

          {/* Aviso de estoque no carrinho */}
          {itemCount > 0 && !isOutOfStock && (
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
              {itemCount} no carrinho • {availableStock} disponível{availableStock !== 1 ? 's' : ''}
            </div>
          )}

          {/* Botão CTA */}
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              disabled={!canAddMore}
              className={`w-full rounded-xl py-3 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 ${
                !canAddMore
                  ? "cursor-not-allowed bg-gray-400 opacity-60"
                  : addedToCart
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 shadow-green-500/30 hover:shadow-green-500/50"
                  : "bg-gradient-to-r from-blue-600 to-violet-600 shadow-blue-500/30 hover:shadow-blue-500/50"
              }`}
            >
              {!canAddMore
                ? "Limite atingido"
                : addedToCart
                ? "✓ Adicionado!"
                : "Adicionar ao Carrinho"}
            </button>
          )}

          {isOutOfStock && (
            <button
              disabled
              className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 font-bold text-gray-400 cursor-not-allowed"
            >
              Indisponível
            </button>
          )}
        </div>
      </div>

      {/* Efeito shimmer */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -inset-[100%] animate-[spin_3s_linear_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </Link>
  );
};

export default ProductThumb;