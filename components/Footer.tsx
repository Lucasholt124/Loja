import Link from "next/link";
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
} from "lucide-react";
import NewsletterSection from "./NewsletterSection";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t bg-gradient-to-b from-white to-gray-50">
      {/* Newsletter Section */}
      <div className="mx-auto max-w-screen-2xl px-4 py-12 lg:px-6">
        <NewsletterSection />
      </div>

      {/* Diferenciais */}
      <div className="border-y border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-screen-2xl px-4 lg:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              {
                icon: Truck,
                title: "Frete Grátis",
                desc: "Em pedidos acima de R$ 99",
                color: "blue",
              },
              {
                icon: ShieldCheck,
                title: "Compra Segura",
                desc: "100% protegida",
                color: "green",
              },
              {
                icon: CreditCard,
                title: "Parcele sem juros",
                desc: "Em até 12x",
                color: "violet",
              },
              {
                icon: Headphones,
                title: "Suporte 24/7",
                desc: "Estamos aqui para ajudar",
                color: "rose",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left"
              >
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 shadow-lg`}
                >
                  <feature.icon className="size-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{feature.title}</p>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Links principais */}
      <div className="mx-auto max-w-screen-2xl px-4 py-12 lg:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Sobre */}
          <div>
            <h3 className="mb-4 text-lg font-black text-gray-900">Sobre Nós</h3>
            <ul className="space-y-2">
              {["Nossa História", "Trabalhe Conosco", "Imprensa", "Sustentabilidade"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-gray-600 transition-colors hover:text-blue-600"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h3 className="mb-4 text-lg font-black text-gray-900">Ajuda</h3>
            <ul className="space-y-2">
              {[
                "Central de Ajuda",
                "Rastreamento",
                "Trocas e Devoluções",
                "Formas de Pagamento",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-gray-600 transition-colors hover:text-blue-600"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="mb-4 text-lg font-black text-gray-900">Institucional</h3>
            <ul className="space-y-2">
              {[
                "Política de Privacidade",
                "Termos de Uso",
                "LGPD",
                "Programa de Afiliados",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-gray-600 transition-colors hover:text-blue-600"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="mb-4 text-lg font-black text-gray-900">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-600">
                <MapPin className="mt-1 size-5 shrink-0 text-blue-600" />
                <span>Av. Exemplo, 123 - São Paulo, SP</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Phone className="size-5 shrink-0 text-blue-600" />
                <a href="tel:+5511999999999" className="hover:text-blue-600">
                  (11) 99999-9999
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Mail className="size-5 shrink-0 text-blue-600" />
                <a href="mailto:contato@loja.com" className="hover:text-blue-600">
                  contato@loja.com
                </a>
              </li>
            </ul>

            {/* Redes Sociais */}
            <div className="mt-6 flex items-center gap-3">
              {[
                { icon: Facebook, href: "#", color: "blue" },
                { icon: Instagram, href: "#", color: "pink" },
                { icon: Twitter, href: "#", color: "sky" },
                { icon: Youtube, href: "#", color: "red" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-${social.color}-500 to-${social.color}-600 text-white shadow-lg transition-transform hover:scale-110`}
                >
                  <social.icon className="size-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pagamentos e Copyright */}
      <div className="border-t border-gray-200 bg-gray-50 py-6">
        <div className="mx-auto max-w-screen-2xl px-4 lg:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-center text-sm text-gray-600">
              © {currentYear} <span className="font-bold">Loja</span>. Todos os direitos
              reservados.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {["Visa", "Mastercard", "Pix", "Boleto", "Elo"].map((method) => (
                <div
                  key={method}
                  className="rounded-lg border-2 border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-600"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}