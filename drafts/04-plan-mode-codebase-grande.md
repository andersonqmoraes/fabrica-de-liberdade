---
slug: plan-mode-claude-code-codebase-grande
category: productivity
tags: [claude-code, plan-mode, refactor, codebase, workflow]
targetKeyword: plan mode claude code
readTime: 8
publishedAtOffset: -5
metaTitle: "Plan mode do Claude Code: como uso pra não quebrar codebase grande"
metaDescription: "Plan mode é a feature subestimada do Claude Code. Como uso pra evitar que IA faça besteira em refactor de 1000+ linhas. Workflow real, não tutorial."
---

# Plan mode do Claude Code: como uso pra não quebrar codebase grande

Tem uma feature do Claude Code que pra mim é a mais subestimada de todas: **plan mode**. Quem nunca usou pode parecer chiqueza, mas é o que separa "deixar IA fazer besteira" de "deixar IA realmente trabalhar" em projeto grande.

Esse post é o porquê e o como.

## O problema que plan mode resolve

Imagina o cenário: você pediu pro agente refatorar como autenticação funciona. Codebase tem 50 arquivos que tocam auth. O agente começa a editar. Edita arquivo 1, edita arquivo 2, edita arquivo 5... no arquivo 12 percebe que a abstração não casa e tenta voltar atrás. Aí desfaz pela metade. Aí tenta outra abordagem. Quando você olha 30 min depois, você não sabe **o que ele fez** e nem **o que ainda precisa fazer**.

Isso é dor real. Aconteceu comigo várias vezes antes de aprender a usar plan mode.

## O que é plan mode

Em uma frase: **plan mode é um modo em que o agente só pensa, não age**. Ele lê arquivos, analisa, propõe um plano de execução. Mas não edita, não roda comando destrutivo, não toca em nada do seu trabalho. Você lê o plano, aprova (ou pede ajuste), e só então sai do plan mode pra ele executar.

A separação entre **pensar** e **fazer** é o ponto. Sem plan mode, IA mistura os dois. Você acaba com plano e execução parcial misturados, sem saber onde parou.

## Quando uso plan mode

Não é toda hora. Pra tarefa simples ("renomeia essa variável em todo lugar"), é overkill. Uso plan mode em três cenários:

### 1. Tarefa que toca mais de 5 arquivos

Limite arbitrário, mas funciona. Acima de 5 arquivos, o risco de ele se perder no meio da execução cresce. Com plano, ele sabe onde começa e termina.

### 2. Refactor com decisão arquitetural

Quando a tarefa envolve escolha (dois jeitos de fazer, ambos válidos), plan mode te força a tomar a decisão **antes** do código existir. Em vez de descobrir no meio do refactor que ele escolheu o pior caminho e ter que desfazer tudo.

### 3. Tarefa onde eu não sei o tamanho

Às vezes peço "investiga por que o login tá lento e propõe correção". Pode ser 1 linha. Pode ser 30 arquivos. Plan mode é a forma de descobrir antes de comprometer.

## Como uso na prática — fluxo

Vou descrever o fluxo de um refactor recente, pra ficar concreto.

**Tarefa:** trocar a forma como minha aplicação carregava configuração — de variáveis de ambiente lidas em N lugares pra um config centralizado validado em startup.

**Sem plan mode** (jeito ruim que eu costumava fazer):

> Eu: "centraliza o config em um único lugar e valida no startup"
> Agente: começa a editar, cria `config.ts`, vai trocando refs uma a uma, no meio percebe que tem 3 arquivos que dependem da variável vazia ser válida e quebram, tenta corrigir, edita teste, percebe que mocaram errado...

**Com plan mode** (jeito que eu faço hoje):

> Eu (entro em plan mode): "centraliza o config em um único lugar e valida no startup"
> Agente: lê todos os arquivos que usam env var, mapeia onde cada variável é usada, identifica os 3 arquivos que dependem de string vazia, propõe:
> 1. Criar `src/lib/config.ts` com schema Zod
> 2. Validar no startup com `validateConfig()`
> 3. Trocar 47 referências de `process.env.X` para `config.x`
> 4. Atualizar 4 testes que mockam env
> 5. **Decisão necessária:** os 3 arquivos que dependem de string vazia — você quer falhar no startup se essas variáveis não vierem, ou manter compat com vazio?

Olha. Ele detectou que **eu tinha uma decisão a tomar** antes de tocar em código. Eu decido: "falha no startup, vazio era bug." Aí saio do plan mode. Ele executa. Em 10 min está pronto sem ele ter que desfazer nada.

Sem plan mode, ele teria descoberto a decisão depois de 20 min editando. Aí gastaria mais 20 min desfazendo.

## O comando

Em Claude Code, plan mode é ativado por atalho de teclado ou explicitamente:

- Atalho padrão: você consegue ver no rodapé do CLI
- Explícito: "entra em plan mode" funciona
- Por skill: também dá pra forçar com prompt-skill custom

Em outras ferramentas o equivalente é menos polido, mas existe em Codex e Cursor de formas parecidas. Em Gemini CLI ainda não vi nada equivalente bom.

## Como faço um bom plano sair

O plano que volta da IA depende muito do prompt. Três coisas que aprendi a sempre incluir:

1. **Restrição explícita:** "não toca em `legacy/`, não muda interface pública, não muda comportamento observável" — diga o que NÃO pode mudar
2. **Sucesso definido:** "tarefa concluída quando todos os testes passam e o uso de X em Y for igual a antes" — diga como saber que terminou
3. **Pedido de identificação de decisão:** "se tiver decisão arquitetural a tomar, lista pra eu decidir antes de você executar" — força ele a pensar antes

Sem essas três, o plano vem genérico. Com elas, o plano vem útil.

## Erros que eu vejo

Conversei com outros devs sobre plan mode e vi padrões de erro:

1. **Não ler o plano direito** — pessoa entra em plan mode, vê texto longo, aprova sem ler, é a mesma coisa que não ter usado
2. **Pedir plano de coisa pequena** — gera fricção desnecessária, desestimula uso, abandona
3. **Achar que plano é roteiro fixo** — não é. Quando ele começa a executar e descobre coisa nova, pode (e deve) ajustar. Plano é guia, não contrato.

## E pra quem programa em pair?

Plan mode tem um efeito colateral interessante: ele documenta a decisão. Eu salvo o plano (copio do CLI) e colo num doc do projeto. Daqui a 3 meses, quando alguém pergunta "por que isso foi feito assim?", eu tenho a resposta escrita.

É a closest thing que tenho de "ADR (Architecture Decision Record) gerado automaticamente". Não é perfeito. Mas é melhor do que o nada que eu tinha antes.

## Conclusão

Plan mode é a feature que mais mudou meu uso de Claude Code. Não pelo wow factor — é silenciosa, sem fogos. Mas pela diferença qualitativa em tarefa grande: planejar antes economiza mais tempo do que custa.

Se você usa Claude Code e nunca usou plan mode, faça um experimento. Próxima tarefa que toca 5+ arquivos, ative plan mode antes. Leia o plano. Depois decide se vale. Eu apostaria que vale.
