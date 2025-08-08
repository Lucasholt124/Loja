// ARQUIVO: src/lib/getProducts.ts
import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client"; // ajuste o path ao seu client
import { Product } from "@/sanity.types";

type Params = {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
};

export async function fetchProducts({ page = 1, limit = 12, q, category }: Params) {
  const start = (page - 1) * limit;
  const end = start + limit;

  const base = ['_type == "product"', 'defined(slug.current)'];
  if (category) base.push('category->slug.current == $category');
  if (q) base.push('name match $q');

  const filter = base.join(" && ");

  const query = groq`{
    "items": *[${filter}] | order(_createdAt desc) [${start}...${end}]{
      _id, name, price, images, slug, stock, description
    },
    "total": count(*[${filter}])
  }`;

  const params: Record<string, any> = {
    category,
    q: q ? `${q}*` : undefined,
  };

  return client.fetch<{ items: Product[]; total: number }>(query, params);
}