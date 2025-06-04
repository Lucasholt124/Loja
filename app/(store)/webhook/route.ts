import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Crie a instância do Stripe com sua Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

// Lista de eventos que você quer tratar
const relevantEvents = new Set([
  "checkout.session.completed",
  "payment_intent.succeeded",
  "invoice.payment_succeeded", // ✅ Adicionado para controle de parcelas
]);

export async function POST(req: Request) {
  const body = await req.text(); // body como string (raw)
  const sig = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    // Verifica assinatura com a Signing Secret
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Erro ao verificar webhook:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 🔥 Lógica dos eventos tratados
  if (relevantEvents.has(event.type)) {
    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("✅ Sessão de checkout concluída:", session);

        const isSubscription = session.mode === "subscription";
        const isPayment = session.mode === "payment";

        if (isPayment) {
          console.log("💰 Pagamento único confirmado.");
        }

        if (isSubscription) {
          console.log("📦 Assinatura iniciada para parcelamento.");
        }

        // Aqui você pode acessar session.metadata (orderNumber, clerkUserId, installments, etc.)
        // E salvar no banco de dados, enviar e-mail, etc.
      }

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log("💸 Pagamento único bem-sucedido:", paymentIntent.id);
        // Aqui você pode atualizar o status do pedido como "pago"
      }

      if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as (Stripe.Invoice & { subscription?: string });
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) {
          console.log("⚠️ Invoice sem assinatura associada.");
          return new NextResponse("No subscription on invoice", {
            status: 200,
          });
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const installments = parseInt(
          subscription.metadata?.installments || "1"
        );
        const orderNumber = subscription.metadata?.orderNumber;
        const currentPaid = parseInt(subscription.metadata?.paid_count || "0");

        const newPaidCount = currentPaid + 1;

        console.log(
          `💳 Parcela ${newPaidCount}/${installments} paga para assinatura ${subscriptionId}`
        );

        // Atualiza o metadata com a quantidade de parcelas pagas
        await stripe.subscriptions.update(subscriptionId, {
          metadata: {
            ...subscription.metadata,
            paid_count: newPaidCount.toString(),
          },
        });

        // Se pagou todas as parcelas, cancela a assinatura no final do período
        if (newPaidCount >= installments) {
          await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
          });

          console.log(
            `✅ Parcelamento ${orderNumber} concluído. Assinatura será cancelada no final do período.`
          );
        }
      }
    } catch (err) {
      console.error("❌ Erro no handler de evento:", err);
      return new NextResponse("Webhook handler failed", { status: 500 });
    }
  }

  // Stripe exige resposta 200 para confirmar recebimento
  return new NextResponse("Received", { status: 200 });
}
