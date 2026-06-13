# DOM.ITA — Web app gestione barca

## Cosa devi costruire
Una **web app locale** per gestire la barca a vela/motore del Comandante, chiamata **DOM.ITA**.
Deve permettere di monitorare e registrare:

1. **Ore di navigazione** — log delle uscite (data, ore motore/vela, rotta/note, ore totali progressive).
2. **Assicurazioni** — polizze con data scadenza, compagnia, premio, avviso quando manca poco alla scadenza.
3. **Carburante** — rifornimenti (data, litri, €/litro, costo totale, ore motore al rifornimento → consumo medio).
4. **Spese extra** — manutenzione, ricambi, attrezzatura, ormeggio occasionale (data, categoria, importo, note).
5. **Pagamenti pontile/ormeggio** — canoni (periodo, porto/pontile, importo, scadenza, pagato sì/no).

Più una **dashboard** iniziale con riepilogo: ore totali anno corrente, prossime scadenze (assicurazioni + pontile), spesa totale anno, consumo medio carburante.

## Vincoli tecnici (IMPORTANTI — rispettali)
- **Stack semplice e leggero**: Vite + React + TypeScript, dati salvati in **localStorage** (nessun backend, nessun database esterno, nessun account). Deve girare con `npm install && npm run dev` su questa macchina Linux.
- Interfaccia in **italiano**, mobile-friendly (la userà spesso dal telefono in barca).
- Tutto il codice e i file **restano dentro questa cartella** `~/Progetti/dom-ita/`.
- Aggiungi un export/import dei dati in JSON (backup), così non si perde nulla.

## Dati reali della barca (in `./dati/`)
**DOM.ITA** è un motoscafo con motori diesel gemelli Mercury/Quicksilver (QSD 4.2 / VM MR706) e piedi **Bravo 3X**.
In `./dati/` ci sono 3 file Excel del **piano refit + budget** della barca. Leggili (sono .xlsx; in Python usa `openpyxl` o parsing zip/XML con stdlib) e usali per popolare l'app coi dati VERI:

- **`WBS_Sintesi_DOMITA.xlsx`** — sintesi 11 macro-categorie con budget suggerito, priorità (MUST/NICE/OPZ), contingenza, preventivi.
- **`WBS_Budget_DOMITA_items.xlsx`** — distinta ricambi/acquisti (filtri, cinghie, girante, anodi, oli, ecc.) con quantità, prezzo unit., totale, note. ⚠️ Alcuni numeri sono in formato seriale/frazionario Excel: normalizzali.
- **`plan_domita_WBS_fornitori.xlsx`** — il file ricco (più fogli): budget totale **€6.000** target entro **giugno 2026**, piano accantonamento mensile, ripartizione %, registro spese reali (es. €50/€100/€150 a Massimo Cannavacciuolo per tagliando/lavaggio/smontaggio motori; batteria Bosch 100Ah €149), responsabili/fornitori (Luca Di Rienzo, Massimo Cannavacciuolo, Luigi Scipione, Bruzzone, La Rocca, elettricista…), Gantt con date (formato seriale Excel: convertile in date reali), stato (ToDo/InCorso/Sospeso/Fatto), semafori 🟢/🔴.

Le 11 macro-categorie del refit includono già: **7. Assicurazioni/Bolli** e **6. Ormeggio & Logistica** → integra queste col monitoraggio richiesto sotto.

## Cosa deve fare l'app (unisci i due mondi)
1. **Monitoraggio corrente** (richiesta del Comandante): ore di navigazione, scadenze assicurazioni, rifornimenti carburante, spese extra, pagamenti pontile/ormeggio.
2. **Refit & Budget** (dai 3 Excel): dashboard budget €6.000, avanzamento per macro-categoria con semaforo, registro pagamenti a fornitori, distinta ricambi, piano accantonamento mensile.
Importa i dati Excel all'avvio (o con un pulsante "Importa dati iniziali") e poi gestiscili in localStorage.

## Regole di comportamento (anti-deriva)
- **NON toccare** `/mnt/storage/agentic-os` né altri progetti: questo task riguarda SOLO la barca.
- **NON** fare report di sistema, audit dell'ambiente, git status di altri repo. Fuori scope.
- Se sei **bloccato** (es. un link non si apre, manca un dato): **fermati e chiedi al Comandante in una riga**, non entrare in loop di "aspetto / controllo stato / timer".
- Lavora a piccoli passi verificabili e tieni l'app sempre avviabile.

## Definition of done
- `npm run dev` avvia l'app, si apre nel browser, tutte le 5 sezioni funzionano (creazione/modifica/eliminazione voci), la dashboard mostra i riepiloghi, export/import JSON funziona.
