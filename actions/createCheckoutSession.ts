
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

    // Soma total dos produtos
    const total = items.reduce(
      (sum, item) => sum + (item.product.price! * item.quantity),
      0
    );

    const needsShipping = total < 100;
    const shippingAmount = needsShipping ? 40 : 0;

    // Valor das parcelas (total + frete se tiver)
    const totalWithShipping = total + shippingAmount;
    const installmentValue = Math.ceil(
      (totalWithShipping / installments) * 100
    ); // em centavos

    // --- ALTERAÇÃO PRINCIPAL AQUI ---
    const product = await stripe.products.create({
      name: `Pedido ${metadata.orderNumber}`,
      description: items
        .map((item) => `${item.product.name} x${item.quantity}`)
        .join(", "),
      images: items
        // Filtra para garantir que o produto tenha um array 'images' e que ele não esteja vazio
        .filter((item) => item.product.images && item.product.images.length > 0)
        // Mapeia para pegar a URL da PRIMEIRA imagem do array de cada produto
        .map((item) => imageUrl(item.product.images![0]).url())
        .slice(0, 8), // O Stripe só permite 8 imagens, o slice continua correto
      metadata: {
        orderNumber: metadata.orderNumber,
        customerName: metadata.customerName,
      },
    });
    // --- FIM DA ALTERAÇÃO ---

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

    // Se tiver frete, adiciona como cobrança única
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