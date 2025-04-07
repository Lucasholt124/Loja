"use server";

import { imageUrl } from "@/lib/imageUrl";
import { BasketItem } from "@/lib/store";
import stripe from "@/lib/stripe";

export type Metadata = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId: string;
};

export type GroupedBasketItem = {
  product: BasketItem["product"];
  quantity: number;
};

export async function createCheckoutSession(
  items: GroupedBasketItem[],
  metadata: Metadata
) {
  try {
    const itemsWithoutPrice = items.filter((item) => !item.product.price);
    if (itemsWithoutPrice.length > 0) {
      throw new Error("Some items do not have a price");
    }

    const customers = await stripe.customers.list({
      email: metadata.customerEmail,
      limit: 1,
    });

    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? `https://${process.env.VERCEL_URL}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}`;

    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${metadata.orderNumber}`;
    const cancelUrl = `${baseUrl}/basket`;

    // Soma total dos produtos
    const total = items.reduce((sum, item) => {
      return sum + (item.product.price! * item.quantity);
    }, 0);

    // Registra os produtos no Stripe
    const line_items = items.map((item) => ({
      price_data: {
        currency: "brl",
        unit_amount: Math.round(item.product.price! * 100),
        product_data: {
          name: item.product.name || "Unnamed Product",
          description: `Product ID: ${item.product._id}`,
          metadata: {
            id: item.product._id,
          },
          images: item.product.image
            ? [imageUrl(item.product.image).url()]
            : undefined,
        },
      },
      quantity: item.quantity,
    }));

    // Adiciona frete se necessário
    if (total < 100) {
      line_items.push({
        price_data: {
          currency: "brl",
          unit_amount: 4000, // R$ 40,00 em centavos
          product_data: {
            name: "Frete",
            description: "Frete para pedidos abaixo de R$100",
            metadata: {
              id: "frete",
            },
            images: undefined,
          },
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_creation: customerId ? undefined : "always",
      customer_email: !customerId ? metadata.customerEmail : undefined,
      metadata,
      mode: "payment",
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items,
    });

    return session.url;
  } catch (error) {
    console.error("Error creating checkout session", error);
    throw error;
  }
}
