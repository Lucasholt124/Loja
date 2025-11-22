"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/nextjs";
import {
  Star,

  X,
  ThumbsUp,
  ThumbsDown,
  Camera,
  Play,
  Filter,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Send,
  Sparkles,
  Image as ImageIcon,
  ZoomIn,

  Verified,
} from "lucide-react";

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
  helpful?: number;
  isVerifiedPurchase?: boolean;
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
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "rating">("recent");
  const [showMediaOnly, setShowMediaOnly] = useState(false);

  // Form state
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: "IMAGE" | "VIDEO" } | null>(null);

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

  // Estatísticas de avaliações
  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return { average: 0, total: 0, distribution: [0, 0, 0, 0, 0], withMedia: 0 };
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / total;

    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      distribution[r.rating - 1]++;
    });

    const withMedia = reviews.filter((r) => r.media && r.media.length > 0).length;

    return { average, total, distribution, withMedia };
  }, [reviews]);

  // Filtrar e ordenar reviews
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    // Filtro por rating
    if (filterRating) {
      filtered = filtered.filter((r) => r.rating === filterRating);
    }

    // Filtro por mídia
    if (showMediaOnly) {
      filtered = filtered.filter((r) => r.media && r.media.length > 0);
    }

    // Ordenar
    switch (sortBy) {
      case "helpful":
        filtered.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "recent":
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [reviews, filterRating, sortBy, showMediaOnly]);

  const onPickImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    const remaining = Math.max(0, MAX_IMAGES - images.length);
    const selected = files.slice(0, remaining);

    const valid = selected.filter((f) => {
      const okType = f.type.startsWith("image/");
      const okSize = f.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024;
      if (!okType || !okSize) {
        setValidationError(
          !okType
            ? "Tipo de arquivo inválido"
            : `Imagem maior que ${MAX_IMAGE_SIZE_MB}MB`
        );
        setTimeout(() => setValidationError(""), 3000);
        return false;
      }
      return true;
    });

    setImages((prev) => [...prev, ...valid]);
    if (imageInputRef.current) imageInputRef.current.value = "";

    // Haptic feedback
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(30);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onPickVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const okType = file.type.startsWith("video/");
    const okSize = file.size <= MAX_VIDEO_SIZE_MB * 1024 * 1024;

    if (!okType || !okSize) {
      setValidationError(
        !okType
          ? "Tipo de vídeo inválido"
          : `Vídeo maior que ${MAX_VIDEO_SIZE_MB}MB`
      );
      setTimeout(() => setValidationError(""), 3000);
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }

    setVideo(file);
    if (videoInputRef.current) videoInputRef.current.value = "";

    // Haptic feedback
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(30);
    }
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

    // Validações
    if (newComment.trim().length < 10) {
      setValidationError("O comentário deve ter pelo menos 10 caracteres.");
      setTimeout(() => setValidationError(""), 3000);
      return;
    }
    if (rating < 1 || rating > 5) {
      setValidationError("Selecione uma nota de 1 a 5 estrelas.");
      setTimeout(() => setValidationError(""), 3000);
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
          body: form,
        });

        if (!res.ok) throw new Error("Falha ao enviar comentário.");

        // Reset form
        setNewComment("");
        setRating(0);
        setImages([]);
        setVideo(null);

        // Show success
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // Haptic feedback
        if (typeof window !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([50, 30, 50, 30, 50]);
        }

        await fetchReviews();
      } catch (error) {
        console.error(error);
        setValidationError("Erro ao enviar avaliação. Tente novamente.");
        setTimeout(() => setValidationError(""), 3000);
      }
    });
  };

  const clearFilters = () => {
    setFilterRating(null);
    setShowMediaOnly(false);
  };

  const hasActiveFilters = filterRating !== null || showMediaOnly;

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="overflow-hidden rounded-3xl border-2 border-gray-100 bg-gradient-to-br from-white via-blue-50/30 to-violet-50/30 p-6 shadow-xl backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-3xl font-black tracking-tight text-gray-900">
              <Sparkles className="size-8 text-blue-600" />
              Avaliações de Clientes
            </h2>
            <p className="text-sm text-gray-600">
              Veja o que nossos clientes estão dizendo sobre{" "}
              <span className="font-bold text-blue-600">{productName}</span>
            </p>
          </div>

          {stats.total > 0 && (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 shadow-lg">
                <Star className="size-6 fill-white text-white" strokeWidth={2} />
                <span className="text-2xl font-black text-white">
                  {stats.average.toFixed(1)}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-600">
                {stats.total} avaliações
              </p>
            </div>
          )}
        </div>

        {/* Distribuição de Estrelas */}
        {stats.total > 0 && (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.distribution[stars - 1];
              const percentage = (count / stats.total) * 100;

              return (
                <button
                  key={stars}
                  onClick={() => setFilterRating(filterRating === stars ? null : stars)}
                  className={[
                    "group flex w-full items-center gap-3 rounded-xl p-2 transition-all hover:bg-white/60",
                    filterRating === stars ? "bg-white shadow-md ring-2 ring-blue-500" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-1">
                    <span className="w-3 text-sm font-bold text-gray-700">{stars}</span>
                    <Star className="size-4 fill-amber-400 text-amber-400" strokeWidth={0} />
                  </div>

                  <div className="flex-1">
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <span className="w-12 text-right text-sm font-bold text-gray-600">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Stats adicionais */}
        {stats.total > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-gray-200">
              <ImageIcon className="size-4 text-blue-600" strokeWidth={2} />
              <span className="text-sm font-bold text-gray-700">
                {stats.withMedia} com fotos/vídeos
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-gray-200">
              <TrendingUp className="size-4 text-emerald-600" strokeWidth={2} />
              <span className="text-sm font-bold text-gray-700">
                {Math.round((stats.distribution[4] / stats.total) * 100)}% recomendam
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Formulário de Avaliação */}
      <SignedIn>
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50/50 p-6 shadow-xl backdrop-blur-sm sm:p-8"
        >
          <div className="mb-4 flex items-center gap-3">
            <img
              src={user?.imageUrl ?? "/default-avatar.png"}
              alt={user?.firstName ?? "Usuário"}
              className="size-12 rounded-full border-2 border-blue-200 shadow-md"
            />
            <div>
              <h3 className="text-lg font-black text-gray-900">
                Compartilhe sua experiência
              </h3>
              <p className="text-sm text-gray-600">
                Sua opinião é muito importante para nós! ✨
              </p>
            </div>
          </div>

          {/* Rating Selector */}
          <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <label className="mb-3 block text-sm font-bold text-gray-700">
              Qual é a sua nota? *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHoveredRating(i)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="group transition-transform hover:scale-125 active:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-full"
                  aria-label={`Dar ${i} ${i === 1 ? "estrela" : "estrelas"}`}
                >
                  <Star
                    className={[
                      "size-10 transition-all duration-200 sm:size-12",
                      i <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400 drop-shadow-lg"
                        : "fill-gray-200 text-gray-300 group-hover:fill-amber-200 group-hover:text-amber-300",
                    ].join(" ")}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 animate-fade-in rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-sm font-black text-white shadow-lg">
                  {rating}/5 {rating === 5 ? "🎉" : rating >= 4 ? "👍" : rating >= 3 ? "😊" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Comentário */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Conte mais sobre sua experiência *
            </label>
            <textarea
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Ex: Adorei ${productName}! A qualidade superou minhas expectativas...`}
              className="block w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 placeholder:text-gray-400 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className={newComment.length >= 10 ? "text-green-600 font-semibold" : "text-gray-500"}>
                {newComment.length >= 10 ? "✓" : ""} Mínimo 10 caracteres
              </span>
              <span className="text-gray-500">{newComment.length}/500</span>
            </div>
          </div>

          {/* Upload de Mídia */}
          <div className="mb-5 space-y-3">
            <label className="block text-sm font-bold text-gray-700">
              Adicione fotos ou vídeo (opcional)
            </label>

            <div className="flex flex-wrap gap-3">
              {/* Botão de Fotos */}
              <label
                className={[
                  "group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl border-2 px-4 py-3 font-bold transition-all duration-300 hover:scale-105 active:scale-95",
                  images.length >= MAX_IMAGES
                    ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md hover:border-blue-400 hover:shadow-lg",
                ].join(" ")}
              >
                <Camera className="size-5" strokeWidth={2.5} />
                <span className="text-sm">
                  Fotos ({images.length}/{MAX_IMAGES})
                </span>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={images.length >= MAX_IMAGES}
                  className="hidden"
                  onChange={onPickImages}
                />
              </label>

              {/* Botão de Vídeo */}
              <label
                className={[
                  "group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl border-2 px-4 py-3 font-bold transition-all duration-300 hover:scale-105 active:scale-95",
                  video
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 shadow-md hover:border-violet-400 hover:shadow-lg",
                ].join(" ")}
              >
                <Play className="size-5" strokeWidth={2.5} />
                <span className="text-sm">{video ? "Vídeo ✓" : "Vídeo"}</span>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={onPickVideo}
                  disabled={!!video}
                />
              </label>
            </div>

            <p className="flex items-start gap-1.5 text-xs text-gray-500">
              <AlertCircle className="size-4 shrink-0 text-blue-500" />
              <span>
                Máx. {MAX_IMAGES} fotos ({MAX_IMAGE_SIZE_MB}MB cada) e 1 vídeo ({MAX_VIDEO_SIZE_MB}MB)
              </span>
            </p>
          </div>

          {/* Previews */}
          {(imagePreviews.length > 0 || videoPreview) && (
            <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
              <h4 className="mb-3 text-sm font-bold text-gray-700">Prévia das mídias</h4>

              {imagePreviews.length > 0 && (
                <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {imagePreviews.map((src, idx) => (
                    <div
                      key={idx}
                      className="group relative overflow-hidden rounded-xl ring-2 ring-gray-200 transition-all hover:ring-blue-500"
                    >
                      <img
                        src={src}
                        alt={`Imagem ${idx + 1}`}
                        className="aspect-square w-full object-cover transition-transform group-hover:scale-110"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1.5 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-red-600 group-hover:opacity-100 active:scale-90"
                        aria-label="Remover imagem"
                      >
                        <X className="size-4" strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {videoPreview && (
                <div className="group relative overflow-hidden rounded-xl ring-2 ring-gray-200">
                  <video
                    src={videoPreview}
                    className="w-full rounded-xl"
                    controls
                    preload="metadata"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white backdrop-blur-sm transition-all hover:bg-red-600 active:scale-90"
                    aria-label="Remover vídeo"
                  >
                    <X className="size-5" strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mensagens de Validação/Sucesso */}
          {validationError && (
            <div className="mb-4 animate-shake rounded-2xl bg-red-50 p-4 ring-2 ring-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-5 shrink-0 text-red-600" />
                <p className="text-sm font-bold text-red-700">{validationError}</p>
              </div>
            </div>
          )}

          {showSuccess && (
            <div className="mb-4 animate-slide-down rounded-2xl bg-green-50 p-4 ring-2 ring-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 shrink-0 text-green-600" />
                <p className="text-sm font-bold text-green-700">
                  Avaliação enviada com sucesso! 🎉
                </p>
              </div>
            </div>
          )}

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={isSubmitting || newComment.trim().length < 10 || rating < 1}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 px-6 py-4 font-black text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 text-base uppercase tracking-wide">
              {isSubmitting ? (
                <>
                  <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="size-5" strokeWidth={2.5} />
                  Publicar Avaliação
                </>
              )}
            </span>
            {!isSubmitting && (
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100" />
            )}
          </button>
        </form>
      </SignedIn>

      {/* Usuário não logado */}
      <SignedOut>
        <div className="overflow-hidden rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg">
            <Star className="size-8 text-white" fill="white" strokeWidth={2} />
          </div>
          <h3 className="mb-2 text-xl font-black text-gray-900">
            Compartilhe sua opinião!
          </h3>
          <p className="mb-6 text-gray-600">
            Entre para avaliar este produto e ajudar outros clientes.
          </p>
          <button
            type="button"
            onClick={handleOpenSignIn}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 font-black text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 active:scale-95"
          >
            <Sparkles className="size-5" />
            Fazer Login
          </button>
        </div>
      </SignedOut>

      {/* Filtros e Ordenação */}
      {reviews.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="size-5 text-gray-600" strokeWidth={2} />
            <span className="text-sm font-bold text-gray-700">Filtros:</span>

            <button
              onClick={() => setShowMediaOnly(!showMediaOnly)}
              className={[
                "rounded-xl border-2 px-3 py-1.5 text-sm font-bold transition-all hover:scale-105 active:scale-95",
                showMediaOnly
                  ? "border-blue-500 bg-blue-600 text-white shadow-lg"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-400",
              ].join(" ")}
            >
              <span className="flex items-center gap-1.5">
                <ImageIcon className="size-4" />
                Com mídia
              </span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-xl bg-red-100 px-3 py-1.5 text-sm font-bold text-red-700 ring-1 ring-red-300 transition-all hover:bg-red-200 active:scale-95"
              >
                <X className="size-4" />
                Limpar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-900 transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="recent">Mais Recentes</option>
              <option value="helpful">Mais Úteis</option>
              <option value="rating">Melhor Avaliados</option>
            </select>
          </div>
        </div>
      )}

      {/* Lista de Reviews */}
      <div className="space-y-4">
        {isLoading ? (
          // Skeleton Loading
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl border-2 border-gray-200 bg-white p-6"
            >
              <div className="flex gap-4">
                <div className="size-12 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-24 rounded bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-gray-200" />
                    <div className="h-3 w-5/6 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="group overflow-hidden rounded-3xl border-2 border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:border-blue-300 hover:shadow-xl sm:p-8"
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <img
                  src={review.user?.imageUrl ?? "/default-avatar.png"}
                  alt={review.user?.firstName ?? "Usuário"}
                  className="size-12 shrink-0 rounded-full border-2 border-gray-200 shadow-md sm:size-14"
                />

                <div className="min-w-0 flex-1">
                  {/* Header do Review */}
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">
                          {review.user?.firstName ?? "Usuário anônimo"}
                        </h4>
                        {review.isVerifiedPurchase && (
                          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 ring-1 ring-green-300">
                            <Verified className="size-3" fill="currentColor" />
                            Compra verificada
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="mt-1.5 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`size-4 ${
                              i <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                            strokeWidth={0}
                          />
                        ))}
                        <span className="ml-1 text-sm font-bold text-gray-600">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>

                    <time className="shrink-0 text-sm font-semibold text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>

                  {/* Texto do Review */}
                  <div className="prose prose-sm mb-4 max-w-none text-gray-700">
                    <p className={expandedReview === review.id ? "" : "line-clamp-4"}>
                      {review.text}
                    </p>
                    {review.text.length > 200 && (
                      <button
                        onClick={() =>
                          setExpandedReview(
                            expandedReview === review.id ? null : review.id
                          )
                        }
                        className="mt-1 text-sm font-bold text-blue-600 hover:underline"
                      >
                        {expandedReview === review.id ? "Ver menos" : "Ver mais"}
                      </button>
                    )}
                  </div>

                  {/* Mídias do Review */}
                  {review.media && review.media.length > 0 && (
                    <div className="mb-4 space-y-3">
                      {/* Imagens */}
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                        {review.media
                          .filter((m) => m.type === "IMAGE")
                          .map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setLightboxMedia({ url: m.url, type: "IMAGE" })}
                              className="group/img relative overflow-hidden rounded-xl ring-2 ring-gray-200 transition-all hover:ring-blue-500 hover:scale-105"
                            >
                              <img
                                src={m.url}
                                alt="Foto da avaliação"
                                className="aspect-square w-full object-cover transition-transform group-hover/img:scale-110"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover/img:opacity-100">
                                <ZoomIn className="size-6 text-white" strokeWidth={2.5} />
                              </div>
                            </button>
                          ))}
                      </div>

                      {/* Vídeos */}
                      {review.media
                        .filter((m) => m.type === "VIDEO")
                        .map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setLightboxMedia({ url: m.url, type: "VIDEO" })}
                            className="group/vid relative overflow-hidden rounded-xl ring-2 ring-gray-200"
                          >
                            <video
                              src={m.url}
                              className="w-full rounded-xl"
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover/vid:opacity-100">
                              <Play className="size-12 text-white" fill="white" strokeWidth={2} />
                            </div>
                          </button>
                        ))}
                    </div>
                  )}

                  {/* Actions (Útil/Não útil) - Placeholder */}
                  <div className="flex items-center gap-4 border-t border-gray-200 pt-4">
                    <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 transition-all hover:bg-gray-100 active:scale-95">
                      <ThumbsUp className="size-4" strokeWidth={2} />
                      Útil {review.helpful ? `(${review.helpful})` : ""}
                    </button>
                    <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 transition-all hover:bg-gray-100 active:scale-95">
                      <ThumbsDown className="size-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Empty State
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-200">
                <Star className="size-8 text-gray-400" strokeWidth={2} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                {hasActiveFilters
                  ? "Nenhuma avaliação encontrada"
                  : "Seja o primeiro a avaliar!"}
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                {hasActiveFilters
                  ? "Tente ajustar os filtros"
                  : "Compartilhe sua experiência com outros clientes"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="rounded-xl bg-blue-600 px-6 py-2 font-bold text-white shadow-lg transition-all hover:bg-blue-700 hover:scale-105 active:scale-95"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox para Mídia */}
      {lightboxMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setLightboxMedia(null)}
        >
          <button
            onClick={() => setLightboxMedia(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 active:scale-95"
            aria-label="Fechar"
          >
            <X className="size-6" strokeWidth={3} />
          </button>

          <div className="max-h-[90vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {lightboxMedia.type === "IMAGE" ? (
              <img
                src={lightboxMedia.url}
                alt="Imagem ampliada"
                className="max-h-[90vh] w-auto rounded-2xl shadow-2xl"
              />
            ) : (
              <video
                src={lightboxMedia.url}
                controls
                autoPlay
                className="max-h-[90vh] w-auto rounded-2xl shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}