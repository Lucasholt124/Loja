import { imageUrl } from "@/lib/imageUrl";
import { Product } from "@/sanity.types";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProductThumb = ({ product }: { product: Product }) => {
  const isOutOfStock = product.stock != null && product.stock <= 0;
  return (
    <Link
      href={`/product/${product.slug?.current}`}
      className={`group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition-all duration-200 hover:shadow-md ${isOutOfStock ? "opacity-50" : ""}`}
    >
      <div className="relative aspect-square size-full overflow-hidden">
        {product.image && (
          <Image
            src={imageUrl(product.image).url()}
            alt={product.name || "Product image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-lg font-bold text-white">Fora de estoque</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h2 className="truncate text-lg font-semibold text-gray-800">
          {product.name}
        </h2>

        <div className="mt-2 line-clamp-2 text-sm text-gray-600">
          {Array.isArray(product.description) ? (
            <PortableText value={product.description} />
          ) : (
            "Descrição indisponível"
          )}
        </div>

        <p className="mt-2 text-lg font-bold text-gray-900">
          R$:{product.price?.toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

export default ProductThumb;
