"use client";

import { Button } from "@/components/ui/button";
import useBasketStore from "@/lib/store";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, Package, Home, Sparkles, Mail, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const clearBasket = useBasketStore((state) => state.clearBasket);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (orderNumber) {
      clearBasket();
      
      // Confetti animação
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [clearBasket, orderNumber]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-violet-50/30 px-4 py-12">
      <div className="relative w-full max-w-3xl">
        {/* Efeitos decorativos */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-96 rounded-full bg-gradient-to-br from-blue-400/20 to-violet-400/20 blur-3xl" />

        {/* Card Principal */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-white shadow-2xl">
          {/* Header com Ícone de Sucesso */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="mx-auto mb-4 flex size-24 items-center justify-center rounded-full bg-white shadow-2xl">
              <CheckCircle className="size-16 text-green-500" />
            </div>
            <h1 className="mb-2 text-4xl font-black text-white lg:text-5xl">
              Pedido Confirmado!
            </h1>
            <p className="text-lg font-semibold text-green-50">
              Obrigado pela sua compra 🎉
            </p>
          </div>

          {/* Conteúdo */}
          <div className="p-8 lg:p-12">
            {/* Mensagem Principal */}
            <div className="mb-8 text-center">
              <p className="mb-6 text-lg text-gray-700">
                Seu pedido foi confirmado com sucesso e será processado em breve.
                Você receberá atualizações por email sobre o andamento do envio.
              </p>

              {orderNumber && (
                <div className="mx-auto max-w-md rounded-2xl border-2 border-green-200 bg-green-50 p-6">
                  <p className="mb-2 text-sm font-bold uppercase tracking-wide text-green-700">
                    Número do Pedido
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Package className="size-5 text-green-600" />
                    <p className="font-mono text-xl font-black text-green-700">
                      #{orderNumber.slice(0, 8)}
                    </p>
                  </div>
                  <p className="mt-3 text-xs text-green-600">
                    Guarde este número para rastrear seu pedido
                  </p>
                </div>
              )}
            </div>

            {/* Features/Próximos Passos */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Mail,
                  title: "Email de Confirmação",
                  desc: "Enviado para sua caixa de entrada",
                  color: "blue",
                },
                {
                  icon: Package,
                  title: "Preparando Envio",
                  desc: "Seu pedido será separado em breve",
                  color: "violet",
                },
                {
                  icon: Sparkles,
                  title: "Rastreamento",
                  desc: "Código disponível em até 24h",
                  color: "pink",
                },
                {
                  icon: CheckCircle,
                  title: "Suporte 24/7",
                  desc: "Estamos aqui para ajudar",
                  color: "green",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 rounded-xl border-2 border-${item.color}-100 bg-${item.color}-50 p-4`}
                >
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-${item.color}-500`}>
                    <item.icon className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="mb-1 font-bold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-6 text-lg font-black shadow-2xl shadow-green-500/40 transition-all hover:shadow-green-500/60 hover:-translate-y-1"
              >
                <Link href="/orders">
                  <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="relative flex items-center justify-center gap-2">
                    <Package className="size-5" />
                    Ver Detalhes do Pedido
                    <ArrowRight className="size-5" />
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="flex-1 rounded-xl border-2 border-gray-200 py-6 text-lg font-black transition-all hover:border-blue-500 hover:bg-blue-50 hover:-translate-y-1"
              >
                <Link href="/">
                  <Home className="mr-2 size-5" />
                  Continuar Comprando
                </Link>
              </Button>
            </div>

            {/* Mensagem de Agradecimento */}
            <div className="mt-8 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm font-semibold text-gray-600">
                💝 Obrigado por confiar em nós! Sua satisfação é nossa prioridade.
              </p>
            </div>
          </div>
        </div>

        {/* Informação Extra */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Tem dúvidas? Entre em contato com nosso{" "}
          <a href="/support" className="font-bold text-blue-600 hover:underline">
            suporte ao cliente
          </a>
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;