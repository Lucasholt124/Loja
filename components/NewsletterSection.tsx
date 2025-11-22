"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence, useInView, Variants } from "framer-motion";
import {
  Mail,
  Check,
  Sparkles,
  TrendingUp,
  Gift,
  Zap,
  Users,
  Shield,
  Bell,
  Star,
  Crown,
  Rocket,
  PartyPopper,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Tag,
  Clock,
} from "lucide-react";

interface NewsletterSectionProps {
  variant?: "default" | "compact" | "sidebar" | "modal";
  showStats?: boolean;
  showTimer?: boolean;
  discount?: number;
  subscriberCount?: number;
  onClose?: () => void;
}

export default function NewsletterSection({
  variant = "default",
  showStats = true,
  showTimer = true,
  discount = 10,
  subscriberCount: initialSubscriberCount = 12847,
  onClose,
}: NewsletterSectionProps) {
  const { user, isSignedIn } = useUser();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [subscriberCount, setSubscriberCount] = useState(initialSubscriberCount);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const userEmail = user?.primaryEmailAddress?.emailAddress || "";

  // Email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(email));
  }, [email]);

  // Countdown timer
  useEffect(() => {
    if (!showTimer) return;

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
  }, [showTimer]);

  // Subscriber count animation
  useEffect(() => {
    if (!showStats) return;

    const interval = setInterval(() => {
      const shouldIncrement = Math.random() > 0.7;
      if (shouldIncrement) {
        setSubscriberCount((prev) => prev + 1);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [showStats]);

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

    // Haptic feedback
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([50, 30, 50]);
    }

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: subscribeEmail,
          userId: user?.id || null,
          userName: user?.fullName || null,
          metadata: {
            source: `website_${variant}`,
            timestamp: new Date().toISOString(),
            discount: discount,
          },
        }),
      });

      if (!response.ok) throw new Error("Erro ao cadastrar");

      setSuccess(true);
      setShowConfetti(true);
      setEmail("");
      setSubscriberCount((prev) => prev + 1);

      // Haptic feedback de sucesso
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }

      // Reset após 8 segundos
      setTimeout(() => {
        setSuccess(false);
        setShowConfetti(false);
      }, 8000);
    } catch (err) {
      setError("Ops! Algo deu errado. Tente novamente.");

      // Haptic feedback de erro
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Gift,
      text: `${discount}% de desconto na primeira compra`,
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Zap,
      text: "Acesso antecipado a promoções relâmpago",
      color: "from-orange-500 to-yellow-500"
    },
    {
      icon: TrendingUp,
      text: "Novidades e lançamentos em primeira mão",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Crown,
      text: "Ofertas VIP exclusivas para inscritos",
      color: "from-purple-500 to-fuchsia-500"
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  const isCompact = variant === "compact" || variant === "sidebar";

  return (
    <motion.section
      ref={sectionRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={[
        "group relative overflow-hidden rounded-3xl shadow-2xl",
        variant === "modal" ? "max-w-2xl mx-auto" : "",
      ].join(" ")}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-600 opacity-100">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 opacity-50 mix-blend-overlay"
        />
      </div>

      {/* Animated Orbs */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-20 -top-20 size-96 rounded-full bg-white/20 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-20 -left-20 size-96 rounded-full bg-white/20 blur-3xl"
        />
      </div>

      {/* Close Button (Modal only) */}
      {variant === "modal" && onClose && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onClose}
          className="absolute right-4 top-4 z-50 flex size-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/30 hover:rotate-90 hover:scale-110 active:scale-95"
          aria-label="Fechar"
        >
          <X className="size-5" strokeWidth={2.5} />
        </motion.button>
      )}

      {/* Main Container */}
      <div className="relative rounded-[22px] bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl">
        <div className={[
          "px-6 py-10",
          isCompact ? "sm:px-8 sm:py-8" : "sm:px-10 sm:py-12 lg:px-16 lg:py-16"
        ].join(" ")}>
          <div className={[
            "mx-auto",
            isCompact ? "max-w-2xl" : "max-w-4xl"
          ].join(" ")}>
            {/* Stats Bar */}
            {showStats && !isCompact && (
              <motion.div
                variants={itemVariants}
                className="mb-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
              >
                {/* Subscriber Count */}
                <div className="flex items-center gap-2 rounded-full border-2 border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                  <Users className="size-5 text-blue-400" strokeWidth={2.5} />
                  <div className="flex items-baseline gap-1">
                    <motion.span
                      key={subscriberCount}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-lg font-black text-white tabular-nums"
                    >
                      {subscriberCount.toLocaleString()}
                    </motion.span>
                    <span className="text-xs font-semibold text-gray-300">inscritos</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 rounded-full border-2 border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                  <Star className="size-5 fill-yellow-400 text-yellow-400" strokeWidth={2} />
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-white">4.9</span>
                    <span className="text-xs font-semibold text-gray-300">avaliação</span>
                  </div>
                </div>

                {/* Active Offers */}
                <div className="flex items-center gap-2 rounded-full border-2 border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                  <Rocket className="size-5 text-orange-400" strokeWidth={2.5} />
                  <span className="text-sm font-bold text-white">12 ofertas ativas</span>
                </div>
              </motion.div>
            )}

            <div className={[
              "flex flex-col gap-8",
              isCompact ? "" : "lg:flex-row lg:items-start lg:justify-between"
            ].join(" ")}>
              {/* Content */}
              <motion.div
                variants={itemVariants}
                className={[
                  "flex-1",
                  isCompact ? "text-center" : "text-center lg:text-left"
                ].join(" ")}
              >
                {/* Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-4 py-2 text-sm font-black uppercase tracking-wide text-white shadow-2xl shadow-orange-500/50"
                >
                  <Sparkles className="size-4 animate-pulse" fill="white" />
                  <span className="relative">
                    Ofertas Exclusivas
                    <motion.div
                      className="absolute inset-0 bg-white/30"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </span>
                  <Sparkles className="size-4 animate-pulse" fill="white" />
                </motion.div>

                {/* Timer (if enabled) */}
                {showTimer && !isCompact && (
                  <motion.div
                    variants={itemVariants}
                    className="mb-4 inline-flex items-center gap-2 rounded-xl border-2 border-red-500/50 bg-red-500/20 px-4 py-2 backdrop-blur-md"
                  >
                    <Clock className="size-5 text-red-400 animate-pulse" strokeWidth={2.5} />
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-xs font-bold uppercase tracking-wide">Termina em:</span>
                      <div className="flex gap-1 font-mono text-base font-black tabular-nums">
                        <span className="rounded bg-white/20 px-2 py-0.5">
                          {String(timeLeft.hours).padStart(2, "0")}
                        </span>
                        <span>:</span>
                        <span className="rounded bg-white/20 px-2 py-0.5">
                          {String(timeLeft.minutes).padStart(2, "0")}
                        </span>
                        <span>:</span>
                        <span className="rounded bg-white/20 px-2 py-0.5">
                          {String(timeLeft.seconds).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Heading */}
                <motion.h2
                  variants={itemVariants}
                  className={[
                    "mb-4 font-black leading-tight tracking-tight",
                    isCompact
                      ? "text-3xl sm:text-4xl"
                      : "text-4xl sm:text-5xl lg:text-6xl"
                  ].join(" ")}
                >
                  <span className="bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                    Fique por dentro
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                    das novidades
                  </span>
                </motion.h2>

                {/* Description */}
                <motion.p
                  variants={itemVariants}
                  className={[
                    "mb-6 font-semibold text-gray-300",
                    isCompact ? "text-base" : "text-lg sm:text-xl"
                  ].join(" ")}
                >
                  Receba ofertas exclusivas, lançamentos e cupons de{" "}
                  <span className="inline-flex items-center gap-1 rounded-lg bg-green-500/20 px-2 py-0.5 font-black text-green-400">
                    <Tag className="size-4" />
                    {discount}% OFF
                  </span>{" "}
                  diretamente no seu email!
                </motion.p>

                {/* Benefits */}
                {!isCompact && (
                  <motion.div variants={itemVariants} className="space-y-3">
                    {benefits.map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ x: 10, scale: 1.02 }}
                        className="group/benefit flex items-center gap-3"
                      >
                        <div className={`flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${benefit.color} shadow-lg transition-all group-hover/benefit:scale-110 group-hover/benefit:shadow-xl`}>
                          <benefit.icon className="size-6 text-white" strokeWidth={2.5} />
                        </div>
                        <p className="text-left font-bold text-white transition-colors group-hover/benefit:text-blue-200">
                          {benefit.text}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Trust Badges */}
                <motion.div
                  variants={itemVariants}
                  className={[
                    "mt-6 flex flex-wrap items-center gap-3",
                    isCompact ? "justify-center" : "justify-center lg:justify-start"
                  ].join(" ")}
                >
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-400">
                    <Shield className="size-4 text-green-400" />
                    <span>100% Seguro</span>
                  </div>
                  <div className="size-1 rounded-full bg-gray-600" />
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-400">
                    <Bell className="size-4 text-blue-400" />
                    <span>Sem Spam</span>
                  </div>
                  <div className="size-1 rounded-full bg-gray-600" />
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-400">
                    <CheckCircle2 className="size-4 text-purple-400" />
                    <span>Cancele Quando Quiser</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Form */}
              <motion.div
                variants={itemVariants}
                className={[
                  "w-full",
                  isCompact ? "" : "lg:w-auto lg:min-w-[400px]"
                ].join(" ")}
              >
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      className="relative overflow-hidden rounded-2xl border-2 border-green-500 bg-gradient-to-br from-green-500/30 to-emerald-500/30 p-8 text-center backdrop-blur-xl"
                    >
                      {/* Confetti Effect */}
                      {showConfetti && (
                        <div className="pointer-events-none absolute inset-0">
                          {Array.from({ length: 20 }).map((_, i) => (
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
                                duration: 2,
                                delay: i * 0.05,
                                ease: "easeOut",
                              }}
                            >
                              <PartyPopper
                                className="size-6 text-yellow-400"
                                fill="currentColor"
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}

                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="relative mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl shadow-green-500/50"
                      >
                        <Check className="size-10 text-white" strokeWidth={3} />

                        {/* Pulse rings */}
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute inset-0 rounded-full border-2 border-green-400"
                            animate={{
                              scale: [1, 2, 2],
                              opacity: [0.8, 0, 0],
                            }}
                            transition={{
                              duration: 2,
                              delay: i * 0.4,
                              repeat: Infinity,
                              ease: "easeOut",
                            }}
                          />
                        ))}
                      </motion.div>

                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-2 text-2xl font-black text-white sm:text-3xl"
                      >
                        🎉 Bem-vindo(a)!
                      </motion.h3>

                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-4 text-green-100"
                      >
                        Cadastro realizado com sucesso!
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-xl bg-white/20 p-4 backdrop-blur-sm"
                      >
                        <div className="mb-2 flex items-center justify-center gap-2">
                          <Gift className="size-6 text-yellow-400" />
                          <span className="text-2xl font-black text-white">
                            {discount}% OFF
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white">
                          Verifique seu email para resgatar!
                        </p>
                      </motion.div>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-4 text-xs text-green-200"
                      >
                        Não esqueça de verificar a caixa de spam 📧
                      </motion.p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <div className="relative overflow-hidden rounded-2xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-xl">
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />

                        <label
                          htmlFor="newsletter-email"
                          className="relative mb-3 flex items-center gap-2 font-bold text-white"
                        >
                          <Mail className="size-5" strokeWidth={2.5} />
                          Seu melhor email
                          <span className="text-red-400">*</span>
                        </label>

                        {isSignedIn ? (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative mb-4 overflow-hidden rounded-xl border-2 border-blue-400 bg-gradient-to-r from-blue-500/30 to-violet-500/30 p-4 backdrop-blur-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-500">
                                <CheckCircle2 className="size-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-200">
                                  Usuário Conectado
                                </p>
                                <p className="text-lg font-bold text-white">{userEmail}</p>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="relative">
                            <input
                              id="newsletter-email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="seu@email.com"
                              required
                              className="w-full rounded-xl border-2 border-white/30 bg-white/20 px-4 py-3 pr-12 font-semibold text-white placeholder-white/60 outline-none backdrop-blur-sm transition-all focus:border-white focus:bg-white/30 focus:ring-4 focus:ring-white/20"
                            />

                            {/* Email validation indicator */}
                            <AnimatePresence>
                              {email && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                  {isValidEmail ? (
                                    <CheckCircle2 className="size-6 text-green-400" />
                                  ) : (
                                    <AlertCircle className="size-6 text-red-400" />
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Error Message */}
                        <AnimatePresence>
                          {error && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/20 p-3 text-sm font-semibold text-red-300"
                            >
                              <AlertCircle className="size-4 shrink-0" />
                              {error}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <motion.button
                          type="submit"
                          disabled={loading || (!email && !isSignedIn)}
                          whileHover={{ scale: loading ? 1 : 1.02 }}
                          whileTap={{ scale: loading ? 1 : 0.98 }}
                          className="group/btn relative mt-4 w-full overflow-hidden rounded-xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 py-4 font-black uppercase tracking-wider text-black shadow-2xl transition-all hover:shadow-orange-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {/* Animated background */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400"
                            animate={{
                              x: ["-100%", "100%"],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />

                          <span className="relative flex items-center justify-center gap-2">
                            {loading ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                  className="size-5 rounded-full border-2 border-black border-t-transparent"
                                />
                                Cadastrando...
                              </>
                            ) : (
                              <>
                                <Sparkles className="size-5" />
                                Quero {discount}% de Desconto
                                <ArrowRight className="size-5 transition-transform group-hover/btn:translate-x-1" />
                              </>
                            )}
                          </span>
                        </motion.button>

                        {/* Trust Line */}
                        <p className="relative mt-3 flex items-center justify-center gap-2 text-center text-xs text-gray-400">
                          <Shield className="size-3" />
                          Seus dados estão seguros • Sem spam • Cancele quando quiser
                        </p>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Decorative Floating Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <div className={`size-${2 + i} rounded-full bg-white/20 blur-sm`} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}