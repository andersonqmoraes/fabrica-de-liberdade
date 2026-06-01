---
slug: stack-side-project-rapido-2026
category: software
tags: [side-project, stack, nextjs, supabase, vercel, dev]
targetKeyword: stack side project 2026
readTime: 8
publishedAtOffset: -11
metaTitle: "Stack pra side project rápido em 2026: o que eu uso quando quero entregar em 1 fim de semana"
metaDescription: "Stack opinativa pra MVP de side project: do banco ao deploy, com IA no meio. O que troquei e o que mantive desde 2024."
---

# Stack pra side project rápido em 2026: o que eu uso quando quero entregar em 1 fim de semana

Side project tem regra própria: o objetivo não é arquitetura linda, é **ter algo no ar funcionando rápido**. Em 2026 já não tem desculpa pra MVP demorar mais que 1 fim de semana. A ferramentaria existe. O que falta na maioria das vezes é decisão.

Esse post é a stack que escolhi e o porquê. Você pode discordar — quase tudo aqui tem alternativa válida. Mas escolha **alguma** e siga. Indecisão custa mais que escolha mediana.

## A regra que veio antes da stack

Antes da lista de ferramentas, a regra mental que organiza tudo:

> **Não use nada que você não consiga deployar em 5 minutos.**

Se uma escolha de stack te custa 1h pra fazer deploy, você vai postergar deploy. Postergar deploy é a forma número 1 de side project virar projeto morto. Tudo o que escolho privilegia "do código rodando no meu pc pra rodando em prod" em minutos, não horas.

Agora a stack.

## Frontend: Next.js (App Router) + TypeScript + Tailwind

Por que Next.js: SSR, file-based routing, deploy em 1 comando na Vercel. É o setup que tem **menos atrito** pra MVP web em 2026.

Alternativas que considerei e por que não:

- **Remix:** ótimo, mas comunidade menor e menos integração nativa com Vercel
- **SvelteKit:** lindo, mas o ecossistema (componentes prontos, libs) ainda é menor
- **Astro:** ótimo pra site estático, mas se você vai precisar de auth dinâmico, é desconforto

Tailwind virou padrão da minha cabeça. Em 30 min consigo deixar UI razoável sem componente-library. Pra side project, é o suficiente.

TypeScript não é opcional. Custa 10% mais tempo de digitação, economiza 50% de bug que aparece em runtime. Sempre.

## Backend: API routes do Next + Server Actions

Pra MVP, não levanto backend separado. API routes do Next + server actions (App Router) já cobrem 90% dos casos.

Quando saio disso: quando preciso de processamento em background. Aí ligo um cron via Vercel Cron, ou puxo Inngest/Trigger pra background job. Pra MVP, ainda é cedo pra isso.

Linguagem do backend: TypeScript mesmo. Compartilho tipos com frontend, validação com Zod, fim.

## Banco de dados: Supabase (Postgres + Auth)

Aqui mudei nos últimos 2 anos. Tinha época que defendia Firebase. Hoje uso Supabase como default.

Por quê:

- **Postgres de verdade** — não NoSQL caprichoso. SQL que eu já sei, JOIN como sempre, sem regra esquisita
- **Auth incluso** — email/password, magic link, OAuth (Google, GitHub), tudo plug-and-play
- **Row Level Security** — autorização declarada no banco, não na camada de aplicação
- **Realtime** — quando precisar, está lá
- **Edge functions** — pra lógica que precisa rodar perto do banco

Comparado a Firebase: Supabase é menos "mágico". Você lida com SQL, faz `RLS` na cara. Em troca, ganha portabilidade — se um dia precisar sair, é um `pg_dump`. No Firebase a saída é dolorosa.

Quando não uso Supabase: projetos que de cara precisam de muita escrita concorrente em coleção grande. Aí Postgres começa a sofrer antes do esperado. Pra MVP isso quase nunca é o caso.

## Auth: Supabase Auth (ou Clerk como fallback)

Supabase Auth me serve em 95% dos casos. Free tier cobre o suficiente, integração com Next é direta.

Quando troco pra Clerk: quando preciso de **organizações, papéis, ou multitenancy complexo** logo de cara. Clerk tem UI pronta pra isso. Supabase Auth te força a construir.

Auth.js (NextAuth) eu evito pra side project. Bom em si, mas demanda configuração. Pra MVP, escolho o que vem com UI pronta.

## Deploy: Vercel

Não tem o que discutir. Push pra GitHub, deploy em 30s. Preview deploys por PR. Edge functions automáticas. Logs.

Custo: free tier cobre side project por meses. Quando passa, Pro custa US$ 20/mês. Pra projeto que tá gerando algum sinal, é trivial.

Alternativas: Netlify funciona igual; Railway é boa pra backends mais full; Cloudflare Pages é forte em performance. Mas pra Next, Vercel é casa.

## Storage de arquivos: Supabase Storage

Já uso Supabase pro banco e auth, então Storage vem natural. Configura bucket, define policies (RLS no storage também), pronto. Pra MVP que precisa upload de imagem ou arquivo, resolve.

Quando saio disso: quando preciso de processamento de imagem pesado. Aí ligo Cloudinary ou ImageKit, que fazem transformação on-the-fly. Pra MVP, Supabase basta.

## Pagamentos: Stripe Checkout

Stripe Checkout (não Stripe Elements) é a forma mais rápida de aceitar pagamento. Você redireciona pro Stripe, eles cobram, fazem callback. Em 1h você tem cobrança funcionando.

Pra produto SaaS com assinatura: ainda Stripe, com Billing Portal pra cliente gerenciar plano. Os widgets prontos cobrem 90% dos casos.

Pra produto BR (PIX): trocam Stripe por Pagar.me ou Asaas. Funciona similar, com SDK menos polido mas adequado.

## Analytics: Vercel Analytics + PostHog

Vercel Analytics: page views básicos, vem incluso, é "uma linha de código". Cobre relatório de "isso aqui está crescendo?".

PostHog: pra entender **comportamento**. Quem clicou onde, funnel de signup, retention. Free tier mais que suficiente pra side project.

Não uso Google Analytics 4 em side project. Configuração mais cara, dados mais opacos, e PostHog faz melhor o que importa pra produto.

## Email transacional: Resend

Resend é tudo. API limpa, free tier de 100 emails/dia, templates em React (não HTML cru), preço previsível.

Alternativas: SendGrid funciona mas tem fricção. Postmark é ótimo mas mais caro. Loops é interessante mas pra MVP é overkill.

Pra disparo único (welcome, magic link, recuperação de senha) — Resend resolve em 10 min.

## Erros: Sentry

Mesmo em side project, eu ligo Sentry. Free tier cobre. Quando algo quebrar em prod, eu quero saber **antes** do usuário reclamar.

Configuração: 5 min com o SDK do Next. Vale o tempo.

## IA: Claude Code + Vercel AI SDK

Pra desenvolvimento, Claude Code. Já escrevi sobre isso noutro lugar.

Pra **integrar IA no produto**, Vercel AI SDK. Abstração unificada sobre OpenAI, Anthropic, Google. Streaming, function calling, tudo padronizado. Em 2 horas você tem chatbot funcionando.

## A stack completa, resumida

```
Frontend:  Next.js (App Router) + TypeScript + Tailwind
Backend:   Next API routes + Server Actions
Banco:     Supabase (Postgres + Auth)
Storage:   Supabase Storage
Pagamento: Stripe Checkout
Analytics: Vercel + PostHog
Email:     Resend
Erros:     Sentry
Deploy:    Vercel
IA no app: Vercel AI SDK
```

Em 2026, com essa stack, um side project sai em 1 fim de semana. Auth, banco, deploy, pagamentos, analytics — tudo coberto, tudo grátis ou trivial no início.

## O que NÃO uso (e por quê)

Pra terminar, lista de coisas que ouvi indicação e descartei:

- **Drizzle/Prisma** pra MVP: SQL puro com client do Supabase é mais rápido. ORM aceito em projeto maior.
- **tRPC:** elegante, mas server actions do Next cobrem o caso de MVP sem precisar de camada extra.
- **Auth.js (NextAuth):** ótimo pra projeto maduro, sobra pra MVP.
- **Custom CSS framework:** Tailwind venceu. Aceita.
- **Microsserviços:** literalmente nunca. Em side project, monolito Next é a resposta.
- **Docker:** não na fase MVP. Vercel deploya sem Dockerfile. Docker é dor que você não precisa.

## Conclusão

A stack acima é minha resposta pra "como você começa novo side project". Não é "a melhor stack do mundo". É **uma escolha consistente**, baixa atrito, e que me permite focar na ideia em vez de em ferramenta.

Se você ainda não escolheu sua stack default, escolha alguma. A pior decisão é ficar reavaliando toda vez que aparece projeto novo. O custo de mudar de stack a cada side project é maior do que o custo de aceitar uma escolha mediana e seguir.

Próximo fim de semana, escolhe uma ideia, abre Next, deploya na sexta à noite e vê quanto sai até domingo. Aposto que sai mais do que você espera.
