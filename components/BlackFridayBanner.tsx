import { getActiveSaleByCouponCode } from "@/sanity/lib/sales/getActiveSaleByCouponCode";
import React from "react";
import { Zap, Sparkles, TrendingUp, Copy } from "lucide-react";

const BlackFridayBanner = async () => {
  const sale = await getActiveSaleByCouponCode("BFRIDAY");

  if (!sale?.isActive) {
    return null;
  }

  return (
    <div className="relative mx-4 mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 p-1 shadow-2xl lg:mx-6">
      {/* Efeitos de fundo animados */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-20 size-96 animate-pulse rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-96 animate-pulse rounded-full bg-orange-400/20 blur-3xl delay-1000" />
        <div className="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-white/10 blur-2xl delay-500" />
      </div>

      {/* Container interno */}
      <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-black via-gray-900 to-black p-8 lg:p-12">
        {/* Pattern decorativo */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Conteúdo Principal */}
          <div className="flex-1 space-y-6">
            {/* Badge com animação */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-5 py-2 shadow-2xl shadow-orange-500/50 animate-bounce">
              <Zap className="size-5 text-white" fill="currentColor" />
              <span className="text-sm font-black uppercase tracking-wider text-white">
                Oferta Relâmpago
              </span>
              <Sparkles className="size-5 text-white" />
            </div>

            {/* Título Principal */}
            <h2 className="max-w-3xl bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-5xl font-black leading-tight tracking-tight text-transparent lg:text-7xl">
              {sale.title}
            </h2>

            {/* Descrição */}
            <p className="max-w-2xl text-xl font-bold text-gray-300 lg:text-3xl">
              {sale.description}
            </p>

            {/* Stats mockados */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 rounded-full border-2 border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <TrendingUp className="size-5 text-green-400" />
                <span className="text-sm font-bold text-white">
                  +2.4k pessoas comprando agora
                </span>
              </div>
              <div className="rounded-full border-2 border-red-400/30 bg-red-500/20 px-4 py-2 backdrop-blur-sm">
                <span className="text-sm font-bold text-red-300">
                  ⏰ Termina em 23h 45min
                </span>
              </div>
            </div>
          </div>

          {/* Card do Cupom */}
          <div className="w-full lg:w-auto lg:min-w-[380px]">
            <div className="group relative overflow-hidden rounded-2xl border-2 border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-white/40">
              {/* Efeito shimmer */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute -inset-[100%] animate-[spin_3s_linear_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>

              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-wider text-gray-400">
                    Seu Cupom Exclusivo
                  </span>
                  <Sparkles className="size-5 text-yellow-400" />
                </div>

                {/* Código do Cupom */}
                <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-white/30 bg-black/40 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Código
                      </p>
                      <p className="text-3xl font-black tracking-wider text-white">
                        {sale.couponCode}
                      </p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(sale.couponCode || "")}
                      className="flex size-12 items-center justify-center rounded-xl bg-white/20 transition-all duration-300 hover:bg-white/30 hover:scale-110 active:scale-95"
                      title="Copiar código"
                    >
                      <Copy className="size-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Desconto */}
                <div className="rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 backdrop-blur-sm">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-black text-white">
                      {sale.discountAmount}%
                    </span>
                    <span className="text-xl font-bold text-gray-300">OFF</span>
                  </div>
                  <p className="mt-2 text-center text-sm font-semibold text-gray-300">
                    Em produtos selecionados
                  </p>
                </div>

                {/* CTA */}
                <button className="group/btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 py-4 font-black uppercase tracking-wider text-black shadow-2xl shadow-orange-500/50 transition-all duration-300 hover:shadow-orange-500/80 hover:-translate-y-1 active:scale-95">
                  <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                  <span className="relative flex items-center justify-center gap-2">
                    <Zap className="size-5" fill="currentColor" />
                    Aproveitar Agora
                    <Sparkles className="size-5" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="pointer-events-none absolute left-10 top-10 animate-bounce delay-300">
          <div className="size-3 rounded-full bg-yellow-400/60 blur-sm" />
        </div>
        <div className="pointer-events-none absolute right-20 top-20 animate-bounce delay-700">
          <div className="size-2 rounded-full bg-orange-400/60 blur-sm" />
        </div>
        <div className="pointer-events-none absolute bottom-20 left-1/3 animate-bounce delay-500">
          <div className="size-4 rounded-full bg-red-400/60 blur-sm" />
        </div>
      </div>
    </div>
  );
};

export default BlackFridayBanner;