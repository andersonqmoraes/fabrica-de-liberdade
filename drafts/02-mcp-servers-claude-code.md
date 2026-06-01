---
slug: mcp-servers-claude-code-setup-2026
category: automation
tags: [mcp, claude-code, automation, dev-tools, setup]
targetKeyword: mcp servers claude code
readTime: 8
publishedAtOffset: -2
metaTitle: "MCP servers que rodo no meu Claude Code: setup completo de 2026"
metaDescription: "Quais MCP servers conectei ao meu Claude Code, por que cada um, e os que tirei depois de testar. Setup real de quem usa todo dia, não tutorial copiado."
---

# MCP servers que rodo no meu Claude Code: setup completo de 2026

Se você usa Claude Code mas nunca conectou um MCP server, está deixando metade da ferramenta na mesa.

MCP — Model Context Protocol — é o que transforma o Claude Code de "agente que mexe nos seus arquivos" em "agente que mexe nos seus arquivos, no seu GitHub, no seu banco, no seu navegador e no que mais você plugar". É a porta de entrada pro Claude Code virar uma parte real do seu workflow, não só uma IDE turbinada.

Hoje rodo 6 MCP servers. Já testei mais de 10. Este é o post que eu queria ter lido antes de gastar uma semana descobrindo qual valia a pena.

## O que é MCP, em uma frase

Pensa em MCP como **um padrão pro Claude Code falar com qualquer coisa**. Em vez de cada integração ser custom, MCP define um protocolo. Qualquer serviço que rode um MCP server vira uma ferramenta acessível pelo agente — buscar, ler, escrever, executar.

Eu não vou refazer o tutorial de configuração (a doc oficial faz melhor que eu). Vou direto pros 6 que valem o seu tempo.

## 1. GitHub MCP — o primeiro que você deve ligar

Se você só vai ligar **um** MCP server, ligue esse.

O que ele faz:
- Lê PRs, issues, comments
- Cria branches, abre PRs, comenta
- Lista runs do CI, mostra logs de falhas

Por que importa: você para de pingar entre Claude Code e a aba do GitHub. Mandar "olha o último PR e me diz se tem feedback pra responder" virou conversa natural. Comentários longos de revisão, copio direto. Falhas de CI, vejo sem sair do terminal.

O que ainda me incomoda: ele lista PRs muito devagar quando o repo tem muito tráfego. Não é deal-breaker, mas em monorepo grande dá pra sentir.

## 2. Filesystem MCP além do default

O Claude Code já lê arquivos do diretório atual. O filesystem MCP estendido me deixa ler arquivos de **outros lugares** sem mover nada — `~/Documents/projetos/legacy/`, pasta de notas pessoais, repo de docs.

Caso de uso real do meu dia: tenho um repo separado só com notas técnicas e decisões arquiteturais antigas. Em vez de copiar trechos toda vez, plugei. Agora "olha lá em /Documents/decisões e me lembra por que abandonamos Redis" funciona.

Pegadinha: configure os **diretórios permitidos** explicitamente. O default vem aberto demais. Você não quer o agente sem querer lendo `.ssh/`.

## 3. Postgres MCP — pra debugar query sem trocar de janela

Quando seu trabalho envolve banco, esse MCP economiza minutos toda sessão.

O que faz:
- Conecta a uma database, expõe schema
- Roda queries de leitura (write requer flag explícita)
- Devolve resultados como tabela

Como eu uso: "olha o schema da tabela `users` e me explica por que essa query tá lenta". O agente lê o schema, lê meu código, propõe índice ou refactor. Antes eu fazia isso copiando schema do `psql`, agora ele mesmo busca.

Risco: nunca conecte em produção sem read-only. Sério. Configure o usuário do banco com permissão de leitura e nada mais.

## 4. Brave Search MCP — pesquisa sem sair do terminal

Concorrente do Google Search MCP, mas com plano gratuito mais generoso. Faz pesquisa web e devolve resultados pro agente.

Por que vale: muita "alucinação" de IA é falta de informação atualizada. Plugando search, ele para de chutar versão de lib, datas de release, breaking changes recentes. Pergunta "qual é a versão estável atual do X" passa a ter resposta verificada.

Não substitui StackOverflow ou doc oficial, mas evita o "Claude, esse package não existe mais" — porque agora ele checa antes de propor.

## 5. Slack MCP — só pra times com discussão técnica no Slack

Esse é polêmico. Plugar acesso ao Slack no agente assusta — e deve assustar. Mas se seu time discute decisões técnicas em threads, ter o agente lendo isso é poderoso.

Como uso (com escopo restrito):
- Acesso só aos canais técnicos que eu já leio
- Sem permissão de postar
- Sem leitura de DMs

Pergunta "lê os últimos comentários no #backend sobre a migração e me resume". Ele resume. Eu economizo 15 min de scroll.

Se você é team-of-one, pule este. Se é team de 20+, vale o teste com escopo mínimo.

## 6. Playwright MCP — pra debug de frontend e scraping leve

Eu testei vários "browser MCPs". Esse é o que sobrou.

O que faz:
- Abre página, vê HTML/DOM/console
- Tira screenshot
- Clica, preenche formulário, navega

Uso real: "abre a página local, preenche o form de signup com dados de teste e me mostra o que aparece no console". Antes eu fazia isso na mão. Hoje delego, e o agente me devolve o screenshot + os erros do console.

Limite: tarefas que dependem de UX visual sutil (animações, estados intermediários) ele perde. Pra teste funcional de fluxo, é ouro.

## O que tirei depois de testar

Pra ser justo, lista do que testei e abandonei:

- **Notion MCP** — usei por 2 semanas, mas a latência mata. Sempre demorava demais pra buscar páginas. Voltei pra abrir Notion no navegador.
- **Jira MCP** — funciona, mas Jira é tão lento por natureza que adicionar uma camada piorou. Continuo abrindo Jira na web.
- **Linear MCP** — esse é bom, só não uso Linear no momento. Se você usa, vale.
- **Memory MCP** — confunde mais que ajuda. Em vez de "lembrar" coisas certas, lembra coisas erradas. Tenho meu próprio sistema de memória via skills/hooks.

## Configurando MCP sem se enrolar

3 erros que cometi e você não precisa cometer:

1. **Não configure tudo de uma vez.** Liga 1, usa por 3 dias, vê se mudou seu workflow. Só aí liga o próximo. MCP demais polui o catálogo de ferramentas do agente e atrapalha a escolha dele.
2. **Use escopos restritos.** Cada MCP server permite limitar o que ele pode acessar. Use. Sempre.
3. **Documente no seu CLAUDE.md** quais MCPs você usa e pra quê. O próprio agente lê esse arquivo e fica mais decisivo sobre quando chamar cada um.

## E os MCPs que eu queria existir e ainda não existem

Pra fechar, lista pessoal de MCPs que eu acharia ouro:

- **AWS MCP de verdade** — não os tutoriais, um oficial mantido. Hoje uso CLI bruto no shell, mas tem fricção.
- **MCP de produção do Sentry/Datadog/Honeycomb** — pra debugar incidente sem trocar de janela
- **MCP de banco vetorial pra busca semântica nas minhas notas** — sonho

Se algum dia rolar, atualizo o post. Por enquanto, é com a stack acima que eu vivo.

## Conclusão

MCP não é hype. É a parte do Claude Code que separa "uso de vez em quando" de "vive no terminal".

Comece pelo GitHub MCP. Use por uma semana. Quando sentir que voltar pra aba do GitHub virou fricção, você entendeu o ponto. Aí adiciona o próximo.
