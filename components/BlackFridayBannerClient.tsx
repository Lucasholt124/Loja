"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Sparkles,
  Copy,
  CheckCircle2,
  Share2,
  X,
  Clock,
  Users,
  Flame,
  ChevronRight,
} from "lucide-react";
// Importamos APENAS o TIPO para não quebrar a compilação
import type { getActiveSaleByCouponCode } from "@/sanity/lib/sales/getActiveSaleByCouponCode";

interface BlackFridayBannerProps {
  sale: Awaited<ReturnType<typeof getActiveSaleByCouponCode>>;
}

const BlackFridayBannerClient = ({ sale }: BlackFridayBannerProps) => {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30,
  });
  const [viewerCount, setViewerCount] = useState(2431);
  const [showBanner, setShowBanner] = useState(true);

  // Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulação de visualizações
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(2000, Math.min(3000, prev + change));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!sale?.couponCode) return;

    try {
      await navigator.clipboard.writeText(sale.couponCode);
      setCopied(true);
      setShowConfetti(true);

      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([50, 30, 50, 30, 50]);
      }

      setTimeout(() => {
        setCopied(false);
        setShowConfetti(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [sale?.couponCode]);

  const handleShare = useCallback(async () => {
    if (!sale) return;

    const shareData = {
      title: sale.title || "Oferta Especial!",
      text: `${sale.description} - Use o cupom ${sale.couponCode} e ganhe ${sale.discountAmount}% OFF!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }, [sale]);

  if (!showBanner || !sale) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative mx-4 mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 p-[2px] shadow-2xl lg:mx-6 lg:rounded-3xl"
    >
      {/* Close Button */}
      <button
        onClick={() => setShowBanner(false)}
        className="absolute right-2 top-2 z-20 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110 active:scale-95 sm:right-3 sm:top-3"
        aria-label="Fechar banner"
      >
        <X className="size-4" strokeWidth={2.5} />
      </button>

      {/* Efeitos de fundo animados */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-20 -top-20 size-64 rounded-full bg-yellow-400/20 blur-3xl sm:size-96"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-20 -left-20 size-64 rounded-full bg-orange-400/20 blur-3xl sm:size-96"
        />
      </div>

      {/* Container interno COMPACTO */}
      <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-black via-gray-900 to-black p-4 sm:p-6 lg:rounded-[22px] lg:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="relative flex flex-col items-start gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Conteúdo Principal */}
          <div className="flex-1 space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1.5 shadow-xl shadow-orange-500/50 sm:gap-2 sm:px-4"
              >
                <Flame className="size-3.5 sm:size-4" fill="currentColor" />
                <span className="text-xs font-black uppercase tracking-wider text-white sm:text-sm">
                  Oferta Relâmpago
                </span>
              </motion.div>

              <div className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1.5 backdrop-blur-sm ring-1 ring-red-500/50">
                <Clock className="size-3.5 text-red-400 animate-pulse" strokeWidth={2.5} />
                <div className="flex items-center gap-0.5 font-mono text-xs font-black text-white tabular-nums sm:text-sm">
                  <span className="rounded bg-red-500/30 px-1.5 py-0.5">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span>:</span>
                  <span className="rounded bg-red-500/30 px-1.5 py-0.5">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span>:</span>
                  <span className="rounded bg-red-500/30 px-1.5 py-0.5">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>

            <h2 className="max-w-3xl bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-3xl font-black leading-tight tracking-tight text-transparent sm:text-4xl lg:text-5xl">
              {sale.title}
            </h2>

            <p className="max-w-2xl text-base font-bold text-gray-300 sm:text-lg lg:text-xl">
              {sale.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <motion.div
                key={viewerCount}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 rounded-full border-2 border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 backdrop-blur-sm"
              >
                <Users className="size-3.5 text-emerald-400 sm:size-4" strokeWidth={2.5} />
                <span className="text-xs font-bold text-emerald-300 tabular-nums sm:text-sm">
                  +{viewerCount.toLocaleString()} comprando
                </span>
              </motion.div>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-full border-2 border-blue-500/30 bg-blue-500/20 px-3 py-1.5 backdrop-blur-sm transition-all hover:bg-blue-500/30 active:scale-95"
              >
                <Share2 className="size-3.5 text-blue-400 sm:size-4" strokeWidth={2.5} />
                <span className="hidden text-xs font-bold text-blue-300 sm:inline sm:text-sm">
                  Compartilhar
                </span>
              </button>
            </div>
          </div>

          {/* Card do Cupom */}
          <div className="w-full lg:w-auto lg:min-w-[340px] xl:min-w-[380px]">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl border-2 border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-4 shadow-2xl backdrop-blur-xl sm:p-5"
            >
              <motion.div
                className="pointer-events-none absolute inset-0"
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 2,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </motion.div>

              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 sm:text-sm">
                    Cupom Exclusivo
                  </span>
                  <Sparkles className="size-4 text-yellow-400 sm:size-5" />
                </div>

                <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-white/30 bg-black/40 p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Código
                      </p>
                      <p className="text-2xl font-black tracking-wider text-white sm:text-3xl">
                        {sale.couponCode}
                      </p>
                    </div>

                    <motion.button
                      onClick={handleCopy}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`flex size-11 items-center justify-center rounded-xl transition-all sm:size-12 ${
                        copied
                          ? "bg-green-500 shadow-lg shadow-green-500/50"
                          : "bg-white/20 hover:bg-white/30"
                      }`}
                      title={copied ? "Copiado!" : "Copiar código"}
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <CheckCircle2 className="size-5 text-white" strokeWidth={2.5} />
                          </motion.div>
                        ) : (
                          <motion.div key="copy" initial={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Copy className="size-5 text-white" strokeWidth={2.5} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 backdrop-blur-sm ring-1 ring-green-500/30 sm:p-4">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-black text-white sm:text-6xl">
                      {sale.discountAmount}%
                    </span>
                    <span className="text-lg font-bold text-gray-300 sm:text-xl">OFF</span>
                  </div>
                  <p className="mt-1.5 text-center text-xs font-semibold text-gray-300 sm:text-sm">
                    Em produtos selecionados
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group/btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 py-3 font-black uppercase tracking-wider text-black shadow-2xl shadow-orange-500/50 transition-all sm:py-3.5"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    <Zap className="size-4 sm:size-5" fill="currentColor" />
                    <span className="text-sm sm:text-base">Aproveitar Agora</span>
                    <ChevronRight className="size-4 transition-transform group-hover/btn:translate-x-1 sm:size-5" />
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-5 top-5 hidden sm:block"
        >
          <div className="size-2 rounded-full bg-yellow-400/60 blur-sm" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="pointer-events-none absolute right-10 top-10 hidden lg:block"
        >
          <div className="size-2 rounded-full bg-orange-400/60 blur-sm" />
        </motion.div>
      </div>

      <AnimatePresence>
        {showConfetti && (
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  top: "50%",
                  left: "50%",
                  scale: 0,
                }}
                animate={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  scale: [0, 1, 0],
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.02,
                  ease: "easeOut",
                }}
              >
                <div
                  className="size-2 rounded-full"
                  style={{
                    backgroundColor: [
                      "#fbbf24",
                      "#f59e0b",
                      "#ef4444",
                      "#ec4899",
                      "#8b5cf6",
                    ][i % 5],
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BlackFridayBannerClient;