import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getProductsBySlugs } from "@/sanity/lib/products/getProductsBySlugs";
import FavoritesView from "@/components/FavoritesView";
import { Heart, LogIn } from "lucide-react";

export const revalidate = 0;

export default async function FavoritesPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-xl text-center">
          {/* Card Premium */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 p-10 shadow-2xl">
            {/* Efeitos decorativos */}
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br from-rose-300/30 to-pink-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 blur-3xl" />

            <div className="relative">
              {/* Ícone */}
              <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 shadow-2xl shadow-rose-500/40">
                <Heart className="size-12 text-white" fill="currentColor" />
              </div>

              {/* Título */}
              <h1 className="mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
                Seus Favoritos Esperam por Você
              </h1>

              {/* Descrição */}
              <p className="mb-8 text-base text-gray-600 sm:text-lg">
                Entre para ver e gerenciar sua lista de produtos favoritos.
                Salve itens especiais e compre quando estiver pronto!
              </p>

              {/* Botões */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/sign-in"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 font-bold text-white shadow-2xl shadow-blue-500/40 transition-all hover:shadow-blue-500/60 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <LogIn className="relative size-5" />
                  <span className="relative">Fazer Login</span>
                </Link>

                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-8 py-4 font-bold text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50 hover:-translate-y-1"
                >
                  Criar Conta Grátis
                </Link>
              </div>

              {/* Benefícios */}
              <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
                {[
                  "💾 Salve seus produtos favoritos",
                  "🔔 Receba alertas de promoções",
                  "⚡ Compre mais rápido depois",
                  "❤️ Sincronize entre dispositivos",
                ].map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 text-sm font-semibold text-gray-700 backdrop-blur-sm"
                  >
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Link adicional */}
          <p className="mt-6 text-sm text-gray-500">
            Ainda não tem conta?{" "}
            <Link href="/sign-up" className="font-bold text-blue-600 hover:underline">
              Crie gratuitamente em segundos
            </Link>
          </p>
        </div>
      </main>
    );
  }

  // Usuário logado - buscar favoritos
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      select: { productSlug: true },
      orderBy: { createdAt: "desc" },
    });

    const slugs = items.map((i) => i.productSlug);
    const products = slugs.length > 0 ? await getProductsBySlugs(slugs) : [];

    return (
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto max-w-7xl px-4">
          <FavoritesView products={products} />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error fetching favorites:", error);

    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-8">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Erro ao Carregar Favoritos
            </h2>
            <p className="mb-6 text-gray-600">
              Não foi possível carregar sua lista de favoritos. Por favor, tente novamente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </main>
    );
  }
}