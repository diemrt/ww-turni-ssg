import { useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";
import Header from "@/components/Header";
import ShiftCard from "@/components/ShiftCard";
import QuickFilter from "@/components/QuickFilter";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import { Button } from "@/components/ui";
import { mergeConfig, type MergedMonth, type ResolvedShift } from "@/utils/mergeConfig";
import { getTodayDateString } from "@/utils/dateFormatter";
import type { AppConfig, MonthData } from "@/types";

/**
 * Public view (`#/` or empty hash).
 *
 * Fetches `public/config.json` (team roster + colors) and `public/turni.json`
 * (a month's shifts/absences) in parallel, then merges them via mergeConfig
 * so each shift assignment's `color` is resolved by name. See
 * docs/superpowers/specs/2026-07-02-admin-editor-turni-design.md sez. 5.
 */
function PublicView() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [merged, setMerged] = useState<MergedMonth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterName, setFilterName] = useState("");

  // Fetch config.json + turni.json in parallel from the public folder
  useEffect(() => {
    Promise.all([
      fetch('/config.json').then(res => {
        if (!res.ok) throw new Error(`config.json: ${res.status}`);
        return res.json() as Promise<AppConfig>;
      }),
      fetch('/turni.json').then(res => {
        if (!res.ok) throw new Error(`turni.json: ${res.status}`);
        return res.json() as Promise<MonthData>;
      }),
    ])
      .then(([config, month]) => {
        setConfig(config);
        setMerged(mergeConfig(config, month));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load config.json/turni.json:', err);
        setError(true);
        setLoading(false);
      });
  }, []);

  // Sort shifts by date
  const sortedShifts = useMemo<ResolvedShift[]>(() => {
    if (!merged) return [];
    return [...merged.shifts].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [merged]);

  // Team roster for the QuickFilter dialog (name + person color for the dot),
  // sorted alphabetically.
  const filterMembers = useMemo(() => {
    if (!config) return [];
    return [...config.availableTeamMembers]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(m => ({ name: m.name, color: m.color }));
  }, [config]);

  // QuickFilter is a personalization moment, not a hard filter: every shift
  // in the month stays visible. Selecting a name only tells ShiftCard whose
  // services to emphasize (gold "Tu suoni" ribbon) and whose to dim.
  const shiftsWithSelectedMember = useMemo(() => {
    if (!filterName) return [];
    return sortedShifts.filter(shift =>
      shift.team?.some(member => member.name === filterName)
    );
  }, [sortedShifts, filterName]);

  // "Prossimo servizio" hero: the first (chronologically) shift whose date
  // is today or in the future. Comparison is done on the "YYYY-MM-DD"
  // strings directly (both shift.date and today are formatted the same
  // way) to stay timezone-safe. That shift is promoted to the hero and
  // excluded from the list below so it isn't duplicated.
  const nextShiftIndex = useMemo(() => {
    const today = getTodayDateString();
    return sortedShifts.findIndex(shift => shift.date >= today);
  }, [sortedShifts]);

  const heroShift = nextShiftIndex >= 0 ? sortedShifts[nextShiftIndex] : null;

  const restShifts = useMemo(() => {
    if (nextShiftIndex < 0) return sortedShifts;
    return sortedShifts.filter((_, idx) => idx !== nextShiftIndex);
  }, [sortedShifts, nextShiftIndex]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !merged || !config) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <EmptyState
          title="Errore nel caricamento"
          message="Impossibile caricare i dati dei turni"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header title={merged.title} />

      <main className="max-w-2xl md:max-w-4xl xl:max-w-6xl mx-auto px-4 py-8 pb-24" role="main">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-700 focus:text-white focus:rounded-lg"
        >
          Salta al contenuto principale
        </a>

        <div id="main-content">
          {filterName && (
            <div
              className="mb-6 flex items-center justify-between gap-3 rounded-lg2 border border-line bg-surface p-4 shadow-card animate-fade-in"
              role="status"
              aria-live="polite"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-live" aria-hidden="true" />
                <p className="min-w-0 break-words text-sm text-ink-800">
                  Turni evidenziati per <span className="font-semibold text-ink-950">{filterName}</span>
                  {shiftsWithSelectedMember.length === 0 && " — nessun turno assegnato in questo periodo"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterName("")}
                aria-label="Rimuovi filtro"
                className="h-9 min-h-[44px] w-9 min-w-[44px] shrink-0 rounded-pill p-0"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}

          {heroShift && (
            <div
              className="mb-8 animate-fade-in"
              data-date={heroShift.date}
              aria-label="Prossimo servizio"
            >
              <ShiftCard
                shift={heroShift}
                highlightName={filterName}
                availableTeamMembers={config.availableTeamMembers}
                roleSlots={config.roleSlots}
                variant="hero"
              />
            </div>
          )}

          {!heroShift && sortedShifts.length > 0 && (
            <p className="mb-6 text-sm italic text-ink-400">
              Nessun servizio in programma
            </p>
          )}

          <div
            className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3"
            role="list"
            aria-label="Lista turni"
          >
            {restShifts.map((shift, idx) => (
              <div
                key={`${shift.date}-${idx}`}
                className="min-w-0 animate-fade-up"
                style={{ animationDelay: `${idx * 100}ms` }}
                data-date={shift.date}
                role="listitem"
              >
                <ShiftCard
                  shift={shift}
                  highlightName={filterName}
                  availableTeamMembers={config.availableTeamMembers}
                  roleSlots={config.roleSlots}
                />
              </div>
            ))}
          </div>

          {sortedShifts.length === 0 && (
            <EmptyState />
          )}
        </div>
      </main>

      <QuickFilter onFilterChange={setFilterName} members={filterMembers} />
    </div>
  );
}

export default PublicView;
