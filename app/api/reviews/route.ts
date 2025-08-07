import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

// Configure Cloudinary via env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file: File): Promise<{ url: string; type: "IMAGE" | "VIDEO" }> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const isVideo = file.type?.startsWith("video/");

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: isVideo ? "video" : "auto",
        folder: "reviews",
      },
      (err, result) => {
        if (err || !result) {
          return reject(err || new Error("Upload falhou"));
        }
        resolve({
          url: result.secure_url,
          type: result.resource_type === "video" ? "VIDEO" : "IMAGE",
        });
      }
    );
    stream.end(buffer);
  });
}

// GET: lista reviews (com usuário e mídias)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productSlug = searchParams.get("productSlug");

    if (!productSlug) {
      return NextResponse.json({ error: "Slug do produto faltando" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productSlug },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, imageUrl: true } },
        media: true, // retorna imagens/vídeo do review
      },
    });

    return NextResponse.json({ reviews });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao buscar reviews" }, { status: 500 });
  }
}

// POST: cria review (aceita JSON ou multipart/form-data com imagens/vídeo)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    let productSlug = "";
    let text = "";
    let rating = 0;
    let imageFiles: File[] = [];
    let videoFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      productSlug = String(form.get("productSlug") ?? "");
      text = String(form.get("text") ?? "");
      rating = parseInt(String(form.get("rating") ?? "0"), 10);
      imageFiles = (form.getAll("images") as unknown as File[]).filter(Boolean);
      const maybeVideo = form.get("video");
      videoFile = maybeVideo instanceof File ? maybeVideo : null;
    } else {
      const body = await request.json();
      productSlug = String(body.productSlug ?? "");
      text = String(body.text ?? "");
      rating = parseInt(String(body.rating ?? "0"), 10);
    }

    if (!productSlug || !text || !rating) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating inválido" }, { status: 400 });
    }

    // Garante o usuário no DB
    const clerk = await currentUser();
    const email =
      clerk?.primaryEmailAddress?.emailAddress ??
      clerk?.emailAddresses?.[0]?.emailAddress ??
      `${userId}@placeholder.local`;

    await prisma.user.upsert({
      where: { id: userId },
      update: {
        firstName: clerk?.firstName || null,
        imageUrl: clerk?.imageUrl || null,
        email,
      },
      create: {
        id: userId,
        firstName: clerk?.firstName || null,
        imageUrl: clerk?.imageUrl || null,
        email,
      },
    });

    // Cria o review
    const review = await prisma.review.create({
      data: {
        userId,
        productSlug,
        text,
        rating,
      },
    });

    // Upload de mídias (se Cloudinary estiver configurado)
    const cloudConfigured =
      !!process.env.CLOUDINARY_CLOUD_NAME &&
      !!process.env.CLOUDINARY_API_KEY &&
      !!process.env.CLOUDINARY_API_SECRET;

    if (cloudConfigured && (imageFiles.length > 0 || videoFile)) {
      const uploads: { url: string; type: "IMAGE" | "VIDEO" }[] = [];

      for (const f of imageFiles) {
        const up = await uploadToCloudinary(f);
        uploads.push(up);
      }
      if (videoFile) {
        const up = await uploadToCloudinary(videoFile);
        uploads.push(up);
      }

      if (uploads.length > 0) {
        await prisma.reviewMedia.createMany({
          data: uploads.map((m) => ({
            reviewId: review.id,
            type: m.type,
            url: m.url,
          })),
        });
      }
    }

    return NextResponse.json({ ok: true, id: review.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao criar review" }, { status: 500 });
  }
}