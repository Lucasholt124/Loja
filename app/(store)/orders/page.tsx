import { formatCurrency } from "@/lib/formatCurrency";
import { imageUrl } from "@/lib/imageUrl";
import { getMyOrders } from "@/sanity/lib/orders/getMyOrders";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { Package, Calendar, CreditCard, CheckCircle, Clock, XCircle, Truck } from "lucide-react";

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
  status?: string;
  totalPrice?: number;
  amountDiscount?: number;
  currency?: string;
  products?: Product[];
};

const getStatusConfig = (status?: string) => {
  switch (status) {
    case "paid":
      return {
        label: "Pago",
        color: "bg-green-500",
        textColor: "text-green-700",
        bgColor: "bg-green-50",
        icon: CheckCircle,
      };
    case "pending":
      return {
        label: "Pendente",
        color: "bg-yellow-500",
        textColor: "text-yellow-700",
        bgColor: "bg-yellow-50",
        icon: Clock,
      };
    case "shipped":
      return {
        label: "Enviado",
        color: "bg-blue-500",
        textColor: "text-blue-700",
        bgColor: "bg-blue-50",
        icon: Truck,
      };
    case "cancelled":
      return {
        label: "Cancelado",
        color: "bg-red-500",
        textColor: "text-red-700",
        bgColor: "bg-red-50",
        icon: XCircle,
      };
    default:
      return {
        label: status || "Desconhecido",
        color: "bg-gray-500",
        textColor: "text-gray-700",
        bgColor: "bg-gray-50",
        icon: Package,
      };
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
          <h1 className="mb-2 text-4xl font-black tracking-tight text-gray-900 lg:text-5xl">
            Histórico de Compras
          </h1>
          <p className="text-lg text-gray-600">
            Acompanhe todos os seus pedidos em um só lugar
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-16 text-center shadow-xl">
            <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100">
              <Package className="size-12 text-blue-600" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              Nenhum pedido ainda
            </h2>
            <p className="mb-6 text-gray-600">
              Quando você fizer uma compra, ela aparecerá aqui.
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
            {orders.map((order: Order, index: number) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={order.orderNumber ?? `order-${index}`}
                  className="group overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg transition-all hover:border-blue-500 hover:shadow-2xl"
                >
                  {/* Header do Pedido */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Package className="size-5 text-gray-600" />
                          <span className="text-sm font-bold uppercase tracking-wide text-gray-600">
                            Pedido
                          </span>
                        </div>
                        <p className="break-all font-mono text-lg font-bold text-blue-600">
                          #{order.orderNumber?.slice(0, 8)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="size-5" />
                          <span className="text-sm font-semibold">
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "Data não disponível"}
                          </span>
                        </div>

                        <div
                          className={`flex items-center gap-2 rounded-full px-4 py-2 ${statusConfig.bgColor}`}
                        >
                          <StatusIcon className={`size-5 ${statusConfig.textColor}`} />
                          <span className={`text-sm font-bold ${statusConfig.textColor}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Produtos */}
                  <div className="p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-600">
                      <Package className="size-4" />
                      Itens do Pedido
                    </h3>

                    <div className="space-y-4">
                      {order.products?.map((product: Product, idx: number) => (
                        <div
                          key={product._key || idx}
                          className="flex items-center gap-4 rounded-xl border-2 border-gray-100 bg-gray-50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/50"
                        >
                          {/* Imagem */}
                          {product.product?.image && (
                            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-white">
                              <Image
                                src={imageUrl(product.product.image).url()}
                                alt={product.product.name ?? "Produto"}
                                className="object-cover"
                                fill
                              />
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
                            <div>
                              <p className="mb-1 font-bold text-gray-900">
                                {product.product?.name || "Produto sem nome"}
                              </p>
                              <p className="text-sm text-gray-600">
                                Quantidade: {product.quantity ?? "N/A"}
                              </p>
                            </div>

                            <p className="mt-2 text-right text-lg font-black text-gray-900 sm:mt-0">
                              {product.product?.price && product.quantity
                                ? formatCurrency(
                                    product.product.price * product.quantity,
                                    order.currency
                                  )
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer com Totais */}
                  <div className="border-t-2 bg-gradient-to-r from-blue-50 to-violet-50 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-2">
                        {order.amountDiscount && order.amountDiscount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                              DESCONTO APLICADO
                            </span>
                            <span className="text-sm font-semibold text-red-600">
                              -{formatCurrency(order.amountDiscount, order.currency)}
                            </span>
                          </div>
                        ) : null}

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CreditCard className="size-4" />
                          <span>Forma de pagamento confirmada</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="mb-1 text-sm font-bold uppercase tracking-wide text-gray-600">
                          Total do Pedido
                        </p>
                        <p className="text-3xl font-black text-gray-900">
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