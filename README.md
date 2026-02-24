# ✦ Style Agent

Transforme suas fotos no estilo das suas inspirações usando IA (GPT-4o).

## Deploy na Vercel (link público em 2 minutos)

### 1. Suba para o GitHub
```bash
git init
git add .
git commit -m "Style Agent v1"
git remote add origin https://github.com/SEU-USER/style-agent.git
git push -u origin main
```

### 2. Deploy na Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique **"Add New Project"**
3. Selecione o repositório `style-agent`
4. Em **Environment Variables**, adicione:
   - `OPENAI_API_KEY` = `sk-sua-chave-aqui`
5. Clique **Deploy**

Pronto! Você terá um link tipo `style-agent.vercel.app`

### Modos de API Key

| Modo | Como funciona |
|------|--------------|
| **Você paga** | Coloque sua key nas Environment Variables da Vercel |
| **Usuário paga** | Não configure a env var — cada usuário cola a própria key no ⚙ Config |
| **Híbrido** | Configure a env var + permita override via Config |

## Dev local
```bash
npm install
npm run dev
```

## Estrutura
```
├── api/
│   ├── generate.js    ← serverless function (OpenAI)
│   └── health.js      ← health check
├── src/
│   ├── App.jsx        ← interface React
│   └── main.jsx
├── vercel.json        ← config de rotas e timeout
└── .env               ← API key (local)
```
