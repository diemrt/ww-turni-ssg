import { Panel } from "@/components/ui/Panel";
import { Meter } from "@/components/ui/Meter";
import { personColor } from "@/utils/personColor";
import type { ShiftCount } from "@/utils/shiftStats";
import type { TeamMember } from "@/types";

interface StatsPanelProps {
  /** Live per-person shift counts for the current month (shiftStats.shiftCounts). */
  counts: ShiftCount[];
  /** Full roster, so people with zero shifts this month still show up as 0. */
  availableTeamMembers: TeamMember[];
}

/**
 * Conteggio turni per persona (spec sez. 6.4): gives the same "vision
 * d'insieme" the Excel sheet had, so the admin can spot who is over/under
 * assigned. Purely derived — the caller recomputes `counts` via
 * shiftStats.shiftCounts on every grid change, so this panel is always live.
 *
 * Presentation only: renders as a small distribution-bar list (one row per
 * roster member, sorted by count desc) instead of a flat chip row, so the
 * relative load between people reads as a mini bar chart. Each row's bar
 * width is proportional to that person's count against the month's max
 * count (via the `Meter` primitive); the raw count still shows in
 * `font-mono` at the end, same as before.
 */
function StatsPanel({ counts, availableTeamMembers }: StatsPanelProps) {
  const countByName = new Map(counts.map((c) => [c.name, c.count]));

  const rows = availableTeamMembers
    .map((member) => ({ name: member.name, color: member.color, count: countByName.get(member.name) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const maxCount = rows.reduce((max, row) => Math.max(max, row.count), 0);

  return (
    <Panel
      className="mt-8"
      title="Conteggio turni"
      description="Numero di turni assegnati a ciascuna persona nel mese corrente (si aggiorna in tempo reale)."
    >
      {rows.length === 0 ? (
        <p className="text-sm text-ink-600">Nessuna persona configurata.</p>
      ) : (
        <div className="flex flex-col gap-2" role="list" aria-label="Conteggio turni per persona">
          {rows.map((row) => {
            const swatch = personColor(row.color);
            return (
              <div key={row.name} role="listitem" className="flex items-center gap-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${swatch.dot}`} aria-hidden="true" />
                <span className="w-28 flex-shrink-0 truncate text-sm text-ink-800">{row.name}</span>
                <Meter value={row.count} max={maxCount} label={String(row.count)} className="flex-1" />
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

export default StatsPanel;
