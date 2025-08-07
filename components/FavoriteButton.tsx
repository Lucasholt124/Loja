// components/FavoriteButton.tsx
"use client";

import React from "react";
import { HeartIcon } from "@sanity/icons";
import useFavoritesStore, { FavoriteItem } from "@/lib/favoritesStore";

type Props = {
  product: FavoriteItem;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const FavoriteButton: React.FC<Props> = ({ product, size = "md", className }) => {
  const toggle = useFavoritesStore((s) => s.toggle);
  const isFav = useFavoritesStore((s) => s.isFavorite(product.id));

  const sizeClass =
    size === "sm" ? "size-4" : size === "lg" ? "size-6" : "size-5";

  return (
    <button
      type="button"
      aria-pressed={isFav}
      aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      className={`rounded-full p-1 transition-colors ${
        isFav ? "text-red-500" : "text-gray-400 hover:text-red-500"
      } ${className ?? ""}`}
    >
      <HeartIcon className={sizeClass} />
    </button>
  );
};

export default FavoriteButton;