import { useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import ShiftCard from "@/components/ShiftCard";
import QuickFilter from "@/components/QuickFilter";
import EmptyState from "@/components/EmptyState";
import type { TurniData } from "@/types";

function App() {
  const [data, setData] = useState<TurniData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortedShifts, setSortedShifts] = useState<TurniData['shifts']>([]);
  const [filterName, setFilterName] = useState("");

  // Fetch turni.json from public folder
  useEffect(() => {
    fetch('/turni.json')
      .then(res => res.json())
      .then((json: TurniData) => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load turni.json:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!data) return;
    // Sort shifts by date
    const sorted = [...data.shifts].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    setSortedShifts(sorted);
  }, [data]);

  // Get unique member names from available team members
  const memberNames = useMemo(() => {
    if (!data || !data.availableTeamMembers) return [];
    return data.availableTeamMembers.map(m => m.name).sort();
  }, [data]);

  // Filter shifts based on selected name
  const filteredShifts = useMemo(() => {
    if (!filterName) return sortedShifts;
    return sortedShifts.filter(shift => 
      shift.team?.some(member => member.name === filterName)
    );
  }, [sortedShifts, filterName]);

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

  if (!data) {
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
      <Header title={data.title} />
      
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
                <ShiftCard shift={shift} highlightName={filterName} availableTeamMembers={data.availableTeamMembers} />
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

export default App;
