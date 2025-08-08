// ARQUIVO: src/components/ProductThumb.tsx

import { imageUrl } from "@/lib/imageUrl";
import { Product } from "@/sanity.types";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const formatBRL = (value?: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);

const ProductThumb = ({ product }: { product: Product }) => {
  const isOutOfStock = product.stock != null && product.stock <= 0;
  const thumbnailImage = product.images?.[0];
  const href = product.slug?.current ? `/product/${product.slug.current}` : "#";
  const disabled = isOutOfStock || !product.slug?.current;

  return (
    <Link
      href={href}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-xl",
        "border border-gray-200 bg-white shadow-sm ring-1 ring-gray-100",
        "transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
        disabled ? "pointer-events-none opacity-60" : "",
      ].join(" ")}
    >
      {/* Imagem */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
        {thumbnailImage ? (
          <Image
            src={imageUrl(thumbnailImage).url()}
            alt={product.name ? `Foto de ${product.name}` : "Imagem do produto"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            <span className="sr-only">Sem imagem do produto</span>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/55">
            <span className="rounded-md bg-black/70 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-4">
        {/* Título */}
        <h2
          className="line-clamp-1 text-[15px] font-semibold text-gray-900"
          title={product.name || ""}
        >
          {product.name || "Produto sem nome"}
        </h2>

        {/* Descrição */}
        <div className="mt-1 flex-1 text-sm text-gray-600">
          <div className="line-clamp-2">
            {Array.isArray(product.description) && product.description.length > 0 ? (
              <PortableText value={product.description} />
            ) : (
              <span className="italic text-gray-400">Sem descrição.</span>
            )}
          </div>
        </div>

        {/* Preço + Status */}
        <div className="mt-3 flex items-center gap-2">
          <p className="text-lg font-bold text-gray-900">
            {formatBRL(product.price || 0)}
          </p>

          {product.stock != null && product.stock > 0 && (
            <span className="rounded px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 bg-emerald-50">
              Em estoque
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductThumb;