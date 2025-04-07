import ProductGrid from "@/components/ProductGrid";
import { searchProductByName } from "@/sanity/lib/products/searchProductsByName";
import React from "react";

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    query: string;
  }>;
}) => {
  const { query } = await searchParams;
  const products = await searchProductByName(query);

  if (!products.length) {
    return (
      <div className="flex min-h-screen flex-col items-center bg-gray-100 p-4">
        <div className="w-full max-w-4xl rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-center text-3xl font-bold">
          Nenhum produto encontrado para {query}
          </h1>
          <p className="text-center text-gray-600">
          Tente pesquisar com palavras-chave diferentes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold">
        Resultados da pesquisa para {query}
        </h1>
        <ProductGrid products={products} />
      </div>
    </div>
  );
};

export default SearchPage;
