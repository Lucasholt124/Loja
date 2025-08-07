import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getProductsBySlugs } from "@/sanity/lib/products/getProductsBySlugs";
import FavoritesView from "@/components/FavoritesView";

export const revalidate = 0; // sempre fresh

export default async function FavoritesPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="bg-gray-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <h1 className="mb-2 text-3xl font-bold">Seus Favoritos</h1>
            <p className="mb-6 text-gray-600">Entre para ver e gerenciar seus favoritos.</p>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Fazer login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { productSlug: true },
    orderBy: { createdAt: "desc" }, // remova se não tiver createdAt
  });

  const slugs = items.map((i) => i.productSlug);
  const products = await getProductsBySlugs(slugs);

  return (
    <main className="bg-gray-50 py-10">
      <div className="container mx-auto max-w-7xl px-4">
        <FavoritesView products={products} />
      </div>
    </main>
  );
}