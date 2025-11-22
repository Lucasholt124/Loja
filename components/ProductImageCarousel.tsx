"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, Zoom, EffectFade, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { imageUrl } from "@/lib/imageUrl";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Download,
  Loader2,
  ImageOff,
  Sparkles,
  Play,
  Pause,
  Minimize2,
} from "lucide-react";

// Estilos Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/zoom";
import "swiper/css/effect-fade";

// --- TIPAGENS ---
interface SanityImageAsset {
  _id: string;
  _type: "sanity.imageAsset";
  url: string;
  metadata?: {
    dimensions?: {
      width: number;
      height: number;
      aspectRatio: number;
    };
    lqip?: string;
  };
}

interface SanityImage {
  _key: string;
  _type: "image";
  alt?: string;
  asset: SanityImageAsset;
  hotspot?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ProductImageCarouselProps {
  images: SanityImage[];
  productName?: string;
  badge?: {
    text: string;
    variant: "new" | "sale" | "featured" | "limited";
  };
  autoplay?: boolean;
  showThumbnails?: boolean;
  allowZoom?: boolean;
  allowFullscreen?: boolean;
  allowShare?: boolean;
  allowDownload?: boolean;
}

const BADGE_STYLES = {
  new: "from-blue-600 to-violet-600",
  sale: "from-rose-600 to-pink-600",
  featured: "from-amber-500 to-orange-600",
  limited: "from-purple-600 to-fuchsia-600",
};

export default function ProductImageCarousel({
  images,
  productName = "Produto",
  badge,
  autoplay = false,
  showThumbnails = true,
  allowZoom = true,
  allowFullscreen = true,
  allowShare = false,
  allowDownload = false,
}: ProductImageCarouselProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isAutoplayRunning, setIsAutoplayRunning] = useState(autoplay);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const lightboxSwiperRef = useRef<SwiperType | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Verificação de imagens válidas
  const validImages = images.filter((img) => img.asset && img.asset.url);

  useEffect(() => {
    if (validImages.length > 0) {
      const img = new window.Image();
      img.src = imageUrl(validImages[0]).url();
      img.onload = () => {
        setIsImageLoading(false);
        setLoadedImages((prev) => new Set(prev).add(0));
      };
    }
  }, [validImages]);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setCurrentIndex(swiper.activeIndex);

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(20);
    }

    const nextIndex = swiper.activeIndex + 1;
    if (nextIndex < validImages.length && !loadedImages.has(nextIndex)) {
      const img = new window.Image();
      img.src = imageUrl(validImages[nextIndex]).url();
      img.onload = () => {
        setLoadedImages((prev) => new Set(prev).add(nextIndex));
      };
    }
  }, [validImages, loadedImages]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    setShowControls(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setIsZoomed(false);
    document.body.style.overflow = "";
  }, []);

  const toggleAutoplay = useCallback(() => {
    if (mainSwiper) {
      if (isAutoplayRunning) {
        mainSwiper.autoplay.stop();
      } else {
        mainSwiper.autoplay.start();
      }
      setIsAutoplayRunning(!isAutoplayRunning);
    }
  }, [mainSwiper, isAutoplayRunning]);

  const handleShare = useCallback(async () => {
    if (!allowShare || !validImages[currentIndex]) return;

    const imageUrl = validImages[currentIndex].asset.url;

    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Confira ${productName}`,
          url: imageUrl,
        });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      navigator.clipboard.writeText(imageUrl);
    }
  }, [allowShare, validImages, currentIndex, productName]);

  const handleDownload = useCallback(() => {
    if (!allowDownload || !validImages[currentIndex]) return;

    const imageUrl = validImages[currentIndex].asset.url;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${productName}-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [allowDownload, validImages, currentIndex, productName]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (!isMobile) {
        setShowControls(false);
      }
    }, 3000);
  }, [isMobile]);

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          lightboxSwiperRef.current?.slidePrev();
          break;
        case "ArrowRight":
          lightboxSwiperRef.current?.slideNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, closeLightbox]);

  // Empty state
  if (!validImages || validImages.length === 0) {
    return (
      <div className="group relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-violet-50/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <ImageOff className="relative mb-4 size-16 text-gray-300 transition-transform group-hover:scale-110" strokeWidth={1.5} />
        <span className="relative text-sm font-semibold text-gray-400">Sem imagens disponíveis</span>
      </div>
    );
  }

  return (
    <div className="relative w-full space-y-3 sm:space-y-4">
      {/* Main Carousel */}
      <div className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-2xl transition-all duration-500 hover:border-blue-300 hover:shadow-blue-500/20 sm:rounded-3xl">
        {/* Loading Skeleton */}
        {isImageLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
            <Loader2 className="size-12 animate-spin text-blue-600" strokeWidth={2.5} />
          </div>
        )}

        {/* Badge */}
        {badge && (
          <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1.5 shadow-2xl backdrop-blur-md animate-bounce-slow sm:left-4 sm:top-4 sm:gap-2 sm:px-4 sm:py-2">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${BADGE_STYLES[badge.variant]} opacity-90`} />
            <Sparkles className="relative size-3 text-white sm:size-4" fill="white" strokeWidth={2} />
            <span className="relative text-xs font-black uppercase tracking-wider text-white drop-shadow sm:text-sm">
              {badge.text}
            </span>
          </div>
        )}

        {/* Counter */}
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-black/80 px-2.5 py-1 shadow-lg backdrop-blur-md sm:right-4 sm:top-4 sm:px-3 sm:py-1.5">
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-white tabular-nums sm:text-sm">
              {currentIndex + 1}
            </span>
            <span className="text-xs text-white/70">/</span>
            <span className="text-xs font-bold text-white/90 tabular-nums sm:text-sm">
              {validImages.length}
            </span>
          </div>
        </div>

        {/* Top Controls - MELHORADO PARA MOBILE */}
        <div className="absolute left-3 right-3 top-14 z-20 flex items-center justify-between transition-all duration-300 sm:left-4 sm:right-4 sm:top-16 sm:opacity-0 sm:group-hover:opacity-100">
          {/* Autoplay Toggle */}
          {validImages.length > 1 && (
            <button
              onClick={toggleAutoplay}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-2.5 py-1.5 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 sm:gap-2 sm:px-3 sm:py-2"
              aria-label={isAutoplayRunning ? "Pausar" : "Reproduzir"}
            >
              {isAutoplayRunning ? (
                <Pause className="size-3.5 sm:size-4" fill="white" strokeWidth={2} />
              ) : (
                <Play className="size-3.5 sm:size-4" fill="white" strokeWidth={2} />
              )}
              <span className="hidden text-xs font-bold sm:inline">
                {isAutoplayRunning ? "Pausar" : "Play"}
              </span>
            </button>
          )}

          <div className="ml-auto flex gap-1.5 sm:gap-2">
            {/* Share */}
            {allowShare && (
              <button
                onClick={handleShare}
                className="rounded-full bg-gradient-to-r from-green-600 to-emerald-600 p-2 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 sm:p-2.5"
                aria-label="Compartilhar"
              >
                <Share2 className="size-3.5 sm:size-4" strokeWidth={2.5} />
              </button>
            )}

            {/* Download */}
            {allowDownload && (
              <button
                onClick={handleDownload}
                className="rounded-full bg-gradient-to-r from-orange-600 to-red-600 p-2 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 sm:p-2.5"
                aria-label="Baixar imagem"
              >
                <Download className="size-3.5 sm:size-4" strokeWidth={2.5} />
              </button>
            )}

            {/* Fullscreen */}
            {allowFullscreen && (
              <button
                onClick={() => openLightbox(currentIndex)}
                className="rounded-full bg-gradient-to-r from-violet-600 to-purple-600 p-2 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 sm:p-2.5"
                aria-label="Ver em tela cheia"
              >
                <Maximize2 className="size-3.5 sm:size-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Main Swiper */}
        <Swiper
          modules={[Navigation, Pagination, Thumbs, Zoom, EffectFade, Autoplay]}
          onSwiper={setMainSwiper}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          navigation={{
            prevEl: ".custom-prev",
            nextEl: ".custom-next",
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            dynamicMainBullets: 3,
          }}
          zoom={allowZoom}
          loop={validImages.length > 1}
          autoplay={autoplay ? {
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          } : false}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          onSlideChange={handleSlideChange}
          className="aspect-square w-full"
        >
          {validImages.map((image, index) => (
            <SwiperSlide key={image._key} className="relative bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
              <div className="swiper-zoom-container">
                <div className="relative h-full w-full">
                  {/* LQIP Background */}
                  {image.asset.metadata?.lqip && !loadedImages.has(index) && (
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-xl scale-110"
                      style={{ backgroundImage: `url(${image.asset.metadata.lqip})` }}
                    />
                  )}

                  {/* Main Image */}
                  <Image
                    src={imageUrl(image).url()}
                    alt={image.alt || `${productName} - Imagem ${index + 1}`}
                    fill
                    className={[
                      "object-contain p-4 transition-all duration-700 sm:p-8",
                      loadedImages.has(index) ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    ].join(" ")}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                    priority={index === 0}
                    quality={90}
                    onLoad={() => {
                      setLoadedImages((prev) => new Set(prev).add(index));
                      if (index === 0) setIsImageLoading(false);
                    }}
                  />

                  {/* Zoom Overlay */}
                  {allowZoom && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                      <div className="rounded-full bg-black/70 p-3 backdrop-blur-md">
                        <ZoomIn className="size-5 text-white sm:size-6" strokeWidth={2.5} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}

          {/* Custom Navigation Buttons - MELHORADOS PARA MOBILE */}
          {validImages.length > 1 && (
            <>
              <button
                className="custom-prev group/nav absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 p-2.5 shadow-2xl backdrop-blur-sm transition-all hover:scale-110 active:scale-95 disabled:opacity-30 sm:left-4 sm:p-3"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="size-5 text-white transition-transform group-hover/nav:-translate-x-0.5 sm:size-6" strokeWidth={3} />
              </button>
              <button
                className="custom-next group/nav absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 p-2.5 shadow-2xl backdrop-blur-sm transition-all hover:scale-110 active:scale-95 disabled:opacity-30 sm:right-4 sm:p-3"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="size-5 text-white transition-transform group-hover/nav:translate-x-0.5 sm:size-6" strokeWidth={3} />
              </button>
            </>
          )}
        </Swiper>

        {/* Gradient Overlay Bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 to-transparent sm:h-32" />
      </div>

      {/* Thumbnails */}
      {showThumbnails && validImages.length > 1 && (
        <div className="relative">
          <Swiper
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            slidesPerView="auto"
            spaceBetween={8}
            watchSlidesProgress
            className="thumbs-swiper"
            breakpoints={{
              0: { slidesPerView: 4, spaceBetween: 8 },
              640: { slidesPerView: 5, spaceBetween: 10 },
              768: { slidesPerView: 6, spaceBetween: 12 },
              1024: { slidesPerView: 7, spaceBetween: 12 },
            }}
          >
            {validImages.map((image, index) => (
              <SwiperSlide
                key={image._key}
                className={[
                  "group/thumb relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300 sm:rounded-2xl",
                  currentIndex === index
                    ? "border-blue-500 ring-2 ring-blue-500/30 scale-105 shadow-xl shadow-blue-500/30 sm:ring-4"
                    : "border-gray-200 hover:border-blue-300 hover:scale-105 hover:shadow-lg"
                ].join(" ")}
                style={{ width: "auto" }}
              >
                <div className="relative h-full w-full bg-gradient-to-br from-gray-100 to-gray-200">
                  <Image
                    src={imageUrl(image).url()}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover transition-transform group-hover/thumb:scale-110"
                    sizes="120px"
                  />

                  {/* Active Indicator */}
                  {currentIndex === index && (
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 to-transparent" />
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 transition-all group-hover/thumb:bg-black/10" />
                </div>

                {/* Index Badge */}
                <div className={[
                  "absolute bottom-1 right-1 rounded-full px-1.5 py-0.5 text-xs font-black backdrop-blur-sm transition-all sm:px-2",
                  currentIndex === index
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white/90 text-gray-700"
                ].join(" ")}>
                  {index + 1}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Lightbox Modal - MELHORADO PARA MOBILE */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-xl animate-fade-in"
          onMouseMove={handleMouseMove}
          onTouchStart={() => setShowControls(true)}
        >
          {/* Close Button - SEMPRE VISÍVEL NO MOBILE */}
          <button
            onClick={closeLightbox}
            className={[
              "absolute right-3 top-3 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 p-3 text-white shadow-2xl backdrop-blur-md transition-all hover:from-red-700 hover:to-rose-700 hover:rotate-90 hover:scale-110 active:scale-95 sm:right-4 sm:top-4 sm:p-3.5",
              showControls || isMobile ? "opacity-100" : "opacity-0"
            ].join(" ")}
            aria-label="Fechar"
          >
            <X className="size-5 sm:size-6" strokeWidth={3} />
            <span className="hidden text-sm font-bold sm:inline">ESC</span>
          </button>

          {/* Image Counter */}
          <div className={[
            "absolute left-1/2 top-3 z-50 -translate-x-1/2 rounded-full bg-black/80 px-3 py-1.5 backdrop-blur-md transition-all sm:top-4 sm:px-4 sm:py-2",
            showControls || isMobile ? "opacity-100" : "opacity-0"
          ].join(" ")}>
            <span className="text-xs font-black text-white tabular-nums sm:text-sm">
              {lightboxIndex + 1} / {validImages.length}
            </span>
          </div>

          {/* Bottom Controls - SEMPRE VISÍVEL NO MOBILE */}
          <div className={[
            "absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-full bg-black/80 p-2 backdrop-blur-md transition-all sm:bottom-6 sm:gap-3 sm:p-3",
            showControls || isMobile ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          ].join(" ")}>
            {/* Zoom Toggle */}
            {allowZoom && (
              <button
                onClick={() => {
                  setIsZoomed(!isZoomed);
                  if (lightboxSwiperRef.current) {
                    if (!isZoomed) {
                      lightboxSwiperRef.current.zoom.in();
                    } else {
                      lightboxSwiperRef.current.zoom.out();
                    }
                  }
                }}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-2 text-white transition-all hover:scale-110 active:scale-95 sm:px-4"
                aria-label={isZoomed ? "Diminuir zoom" : "Aumentar zoom"}
              >
                {isZoomed ? (
                  <>
                    <ZoomOut className="size-4 sm:size-5" strokeWidth={2.5} />
                    <span className="hidden text-xs font-bold sm:inline">Zoom -</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="size-4 sm:size-5" strokeWidth={2.5} />
                    <span className="hidden text-xs font-bold sm:inline">Zoom +</span>
                  </>
                )}
              </button>
            )}

            {/* Download */}
            {allowDownload && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 to-red-600 px-3 py-2 text-white transition-all hover:scale-110 active:scale-95 sm:px-4"
                aria-label="Baixar imagem"
              >
                <Download className="size-4 sm:size-5" strokeWidth={2.5} />
                <span className="hidden text-xs font-bold sm:inline">Download</span>
              </button>
            )}

            {/* Share */}
            {allowShare && (
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-2 text-white transition-all hover:scale-110 active:scale-95 sm:px-4"
                aria-label="Compartilhar"
              >
                <Share2 className="size-4 sm:size-5" strokeWidth={2.5} />
                <span className="hidden text-xs font-bold sm:inline">Share</span>
              </button>
            )}

            {/* Close (Mobile) */}
            <button
              onClick={closeLightbox}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 px-3 py-2 text-white transition-all hover:scale-110 active:scale-95 sm:hidden"
              aria-label="Fechar"
            >
              <Minimize2 className="size-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Lightbox Swiper */}
          <div className="h-full w-full px-2 sm:max-w-7xl sm:px-4">
            <Swiper
              modules={[Navigation, Zoom]}
              onSwiper={(swiper) => {
                lightboxSwiperRef.current = swiper;
                swiper.slideTo(lightboxIndex, 0);
              }}
              navigation={{
                prevEl: ".lightbox-prev",
                nextEl: ".lightbox-next",
              }}
              zoom={allowZoom}
              loop={validImages.length > 1}
              onSlideChange={(swiper) => setLightboxIndex(swiper.activeIndex)}
              className="h-full w-full"
            >
              {validImages.map((image, index) => (
                <SwiperSlide key={image._key} className="flex items-center justify-center">
                  <div className="swiper-zoom-container">
                    <Image
                      src={imageUrl(image).url()}
                      alt={image.alt || `${productName} - Imagem ${index + 1}`}
                      width={image.asset.metadata?.dimensions?.width || 1200}
                      height={image.asset.metadata?.dimensions?.height || 1200}
                      className="max-h-[85vh] w-auto object-contain sm:max-h-[90vh]"
                      quality={100}
                    />
                  </div>
                </SwiperSlide>
              ))}

              {/* Navigation - MELHORADOS PARA MOBILE */}
              {validImages.length > 1 && (
                <>
                  <button
                    className={[
                      "lightbox-prev group/nav absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 p-3 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 sm:left-4 sm:p-4",
                      showControls || isMobile ? "opacity-100" : "opacity-0"
                    ].join(" ")}
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="size-6 transition-transform group-hover/nav:-translate-x-1 sm:size-8" strokeWidth={3} />
                  </button>
                  <button
                    className={[
                      "lightbox-next group/nav absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 p-3 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 sm:right-4 sm:p-4",
                      showControls || isMobile ? "opacity-100" : "opacity-0"
                    ].join(" ")}
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight className="size-6 transition-transform group-hover/nav:translate-x-1 sm:size-8" strokeWidth={3} />
                  </button>
                </>
              )}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  );
}