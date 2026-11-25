# Vestuário digital e NFC — estado da prévia

> **Atualização (2026-10-14):** o backend (Supabase, painel admin, modo fechado, Laboratório NFC) foi removido do repositório para ser refeito do zero. Permanece só o frontend, com dados estáticos em `src/lib/data.ts` e ações de conta em `src/lib/actions.ts` respondendo "indisponível". A seção "Implementado" abaixo descreve o estado anterior e o desenho de dados serve de referência para o novo backend; a cópia do SQL antigo está no backup `stg-studio-backup-2026-10-14`.

## Implementado

- Conta Supabase (e-mail e senha) em /entrar; /voce, /registrar e /laboratorio/nfc exigem login (src/proxy.ts).
- /voce: vestuário com as unidades registradas pela conta, perfil (nome e tamanho) na tabela `profiles`, compras ainda sem pedidos.
- /registrar: entrada manual de código STG ou URL válida deste site.
- /pecas/[code]: ficha da unidade (tabela `units`), registro via `claim_unit` — atômico, só a primeira conta fica com a unidade.
- /admin: painel da marca (peças, unidades, Magazine, Sobre, canais), apenas perfis com `role = 'admin'`.
- /laboratorio/nfc: apenas perfis com `role = 'admin'`. `issue_unit` gera o código no servidor e grava a unidade; gravação Web NFC em tag vazia (overwrite: false), com permissão, cancelamento e timeout. Nunca bloqueia a tag nem configura chaves AES.
- Ainda não existe compra real, certificado, transferência de posse ou verificação criptográfica do chip: conhecer o código basta para registrar.
- Cinco modelos procedurais de demonstração: saia, jaqueta, calça, acessório e bolsa. Não são digitalizações ou réplicas dos produtos.

## Fluxo futuro para produção

Admin autenticado → cadastra unidade física → provisiona tag → cliente abre URL → servidor valida tag → cliente faz login e confirma → transação atribui unidade → vestuário.

O cadastro precisa distinguir produto/modelo de unidade física. Cada unidade tem ID estável, serial, vínculo de tag, estado e titular. Compras e posse no vestuário são conceitos separados.

### Requisitos de segurança

1. Definir quem pode ser administrador. Autorização no servidor, nunca por uma flag no navegador.
2. Emissão de unidades apenas em serviço autenticado; IDs únicos e trilha de auditoria no banco.
3. Não dar posse apenas por conhecer uma URL. Validar compra/entrega ou segredo de ativação separado, e uma leitura válida quando exigido.
4. Registro com transação atômica e restrição única por unidade, impedindo duas reivindicações concorrentes. GET não altera titularidade.
5. NTAG424 DNA: provisionar chaves individuais fora do frontend, verificar SUN/SDM/CMAC no servidor e prevenir replay. Não reutilizar chave única em todo lote.
6. Segredos em armazenamento seguro/KMS; nunca no HTML, JavaScript, QR, exportação pública ou histórico de logs.
7. Revogação, perda/substituição da tag, devolução, transferência de posse e auditoria precisam ser definidos antes do lançamento.
8. Autenticar a tag não prova que ela está na roupa original. A aplicação física precisa dificultar remoção e transplante; testar construção e alternativas tamper conforme a peça.
9. Proteção contra abuso, limites de requisição, CSRF, minimização de dados pessoais e isolamento entre contas.
10. Domínio definitivo e HTTPS antes de gravar o lote; planejar continuidade e redirecionamentos.

### Dados

Criados em `supabase/schema.sql`: profiles (com role), products, units (unidade física, titular e emissor), magazine_posts, site_settings.

Previstos: nfc_tags (estado e referência de chave, nunca chave pública), ownership_events (transferência e auditoria), orders e order_items, unit_story_blocks e unit_media (fotos, processos e modelos GLB reais).

### 3D definitivo

Produzir GLB/glTF por unidade a partir de modelagem ou captura adequada. Fotos editoriais isoladas não definem costas, proporções e acabamento. Requer fotos consistentes da peça, frente/costas/laterais/detalhes, dimensões e revisão da marca. Otimizar malha/texturas e carregar o render apenas sob demanda.

## Tags: amostras antes do lote

Recomendação inicial: NXP NTAG424 DNA para testar autenticação dinâmica no sistema futuro. NTAG213/215/216 servem para links de teste, mas não oferecem SUN/SDM da família DNA. Uma URL estática é copiável; chip seguro não substitui backend nem vínculo de compra.

- [NXP — NTAG424 DNA e recursos criptográficos](https://www.nxp.com/products/NTAG424DNA)
- [NXP — comparação da família NTAG](https://www.nxp.com/products/rfid-nfc/nfc-hf/ntag-for-tags-and-labels:NTAG-TAGS-AND-LABELS)
- [Shop NFC — tag flexível NTAG424 DNA para roupas, 25 mm](https://shopnfc.com/en/nfc-hard-tags/553-nfc-garment-tags-ntag424-dna-in-flexible-pet-25mm.html): o fornecedor informa até 100 lavagens domésticas; verificar condições e testar a aplicação real. Isso não é certificação independente nossa.
- [Avery Dennison — AD Circus Pro Flex](https://rfid.averydennison.com/en/home/product-finder/circus-pro-flex.html): especificar a variante NTAG424 DNA. Inlay sozinho não garante resistência a lavagem.

Solicitar ao fornecedor chinês 10–20 amostras, fabricante/modelo exato do chip, suporte SUN/SDM, NFC HF 13,56 MHz/ISO14443A, dimensões, material, encapsulamento e relatório de ensaio da tag acabada. Não confundir NFC com RFID UHF de lavanderia. Cotar personalização apenas após validar amostras; nenhum fornecedor chinês foi homologado nesta etapa.

Testar leitura em aparelhos reais, distância, proximidade de metais/acessórios, conforto, costura, dobra, lavagem e secagem permitidas pela etiqueta. Definir guarda e rotação das chaves antes do provisionamento.

## Compatibilidade e limitações do teste

- [Chrome — Web NFC](https://developer.chrome.com/docs/capabilities/nfc): leitura/gravação Web NFC em dispositivos compatíveis, contexto seguro, permissão e ação explícita. Feature detection não garante hardware disponível.
- [Apple — leitura NFC em segundo plano](https://developer.apple.com/documentation/CoreNFC/adding-support-for-background-tag-reading): iPhones compatíveis podem abrir URLs NDEF pelo sistema. Isso não implica suporte à gravação Web NFC no navegador.
- Testes automatizados verificam fluxo e opções da API com mock. Gravação física, resistência da tag e autenticação criptográfica não foram validadas sem hardware.
- JSON exportado é somente uma ficha de teste, não um dump binário, chave ou provisionamento seguro.
