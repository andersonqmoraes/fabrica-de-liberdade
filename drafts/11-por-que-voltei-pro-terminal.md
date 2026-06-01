---
slug: por-que-voltei-pro-terminal-depois-anos-vscode
category: productivity
tags: [terminal, vscode, neovim, claude-code, workflow]
targetKeyword: terminal vs ide dev
readTime: 6
publishedAtOffset: -16
metaTitle: "Por que voltei pro terminal depois de anos no VS Code"
metaDescription: "Em 2026, terminal voltou a ser meu ambiente principal. Não por moda — por como mudou meu fluxo com IA. O caminho honesto, com volta atrás incluso."
---

# Por que voltei pro terminal depois de anos no VS Code

Em 2018 eu rodava tudo no VS Code. Em 2024, ainda VS Code. Em 2026, **terminal de novo**. Sem ranço, sem snobismo — fui empurrado de volta por mudança em como trabalho com IA.

Esse post é o porquê. Pode te servir, pode não. Mas a história é honesta.

## Como cheguei no VS Code

Pra dar contexto: meus primeiros 5 anos de dev foram em vim (depois Neovim) puro. Eu não tinha IDE. Tudo terminal. Tinha gosto pela coisa minimal.

Em 2018-ish, VS Code virou padrão de mercado. Plugins ricos, debugging gráfico, integração com Docker, extensões pra qualquer linguagem. Eu migrei e fiquei bem por anos. Produtivo, confortável.

Não saí por moda. Em 2024 eu ainda achava VS Code ótimo. O que me empurrou de volta foi específico.

## O empurrão: agente como protagonista

Quando comecei a usar Claude Code de verdade em 2025, percebi um padrão estranho:

- Eu pedia uma tarefa pro agente no terminal
- Ele lia 8 arquivos, editava 5, rodava 3 comandos
- Eu olhava o output rolando no terminal
- O VS Code aberto do lado virou... espectador

A IDE não estava ajudando. O agente fazia tudo. Quando eu queria revisar, abria o terminal. Quando queria ver diff, abria o terminal. Quando queria rodar teste, abria o terminal. **A IDE virou janela onde eu só olhava arquivo entre tarefas**.

Isso me incomodou. Não cabia ter IDE inteira só pra leitura passiva.

## A experiência: 30 dias só no terminal

Resolvi testar: 30 dias em Neovim + tmux + Claude Code, **sem abrir VS Code**.

Primeira semana foi dolorosa. Atalhos enferrujados. Configuração pra lembrar. Plugins novos pra avaliar. Eu trabalhava mais devagar, óbvio.

Segunda semana foi neutra. Já tinha config decente. Workflow começou a engatar. Ainda mais lento que VS Code em algumas coisas, mais rápido em outras.

Terceira semana foi a virada. Comecei a sentir que **trabalhar em terminal com agente é natural**.

## Por que casou

Olhando em retrospecto, três coisas tornaram terminal melhor pro meu fluxo atual:

### 1. O agente é um processo de terminal

Claude Code rouda no terminal. Codex CLI roda no terminal. Gemini CLI roda no terminal. Quando seu agente principal é processo de terminal, o ambiente do terminal vira **homebase**. Pular pra IDE pra editar e voltar pro terminal pra rodar agente vira tax.

No vim, o agente fica num pane do tmux do lado. Eu vejo ele trabalhando enquanto edito. Quando termina, eu já estou onde preciso estar.

### 2. tmux é multi-agente nativo

Quero dois agentes trabalhando em paralelo? Dois panes. Quero um agente em tarefa longa e outro em pequena? Janelas separadas. Quero recuperar sessão depois de fechar laptop? `tmux attach`.

No VS Code eu até consigo ter dois terminais. Mas a ergonomia de gerência (criar, navegar, persistir) é bem inferior ao tmux puro. Em terminal eu domino isso há anos. Era retomar capacidade que eu já tinha.

### 3. Edição como ato deliberado

Aqui é meio filosófico. No VS Code, todo arquivo aberto convidava edição: clique, digite, salvo. Comportamento de baixa fricção.

No vim, abrir, editar e fechar arquivo é mais deliberado. Cada operação é comando. Isso me fez **decidir mais** sobre quando eu mesmo edito vs. quando peço pro agente.

Conclusão prática: eu deixei o agente editar mais coisa. Eu mesmo só edito quando tem decisão. Isso me ajudou. Menos toggle entre eu e ele.

## O que perdi

Vou ser honesto sobre o que VS Code fazia melhor e que eu sinto falta:

### Debugging gráfico

VS Code com debugger gráfico (breakpoints clicáveis, watch panel visual, step in/out com botão) é melhor que `dlv`, `pdb`, ou `node --inspect` no terminal. Sem comparação.

Adaptação: hoje uso menos debugger interativo. Mais log estratégico. Em casos raros, ainda abro VS Code só pra sessão de debug.

### Refactor em larga escala via UI

"Rename symbol em todo projeto" do VS Code é mágico. Em terminal eu uso sed, treesitter, LSP commands — funciona, mas exige montar comando.

Adaptação: peço pro agente fazer. Tipo de tarefa que delego sem pestanejar.

### Onboarding de projeto novo

Pra entrar em projeto que não conheço, VS Code com extensão certa te dá overview rápido. Vim/terminal exige mais cerimônia.

Adaptação: skill `/explain-tree` no Claude Code (descrita em outro post). Dá overview em 2 min.

## O setup atual

Pra quem quiser replicar (ou só conhecer):

- **Editor:** Neovim com config minimalista (lazy.nvim, telescope, treesitter, LSP)
- **Multiplexer:** tmux com sessões persistentes por projeto
- **Agente:** Claude Code, com sessões mantidas em panes dedicados
- **Git UI:** lazygit, único quase-GUI que mantive
- **Diff:** delta (substituto de pager pra git)
- **Search:** ripgrep + fzf

Setup deliberadamente enxuto. Cada pedaço tem propósito claro. Quando algo vira ruído, removo.

## Quando eu ainda abro VS Code

Não é dogma. Casos onde uso:

- **Debug com breakpoint visual** numa investigação complexa
- **Pair programming com colega que usa VS Code** — Live Share é joia
- **Abrir notebook Jupyter** — em terminal funciona, mas em VS Code é mais confortável
- **Quando estou cansado e quero "modo fácil"** — sem julgamento, dia ruim acontece

Acho saudável não ser fundamentalista. Ferramenta é meio, não fim.

## Pra quem isso pode não servir

Vou ser justo: terminal first não é pra todo dev.

Não recomendo se:

- Você está começando como dev (overhead cognitivo demais)
- Seu time todo usa IDE e você precisa compartilhar setup
- Seu trabalho principal é frontend com hot reload visual (terminal sofre nisso)
- Você não se diverte com config de ambiente — terminal exige curadoria contínua

Se algum desses te descreve, fica em VS Code/JetBrains tranquilo. Eu mesmo recomendaria.

## Conclusão

Voltei pro terminal porque a forma como trabalho mudou. O protagonista não é mais a IDE — é o agente. E o agente vive no terminal.

Não é nostalgia, não é puritanismo. É ergonomia atual do meu fluxo. Pode mudar de novo. Se em 2027 o Antigravity (ou sucessor) virar inevitável e melhor, eu volto. Sem orgulho.

Ferramenta serve o trabalho. Quando o trabalho muda, a ferramenta deveria mudar também. Foi o que aconteceu comigo.
