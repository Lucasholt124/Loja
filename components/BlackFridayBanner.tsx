import { getActiveSaleByCouponCode } from "@/sanity/lib/sales/getActiveSaleByCouponCode";
import BlackFridayBannerClient from "./BlackFridayBannerClient";

const BlackFridayBanner = async () => {
  // Isso roda no SERVIDOR, então o token funciona aqui
  const sale = await getActiveSaleByCouponCode("BFRIDAY");

  if (!sale?.isActive) {
    return null;
  }

  // Passamos os dados para o componente Cliente renderizar
  return <BlackFridayBannerClient sale={sale} />;
};

export default BlackFridayBanner;