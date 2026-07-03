import type { ChangeEvent } from "react";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { personColor } from "@/utils/personColor";
import type { TeamMember } from "@/types";

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
 *
 * Built on the design system's `Select` primitive, wrapped in a relatively
 * positioned span so a small `personColor().dot` swatch can float over its
 * left edge — a native <select> can't render a swatch inside its own box,
 * but the wrapper can. The select's own background is tinted with the same
 * person color (`personColor().tint`) so the whole cell reads as "theirs"
 * at a glance, and reverts to a plain `bg-surface` once empty.
 */
function ShiftCell({ people, value, absentNames, onChange, label }: ShiftCellProps) {
  const selectedMember = people.find((person) => person.name === value);
  const swatch = selectedMember ? personColor(selectedMember.color) : null;

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      {swatch && (
        <span
          className={cn("pointer-events-none absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full", swatch.dot)}
          aria-hidden="true"
        />
      )}
      <Select
        aria-label={label}
        value={value}
        onChange={handleChange}
        className={cn(
          "h-8 min-h-0 py-1 text-sm",
          swatch ? cn(swatch.tint, swatch.text, "pl-6 pr-1.5") : "bg-surface px-1.5 text-ink-800",
        )}
      >
        <option value=""></option>
        {people.map((person) => (
          <option key={person.name} value={person.name} disabled={absentNames.has(person.name)}>
            {person.name}
            {absentNames.has(person.name) ? " (assente)" : ""}
          </option>
        ))}
      </Select>
    </div>
  );
}

export default ShiftCell;
