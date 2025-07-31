# Ninja Recipe Assistant

Un assistente AI per ricette Ninja Air Fryer, sviluppato con Next.js e Cloudflare Workers.

## 🏗️ Struttura del Progetto

```
ninja-recipe-assistant/
├── frontend/          # Next.js app (deploy su Cloudflare Pages)
├── worker/            # Cloudflare Worker (API backend)
└── README.md          # Questo file
```

## 🚀 Deploy

### Frontend (Cloudflare Pages)
- Cartella: `frontend/`
- Build command: `npm run build`
- Output directory: `out/`

### Backend (Cloudflare Worker)
- Cartella: `worker/`
- Deploy command: `wrangler deploy`

## 🔧 Setup Locale

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Worker
```bash
cd worker
npm install
wrangler dev
```

## 📝 Note

- Il frontend è configurato per l'export statico
- Il worker gestisce le API e il rate limiting
- Rate limit: 10 richieste ogni 3 ore per IP 