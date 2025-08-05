// Conteúdo final e correto para: migrateImages.ts

import {  type SanityClient, type SanityDocument } from 'sanity';
import { apiVersion, dataset, projectId } from './sanity/env'; // Ajuste o caminho se necessário
import { createClient } from 'next-sanity';

// --- Configuração do Cliente ---
// Precisamos criar nosso próprio cliente Sanity para interagir com o banco de dados.
// Usamos o token para ter permissão de escrita.
const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // É crucial usar false para escritas e para ter dados frescos
  token: process.env.SANITY_API_WRITE_TOKEN, // O token será lido do ambiente
});

// --- Tipagens (as mesmas de antes, continuam corretas) ---
interface ProductWithOldImage extends SanityDocument {
  _type: 'product';
  name: string;
  image: {
    _type: 'image';
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
}

// --- Função Principal de Migração ---
async function migrateProductImage() {
  console.log('Iniciando script de migração...');

  // 1. Busca os produtos usando o nosso cliente
  const products = await client.fetch<ProductWithOldImage[]>(
    `*[_type == "product" && defined(image)]`
  );

  if (!products || products.length === 0) {
    console.log("✅ Nenhum produto com o campo 'image' antigo foi encontrado.");
    return;
  }

  console.log(`Encontrados ${products.length} produtos para migrar...`);

  // 2. Cria uma transação para atualizar todos de uma vez
  const transaction = client.transaction();

  products.forEach((product) => {
    console.log(`  -> Migrando produto: ${product.name}`);
    const newImagesArray = [
      {
        _key: Math.random().toString(36).slice(2, 12),
        _type: 'image',
        asset: product.image.asset,
      },
    ];
    transaction.patch(product._id, {
      set: { images: newImagesArray },
      unset: ['image'],
    });
  });

  // 3. Executa a transação
  await transaction.commit();
  console.log('\n✅ Migração concluída com sucesso!');
}

// Roda a função
migrateProductImage().catch((err) => {
  console.error('❌ A migração falhou:', err);
  process.exit(1);
});