import ProductsView from "@/components/ProductsView";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getProductsByCategory } from "@/sanity/lib/products/getProductsByCategory";
import React from "react";
import { Grid3x3, Sparkles } from "lucide-react";
import Link from "next/link";

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const products = await getProductsByCategory(slug);
  const rawCategories = await getAllCategories();

  // Transforma as categorias para o formato esperado pelo ProductsView
  const categories = rawCategories
    .map((cat) => {
      if (!cat._id || !cat.title || !cat.slug?.current) {
        return null; // Ignora categorias incompletas
      }
      return {
        _id: cat._id,
        title: cat.title,
        slug: cat.slug.current,
      };
    })
    .filter((cat): cat is { _id: string; title: string; slug: string } => cat !== null);

  // Encontrar categoria atual
  const currentCategory = categories.find((cat) => cat.slug === slug);
  const categoryTitle = currentCategory?.title ||
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-gray-700">
                Início
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-gray-900">{categoryTitle}</li>
          </ol>
        </nav>

        {/* Hero da Categoria */}
        <div className="relative mb-10 overflow-hidden rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white via-blue-50/30 to-violet-50/30 p-8 shadow-xl lg:p-12">
          {/* Efeitos decorativos */}
          <div className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full bg-gradient-to-br from-blue-400/20 to-violet-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 size-96 rounded-full bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 blur-3xl" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-1.5 text-sm font-black uppercase tracking-wide text-white shadow-lg">
              <Sparkles className="size-4" />
              Categoria
            </div>

            <h1 className="mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-4xl font-black tracking-tight text-transparent lg:text-6xl">
              {categoryTitle}
            </h1>

            <p className="max-w-2xl text-lg font-semibold text-gray-600">
              Explore nossa seleção completa de produtos nesta categoria
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border-2 border-blue-200 bg-blue-50 px-4 py-2">
                <Grid3x3 className="size-5 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">
                  {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
                </span>
              </div>

              {products.length > 0 && (
                <Link
                  href="/"
                  className="rounded-full border-2 border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50"
                >
                  ← Todas as categorias
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Grid de Produtos */}
        {products.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
              <Grid3x3 className="size-8 text-gray-400" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Nenhum produto nesta categoria
            </h2>
            <p className="mb-6 text-gray-600">
              Estamos trabalhando para adicionar novos produtos em breve!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
            >
              Ver Todos os Produtos
            </Link>
          </div>
        ) : (
          <ProductsView products={products} categories={categories} selectedCategory={currentCategory?._id} />
        )}
      </div>
    </div>
  );
};

export default CategoryPage;