import BlackFridayBanner from "@/components/BlackFridayBanner";
import MainLayout from "@/components/MainLayout";
import ProductsView from "@/components/ProductsView";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";

// 1. Definimos a interface para os dados vindos do Sanity
interface SanityCategory {
  _id: string;
  title?: string;
  slug?: {
    current: string;
  };
}

export const dynamic = "force-static";
export const revalidate = 60;

export default async function Home() {
  const products = await getAllProducts();

  // 2. Tipamos explicitamente o retorno da função aqui
  const rawCategories: SanityCategory[] = await getAllCategories();

  // Transforma as categorias para o formato esperado pelo ProductsView
  const categories = rawCategories
    .map((cat) => { // Agora o TS sabe que 'cat' é do tipo SanityCategory
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

  return (
    <MainLayout>
      <BlackFridayBanner />
      <ProductsView products={products} categories={categories} />
    </MainLayout>
  );
}