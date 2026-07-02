# ARCHITECTURE.md

## 1. Panoramica

Il progetto è un sito statico **mobile-first** costruito con **React + Vite + TypeScript**
che:

- Mostra i turni del worship team (chi suona/canta e in quale ruolo) per ciascuna data.
- Legge i dati a runtime dal file statico `public/turni.json` (nessun backend).
- Ordina i turni per data e permette un filtro rapido per nome del componente del team.
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
- **lucide-react**: set di icone (mappate ai ruoli)
- **class-variance-authority / clsx / tailwind-merge**: utility per la composizione delle classi

## 2. Flusso principale

Il flusso principale dell'applicazione è il seguente:

1. `main.tsx` monta il componente radice `App` nel DOM (`index.html`).
2. `App` esegue il `fetch` di `/turni.json` (da `public/`) al primo render.
3. I turni (`shifts`) vengono ordinati cronologicamente per `date`.
4. Il filtro rapido (`QuickFilter`) permette di restringere la vista ai turni di un
   determinato componente del team.
5. Per ogni turno viene renderizzato uno `ShiftCard` con la lista dei membri
   (`TeamMemberCard`), risolvendo icona (via `iconMapper`) e formato data italiano
   (via `dateFormatter`).
6. Stati di supporto: `LoadingState` durante il fetch, `EmptyState` quando non ci sono
   turni da mostrare.

## 3. Struttura del codice

Il progetto è organizzato nelle seguenti cartelle:

- `src/`
  - `main.tsx`: entry point, monta `App`
  - `App.tsx`: componente radice (fetch dati, ordinamento, stato del filtro, rendering)
  - `index.css` / `App.css`: stili globali e direttive Tailwind

- `src/components/`
  Componenti dell'interfaccia
  - `Header`: intestazione con il titolo del piano turni
  - `ShiftCard`: card di un singolo turno (data + team)
  - `TeamMemberCard`: card di un componente del team (nome, ruolo, colore, icona)
  - `TeamSummary`: riepilogo dei componenti del team
  - `QuickFilter`: filtro rapido per nome
  - `EmptyState`: stato "nessun turno"
  - `LoadingState`: stato di caricamento
  - `ui/`: componenti base shadcn/ui (es. `card.tsx`)

- `src/types/`
  - `index.ts`: tipi dominio (`Role`, `TeamMember`, `Shift`, `TurniData`)

- `src/utils/`
  - `dateFormatter.ts`: formattazione delle date in locale italiano
  - `iconMapper.ts`: mappatura ruolo → icona lucide-react

- `src/lib/`
  - `utils.ts`: helper condivisi (es. `cn` per la composizione di classi)

- `public/`
  - `turni.json`: dati dei turni caricati a runtime
  - `backups/`: backup timestampati generati da `generate-turni.ps1`

- root
  - `index.html`: template HTML servito da Vite
  - `vite.config.ts`, `tsconfig*.json`, `tailwind.config.js`, `postcss.config.js`,
    `eslint.config.js`: configurazione di build, TypeScript, styling e lint
  - `generate-turni.ps1`: genera lo scheletro dei turni per un nuovo mese
  - `issue-manager.ps1`, `issues.json`, `issues.html`: gestione delle issue di progetto
  - `init.ps1`: verifica ambiente e build (vedi `AGENTS.md`)

## 4. Build e output statico

La build è definita in `package.json` (`npm run build` → `tsc -b && vite build`):

1. **`tsc -b`**: type-check dell'intero progetto TypeScript (fallisce in caso di errori di tipo).
2. **`vite build`**: bundling e generazione dei file statici in `dist/`.

L'output in `dist/` è un sito completamente statico: non richiede un server applicativo
e può essere pubblicato su qualsiasi hosting statico. Il comando `.\init.ps1 build`
esegue questa build ed è usato come verifica che React, Vite e TypeScript funzionino
correttamente (vedi `AGENTS.md`).
