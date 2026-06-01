---
slug: ia-escrever-testes-o-que-delego
category: productivity
tags: [testing, ia, tdd, claude-code, dev]
targetKeyword: ia para escrever testes
readTime: 7
publishedAtOffset: -10
metaTitle: "IA pra escrever testes: o que delego e o que faço na mão"
metaDescription: "Tem coisa que IA escreve teste melhor que eu. Tem coisa que ela ainda erra feio. A linha entre as duas, com exemplos do meu fluxo."
---

# IA pra escrever testes: o que delego e o que faço na mão

Esse é um dos tópicos onde tenho opinião mais firme: **IA pra escrever teste funciona, mas só se você entender quando confiar e quando duvidar**. Se você delega tudo, vai apanhar (já apanhei — contei em outro artigo). Se não delega nada, perde produtividade que não precisa perder.

Esse post é a linha exata que tracei.

## A regra base

Antes dos detalhes, a regra que organiza tudo:

> **Eu defino o comportamento esperado. IA implementa o teste e a fixture.**

Quando você deixa IA definir o comportamento esperado, ela vira juíza do código que ela mesma escreveu — exatamente o erro que descrevi em outro post. Mas se você define expectativa e ela só executa, vira ganho puro de tempo.

Vou desdobrar nas três frentes onde isso muda na prática.

## 1. Teste unitário — delego quase tudo

Função pura, sem efeito colateral, com input e output bem definidos? Delego.

Fluxo:

1. Termino de escrever a função
2. Mando: "escreva testes unitários pra essa função, cobrindo casos felizes, edge cases (vazio, null, valores extremos), e erros esperados"
3. Recebo entre 5 e 15 testes
4. **Leio cada um.** Pergunta crítica: o `expect` está validando comportamento que **eu quero**?
5. Ajusto, removo redundância, adiciono caso que faltou
6. Rodo

Tempo médio antes: 20-40 min escrevendo do zero.
Tempo médio agora: 5-10 min validando.

A maior parte do tempo agora é eu **lendo o teste pra validar**. Não escrevendo.

## 2. Teste de integração — delego com mais cuidado

Teste de integração toca duas ou mais partes do sistema. Banco, fila, cache, API externa. A IA escreve, mas a chance dela escolher mock errado ou setup errado é maior.

Fluxo:

1. Eu escrevo o **setup** (fixtures, mocks, container)
2. IA escreve os casos de teste em cima do setup que eu fixei
3. Eu verifico se ela respeitou o setup ou tentou criar mock paralelo

Onde IA falha aqui: ela tende a criar mocks de coisas que já estão mocadas. Você diz "use o mock global do redis". Ela ignora e cria local. Aí o teste passa por motivo errado.

Por isso o setup vem de mim. Casos vêm dela. Validação vem de mim.

## 3. Teste E2E — quase não delego

E2E tem uma armadilha que IA não percebe: **flakiness**. Teste pode ser correto e ainda assim quebrar 5% das vezes por timing, race, ordem de elementos no DOM. IA escreve teste E2E "correto no papel" que vira pesadelo na prática.

Aqui meu fluxo é o oposto:

1. Eu escrevo o teste E2E na mão
2. Quando estiver estável (passou 10 vezes seguidas no CI), eu peço pra IA escrever variações similares (login com email diferente, com Google OAuth, etc.)
3. As variações herdam o esqueleto estável

Funciona porque o "primeiro" E2E é caro de fazer bem. Mas, uma vez feito, os irmãos saem rápido.

## Onde IA brilha que eu nem esperava

Algumas surpresas positivas que aprendi:

### Brincar com property-based testing

Pedi: "escreva 10 propriedades que essa função deveria sempre satisfazer, e use fast-check pra testar com 1000 inputs aleatórios cada".

Ela escreveu propriedades que eu **não tinha pensado**. Tipo "ordenação dessa lista é estável", "soma é associativa", "função é idempotente". Várias quebraram. Bug que estava escondido vinha à tona.

Property-based testing é exatamente o tipo de coisa que humano cansa de fazer e IA não. Vale ouro.

### Gerar fixtures realistas

"Gera 50 usuários de exemplo com nomes brasileiros plausíveis, idades distribuídas entre 18 e 65, CPFs válidos (algoritmo de verificação), emails únicos."

Em 30 segundos tenho fixture que antes eu copiava de geradores online um a um. Lindo.

### Cobrir branch que eu esqueci

Quando você diz "olha o coverage report e me sugere testes pros branches que não foram cobertos", ela faz e identifica casos legítimos que eu não tinha pensado. Não cobertura por cobertura — cobertura por valor.

## Onde IA me fez perder tempo

Lado feio:

### Inventar comportamento

A função tinha um `return undefined` em caso específico. IA escreveu teste esperando `return null`. Teste passou (porque undefined == null no `expect`). Daí, mais tarde, alguém trocou a implementação pra retornar de fato `null`. Outro teste em outro lugar quebrou — porque dependia do undefined original. O teste "novo" tinha mascarado o problema.

Lição: leia cada expect. Verifique se é o que **a função faz** ou o que **a IA acha que ela deveria fazer**.

### Mocks que mascaram bug

Cenário: testando função que chama API externa. IA mocou o cliente da API com resposta hardcoded sempre. Teste passou em todo cenário. Em prod, a API às vezes retorna 503. Função não tinha tratamento. Caiu em prod.

Lição: pra função que chama serviço externo, force a IA a mocar **vários estados** (sucesso, falha, timeout). Default dela é mocar só sucesso.

### Coverage falsa de mais

Pedi "aumenta a cobertura de testes desse módulo de 60% pra 90%". Ela aumentou. Coverage report ficou lindo. Mas 70% dos testes novos eram triviais — passar instanceof checks, validar tipos óbvios, testar que getter retorna o que setter setou. Coverage sem valor.

Lição: cobertura não é métrica de qualidade. É métrica de exposição. Quando peço cobertura, hoje peço **cobertura de cenários**, não de linhas.

## A heurística que uso pra decidir

Quando uma tarefa de teste cai na minha frente, hoje decido em uns 5 segundos:

- **Função pura, lógica clara** → delega tudo, valida resultado
- **Função com side effect simples** → delega, mas eu defino setup
- **Função que toca rede/banco** → eu defino setup E estados a mocar
- **E2E novo** → eu mesmo escrevo
- **E2E variante de outro estável** → delega
- **Property-based** → sempre delega, sempre vale

## Conclusão

IA pra testes não é "tudo ou nada". É **divisão de trabalho consciente**.

Você define expectativa, IA implementa. Você desenha setup, IA escreve casos. Você escreve E2E base, IA gera variações.

Quando a divisão tá certa, é o melhor uso de IA que eu faço. Quando você quebra a divisão (deixa ela definir expectativa, ou pula validação), vira terreno minado.

Vale pegar 1 hora amanhã pra revisar como você usa IA pra teste hoje. Se está deixando ela definir o que é "certo", muda. Vai mudar tua taxa de bug em prod.
