# ✦ Style Agent

Transforme suas fotos no estilo das suas inspirações usando IA.

## Setup rápido

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure sua API Key da OpenAI
Abra o arquivo `.env` e substitua:
```
OPENAI_API_KEY=sk-sua-chave-aqui
```

### 3. Rode o projeto
```bash
npm run dev
```

Isso inicia:
- **Frontend** em `http://localhost:5173`
- **Backend** em `http://localhost:3001`

## Como usar

1. **Upload** — Adicione suas fotos e inspirações
2. **Parear** — Clique em uma foto + uma inspiração para criar um par
3. **Gerar** — O agente envia para o GPT-4o em duas etapas:
   - Etapa 1: Analisa o estilo/cenário da inspiração
   - Etapa 2: Aplica o cenário na sua foto, mantendo você 100% intacto

## Estrutura
```
style-agent/
├── .env                 ← sua API key aqui
├── server/index.js      ← backend (proxy OpenAI)
├── src/App.jsx          ← interface React
├── src/main.jsx         ← entry point
├── index.html
├── vite.config.js
└── package.json
```
