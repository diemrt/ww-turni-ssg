import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ShiftCard from "@/components/ShiftCard";
import turniData from "@/data/turni.json";
import type { TurniData } from "@/types";

function App() {
  const [data] = useState<TurniData>(turniData as TurniData);
  const [sortedShifts, setSortedShifts] = useState(data.shifts);

  useEffect(() => {
    // Sort shifts by date
    const sorted = [...data.shifts].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    setSortedShifts(sorted);
  }, [data.shifts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={data.title} />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {sortedShifts.map((shift, idx) => (
            <ShiftCard
              key={`${shift.date}-${idx}`}
              shift={shift}
              availableMembers={data.availableTeamMembers}
            />
          ))}
        </div>

        {sortedShifts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nessun turno disponibile</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
