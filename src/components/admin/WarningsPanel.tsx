import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { WarningType, type ShiftWarning } from "@/utils/shiftStats";

interface WarningsPanelProps {
  /** Live non-blocking warnings for the current month (shiftStats.shiftWarnings). */
  warnings: ShiftWarning[];
}

const WARNING_LABELS: Record<WarningType, string> = {
  [WarningType.EMPTY_SLOT]: "Slot vuoto",
  [WarningType.DUPLICATE_SAME_DAY]: "Doppia assegnazione",
  [WarningType.ABSENT_ASSIGNED]: "Assente ma assegnato",
};

/** Stable-enough key: warnings carry no id, so combine type + date + subject. */
function warningKey(warning: ShiftWarning, index: number): string {
  const subject = warning.type === WarningType.EMPTY_SLOT ? warning.role : warning.name;
  return `${warning.type}::${warning.date}::${subject}::${index}`;
}

/**
 * Warning non bloccanti (spec sez. 6.5): slot vuoti, doppie assegnazioni nello
 * stesso giorno, persone assenti ma comunque assegnate. Puramente informativo
 * — questo componente non disabilita né nasconde nessuna azione (export o
 * altro): decide sempre l'admin. `warnings` viene ricalcolato dal chiamante
 * ad ogni modifica della griglia/assenze tramite shiftStats.shiftWarnings.
 */
function WarningsPanel({ warnings }: WarningsPanelProps) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-zinc-900">Warning</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Segnalazioni informative: non bloccano l'esportazione, decide l'admin.
      </p>

      {warnings.length === 0 ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-accent-success" />
          Nessun warning
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2" aria-label="Elenco warning">
          {warnings.map((warning, index) => (
            <li
              key={warningKey(warning, index)}
              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
            >
              <AlertTriangle className="mt-0.5 w-4 h-4 flex-shrink-0" />
              <div>
                <span className="font-medium">{WARNING_LABELS[warning.type]}: </span>
                {warning.message}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WarningsPanel;
