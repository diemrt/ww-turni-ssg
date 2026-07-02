# Design — Editor Admin dei turni (griglia tipo Excel)

Data: 2026-07-02
Stato: approvato (design), in attesa di review dello spec scritto

## 1. Contesto e obiettivo

Il progetto è un sito statico **frontend-only** (React + Vite + TypeScript) che mostra i
turni del worship team leggendo `public/turni.json` a runtime. Nessun backend.

Oggi la pianificazione dei turni avviene in un foglio Excel esterno (vedi
`docs/current-idea.png`): righe = ruoli/slot, colonne = date valide del mese, celle =
persone, sezione assenze in basso, conteggio turni per persona a lato. Serve a dare una
**visione d'insieme** per capire se i turni sono ben distribuiti.

**Obiettivo:** portare quella pianificazione dentro l'app come **sezione admin** con una
griglia editabile, senza introdurre backend. L'output è un `turni.json` che l'admin
scarica e pubblica manualmente (commit + deploy), coerente con il flusso attuale.

Principio guida: **la strada più semplice è la migliore** (YAGNI).

## 2. Decisioni chiave (dal brainstorming)

| Tema | Decisione |
|------|-----------|
| Persistenza | **Export JSON + commit manuale**. L'admin scarica `turni.json` e lo mette nel repo. |
| Bozza | **Autosave in `localStorage`** come rete di sicurezza; pubblicazione = export esplicito. |
| Date del mese | **Auto-generate** da `validDayOfWeek` scegliendo mese+anno. Possibilità di **rimuovere** una data. |
| Righe griglia | **Ruoli con slot fissi** (come Excel), cella = dropdown filtrato per ruolo. |
| N. slot per ruolo | **Configurabile** via `roleSlots` in `config.json`. |
| Assenze | Segnate per data, **salvate in `turni.json`** (`absences`); guardrail sull'assegnazione. |
| Conteggio turni/persona | **Derivato/live**, non salvato. |
| Modello mesi | **Un mese per file** (come ora). Mesi passati nella storia git. |
| Accesso admin | **Rotta `#/admin`**, hash-based, **nessuna protezione** (impossibile senza backend). |
| Seed editor | Griglia turni **parte vuota**; config da `config.json`; bozza `localStorage` + **import `turni.json`** per correzioni. |
| Config (roster/ruoli/colori/slot/giorni) | **Modificata a mano** nel file; editor sola lettura (v1). |

## 3. Modello dati (lo split config / dati mese)

La configurazione stabile viene estratta da `turni.json` in un nuovo `config.json`. Così
`turni.json` contiene **solo ciò che cambia ogni mese**.

### 3.1 `public/config.json` (stabile, modificato a mano, sola lettura per l'app)

```json
{
  "validDayOfWeek": ["Friday", "Sunday"],
  "availableRoles": ["guitar", "bass", "drums", "vocals", "keyboard"],
  "roleSlots": { "guitar": 1, "keyboard": 1, "drums": 1, "bass": 1, "vocals": 5 },
  "availableTeamMembers": [
    { "name": "Diego", "roles": ["guitar"], "color": "yellow" },
    { "name": "Samuele", "roles": ["keyboard"], "color": "blue" },
    { "name": "Daniele", "roles": ["drums"], "color": "green" },
    { "name": "Beppe", "roles": ["bass"], "color": "orange" },
    { "name": "Alberto", "roles": ["guitar", "drums"], "color": "brown" },
    { "name": "Manuela", "roles": ["vocals"], "color": "purple" },
    { "name": "Natalia", "roles": ["vocals"], "color": "cyan" },
    { "name": "Magdy", "roles": ["vocals"], "color": "pink" },
    { "name": "David", "roles": ["vocals"], "color": "gray" }
  ]
}
```

### 3.2 `public/turni.json` (per mese, prodotto dall'editor)

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

Cambiamenti rispetto a oggi:
- Il campo `color` **sparisce** dagli elementi `team` (il colore si risolve per `name` da
  `config.json`).
- `validDayOfWeek`, `availableTeamMembers`, `availableRoles` **escono** da `turni.json`
  (vanno in `config.json`).
- Nuovi campi: `month` (`YYYY-MM`, per generare le date) e `absences`
  (mappa `date → string[]`).

### 3.3 Tipi TypeScript (`src/types/index.ts`)

```ts
export type Role = "guitar" | "bass" | "drums" | "vocals" | "keyboard";

export interface TeamMember {
  name: string;
  roles: Role[];
  color: string;
}

export interface AppConfig {
  validDayOfWeek: string[];
  availableRoles: Role[];
  roleSlots: Record<Role, number>;
  availableTeamMembers: TeamMember[];
}

export interface ShiftAssignment {
  name: string;
  role: Role;
}

export interface Shift {
  date: string; // YYYY-MM-DD
  team: ShiftAssignment[];
}

export interface MonthData {
  title: string;
  month: string; // YYYY-MM
  shifts: Shift[];
  absences: Record<string, string[]>; // date → nomi assenti
}
```

## 4. Routing e accesso

- **Hash routing fatto a mano**, nessuna libreria di routing aggiunta (progetto resta
  leggero). Un piccolo hook/utility legge `window.location.hash`:
  - `#/` (o vuoto) → **vista pubblica** (comportamento attuale).
  - `#/admin` → **editor**.
- L'editor **non è linkato** dalla vista pubblica.
- **Nessuna protezione**: chi conosce l'URL entra. Scelta consapevole (senza backend una
  password nel bundle sarebbe teatro).

## 5. Vista pubblica — refactor merge config + mese

- `App` esegue il fetch di **`config.json` e `turni.json`** (in parallelo) al primo render.
- I due vengono **uniti**: per ogni assegnazione, il `color` si risolve cercando `name`
  in `config.availableTeamMembers`.
- Componenti di presentazione (`ShiftCard`, `TeamMemberCard`, `TeamSummary`, ecc.)
  restano invariati a valle del merge (ricevono già i dati risolti).
- Stati `LoadingState` / `EmptyState` invariati; gestire l'errore se manca uno dei due file.

## 6. Editor admin (`#/admin`)

Desktop-first, con **scroll orizzontale** per la griglia larga (l'admin lavora da PC). La
vista pubblica resta mobile-first.

### 6.1 Selettore mese

- Input **mese + anno**. Da questi si genera `month` (`YYYY-MM`) e il `title`
  (es. "Turni di Giugno 2026", con nome mese in italiano).
- Dalle date del mese si filtrano quelle che cadono nei `validDayOfWeek` → **colonne**.
- Ogni colonna ha un controllo per **rimuovere** quella data (es. festività saltata).

### 6.2 Griglia

- **Righe** = per ogni ruolo in `availableRoles`, `roleSlots[role]` righe (es. `vocals` → 5
  righe "Voce 1..5"). Etichette leggibili in italiano.
- **Colonne** = date generate.
- **Cella** = dropdown con le persone che hanno quel ruolo
  (`availableTeamMembers.roles` include il ruolo), più opzione "vuoto".
- Persone **assenti** in quella data → **disabilitate/grigie** nel dropdown.
- Il colore della persona è usato per lo sfondo/segno della cella (coerenza con Excel).

### 6.3 Assenze

- Sezione per data (sotto la griglia o in pannello dedicato): multi-select delle persone
  assenti quel giorno.
- Le assenze alimentano il guardrail dei dropdown e vengono salvate in `absences`.

### 6.4 Pannello conteggi (derivato)

- Lista persone con **numero di turni assegnati** nel mese corrente (ricalcolo live).
- Serve la stessa "visione d'insieme" dell'Excel per bilanciare i turni.

### 6.5 Warning non bloccanti

Mostrati ma non impediscono l'export (l'admin decide):
- Slot vuoti (ruolo scoperto in una data).
- Stessa persona assegnata **due volte nello stesso giorno**.
- Persona **assente** ma comunque assegnata in quel giorno.

### 6.6 Bozza / Export / Import

- **Autosave bozza** in `localStorage`, chiave per mese (es. `ww-turni-draft-2026-06`).
  All'apertura, se esiste una bozza, proporre **Riprendi / Scarta**.
- **Esporta**: costruisce l'oggetto `MonthData` e scarica `turni.json` via Blob/anchor.
  L'admin lo mette in `public/`, commit, deploy.
- **Importa `turni.json`**: carica un file dal disco e ripopola `shifts` + `absences`
  nella griglia (per correggere un mese già pubblicato).

## 7. Struttura del codice (nuovi/modificati)

- `src/types/index.ts` — nuovi tipi (`AppConfig`, `MonthData`, ecc.).
- `src/utils/monthDates.ts` — generazione date del mese dai `validDayOfWeek`.
- `src/utils/mergeConfig.ts` — merge config + mese (risoluzione colore per nome).
- `src/utils/shiftStats.ts` — conteggi turni/persona e calcolo warning.
- `src/utils/draftStorage.ts` — load/save/clear bozza in `localStorage`.
- `src/utils/exportImport.ts` — download `turni.json` e parse import.
- `src/hooks/useHashRoute.ts` — routing hash minimale.
- `src/components/admin/` — `AdminEditor`, `MonthPicker`, `ShiftGrid`, `ShiftCell`,
  `AbsencePanel`, `StatsPanel`, `WarningsPanel` (componenti piccoli e focalizzati).
- `App.tsx` — dispatch route pubblica/admin + fetch/merge config.
- `public/config.json` — nuovo file.
- `public/turni.json` — migrato al nuovo schema (senza config, con `month`/`absences`).

## 8. Testing

Nessun test runner è installato oggi. Si aggiunge **Vitest** (minimale) per la logica pura:

- `monthDates`: date corrette per un mese/giorni validi noti (incl. bordi mese).
- `mergeConfig`: colore risolto per nome; gestione nome mancante in config.
- `shiftStats`: conteggi corretti; warning per slot vuoti / doppioni / assenti assegnati.
- `draftStorage` / `exportImport`: round-trip serializza→deserializza dà lo stesso oggetto.

I test coprono la logica, non l'UI. `.\init.ps1 build` resta la verifica di build/type-check.

## 9. Fuori scope (v1)

- Editor della config/roster nell'app (config si modifica a mano; predisporre il modello
  per un'eventuale v2).
- Multi-mese in un unico file o navigazione multi-mese.
- Qualsiasi autenticazione reale.
- Assegnazione automatica / suggerimenti di bilanciamento (solo conteggi manuali).

## 10. Rischi / note

- **Migrazione dati**: il `turni.json` attuale va splittato in `config.json` +
  `turni.json` nuovo schema; la vista pubblica va aggiornata **insieme** per non rompersi.
- **Larghezza griglia** su mobile: accettata (editor è desktop-first, scroll orizzontale).
- **Sicurezza**: rotta admin pubblica per natura; documentato come scelta.
