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
    console.error("Erro ao verificar webhook:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Lógica do evento
  if (relevantEvents.has(event.type)) {
    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("✅ Sessão de checkout concluída:", session);

        // Aqui você pode acessar session.metadata (ex: orderNumber, userId, etc.)
        // E salvar no banco de dados, enviar e-mail, etc.
      }

      // Adicione outros casos de evento se quiser
    } catch (err) {
      console.error("Erro no handler de evento:", err);
      return new NextResponse("Webhook handler failed", { status: 500 });
    }
  }

  // Resposta obrigatória do Stripe
  return new NextResponse("Received", { status: 200 });
}
