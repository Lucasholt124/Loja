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

// Tipagem compatível com Next 14 e 15
type ProductPageProps = {
  params: { slug: string } | Promise<{ slug: string }>;
};

export default async function ProductPage(props: ProductPageProps) {
  // Em Next 15, params é Promise; em Next 14, é objeto. Ambos funcionam com await.
  const { slug } = await props.params;

  const product = await getProductBySlug(slug);
  if (!product || !product.slug?.current || !product.name) {
    notFound();
  }

  const isOutOfStock = product.stock != null && product.stock <= 0;

  // Ajuste o prefixo de rota se você usa /produto ao invés de /product
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

                {/* Se logado, mostra o botão real de favoritos; se não, abre o modal do Clerk */}
                <SignedIn>
                  <WishlistButton productSlug={product.slug.current} />
                </SignedIn>

                <SignedOut>
                  <SignInButton
                    mode="modal"
                    // Em Clerk (modo modal) use forceRedirectUrl/fallbackRedirectUrl em vez de afterSignInUrl
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
              <div className="prose prose-lg max-w-none text-gray-600">
                {Array.isArray(product.description) && (
                  <PortableText value={product.description} />
                )}
              </div>

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