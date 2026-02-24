import { useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import ShiftCard from "@/components/ShiftCard";
import QuickFilter from "@/components/QuickFilter";
import DateNavigation from "@/components/DateNavigation";
import EmptyState from "@/components/EmptyState";
import turniData from "@/data/turni.json";
import type { TurniData } from "@/types";

function App() {
  const [data] = useState<TurniData>(turniData as TurniData);
  const [sortedShifts, setSortedShifts] = useState(data.shifts);
  const [filterName, setFilterName] = useState("");

  useEffect(() => {
    // Sort shifts by date
    const sorted = [...data.shifts].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    setSortedShifts(sorted);
  }, [data.shifts]);

  // Get unique member names from available team members
  const memberNames = useMemo(() => {
    return data.availableTeamMembers.map(m => m.name).sort();
  }, [data.availableTeamMembers]);

  // Filter shifts based on selected name
  const filteredShifts = useMemo(() => {
    if (!filterName) return sortedShifts;
    return sortedShifts.filter(shift => 
      shift.team?.some(member => member.memberName === filterName)
    );
  }, [sortedShifts, filterName]);

  // Count upcoming shifts
  const upcomingCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return filteredShifts.filter(shift => new Date(shift.date) >= today).length;
  }, [filteredShifts]);

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
          <DateNavigation 
            shiftsCount={filteredShifts.length}
            upcomingCount={upcomingCount}
          />

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
                <ShiftCard shift={shift} highlightName={filterName} />
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
