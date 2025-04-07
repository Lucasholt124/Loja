import { getActiveSaleByCouponCode } from "@/sanity/lib/sales/getActiveSaleByCouponCode";
import React from "react";

const BlackFridayBanner = async () => {
  const sale = await getActiveSaleByCouponCode("BFRIDAY");

  if (!sale?.isActive) {
    return null;
  }

  return (
    <div className="mx-4 mt-2 rounded-lg bg-gradient-to-r from-red-600 to-black px-6 py-10 text-white shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1">
          <h2 className="mb-4 text-left text-3xl font-extrabold sm:text-5xl">
            {sale.title}
          </h2>
          <p className="mb-6 text-left text-xl font-semibold sm:text-3xl">
            {sale.description}
          </p>

          <div className="flex">
            <div className="rounded-full bg-white px-6 py-4 text-black shadow-md transition duration-300 hover:scale-105">
              <span className="text-balance font-bold sm:text-xl">
                Use o cupom:{" "}
                <span className="text-red-600">{sale.couponCode}</span>
              </span>
              <span className="ml-2 text-base font-bold sm:text-xl">
                para {sale.discountAmount}% de desconto
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlackFridayBanner;
