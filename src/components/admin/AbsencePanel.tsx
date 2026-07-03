import { Check } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/utils";
import { personColor } from "@/utils/personColor";
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
 *
 * Presentation only: each roster member renders as a real `<button>` toggle
 * (aria-pressed, >=32px tall, keyboard operable) instead of a native
 * checkbox+label pair. Absent = pressed state (attention tint + check mark);
 * the person's color dot stays visible in both states so the toggle grid
 * still reads at a glance. `onToggle(date, name)` fires identically either
 * way.
 */
function AbsencePanel({ dateColumns, availableTeamMembers, absences, onToggle }: AbsencePanelProps) {
  if (dateColumns.length === 0) {
    return null;
  }

  return (
    <Panel
      className="mt-8"
      title="Assenze"
      description="Chi è assente per data. Le persone assenti vengono disabilitate nella griglia."
    >
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-3" role="list" aria-label="Assenze per data">
          {dateColumns.map((date) => {
            const { dayName, dayNumber } = formatDate(date);
            const absentNames = new Set(absences[date] ?? []);

            return (
              <div
                key={date}
                role="listitem"
                className="w-40 flex-shrink-0 rounded-md2 border border-line bg-paper p-3"
              >
                <p className="font-display text-caption uppercase tracking-wide text-ink-600">
                  {dayName.slice(0, 3)} {dayNumber}
                </p>
                <div className="mt-2 flex flex-col gap-1">
                  {availableTeamMembers.map((member) => {
                    const isAbsent = absentNames.has(member.name);
                    const swatch = personColor(member.color);

                    return (
                      <button
                        key={member.name}
                        type="button"
                        aria-pressed={isAbsent}
                        onClick={() => onToggle(date, member.name)}
                        className={cn(
                          "flex min-h-[32px] items-center gap-1.5 rounded-md2 border px-2 py-1 text-left text-sm transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1",
                          isAbsent
                            ? "border-attention/30 bg-attention-50 text-attention"
                            : "border-line bg-surface text-ink-600 hover:bg-ink-800/5",
                        )}
                      >
                        <span
                          className={cn("h-2 w-2 shrink-0 rounded-full", swatch.dot)}
                          aria-hidden="true"
                        />
                        <span className="flex-1 truncate">{member.name}</span>
                        {isAbsent && (
                          <Check className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

export default AbsencePanel;
