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
  metadata: Metadata,
  installments: number
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

    const total = items.reduce(
      (sum, item) => sum + item.product.price! * item.quantity,
      0
    );

    const needsShipping = total < 100;
    const shippingAmount = needsShipping ? 40 : 0;
    const totalWithShipping = total + shippingAmount;
    const installmentValue = Math.ceil(
      (totalWithShipping / installments) * 100
    );

    // --- CORREÇÃO: CRIAÇÃO DO JSON DOS ITENS ---
    // Criamos um resumo minificado dos itens para caber no metadata do Stripe (max 500 chars)
    // Salvamos apenas o ID e a Quantidade (q)
    const sanityItemsJson = JSON.stringify(
      items.map((item) => ({
        id: item.product._id,
        q: item.quantity,
      }))
    );

    const product = await stripe.products.create({
      name: `Pedido ${metadata.orderNumber}`,
      description: items
        .map((item) => `${item.product.name} x${item.quantity}`)
        .join(", "),
      images: items
        .filter((item) => item.product.images && item.product.images.length > 0)
        .map((item) => imageUrl(item.product.images![0]).url())
        .slice(0, 8),
      metadata: {
        orderNumber: metadata.orderNumber,
        customerName: metadata.customerName,
        // 🔥 AQUI ESTÁ O SEGREDO: Salvamos os itens aqui para o webhook ler depois
        sanityItems: sanityItemsJson.slice(0, 500), // Proteção contra limite de caracteres
      },
    });

    const price = await stripe.prices.create({
      unit_amount: installmentValue,
      currency: "brl",
      recurring: { interval: "month" },
      product: product.id,
    });

    const lineItems = [
      {
        price: price.id,
        quantity: 1,
      },
    ];

    if (needsShipping) {
      const shippingProduct = await stripe.products.create({
        name: "Frete",
        description: "Frete fixo para pedidos abaixo de R$100",
      });

      const shippingPrice = await stripe.prices.create({
        unit_amount: shippingAmount * 100,
        currency: "brl",
        product: shippingProduct.id,
      });

      lineItems.push({
        price: shippingPrice.id,
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_creation: customerId ? undefined : "always",
      customer_email: !customerId ? metadata.customerEmail : undefined,
      metadata: {
        ...metadata,
        installments: installments.toString(),
        totalAmount: totalWithShipping.toFixed(2),
      },
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: lineItems,
      subscription_data: {
        metadata: {
          ...metadata,
          installments: installments.toString(),
          totalAmount: totalWithShipping.toFixed(2),
        },
      },
    });

    return session.url;
  } catch (error) {
    console.error("Error creating checkout session", error);
    throw error;
  }
}