# 🏭 Fábrica de Liberdade — Guia Completo de Setup

## STACK TECNOLÓGICO
- **Frontend/CMS**: Next.js 14 (App Router, TypeScript)
- **Estilo**: Tailwind CSS (tema dark premium)
- **Banco de dados**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Storage**: Firebase Storage
- **Multilinguagem**: next-intl (PT-BR, EN, ES)
- **Automação**: Python + Anthropic (Claude) + OpenAI (DALL-E)
- **Deploy**: Vercel (recomendado) ou Hostgator (static export)

---

## PASSO 1 — Instalar dependências

```bash
npm install
# ou
npm install --legacy-peer-deps
```

---

## PASSO 2 — Configurar Firebase

1. Acesse https://console.firebase.google.com
2. Crie um projeto: `fabricadeliberdade`
3. Ative **Firestore Database** (modo produção)
4. Ative **Firebase Auth** → Email/Password
5. Ative **Firebase Storage**
6. Vá em Configurações do Projeto → Seus apps → Web app
7. Copie as credenciais

---

## PASSO 3 — Variáveis de Ambiente

Copie o arquivo de exemplo e preencha:

```bash
cp .env.example .env.local
```

Preencha com suas credenciais:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_chave
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc

ANTHROPIC_API_KEY=sk-ant-...    # Para geração de conteúdo
OPENAI_API_KEY=sk-...           # Para imagens DALL-E 3

NEXT_PUBLIC_SITE_URL=https://fabricadeliberdade.com.br
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXX
```

---

## PASSO 4 — Criar Admin no Firebase

No console do Firebase:
1. Authentication → Users → Add User
2. Email: seu@email.com
3. Senha: sua senha forte

---

## PASSO 5 — Rodar localmente

```bash
npm run dev
```

Acesse:
- **Site**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

---

## PASSO 6 — Deploy

### Opção A — Vercel (RECOMENDADO — grátis + todos os recursos)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente no dashboard da Vercel
```

Vantagens:
- ✅ SSR/ISR completo
- ✅ Edge functions
- ✅ Deploy automático via GitHub
- ✅ Grátis para projetos pessoais

### Opção B — Hostgator (Static Export)

1. No `next.config.ts`, descomente `output: 'export'`
2. Em `next.config.ts`, descomente `unoptimized: true` nas images
3. Build:
   ```bash
   npm run build
   ```
4. Faça upload da pasta `out/` via FTP para `public_html/`
5. Configure o `.htaccess`:
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

---

## PASSO 7 — Configurar Domínio

1. Compre `fabricadeliberdade.com.br` no Registro.br
2. Apontamento de DNS:
   - **Vercel**: Adicione o domínio no dashboard → configure nameservers
   - **Hostgator**: Já vem configurado

---

## PASSO 8 — Google Search Console

1. Acesse https://search.google.com/search-console
2. Adicione propriedade: `https://fabricadeliberdade.com.br`
3. Verifique via meta tag (adicione no layout.tsx)
4. Submeta o sitemap: `https://fabricadeliberdade.com.br/api/sitemap`

---

## PASSO 9 — Google AdSense

1. Acesse https://adsense.google.com
2. Crie conta com o domínio
3. Adicione o ID no `.env.local`: `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXX`
4. Aguarde aprovação (geralmente 1-7 dias após ter conteúdo)

---

## PASSO 10 — Automação Python

```bash
cd automation
cp .env.example .env
pip install -r requirements.txt

# Baixe o service account do Firebase:
# Firebase Console → Configurações → Contas de serviço → Gerar chave privada
# Salve como: automation/firebase-service-account.json

# Gerar um artigo manualmente:
python content_generator.py -k "melhores ferramentas de IA em 2025" -l pt-BR

# Publicar imediatamente:
python content_generator.py -k "best AI tools" -l en --publish

# Ativar scheduler automático (3 artigos/dia):
python scheduler.py

# Testar sem salvar:
python scheduler.py --once --dry-run
```

---

## ESTRUTURA DE MONETIZAÇÃO

### AdSense — Posicionamentos no código:
- `homepage-mid`: Entre seções da homepage
- `blog-top`: Topo da listagem do blog
- `blog-mid`: Meio da listagem
- `article-top`: Antes do conteúdo do artigo
- `article-bottom`: Depois do conteúdo

### Afiliados — Como inserir:
No admin, edite o artigo e adicione `affiliateLinks` com:
- `type`: "amazon" | "mercadolivre" | "aliexpress" | "hotmart" | "saas"
- `url`: Link de afiliado
- `productName`: Nome do produto
- `price`: Preço atual
- `badge`: "Mais vendido", "Melhor custo-benefício"

---

## CRONOGRAMA RECOMENDADO

### Semana 1-2: Setup
- [ ] Configurar Firebase
- [ ] Deploy na Vercel
- [ ] Configurar domínio
- [ ] Criar conta AdSense
- [ ] Criar 10 artigos manualmente com keywords de alta intenção

### Mês 1: Conteúdo
- [ ] Ativar automação Python (3 artigos/dia)
- [ ] Configurar afiliados Amazon/ML/AliExpress
- [ ] Criar newsletter com Mailchimp
- [ ] Submeter sitemap ao Google

### Mês 2-3: SEO
- [ ] Criar links internos entre artigos
- [ ] Buscar backlinks (fóruns, communities)
- [ ] Criar conteúdo evergreen (pillar pages)

### Mês 4-6: Monetização
- [ ] Ativar AdSense (precisa aprovação)
- [ ] Configurar e-mail marketing
- [ ] Criar primeiro infoproduto (Hotmart)
- [ ] Expandir para EN (mercado global)

---

## SUPORTE

Dúvidas ou problemas? Abra uma issue ou entre em contato.

**Fábrica de Liberdade** — Construindo liberdade através da tecnologia.
