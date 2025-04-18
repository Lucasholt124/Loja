import { formatCurrency } from "@/lib/formatCurrency";
import { imageUrl } from "@/lib/imageUrl";
import { getMyOrders } from "@/sanity/lib/orders/getMyOrders";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

type Product = {
  _key?: string;
  quantity: number;
  product?: {
    name?: string;
    image?: any;
    price?: number;
  };
};

type Order = {
  orderNumber?: string;
  orderDate?: string;
  status?: string; // corrigido aqui
  totalPrice?: number;
  amountDiscount?: number;
  currency?: string; // também opcional
  products?: Product[];
};

const OrdersPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  const orders = await getMyOrders(userId);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl rounded-xl bg-white p-4 shadow-lg sm:p-8">
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-gray-900">
          Meus pedidos
        </h1>

        {orders.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>Você ainda não fez nenhum pedido.</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {orders.map((order: Order, index: number) => (
              <div
                key={order.orderNumber ?? `order-${index}`}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                <div className="border-b border-gray-200 p-4 sm:p-6">
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="mb-1 text-sm font-bold text-gray-600">
                        Número do pedido
                      </p>
                      <p className="break-all font-mono text-sm text-green-600">
                        {order.orderNumber}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="mb-1 text-sm text-gray-600">Data do pedido</p>
                      <p className="font-medium">
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="mr-2 text-sm">Status:</span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-4 sm:text-right">
                    <p className="mb-1 text-sm text-gray-600">Montante total</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(order.totalPrice ?? 0, order.currency)}
                    </p>
                  </div>

                  {order.amountDiscount ? (
                    <div className="mt-4 rounded-lg bg-red-50 p-3 sm:p-4">
                      <p className="mb-1 text-sm font-medium text-red-600 sm:text-base">
                        Desconto aplicado:{" "}
                        {formatCurrency(order.amountDiscount, order.currency)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Subtotal original:{" "}
                        {formatCurrency(
                          (order.totalPrice ?? 0) + order.amountDiscount,
                          order.currency
                        )}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="px-4 py-3 sm:px-6 sm:py-4">
                  <p className="mb-3 text-sm font-semibold text-gray-600 sm:mb-4">
                    Itens do pedido
                  </p>
                  <div className="space-y-3 sm:space-y-4">
                    {order.products?.map((product: Product, index: number) => (
                      <div
                        key={product._key || index}
                        className="flex flex-col gap-3 border-b py-2 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          {product.product?.image && (
                            <div className="relative size-14 shrink-0 overflow-hidden rounded-md sm:size-16">
                              <Image
                                src={imageUrl(product.product.image).url()}
                                alt={product.product.name ?? ""}
                                className="object-cover"
                                fill
                              />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium sm:text-base">
                              {product.product?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantidade: {product.quantity ?? "N/A"}
                            </p>
                          </div>
                        </div>

                        <p className="text-right font-medium">
                          {product.product?.price && product.quantity
                            ? formatCurrency(
                                product.product.price * product.quantity,
                                order.currency
                              )
                            : "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
