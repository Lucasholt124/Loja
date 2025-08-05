
import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live"; // Mantive seu import

export const getProductBySlug = async (slug: string) => {
  // A alteração está aqui, na query:
  const PRODUCT_BY_SLUG_QUERY = defineQuery(`
    *[_type == "product" && slug.current == $slug][0] {
      ..., // '...' busca todos os campos do documento principal (nome, preço, etc.)

      // --- ALTERAÇÃO PRINCIPAL ---
      // Especificamos que queremos todos os dados do array 'images'.
      // O '[]' garante que todos os itens do array sejam retornados completos.
      "images": images[]{
        ...,
        asset-> // Isso é crucial: expande a referência do asset para obter a URL da imagem.
      }
      // --- FIM DA ALTERAÇÃO ---
    }
  `);

  try {
    const product = await sanityFetch({
      query: PRODUCT_BY_SLUG_QUERY, // Usando a nova query
      params: {
        slug,
      },
    });

    return product.data || null;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
};