"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Mail, Check, Sparkles, TrendingUp, Gift, Zap } from "lucide-react";

export default function NewsletterSection() {
  const { user, isSignedIn } = useUser();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Preenche automaticamente com email do Clerk
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const subscribeEmail = email || userEmail;

    if (!subscribeEmail) {
      setError("Por favor, insira um email válido");
      setLoading(false);
      return;
    }

    try {
      // Aqui você integraria com seu serviço de email marketing
      // Exemplo: Mailchimp, SendGrid, ConvertKit, etc.
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: subscribeEmail,
          userId: user?.id || null,
          userName: user?.fullName || null,
          metadata: {
            source: "website_footer",
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) throw new Error("Erro ao cadastrar");

      setSuccess(true);
      setEmail("");
      
      // Reset após 5 segundos
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError("Ops! Algo deu errado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-600 p-1 shadow-2xl">
      {/* Efeitos de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-20 size-96 animate-pulse rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-96 animate-pulse rounded-full bg-white/10 blur-3xl delay-1000" />
      </div>

      {/* Container interno */}
      <div className="relative rounded-[22px] bg-gradient-to-br from-gray-900 via-black to-gray-900 px-6 py-10 sm:px-10 sm:py-12 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
            {/* Conteúdo */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-1.5 text-sm font-black uppercase tracking-wide text-white shadow-lg">
                <Sparkles className="size-4" />
                Ofertas Exclusivas
              </div>

              <h2 className="mb-4 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-4xl font-black leading-tight tracking-tight text-transparent sm:text-5xl lg:text-6xl">
                Fique por dentro das novidades
              </h2>

              <p className="mb-6 text-lg font-semibold text-gray-300 sm:text-xl">
                Receba ofertas exclusivas, lançamentos e cupons de desconto diretamente no seu
                email!
              </p>

              {/* Benefícios */}
              <div className="space-y-3">
                {[
                  { icon: Gift, text: "Cupons de desconto exclusivos" },
                  { icon: Zap, text: "Acesso antecipado a promoções" },
                  { icon: TrendingUp, text: "Novidades e lançamentos" },
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500">
                      <benefit.icon className="size-5 text-white" />
                    </div>
                    <p className="text-left font-bold text-white">{benefit.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="w-full lg:w-auto lg:min-w-[400px]">
              {success ? (
                <div className="rounded-2xl border-2 border-green-500 bg-green-500/20 p-8 text-center backdrop-blur-xl">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-500">
                    <Check className="size-8 text-white" strokeWidth={3} />
                  </div>
                  <h3 className="mb-2 text-2xl font-black text-white">Cadastro realizado!</h3>
                  <p className="text-green-100">
                    Verifique sua caixa de entrada para confirmar.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="rounded-2xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-xl">
                    <label htmlFor="newsletter-email" className="mb-3 block font-bold text-white">
                      <Mail className="mb-1 inline size-5" /> Seu melhor email
                    </label>

                    {isSignedIn ? (
                      <div className="mb-4 rounded-xl border-2 border-blue-400 bg-blue-500/20 p-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-200">
                          Usuário Conectado
                        </p>
                        <p className="text-lg font-bold text-white">{userEmail}</p>
                      </div>
                    ) : (
                      <input
                        id="newsletter-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                        className="w-full rounded-xl border-2 border-white/30 bg-white/20 px-4 py-3 font-semibold text-white placeholder-white/60 outline-none backdrop-blur-sm transition-all focus:border-white focus:bg-white/30"
                      />
                    )}

                    {error && (
                      <p className="mt-2 text-sm font-semibold text-red-300">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-4 group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 py-4 font-black uppercase tracking-wider text-black shadow-2xl transition-all hover:shadow-orange-500/50 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <div className="size-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                            Cadastrando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-5" />
                            Quero Receber Ofertas
                            <Sparkles className="size-5" />
                          </>
                        )}
                      </span>
                    </button>

                    <p className="mt-3 text-center text-xs text-gray-400">
                      Sem spam. Cancele quando quiser. 🔒
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="pointer-events-none absolute bottom-10 left-10 animate-bounce opacity-60 delay-300">
          <div className="size-4 rounded-full bg-yellow-400 blur-sm" />
        </div>
        <div className="pointer-events-none absolute right-20 top-20 animate-bounce opacity-60 delay-700">
          <div className="size-3 rounded-full bg-orange-400 blur-sm" />
        </div>
      </div>
    </section>
  );
}