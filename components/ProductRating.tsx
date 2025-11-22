"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface ProductRatingProps {
  productSlug: string;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ProductRating({
  productSlug,
  showCount = true,
  size = "md",
}: ProductRatingProps) {
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reviews/average?productSlug=${encodeURIComponent(productSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.count > 0) {
          setRating({ average: data.average, count: data.count });
        }
      })
      .catch((error) => {
        console.error("Error loading ratings:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productSlug]);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`${sizeClasses[size]} animate-pulse rounded-full bg-gray-200`}
            />
          ))}
        </div>
        <div className={`h-4 w-24 animate-pulse rounded bg-gray-200`} />
      </div>
    );
  }

  if (!rating || rating.count === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`${sizeClasses[size]} fill-gray-200 text-gray-200`}
            />
          ))}
        </div>
        {showCount && (
          <span className={`${textSizeClasses[size]} text-gray-400`}>
            Sem avaliações
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < Math.floor(rating.average)
                ? "fill-yellow-400 text-yellow-400"
                : i < rating.average
                ? "fill-yellow-400/50 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
      {showCount && (
        <span className={`${textSizeClasses[size]} font-semibold text-gray-700`}>
          {rating.average.toFixed(1)} ({rating.count} {rating.count === 1 ? "avaliação" : "avaliações"})
        </span>
      )}
    </div>
  );
}