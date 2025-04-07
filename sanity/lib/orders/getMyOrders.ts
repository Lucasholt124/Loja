// getMyOrders.ts
import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

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
      name?: string;
      image?: any;
      price?: number;
    };
  }[];
};

export async function getMyOrders(userId: string): Promise<Order[]> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const MY_ORDERS_QUERY = defineQuery(`*[
      _type == "order" && clerkUserId == $userId
    ] | order(orderDate desc) {
      ...,
      products[] {
        ...,
        product->
      }
    }
  `);
  try {
    const orders = await sanityFetch({
      query: MY_ORDERS_QUERY,
      params: { userId },
    });

    return orders?.data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return []; // fallback pro build não quebrar
  }
}
