// ARQUIVO: app/(store)/product/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortableText, groq } from "next-sanity";
import Link from "next/link";
import { Suspense } from "react";
import { Heart as HeartIcon } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug";
import { imageUrl } from "@/lib/imageUrl";
import { client } from "@/sanity/lib/client";
import type { Product } from "@/sanity.types";

import ProductImageCarousel from "@/components/ProductImageCarousel";
import WishlistButton from "@/components/WishlistButton";
import ProductReviews from "@/components/ProductReviews";
import { Separator } from "@/components/ui/separator";
import AddToBasketButton from "@/components/AddToBasket";
import ProductThumb from "@/components/ProductThumb";
import ProductRating from "@/components/ProductRating";

// ISR (Incremental Static Regeneration) a cada 60 segundos.
export const revalidate = 60;

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

const formatBRL = (value?: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value ?? 0
  );

// Util para extrair texto do PortableText (para <meta> description)
function toPlainText(blocks: any): string {
  try {
    if (!Array.isArray(blocks)) return "";
    return blocks
      .map((b) =>
        Array.isArray(b?.children)
          ? b.children.map((c: any) => c?.text ?? "").join("")
          : ""
      )
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  }
}

// Recomendações com prioridade de MESMA CATEGORIA:
// 1) <= 70% do preço (bem mais baratos)
// 2) mais baratos que o produto
// 3) se ainda faltar, mais caros (premium)
// Caso a categoria não esteja definida, usa o catálogo inteiro.
async function getRecommendedProducts({
  price,
  excludeSlug,
  categoryId,
  limit = 2,
}: {
  price: number;
  excludeSlug: string;
  categoryId?: string | null;
  limit?: number;
}): Promise<Product[]> {
  const threshold = Math.max(0, Math.floor(price * 0.7));
  const limx = limit * 3;

  if (categoryId) {
    const data = await client.fetch<{
      below70Cat: Product[];
      belowSelfCat: Product[];
      expensiveCat: Product[];
      below70All: Product[];
      belowSelfAll: Product[];
      expensiveAll: Product[];
    }>(
      groq`{
        "below70Cat": *[
          _type == "product" && defined(slug.current) && slug.current != $excludeSlug &&
          defined(price) && price <= $threshold && references($categoryId)
        ] | order(price asc)[0...$limx]{
          _id, name, price, images, slug, stock, description
        },
        "belowSelfCat": *[
          _type == "product" && defined(slug.current) && slug.current != $excludeSlug &&
          defined(price) && price < $price && references($categoryId)
        ] | order(price asc)[0...$limx]{
          _id, name, price, images, slug, stock, description
        },
        "expensiveCat": *[
          _type == "product" && defined(slug.current) && slug.current != $excludeSlug &&
          defined(price) && references($categoryId)
        ] | order(price desc)[0...$limx]{
          _id, name, price, images, slug, stock, description
        },
        "below70All": *[
          _type == "product" && defined(slug.current) && slug.current != $excludeSlug &&
          defined(price) && price <= $threshold
        ] | order(price asc)[0...$limx]{
          _id, name, price, images, slug, stock, description
        },
        "belowSelfAll": *[
          _type == "product" && defined(slug.current) && slug.current != $excludeSlug &&
          defined(price) && price < $price
        ] | order(price asc)[0...$limx]{
          _id, name, price, images, slug, stock, description
        },
        "expensiveAll": *[
          _type == "product" && defined(slug.current) && slug.current != $excludeSlug &&
          defined(price)
        ] | order(price desc)[0...$limx]{
          _id, name, price, images, slug, stock, description
        }
      }`,
      { excludeSlug, price, threshold, categoryId, limx }
    );

    const seen = new Set<string>();
    const out: Product[] = [];
    const push = (arr?: Product[]) => {
      for (const p of arr || []) {
        const key = p._id || p.slug?.current;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(p);
        if (out.length >= limit) break;
      }
    };

    // Prioridade: baratos na categoria > baratos globais > caros na categoria > caros globais
    push(data.below70Cat);
    if (out.length < limit) push(data.belowSelfCat);
    if (out.length < limit) push(data.below70All);
    if (out.length < limit) push(data.belowSelfAll);
    if (out.length < limit) push(data.expensiveCat);
    if (out.length < limit) push(data.expensiveAll);

    return out.slice(0, limit);
  }

  // Sem categoria: só globais
  const data = await client.fetch<{
    below70All: Product[];
    belowSelfAll: Product[];
    expensiveAll: Product[];
  }>(
    groq`{
      "below70All": *[
        _type == "product" && defined(slug.current) && slug.current != $excludeSlug &&
        defined(price) && price <= $threshold
      ] | order(price asc)[0...$limx]{
        _id, name, price, images, slug, stock, description
      },
      "belowSelfAll": *[
        _type == "product" && defined(slug.current) && slug.current != $excludeSlug &&
        defined(price) && price < $price
      ] | order(price asc)[0...$limx]{
        _id, name, price, images, slug, stock, description
      },
      "expensiveAll": *[
        _type == "product" && defined(slug.current) && slug.current != $excludeSlug &&
        defined(price)
      ] | order(price desc)[0...$limx]{
        _id, name, price, images, slug, stock, description
      }
    }`,
    { excludeSlug, price, threshold, limx }
  );

  const seen = new Set<string>();
  const out: Product[] = [];
  const push = (arr?: Product[]) => {
    for (const p of arr || []) {
      const key = p._id || p.slug?.current;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(p);
      if (out.length >= limit) break;
    }
  };

  push(data.below70All);
  if (out.length < limit) push(data.belowSelfAll);
  if (out.length < limit) push(data.expensiveAll);

  return out.slice(0, limit);
}

// SEO dinâmico por produto
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.slug?.current || !product.name) {
    return { title: "Produto não encontrado | Loja" };
  }

  const title = `${product.name} | Loja`;
  const description =
    toPlainText((product as any).description) ||
    `Confira detalhes de ${product.name} na nossa loja.`;
  const url = `${BASE_URL}/product/${encodeURIComponent(product.slug.current)}`;

  const ogImages =
    (product.images || [])
      .slice(0, 4)
      .map((img: any) => ({
        url: imageUrl(img).width(1200).height(630).url(),
        width: 1200,
        height: 630,
        alt: product.name || "Imagem do produto",
      })) || [];

  const twitterImage = ogImages[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website", // manter compatível com os tipos do Next
      url,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: twitterImage,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Next 15: params é Promise
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product || !product.slug?.current || !product.name) {
    notFound();
  }

  const isOutOfStock = product.stock != null && product.stock <= 0;
  const currentPath = `/product/${encodeURIComponent(product.slug.current)}`;
  const productUrl = `${BASE_URL}${currentPath}`;
  const images = (product.images as any) ?? [];

  // Categoria (tenta pegar referência única ou a primeira de uma lista)
  const categoryRef: string | undefined =
    (product as any)?.category?._ref ??
    (product as any)?.category?._id ??
    (product as any)?.categories?.[0]?._ref ??
    undefined;

  const categorySlug: string | undefined =
    (product as any)?.category?.slug?.current ??
    (product as any)?.categories?.[0]?.slug?.current ??
    undefined;

  const categoryTitle: string | undefined =
    (product as any)?.category?.title ??
    (product as any)?.categories?.[0]?.title ??
    undefined;

  // Recomendações (duas)
  const basePrice = Number(product.price ?? 0);
  const recommended = await getRecommendedProducts({
    price: basePrice,
    excludeSlug: product.slug.current,
    categoryId: categoryRef,
    limit: 2,
  });

  const hasCheaper = recommended.some(
    (p) => (p.price ?? Infinity) < basePrice
  );
  const hasOnlyExpensive = recommended.length > 0 && recommended.every(
    (p) => (p.price ?? 0) >= basePrice
  );

  const heading = hasOnlyExpensive
    ? "Conheça também: opções premium"
    : hasCheaper
    ? "Opções mais em conta"
    : "Talvez você também curta";

  return (
    <main className="bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500 md:mb-8">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-gray-700">
                Início
              </Link>
            </li>
            {categorySlug && categoryTitle ? (
              <>
                <li className="px-1">/</li>
                <li>
                  <Link
                    href={{ pathname: "/products", query: { category: categorySlug } }}
                    className="hover:text-gray-700"
                  >
                    {categoryTitle}
                  </Link>
                </li>
              </>
            ) : null}
            <li className="px-1">/</li>
            <li aria-current="page" className="font-medium text-gray-700">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Coluna da Esquerda: Imagens */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-2xl border bg-white shadow-sm">
              <ProductImageCarousel images={images} />
              {isOutOfStock && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/55">
                  <span className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-sm">
                    Esgotado
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Coluna da Direita: Detalhes e Ações */}
          <div className="flex flex-col gap-6">
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              {/* Cabeçalho */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl lg:text-4xl">
                  {product.name}
                </h1>

                {/* ⭐ AVALIAÇÕES ADICIONADAS AQUI */}
                <div className="mt-3">
                  <ProductRating productSlug={product.slug.current} size="lg" />
                </div>
              </div>

              <div className="shrink-0">
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
                      className="rounded-full border border-gray-200 bg-white p-2 text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                    >
                      <HeartIcon className="size-6" />
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>

              {/* Preço e Estoque */}
              <div className="mt-4">
                <div className="flex items-end gap-3">
                  <p className="text-3xl font-semibold text-gray-900">
                    {formatBRL(product.price || 0)}
                  </p>
                  {!isOutOfStock && (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      Em estoque
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
                      Fora de estoque
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Preço em reais (BRL). Tributos inclusos quando aplicável.
                </p>
              </div>

              <Separator className="my-6" />

              {/* Descrição */}
              {Array.isArray((product as any).description) &&
                (product as any).description.length > 0 && (
                  <div className="prose prose-sm max-w-none text-gray-700 md:prose md:prose-lg">
                    <PortableText value={(product as any).description} />
                  </div>
                )}

              <Separator className="my-6" />

              {/* Botão: Adicionar ao carrinho */}
              <div className="mt-4">
                <AddToBasketButton product={product as any} disabled={isOutOfStock} />
                {isOutOfStock && (
                  <p className="mt-3 text-sm text-gray-500">
                    Este item está indisponível no momento. Você pode adicioná-lo
                    aos favoritos para acompanhar a reposição.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Recomendados dinâmicos com prioridade de categoria */}
        {recommended.length > 0 && (
          <section className="mt-14 md:mt-16">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="text-lg font-semibold text-gray-900 md:text-xl">
                  {heading}
                </h2>
                <p className="text-sm text-gray-500">
                  {hasOnlyExpensive
                    ? "Este produto já está entre os mais acessíveis. Veja duas opções de maior valor."
                    : hasCheaper
                    ? "Selecionamos alternativas com preço significativamente menor."
                    : "Selecionamos outras opções que podem te interessar."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {recommended.map((p) => (
                  <ProductThumb key={p._id} product={p} />
                ))}
              </div>

              {categorySlug && (
                <div className="mt-6 text-right">
                  <Link
                    href={{ pathname: "/products", query: { category: categorySlug } }}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Ver mais da categoria
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Seção de Avaliações (Client Component em Suspense) */}
        <section className="mt-14 md:mt-16">
          <Suspense
            fallback={
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                <div className="mt-4 space-y-3">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-11/12 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-10/12 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            }
          >
            <ProductReviews productSlug={product.slug.current} productName={product.name} />
          </Suspense>
        </section>

        {/* JSON-LD: Product schema para SEO */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: product.name,
              image: images.map((img: any) => imageUrl(img).url()),
              description:
                toPlainText((product as any).description) ||
                `Detalhes de ${product.name}`,
              sku: product._id,
              offers: {
                "@type": "Offer",
                url: productUrl,
                priceCurrency: "BRL",
                price: Number(product.price ?? 0).toFixed(2),
                availability: isOutOfStock
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
              },
            }),
          }}
        />
      </div>
    </main>
  );
}