import { formatCurrency } from "@/lib/formatCurrency";

import { getMyOrders } from "@/sanity/lib/orders/getMyOrders";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { Package, Calendar, CreditCard, CheckCircle, Clock, XCircle, Truck } from "lucide-react";

// Configuração de status (mantida igual)
const getStatusConfig = (status?: string) => {
  switch (status) {
    case "paid":
      return { label: "Pago", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50", icon: CheckCircle };
    case "pending":
      return { label: "Pendente", color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-50", icon: Clock };
    case "shipped":
      return { label: "Enviado", color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-50", icon: Truck };
    case "cancelled":
      return { label: "Cancelado", color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50", icon: XCircle };
    default:
      return { label: status || "Processando", color: "bg-gray-500", textColor: "text-gray-700", bgColor: "bg-gray-50", icon: Package };
  }
};

const OrdersPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  const orders = await getMyOrders(userId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-1.5 text-sm font-black uppercase tracking-wide text-white shadow-lg">
            <Package className="size-4" />
            Meus Pedidos
          </div>
          <h1 className="mb-2 text-3xl font-black tracking-tight text-gray-900 lg:text-5xl">
            Histórico de Compras
          </h1>
          <p className="text-lg text-gray-600">
            Acompanhe o status dos seus pedidos recentes.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 text-center shadow-xl lg:p-16">
            <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100">
              <Package className="size-12 text-blue-600" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              Nenhum pedido encontrado
            </h2>
            <p className="mb-6 text-gray-600">
              Parece que você ainda não fez nenhuma compra conosco.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 font-bold text-white shadow-2xl shadow-blue-500/40 transition-all hover:shadow-blue-500/60 hover:-translate-y-1"
            >
              Começar a Comprar
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={order.orderNumber ?? `order-${index}`}
                  className="group overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg transition-all hover:border-blue-500 hover:shadow-2xl"
                >
                  {/* Header do Pedido */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Package className="size-4 text-gray-500 sm:size-5" />
                          <span className="text-xs font-bold uppercase tracking-wide text-gray-600 sm:text-sm">
                            Pedido
                          </span>
                        </div>
                        <p className="break-all font-mono text-base font-bold text-blue-600 sm:text-lg">
                          #{order.orderNumber?.slice(0, 8) ?? "N/A"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="size-4 sm:size-5" />
                          <span className="text-xs font-semibold sm:text-sm">
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "Data não disp."}
                          </span>
                        </div>

                        <div
                          className={`flex w-fit items-center gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 ${statusConfig.bgColor}`}
                        >
                          <StatusIcon className={`size-4 sm:size-5 ${statusConfig.textColor}`} />
                          <span className={`text-xs font-bold sm:text-sm ${statusConfig.textColor}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Produtos */}
                  <div className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {order.products?.map((item, idx) => {
                        // CORREÇÃO PRINCIPAL: Acessa images[0] em vez de image
                        const productData = item.product;
                        const productImage = productData?.images?.[0];

                        return (
                          <div
                            key={item._key || idx}
                            className="flex flex-col gap-4 rounded-xl border-2 border-gray-100 bg-gray-50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/50 sm:flex-row sm:items-center"
                          >
                            {/* Imagem */}
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white border border-gray-200 mx-auto sm:mx-0">
                              {productImage && productImage.asset?.url ? (
                                <Image
                                  // Usa a URL direta se disponível (vindo da query expandida) ou o helper imageUrl
                                  src={productImage.asset.url}
                                  alt={productData?.name ?? "Produto"}
                                  className="object-cover"
                                  fill
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300">
                                  <Package className="size-8" />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex flex-1 flex-col justify-between gap-2 text-center sm:flex-row sm:items-center sm:text-left">
                              <div>
                                <p className="text-base font-bold text-gray-900 sm:text-lg">
                                  {productData?.name || "Produto Indisponível"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Qtd: <span className="font-semibold">{item.quantity ?? 0}</span>
                                </p>
                              </div>

                              <p className="text-lg font-black text-gray-900">
                                {productData?.price
                                  ? formatCurrency(
                                      productData.price * item.quantity,
                                      order.currency
                                    )
                                  : "Grátis"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer - Total */}
                  <div className="border-t-2 bg-gradient-to-r from-blue-50 to-violet-50 p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 sm:justify-start">
                        <CreditCard className="size-4" />
                        <span>Pagamento via Stripe</span>
                      </div>

                      <div className="text-center sm:text-right">
                        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-600">
                          Valor Total
                        </p>
                        <p className="text-2xl font-black text-gray-900 sm:text-3xl">
                          {formatCurrency(order.totalPrice ?? 0, order.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;