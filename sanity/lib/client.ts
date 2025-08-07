// sanity/lib/client.ts

import { createClient, type ClientConfig } from "@sanity/client";
import { apiVersion, dataset, projectId } from "../env";

// --- Configuração do Cliente Sanity ---
// Esta parte já estava correta no seu arquivo.
const config: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  // Para um site com conteúdo dinâmico e ISR, é melhor começar com useCdn: false
  // para garantir que você sempre busque os dados mais recentes durante o build e revalidação.
  useCdn: false,
  // O 'stega' é para o Visual Editing (antigo Presentation), pode manter se estiver usando.
  stega: {
    enabled: process.env.NODE_ENV !== 'production', // Habilitado apenas em desenvolvimento
    studioUrl: "/studio", // Caminho para o seu Sanity Studio
  },
};

// Cria e exporta a instância principal do cliente para uso em outros lugares se necessário.
export const client = createClient(config);

// --- FUNÇÃO DE FETCH GENÉRICA E CORRIGIDA ---
// Esta é a função que você deve usar em todo o seu projeto para buscar dados do Sanity.
// Ela já vem com a lógica de cache e revalidação do Next.js integrada.
// E o mais importante: ela é flexível e aceita qualquer tipo de retorno.
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
}: {
  query: string;
  params?: any;
  tags?: string[];
}): Promise<T> {
  // O 'client.fetch' é o método padrão para executar queries GROQ.
  return client.fetch<T>(query, params, {
    // Configura o cache do Next.js. 'force-cache' é o padrão, mas o Next.js
    // o quebrará de forma inteligente quando usar 'revalidate' ou tags.
    cache: "force-cache",
    next: {
      // 'tags' permite revalidação sob demanda (on-demand revalidation).
      // Útil para quando você atualiza um produto no Sanity e quer que a
      // mudança apareça no site imediatamente.
      tags,
    },
  });
}