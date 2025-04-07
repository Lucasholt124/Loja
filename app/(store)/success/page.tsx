"use client";

import { Button } from "@/components/ui/button";
import useBasketStore from "@/lib/store";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const clearBasket = useBasketStore((state) => state.clearBasket);

  useEffect(() => {
    if (orderNumber) {
      clearBasket();
    }
  }, [clearBasket, orderNumber]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mx-4 w-full max-w-2xl rounded-xl bg-white p-12 shadow-lg">
        <div className="mb-8 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="size-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="mb-6 text-center text-4xl font-bold">
        Obrigado pelo seu pedido!
        </h1>

        <div className="mb-6 border-y border-gray-200 py-6">
          <p className="mb-4 text-center text-lg text-gray-700">
          Seu pedido foi confirmado e será enviado em breve
          </p>
        </div>
        <div className="space-y-2">
          {orderNumber && (
            <p className="flex items-center space-x-5 text-gray-600">
              <span>Número do pedido:</span>
              <span className="font-mono text-sm text-green-600">
                {orderNumber}
              </span>
            </p>
          )}
        </div>
        <div className="space-y-4">
          <p className="text-center text-gray-600">
          Um e-mail de confirmação foi enviado para seu endereço de e-mail registrado.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/orders">Ver detalhes do pedido</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Continuar comprando</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
