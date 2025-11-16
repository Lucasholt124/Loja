"use client";

import {
  createCheckoutSession,
  Metadata,
} from "@/actions/createCheckoutSession";
import AddToBasketButton from "@/components/AddToBasket";
import Loader from "@/components/Loader";
import { imageUrl } from "@/lib/imageUrl";
import useBasketStore from "@/lib/store";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ShoppingBag, Truck, Shield, CreditCard, Trash2, ArrowRight } from "lucide-react";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const BasketPage = () => {
  const groupedItems = useBasketStore((state) => state.getGroupedItems());
  const clearBasket = useBasketStore((state) => state.clearBasket);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [installments, setInstallments] = useState(1);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <Loader />;
  }

  if (groupedItems.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100">
            <ShoppingBag className="size-12 text-blue-600" />
          </div>
          <h1 className="mb-3 text-3xl font-black text-gray-900">Carrinho Vazio</h1>
          <p className="mb-8 text-gray-600">
            Adicione produtos incríveis ao seu carrinho para começar!
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 font-bold text-white shadow-2xl shadow-blue-500/40 transition-all hover:shadow-blue-500/60 hover:-translate-y-1"
          >
            <ShoppingBag className="size-5" />
            Explorar Produtos
          </button>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!isSignedIn) return;
    setIsLoading(true);

    try {
      const metadata: Metadata = {
        orderNumber: crypto.randomUUID(),
        customerName: user?.fullName ?? "Unknown",
        customerEmail: user?.emailAddresses[0].emailAddress ?? "Unknown",
        clerkUserId: user!.id,
      };

      const checkoutUrl = await createCheckoutSession(
        groupedItems,
        metadata,
        installments
      );

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCart = () => {
    if (confirm("Deseja realmente limpar todo o carrinho?")) {
      clearBasket();
    }
  };

  const subtotal = useBasketStore.getState().getTotalPrice();
  const shipping = subtotal < 100 ? 40 : 0;
  const totalWithShipping = subtotal + shipping;
  const installmentValue = totalWithShipping / installments;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-black text-gray-900 lg:text-4xl">
              Seu Carrinho
            </h1>
            <p className="text-gray-600">
              {groupedItems.reduce((acc, item) => acc + item.quantity, 0)} itens no total
            </p>
          </div>
          <button
            onClick={handleClearCart}
            className="flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2 font-bold text-red-600 transition-all hover:border-red-300 hover:bg-red-100"
          >
            <Trash2 className="size-5" />
            Limpar Carrinho
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Lista de Produtos */}
          <div className="space-y-4 lg:col-span-2">
            {groupedItems.map((item) => {
              const thumbnailImage = item.product.images?.[0];
              const productStock = item.product.stock ?? 0;
              const isLowStock = productStock <= 5 && productStock > 0;

              return (
                <div
                  key={item.product._id}
                  className="group overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-500 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {/* Imagem */}
                    <div
                      className="relative size-24 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-gray-100 transition-transform hover:scale-105 sm:size-28"
                      onClick={() =>
                        router.push(`/product/${item.product.slug?.current}`)
                      }
                    >
                      {thumbnailImage ? (
                        <Image
                          src={imageUrl(thumbnailImage).url()}
                          alt={item.product.name || "Produto"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="size-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3
                          className="mb-1 cursor-pointer text-lg font-bold text-gray-900 transition-colors hover:text-blue-600"
                          onClick={() =>
                            router.push(`/product/${item.product.slug?.current}`)
                          }
                        >
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatBRL(item.product.price || 0)} × {item.quantity}
                        </p>
                        {isLowStock && (
                          <p className="mt-1 text-xs font-semibold text-orange-600">
                            ⚠️ Apenas {productStock} em estoque
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xl font-black text-gray-900">
                          {formatBRL((item.product.price || 0) * item.quantity)}
                        </p>
                        <AddToBasketButton product={item.product} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumo do Pedido - Sticky */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-6">
                <h3 className="text-xl font-black text-white">Resumo do Pedido</h3>
              </div>

              <div className="p-6">
                {/* Valores */}
                <div className="space-y-3 border-b pb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatBRL(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Frete</span>
                    <span className="font-semibold">
                      {shipping === 0 ? (
                        <span className="text-green-600">GRÁTIS</span>
                      ) : (
                        formatBRL(shipping)
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between border-b py-4 text-2xl font-black text-gray-900">
                  <span>Total</span>
                  <span>{formatBRL(totalWithShipping)}</span>
                </div>

                {/* Parcelamento */}
                <div className="py-4">
                  <label
                    htmlFor="installments"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Parcelar em:
                  </label>
                  <select
                    id="installments"
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 font-bold text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}x de {formatBRL(installmentValue)}
                        {num === 1 ? " à vista" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botão Finalizar */}
                {isSignedIn ? (
                  <button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 font-black text-white shadow-2xl shadow-green-500/40 transition-all hover:shadow-green-500/60 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="relative flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Processando...
                        </>
                      ) : (
                        <>
                          Finalizar Pedido
                          <ArrowRight className="size-5" />
                        </>
                      )}
                    </span>
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-4 font-black text-white shadow-2xl shadow-blue-500/40 transition-all hover:shadow-blue-500/60 hover:-translate-y-1">
                      Entre para Finalizar
                    </button>
                  </SignInButton>
                )}

                {/* Badges de Segurança */}
                <div className="mt-6 space-y-3">
                  {[
                    { icon: Shield, text: "Compra 100% Segura" },
                    { icon: Truck, text: "Frete Grátis acima de R$ 100" },
                    { icon: CreditCard, text: "Parcele em até 12x sem juros" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-50">
                        <item.icon className="size-4 text-green-600" />
                      </div>
                      <span className="font-semibold">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasketPage;