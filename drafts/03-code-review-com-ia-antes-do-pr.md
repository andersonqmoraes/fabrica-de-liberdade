---
slug: code-review-com-ia-antes-do-pr
category: productivity
tags: [code-review, claude-code, workflow, pr, git]
targetKeyword: code review com ia
readTime: 7
publishedAtOffset: -3
metaTitle: "Code review com IA antes de abrir o PR: meu fluxo em 2026"
metaDescription: "Como faço code review com Claude Code antes do PR ir pra revisão humana. Resultado: PRs aprovados mais rápido, menos vergonha nos comments, e menos retrabalho."
---

# Code review com IA antes de abrir o PR: meu fluxo em 2026

Existe um ritual simples que mudou meu output como dev nos últimos 6 meses: **antes de abrir qualquer PR, eu rodo code review com IA primeiro**. Não substitui revisão humana. Mas economiza absurdamente os comments óbvios que eu deveria ter visto sozinho.

Esse post é o fluxo que eu uso hoje, em detalhe. Funciona pra mim. Não promete milagre.

## Por que isso importa

Code review humano custa caro. Custa tempo do revisor, custa contexto pra você (que volta depois de horas), e custa atrito quando vira ping-pong de comentários.

A maioria dos comments que eu recebia no passado eram coisas que eu **deveria** ter visto sozinho:
- "Esse if pode virar early return"
- "Tem código duplicado entre A e B"
- "Faltou tratar esse caso"
- "Variável com nome ruim"
- "Esse log expõe info sensível"

Coisas que eu **vejo** quando reabro o diff dois dias depois. Mas no calor do desenvolvimento, escapam. O que IA faz bem é ser esse "eu de dois dias depois" — agora, sem esperar.

## O fluxo, passo a passo

### Passo 1: ainda na branch, antes do commit

Quando termino a feature, **antes de commitar**, rodo o code review.

No Claude Code, tenho uma skill personalizada chamada `/review`. Ela faz exatamente o que faria um colega experiente olhando seu diff:

- Lê o `git diff` da branch atual contra a main
- Identifica bugs, problemas de segurança, e ineficiências
- Sugere refatorações que reduzem complexidade
- Reporta findings em ordem de severidade

Não é check automatizado. É revisão semântica. O agente entende **o que** o código tenta fazer e questiona se está sendo feito bem.

### Passo 2: triagem dos findings

A IA vai me devolver entre 3 e 15 pontos. Eu trio rápido:

- **Aceito e corrijo agora** (a maioria — 60%)
- **Aceito mas não vou fazer aqui** (escopo do PR — anoto pra outro PR)
- **Discordo** (15-20% — IA às vezes inventa problema)
- **Não entendi** (volto e peço pra ela explicar)

A regra mental: se ela disse algo e eu olhei e fui "isso é justo", corrijo. Se foi "isso tá errado, a IA não entendeu", deixo. Eu sou o responsável final pelo código.

### Passo 3: segundo passe com foco diferente

Depois do primeiro round, peço um passe específico:

- "Olha de novo só pensando em **segurança**"
- "Olha de novo só pensando em **performance em escala**"
- "Olha de novo só pensando em **API pública** — algo que eu não deveria expor?"

Esse passe segmentado pega coisas que o review genérico perde. Um review "olha tudo" tende a achar tudo médio. Um review "só segurança" acha falhas que estavam escondidas.

### Passo 4: agora sim, abro PR

Commit, push, abro PR. No corpo do PR, incluo:

```
## O que mudei
[descrição]

## Pre-review com IA
- Já passei por code review com Claude Code antes de abrir.
- Findings que aceitei: [lista]
- Findings que rejeitei e por quê: [lista]
```

Por que documentar isso: o revisor humano sabe que coisas óbvias já foram cobertas. Ele pode focar no que **só humano vê** — decisões de arquitetura, impacto em outros times, ergonomia da API.

## O que IA pega bem

Em ordem de força:

1. **Bug de borda** — null check faltando, off-by-one, await esquecido
2. **Código duplicado** — vê padrão repetido em arquivos diferentes
3. **Naming ruim** — apontando que `data` ou `info` poderia ser mais específico
4. **Log/erro com info sensível** — token, password, PII vazando em log
5. **Early return** — quando aninhamento de if vira piramide
6. **Tratamento incorreto de erro** — engolir exception, retornar status errado
7. **Dependências desatualizadas no patch** — esquecimentos no package.json

## O que IA NÃO pega bem

Importante saber:

1. **"Esse design tá errado"** — não tem visão de produto, não conhece o sistema todo
2. **"Isso vai dificultar a feature do próximo sprint"** — não sabe do roadmap
3. **"O time não usa esse padrão"** — não conhece convenções não-escritas
4. **"Esse trade-off de complexidade não vale"** — pesa código, não pesa tempo de manutenção real
5. **"Isso vai gerar bug em produção em concorrência"** — race conditions sutis ela perde

Por isso continua precisando de humano. IA é o filtro do óbvio, humano é o filtro do estratégico.

## A skill que uso (resumo)

Pra quem quer replicar, o esqueleto da minha `/review` skill é mais ou menos:

```
1. Roda `git diff main...HEAD --stat` pra ver o tamanho
2. Roda `git diff main...HEAD` pra ver o conteúdo
3. Lê arquivos modificados pra ter contexto
4. Aplica checklist em camadas:
   - Correctness (bugs, edge cases)
   - Security (input validation, secrets, auth)
   - Quality (naming, complexity, duplication)
   - Performance (loops desnecessários, query N+1)
5. Reporta findings com:
   - Arquivo:linha
   - Severidade (high/medium/low)
   - Sugestão concreta
```

Custom skills em Claude Code são lindas. Em 50 linhas de markdown você define um workflow inteiro.

## Erros comuns ao adotar isso

Vejo três armadilhas que pessoas caem:

1. **Confiar demais.** Se IA disse "tá tudo bem", você ainda tem que olhar. Ela não pega tudo.
2. **Aceitar todo finding sem questionar.** Você vira refém da opinião dela. Mantenha sua autoria.
3. **Pular a revisão humana.** O fluxo é "IA depois humano", não "IA em vez de humano". Times que pularam revisão humana e adotaram só IA tiveram acidentes em produção. Recebi reportagem disso de dois conhecidos.

## Resultado real

Sem números fictícios — vou só descrever a mudança qualitativa:

- Recebo menos comments de coisas óbvias
- Recebo mais comments **úteis** sobre design
- Outro lado sente que está revisando código que recebeu atenção
- Eu mesmo me sinto menos exposto abrindo PR

Esse último é subestimado. Não é vergonha. É **dignidade profissional**. Abrir PR sabendo que você fez tudo que era razoável fazer antes vale o tempo extra do fluxo.

## Conclusão

Se você usa Claude Code (ou Codex, funciona igual), invista 1h pra montar uma skill de review e teste por 2 semanas. Se não mudar nada, descarta. No meu caso, virou parte do meu fluxo padrão e não voltaria.
