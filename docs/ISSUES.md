# ISSUES.md

Questo documento descrive come gestire le issues del progetto utilizzando lo script `issue-manager.ps1`.

## Introduzione

Le issues vengono memorizzate in `issues.json` e gestite tramite lo script PowerShell `issue-manager.ps1`. **Non modificare il file `issues.json` direttamente**; usa sempre lo script per mantenere la consistenza dei dati.

## Comandi di base

### Leggere le issue in backlog (default, prima pagina)
```powershell
.\issue-manager.ps1 -getAll
```

### Leggere issue per stato specifico
```powershell
.\issue-manager.ps1 -getAll -status in_progress
```

### Leggere una singola issue
```powershell
.\issue-manager.ps1 -get -issueId <id>
```

### Creare una nuova issue
```powershell
.\issue-manager.ps1 -insert -issueData '{"title":"...","description":"...","status":"backlog","validation":{"criteria":"...","state":"unknown"}}'
```

### Aggiornare una issue (es. chiuderla)
```powershell
.\issue-manager.ps1 -update -issueId <id> -issueData '{"title":"...","description":"...","status":"done","validation":{"criteria":"...","state":"pass"}}'
```

### Eliminare una issue
```powershell
.\issue-manager.ps1 -delete -issueId <id>
```

## Paginazione (IMPORTANTE)

`-getAll` è **paginabile**. Utilizza i seguenti parametri per navigare:

- `-page <numero>`: Numero di pagina (default: 0, base 0)
- `-pageSize <numero>`: Numero di issue per pagina (default: 10)
- `-order <asc|desc>`: Ordine di ordinamento (default: asc)
- `-status <stato>`: Filtra per stato (default: backlog)

### Esempi con paginazione

```powershell
# Pagina 0 (primo set di 10 issue, default)
.\issue-manager.ps1 -getAll

# Pagina 1 (secondo set di 10 issue)
.\issue-manager.ps1 -getAll -page 1

# Pagina 0 con 20 issue per pagina
.\issue-manager.ps1 -getAll -pageSize 20

# Issue in_progress, pagina 2, 15 per pagina
.\issue-manager.ps1 -getAll -status in_progress -page 2 -pageSize 15

# Issue ordinate in descending, prima pagina
.\issue-manager.ps1 -getAll -order desc
```

### Output JSON

Ogni risposta include:
- `TotalCount`: Numero totale di issue (filtrate per status se applicabile)
- `Issues`: Array della pagina richiesta

Usa `TotalCount` e `pageSize` per calcolare il numero totale di pagine: `ceil(TotalCount / pageSize)`

## Workflow di gestione

### All'inizio di ogni sessione (clock in)

1. Leggi attentamente il presente documento per ricordare i comandi
2. Verifica lo stato attuale delle issue:
   ```powershell
   .\issue-manager.ps1 -getAll -status backlog
   .\issue-manager.ps1 -getAll -status in_progress
   ```
3. Identifica le issue su cui lavorare, avviandone **una sola alla volta** (regola 1-WIP):
   una sola issue può essere `in_progress` per volta, e si passa alla successiva solo dopo
   la chiusura verificata di quella corrente (vedi clock-out).

### Prima della fine di ogni sessione (clock out)

> **Principio anti self-validation bias:** l'agente che ha svolto il lavoro **non** dichiara
> da solo che una issue è superata. La chiusura passa sempre da una **verifica indipendente**
> affidata a un subagent (vedi sotto). Si lavora **una issue alla volta** (regola 1-WIP).

Per **ogni** issue lavorata nella sessione, in sequenza:

1. Concludi il lavoro sulla issue e raccogli gli artefatti (file modificati, output dei
   comandi rilevanti).
2. **Avvia un subagent di verifica indipendente** (vedi "Verifica indipendente (subagent)").
   Il subagent confronta i `validation.criteria` con gli artefatti reali e aggiorna la issue:
   - verifica **superata**:
     ```powershell
     .\issue-manager.ps1 -update -issueId <id> -issueData '{"title":"...","description":"...","status":"done","validation":{"criteria":"<evidenza della verifica>","state":"pass"}}'
     ```
   - verifica **fallita**:
     ```powershell
     .\issue-manager.ps1 -update -issueId <id> -issueData '{"title":"...","description":"...","status":"blocked","validation":{"criteria":"<motivo del fallimento>","state":"fail"}}'
     ```
3. Passa alla issue successiva solo dopo la chiusura verificata di quella corrente (1-WIP).
4. **Gate sul commit:** effettua il commit (seguendo [GIT.md](/docs/GIT.md)) **solo se**
   tutte le issue lavorate hanno `validation.state = pass`, oppure sono `blocked` con motivo
   esplicito nei `criteria`. Nessun commit con issue `done` / `pass` non verificate dal subagent.

## Verifica indipendente (subagent)

Per evitare *green pass falsi*, la verifica di una issue è eseguita da un **subagent
dedicato**, distinto dall'agente che ha svolto il lavoro.

Responsabilità del subagent:

- Legge la issue (`.\issue-manager.ps1 -get -issueId <id>`) e i suoi `validation.criteria`.
- Verifica **in modo indipendente** che i criteri siano soddisfatti, controllando gli
  artefatti reali (codice, file generati, output dei comandi). **Verifica soltanto: non
  corregge il lavoro.**
- Aggiorna lo stato della issue tramite `.\issue-manager.ps1 -update`:
  - criteri soddisfatti → `status = done`, `validation.state = pass`, `criteria` con
    l'evidenza raccolta durante la verifica;
  - criteri non soddisfatti → `status = blocked`, `validation.state = fail`, `criteria`
    con il motivo del fallimento (cosa manca o non funziona).

Se la verifica fallisce, l'agente principale può riprendere la issue (riportandola a
`in_progress`) e ripetere il ciclo lavoro → verifica.

## Stati disponibili

Le issue possono avere i seguenti stati:

- `backlog`: Issue non ancora iniziata
- `in_progress`: Issue attualmente in corso
- `blocked`: Issue bloccata (specifica il motivo nelle note)
- `done`: Issue completata

## Campi della issue

Una issue ha i seguenti campi (schema canonico):

```json
{
  "id": "<guid>",
  "title": "<string>",
  "description": "<string>",
  "status": "backlog|in_progress|blocked|done",
  "validation": {
    "criteria": "<string>",
    "state": "unknown|pass|fail"
  },
  "created_at": "<datetime>",
  "updated_at": "<datetime>"
}
```

> `validation` può essere `null` (nessun criterio definito) oppure un oggetto con `criteria` e `state`.
>
> **Semantica di `validation`:** `criteria` descrive cosa rende la issue valida/accettabile.
> - **Alla creazione**: impostare `criteria` con i criteri di accettazione e `state: "unknown"`.
> - **Alla chiusura**: aggiornare `criteria` con l'evidenza della verifica effettuata e `state: "pass"` o `"fail"`.

### Campi gestiti automaticamente dallo script

| Campo        | Quando viene impostato                          |
|--------------|-------------------------------------------------|
| `id`         | Insert — GUID generato automaticamente          |
| `created_at` | Insert — timestamp corrente                     |
| `updated_at` | Insert e Update — timestamp corrente            |

**Non includere mai `id`, `created_at` o `updated_at` nel payload fornito allo script.**

### Campi richiesti nel payload (`-insert` / `-update`)

| Campo         | Tipo             | Obbligatorio | Valori validi                          |
|---------------|------------------|-------------|----------------------------------------|
| `title`       | string           | ✅ Sì        | Non vuoto                              |
| `description` | string           | ✅ Sì        | Non vuoto                              |
| `status`      | string           | ✅ Sì        | `backlog`, `in_progress`, `blocked`, `done` |
| `validation`  | object \| null   | ✅ Sì        | `null` oppure oggetto (vedi sotto)     |

#### Oggetto `validation` (quando non `null`)

| Campo      | Tipo   | Obbligatorio | Valori validi             |
|------------|--------|-------------|---------------------------|
| `criteria` | string | ✅ Sì        | Non vuoto                 |
| `state`    | string | ✅ Sì        | `unknown`, `pass`, `fail` |

### Messaggi di errore di validazione

Lo script esce con `exit 1` e un messaggio chiaro per ognuna delle seguenti violazioni:

| Violazione                                      | Messaggio                                                                                   |
|-------------------------------------------------|---------------------------------------------------------------------------------------------|
| Campo sconosciuto nel payload                   | `Error: Unknown field(s) not allowed in issue input: <campi>. Allowed input fields: ...`   |
| `title` mancante o vuoto                        | `Error: 'title' is required and must be a non-empty string.`                               |
| `description` mancante o vuota                 | `Error: 'description' is required and must be a non-empty string.`                         |
| `status` mancante o vuoto                       | `Error: 'status' is required.`                                                              |
| `status` con valore non valido                  | `Error: Invalid status value '<valore>'. Valid values are: backlog, in_progress, blocked, done.` |
| Campo sconosciuto in `validation`               | `Error: Unknown field(s) in 'validation' object: <campi>. Allowed fields: criteria, state.` |
| `validation.criteria` mancante o vuota         | `Error: 'validation.criteria' is required and must be a non-empty string when 'validation' is provided.` |
| `validation.state` mancante o vuoto            | `Error: 'validation.state' is required when 'validation' is provided.`                     |
| `validation.state` con valore non valido        | `Error: Invalid validation.state value '<valore>'. Valid values are: unknown, pass, fail.` |

## Help

Per visualizzare l'help dello script:
```powershell
.\issue-manager.ps1 -help
```
