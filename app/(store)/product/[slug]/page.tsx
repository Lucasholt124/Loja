
import AddToBasketButton from "@/components/AddToBasket";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug";
import { PortableText } from "next-sanity";
import { notFound } from "next/navigation";
import React from "react";

// Importe o tipo Product gerado para nos ajudar
import type { Product } from "@/sanity.types";

export const dynamic = "force-static";
export const revalidate = 60;

const ProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  // A função getProductBySlug retorna um tipo que PODE ser um pouco diferente do 'Product' gerado.
  const productData = await getProductBySlug(slug);

  if (!productData) {
    return notFound();
  }

  // Forçamos uma conversão de tipo aqui, assumindo que a estrutura é compatível.
  // Isso diz ao TypeScript: "Confie em mim, os dados em 'productData' podem ser tratados como o tipo 'Product'".
  const product: Product = productData as any;

  const isOutOfStock = product.stock != null && product.stock <= 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div
          className={`relative aspect-square overflow-hidden rounded-lg shadow-lg ${isOutOfStock ? "opacity-50" : ""}`}
        >
          {/* A passagem para o carrossel agora deve funcionar, pois os tipos internos foram alinhados */}
          <ProductImageCarousel images={(product.images as any) ?? []} />

          {isOutOfStock && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
              <span className="text-lg font-bold text-white">
                Fora de estoque
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="mb-4 text-3xl font-bold">{product.name}</h1>
            <div className="mb-4 text-xl font-semibold">
              R$ {product.price?.toFixed(2).replace(".", ",")}
            </div>
            <div className="prose mb-6 max-w-none">
              {Array.isArray(product.description) && (
                <PortableText value={product.description} />
              )}
            </div>
          </div>
          <div className="mt-6">
            {/* O AddToBasketButton agora recebe o 'product' com o tipo correto */}
            <AddToBasketButton product={product} disabled={isOutOfStock} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;