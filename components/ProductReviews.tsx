"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/nextjs";
import { Star, ImagePlus, Video, X } from "lucide-react";

// Tipos que chegam da API (GET)
interface ReviewMedia {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
}

interface Review {
  id: string;
  text: string;
  rating: number;
  createdAt: string;
  user: {
    firstName: string | null;
    imageUrl: string | null;
  };
  media?: ReviewMedia[];
}

interface ProductReviewsProps {
  productSlug: string;
  productName: string;
}

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 100;

export default function ProductReviews({ productSlug, productName }: ProductReviewsProps) {
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState<number>(0);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, startTransition] = useTransition();

  const currentPath = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname + window.location.search + window.location.hash;
    }
    return `/product/${encodeURIComponent(productSlug)}`;
  }, [productSlug]);

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/reviews?productSlug=${encodeURIComponent(productSlug)}`);
      if (!res.ok) throw new Error("Falha ao buscar reviews.");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [productSlug]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Previews de imagens
  useEffect(() => {
    const urls = images.map((f) => URL.createObjectURL(f));
    setImagePreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [images]);

  // Preview de vídeo
  useEffect(() => {
    if (!video) {
      setVideoPreview(null);
      return;
    }
    const url = URL.createObjectURL(video);
    setVideoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [video]);

  const onPickImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    const remaining = Math.max(0, MAX_IMAGES - images.length);
    const selected = files.slice(0, remaining);

    const valid = selected.filter((f) => {
      const okType = f.type.startsWith("image/");
      const okSize = f.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024;
      if (!okType) console.warn(`Arquivo ignorado (tipo inválido): ${f.name}`);
      if (!okSize) console.warn(`Arquivo ignorado (imagem > ${MAX_IMAGE_SIZE_MB}MB): ${f.name}`);
      return okType && okSize;
    });

    setImages((prev) => [...prev, ...valid]);

    // Reset input para poder escolher os mesmos arquivos novamente se quiser
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onPickVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const okType = file.type.startsWith("video/");
    const okSize = file.size <= MAX_VIDEO_SIZE_MB * 1024 * 1024;
    if (!okType) {
      console.warn("Tipo de vídeo inválido.");
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }
    if (!okSize) {
      console.warn(`Vídeo maior que ${MAX_VIDEO_SIZE_MB}MB.`);
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }
    setVideo(file);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const removeVideo = () => {
    setVideo(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleOpenSignIn = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      openSignIn({
        forceRedirectUrl: currentPath,
        signUpForceRedirectUrl: currentPath,
      });
    },
    [openSignIn, currentPath]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim().length < 3) {
      alert("O comentário deve ter pelo menos 3 caracteres.");
      return;
    }
    if (rating < 1 || rating > 5) {
      alert("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    startTransition(async () => {
      try {
        const form = new FormData();
        form.append("productSlug", productSlug);
        form.append("text", newComment.trim());
        form.append("rating", String(rating));

        images.forEach((img) => form.append("images", img));
        if (video) form.append("video", video);

        const res = await fetch("/api/reviews", {
          method: "POST",
          body: form, // Importante: não setar Content-Type manualmente
        });

        if (!res.ok) throw new Error("Falha ao enviar comentário.");

        setNewComment("");
        setRating(0);
        setImages([]);
        setVideo(null);

        await fetchReviews();
        // toast.success("Comentário enviado!");
      } catch (error) {
        console.error(error);
        alert("Erro ao enviar comentário. Tente novamente.");
      }
    });
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-md">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">
        Avaliações de Clientes ({reviews.length})
      </h2>

      {/* Formulário (apenas logado) */}
      <SignedIn>
        <form onSubmit={handleSubmit} className="my-6 space-y-4">
          {/* Cabeçalho com avatar + rating */}
          <div className="flex items-start gap-4">
            <img
              src={user?.imageUrl ?? "/default-avatar.png"}
              alt={user?.firstName ?? "Usuário"}
              className="h-10 w-10 rounded-full bg-gray-200"
            />

            <div className="min-w-0 flex-1">
              {/* Estrelas */}
              <div className="mb-3 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    aria-label={`Dar ${i} ${i === 1 ? "estrela" : "estrelas"}`}
                    className="focus:outline-none"
                    title={`${i} ${i === 1 ? "estrela" : "estrelas"}`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm text-gray-600">
                  {rating > 0 ? `${rating}/5` : "Selecione a nota"}
                </span>
              </div>

              {/* Comentário */}
              <textarea
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={`O que você achou de ${productName}?`}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />

              {/* Upload de mídias */}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {/* Botão de fotos */}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <ImagePlus className="h-4 w-4" />
                  Adicionar fotos
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onPickImages}
                  />
                </label>

                {/* Botão de vídeo */}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Video className="h-4 w-4" />
                  Adicionar vídeo
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={onPickVideo}
                  />
                </label>

                <span className="text-xs text-gray-500">
                  Máx. {MAX_IMAGES} imagens ({MAX_IMAGE_SIZE_MB}MB cada) e 1 vídeo ({MAX_VIDEO_SIZE_MB}MB)
                </span>
              </div>

              {/* Previews */}
              {(imagePreviews.length > 0 || videoPreview) && (
                <div className="mt-3 space-y-3">
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={src}
                            alt={`Imagem ${idx + 1}`}
                            className="aspect-square w-full rounded object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                            aria-label="Remover imagem"
                            title="Remover imagem"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {videoPreview && (
                    <div className="relative">
                      <video
                        src={videoPreview}
                        className="w-full rounded"
                        controls
                        preload="metadata"
                      />
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                        aria-label="Remover vídeo"
                        title="Remover vídeo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || newComment.trim().length < 3 || rating < 1}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Enviando..." : "Enviar avaliação"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </SignedIn>

      {/* Usuário não logado -> botão que abre o modal do Clerk */}
      <SignedOut>
        <div className="my-6 rounded-md bg-gray-100 p-4 text-center text-sm text-gray-700">
          <button
            type="button"
            onClick={handleOpenSignIn}
            className="font-semibold text-indigo-600 hover:underline"
          >
            Faça login
          </button>{" "}
          para deixar uma avaliação.
        </div>
      </SignedOut>

      {/* Lista de comentários */}
      <div className="mt-8 space-y-8">
        {isLoading ? (
          <p className="text-center text-gray-500">Carregando avaliações...</p>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="flex gap-4">
              <img
                src={review.user?.imageUrl ?? "/default-avatar.png"}
                alt={review.user?.firstName ?? "Usuário"}
                className="h-10 w-10 rounded-full bg-gray-200"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.user?.firstName ?? "Usuário anônimo"}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div className="prose prose-sm mt-2 max-w-none text-gray-700">
                  <p>{review.text}</p>
                </div>

                {/* Mídias do review */}
                {review.media && review.media.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {/* Imagens */}
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {review.media
                        .filter((m) => m.type === "IMAGE")
                        .map((m) => (
                          <img
                            key={m.id}
                            src={m.url}
                            alt="Foto da avaliação"
                            className="aspect-square w-full rounded object-cover"
                          />
                        ))}
                    </div>

                    {/* Vídeos */}
                    {review.media
                      .filter((m) => m.type === "VIDEO")
                      .map((m) => (
                        <video
                          key={m.id}
                          src={m.url}
                          className="w-full rounded"
                          controls
                          preload="metadata"
                        />
                      ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Ainda não há avaliações. Seja o primeiro!</p>
        )}
      </div>
    </div>
  );
}