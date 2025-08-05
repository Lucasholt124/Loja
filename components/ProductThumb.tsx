// ARQUIVO: src/components/ProductThumb.tsx (Completo e Corrigido)

import { imageUrl } from "@/lib/imageUrl";
import { Product } from "@/sanity.types";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProductThumb = ({ product }: { product: Product }) => {
  const isOutOfStock = product.stock != null && product.stock <= 0;
  const thumbnailImage = product.images?.[0];

  return (
    <Link
      href={`/product/${product.slug?.current}`}
      className={`group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl ${
        isOutOfStock ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {/* Container da Imagem */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        {thumbnailImage ? (
          <Image
            src={imageUrl(thumbnailImage).url()}
            alt={product.name || "Product image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

            // --- AJUSTE DO TAMANHO DA IMAGEM ---
            // A Opção 1 está ativa. Ela garante que a imagem inteira apareça.
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"

            // Para usar a Opção 2 (imagem preenche o espaço mas com padding),
            // comente a linha acima e descomente a linha abaixo:
            // className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-8 text-gray-300"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
            <span className="rounded-md bg-gray-900/80 px-3 py-1 text-sm font-bold text-white backdrop-blur-sm">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Container de Texto */}
      <div className="flex flex-1 flex-col p-4">
        {/* Título */}
        <h2 className="truncate text-base font-semibold text-gray-800" title={product.name || ''}>
          {product.name}
        </h2>

        {/* Descrição */}
        <div className="mt-2 flex-grow text-sm text-gray-600">
          <div className="line-clamp-2">
            {Array.isArray(product.description) && product.description.length > 0 ? (
              <PortableText value={product.description} />
            ) : (
              <span className="text-gray-400 italic">Sem descrição.</span>
            )}
          </div>
        </div>

        {/* Preço */}
        <p className="mt-4 text-lg font-bold text-gray-900">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price || 0)}
        </p>
      </div>
    </Link>
  );
};

export default ProductThumb;