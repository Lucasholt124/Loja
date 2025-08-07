// lib/favoritesStore.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type FavoriteItem = {
  id: string;
  title: string;
  image?: string | null;
  price?: number | null;
  slug?: string | null;
};

type FavoritesState = {
  items: FavoriteItem[];
  add: (item: FavoriteItem) => void;
  remove: (id: string) => void;
  toggle: (item: FavoriteItem) => void;
  clear: () => void;
  isFavorite: (id: string) => boolean;
};

const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) return state;
          return { items: [item, ...state.items] };
        }),
      remove: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      toggle: (item) => {
        const exists = get().items.some((i) => i.id === item.id);
        if (exists) {
          get().remove(item.id);
        } else {
          get().add(item);
        }
      },
      clear: () => set({ items: [] }),
      isFavorite: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useFavoritesStore;