import type { ChangeEvent } from "react";
import { Select } from "@/components/ui/Select";

const ITALIAN_MONTHS = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
] as const;

const pad2 = (n: number): string => n.toString().padStart(2, "0");

const parseValue = (value: string): { year: number; monthIndex: number } => {
  const [yearStr, monthStr] = value.split("-");
  return { year: Number(yearStr), monthIndex: Number(monthStr) - 1 };
};

interface MonthPickerProps {
  /** Currently selected month, "YYYY-MM" (see src/utils/monthDates.ts). */
  value: string;
  /** Called with the new "YYYY-MM" value whenever month or year changes. */
  onChange: (month: string) => void;
}

/**
 * Small focused month+year selector for the admin editor. Emits a "YYYY-MM"
 * string via onChange; it does not know about monthDates/monthTitle —
 * AdminEditor derives those from the value it receives (see
 * docs/superpowers/specs/2026-07-02-admin-editor-turni-design.md sez. 6.1).
 *
 * Presentation only: the month dropdown is the design system's `Select`
 * primitive, and the year `<input>` is hand-styled to match it
 * (border-line/rounded-md2/bg-surface/focus ring in brand-600) — same
 * value/onChange contract as before.
 */
function MonthPicker({ value, onChange }: MonthPickerProps) {
  const { year, monthIndex } = parseValue(value);

  const handleMonthChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newMonthIndex = Number(e.target.value);
    onChange(`${year}-${pad2(newMonthIndex + 1)}`);
  };

  const handleYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newYear = Number(e.target.value);
    if (!Number.isFinite(newYear) || e.target.value.trim() === "") return;
    onChange(`${newYear}-${pad2(monthIndex + 1)}`);
  };

  return (
    <div className="flex items-end gap-3">
      <label className="flex flex-col gap-1 text-sm text-ink-600">
        Mese
        <Select value={monthIndex} onChange={handleMonthChange} className="w-40">
          {ITALIAN_MONTHS.map((name, idx) => (
            <option key={name} value={idx}>
              {name}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-ink-600">
        Anno
        <input
          type="number"
          className="h-10 w-24 rounded-md2 border border-line bg-surface px-3 py-2 text-sm text-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          value={year}
          onChange={handleYearChange}
        />
      </label>
    </div>
  );
}

export default MonthPicker;
