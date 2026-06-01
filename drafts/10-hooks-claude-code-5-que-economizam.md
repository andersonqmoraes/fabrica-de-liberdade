---
slug: hooks-claude-code-5-que-economizam-horas
category: automation
tags: [claude-code, hooks, automation, settings, dev-tools]
targetKeyword: hooks claude code
readTime: 7
publishedAtOffset: -14
metaTitle: "Hooks do Claude Code: 5 que economizam horas por semana"
metaDescription: "Hooks do Claude Code são automation invisível. As 5 que rodo no meu setup, com snippet pra você copiar."
---

# Hooks do Claude Code: 5 que economizam horas por semana

Hooks do Claude Code são silenciosos. Você configura uma vez no `settings.json` e eles rodam toda vez que evento certo dispara. Sem você lembrar. Sem você executar.

E é exatamente por isso que ninguém fala deles: hook bom é hook que você esquece. Mas economizam horas reais. Compartilho aqui as 5 que rodo no meu setup, com snippet pronto.

## O que é hook, em 3 linhas

Hook é comando shell que roda em resposta a evento no Claude Code: antes de uma ferramenta executar, depois, no fim de sessão, etc. Você configura em `settings.json` na chave `hooks`. Cada hook tem um trigger (qual evento) e uma ação (comando shell).

A doc oficial cobre a sintaxe. Vou direto pros 5 úteis.

## Hook 1: `format on edit`

O mais simples e mais útil.

**O que faz:** toda vez que o agente edita um arquivo, roda formatter (Prettier, Black, gofmt — o que você usa) automaticamente.

**Por que importa:** você para de ter PR com 50 mudanças de formatação misturadas com 5 mudanças de lógica. Formato sempre consistente, diff sempre limpo.

**Snippet** (exemplo conceitual — sintaxe exata depende da versão):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write $CLAUDE_FILE_PATH"
          }
        ]
      }
    ]
  }
}
```

Em projetos com lint-staged, dá pra refinar mais ainda. Mas até essa versão simples elimina 80% da dor.

## Hook 2: `auto-commit incremental`

Esse muda comportamento. Pode não ser pra você. Eu adoro.

**O que faz:** ao final de uma sessão (ou em intervalo), commita o que mudou com mensagem genérica tipo "wip: claude code session 2026-05-30".

**Por que importa:** sessões longas com agente tendem a acumular mudança não-commitada. Se algo dá errado, você perdeu. Auto-commit cria pontos de salvamento.

Depois eu re-organizo histórico com `git rebase -i`. Mas o salvamento contínuo vale ouro.

**Snippet** (esqueleto):

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "git add -A && git diff --cached --quiet || git commit -m 'wip: claude session'"
          }
        ]
      }
    ]
  }
}
```

Cuidado: só ative isso em branch de trabalho, nunca na main. Eu deixo um pre-hook adicional que valida que `$(git branch --show-current)` não é main.

## Hook 3: `test on save de teste`

**O que faz:** quando o agente edita arquivo de teste, roda só aquele arquivo de teste e reporta resultado.

**Por que importa:** feedback loop curto. Em vez de "agente edita 5 testes, depois roda tudo no fim", você sabe na hora qual edição quebrou qual teste.

**Snippet:**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ $CLAUDE_FILE_PATH == *.test.* ]]; then npx vitest run $CLAUDE_FILE_PATH || echo 'test failed'; fi"
          }
        ]
      }
    ]
  }
}
```

Performance: rodar 1 teste de 50ms é desprezível. Só evite ativar isso em codebase onde teste demora 30s pra subir contexto — aí mais atrapalha que ajuda.

## Hook 4: `block edits em arquivos sensíveis`

**O que faz:** bloqueia edição em arquivos que você não quer que o agente toque (`.env`, segredos, configurações de produção).

**Por que importa:** **segurança**. Você reduz o blast radius do agente. Mesmo que ele "decida" mexer em algo crítico, o hook bloqueia.

**Snippet** (esqueleto — eu uso lógica em script separado):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ $CLAUDE_FILE_PATH =~ \\.(env|secret|prod\\.json)$ ]]; then echo 'blocked'; exit 1; fi"
          }
        ]
      }
    ]
  }
}
```

Quando o hook retorna exit code 1, o Claude Code para. Você é forçado a editar manualmente esses arquivos.

Eu tenho regra parecida pra `package.json` em alguns projetos — quero ser eu quem mexe em dependências, não o agente.

## Hook 5: `notify ao terminar tarefa longa`

**O que faz:** quando uma sessão termina (Stop), dispara notificação visual no sistema.

**Por que importa:** tarefa longa eu faço outra coisa enquanto IA trabalha. Ter aviso "terminou" me deixa não checar de 5 em 5 minutos.

**Snippet** (macOS — adapte pro seu sistema):

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code finalizou\" with title \"CC\"'"
          }
        ]
      }
    ]
  }
}
```

Em Windows uso PowerShell + `BurntToast`. Em Linux, `notify-send`. Adapte.

## Hooks que testei e abandonei

Por honestidade:

- **Auto-typecheck a cada edit:** muito caro em projeto TS grande. Lento, perdia mais tempo do que ganhava.
- **Auto-deploy a cada commit:** muito agressivo. Acabou subindo coisa quebrada algumas vezes. Deploy ficou manual e ficou bem assim.
- **Auto-summary a cada N tool calls:** poluía contexto. Removi.

A regra que tirei: hook tem que ser **leve, idempotente, e ter saída clara**. Hook que demora 5s vira fricção. Hook que faz coisa não-determinística (auto-deploy) vira risco. Hook bom é invisível e instantâneo.

## Como debugar hook quando não funciona

3 dicas que poupei muito tempo:

1. **Roda manualmente primeiro.** Antes de colocar no hook, roda o comando no shell pra ver se funciona. Maioria dos bugs é o comando, não o hook.
2. **Confira que as env vars do hook batem.** `$CLAUDE_FILE_PATH`, `$CLAUDE_TOOL_NAME` etc. mudam de versão pra versão.
3. **Use `set -x` em scripts shell.** Ativa traçado de execução. Em hook que falha silenciosamente, esse é o caminho.

## Conclusão

Hooks são o atalho pra ter ferramenta personalizada sem escrever código. 5 hooks bem feitos economizam horas por semana sem você reparar.

Comece com `format on edit`. Em 1 dia você vai sentir falta quando estiver em projeto onde não tem. Depois adicione os outros conforme dor real aparecer. Hook adicionado por dor é hook usado. Hook adicionado por hype vira ruído.
