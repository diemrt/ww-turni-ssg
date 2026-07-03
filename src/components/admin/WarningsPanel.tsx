import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Chip } from "@/components/ui/Chip";
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

/** Fixed display order for the three warning-type groups. */
const WARNING_TYPE_ORDER: WarningType[] = [
  WarningType.EMPTY_SLOT,
  WarningType.DUPLICATE_SAME_DAY,
  WarningType.ABSENT_ASSIGNED,
];

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
 *
 * Presentation only: a compact summary bar (one count chip per warning type,
 * always visible) replaces the old "one amber banner per warning" layout,
 * which produced 40+ rows on a busy/empty month. Each type with at least one
 * warning also gets a collapsible detail group (collapsed by default) that
 * reveals the original per-date/per-role messages on demand.
 */
function WarningsPanel({ warnings }: WarningsPanelProps) {
  const [expanded, setExpanded] = useState<Partial<Record<WarningType, boolean>>>({});

  const groups = WARNING_TYPE_ORDER.map((type) => ({
    type,
    label: WARNING_LABELS[type],
    items: warnings.filter((warning) => warning.type === type),
  }));

  const toggleGroup = (type: WarningType) => {
    setExpanded((previous) => ({ ...previous, [type]: !previous[type] }));
  };

  return (
    <Panel
      className="mt-8"
      title="Warning"
      description="Segnalazioni informative: non bloccano l'esportazione, decide l'admin."
    >
      {warnings.length === 0 ? (
        <div className="flex items-center gap-2 rounded-md2 bg-positive-50 px-3 py-2 text-sm text-ink-800">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-positive" aria-hidden="true" />
          Nessun warning
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Summary bar: one compact count chip per warning type, always visible. */}
          <div className="flex flex-wrap gap-2" role="list" aria-label="Riepilogo warning per tipo">
            {groups.map((group) => (
              <Chip
                key={group.type}
                role="listitem"
                className="bg-attention-50 text-ink-800"
                label={`${group.label}: ${group.items.length}`}
              />
            ))}
          </div>

          {/* Detail groups: collapsed by default, one per type with warnings. */}
          <div className="flex flex-col gap-2">
            {groups
              .filter((group) => group.items.length > 0)
              .map((group) => {
                const isExpanded = Boolean(expanded[group.type]);
                const panelId = `warnings-group-${group.type}`;

                return (
                  <div key={group.type} className="rounded-md2 border border-line bg-surface">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md2 px-3 py-2 text-left text-sm text-ink-800 hover:bg-ink-800/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      onClick={() => toggleGroup(group.type)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 flex-shrink-0 text-ink-600" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="w-4 h-4 flex-shrink-0 text-ink-600" aria-hidden="true" />
                      )}
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-attention" aria-hidden="true" />
                      <span className="font-medium">{group.label}</span>
                      <span className="rounded-pill bg-attention-50 px-2 py-0.5 text-caption font-semibold text-ink-800">
                        {group.items.length}
                      </span>
                    </button>

                    {isExpanded && (
                      <ul
                        id={panelId}
                        className="max-h-56 overflow-y-auto border-t border-line px-3 py-2"
                        aria-label={`Dettaglio ${group.label}`}
                      >
                        {group.items.map((warning, index) => (
                          <li
                            key={warningKey(warning, index)}
                            className="flex items-start gap-2 py-1 text-caption text-ink-600"
                          >
                            <span
                              className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-attention"
                              aria-hidden="true"
                            />
                            {warning.message}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </Panel>
  );
}

export default WarningsPanel;
