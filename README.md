# STG Studio™

Home editorial de upcycling / streetwear, baseada no [layout STG — Antagon no Figma](https://www.figma.com/design/qrGVqUHoO8iIQb7UoFRtTz/STG---Antagon?node-id=2-143).

Next.js 16, React 19, Tailwind 4, GSAP e Three.js, hospedado na Netlify. Produtos, fotos e títulos da home e o WhatsApp de pedidos são editados no painel `/admin` (Decap CMS).

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

## Painel de conteúdo (`/admin`)

O painel é o [Decap CMS](https://decapcms.org/) (`public/admin/`). Ele edita três arquivos versionados:

| Arquivo | Conteúdo |
|---|---|
| `content/products.json` | Produtos do shop: nome, código, categoria, foto, enquadramento, descrição e preço (vazio = "Sob consulta"). A ordem da lista é a ordem do shop. |
| `content/home.json` | Home: foto e linhas da abertura, manifesto, título e 4 fotos da coleção, frase da marca, fotos das categorias e banner. |
| `content/settings.json` | WhatsApp que recebe os pedidos (só números, com 55 e DDD), Instagram e TikTok. |

Cada "Publicar" no painel grava um commit em `main` no GitHub; a Netlify publica de novo em 1 a 3 minutos. Fotos enviadas ficam em `public/uploads/`. O login é pela conta do GitHub, que precisa ter permissão de escrita no repositório (OAuth do GitHub configurado na Netlify em *Project configuration > Access & security > OAuth*).

Para editar localmente sem login: `npx decap-server` em um terminal, `npm run dev` em outro e abrir `http://localhost:3001/admin`. As mudanças vão direto para os arquivos de `content/`.

## Carrinho e pedidos

"CONCLUIR COMPRA" abre o WhatsApp (`wa.me`) com o pedido formatado: peças, categoria, tamanho de preferência, valor e total quando todas têm preço. Não há pagamento, estoque nem frete no site.

## Pontos de integração para o novo backend

Toda a interface lê dados por duas camadas finas. Ao refazer o backend, troque só a origem dos dados e mantenha as assinaturas:

- `src/lib/data.ts`: produtos e contato (lidos de `content/`), perfil da marca, Magazine, sessão, perfil, guarda-roupa e unidades.
- `src/lib/actions.ts`: `signIn`, `signUp`, `signOut`, `saveProfile`, `claimUnit`. Hoje retornam "indisponível".

Não existe modo fechado nem conta de cliente: isso será parte do novo backend. O desenho de dados anterior (produtos, unidades NFC, perfis, Magazine) está descrito em [docs/vestuario-nfc.md](docs/vestuario-nfc.md).

## Antes de vender

O carrinho salva a seleção no navegador (`src/lib/use-selection.ts`) e fecha o pedido pelo WhatsApp. Para operar um e-commerce completo faltam estoque por tamanho, pagamento e frete.

As fotos editoriais da coleção têm aproximadamente 620 × 830 px; troque por originais de alta resolução antes do lançamento.

## Arquivos principais

- `src/components/studio-home.tsx`: seções da home, navegação, painéis e timelines GSAP.
- `src/components/chrome-logo.tsx`: cena 3D (Three.js), carregada só quando a seção se aproxima da tela.
- `src/components/storefront*.tsx`, `shop-catalog.tsx`: estrutura da loja, painéis e catálogo.
- `src/app/globals.css`: tokens, composição e adaptações responsivas.
- `src/lib/catalog.ts`: categorias, tipos e conteúdo da home (de `content/home.json`).
- `content/`: conteúdo editado pelo painel; `public/admin/config.yml`: campos do painel.
- `public/`: assets exportados (veja `public/ASSETS.md`) e fonte General Sans.
- `tests/`: Playwright (storefront, coleções, magazine, sobre, UI mínima).
