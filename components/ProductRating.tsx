"use client";

import { useEffect, useState, useRef } from "react";
import {
  Star,
  TrendingUp,
  TrendingDown,
  Award,
  Sparkles,
  Users,
  ChevronRight,
} from "lucide-react";

interface ProductRatingProps {
  productSlug: string;
  showCount?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "compact" | "detailed" | "minimal";
  showBadge?: boolean;
  showTrend?: boolean;
  clickable?: boolean;
  onRatingClick?: () => void;
  animated?: boolean;
}

interface RatingData {
  average: number;
  count: number;
  distribution?: number[];
  trend?: "up" | "down" | "stable";
  recentCount?: number;
}

export default function ProductRating({
  productSlug,
  showCount = true,
  size = "md",
  variant = "default",
  showBadge = true,
  showTrend = false,
  clickable = false,
  onRatingClick,
  animated = true,
}: ProductRatingProps) {
  const [rating, setRating] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para animação de entrada
  useEffect(() => {
    if (!animated) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animated]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reviews/average?productSlug=${encodeURIComponent(productSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.count > 0) {
          setRating({
            average: data.average,
            count: data.count,
            distribution: data.distribution || [0, 0, 0, 0, 0],
            trend: data.trend || "stable",
            recentCount: data.recentCount || 0,
          });
        }
      })
      .catch((error) => {
        console.error("Error loading ratings:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productSlug]);

  // Size configurations
  const sizeConfig = {
    sm: {
      star: "size-3.5",
      text: "text-xs",
      badge: "text-[10px] px-2 py-0.5",
      icon: "size-3",
      gap: "gap-1",
    },
    md: {
      star: "size-4",
      text: "text-sm",
      badge: "text-xs px-2.5 py-1",
      icon: "size-3.5",
      gap: "gap-1.5",
    },
    lg: {
      star: "size-5",
      text: "text-base",
      badge: "text-sm px-3 py-1",
      icon: "size-4",
      gap: "gap-2",
    },
    xl: {
      star: "size-6",
      text: "text-lg",
      badge: "text-base px-4 py-1.5",
      icon: "size-5",
      gap: "gap-2.5",
    },
  };

  const config = sizeConfig[size];

  // Determinar qualidade do rating
  const getRatingQuality = (avg: number) => {
    if (avg >= 4.8) return { label: "Excepcional", color: "from-purple-500 to-pink-500", icon: Award };
    if (avg >= 4.5) return { label: "Excelente", color: "from-blue-500 to-violet-500", icon: Sparkles };
    if (avg >= 4.0) return { label: "Muito Bom", color: "from-green-500 to-emerald-500", icon: TrendingUp };
    if (avg >= 3.5) return { label: "Bom", color: "from-yellow-500 to-orange-500", icon: Star };
    return { label: "Regular", color: "from-gray-500 to-gray-600", icon: Star };
  };

  const handleClick = () => {
    if (clickable && onRatingClick) {
      // Haptic feedback
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(30);
      }
      onRatingClick();
    }
  };

  // Loading State
  if (loading) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center ${config.gap} animate-pulse`}
      >
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`${config.star} rounded-full bg-gray-200`}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
        {showCount && variant !== "minimal" && (
          <div className={`h-4 w-24 rounded-full bg-gray-200`} />
        )}
      </div>
    );
  }

  // No Rating State
  if (!rating || rating.count === 0) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center ${config.gap} ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        } transition-all duration-500`}
      >
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`${config.star} fill-gray-200 text-gray-200 transition-all duration-300`}
              strokeWidth={1.5}
            />
          ))}
        </div>
        {showCount && variant !== "minimal" && (
          <span className={`${config.text} font-medium text-gray-400`}>
            Sem avaliações
          </span>
        )}
      </div>
    );
  }

  const quality = getRatingQuality(rating.average);
  const QualityIcon = quality.icon;
  const filledStars = Math.floor(rating.average);
  const hasHalfStar = rating.average % 1 >= 0.3 && rating.average % 1 < 0.8;

  // Variant: Minimal
  if (variant === "minimal") {
    return (
      <div
        ref={containerRef}
        onClick={handleClick}
        className={[
          "inline-flex items-center gap-1",
          clickable ? "cursor-pointer group" : "",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
          "transition-all duration-500",
        ].join(" ")}
      >
        <Star
          className={`${config.star} fill-amber-400 text-amber-400 ${
            clickable ? "group-hover:scale-110" : ""
          } transition-transform`}
          strokeWidth={0}
        />
        <span className={`${config.text} font-bold text-gray-900`}>
          {rating.average.toFixed(1)}
        </span>
      </div>
    );
  }

  // Variant: Compact
  if (variant === "compact") {
    return (
      <div
        ref={containerRef}
        onClick={handleClick}
        className={[
          "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 ring-1 ring-amber-200/50",
          clickable ? "cursor-pointer hover:ring-amber-300 hover:shadow-md active:scale-95" : "",
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
          "transition-all duration-500",
        ].join(" ")}
      >
        <div className="flex items-center gap-0.5">
          <Star className={`${config.star} fill-amber-400 text-amber-400`} strokeWidth={0} />
          <span className={`${config.text} font-black text-gray-900`}>
            {rating.average.toFixed(1)}
          </span>
        </div>
        {showCount && (
          <>
            <div className="h-3 w-px bg-amber-300" />
            <span className={`${config.text} font-semibold text-gray-600`}>
              {rating.count}
            </span>
          </>
        )}
      </div>
    );
  }

  // Variant: Detailed
  if (variant === "detailed") {
    return (
      <div
        ref={containerRef}
        onClick={handleClick}
        className={[
          "relative overflow-hidden rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-amber-50/30 p-4 shadow-lg",
          clickable ? "cursor-pointer hover:border-amber-300 hover:shadow-xl hover:scale-105 active:scale-100" : "",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          "transition-all duration-500",
        ].join(" ")}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 via-transparent to-orange-100/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Content */}
        <div className="relative space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={[
                      config.star,
                      "transition-all duration-300",
                      i < filledStars
                        ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                        : i === filledStars && hasHalfStar
                        ? "fill-amber-400/50 text-amber-400"
                        : "fill-gray-200 text-gray-200",
                      animated && isVisible ? `animate-scale-in` : "",
                    ].join(" ")}
                    style={{ animationDelay: `${i * 100}ms` }}
                    strokeWidth={1}
                  />
                ))}
              </div>
              <span className="text-2xl font-black text-gray-900">
                {rating.average.toFixed(1)}
              </span>
            </div>

            {showBadge && rating.average >= 4.5 && (
              <div
                className={`flex items-center gap-1 rounded-full bg-gradient-to-r ${quality.color} px-2.5 py-1 shadow-lg animate-pulse-subtle`}
              >
                <QualityIcon className="size-3.5 text-white" strokeWidth={2.5} />
                <span className="text-xs font-black text-white">{quality.label}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="size-4 text-blue-600" strokeWidth={2} />
              <span className="font-bold text-gray-900">{rating.count}</span>
              <span className="text-gray-600">
                {rating.count === 1 ? "avaliação" : "avaliações"}
              </span>
            </div>

            {showTrend && rating.trend !== "stable" && (
              <div className="flex items-center gap-1">
                {rating.trend === "up" ? (
                  <TrendingUp className="size-4 text-green-600" strokeWidth={2.5} />
                ) : (
                  <TrendingDown className="size-4 text-red-600" strokeWidth={2.5} />
                )}
                <span className={`text-xs font-bold ${
                  rating.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {rating.recentCount} recentes
                </span>
              </div>
            )}
          </div>

          {/* Distribution Preview */}
          {rating.distribution && (
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].slice(0, 3).map((star) => {
                const count = rating.distribution![star - 1];
                const percentage = rating.count > 0 ? (count / rating.count) * 100 : 0;

                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-3 text-xs font-semibold text-gray-500">{star}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          transitionDelay: `${(5 - star) * 100}ms`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-bold text-gray-600">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {clickable && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
              <span className="text-xs font-semibold text-blue-600">
                Ver todas avaliações
              </span>
              <ChevronRight className="size-4 text-blue-600" strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* Tooltip com distribuição completa */}
        {showTooltip && rating.distribution && (
          <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border-2 border-gray-200 bg-white p-3 shadow-2xl animate-slide-down">
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = rating.distribution![star - 1];
                const percentage = rating.count > 0 ? (count / rating.count) * 100 : 0;

                return (
                  <div key={star} className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <span className="w-3 text-xs font-bold text-gray-700">{star}</span>
                      <Star className="size-3 fill-amber-400 text-amber-400" strokeWidth={0} />
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-bold text-gray-900">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Variant: Default
  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={[
        "group inline-flex items-center",
        config.gap,
        clickable ? "cursor-pointer" : "",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
        "transition-all duration-500",
      ].join(" ")}
    >
      {/* Stars */}
      <div
        className="relative flex items-center gap-0.5"
        onMouseEnter={() => clickable && setShowTooltip(true)}
        onMouseLeave={() => {
          clickable && setShowTooltip(false);
          setHoveredStar(null);
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="relative"
            onMouseEnter={() => clickable && setHoveredStar(i)}
          >
            <Star
              className={[
                config.star,
                "transition-all duration-300",
                i < filledStars
                  ? "fill-amber-400 text-amber-400"
                  : i === filledStars && hasHalfStar
                  ? "fill-amber-400/50 text-amber-400"
                  : "fill-gray-200 text-gray-200",
                clickable && hoveredStar !== null && i <= hoveredStar
                  ? "scale-125 drop-shadow-lg"
                  : "",
                clickable ? "hover:scale-110" : "",
                animated && isVisible ? "animate-scale-in" : "",
              ].join(" ")}
              style={{ animationDelay: `${i * 100}ms` }}
              strokeWidth={1}
            />

            {/* Sparkle effect for high ratings */}
            {i < filledStars && rating.average >= 4.8 && animated && (
              <Sparkles
                className="absolute -right-1 -top-1 size-2.5 animate-ping text-amber-400"
                fill="currentColor"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            )}
          </div>
        ))}

        {/* Tooltip on hover */}
        {showTooltip && clickable && (
          <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white shadow-xl animate-slide-down">
            {rating.average.toFixed(2)} de 5 estrelas
            <div className="absolute left-1/2 top-full size-0 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        )}
      </div>

      {/* Rating Info */}
      {showCount && (
        <div className="flex items-center gap-1.5">
          <span className={`${config.text} font-black text-gray-900 ${
            clickable ? "group-hover:text-blue-600" : ""
          } transition-colors`}>
            {rating.average.toFixed(1)}
          </span>
          <span className={`${config.text} font-medium text-gray-500`}>
            ({rating.count})
          </span>
        </div>
      )}

      {/* Badge */}
      {showBadge && rating.average >= 4.5 && size !== "sm" && (
        <div
          className={`flex items-center gap-1 rounded-full bg-gradient-to-r ${quality.color} ${config.badge} font-black text-white shadow-lg animate-pulse-subtle`}
        >
          <QualityIcon className={config.icon} strokeWidth={2.5} />
          <span className="hidden sm:inline">{quality.label}</span>
        </div>
      )}

      {/* Trend Indicator */}
      {showTrend && rating.trend !== "stable" && (
        <div className={`flex items-center gap-0.5 ${config.badge} rounded-full ${
          rating.trend === "up"
            ? "bg-green-100 text-green-700 ring-1 ring-green-300"
            : "bg-red-100 text-red-700 ring-1 ring-red-300"
        }`}>
          {rating.trend === "up" ? (
            <TrendingUp className={config.icon} strokeWidth={2.5} />
          ) : (
            <TrendingDown className={config.icon} strokeWidth={2.5} />
          )}
          <span className="hidden font-bold sm:inline">
            {rating.recentCount}
          </span>
        </div>
      )}

      {/* Click indicator */}
      {clickable && (
        <ChevronRight
          className={`${config.icon} text-gray-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100`}
          strokeWidth={2.5}
        />
      )}
    </div>
  );
}