# KANBAN BOARD — DOM.ITA v2.0

## 📋 PROGETTO: DOM.ITA — Gestione Barca
## 👤 OWNER: Comandante (Luca Di Rienzo)
## 📅 DATA: 2026-06-15
## 🎯 OBIETTIVO: Produzione app completa (Supabase + Vercel)

---

## 🔴 TO DO (PENDING)

### FASE 1 — GitHub
- [ ] **T1.1** Creare repo GitHub `dom-ita` su org `lucadirienzo86-cell`
- [ ] **T1.2** Push codice frontend (`~/Progetti/dom-ita/`)
- [ ] **T1.3** Push codice backend (`~/Progetti/dom-ita-api/`)
- [ ] **T1.4** Push schema SQL (`~/Progetti/dom-ita/schema.sql`)
- [ ] **T1.5** Creare `.gitignore` con node_modules, .env, .venv, ruvector.db

### FASE 2 — Supabase
- [ ] **T2.1** Creare progetto Supabase (o verificare quello esistente)
- [ ] **T2.2** Eseguire schema SQL su Supabase (9 tabelle + dati)
- [ ] **T2.3** Backend API: cambiare connessione da PG embedded (`127.0.0.1:54329`) a Supabase URL
- [ ] **T2.4** Testare tutti gli endpoint con Supabase

### FASE 3 — Vercel Deploy
- [ ] **T3.1** Deploy frontend su Vercel (cli: `npx vercel --prod`)
- [ ] **T3.2** Configurare env vars su Vercel (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] **T3.3** Configurare dominio personalizzato (opzionale)
- [ ] **T3.4** Testare app live su Vercel URL

### FASE 4 — Migrazione Dati
- [ ] **T4.1** Parsing Excel con script Python (`.venv` in `dom-ita/`)
- [ ] **T4.2** Import dati reali da Excel (WBS, budget, ricambi, pagamenti)
- [ ] **T4.3** Verifica dati corretti nell'app

---

## 🟡 IN PROGRESS

- [ ] Nessun task attivo — in attesa di inizio

---

## 🟢 COMPLETED

- [x] Database PostgreSQL schema (9 tabelle, 11 budget categories)
- [x] Backend API Node+Express (porta 3001, JWT auth, CRUD completo)
- [x] Frontend React+Vite (6 sezioni, mobile-first, localStorage)
- [x] Configurazione Supabase (credenziali in zeus-control-tower)
- [x] Vercel CLI autenticato (lucadirienzo86-cell)
- [x] GitHub CLI autenticato

---

## 🔧 RISORSE

| Risorsa | Dettaglio |
|---|---|
| Supabase URL | `https://tcfpppuhbbygbvcteftk.supabase.co` |
| Supabase Key | In `/home/di-rienzo-srl/zeus-control-tower/.env` |
| Vercel Org | `team_h4AQvVlOb8NFGAL7aIEeXh4n` |
| Vercel Project | `app` (prj_mSkZA8KhAoKmtntqDgpLEnLIF9iY) |
| GitHub | `lucadirienzo86-cell` |
| gh CLI | `/usr/bin/gh` (v2.45.0, autenticato) |
| vercel CLI | `/home/di-rienzo-srl/.npm-global/bin/vercel` (v53.1.0) |
| Node.js | v22.22.2 |
| Python | 3.12 |
| .venv | In `~/Progetti/dom-ita/.venv/` |

---

## 📝 NOTE

- Progetto principale: `dom-ita` (barca Comandante, motori Mercury QSD 4.2)
- Usare come riferimento progetti esistenti: `zeus-control-tower`, `hermes-workspace`, `hermes-easyfarma-sync`
-NON toccare altri progetti
