"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  ShieldCheck,
  Truck,
  Headphones,
  Heart,
  Sparkles,
  ExternalLink,
  Code,
  Zap,
  ArrowUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import NewsletterSection from "./NewsletterSection";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <footer className="relative mt-16 overflow-hidden border-t bg-gradient-to-b from-white via-gray-50 to-gray-100">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-20 -top-20 size-96 rounded-full bg-gradient-to-br from-blue-400 to-violet-400 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-20 -right-20 size-96 rounded-full bg-gradient-to-br from-fuchsia-400 to-pink-400 blur-3xl"
        />
      </div>

      {/* Newsletter Section */}
      <div className="relative mx-auto max-w-screen-2xl px-4 py-12 lg:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <NewsletterSection />
        </motion.div>
      </div>

      {/* Diferenciais */}
      <div className="relative border-y border-gray-200/80 bg-white/80 backdrop-blur-sm py-8">
        <div className="mx-auto max-w-screen-2xl px-4 lg:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="grid grid-cols-2 gap-6 md:grid-cols-4"
          >
            {[
              {
                icon: Truck,
                title: "Frete Grátis",
                desc: "Em pedidos acima de R$ 200",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: ShieldCheck,
                title: "Compra Segura",
                desc: "100% protegida",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: CreditCard,
                title: "Parcele sem juros",
                desc: "Em até 12x no cartão",
                gradient: "from-violet-500 to-purple-500",
              },
              {
                icon: Headphones,
                title: "Suporte 24/7",
                desc: "Estamos aqui para ajudar",
                gradient: "from-rose-500 to-pink-500",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left"
              >
                <div
                  className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:rotate-6`}
                >
                  <feature.icon className="size-7 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-black text-gray-900">{feature.title}</p>
                  <p className="text-sm font-medium text-gray-600">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Links principais */}
      <div className="relative mx-auto max-w-screen-2xl px-4 py-12 lg:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Sobre */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-900">
              <Sparkles className="size-5 text-blue-600" />
              Sobre Nós
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-gray-600">
              Sua loja online de confiança com os melhores produtos e atendimento excepcional.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Heart className="size-4 text-rose-500" fill="currentColor" />
              <span className="font-semibold">Feito com amor</span>
            </div>
          </motion.div>

          {/* Ajuda */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-4 text-lg font-black text-gray-900">Ajuda & Suporte</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Central de Ajuda", href: "/ajuda" },
                { label: "Rastreamento", href: "/rastreamento" },
                { label: "Trocas e Devoluções", href: "/trocas" },
                { label: "Formas de Pagamento", href: "/pagamento" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-2 text-gray-600 transition-all hover:text-blue-600 hover:translate-x-1"
                  >
                    <span className="size-1.5 rounded-full bg-gray-400 transition-all group-hover:bg-blue-600 group-hover:scale-150" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Institucional */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-4 text-lg font-black text-gray-900">Institucional</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Política de Privacidade", href: "/privacidade" },
                { label: "Termos de Uso", href: "/termos" },
                { label: "LGPD", href: "/lgpd" },
                { label: "Trabalhe Conosco", href: "/trabalhe-conosco" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-2 text-gray-600 transition-all hover:text-blue-600 hover:translate-x-1"
                  >
                    <span className="size-1.5 rounded-full bg-gray-400 transition-all group-hover:bg-blue-600 group-hover:scale-150" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contato */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-4 text-lg font-black text-gray-900">Fale Conosco</h3>
            <ul className="space-y-3.5">
              <li className="group flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 transition-all group-hover:scale-110">
                  <MapPin className="size-5 text-blue-600" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Endereço
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    São Paulo, SP - Brasil
                  </p>
                </div>
              </li>

              <li className="group flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 transition-all group-hover:scale-110">
                  <Phone className="size-5 text-green-600" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Telefone
                  </p>
                  <a
                    href="tel:+5511999999999"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-green-600"
                  >
                    (11) 99999-9999
                  </a>
                </div>
              </li>

              <li className="group flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 transition-all group-hover:scale-110">
                  <Mail className="size-5 text-violet-600" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Email
                  </p>
                  <a
                    href="mailto:contato@loja.com"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-violet-600"
                  >
                    contato@loja.com
                  </a>
                </div>
              </li>
            </ul>

            {/* Redes Sociais */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-bold text-gray-700">Redes Sociais</p>
              <div className="flex items-center gap-2">
                {[
                  { icon: Facebook, href: "https://facebook.com", gradient: "from-blue-600 to-blue-700" },
                  { icon: Instagram, href: "https://instagram.com", gradient: "from-pink-600 via-purple-600 to-orange-600" },
                  { icon: Twitter, href: "https://twitter.com", gradient: "from-sky-500 to-blue-600" },
                  { icon: Youtube, href: "https://youtube.com", gradient: "from-red-600 to-red-700" },
                ].map((social, idx) => (
                  <motion.a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${social.gradient} text-white shadow-lg transition-shadow hover:shadow-xl`}
                  >
                    <social.icon className="size-5" strokeWidth={2} />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Pagamentos e Copyright */}
      <div className="relative border-t border-gray-200/80 bg-gradient-to-r from-gray-50 via-white to-gray-50 py-8">
        <div className="mx-auto max-w-screen-2xl px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Payment Methods */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-bold text-gray-700">Formas de Pagamento</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {[
                  { name: "Visa", gradient: "from-blue-600 to-blue-700" },
                  { name: "Mastercard", gradient: "from-red-600 to-orange-600" },
                  { name: "Pix", gradient: "from-teal-600 to-cyan-600" },
                  { name: "Boleto", gradient: "from-orange-600 to-red-600" },
                  { name: "Elo", gradient: "from-yellow-600 to-yellow-700" },
                  { name: "American Express", gradient: "from-blue-700 to-indigo-700" },
                ].map((method) => (
                  <motion.div
                    key={method.name}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`rounded-xl bg-gradient-to-r ${method.gradient} px-4 py-2 shadow-lg`}
                  >
                    <span className="text-xs font-black uppercase tracking-wide text-white">
                      {method.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {/* Copyright & Developer */}
            <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
              {/* Copyright */}
              <div className="text-center lg:text-left">
                <p className="flex items-center justify-center gap-2 text-sm text-gray-600 lg:justify-start">
                  © {currentYear}{" "}
                  <span className="font-black bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                    Loja
                  </span>
                  • Todos os direitos reservados
                </p>
              </div>

              {/* Developer Credit */}
              <motion.a
                href="https://impulsioneweb.com.br"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 p-[2px] shadow-xl transition-all hover:shadow-2xl hover:shadow-blue-500/50"
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 2,
                  }}
                />

                <div className="relative flex items-center gap-3 rounded-[14px] bg-gradient-to-r from-gray-900 to-black px-6 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg">
                      <Code className="size-4 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Desenvolvido por
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400 bg-clip-text text-sm font-black text-transparent">
                          Impulsioneweb
                        </span>
                        <ExternalLink className="size-3.5 text-blue-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Animated dots */}
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="size-1.5 rounded-full bg-blue-400"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.a>
            </div>

            {/* Security Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 rounded-xl border-2 border-green-200 bg-green-50 px-4 py-2">
                <ShieldCheck className="size-5 text-green-600" strokeWidth={2.5} />
                <span className="text-xs font-bold text-green-700">Site Seguro SSL</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-2">
                <Zap className="size-5 text-blue-600" strokeWidth={2.5} />
                <span className="text-xs font-bold text-blue-700">Entrega Rápida</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-2">
                <Heart className="size-5 text-purple-600" fill="currentColor" strokeWidth={2} />
                <span className="text-xs font-bold text-purple-700">Atendimento Premium</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-2xl shadow-blue-500/40 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-blue-500/60 active:scale-95"
            whileHover={{ y: -5 }}
            aria-label="Voltar ao topo"
          >
            <ArrowUp className="size-6" strokeWidth={3} />

            {/* Pulse Ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-blue-400/30"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
}