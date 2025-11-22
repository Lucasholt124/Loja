import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getAllProducts = async () => {
  const ALL_PRODUCTS_QUERY = defineQuery(`
    *[_type == "product"] | order(name asc) {
      _id,
      _type,
      name,
      slug,
      images,
      description,
      price,
      stock,
      "categories": categories[]-> {
        _id,
        title,
        slug
      }
    }
  `);

  try {
    const products = await sanityFetch({
      query: ALL_PRODUCTS_QUERY,
    });

    return products.data || [];
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
};