# UI_TESTING.md

Standard d'uso della skill **Playwright** (MCP) per testare la UI dell'app. La disponibilità
della skill è verificata (non bloccante) da `.\init.ps1 setup`: se segnala Playwright
assente, la skill non è utilizzabile finché non è configurata.

Non sostituisce **Vitest** (logica pura) né `.\init.ps1 build` (build + type-check): li
**affianca** per la verifica visiva/interattiva.

## Quando

Se la fase di verifica delle issue lo richiede implicitamente o esplicitamente, e soprattutto
se è una richiesta dell'utente.

## Come

1. Avviare il dev server: `npm run dev`.
2. Con Playwright, navigare all'URL locale con l'hash giusto (`#/` o `#/admin`).
3. Interagire (click, input, resize) e catturare **snapshot/screenshot solo se necessari**
   alla diagnosi — non di default.

## Dove salvare gli screenshot

- **Sempre** nella scratchpad dir di sessione (fuori dal repo).
- **Mai** in `public/`, `src/` o nella root del progetto.

## Regola obbligatoria — pulizia

Dopo **ogni** verifica, **rimuovere le immagini catturate**: non devono appesantire il
progetto né essere committate. Nessuno screenshot finisce nel repo.
