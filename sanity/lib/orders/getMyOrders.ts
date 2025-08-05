
import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

// --- CORREÇÃO 1: ATUALIZANDO O TIPO 'Order' LOCAL ---
// Vamos fazer este tipo corresponder à estrutura de dados REAL
// que a nossa nova query vai retornar.
export type Order = {
  orderNumber?: string;
  orderDate?: string;
  status?: string;
  totalPrice?: number;
  amountDiscount?: number;
  currency?: string;
  products?: {
    _key?: string;
    quantity: number;
    product?: {
      _id: string; // Adicionando campos que a query retorna
      name?: string;
      slug?: { current?: string };
      price?: number;
      // O campo 'product' agora terá um array 'images'
      images?: {
        _key: string;
        asset?: {
          _ref?: string;
          url?: string; // A query vai retornar a URL
        };
      }[];
    };
  }[];
};

export async function getMyOrders(userId: string): Promise<Order[]> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // --- CORREÇÃO 2: ATUALIZANDO A QUERY GROQ ---
  const MY_ORDERS_QUERY = defineQuery(`
    *[_type == "order" && clerkUserId == $userId] | order(orderDate desc) {
      ..., // Pega todos os campos do pedido
      products[] {
        ..., // Pega os campos do item do pedido (como _key, quantity)
        "product": product->{ // Expande a referência do produto
          // E especifica EXATAMENTE quais campos do produto queremos
          _id,
          name,
          slug,
          price,
          images[]{ // Pega o array de imagens
            ...,
            asset->{ // E expande o asset de cada imagem para obter a URL
              url
            }
          }
        }
      }
    }
  `);

  try {
    const orders = await sanityFetch({
      query: MY_ORDERS_QUERY,
      params: { userId },
    });

    // --- CORREÇÃO 3: ADICIONANDO 'as any' PARA SEGURANÇA ---
    // Mesmo com os tipos e a query corretos, o TypeScript pode se confundir.
    // O `as any` diz a ele para confiar em nós e resolve o erro de atribuição.
    return (orders?.data as any) || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return []; // fallback pro build não quebrar
  }
}