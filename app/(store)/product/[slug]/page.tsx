// app/(store)/product/[slug]/page.tsx
import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";

import ProductImageCarousel from "@/components/ProductImageCarousel";
import WishlistButton from "@/components/WishlistButton";
import ProductReviews from "@/components/ProductReviews";
import { Separator } from "@/components/ui/separator";
import AddToBasketButton from "@/components/AddToBasket";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Heart as HeartIcon } from "lucide-react";

// ISR (Incremental Static Regeneration) a cada 60 segundos.
export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // No Next 15, params é Promise
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product || !product.slug?.current || !product.name) {
    notFound();
  }

  const isOutOfStock = product.stock != null && product.stock <= 0;
  const currentPath = `/product/${encodeURIComponent(product.slug.current)}`;

  return (
    <main className="bg-gray-50 py-12">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Coluna da Esquerda: Imagens do Produto */}
          <div className="flex flex-col">
            <div className="relative aspect-square overflow-hidden rounded-xl border bg-white shadow-md">
              <ProductImageCarousel images={(product.images as any) ?? []} />
              {isOutOfStock && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
                  <span className="rounded-full bg-red-500 px-4 py-2 text-lg font-bold text-white">
                    ESGOTADO
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Coluna da Direita: Detalhes e Ações */}
          <div className="flex flex-col space-y-6">
            <div className="rounded-xl border bg-white p-6 shadow-md">
              {/* Cabeçalho */}
              <div className="flex items-start justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 lg:text-4xl">
                  {product.name}
                </h1>

                <SignedIn>
                  <WishlistButton productSlug={product.slug.current} />
                </SignedIn>

                <SignedOut>
                  <SignInButton
                    mode="modal"
                    forceRedirectUrl={currentPath}
                    signUpForceRedirectUrl={currentPath}
                  >
                    <button
                      aria-label="Adicionar aos favoritos (requer login)"
                      className="rounded-full border p-2 text-gray-700 hover:bg-gray-50"
                    >
                      <HeartIcon className="size-6" />
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>

              {/* Preço e Estoque */}
              <div className="mt-4">
                <p className="text-3xl text-gray-800">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(product.price || 0)}
                </p>
                <div className="mt-2">
                  {isOutOfStock ? (
                    <p className="text-sm font-medium text-red-600">Fora de estoque</p>
                  ) : (
                    <p className="text-sm font-medium text-green-600">Em estoque</p>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Descrição */}
              {Array.isArray((product as any).description) && (product as any).description.length > 0 && (
                <div className="prose prose-lg max-w-none text-gray-600">
                  <PortableText value={(product as any).description} />
                </div>
              )}

              <Separator className="my-6" />

              {/* Botão de Adicionar ao Carrinho */}
              <div className="mt-6">
                <AddToBasketButton product={product as any} disabled={isOutOfStock} />
              </div>
            </div>
          </div>
        </div>

        {/* --- SEÇÃO DE COMENTÁRIOS (CLIENT COMPONENT) --- */}
        <div className="mt-16">
          <ProductReviews
            productSlug={product.slug.current}
            productName={product.name}
          />
        </div>
      </div>
    </main>
  );
}