# SPEC.md

Come creare i file di **spec** del progetto, per mantenere coerenza. Uno spec nasce dal
brainstorming (skill **superpowers** di Claude), descrive **cosa** e **perché** (WHAT/WHY)
con le decisioni prese — **non** è una lista di TODO né descrive il codice riga per riga.

Esempio canonico già presente:
`docs/superpowers/specs/2026-07-02-admin-editor-turni-design.md`.

## Dove e come nominarlo

- **Cartella**: `docs/superpowers/specs/`.
- **Nome file**: `YYYY-MM-DD-<slug-kebab>.md` (data di creazione + slug breve della feature).

## Quando

- Prima di implementare una **feature non triviale** o un cambiamento architetturale.
- Deriva dal brainstorming: prima si esplora intento/requisiti/design, poi si scrive lo spec.
- Principio guida: **la strada più semplice è la migliore** (YAGNI).

## Struttura consigliata

Ricalcata sullo spec esistente (adattare le sezioni alla feature, non forzarle tutte):

1. Titolo + intestazione con `Data:` e `Stato:` (es. `approvato (design)`).
2. **Contesto e obiettivo** — problema, situazione attuale, risultato atteso.
3. **Decisioni chiave** — tabella `Tema | Decisione` dal brainstorming.
4. **Modello dati** — tipi/JSON coinvolti (se pertinente).
5. **Routing / flusso** e dettagli funzionali.
6. **Struttura del codice** — file nuovi/modificati (percorsi), non l'implementazione.
7. **Testing** — cosa verificare (logica pura, build/type-check).
8. **Fuori scope (v1)** — ciò che si rimanda esplicitamente.
9. **Rischi / note** — migrazioni dati, trade-off, scelte consapevoli.

## Regole

- **Uno spec per feature.**
- Quando lo spec è approvato/implementato, **referenziarlo da `ARCHITECTURE.md`** (come per
  quello esistente) così l'architettura punta sempre al design di riferimento.
