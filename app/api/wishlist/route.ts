import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

// GET
// - ?productSlug=foo  -> { isFavorite: boolean }
// - sem productSlug ou ?list=1 -> { slugs: string[] }
export async function GET(request: Request) {
  const { userId } = await auth(); // não precisa await
  if (!userId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productSlug = searchParams.get("productSlug");
  const list = searchParams.get("list");

  // Caso específico: verificar um item
  if (productSlug) {
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productSlug: { userId, productSlug },
      },
    });
    return NextResponse.json({ isFavorite: !!wishlistItem });
  }

  // Caso geral: listar todos os slugs
  if (!productSlug || list === "1") {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      select: { productSlug: true },
      orderBy: { createdAt: "desc" }, // se não tiver createdAt no schema, remova esta linha
    });

    return NextResponse.json({ slugs: items.map((i) => i.productSlug) });
  }

  return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
}

// POST -> Toggle favorito
// Body: { productSlug: string } -> { isFavorite: boolean }
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await currentUser();
  const { productSlug } = await request.json();

  if (!productSlug || typeof productSlug !== "string") {
    return NextResponse.json({ error: "Slug do produto faltando" }, { status: 400 });
  }

  // Garante usuário no DB (se necessário)
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: user?.emailAddresses?.[0]?.emailAddress ?? "",
      firstName: user?.firstName ?? null,
      imageUrl: user?.imageUrl ?? null,
    },
  });

  const existingItem = await prisma.wishlistItem.findUnique({
    where: { userId_productSlug: { userId, productSlug } },
  });

  if (existingItem) {
    await prisma.wishlistItem.delete({
      where: { userId_productSlug: { userId, productSlug } },
    });
    return NextResponse.json({
      isFavorite: false,
      message: "Removido dos favoritos",
    });
  }

  await prisma.wishlistItem.create({
    data: { userId, productSlug },
  });
  return NextResponse.json({
    isFavorite: true,
    message: "Adicionado aos favoritos",
  });
}

// DELETE
// Body: { all: true } -> limpa tudo
// Body: { productSlug: string } -> remove um específico
export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    /* sem body */
  }

  if (body?.all) {
    await prisma.wishlistItem.deleteMany({ where: { userId } });
    return NextResponse.json({ ok: true });
  }

  const productSlug = body?.productSlug;
  if (!productSlug || typeof productSlug !== "string") {
    return NextResponse.json(
      { error: "Informe 'productSlug' ou 'all: true'." },
      { status: 400 }
    );
  }

  await prisma.wishlistItem.delete({
    where: { userId_productSlug: { userId, productSlug } },
  });

  return NextResponse.json({ ok: true });
}