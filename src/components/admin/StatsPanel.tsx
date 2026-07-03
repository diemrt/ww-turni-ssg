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
 */
function StatsPanel({ counts, availableTeamMembers }: StatsPanelProps) {
  const countByName = new Map(counts.map((c) => [c.name, c.count]));

  const rows = availableTeamMembers
    .map((member) => ({ name: member.name, count: countByName.get(member.name) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-zinc-900">Conteggio turni</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Numero di turni assegnati a ciascuna persona nel mese corrente (si aggiorna in tempo reale).
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="list" aria-label="Conteggio turni per persona">
        {rows.map((row) => (
          <div
            key={row.name}
            role="listitem"
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm"
          >
            <span className="text-sm font-medium text-zinc-700">{row.name}</span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
              {row.count}
            </span>
          </div>
        ))}

        {rows.length === 0 && <p className="text-sm text-zinc-500">Nessuna persona configurata.</p>}
      </div>
    </div>
  );
}

export default StatsPanel;
