# Chatbot CV — Riyan Besseghir

Agent conversationnel RAG qui remplace le CV statique. Stack : Next.js + Gemini Flash (gratuit) + Supabase pgvector.

## Setup — première installation

### 1. Dépendances
```bash
npm install
```

### 2. Supabase (gratuit)
1. Créer un projet sur https://supabase.com
2. Aller dans SQL Editor, coller et exécuter le contenu de `supabase/schema.sql`
3. Récupérer dans Project Settings → API : `Project URL`, `anon public key`, `service_role key`

### 3. Gemini (gratuit)
1. Aller sur https://aistudio.google.com/apikey
2. Créer une clé API gratuite (aucune carte bancaire)

### 4. Variables d'environnement
```bash
cp .env.example .env.local
```
Remplir `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

### 5. Ingestion de la base connaissance
```bash
npm run ingest
```
À relancer à chaque modification des fichiers dans `knowledge-base/`.

### 6. Lancer en local
```bash
npm run dev
```
→ http://localhost:3000

## Déploiement (Vercel, gratuit)
1. Push le repo sur GitHub
2. Importer le projet sur https://vercel.com
3. Renseigner les mêmes variables d'environnement dans Vercel → Settings → Environment Variables
4. Deploy

## Mettre à jour le contenu
Modifier les fichiers `.md` dans `knowledge-base/` puis relancer `npm run ingest` — la base vectorielle est entièrement recréée à chaque ingestion.

Le ton et les garde-fous du bot se règlent dans `system-prompt.md`.

## Coût
0€ à trafic personnel : Gemini Flash (free tier ~1500 req/jour), Supabase (free tier), Vercel (free tier).
