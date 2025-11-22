import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { backendClient } from "@/sanity/lib/backendClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil" as any,
});

const relevantEvents = new Set([
  "checkout.session.completed",
  "invoice.payment_succeeded",
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Erro de assinatura Webhook:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      // ====================================================
      // 1. CHECKOUT SESSION COMPLETED (Cria o pedido)
      // ====================================================
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✅ Sessão Checkout:", session.id);

        // Busca os itens expandindo o produto para ler o metadata
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          { expand: ["data.price.product"] }
        );

        // Prepara o array de produtos para o Sanity
        let sanityProducts: any[] = [];

        // Percorre os itens da sessão
        for (const item of lineItems.data) {
          const productStripe = item.price?.product as Stripe.Product;

          // Verifica se é o produto principal (que contém o JSON dos itens)
          if (productStripe.metadata?.sanityItems) {
            try {
              // Decodifica o JSON que criamos no createCheckoutSession
              const itemsData = JSON.parse(productStripe.metadata.sanityItems);

              // Mapeia para o formato do Sanity Order
              const mappedItems = itemsData.map((sanityItem: any) => ({
                _key: crypto.randomUUID(),
                product: {
                  _type: "reference",
                  _ref: sanityItem.id, // O ID real do produto no Sanity
                },
                quantity: sanityItem.q || 1,
              }));

              sanityProducts = [...sanityProducts, ...mappedItems];
            } catch (e) {
              console.error("Erro ao fazer parse dos itens do Sanity:", e);
            }
          }
        }

        // Se por algum motivo o JSON falhar, ou for vazio (ex: só frete), tentamos fallback
        if (sanityProducts.length === 0) {
            console.log("⚠️ Nenhum produto Sanity encontrado no metadata, pedido pode ficar sem itens.");
        }

        // Cria o pedido no Sanity
        await backendClient.create({
          _type: "order",
          orderNumber: session.metadata?.orderNumber || session.id,
          orderDate: new Date().toISOString(),
          status: "paid",
          clerkUserId: session.metadata?.clerkUserId,
          customerName: session.metadata?.customerName || session.customer_details?.name,
          email: session.metadata?.customerEmail || session.customer_details?.email,
          totalPrice: Number(session.metadata?.totalAmount) || (session.amount_total || 0) / 100,
          currency: session.currency,
          amountDiscount: (session.total_details?.amount_discount || 0) / 100,
          products: sanityProducts,
        });

        console.log("🚀 Pedido salvo no Sanity com sucesso!");
      }

      // ====================================================
      // 2. INVOICE PAYMENT (Controle de Parcelas)
      // ====================================================
      if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as (Stripe.Invoice & { subscription?: string });
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          // Lógica de parcelas
          const installments = parseInt(subscription.metadata?.installments || "1");
          const currentPaid = parseInt(subscription.metadata?.paid_count || "0");
          const newPaidCount = currentPaid + 1;

          console.log(`💳 Parcela ${newPaidCount}/${installments} processada.`);

          await stripe.subscriptions.update(subscriptionId, {
            metadata: {
              ...subscription.metadata,
              paid_count: newPaidCount.toString(),
            },
          });

          if (newPaidCount >= installments) {
            await stripe.subscriptions.update(subscriptionId, {
              cancel_at_period_end: true,
            });
            console.log("✅ Última parcela paga. Assinatura agendada para cancelar.");
          }
        }
      }

    } catch (err) {
      console.error("❌ Erro processando Webhook:", err);
      return new NextResponse("Webhook handler failed", { status: 500 });
    }
  }

  return new NextResponse("Received", { status: 200 });
}