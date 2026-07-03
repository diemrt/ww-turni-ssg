import { useMemo } from "react";
import ShiftCell from "@/components/admin/ShiftCell";
import { roleLabels } from "@/utils/iconMapper";
import { formatDate } from "@/utils/dateFormatter";
import type { AppConfig, Role, Shift } from "@/types";

/**
 * Builds the flat key used to address a single (date, role, slot) cell in the
 * `selections` map. Kept as the one place that knows the key format so
 * ShiftGrid and its caller (AdminEditor) never drift apart.
 */
export const buildSelectionKey = (date: string, role: Role, slotIndex: number): string =>
  `${date}::${role}::${slotIndex}`;

/** One grid row: a role + 1-based slot index within that role. */
export interface GridRow {
  role: Role;
  slotIndex: number;
  label: string;
}

/**
 * Builds the grid rows from config: one row per role/slot, e.g. vocals with
 * roleSlots.vocals = 5 yields "Voce 1".."Voce 5" (see spec sez. 6.2).
 * Single-slot roles get no number suffix.
 */
export const buildGridRows = (config: AppConfig): GridRow[] => {
  const rows: GridRow[] = [];
  for (const role of config.availableRoles) {
    const slots = config.roleSlots[role] ?? 0;
    for (let slotIndex = 1; slotIndex <= slots; slotIndex += 1) {
      const label = slots > 1 ? `${roleLabels[role]} ${slotIndex}` : roleLabels[role];
      rows.push({ role, slotIndex, label });
    }
  }
  return rows;
};

/**
 * Derives MonthData.shifts from the flat `selections` map: one Shift per date
 * column, with a `team` entry for every filled (non-empty) cell on that date.
 * `selections` stays the single source of truth; this is a pure projection,
 * safe to recompute on every render.
 */
export const shiftsFromSelections = (
  dateColumns: string[],
  rows: GridRow[],
  selections: Record<string, string>,
): Shift[] =>
  dateColumns.map((date) => ({
    date,
    team: rows
      .map((row) => ({ row, name: selections[buildSelectionKey(date, row.role, row.slotIndex)] ?? "" }))
      .filter(({ name }) => name !== "")
      .map(({ row, name }) => ({ name, role: row.role })),
  }));

/**
 * Inverse of shiftsFromSelections: rebuilds the flat `selections` map from a
 * MonthData.shifts array (e.g. a resumed draft or an imported turni.json,
 * see spec sez. 6.6). For each date's team assignment, the assignment is
 * placed in the first free grid row (lowest unused slotIndex) for its role on
 * that date, via buildSelectionKey — mirroring the row order
 * shiftsFromSelections reads them back in, so shifts -> selections -> shifts
 * round-trips when the input respects `config.roleSlots`. An assignment with
 * no free row left for its role/date (e.g. config's roleSlots shrank since
 * the file was exported) is dropped rather than thrown away with an error,
 * consistent with the rest of the editor treating over/under-filled slots as
 * a warning, not a hard failure.
 */
export const selectionsFromShifts = (config: AppConfig, shifts: Shift[]): Record<string, string> => {
  const rowsByRole = new Map<Role, GridRow[]>();
  for (const row of buildGridRows(config)) {
    const rows = rowsByRole.get(row.role) ?? [];
    rows.push(row);
    rowsByRole.set(row.role, rows);
  }

  const selections: Record<string, string> = {};
  for (const shift of shifts) {
    const usedSlotsByRole = new Map<Role, Set<number>>();
    for (const assignment of shift.team) {
      const rowsForRole = rowsByRole.get(assignment.role) ?? [];
      const usedSlots = usedSlotsByRole.get(assignment.role) ?? new Set<number>();
      const freeRow = rowsForRole.find((row) => !usedSlots.has(row.slotIndex));
      if (!freeRow) continue;

      usedSlots.add(freeRow.slotIndex);
      usedSlotsByRole.set(assignment.role, usedSlots);
      selections[buildSelectionKey(shift.date, assignment.role, freeRow.slotIndex)] = assignment.name;
    }
  }
  return selections;
};

interface ShiftGridProps {
  config: AppConfig;
  dateColumns: string[];
  /** date -> selected name at (role, slotIndex), see buildSelectionKey. */
  selections: Record<string, string>;
  /** date -> names absent that day, edited via AbsencePanel (see spec sez. 6.3). */
  absences: Record<string, string[]>;
  onSelectionChange: (key: string, name: string) => void;
}

/**
 * Editable shift grid: rows = role/slot combinations from config, columns =
 * the month's active date columns. Each cell is a ShiftCell dropdown filtered
 * to people who have that row's role, colored by the selected person, with
 * that date's absentees disabled (see
 * docs/superpowers/specs/2026-07-02-admin-editor-turni-design.md sez. 6.2).
 */
function ShiftGrid({ config, dateColumns, selections, absences, onSelectionChange }: ShiftGridProps) {
  const rows = useMemo(() => buildGridRows(config), [config]);

  const peopleByRole = useMemo(() => {
    const map = new Map<Role, typeof config.availableTeamMembers>();
    for (const role of config.availableRoles) {
      map.set(
        role,
        config.availableTeamMembers.filter((member) => member.roles.includes(role)),
      );
    }
    return map;
  }, [config]);

  if (dateColumns.length === 0) {
    return <p className="text-sm text-ink-600">Nessuna data disponibile per questo mese.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg2 border border-line bg-surface pb-2 shadow-card">
      <table className="min-w-max border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 top-0 z-30 whitespace-nowrap border-b border-r border-line bg-surface px-3 py-2 text-left font-display text-caption uppercase tracking-wide text-ink-600"
            >
              Ruolo
            </th>
            {dateColumns.map((date) => {
              const { dayName, dayNumber } = formatDate(date);
              return (
                <th
                  key={date}
                  scope="col"
                  className="sticky top-0 z-20 min-w-[4.5rem] border-b border-line bg-surface px-2 py-2 text-center"
                >
                  <span className="block font-display text-caption uppercase tracking-wide text-ink-600">
                    {dayName.slice(0, 3)}
                  </span>
                  <span className="block font-mono text-sm text-ink-950">{dayNumber}</span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const zebraClass = rowIndex % 2 === 0 ? "bg-surface" : "bg-paper";
            return (
              <tr key={`${row.role}::${row.slotIndex}`} className={zebraClass}>
                <th
                  scope="row"
                  className={`sticky left-0 z-10 whitespace-nowrap border-r border-line px-3 py-1.5 text-left font-display text-sm text-ink-700 ${zebraClass}`}
                >
                  {row.label}
                </th>
                {dateColumns.map((date) => {
                  const key = buildSelectionKey(date, row.role, row.slotIndex);
                  const absentNames = new Set(absences[date] ?? []);
                  return (
                    <td key={key} className="w-32 px-1.5 py-1 align-middle">
                      <ShiftCell
                        label={`${row.label} - ${date}`}
                        people={peopleByRole.get(row.role) ?? []}
                        value={selections[key] ?? ""}
                        absentNames={absentNames}
                        onChange={(name) => onSelectionChange(key, name)}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ShiftGrid;
