# DOM.ITA — Gestione Barca

Web app per monitorare e gestire la barca **DOM.ITA** (motoscafo con motori Mercury/Quicksilver QSD 4.2, piedi Bravo 3X).

## ✨ Funzionalità

### 1. **Ore di Navigazione**
- Log delle uscite (data, ore totali, note)
- Calcolo progressivo ore anno corrente
- Dashboard riepilogo

### 2. **Assicurazioni**
- Registrazione polizze (nome, scadenza, compagnia, premio)
- Allarme scadenze (< 30 giorni)
- Visualizzazione giorni residui

### 3. **Carburante**
- Registrazione rifornimenti (data, litri, €/litro, costo totale)
- Calcolo consumo medio (L/h)
- Tracking spesa annuale

### 4. **Spese Extra**
- Categorie: Manutenzione, Ricambi, Attrezzatura, Manodopera, Altro
- Data, descrizione, importo
- Riepilogo per categoria

### 5. **Ormeggio & Pontile**
- Registrazione canoni ormeggio (porto, periodo, importo, scadenza)
- Stato pagamento (checkbox)
- Tracciamento spese fisse

### 6. **Refit & Budget 2026** (dal file WBS Excel)
- Budget totale: **€6.000** (target giugno 2026)
- **11 categorie** con contingency:
  - 1. Motori / Refit (€2.580)
  - 2. Trasmissione / Bravo 3X (opzionale)
  - 3. Impianti di bordo (€780)
  - 4. Scafo / Carena / Anodi (€300)
  - 5. Sicurezza e dotazioni (€180)
  - 6. Ormeggio & Logistica (€300)
  - 7. Assicurazioni / Bolli (€420)
  - 8. Manodopera / Officina (€420)
  - 9. Buffer imprevisti (€420)
  - 10. Extra / Upgrade estetici
  - 11. Carrozzeria / Superfici esterne (€600)
- Distinta ricambi/lavori da WBS
- Tracking spese vs budget per categoria
- Semafori 🟢/🔴

### Dashboard
- **Ore totali anno 2026**
- **Spesa carburante** totale
- **Spese extra** totale
- **Refit speso** vs budget
- **Prossime scadenze assicurazioni** (con giorni residui)

### Dati
- **Dati pre-compilati** dagli Excel (`./dati/` → WBS ricambi, budget, fornitori reali)
- **localStorage**: tutti i dati salvati localmente (nessun server)
- **Export Backup**: scarica i dati in JSON (`dom-ita-backup-YYYY-MM-DD.json`)
- **Import Backup**: ripristina da JSON

## 🚀 Come avviare

```bash
cd ~/Progetti/dom-ita
npm install        # una volta sola
npm run dev        # avvia Vite su http://localhost:5173
```

Apri il browser su **http://localhost:5173**.

## 📦 Tech Stack

- **Vite** 5.4.21 (dev server, build optimizer)
- **React** 18.2 + **TypeScript** 5.2
- **localStorage** (dati locali, no backend)
- **CSS** vanilla (responsive, mobile-friendly)

## 💾 Struttura

```
dom-ita/
├── src/
│   ├── App.tsx            # componente principale + sezioni
│   ├── App.css            # stili
│   ├── types.ts           # TypeScript interfaces
│   ├── data.ts            # dati iniziali (Excel pre-compilati)
│   ├── useLocalStorage.ts # hook custom
│   ├── main.tsx           # entry point React
│   └── index.css          # reset base
├── dati/
│   ├── WBS_Sintesi_DOMITA.xlsx
│   ├── WBS_Budget_DOMITA_items.xlsx
│   └── plan_domita_WBS_fornitori.xlsx
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
└── README.md
```

## 📝 Workflow

1. **Aggiungi voci** in ogni sezione (date, importi, note)
2. **Dashboard** aggiorna automaticamente (statistiche, scadenze)
3. **localStorage** salva tutto in tempo reale
4. **Esporta backup** (JSON) per backup offline
5. **Importa backup** se necessario (ripristino dati)

## 🔔 Avvisi

- **Assicurazioni**: allarme rosso se scadenza < 30 giorni
- **Refit Budget**: evidenziazione 🔴 se categoria supera budget
- **Mobile-friendly**: responsive design (tablet, smartphone)

## Dati Reali Inclusi

- **Budget Refit 2026**: €6.000 (11 categorie con contingency)
- **Distinta Ricambi**: filtri, cinghie, anodi, olio, batterie, ecc. dai WBS Excel
- **Fornitori**: Mercury/Quicksilver, Parker Racor, Bosch, ecc.
- **Pagamenti Reali**: €300 tagliando + €149 batteria già registrati
- **Piano Accantonamento Mensile**: €750/mese (target giugno)

## ⚙️ Customizzazione

Modifica `src/data.ts` per:
- Cambiare budget totale
- Aggiungere/rimuovere categorie
- Pre-compilare dati iniziali
- Aggiornare nomi barca/motori

## 📱 Browser Support

- Chrome/Edge ✓
- Firefox ✓
- Safari ✓
- Mobile (iOS/Android) ✓

---

**Creata**: giugno 2026  
**Dati base**: WBS refit motoscafo DOM.ITA  
**Tech**: Vite + React + TS + localStorage
