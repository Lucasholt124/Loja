import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "./Footer";


interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header Fixo */}
      <Header />

      {/* Espaçador para compensar header fixo */}
      <div className="h-[140px] sm:h-[144px] lg:h-[88px]" />

      {/* Conteúdo Principal */}
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-6 lg:px-6 lg:py-8">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}