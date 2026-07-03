import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import MonthPicker from "@/components/admin/MonthPicker";
import ShiftGrid, { shiftsFromSelections, selectionsFromShifts, buildGridRows } from "@/components/admin/ShiftGrid";
import AbsencePanel from "@/components/admin/AbsencePanel";
import StatsPanel from "@/components/admin/StatsPanel";
import WarningsPanel from "@/components/admin/WarningsPanel";
import { monthDates, monthTitle } from "@/utils/monthDates";
import { formatDate } from "@/utils/dateFormatter";
import { shiftStats } from "@/utils/shiftStats";
import { saveDraft, loadDraft, clearDraft } from "@/utils/draftStorage";
import { exportMonthData, importMonthData } from "@/utils/exportImport";
import type { AppConfig, MonthData } from "@/types";

const now = new Date();
const DEFAULT_MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

/**
 * Admin editor (`#/admin`).
 *
 * Wires up: config.json fetch, month+year selection (derives `month`/`title`
 * via src/utils/monthDates.ts), the generated date columns with per-date
 * removal, the editable ShiftGrid (rows = role/slot from config, columns =
 * active date columns), the AbsencePanel (per-date multi-select of
 * absentees, spec sez. 6.3), the live StatsPanel/WarningsPanel (derived
 * counts + non-blocking warnings from src/utils/shiftStats.ts, spec sez.
 * 6.4/6.5), and the draft/export/import wiring (spec sez. 6.6): autosaving
 * the current MonthData to localStorage per month
 * (src/utils/draftStorage.ts), offering to resume/discard a found draft on
 * month open, exporting a conforming turni.json, and importing one back into
 * the grid. Because the grid's source of truth is the flat `selections` map
 * (see ShiftGrid.shiftsFromSelections), resuming a draft or importing a file
 * both go through ShiftGrid.selectionsFromShifts to reverse-map
 * MonthData.shifts back into that flat map.
 * `absences` is the single source of truth shared by ShiftGrid (reads it to
 * grey out absentees) and AbsencePanel (writes it via handleAbsenceToggle).
 *
 * Not linked from the public view; reachable only by navigating directly to
 * `#/admin` (no auth, by design — see sez. 4).
 */
function AdminEditor() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Selected month, "YYYY-MM".
  const [month, setMonth] = useState(DEFAULT_MONTH);

  // Dates the admin has explicitly removed from a month's planning (e.g. a
  // skipped holiday), keyed by month so switching months doesn't leak
  // removals across each other. Later issues (grid/absences) will grow
  // sibling per-month state alongside this one.
  const [removedDatesByMonth, setRemovedDatesByMonth] = useState<Record<string, string[]>>({});

  // Grid selections, per month: flat (date/role/slot) key -> selected name
  // (see ShiftGrid.buildSelectionKey). This is the single source of truth
  // the grid renders from; MonthData.shifts is derived from it on demand.
  const [selectionsByMonth, setSelectionsByMonth] = useState<Record<string, Record<string, string>>>({});

  // Absences per month: date -> names absent that day. Read by ShiftGrid to
  // disable absentees in the dropdown, and edited by AbsencePanel below (spec
  // sez. 6.3) — both consume the exact same map, so toggling a person absent
  // here disables them in the grid immediately. Starts empty per month.
  const [absencesByMonth, setAbsencesByMonth] = useState<Record<string, Record<string, string[]>>>({});

  // Message shown when an imported turni.json fails validation (spec sez.
  // 6.6, exportImport.parseMonthData's error path).
  const [importError, setImportError] = useState<string | null>(null);

  // Fetch config.json (roster, roles, valid weekdays) on mount, mirroring
  // PublicView's fetch/loading/error pattern.
  useEffect(() => {
    fetch("/config.json")
      .then((res) => {
        if (!res.ok) throw new Error(`config.json: ${res.status}`);
        return res.json() as Promise<AppConfig>;
      })
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load config.json:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  // Draft found in localStorage for the currently selected month, awaiting a
  // Riprendi/Scarta decision (spec sez. 6.6). Derived (not stored state): it
  // is only offered when this month has no in-memory grid state yet, so
  // "resolving" it is just a matter of handleResumeDraft/handleDiscardDraft
  // giving this month a `selectionsByMonth`/`absencesByMonth` entry (real or
  // empty) — the prompt then naturally stops recomputing on the next render.
  const pendingDraft = useMemo(() => {
    const hasExistingState = selectionsByMonth[month] !== undefined || absencesByMonth[month] !== undefined;
    return hasExistingState ? null : loadDraft(month);
  }, [month, selectionsByMonth, absencesByMonth]);

  const title = useMemo(() => monthTitle(month), [month]);

  const allDates = useMemo(
    () => (config ? monthDates(month, config.validDayOfWeek) : []),
    [config, month],
  );

  const removedDates = removedDatesByMonth[month] ?? [];

  const dateColumns = useMemo(() => {
    const removedSet = new Set(removedDates);
    return allDates.filter((date) => !removedSet.has(date));
  }, [allDates, removedDates]);

  // Wraps setMonth to also drop any stale import error from the previous
  // month, without needing a separate effect just to clear it.
  const handleMonthChange = (newMonth: string) => {
    setImportError(null);
    setMonth(newMonth);
  };

  const handleRemoveDate = (date: string) => {
    setRemovedDatesByMonth((prev) => ({
      ...prev,
      [month]: [...(prev[month] ?? []), date],
    }));
  };

  const selections = selectionsByMonth[month] ?? {};
  const absences = absencesByMonth[month] ?? {};

  const handleSelectionChange = (key: string, name: string) => {
    setSelectionsByMonth((prev) => ({
      ...prev,
      [month]: { ...(prev[month] ?? {}), [key]: name },
    }));
  };

  // Toggles `name`'s absence on `date` for the current month. Keeps the map
  // clean: an empty day's array is dropped rather than kept as `[]`, so
  // MonthData.absences only ever lists dates that actually have absentees.
  const handleAbsenceToggle = (date: string, name: string) => {
    setAbsencesByMonth((prev) => {
      const monthAbsences = prev[month] ?? {};
      const current = monthAbsences[date] ?? [];
      const next = current.includes(name)
        ? current.filter((n) => n !== name)
        : [...current, name];

      const updatedMonthAbsences = { ...monthAbsences };
      if (next.length === 0) {
        delete updatedMonthAbsences[date];
      } else {
        updatedMonthAbsences[date] = next;
      }

      return { ...prev, [month]: updatedMonthAbsences };
    });
  };

  // Derived MonthData.shifts, recomputed from `selections` on every render —
  // selections stays the single source of truth (see ShiftGrid.tsx).
  const shifts = useMemo(
    () => (config ? shiftsFromSelections(dateColumns, buildGridRows(config), selections) : []),
    [config, dateColumns, selections],
  );

  // MonthData shape shiftStats expects, rebuilt from the live grid/absence
  // state above so counts/warnings recompute on every assignment or absence
  // change (spec sez. 6.4/6.5). Never persisted — same "derived, not saved"
  // rule as MonthData.shifts itself.
  const monthData: MonthData = useMemo(
    () => ({ title, month, shifts, absences }),
    [title, month, shifts, absences],
  );

  // Autosave the current month's draft to localStorage on every change (spec
  // sez. 6.6). Skipped while a draft prompt is pending so we don't clobber a
  // not-yet-resumed/discarded draft with the still-empty grid state, and
  // skipped when there's nothing assigned/absent yet so opening a fresh month
  // doesn't immediately write a pointless empty draft.
  useEffect(() => {
    if (pendingDraft) return;
    const isEmpty = monthData.shifts.every((shift) => shift.team.length === 0) && Object.keys(monthData.absences).length === 0;
    if (isEmpty) return;
    saveDraft(monthData);
  }, [monthData, pendingDraft]);

  // Riprendi: reverse-map the pending draft's shifts back into the flat
  // `selections` map (ShiftGrid's source of truth) and apply its absences.
  // Giving this month real selections/absences entries is what makes
  // `pendingDraft` above recompute to null on the next render.
  const handleResumeDraft = () => {
    if (!pendingDraft || !config) return;
    setSelectionsByMonth((prev) => ({
      ...prev,
      [month]: selectionsFromShifts(config, pendingDraft.shifts),
    }));
    setAbsencesByMonth((prev) => ({ ...prev, [month]: pendingDraft.absences }));
  };

  // Scarta: drop the saved draft and keep the grid empty. Still gives this
  // month explicit (empty) selections/absences entries so `pendingDraft`
  // recomputes to null instead of finding the same draft again next render.
  const handleDiscardDraft = () => {
    clearDraft(month);
    setSelectionsByMonth((prev) => ({ ...prev, [month]: prev[month] ?? {} }));
    setAbsencesByMonth((prev) => ({ ...prev, [month]: prev[month] ?? {} }));
  };

  // Esporta: download turni.json for the currently edited month (spec sez. 6.6).
  const handleExport = () => {
    exportMonthData(monthData);
  };

  // Importa: parse+validate a turni.json picked from disk, reverse-map its
  // shifts into `selections`, apply its absences, and jump to its month so
  // the admin can see the repopulated grid (spec sez. 6.6). Errors (invalid
  // JSON or a missing/malformed field) are shown inline rather than thrown.
  const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file || !config) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = typeof reader.result === "string" ? reader.result : "";
        const imported = importMonthData(text);
        setSelectionsByMonth((prev) => ({
          ...prev,
          [imported.month]: selectionsFromShifts(config, imported.shifts),
        }));
        setAbsencesByMonth((prev) => ({ ...prev, [imported.month]: imported.absences }));
        setImportError(null);
        setMonth(imported.month);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : "Errore durante l'importazione del file.");
      }
    };
    reader.onerror = () => setImportError("Errore durante la lettura del file.");
    reader.readAsText(file);
  };

  const stats = useMemo(
    () => (config ? shiftStats(config, monthData) : { counts: [], warnings: [] }),
    [config, monthData],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-xl font-semibold text-zinc-900">Errore nel caricamento</h1>
          <p className="mt-2 text-zinc-600">Impossibile caricare config.json</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900">Editor turni (admin)</h1>
      <p className="mt-1 text-zinc-600">{title}</p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <MonthPicker value={month} onChange={handleMonthChange} />

        <button
          type="button"
          onClick={handleExport}
          className="rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
        >
          Esporta turni.json
        </button>

        <label className="cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50">
          Importa turni.json
          <input type="file" accept=".json,application/json" onChange={handleImportFile} className="hidden" />
        </label>
      </div>

      {importError && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {importError}
        </p>
      )}

      {pendingDraft && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-900">
            Trovata una bozza salvata per {title}. Vuoi riprenderla o scartarla?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleResumeDraft}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-amber-700"
            >
              Riprendi
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 shadow-sm hover:bg-amber-100"
            >
              Scarta
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 overflow-x-auto pb-4">
        <div className="flex min-w-max gap-2" role="list" aria-label="Date del mese">
          {dateColumns.map((date) => {
            const { dayName, dayNumber } = formatDate(date);
            return (
              <div
                key={date}
                role="listitem"
                className="flex w-28 flex-shrink-0 flex-col items-center rounded-lg border border-zinc-200 bg-white px-2 py-3 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveDate(date)}
                  aria-label={`Rimuovi ${date} dal mese`}
                  title="Rimuovi questa data"
                  className="self-end text-sm leading-none text-zinc-400 hover:text-red-600"
                >
                  ×
                </button>
                <span className="text-xs uppercase tracking-wide text-zinc-500">{dayName}</span>
                <span className="text-lg font-semibold text-zinc-900">{dayNumber}</span>
              </div>
            );
          })}

          {dateColumns.length === 0 && (
            <p className="text-sm text-zinc-500">Nessuna data disponibile per questo mese.</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <ShiftGrid
          config={config}
          dateColumns={dateColumns}
          selections={selections}
          absences={absences}
          onSelectionChange={handleSelectionChange}
        />
        <p className="mt-2 text-sm text-zinc-500">
          {shifts.reduce((total, shift) => total + shift.team.length, 0)} turni assegnati
        </p>
      </div>

      <AbsencePanel
        dateColumns={dateColumns}
        availableTeamMembers={config.availableTeamMembers}
        absences={absences}
        onToggle={handleAbsenceToggle}
      />

      <StatsPanel counts={stats.counts} availableTeamMembers={config.availableTeamMembers} />

      <WarningsPanel warnings={stats.warnings} />
    </div>
  );
}

export default AdminEditor;
