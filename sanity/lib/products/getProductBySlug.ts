import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";
import type { PortableTextBlock } from "sanity";

// Tipos para o produto do Sanity
export type SanityImage = {
  alt?: string;
  asset: {
    url: string;
    // Adicione outros campos de metadata se precisar
    metadata?: any;
  };
};

export type SanityProduct = {
  _id: string;
  name: string;
  price: number | null;
  stock?: number | null;
  slug: { current: string };
  images?: SanityImage[];
  // CORREÇÃO: incluir description
  description?: PortableTextBlock[] | null;
};

// Query
const PRODUCT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    name,
    price,
    stock,
    slug,
    // Traz as imagens como antes
    "images": images[]{
      alt,
      asset->
    },
    // CORREÇÃO: garante que 'description' venha mesmo se no schema o campo tiver outro nome
    "description": coalesce(description, body, details, content)
  }
`);

// Buscar 1 produto pelo slug
export const getProductBySlug = async (slug: string): Promise<SanityProduct | null> => {
  try {
    const product = await sanityFetch<SanityProduct>({
      query: PRODUCT_BY_SLUG_QUERY,
      params: { slug },
    });
    return product || null;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
};

// Slugs para generateStaticParams (se você usa)
const ALL_SLUGS_QUERY = defineQuery(`
  *[_type == "product" && defined(slug.current)][].slug
`);

export const getAllProductSlugs = async (): Promise<{ current: string }[]> => {
  try {
    const slugs = await sanityFetch<{ current: string }[]>({
      query: ALL_SLUGS_QUERY,
    });
    return slugs || [];
  } catch (error) {
    console.error("Error fetching all product slugs:", error);
    return [];
  }
};