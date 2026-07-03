# AGENTS.md

Sito statico in React + Vite + TypeScript per visualizzare i turni del worship team
(vista pubblica mobile-first, `#/`) e pianificarli (editor admin desktop-first, `#/admin`,
senza protezione — vedi ARCHITECTURE.md), con dati letti a runtime da `public/config.json`
+ `public/turni.json` e build in file statici pubblicabili su qualsiasi hosting.

# Documenti

- [ARCHITECTURE.md](/docs/ARCHITECTURE.md): descrive l'architettura, lo stack e la struttura del codice del progetto
- [GIT.md](/docs/GIT.md): indica le linee guida da usare per il versioning con git
- [ISSUES.md](/docs/ISSUES.md): descrive come gestire le issues del progetto e usare `issue-manager.ps1`
- [SPEC.md](/docs/SPEC.md): spiega come creare i file di spec (superpowers) del progetto
- [UI_TESTING.md](/docs/UI_TESTING.md): standard d'uso della skill Playwright per testare la UI

## All'inizio di ogni sessione (clock in)

1. Leggi [ISSUES.md](/docs/ISSUES.md) per ricordare come gestire le issue del progetto
2. Verifica lo stato attuale delle issue:
   ```powershell
   .\issue-manager.ps1 -getAll -status backlog
   .\issue-manager.ps1 -getAll -status in_progress
   ```
3. Verifica che l'ambiente sia configurato correttamente con `.\init.ps1 setup`. In caso
   di errore, fermarsi e notificare il problema, per evitare ulteriore consumo di token.
4. Identifica le issue su cui lavorare, ma **avviane una sola alla volta** (regola 1-WIP, vedi sotto).
5. Rispetta le seguenti policy a seconda dello scenario e della richiesta:
   - Ogni volta che viene richiesta una modifica o un'analisi sul progetto, verificare che siano stati letti e compresi i documenti informativi necessari alla comprensione. Evitare di leggere informazioni non necessarie alla richiesta.
   - Quando occorre esegui sempre comandi PowerShell, non provare comandi cmd, o bash o di altri terminali se possibile.

## Regola 1-WIP (una issue alla volta)

Lavora le issue **in modo sequenziale**: una sola issue può essere `in_progress` per volta.
Non avviare (non portare a `in_progress`) la issue successiva finché quella corrente non è
stata **verificata e chiusa** secondo il flusso di clock-out. Questo evita lavoro parallelo
non verificato e rende ogni chiusura tracciabile.

## Prima della fine di ogni sessione (clock out)

> **Principio anti self-validation bias:** l'agente che ha svolto il lavoro **non** può
> dichiarare da solo che una issue è superata. La verifica deve essere **indipendente** e
> affidata a un subagent dedicato. Nessun `validation.state = pass` auto-assegnato.

Per **ogni** issue lavorata nella sessione, una alla volta:

1. Concludi il lavoro sulla issue e raccogli gli artefatti prodotti (file modificati,
   output dei comandi rilevanti).
2. **Avvia un subagent di verifica indipendente** (vedi `ISSUES.md` → "Verifica
   indipendente (subagent)"). Il subagent:
   - controlla i `validation.criteria` della issue contro gli artefatti reali;
   - esegue `.\init.ps1 build` per confermare che il codice continui a compilare
     correttamente (build + type-check);
   - **verifica soltanto, non corregge** il lavoro;
   - aggiorna la issue tramite `.\issue-manager.ps1 -update`:
     - verifica **superata** → `status = done`, `validation.state = pass`, `criteria`
       con l'evidenza della verifica;
     - verifica **fallita** → `status = blocked`, `validation.state = fail`, `criteria`
       con il motivo del fallimento.
3. Solo dopo la chiusura verificata della issue corrente passa alla successiva (regola 1-WIP).

### Gate sul commit

Effettua il commit (seguendo `GIT.md` alla lettera) **solo se** tutte le issue lavorate
nella sessione hanno `validation.state = pass`, oppure sono `blocked` con motivo esplicito
nei `criteria`. **Nessun commit** con issue marcate `done` / `pass` non verificate dal
subagent.

## Init / verifica ambiente (init.ps1)

Lo script `init.ps1` verifica che React, Vite e TypeScript funzionino davvero. Comandi
disponibili:

- `.\init.ps1 setup` — verifica la presenza di `package.json`, che Node.js (>= v18) e npm
  siano installati, quindi esegue `npm install`. Da usare in fase di clock-in.
- `.\init.ps1 build` — esegue `npm run build` (`tsc -b && vite build`), generando l'output
  statico in `dist/`. Fallisce se il type-check o il bundling non passano. Da usare come
  verifica in fase di clock-out (prova che il codice compila e che Vite/React girano).

Oltre a `init.ps1`, il progetto ha **Vitest** per la logica pura (editor admin, merge
config/dati): `npm test` (alias di `vitest run`) esegue i test in `src/**/__tests__/`.
Da lanciare come verifica aggiuntiva quando si tocca `src/utils/` o
`src/components/admin/` — non sostituisce `.\init.ps1 build`, lo affianca.
