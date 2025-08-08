// app/api/wishlist/route.ts
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma"; // ajuste o alias se necessário

export const runtime = "nodejs";

function dbNotMigrated() {
  return NextResponse.json(
    {
      error:
        "Banco não migrado: tabelas do Prisma não existem. Rode as migrações em produção (prisma migrate deploy).",
      code: "P2021",
    },
    { status: 503 }
  );
}

// GET
// - ?productSlug=foo  -> { isFavorite: boolean }
// - sem productSlug ou ?list=1 -> { slugs: string[] }
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const productSlug = searchParams.get("productSlug");
    const list = searchParams.get("list");

    if (productSlug) {
      const wishlistItem = await prisma.wishlistItem.findUnique({
        where: { userId_productSlug: { userId, productSlug } },
      });
      return NextResponse.json({ isFavorite: !!wishlistItem });
    }

    if (!productSlug || list === "1") {
      const items = await prisma.wishlistItem.findMany({
        where: { userId },
        select: { productSlug: true },
      });
      return NextResponse.json({ slugs: items.map((i) => i.productSlug) });
    }

    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021")
      return dbNotMigrated();
    console.error("GET /api/wishlist error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST -> Toggle favorito
// Body: { productSlug: string } -> { isFavorite: boolean }
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const user = await currentUser();
    const body = await request.json().catch(() => ({}));
    const productSlug = body?.productSlug;

    if (!productSlug || typeof productSlug !== "string") {
      return NextResponse.json({ error: "Slug do produto faltando" }, { status: 400 });
    }

    // email é obrigatório e único no schema; garante um fallback estável se faltar
    const email =
      user?.emailAddresses?.[0]?.emailAddress ??
      `${userId}@placeholder.local`; // evita "" que quebraria o @unique ao repetir

    await prisma.user.upsert({
      where: { id: userId },
      update: { email }, // mantém email sincronizado
      create: {
        id: userId,
        email,
        firstName: user?.firstName ?? null,
        imageUrl: user?.imageUrl ?? null,
      },
    });

    const exists = await prisma.wishlistItem.findUnique({
      where: { userId_productSlug: { userId, productSlug } },
    });

    if (exists) {
      await prisma.wishlistItem.delete({
        where: { userId_productSlug: { userId, productSlug } },
      });
      return NextResponse.json({ isFavorite: false, message: "Removido dos favoritos" });
    }

    await prisma.wishlistItem.create({ data: { userId, productSlug } });
    return NextResponse.json({ isFavorite: true, message: "Adicionado aos favoritos" });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021")
      return dbNotMigrated();
    console.error("POST /api/wishlist error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE
// Body: { all: true } -> limpa tudo
// Body: { productSlug: string } -> remove um específico
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json().catch(() => ({}));

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
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021")
      return dbNotMigrated();
    console.error("DELETE /api/wishlist error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}