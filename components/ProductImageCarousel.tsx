// src/components/ProductImageCarousel.tsx

"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { imageUrl } from "@/lib/imageUrl"; // Importe sua função helper

// Importe os estilos CSS da Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// --- TIPAGENS ADICIONADAS ---

// 1. Definimos o tipo para um único objeto de imagem do Sanity
// Isso descreve exatamente como o objeto de imagem se parece.
interface SanityImage {
  _key: string;
  _type: "image";
  alt?: string; // 'alt' é opcional
  asset: {
    _ref: string;
    _type: "reference";
  };
}

// 2. Definimos o tipo para as props que o nosso componente recebe
interface ProductImageCarouselProps {
  images: SanityImage[]; // 'images' é um array (lista) de 'SanityImage'
}

// --- FIM DAS TIPAGENS ---


// 3. Aplicamos o tipo 'ProductImageCarouselProps' às props do componente
export default function ProductImageCarousel({ images }: ProductImageCarouselProps) {
  // Agora o TypeScript sabe que 'images' é um array de SanityImage!

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
      loop={true}
      className="h-full w-full"
    >
      {/*
        4. O TypeScript agora também sabe que 'image' dentro do map
           é do tipo 'SanityImage', então não há mais erros.
      */}
      {images.map((image) => (
        <SwiperSlide key={image._key}>
          <Image
            src={imageUrl(image).url()} // A função imageUrl espera um objeto do tipo SanityImage
            alt={image.alt || "Product image"}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Opcional, mas recomendado para otimização
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}