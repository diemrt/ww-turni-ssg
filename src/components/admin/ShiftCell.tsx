import type { ChangeEvent } from "react";
import type { TeamMember } from "@/types";

/**
 * Cell background classes per team-member color (see tailwind.config.js
 * `team-*` palette + src/components/TeamMemberCard.tsx's colorMap, which this
 * mirrors at lower opacity so the dropdown text stays legible in a compact
 * grid cell).
 */
const CELL_COLOR_CLASSES: Record<string, string> = {
  yellow: "bg-team-yellow/50",
  blue: "bg-team-blue/50",
  green: "bg-team-green/50",
  red: "bg-team-red/50",
  orange: "bg-team-orange/50",
  pink: "bg-team-pink/50",
  purple: "bg-team-purple/50",
  cyan: "bg-team-cyan/50",
  brown: "bg-team-brown/50",
  gray: "bg-team-gray/50",
};

const EMPTY_CELL_CLASS = "bg-white";

interface ShiftCellProps {
  /** People eligible for this row's role (already filtered by caller). */
  people: TeamMember[];
  /** Currently selected person's name, or "" if the slot is empty. */
  value: string;
  /** Names absent on this cell's date; shown disabled in the dropdown. */
  absentNames: Set<string>;
  /** Called with the newly selected name ("" clears the slot). */
  onChange: (name: string) => void;
  /** Accessible label, e.g. "Voce 1 - ven 5". */
  label: string;
}

/**
 * Single editable grid cell: a filtered person dropdown, colored by the
 * selected person (see docs/superpowers/specs/2026-07-02-admin-editor-turni-design.md
 * sez. 6.2). Absent people are present in the list but disabled, so the admin
 * can see who's missing rather than have them silently vanish.
 */
function ShiftCell({ people, value, absentNames, onChange, label }: ShiftCellProps) {
  const selectedMember = people.find((person) => person.name === value);
  const colorClass = selectedMember ? (CELL_COLOR_CLASSES[selectedMember.color] ?? CELL_COLOR_CLASSES.gray) : EMPTY_CELL_CLASS;

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <select
      aria-label={label}
      value={value}
      onChange={handleChange}
      className={`w-full rounded-md border border-zinc-300 px-1.5 py-1 text-sm text-zinc-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 ${colorClass}`}
    >
      <option value=""></option>
      {people.map((person) => (
        <option key={person.name} value={person.name} disabled={absentNames.has(person.name)}>
          {person.name}
          {absentNames.has(person.name) ? " (assente)" : ""}
        </option>
      ))}
    </select>
  );
}

export default ShiftCell;
