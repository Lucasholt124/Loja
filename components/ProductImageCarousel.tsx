// ARQUIVO: src/components/ProductImageCarousel.tsx (Completo e Corrigido)

"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { imageUrl } from "@/lib/imageUrl";

// Importe os estilos CSS da Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// --- TIPAGENS CORRIGIDAS ---

// 1. Definimos o tipo para o 'asset' da imagem que vem EXPANDIDO da query (com `asset->`)
// Ele não é mais uma referência, é o objeto de asset completo.
interface SanityImageAsset {
  _id: string;
  _type: "sanity.imageAsset";
  url: string; // O mais importante é que ele tem a URL
  // Pode ter outros campos como 'metadata', 'path', etc., mas 'url' e '_id' são os essenciais.
}

// 2. O tipo para um único objeto de imagem agora espera um 'asset' do tipo SanityImageAsset
interface SanityImage {
  _key: string;
  _type: "image";
  alt?: string;
  asset: SanityImageAsset; // <-- MUDANÇA PRINCIPAL AQUI
}

// 3. A prop do componente continua a mesma: espera um array de 'SanityImage'
interface ProductImageCarouselProps {
  images: SanityImage[];
}

// --- FIM DAS TIPAGENS ---

export default function ProductImageCarousel({ images }: ProductImageCarouselProps) {
  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-200">
        <span className="text-gray-500">Sem imagem</span>
      </div>
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      loop={images.length > 1} // O loop só faz sentido se tiver mais de 1 imagem
      className="h-full w-full"
    >
      {images.map((image) => {
        // Verificação extra para o caso de algum asset dentro do array vir nulo
        if (!image.asset) return null;

        return (
          <SwiperSlide key={image._key}>
            <Image
              // A função imageUrl provavelmente já sabe lidar com o objeto 'image' completo.
              // Se não souber, a URL já está em image.asset.url
              src={imageUrl(image).url()}
              alt={image.alt || "Product image"}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}