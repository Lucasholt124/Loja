"use client";


import { useDraftModeEnvironment } from "next-sanity/hooks";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const DisableDraftMode = () => {
  const environment = useDraftModeEnvironment();
  const router = useRouter();

  const handleClick = useCallback(async () => {
    try {
      const res = await fetch("/draft-mode/disable");
      if (res.ok) {
        router.refresh();
      } else {
        console.error("Falha ao desativar o draft mode");
      }
    } catch (err) {
      console.error("Erro ao desativar o draft mode:", err);
    }
  }, [router]);

  if (environment !== "live" && environment !== "unknown") {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 z-50 bg-gray-50 px-4 py-2 ring-4"
    >
      Desativar modo de rascunho
    </button>
  );
};

export default DisableDraftMode;
