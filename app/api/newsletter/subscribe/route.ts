// ARQUIVO: app/api/newsletter/subscribe/route.ts


import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userId, userName, metadata } = body;

    // Validação básica
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Verifica se usuário está autenticado (opcional)
    // const user = await currentUser(); // Removido pois não estava sendo utilizado

    // ========================================
    // INTEGRAÇÃO COM SERVIÇOS DE EMAIL
    // ========================================

    // 1️⃣ MAILCHIMP
    // const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    // const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX; // ex: us1
    // const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
    //
    // const response = await fetch(
    //   `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`,
    //     },
    //     body: JSON.stringify({
    //       email_address: email,
    //       status: "subscribed",
    //       merge_fields: {
    //         FNAME: userName?.split(" ")[0] || "",
    //         LNAME: userName?.split(" ").slice(1).join(" ") || "",
    //       },
    //       tags: ["website"],
    //     }),
    //   }
    // );

    // 2️⃣ SENDGRID
    // const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    // const SENDGRID_LIST_ID = process.env.SENDGRID_LIST_ID;
    //
    // const response = await fetch("https://api.sendgrid.com/v3/marketing/contacts", {
    //   method: "PUT",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${SENDGRID_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     list_ids: [SENDGRID_LIST_ID],
    //     contacts: [
    //       {
    //         email: email,
    //         first_name: userName?.split(" ")[0] || "",
    //         last_name: userName?.split(" ").slice(1).join(" ") || "",
    //         custom_fields: {
    //           user_id: userId || "",
    //           source: metadata?.source || "website",
    //         },
    //       },
    //     ],
    //   }),
    // });

    // 3️⃣ CONVERTKIT
    // const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
    // const CONVERTKIT_FORM_ID = process.env.CONVERTKIT_FORM_ID;
    //
    // const response = await fetch(
    //   `https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`,
    //   {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       api_key: CONVERTKIT_API_KEY,
    //       email: email,
    //       first_name: userName?.split(" ")[0] || "",
    //       fields: {
    //         user_id: userId || "",
    //         source: metadata?.source || "website",
    //       },
    //     }),
    //   }
    // );

    // 4️⃣ RESEND (para emails transacionais)
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    //
    // await resend.emails.send({
    //   from: 'Newsletter <newsletter@sualoja.com>',
    //   to: email,
    //   subject: 'Bem-vindo à nossa newsletter!',
    //   html: `<h1>Obrigado por se inscrever!</h1><p>Fique atento às nossas ofertas exclusivas.</p>`,
    // });

    // 5️⃣ SALVAR NO BANCO DE DADOS (Exemplo com Sanity)
    // import { client } from "@/sanity/lib/client";
    //
    // await client.create({
    //   _type: "newsletter_subscriber",
    //   email: email,
    //   userId: userId || null,
    //   userName: userName || null,
    //   subscribedAt: new Date().toISOString(),
    //   source: metadata?.source || "website",
    //   status: "active",
    // });

    // ========================================
    // MOCK DE SUCESSO (para desenvolvimento)
    // ========================================
    console.log("Newsletter subscription:", {
      email,
      userId,
      userName,
      metadata,
      timestamp: new Date().toISOString(),
    });

    // Simula delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json(
      {
        success: true,
        message: "Email cadastrado com sucesso!",
        subscriber: {
          email,
          subscribedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Erro ao processar cadastro" },
      { status: 500 }
    );
  }
}

// Endpoint para descadastrar (opcional)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email necessário" }, { status: 400 });
    }

    // Implementar lógica de unsubscribe
    console.log("Newsletter unsubscribe:", email);

    return NextResponse.json(
      { success: true, message: "Email removido da lista" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return NextResponse.json(
      { error: "Erro ao processar remoção" },
      { status: 500 }
    );
  }
}