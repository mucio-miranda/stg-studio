# STG Studio™

Home editorial de upcycling / streetwear, baseada no [layout STG — Antagon no Figma](https://www.figma.com/design/qrGVqUHoO8iIQb7UoFRtTz/STG---Antagon?node-id=2-143).

Este repositório contém **apenas o frontend** (Next.js 16, React 19, Tailwind 4, GSAP e Three.js). O backend anterior foi removido para ser refeito do zero.

## Executar

```sh
npm install
npm run dev     # http://localhost:3001
```

Não há variáveis de ambiente obrigatórias.

```sh
npm run lint
npm run typecheck
npm run test:e2e
npm run build && npm start
```

Os testes usam o Google Chrome instalado (`channel` em `playwright.config.ts`). O build usa Webpack (`next build --webpack`).

## Páginas

| Rota | Conteúdo |
|---|---|
| `/` | Home: hero, manifesto, coleção em faixas, estrela 3D cromada, categorias, banner |
| `/shop` | Catálogo filtrável, busca, favoritos e carrinho local |
| `/colecoes` | Collection #001 |
| `/magazine`, `/magazine/[slug]` | Matérias (hoje vazio: "A primeira matéria está sendo escrita") |
| `/stg` | Sobre a marca e equipe |
| `/entrar`, `/voce`, `/registrar`, `/pecas/[code]` | Telas de conta e passaporte digital, prontas para um backend (hoje respondem "indisponível") |

## Pontos de integração para o novo backend

Toda a interface lê dados por duas camadas finas. Ao refazer o backend, troque só a origem dos dados e mantenha as assinaturas:

- `src/lib/data.ts`: produtos, perfil da marca, contato, Magazine, sessão, perfil, guarda-roupa e unidades. Hoje devolve conteúdo estático (5 peças sem preço, equipe de 3 pessoas).
- `src/lib/actions.ts`: `signIn`, `signUp`, `signOut`, `saveProfile`, `claimUnit`. Hoje retornam "indisponível".

Não existe painel administrativo, modo fechado, autenticação nem armazenamento de mídia: tudo isso será parte do novo backend. O desenho de dados anterior (produtos, unidades NFC, perfis, Magazine) está descrito em [docs/vestuario-nfc.md](docs/vestuario-nfc.md).

## Antes de vender

É uma vitrine interativa, sem transações. O carrinho só salva uma seleção no navegador (`src/lib/use-selection.ts`). Para operar o e-commerce faltam estoque por tamanho, pagamento, frete e pedidos.

As fotos editoriais da coleção têm aproximadamente 620 × 830 px; troque por originais de alta resolução antes do lançamento.

## Arquivos principais

- `src/components/studio-home.tsx`: seções da home, navegação, painéis e timelines GSAP.
- `src/components/chrome-logo.tsx`: cena 3D (Three.js), carregada só quando a seção se aproxima da tela.
- `src/components/storefront*.tsx`, `shop-catalog.tsx`: estrutura da loja, painéis e catálogo.
- `src/app/globals.css`: tokens, composição e adaptações responsivas.
- `src/lib/catalog.ts`: categorias, tipos e direção de arte da home.
- `public/`: assets exportados (veja `public/ASSETS.md`) e fonte General Sans.
- `tests/`: Playwright (storefront, coleções, magazine, sobre, UI mínima).
