// lib/hooks/useWishlistCount.ts
"use client";

import { useCallback, useEffect, useState } from "react";

export function useWishlistCount(enabled: boolean) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCount = useCallback(async () => {
    if (!enabled) {
      setCount(0);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/wishlist?list=1", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCount(Array.isArray(data?.slugs) ? data.slugs.length : 0);
      } else {
        setCount(0);
      }
    } catch {
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    const onChange = () => fetchCount();
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchCount();
    };

    window.addEventListener("wishlist:changed", onChange);
    window.addEventListener("focus", onChange);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("wishlist:changed", onChange);
      window.removeEventListener("focus", onChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchCount]);

  return { count, loading, refresh: fetchCount };
}