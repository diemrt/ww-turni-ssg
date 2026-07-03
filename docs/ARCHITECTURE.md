# ARCHITECTURE.md

## 1. Panoramica

Il progetto è un sito statico costruito con **React + Vite + TypeScript** che:

- Mostra i turni del worship team (chi suona/canta e in quale ruolo) per ciascuna data,
  in una **vista pubblica mobile-first** (`#/` o hash vuoto).
- Offre una **sezione admin** (`#/admin`, desktop-first) con una griglia editabile per
  pianificare i turni di un mese, sullo stile del foglio Excel usato in precedenza (vedi
  `docs/superpowers/specs/2026-07-02-admin-editor-turni-design.md`).
- Legge i dati a runtime da due file statici in `public/`: `config.json` (configurazione
  stabile: roster, ruoli, colori, slot, giorni validi) e `turni.json` (dati del mese
  corrente: turni e assenze). Nessun backend.
- Ordina i turni per data e permette un filtro rapido per nome del componente del team
  (vista pubblica).
- Associa a ciascun ruolo un'icona (chitarra, basso, batteria, voce, tastiera) e a
  ciascuna persona un colore, mantenendo il resto dell'interfaccia in scala di grigi.
- Viene compilato in file statici nella cartella `dist/`, pubblicabili su qualsiasi
  hosting statico (Netlify, Vercel, GitHub Pages, ecc.).

### Stack tecnologico

- **React 19**: libreria UI a componenti
- **Vite 7**: dev server e bundler per la build statica
- **TypeScript**: tipizzazione statica dell'applicazione
- **Tailwind CSS v3**: styling utility-first (con `postcss` e `autoprefixer`)
- **shadcn/ui**: componenti UI di base (es. `Card`) in `src/components/ui/`
- **lucide-react**: set di icone (mappate ai ruoli, usate anche nell'editor admin)
- **class-variance-authority / clsx / tailwind-merge**: utility per la composizione delle classi
- **Vitest**: test runner per la logica pura (vedi sez. 8)

## 2. Flusso principale

1. `main.tsx` monta il componente radice `App` nel DOM (`index.html`).
2. `App` usa `useHashRoute` (vedi sez. 4) per decidere quale vista renderizzare:
   - `#/admin` → `AdminEditor` (editor admin).
   - `#/`, hash vuoto, o qualsiasi altro valore → `PublicView` (vista pubblica).
3. **Vista pubblica (`PublicView`)**: al primo render esegue il `fetch` in parallelo di
   `/config.json` e `/turni.json`, poi li unisce con `mergeConfig` (risolve il `color` di
   ogni assegnazione cercando il `name` in `config.availableTeamMembers`). I turni
   risultanti vengono ordinati cronologicamente per `date`. Il filtro rapido
   (`QuickFilter`) permette di restringere la vista ai turni di un determinato componente
   del team. Per ogni turno viene renderizzato uno `ShiftCard` con la lista dei membri
   (`TeamMemberCard`), risolvendo icona (via `iconMapper`) e formato data italiano (via
   `dateFormatter`). Stati di supporto: spinner di caricamento inline durante il fetch,
   `EmptyState` quando non ci sono turni da mostrare o in caso di errore (es. uno dei due
   file manca).
4. **Editor admin (`AdminEditor`)**: al montaggio esegue il `fetch` di `/config.json`
   (roster, ruoli, giorni validi). L'admin sceglie mese/anno (`MonthPicker`); da lì si
   derivano `month`, il titolo in italiano e le colonne data (via
   `src/utils/monthDates.ts`), filtrabili singolarmente rimuovendo una data. La griglia
   (`ShiftGrid`) tiene lo stato "vero" in una mappa piatta di selezioni
   (data/ruolo/slot → nome); `MonthData.shifts` viene derivato da questa mappa ad ogni
   render. Le assenze (`AbsencePanel`) condividono la stessa mappa `absences` letta dalla
   griglia per disabilitare le persone assenti nei dropdown. Conteggi (`StatsPanel`) e
   warning (`WarningsPanel`) sono calcolati live da `src/utils/shiftStats.ts`. La bozza
   viene salvata in `localStorage` (`src/utils/draftStorage.ts`) e l'admin può
   esportare/importare `turni.json` (`src/utils/exportImport.ts`). Vedi sez. 5 e 6 per i
   dettagli.

## 3. Modello dati (split config / dati mese)

La configurazione stabile del progetto (roster, ruoli, colori, slot per ruolo, giorni
validi) vive in `public/config.json`, modificato a mano e trattato come sola lettura
dall'app. `public/turni.json` contiene invece solo ciò che cambia ogni mese: le
assegnazioni (`shifts`) e le assenze (`absences`). Il colore di ogni persona **non** è più
duplicato in `turni.json`: si risolve cercando il `name` dell'assegnazione in
`config.availableTeamMembers` (vedi `mergeConfig` più sotto).

### 3.1 `public/config.json`

```json
{
  "validDayOfWeek": ["Friday", "Sunday"],
  "availableRoles": ["guitar", "bass", "drums", "vocals", "keyboard"],
  "roleSlots": { "guitar": 1, "keyboard": 1, "drums": 1, "bass": 1, "vocals": 5 },
  "availableTeamMembers": [
    { "name": "Diego", "roles": ["guitar"], "color": "yellow" }
  ]
}
```

### 3.2 `public/turni.json` (per mese, prodotto dall'editor admin)

```json
{
  "title": "Turni di Giugno 2026",
  "month": "2026-06",
  "shifts": [
    {
      "date": "2026-06-05",
      "team": [
        { "name": "Diego", "role": "guitar" },
        { "name": "Samuele", "role": "keyboard" }
      ]
    }
  ],
  "absences": {
    "2026-06-12": ["Alberto", "Magdy"]
  }
}
```

### 3.3 Tipi TypeScript (`src/types/index.ts`)

- `Role`, `TeamMember` (`name`, `roles`, `color`).
- `AppConfig`: `validDayOfWeek`, `availableRoles`, `roleSlots`, `availableTeamMembers` —
  rispecchia `config.json`.
- `ShiftAssignment` (`name`, `role`), `Shift` (`date`, `team`), `MonthData` (`title`,
  `month`, `shifts`, `absences`) — rispecchiano `turni.json`.

`src/utils/mergeConfig.ts` espone `mergeConfig(config: AppConfig, month: MonthData)`, che
risolve il `color` di ogni assegnazione (fallback `'gray'` se il nome non è in
`availableTeamMembers`) e restituisce un `MergedMonth` pronto per i componenti di
presentazione (`ShiftCard`, `TeamMemberCard`, `TeamSummary`), che restano invariati a
valle del merge.

## 4. Routing e accesso admin

- **Hash routing fatto a mano** (`src/hooks/useHashRoute.ts`), nessuna libreria di routing
  aggiunta: l'hook legge `window.location.hash`, si aggiorna sull'evento `hashchange` e
  normalizza il valore (`#/admin` → `"/admin"`, hash vuoto/`#`/`#/` → `"/"`).
- `App.tsx` fa il dispatch: `"/admin"` → `AdminEditor`, qualunque altro valore →
  `PublicView`.
- L'editor **non è linkato** dalla vista pubblica; ci si arriva solo navigando
  direttamente a `#/admin`.
- **Nessuna protezione**: chi conosce l'URL entra. È una **scelta consapevole**, non una
  svista — senza backend, una password nel bundle sarebbe teatro di sicurezza (vedi
  spec, sez. 4 e 10).

## 5. Editor admin (`#/admin`)

Desktop-first, con scroll orizzontale per la griglia larga (l'admin lavora da PC); la
vista pubblica resta mobile-first. Componenti in `src/components/admin/`:

- **`AdminEditor`**: componente radice dell'editor. Fa il fetch di `config.json`, tiene
  lo stato per-mese (date rimosse, selezioni griglia, assenze), deriva `MonthData` dalle
  selezioni, gestisce l'autosave della bozza, il prompt Riprendi/Scarta, l'export/import
  di `turni.json` e assembla gli altri componenti sotto.
- **`MonthPicker`**: selettore mese + anno; emette una stringa `"YYYY-MM"`.
- **`ShiftGrid`**: griglia editabile. Righe = una per ogni combinazione ruolo/slot
  (`buildGridRows`, da `config.availableRoles` + `config.roleSlots`, es. `vocals` con
  slot `5` → "Voce 1".."Voce 5"); colonne = le date attive del mese. Espone anche le
  funzioni pure `shiftsFromSelections` (selezioni → `Shift[]`) e `selectionsFromShifts`
  (`Shift[]` → selezioni, usata per bozza ripresa/import) oltre a `buildSelectionKey` e
  `buildGridRows`.
- **`ShiftCell`**: singola cella della griglia, un dropdown filtrato alle persone che
  hanno il ruolo di quella riga; le persone assenti in quella data appaiono disabilitate;
  lo sfondo della cella riflette il colore della persona selezionata.
- **`AbsencePanel`**: per ogni data attiva, un multi-select (checkbox) delle persone
  assenti quel giorno; scrive nella stessa mappa `absences` letta da `ShiftGrid`, quindi
  segnare un'assenza disabilita subito quella persona nella griglia.
- **`StatsPanel`**: conteggio turni per persona nel mese corrente, derivato/live (mai
  salvato) da `src/utils/shiftStats.ts`.
- **`WarningsPanel`**: elenco di warning non bloccanti (slot vuoti, stessa persona
  assegnata due volte lo stesso giorno, persona assente ma assegnata), anch'essi derivati
  da `src/utils/shiftStats.ts`. Non bloccano mai l'export: decide sempre l'admin.

Bozza/export/import (spec sez. 6.6): `src/utils/draftStorage.ts` salva/carica/cancella la
bozza in `localStorage` con chiave per mese (es. `ww-turni-draft-2026-06`);
`src/utils/exportImport.ts` serializza/valida `MonthData` e scarica `turni.json` via
Blob/anchor, oppure lo importa (parse + validazione dei campi) per correggere un mese già
pubblicato.

## 6. Struttura del codice

Il progetto è organizzato nelle seguenti cartelle:

- `src/`
  - `main.tsx`: entry point, monta `App`
  - `App.tsx`: componente radice, dispatch sulla rotta hash (`PublicView` / `AdminEditor`)
  - `index.css` / `App.css`: stili globali e direttive Tailwind

- `src/hooks/`
  - `useHashRoute.ts`: hook di routing hash minimale (vedi sez. 4)

- `src/components/`
  Componenti della vista pubblica
  - `PublicView`: fetch + merge di `config.json`/`turni.json`, ordinamento, filtro, rendering
  - `Header`: intestazione con il titolo del piano turni
  - `ShiftCard`: card di un singolo turno (data + team)
  - `TeamMemberCard`: card di un componente del team (nome, ruolo, colore, icona)
  - `TeamSummary`: riepilogo dei componenti del team
  - `QuickFilter`: filtro rapido per nome
  - `EmptyState`: stato "nessun turno"/errore
  - `LoadingState`: stato di caricamento
  - `ui/`: componenti base shadcn/ui (es. `card.tsx`)

- `src/components/admin/`
  Componenti dell'editor admin (vedi sez. 5): `AdminEditor`, `MonthPicker`, `ShiftGrid`,
  `ShiftCell`, `AbsencePanel`, `StatsPanel`, `WarningsPanel`, più `__tests__/` con i test
  Vitest della griglia.

- `src/types/`
  - `index.ts`: tipi dominio (`Role`, `TeamMember`, `AppConfig`, `ShiftAssignment`,
    `Shift`, `MonthData`)

- `src/utils/`
  - `dateFormatter.ts`: formattazione delle date in locale italiano
  - `iconMapper.ts`: mappatura ruolo → icona lucide-react ed etichetta italiana
  - `monthDates.ts`: date del mese generate da `validDayOfWeek` + titolo italiano del mese
  - `mergeConfig.ts`: merge config + mese (risoluzione colore per nome)
  - `shiftStats.ts`: conteggi turni/persona e calcolo warning
  - `draftStorage.ts`: load/save/clear bozza in `localStorage`
  - `exportImport.ts`: serializzazione/validazione/download/import di `turni.json`
  - `__tests__/`: test Vitest di `monthDates`, `mergeConfig`, `shiftStats`,
    `draftStorage`, `exportImport`, più uno smoke test

- `src/lib/`
  - `utils.ts`: helper condivisi (es. `cn` per la composizione di classi)

- `public/`
  - `config.json`: configurazione stabile (roster, ruoli, colori, slot, giorni validi)
  - `turni.json`: dati del mese corrente (turni + assenze) caricati a runtime
  - `backups/`: backup timestampati generati da `generate-turni.ps1`

- root
  - `index.html`: template HTML servito da Vite
  - `vite.config.ts`, `vitest.config.ts`, `tsconfig*.json`, `tailwind.config.js`,
    `postcss.config.js`, `eslint.config.js`: configurazione di build, test, TypeScript,
    styling e lint
  - `generate-turni.ps1`: genera lo scheletro dei turni per un nuovo mese
  - `issue-manager.ps1`, `issues.json`, `issues.html`: gestione delle issue di progetto
  - `init.ps1`: verifica ambiente e build (vedi `AGENTS.md`)

## 7. Build e output statico

La build è definita in `package.json` (`npm run build` → `tsc -b && vite build`):

1. **`tsc -b`**: type-check dell'intero progetto TypeScript (fallisce in caso di errori di tipo).
2. **`vite build`**: bundling e generazione dei file statici in `dist/`.

L'output in `dist/` è un sito completamente statico: non richiede un server applicativo
e può essere pubblicato su qualsiasi hosting statico. Il comando `.\init.ps1 build`
esegue questa build ed è usato come verifica che React, Vite e TypeScript funzionino
correttamente (vedi `AGENTS.md`).

## 8. Testing

Il progetto usa **Vitest** (`npm test` → `vitest run`) per testare la logica pura
dell'editor admin e del merge dati, senza testare l'UI dei componenti React:

- `monthDates`: date corrette per un mese/giorni validi noti (incl. bordi mese) e titolo
  italiano.
- `mergeConfig`: colore risolto per nome; fallback per nome mancante in config.
- `shiftStats`: conteggi corretti; warning per slot vuoti, doppie assegnazioni nello
  stesso giorno, persone assenti ma assegnate.
- `draftStorage` / `exportImport`: round-trip serializza→deserializza dà lo stesso
  oggetto; validazione degli errori di parsing/import.
- `ShiftGrid` (`src/components/admin/__tests__/ShiftGrid.test.ts`): le funzioni pure
  `buildGridRows`/`shiftsFromSelections`/`selectionsFromShifts` esportate dal componente.

`.\init.ps1 build` resta la verifica di build/type-check; `npm test` è la verifica di
questa logica pura, entrambe da eseguire come sanity check dopo modifiche rilevanti.
