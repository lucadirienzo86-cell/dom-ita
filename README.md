# ⚓ DOM.ITA — Gestione Barca

Web app per gestire la barca **DOM.ITA** (motoscafo Mercury/Quicksilver QSD 4.2, piedi Bravo 3X).

## ✨ Funzionalità

- **Ore di Navigazione** — log uscite, calcolo ore annuali
- **Assicurazioni** — polizze, scadenze, allarmi
- **Carburante** — rifornimenti, consumo medio L/h
- **Spese Extra** — manutenzione, ricambi, attrezzatura
- **Ormeggio & Pontile** — canoni, stato pagamento
- **Refit & Budget 2026** — budget €6.000, 11 categorie, tracking spese
- **Dashboard** — riepilogo annuale con statistiche
- **Export/Import** — backup JSON

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT (7 giorni)
- **Deploy**: Vercel (frontend) + Supabase (backend/DB)

## 🚀 Avvio

```bash
# Frontend
cd dom-ita
npm install
npm run dev    # http://localhost:5173

# Backend
cd dom-ita-api
npm install
npm start      # http://localhost:3001
```

## 📊 Database

9 tabelle: navigation_log, insurances, fuel_logs, extra_expenses, mooring_payments, refit_budget, refit_payments, parts_list, users

## 🔐 Auth

Default: `admin` / `domita2026`

## 📦 Deploy

- Frontend: Vercel (auto-deploy da GitHub)
- Database: Supabase
