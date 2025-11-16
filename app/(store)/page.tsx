import BlackFridayBanner from "@/components/BlackFridayBanner";
import MainLayout from "@/components/MainLayout";
import ProductsView from "@/components/ProductsView";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function Home() {
  const products = await getAllProducts();
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

  return (
    <MainLayout>
      <BlackFridayBanner />
      <ProductsView products={products} categories={categories} />
    </MainLayout>
  );
}
