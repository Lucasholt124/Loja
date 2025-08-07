"use client";

import { Heart } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
  productSlug: string;
  onToggle?: (isFavorite: boolean) => void; // opcional
}

export default function WishlistButton({ productSlug, onToggle }: WishlistButtonProps) {
  const { userId } = useAuth();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica status
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetch(`/api/wishlist?productSlug=${encodeURIComponent(productSlug)}`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : { isFavorite: false }))
      .then((data) => setIsFavorite(Boolean(data?.isFavorite)))
      .catch(() => console.error("Erro ao verificar favoritos."))
      .finally(() => setIsLoading(false));
  }, [userId, productSlug]);

  const handleToggleFavorite = async () => {
    if (!userId) {
      const redirectUrl =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search + window.location.hash
          : "/";
      openSignIn({ forceRedirectUrl: redirectUrl, signUpForceRedirectUrl: redirectUrl });
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          body: JSON.stringify({ productSlug }),
          headers: { "Content-Type": "application/json" },
        });

        if (res.status === 401) {
          const redirectUrl =
            typeof window !== "undefined"
              ? window.location.pathname + window.location.search + window.location.hash
              : "/";
          openSignIn({ forceRedirectUrl: redirectUrl, signUpForceRedirectUrl: redirectUrl });
          return;
        }

        if (!res.ok) throw new Error();
        const data = await res.json();
        const fav = Boolean(data.isFavorite);
        setIsFavorite(fav);
        onToggle?.(fav); // avisa o pai (ex.: FavoritesView)
        router.refresh(); // mantém server components em sincronia
      } catch {
        console.error("Ocorreu um erro. Tente novamente.");
      }
    });
  };

  if (isLoading) {
    return <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />;
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isPending}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        isFavorite
          ? "border-red-500 bg-red-100 text-red-500 hover:bg-red-200"
          : "border-gray-300 bg-white text-gray-500 hover:bg-gray-100 hover:text-red-500"
      )}
      aria-label="Adicionar aos Favoritos"
      title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart className={cn("h-5 w-5 transition-all", isFavorite && "fill-current")} />
    </button>
  );
}