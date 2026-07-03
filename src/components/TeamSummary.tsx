import { getRoleIcon, getRoleLabel } from "@/utils/iconMapper";
import type { Role } from "@/types";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface TeamSummaryProps {
  team: Array<{ name: string; role: Role; color?: string }>;
  /** Expected slot count per role for this date, from config.roleSlots. */
  roleSlots: Record<Role, number>;
}

const ROLE_ORDER: Role[] = ["guitar", "bass", "drums", "vocals", "keyboard"];

/**
 * Quiet per-role breakdown row shown under the lineup: how many of each
 * role are assigned vs. expected (config.roleSlots), plus an overall
 * complete/incomplete indicator. Uses ink + semantic tokens only (positive /
 * attention) — no saturated full-bleed fills.
 */
export default function TeamSummary({ team, roleSlots }: TeamSummaryProps) {
  if (!team || team.length === 0) return null;

  const roleCounts: Partial<Record<Role, number>> = {};
  team.forEach(member => {
    roleCounts[member.role] = (roleCounts[member.role] || 0) + 1;
  });

  const trackedRoles = ROLE_ORDER.filter(role => (roleSlots[role] ?? 0) > 0);

  let isComplete = true;
  let hasOverflow = false;
  const issues: string[] = [];

  trackedRoles.forEach(role => {
    const required = roleSlots[role] ?? 0;
    const current = roleCounts[role] || 0;
    if (current < required) {
      isComplete = false;
      const missing = required - current;
      issues.push(`${missing} ${getRoleLabel(role)} mancante${missing > 1 ? 'i' : ''}`);
    } else if (current > required) {
      hasOverflow = true;
      const extra = current - required;
      issues.push(`${extra} ${getRoleLabel(role)} in più`);
    }
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {trackedRoles.map(role => {
            const Icon = getRoleIcon(role);
            const label = getRoleLabel(role);
            const required = roleSlots[role] ?? 0;
            const current = roleCounts[role] || 0;
            const status = current < required ? 'under' : current > required ? 'over' : 'perfect';

            return (
              <span
                key={role}
                className={`inline-flex items-center gap-1.5 rounded-md2 px-2 py-1 text-caption text-ink-800 ${
                  status === 'perfect' ? 'bg-positive-50' : 'bg-attention-50'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 flex-shrink-0 ${status === 'perfect' ? 'text-positive' : 'text-attention'}`}
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                <span className="font-mono">{current}/{required}</span>
                <span className="font-display">{label}</span>
              </span>
            );
          })}
        </div>

        {isComplete && !hasOverflow ? (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-positive" aria-hidden="true" />
            <span className="text-caption font-display text-ink-800">Completo</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-attention" aria-hidden="true" />
            <span className="text-caption font-display text-ink-800">
              {hasOverflow ? 'Sforato' : 'Incompleto'}
            </span>
          </div>
        )}
      </div>

      {issues.length > 0 && (
        <div className="text-caption text-ink-600">{issues.join(', ')}</div>
      )}
    </div>
  );
}
