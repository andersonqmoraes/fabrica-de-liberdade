---
slug: 5-vezes-que-ia-me-fez-perder-tempo
category: ai-tools
tags: [ia, claude-code, falhas, lições, dev]
targetKeyword: ia perda de tempo dev
readTime: 6
publishedAtOffset: -7
metaTitle: "5 vezes que IA me fez perder tempo (e o que aprendi com cada uma)"
metaDescription: "Não é tudo flores. 5 episódios reais em que confiar em IA pra código custou caro — e as regras que tirei pra não repetir."
---

# 5 vezes que IA me fez perder tempo (e o que aprendi com cada uma)

A maioria dos posts sobre IA pra dev é "olha como sou produtivo". Esse aqui é o oposto: cinco vezes que eu confiei na IA, me dei mal, e o que aprendi pra não repetir.

Por que escrever isso? Porque a parte ruim raramente vira post. Você vê "automatizei X em 20 min com Claude Code" e pensa que é sempre assim. Não é. Pra cada caso bom tem uns dois ruins que ninguém conta. Vou contar.

## 1. A função que não existia

Pedi pro agente refatorar um trecho que usava uma lib que eu não conhecia bem. Ele me sugeriu uma função da lib que se encaixava lindo. Implementei. Não compilou. Fui na doc pra ver assinatura — a função **não existia**. Ele tinha inventado.

Total de tempo perdido: ~25 minutos entre implementar, debugar erro de import e perceber que era hallucination.

**Lição:** quando IA propõe usar função de lib que você não conhece, **abra a doc oficial e confirme antes de codar**. Não é desconfiança neurótica — é higiene. A taxa de invenção de função em libs menos populares é maior do que parece.

Hoje eu plugei MCP de busca web ao Claude Code justamente pra reduzir isso. Ele pesquisa antes de chutar. Diminuiu, mas não zerou.

## 2. O test que passou porque era mentira

Pedi pra IA escrever testes pra um módulo de cálculo de preço. Ela escreveu 12 testes. Rodei. Passaram todos. Lindo.

Uma semana depois, deploy em produção. Bug. Cálculo errado em cenário específico. Fui ver os testes que "cobriam" aquele cenário: o agente tinha escrito o **teste e a implementação juntos** e o teste estava verificando o comportamento errado como se fosse o correto. Os testes não estavam validando a regra de negócio — estavam validando o código que ele mesmo escreveu.

Total perdido: o bug em produção + 1 dia de fire-fight + retrabalho dos testes.

**Lição:** **escreva (ou escreva pra IA) o teste primeiro, com o resultado esperado calculado por VOCÊ, antes de gerar a implementação**. Tipo TDD clássico, com IA como executor. Quando você deixa IA escrever teste e código juntos, ela vira juíza do próprio caso.

Hoje: nunca peço "escreva testes pra esse código". Peço "escreva implementação pra passar esses testes que **eu defini**".

## 3. O refactor que mudou comportamento sutil

Tarefa: "refatora essa função pra ficar mais limpa". Função tinha uns 80 linhas, vários if/else aninhados. Agente fez um refactor lindo, virou 25 linhas, lógica clara. Mergei.

Três dias depois, suporte reporta: cliente teve um caso onde a função se comportou diferente. Investigando, percebi que no aninhamento original havia um `else if` que dependia de **ordem de avaliação**. No refactor "limpo", o agente reorganizou em ordem diferente. Lógica equivalente em 99% dos casos. Mas em 1% — o tal cenário do cliente — não.

**Lição:** **refactor sem testes que cubram comportamento subtil é roleta**. Quando código velho tem 80 linhas de if/else, geralmente tem decisão escondida em ordem. IA não detecta isso só lendo. Antes de refatorar legacy assim, escreva teste que caracterize o comportamento atual primeiro. Aí refatora. Se algum teste quebrar no novo, você sabe o que mudou.

Hoje: pra refactor de legacy, primeiro `git log -p` pra ver histórico e entender por que tá daquele jeito. Depois testes de caracterização. Depois refactor. Demora mais. Mas não me machuca em produção.

## 4. A migração de versão "trivial"

Lib que eu uso lançou versão major nova. Pedi pra IA: "migra esse projeto pra versão Y, segue o changelog". Ela leu, fez as mudanças, rodou os testes, passou. Subi pra staging.

Em staging, um endpoint passou a retornar 500 em produção sob carga. Bug não detectado por testes unitários. Investigando: a nova versão da lib mudou o comportamento de **timeout default**. Antes era 30s, agora é 5s. Endpoint que dependia de outro serviço lento começou a estourar.

**Lição:** migração major não é só "ler changelog e mudar API". É **rodar carga real em staging** antes de prod. IA segue o changelog formal e perde o que não está escrito (defaults, comportamento implícito sob carga).

Hoje: depois de qualquer migração major, eu rodo um teste de carga em staging antes. Nem que seja com k6 simples. Pega 90% desses casos.

## 5. O "isso é simples, deixa eu fazer rápido"

Esse é o mais embaraçoso. Tarefa trivial: mudar string de log. Pedi pro agente. Ele alterou. Eu olhei rápido, deu commit, push.

10 min depois, deploy quebrou. Log que eu pedi pra alterar era usado num parser de log do nosso pipeline de observabilidade. Mudei o formato, parser quebrou, alertas pararam de funcionar. Descobri 2h depois, na hora do incidente real (em que os alertas que deveriam disparar não dispararam).

**Lição:** **nenhuma mudança é "trivial" se você não verificou onde é usado**. IA não tem visão dos sistemas downstream. Mudar log que vira métrica é tão grave quanto mudar API pública. A trivialidade aparente é o que te pega.

Hoje: pra qualquer mudança em log/métrica/evento, eu busco o nome do log no codebase inteiro antes. Tem MCP de search code que faz isso fácil. Pega quem depende do formato antes que vire incidente.

## O padrão por trás de tudo

Olhando os 5 episódios em conjunto, o padrão é o mesmo: **eu pulei verificação porque IA acelerou a entrega**. Em cada caso, se eu tivesse gastado 5 minutos a mais verificando, teria evitado horas (e às vezes dias) de fire-fight.

A IA não é a culpada. **Eu** confiei demais. A IA é ferramenta poderosa, e ferramenta poderosa amplifica resultado — bom **e** ruim. Quando você acelera com martelo, você martela melhor e martela seu dedo mais rápido.

## Regras que adotei depois

Resumo do que mudei no fluxo:

1. **Função de lib menos popular:** sempre abro doc oficial antes
2. **Testes:** eu defino expectativa, IA implementa pra passar
3. **Refactor de legacy:** caracterização primeiro, depois mexer
4. **Migração major:** carga em staging antes de prod
5. **Mudança em log/métrica/evento:** busca downstream antes

Nenhuma dessas regras é nova. Todas são higiene básica de dev sênior. Mas IA me fez relaxar nelas porque "agora vai rápido". O preço foi os 5 episódios acima.

## Conclusão

IA aumenta velocidade. Mas velocidade sem freio é como esportivo sem ABS — funciona até dar errado.

Esses cinco episódios me custaram caro. Compartilho pra você não pagar o mesmo preço. Se você está usando IA pra programar e ainda não teve nenhum desses, ou você tá começando agora, ou tem disciplina muito acima do que eu tinha. Aposto que é o primeiro.
