import { useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import ShiftCard from "@/components/ShiftCard";
import QuickFilter from "@/components/QuickFilter";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import { mergeConfig, type MergedMonth, type ResolvedShift } from "@/utils/mergeConfig";
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

  // Get unique member names from available team members
  const memberNames = useMemo(() => {
    if (!config) return [];
    return config.availableTeamMembers.map(m => m.name).sort();
  }, [config]);

  // Filter shifts based on selected name
  const filteredShifts = useMemo(() => {
    if (!filterName) return sortedShifts;
    return sortedShifts.filter(shift =>
      shift.team?.some(member => member.name === filterName)
    );
  }, [sortedShifts, filterName]);

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

      <main className="max-w-4xl mx-auto px-4 py-8 pb-24" role="main">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-700 focus:text-white focus:rounded-lg"
        >
          Salta al contenuto principale
        </a>

        <div id="main-content">
          {filterName && (
            <div className="mb-6 p-4 bg-slate-100 rounded-lg border border-slate-200 animate-fade-in" role="status" aria-live="polite">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse" />
                <p className="text-sm text-slate-700">
                  Mostrando turni per <span className="font-semibold">{filterName}</span>
                  {filteredShifts.length === 0 && " - Nessun turno trovato"}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6" role="list" aria-label="Lista turni">
            {filteredShifts.map((shift, idx) => (
              <div
                key={`${shift.date}-${idx}`}
                className="animate-fade-up"
                style={{ animationDelay: `${idx * 100}ms` }}
                data-date={shift.date}
                role="listitem"
              >
                <ShiftCard shift={shift} highlightName={filterName} availableTeamMembers={config.availableTeamMembers} />
              </div>
            ))}
          </div>

          {filteredShifts.length === 0 && !filterName && (
            <EmptyState />
          )}

          {filteredShifts.length === 0 && filterName && (
            <EmptyState
              title="Nessun turno trovato"
              message={`${filterName} non ha turni assegnati in questo periodo`}
            />
          )}
        </div>
      </main>

      <QuickFilter onFilterChange={setFilterName} memberNames={memberNames} />
    </div>
  );
}

export default PublicView;
