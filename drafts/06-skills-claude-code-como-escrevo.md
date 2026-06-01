---
slug: skills-claude-code-como-escrevo-as-minhas
category: automation
tags: [claude-code, skills, automation, customization, dev-tools]
targetKeyword: claude code skills
readTime: 9
publishedAtOffset: -8
metaTitle: "Skills do Claude Code: como escrevo as minhas em 2026"
metaDescription: "Tutorial prático de skills do Claude Code. As 4 que escrevi pro meu workflow, padrão que uso, e por que skills são a feature mais subestimada pra produtividade real."
---

# Skills do Claude Code: como escrevo as minhas em 2026

Se hooks são o que fazem o Claude Code reagir a eventos, **skills** são o que fazem ele saber **como fazer** algo bem. Cada skill é tipo um cookbook focado: "quando o usuário pedir X, siga estes passos, use estas ferramentas, evite estes erros".

E o mais importante: skills são fáceis de escrever. Markdown puro. 50 linhas. Mudou meu workflow.

## O que é uma skill, exatamente

Em uma frase: skill é um arquivo `.md` que dá ao Claude Code instruções específicas pra um tipo de tarefa.

A estrutura básica:

```markdown
---
name: minha-skill
description: O que essa skill faz, em uma frase
---

# Como executar [tarefa]

[Passos, regras, exemplos]
```

Quando o Claude Code identifica que sua mensagem casa com a `description`, ele carrega o conteúdo da skill e segue. É como ter um colega especialista em uma tarefa específica, pronto pra ser invocado.

## As 4 skills que escrevi e uso todo dia

### 1. `/review` — code review antes do PR

Já mencionei essa em outro artigo. É a que mais uso. Trecho do esqueleto:

```markdown
# Code review

Quando o usuário pedir `/review`:

1. Rode `git diff main...HEAD --stat` pra ver tamanho
2. Rode `git diff main...HEAD` pra ver conteúdo
3. Liste arquivos modificados; leia os que mudaram >20 linhas
4. Aplique este checklist em camadas:
   - Correctness: bugs, edge cases, null checks
   - Security: input validation, secrets em log
   - Quality: naming, complexity, duplicação
   - Performance: loop desnecessário, query N+1
5. Reporte findings com:
   - Arquivo:linha
   - Severidade (high/medium/low)
   - Sugestão concreta

Não comente sobre estilo (linter cuida).
Não sugira "considere refatorar" sem proposta concreta.
Findings sem severidade não contam — sempre marque.
```

Quando rodo `/review`, ele segue isso à risca. Antes da skill, code review com IA dava resultado errático — às vezes nitpicker demais, às vezes superficial. Com skill, é consistente.

### 2. `/ship` — checklist de release

Pra deploys, tenho uma skill que faz:

```markdown
# Ship

Quando o usuário pedir `/ship`:

1. Verifique branch atual e que tem commits ahead da main
2. Rode `npm run build` e reporte erros
3. Rode `npm test` e reporte falhas
4. Rode `npm run lint` se existir
5. Liste arquivos modificados — pergunte se algum exige migração de DB
6. Liste env vars novas — pergunte se foram adicionadas no Vercel/secret manager
7. Confirme: posso fazer push?

Não rode push sem confirmação humana.
Não pule etapas mesmo que o usuário insista.
```

Antes dessa skill, eu esquecia coisa óbvia em deploy (env var não setada, migração não rodada). Hoje rodo `/ship` e tenho confiança que o checklist passou.

### 3. `/explain-tree` — entender repo desconhecido

Toda vez que eu pego um projeto novo, primeira coisa que faço é `/explain-tree`. Skill:

```markdown
# Explain tree

Quando o usuário pedir `/explain-tree`:

1. Rode `ls -la` no root
2. Identifique tipo de projeto (Next, Django, Go, etc.)
3. Liste pastas principais e diga o que cada uma é
4. Identifique:
   - Onde fica a entry point
   - Onde fica configuração (env, config files)
   - Onde fica os testes
   - Onde fica o build/deploy
5. Liste 3 "perguntas que um novo dev deveria fazer pra entender mais"
6. Crie um resumo de 5 parágrafos

Não invente arquitetura. Se algo não está claro, diga que não está claro.
```

Em 2 minutos eu tenho mapa do repo. Antes eu gastava 20-30 min navegando pasta a pasta.

### 4. `/explica-bug` — debug guiado

Pra debug de problemas que recebo do suporte:

```markdown
# Explica bug

Quando o usuário pedir `/explica-bug` com descrição:

1. Identifique sintoma (o que o usuário viu)
2. Liste 3 hipóteses por ordem de probabilidade
3. Pra cada hipótese:
   - Como confirmaria? (log, query, repro local)
   - Onde no código ela cairia?
4. Pergunte qual hipótese investigar primeiro
5. Quando confirmada, mapeie a correção e o teste que previne regressão

Não pule pra solução sem confirmar hipótese.
Não proponha "logging mais" como solução — proponha a investigação.
```

Essa muda meu padrão de pensar bug. Em vez de tentar resolver na cara, paro e enumero hipóteses.

## Como sei que vale a pena criar uma skill

Regra que uso: **se eu estou explicando a mesma coisa 3 vezes pro Claude Code, vira skill**.

Toda vez que percebo "ah, mas você sempre esquece de fazer X em casos assim", aí é gatilho pra skill. Skill é literalmente o lugar onde você fixa lições aprendidas.

Outra regra: se uma tarefa tem **checklist mental** que você sempre segue, vira skill. Checklist é skill esperando pra ser escrita.

## Erros comuns ao escrever skill

Vi (e cometi) três:

### 1. Skill muito vaga

```markdown
# Refactor

Quando pedir refactor, refatore o código pra ficar melhor.
```

Isso não é skill, é placebo. Não muda nada. Skill precisa ter **passos concretos** ou **regras explícitas** que mudem o comportamento.

### 2. Skill muito longa

Skill de 500 linhas vira documentação. Agente carrega isso e fica enrolado. Mantenha skill em < 100 linhas. Se precisar mais, divida em duas.

### 3. Skill que duplica comportamento padrão

Se a tarefa é algo que Claude Code já faz bem por default, skill não agrega — só polui o catálogo. Skill é pra tarefa em que comportamento default é ruim ou inconsistente.

## Padrão que sigo

Pra cada skill nova que escrevo, sigo essa estrutura mental:

1. **Trigger** — qual frase do usuário ativa essa skill?
2. **Passos** — qual sequência produz o melhor resultado?
3. **Anti-padrões** — o que NÃO fazer? (mais importante do que parece)
4. **Critério de sucesso** — como sei que terminei?
5. **Output esperado** — que formato a resposta deve ter?

Os anti-padrões são o que mais polem a skill ao longo do tempo. Toda vez que ela faz algo que eu não gosto, adiciono "não faça X" no anti-padrão. Em 2-3 iterações, ela já tá afiada.

## Onde guardo as skills

Tenho um repo git separado só pras minhas skills, sincronizado entre máquinas. Quando ajusto uma skill, commito. Daqui a 6 meses, vejo o `git log` e meio que reconheço minha evolução como dev.

Tem skill que tirei e voltei a usar. Tem skill que matei porque virou obsoleta. Tudo no histórico. É um forma diferente de documentar como eu trabalho.

## E se eu não usar Claude Code?

Em Codex CLI tem conceito parecido (custom prompts), menos polido. Em Gemini CLI ainda não vi nada bom equivalente. Em Cursor tem `.cursorrules` que cumpre função parecida pra regras globais, mas falta a granularidade de "skill por tarefa".

Funcionalmente, qualquer ferramenta com sistema de prompts customizáveis dá pra emular skill. Mas a estrutura de skills do Claude Code é a mais elegante que eu vi até agora.

## Conclusão

Skills são onde você materializa **como você gosta de trabalhar** dentro da IA. Cada skill que você escreve te aproxima de ter um colaborador que pensa como você.

Se você usa Claude Code e ainda não tem skill, escreva uma. Pega uma tarefa que você faz toda semana e que sempre tem que explicar pro agente. Vira skill. Em 1 mês você terá 4-5 skills úteis e seu fluxo vai ter mudado significativamente. Garanto.
