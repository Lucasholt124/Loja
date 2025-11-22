import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

// GET: retorna a média das avaliações e a quantidade total
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productSlug = searchParams.get("productSlug");

    if (!productSlug) {
      return NextResponse.json(
        { error: "Slug do produto faltando" },
        { status: 400 }
      );
    }

    // Busca todas as reviews do produto
    const reviews = await prisma.review.findMany({
      where: { productSlug },
      select: { rating: true },
    });

    // Calcula a média
    const count = reviews.length;
    const average = count > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
      : 0;

    return NextResponse.json({
      average: Number(average.toFixed(1)),
      count,
    });
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") {
      return dbNotMigrated();
    }
    console.error("GET /api/reviews/average error:", e);
    return NextResponse.json(
      { error: "Erro ao calcular média das avaliações" },
      { status: 500 }
    );
  }
}