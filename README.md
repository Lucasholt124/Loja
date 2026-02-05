# 🛒 Modern E-commerce Full Stack

Este é um projeto de E-commerce de alta performance desenvolvido com o ecossistema mais moderno do React e Next.js. O foco principal foi criar uma aplicação escalável, com gerenciamento de conteúdo dinâmico (CMS) e otimização técnica para SEO e conversão.

## 🚀 Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (App Router & Server Components)
- **Linguagem:** [TypeScript](https://www.typescript.org/) (Tipagem estrita para segurança de dados)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **CMS Headless:** [Sanity.io](https://www.sanity.io/) (Gerenciamento de produtos e estoque em tempo real)
- **ORM / Database:** [Prisma](https://www.prisma.io/) com PostgreSQL
- **Autenticação & Middleware:** Proteção de rotas e sessões otimizadas.
- **UI Components:** [Radix UI](https://www.radix-ui.com/) / Shadcn UI (Acessibilidade e design responsivo)

## 🛠️ Funcionalidades Principais

- **SSR & ISR:** Renderização no lado do servidor e regeneração estática para garantir velocidade máxima.
- **CMS Integration:** Painel administrativo via Sanity para controle de banners, categorias e detalhes de produtos.
- **Carrinho Dinâmico:** Gerenciamento de estado otimizado para uma experiência de compra fluida.
- **Design Responsivo:** Interface adaptável para Mobile, Tablet e Desktop.
- **Middleware de Segurança:** Validação de acessos e otimização de requisições.

## 📦 Estrutura do Projeto

- `/aplicativo`: Rotas e lógica de páginas do Next.js.
- `/componentes`: Componentes de UI modulares e reutilizáveis.
- `/prisma`: Esquemas de banco de dados e migrações.
- `/sanidade`: Configurações do Headless CMS para o lojista.
- `/biblioteca`: Funções utilitárias e clientes de API.

## 🏁 Como Rodar o Projeto

1. Clone o repositório:
   ```bash
   git clone [https://github.com/Lucasholt124/Loja.git](https://github.com/Lucasholt124/Loja.git)

 2.  Instale as dependências:

Bash
npm install

3. Configure as variáveis de ambiente (.env) com suas chaves do Sanity e Banco de Dados.

4. Execute o servidor de desenvolvimento:

Bash
npm run dev

Desenvolvido por Lucas Aragão
