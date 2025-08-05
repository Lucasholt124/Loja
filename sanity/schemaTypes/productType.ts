/* eslint-disable import/no-anonymous-default-export */
import { TrolleyIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Products",
  type: "document",
  icon: TrolleyIcon,
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
    }),

    // --- ALTERAÇÃO PRINCIPAL ---
    // O campo de imagem única foi trocado por um array (lista) de imagens.
    defineField({
      name: "images", // 1. Renomeado para 'images' (plural)
      title: "Product Images",
      type: "array", // 2. Tipo alterado para 'array'
      of: [
        {
          type: "image", // 3. A lista será composta de itens do tipo 'image'
          options: {
            hotspot: true, // Opção mantida para cada imagem da lista
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1), // Opcional: exige pelo menos 1 imagem
    }),
    // --- FIM DA ALTERAÇÃO ---

    defineField({
      name: "description",
      title: "Description",
      type: "blockContent",
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: { type: "category" } }],
    }),
    defineField({
      name: "stock",
      title: "Stock",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
  ],
  preview: {
    select: {
      title: "name",
      // --- ALTERAÇÃO NO PREVIEW ---
      // 4. Buscamos a primeira imagem do array 'images' para usar na miniatura.
      media: "images.0",
      price: "price",
    },
    prepare(select) {
      // Pequena melhoria para formatar o preço na pré-visualização.
      const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(select.price || 0);

      return {
        title: select.title,
        subtitle: formattedPrice,
        media: select.media,
      };
    },
  },
});