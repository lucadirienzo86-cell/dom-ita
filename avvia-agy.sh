#!/usr/bin/env bash
# Avvia l'agente Antigravity (agy) nel contesto CORRETTO: la cartella della barca.
# Così legge AGENTS.md di questo progetto e NON va in deriva su Agentic OS.
cd "$(dirname "$0")" || exit 1
export PATH="$HOME/.local/bin:$PATH"
echo "▶ Avvio agy in: $(pwd)"
echo "▶ Contesto: AGENTS.md (web app barca DOM.ITA)"
echo
exec agy -i "Leggi AGENTS.md in questa cartella e costruisci la web app DOM.ITA come specificato. In ./dati/ ci sono 3 file Excel reali del refit/budget della barca: leggili e popola l'app coi dati veri. Parti dallo scaffold Vite+React+TS e procedi a piccoli passi. Non toccare altri progetti, non fare report di sistema."
