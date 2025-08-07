import { groq } from "next-sanity";
import { sanityFetch } from "../client";

export type FavoriteProduct = {
  slug: string;
  name: string;
  price: number | null;
  stock?: number | null;
  image: string | null;
};

const PRODUCTS_BY_SLUGS_QUERY = groq`
  *[_type == "product" && slug.current in $slugs]{
    name,
    price,
    stock,
    "slug": slug.current,
    // ajuste conforme seu schema
    "image": coalesce(
      images[0].asset->url,
      mainImage.asset->url
    )
  }
`;

export async function getProductsBySlugs(slugs: string[]): Promise<FavoriteProduct[]> {
  if (!slugs?.length) return [];
  try {
    const data = await sanityFetch<FavoriteProduct[]>({
      query: PRODUCTS_BY_SLUGS_QUERY,
      params: { slugs },
    });

    // Mantém ordem
    const order = new Map(slugs.map((s, i) => [s, i]));
    return (data ?? []).sort(
      (a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0)
    );
  } catch (e) {
    console.error("Error fetching products by slugs:", e);
    return [];
  }
}