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

const BasketPage = () => {
  const groupedItems = useBasketStore((state) => state.getGroupedItems());
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
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center p-4">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Sua cesta</h1>
        <p className="text-lg text-gray-600">Sua cesta está vazia</p>
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

  const total = useBasketStore.getState().getTotalPrice();

  // 💸 Calcula valor da parcela
  const totalWithShipping = total < 100 ? total + 40 : total;
  const parcela = totalWithShipping / installments;

  return (
    <div className="container mx-auto max-w-6xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Sua Cesta</h1>
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="grow">
          {groupedItems?.map((item) => (
            <div
              className="mb-4 flex items-center justify-between rounded border p-4"
              key={item.product._id}
            >
              <div
                className="flex min-w-0 flex-1 cursor-pointer items-center"
                onClick={() =>
                  router.push(`/product/${item.product.slug?.current}`)
                }
              >
                <div className="mr-4 h-20 w-28 shrink-0 sm:size-24">
                  {item.product.image && (
                    <Image
                      src={imageUrl(item.product.image).url()}
                      alt={item.product.name || "Product image"}
                      className="size-full rounded object-cover"
                      width={96}
                      height={96}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold sm:text-xl">
                    {item.product.name}
                  </h2>
                  <p className="text-sm sm:text-base">
                    Preço: R$: {(item.product.price! * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="ml-4 flex shrink-0 items-center">
                <AddToBasketButton product={item.product} />
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 order-first h-fit w-full rounded border bg-white p-6 lg:sticky lg:left-auto lg:top-4 lg:order-last lg:w-80">
          <h3 className="text-xl font-semibold">Resumo do pedido</h3>
          <div className="mt-4 space-y-2">
            <p className="flex justify-between">
              <span>Itens:</span>
              <span>
                {groupedItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            </p>
            {total < 100 && (
              <p className="flex justify-between">
                <span>Frete:</span>
                <span>R$: 40.00</span>
              </p>
            )}
            <p className="flex justify-between border-t pt-2 text-2xl font-bold">
              <span>Total:</span>
              <span>R$: {totalWithShipping.toFixed(2)}</span>
            </p>
          </div>

          <div className="mt-4">
            <label
              htmlFor="installments"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Parcelar em:
            </label>
            <select
              id="installments"
              className="w-full rounded border px-3 py-2"
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}x de R$ {parcela.toFixed(2).replace(".", ",")}
                </option>
              ))}
            </select>
          </div>

          {isSignedIn ? (
            <button
              className="mt-4 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
              disabled={isLoading}
              onClick={handleCheckout}
            >
              {isLoading ? "Processando..." : `Finalizar em ${installments}x`}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="mt-4 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                Entre para finalizar a compra
              </button>
            </SignInButton>
          )}
        </div>

        <div className="h-64 lg:h-0"></div>
      </div>
    </div>
  );
};

export default BasketPage;
