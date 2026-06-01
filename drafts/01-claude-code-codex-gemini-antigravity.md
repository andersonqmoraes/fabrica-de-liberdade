---
slug: claude-code-vs-codex-vs-gemini-vs-antigravity-2026
category: ai-tools
tags: [claude-code, codex, gemini-cli, antigravity, agentic-coding, dev-tools]
targetKeyword: melhor ia para programar 2026
readTime: 11
metaTitle: "Claude Code, Codex, Gemini CLI e Antigravity: minha stack de IA pra programar em 2026"
metaDescription: "Comparativo honesto e opinativo entre as 4 ferramentas de IA que uso pra programar em 2026: Claude Code, Codex CLI, Gemini CLI e Antigravity. Cenários reais, prós, contras e quando escolher cada uma."
---

# Claude Code, Codex, Gemini CLI e Antigravity: minha stack de IA pra programar em 2026

Eu programo profissionalmente há mais de uma década. Vi o GitHub Copilot quando lançou em 2021 e ri achando que era um autocomplete chique. Em 2026, ri da minha própria cara: não dá mais pra falar de **uma** IA pra programar — a stack importa, e cada ferramenta faz um trabalho diferente.

Hoje uso quatro no dia a dia: **Claude Code**, **Codex CLI**, **Gemini CLI** e **Antigravity**. Cada uma ganhou um lugar específico no meu workflow, e cada uma me decepcionou em pelo menos uma coisa. Este artigo é o comparativo que eu queria ter lido antes de gastar tempo testando tudo do zero.

## TL;DR — uma linha por ferramenta

- **Claude Code** — Meu daily driver. Agente real, multi-arquivo, fluxo de trabalho.
- **Codex CLI** — Segunda opinião quando preciso da família GPT, ótimo pra scripts one-shot.
- **Gemini CLI** — Imbatível em preço e contexto. Onde uso quando preciso ler codebase inteira.
- **Antigravity** — A aposta do Google em IDE multi-agente. Ambiciosa, mas ainda não migrei.

Se você quer só a recomendação rápida: **escolha sua base entre Claude Code e Codex**, **adicione Gemini CLI pelo free tier generoso**, e **só olhe pra Antigravity se você não quer viver no terminal.**

Agora o longo.

## Minha stack atual, em ordem de uso

Antes de detalhar cada uma, deixa eu te mostrar como elas se encaixam no meu dia:

1. **Claude Code** — 70% do tempo. É onde planejo, refatoro e implemento.
2. **Codex CLI** — 15%. Quando preciso testar uma abordagem diferente ou rodar uma tarefa em paralelo.
3. **Gemini CLI** — 10%. Para análises de codebase grande ou quando bate o limite do plano do Claude.
4. **Antigravity** — 5%. Em testes, sem migrar projetos sérios ainda.

Isso muda dependendo da fase do projeto. Em greenfield (projeto novo, codebase pequena), Claude Code domina sozinho. Em legado (codebase grande, com idiossincrasias), o peso do Gemini sobe porque o contexto longo dele resolve coisas que outras ferramentas não conseguem nem ler.

## Claude Code: por que virou a base

O que me converteu não foi a qualidade do modelo — o Claude Sonnet 4.x e Opus 4.x são ótimos, mas Codex com GPT-5 também é. **O que me converteu foi o paradigma de agente.**

Claude Code não é um autocomplete. É um agente que:

- Lê arquivos por conta própria
- Edita múltiplos arquivos numa mesma "tarefa"
- Roda comandos do shell (com permissão)
- Pode entrar em **plan mode** antes de implementar (separar pensar de fazer)
- Tem **sub-agents** especializados (revisor, explorador, código)
- Suporta **skills** customizadas e **hooks** automatizados via settings.json
- Lembra contexto da sessão e pode ser interrompido sem perder o fio

Na prática, isso significa que eu posso falar "atualiza esses 5 endpoints pra usar a nova auth, roda os testes, e me diz o que quebrou" — e ele faz. Não preciso ficar abrindo arquivo por arquivo e copiando trecho por trecho como fazia no Cursor.

### Onde Claude Code me incomoda

Não é só elogio. Tem três coisas que ainda implicam:

1. **Latência em tarefas longas.** Quando uma tarefa toma 15+ tool calls, dá pra sentir. Não é lento — é que você espera. Codex às vezes é mais rápido em tarefas pequenas porque tem menos overhead de planejamento.
2. **Custo.** Plano Pro/Max não é trivial pra quem tá começando. Comparado ao free tier de 1000 req/dia do Gemini CLI, dá agonia.
3. **Excesso de cautela em ações destrutivas.** Ele pergunta confirmação pra coisas que eu já autorizei mentalmente. Eu entendo o porquê (proteção contra erros caros), mas em workflows iterativos isso atrita.

Mesmo com esses três pontos, ele continua sendo a base. O paradigma de agente compensa cada um deles em horas economizadas.

## Codex CLI: pra quando quero diversidade de modelo

O Codex (a versão CLI atual da OpenAI, não confunda com o Codex antigo que foi descontinuado) é onde eu vou quando:

- Quero a opinião do GPT-5 sobre uma arquitetura — modelos diferentes "pensam" diferente
- Preciso rodar uma tarefa em paralelo enquanto o Claude Code está ocupado
- O problema é **algorítmico puro** (otimização, estrutura de dados) — meu sentimento é que o GPT-5 ainda tem leve vantagem aqui, principalmente em problemas tipo LeetCode hard

Codex CLI tem um modelo de execução parecido com Claude Code — agente, multi-arquivo, shell. Mas o ecossistema ao redor (skills, hooks, sub-agents, MCP servers) é mais raso. É mais "agente bruto", menos "framework de produtividade".

### Quando não uso Codex

Quando a tarefa é **refactor longo** ou **discussão arquitetural**. Senti que o GPT-5 fica mais "obediente" — faz exatamente o que você pede, mas não puxa contexto adjacente nem questiona. Claude, na minha experiência, é mais propenso a dizer "olha, vi que isso aqui também precisa mudar" ou "tem certeza que quer fazer assim?". Em projetos sérios, eu prefiro a IA que questiona.

## Gemini CLI: o melhor "preço x contexto" do mercado

O Gemini CLI é o azarão que ninguém esperava. Lançado pelo Google como concorrente direto do Claude Code e Codex, ele tem **dois trunfos que nenhum outro tem**:

1. **1000 requests por dia no plano gratuito** — sério. Você lê isso e acha que é typo. Não é.
2. **Janela de contexto de 1M+ tokens** — cabe codebase média inteira. Cabe documentação inteira. Cabe TUDO.

Combinado, esses dois pontos abrem cenários que as outras ferramentas não conseguem:

- "Lê todo esse projeto e me diz onde tem código duplicado"
- "Analisa esses 200 arquivos de migração e identifica padrões"
- "Pega essa documentação de 400 páginas e responde minhas perguntas sobre ela"

Em qualquer ferramenta com contexto menor (Claude Code, Codex), essas perguntas exigem RAG, chunking, ou múltiplas sessões. No Gemini, é uma pergunta só.

### Onde Gemini CLI decepciona

A execução, principalmente em tarefas longas, é mais frouxa. Ele tende a "alucinar" ações: dizer que fez algo, mas a Edit não rodou, ou rodou diferente. A disciplina agentic é menor que a do Claude Code. Em trabalhos críticos eu não delego pra ele sozinho — uso ele pra **analisar** e o Claude Code pra **executar**.

E a UX da CLI é mais espartana. Sem o ecossistema de skills/agents/hooks. Funciona, mas não te seduz a viver lá.

## Antigravity: ambicioso, mas ainda raw

O Antigravity é a aposta mais recente do Google: uma **IDE de verdade** (não CLI, não plugin do VS Code — uma IDE inteira) com Gemini 3 embarcado e foco em **multi-agente**. Você pode ter agentes paralelos trabalhando em sub-tarefas, vê o trabalho deles num dashboard, aprova ou descarta.

O que o Antigravity acerta:

- Visualização clara do que cada agente está fazendo
- Onboarding mais amigável pra quem odeia terminal
- Integração com o resto do ecossistema Google (Drive, Workspace)

O que ainda não me convenceu:

- **Lock-in.** É IDE inteira. Você não pluga ela no seu setup atual — você muda pra ela.
- **Raw demais.** Bugs visuais, decisões de UX que parecem versão 0.7.
- **Modelo único.** Você usa o que o Google decide. Não dá pra plugar Claude lá dentro.

Pra quem nunca foi feliz no terminal e tá disposto a mudar de IDE, vale o teste. Pra quem tem 10 anos de muscle memory em VS Code/Neovim/JetBrains, não compensa ainda.

## Comparativo prático

| Critério | Claude Code | Codex CLI | Gemini CLI | Antigravity |
|---|---|---|---|---|
| **Forma** | CLI agente | CLI agente | CLI agente | IDE multi-agente |
| **Modelo padrão** | Claude Sonnet/Opus 4.x | GPT-5 | Gemini 3 | Gemini 3 |
| **Janela de contexto** | ~200k | ~200k | ~1M+ | ~1M+ |
| **Free tier útil** | Limitado | Limitado | 1000 req/dia | Pago |
| **Ecossistema (skills, hooks, MCP)** | Forte | Médio | Fraco | Próprio (fechado) |
| **Disciplina agentic** | Alta | Alta | Média | Em evolução |
| **Curva de aprendizado** | Média | Média | Baixa | Alta (muda IDE) |
| **Melhor pra** | Refactor sério, projeto contínuo | Tarefas one-shot, lógica algorítmica | Análise de codebase grande, free tier | Quem quer IDE pronta sem CLI |

## Como decido qual usar

A matriz que uso na prática:

- **Refactor grande numa codebase legada** → Claude Code. A disciplina agentic compensa.
- **"Me escreve um script que faz X"** → Codex ou Claude Code. Codex se for algorítmico puro.
- **"Analisa essa codebase inteira e me diz onde está o problema"** → Gemini CLI. O contexto longo brilha.
- **"Lê essa documentação gigante e responde minhas dúvidas"** → Gemini CLI.
- **Code review automatizado** → Claude Code (sub-agent de review é uma maravilha).
- **Quer multi-agente visual sem CLI** → Antigravity. Mas saiba do trade-off de lock-in.
- **Tarefa rápida sem querer pagar nada** → Gemini CLI. Free tier ganha.

Se você só puder pegar uma, **comece com Claude Code**. O paradigma de agente vai te mudar a forma como você pensa programação assistida. Depois, adicione Gemini CLI pelo free tier — sai de graça e cobre os casos onde o Claude não cabe.

## Honestidade brutal: onde IA pra código ainda falha

Não é tudo lindo. Mesmo usando quatro ferramentas, tem coisas que IA ainda não resolve bem em 2026:

1. **Debugging de side effects assíncronos complexos.** Quando o bug envolve race conditions, ordem de eventos não-determinística ou estado distribuído, todas as ferramentas patinam. Elas tentam, mas o tempo gasto convencendo a IA da hipótese certa às vezes é maior do que debugar manualmente.

2. **Decisões arquiteturais com trade-offs políticos.** "Vale a pena migrar pra microsserviços?" — IA dá uma resposta livresca. A resposta real depende de time, prazo, dívida técnica e dinâmica de stakeholders. Nenhuma IA conhece o time da empresa.

3. **Code review subjetivo.** IA pega bug, segurança, performance. Não pega "esse abstração tá errada porque vai dificultar a feature que vem depois". Isso ainda é humano.

4. **Lidar com código mal documentado de terceiros.** Quando uma lib open-source tem doc ruim, IA chuta. Às vezes chuta certo. Às vezes inventa funções que não existem.

Em todos esses casos, ainda sou eu fazendo o trabalho, com IA como assistente — não o contrário.

## Conclusão: stack > ferramenta única

Em 2026, escolher "a melhor IA pra programar" virou pergunta errada. A pergunta certa é: **qual stack você monta**.

Minha stack atual é Claude Code como base + Codex pra diversidade + Gemini pelo contexto e free tier. Antigravity tá no radar mas não migrei. Se mudar, conto aqui.

Se você ainda só usa uma — Cursor, Copilot ou só o ChatGPT — vale o experimento de testar pelo menos duas em paralelo numa semana. Custa pouco e revela rápido onde cada uma falha. E falhar com várias ferramentas em mãos é diferente de falhar travado com uma.

E, antes que perguntem: não, eu não recebo nada de nenhuma dessas empresas pra escrever isso. Se receber algum dia, te conto na hora.
