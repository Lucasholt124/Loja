import AddToBasketButton from "@/components/AddToBasket";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug";
import { PortableText } from "next-sanity";
import { notFound } from "next/navigation";
import React from "react";

export const dynamic = "force-static";
export const revalidate = 60;

const ProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  const isOutOfStock = product.stock != null && product.stock <= 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* --- ÁREA DA IMAGEM ATUALIZADA --- */}
        <div
          className={`relative aspect-square overflow-hidden rounded-lg shadow-lg ${isOutOfStock ? "opacity-50" : ""}`}
        >
          {/* --- CORREÇÃO APLICADA AQUI --- */}
          {/* Usamos o operador '??' para passar um array vazio se 'product.images' for null ou undefined. */}
          {/* O `as any` é uma "saída de emergência" para o TypeScript se ele ainda reclamar da incompatibilidade de tipos complexos. */}
          <ProductImageCarousel images={(product.images as any) ?? []} />

          {isOutOfStock && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
              <span className="text-lg font-bold text-white">
                Fora de estoque
              </span>
            </div>
          )}
        </div>
        {/* --- FIM DA ÁREA DA IMAGEM --- */}

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="mb-4 text-3xl font-bold">{product.name}</h1>
            <div className="mb-4 text-xl font-semibold">
              {/* Melhorando a formatação do preço */}
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price || 0)}
            </div>
            <div className="prose mb-6 max-w-none">
              {Array.isArray(product.description) && (
                <PortableText value={product.description} />
              )}
            </div>
          </div>
          <div className="mt-6">
            <AddToBasketButton product={product as any} disabled={isOutOfStock} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;