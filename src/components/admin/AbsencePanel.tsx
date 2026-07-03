import { formatDate } from "@/utils/dateFormatter";
import type { TeamMember } from "@/types";

interface AbsencePanelProps {
  /** Active date columns for the current month (see AdminEditor.dateColumns). */
  dateColumns: string[];
  /** Full roster to choose absentees from (config.availableTeamMembers). */
  availableTeamMembers: TeamMember[];
  /** date -> names absent that day. Same map ShiftGrid reads to disable options. */
  absences: Record<string, string[]>;
  /** Called to flip a single person's absence on a single date. */
  onToggle: (date: string, name: string) => void;
}

/**
 * Per-date multi-select of absent people (spec sez. 6.3). Renders one toggle
 * chip per roster member per active date; toggling a chip adds/removes that
 * name in `absences[date]`. Shares the exact same `absences` map AdminEditor
 * passes to ShiftGrid, so marking someone absent here immediately disables
 * them in the grid's dropdowns — no parallel state.
 */
function AbsencePanel({ dateColumns, availableTeamMembers, absences, onToggle }: AbsencePanelProps) {
  if (dateColumns.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-zinc-900">Assenze</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Seleziona chi è assente per ogni data. Le persone assenti vengono disabilitate nella griglia.
      </p>

      <div className="mt-4 overflow-x-auto pb-4">
        <div className="flex min-w-max gap-3" role="list" aria-label="Assenze per data">
          {dateColumns.map((date) => {
            const { dayName, dayNumber } = formatDate(date);
            const absentNames = new Set(absences[date] ?? []);

            return (
              <div
                key={date}
                role="listitem"
                className="w-40 flex-shrink-0 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
              >
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  {dayName.slice(0, 3)} {dayNumber}
                </p>
                <div className="mt-2 flex flex-col gap-1">
                  {availableTeamMembers.map((member) => {
                    const isAbsent = absentNames.has(member.name);
                    return (
                      <label
                        key={member.name}
                        className="flex items-center gap-2 text-sm text-zinc-700"
                      >
                        <input
                          type="checkbox"
                          checked={isAbsent}
                          onChange={() => onToggle(date, member.name)}
                          className="rounded border-zinc-300 text-slate-700 focus:ring-slate-500"
                        />
                        {member.name}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AbsencePanel;
