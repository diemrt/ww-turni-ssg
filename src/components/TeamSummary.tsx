import { getRoleIcon, getRoleLabel } from "@/utils/iconMapper";
import type { Role } from "@/types";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface TeamSummaryProps {
  team: Array<{ memberName: string; role: Role; color: string }>;
}

// Perfect team composition: 1 drums + 1 keyboard + 2 guitars + 1 bass + 3 vocals = 8 total
const IDEAL_COMPOSITION: Record<Role, number> = {
  drums: 1,
  keyboard: 1,
  guitar: 2,
  bass: 1,
  vocals: 3,
};

export default function TeamSummary({ team }: TeamSummaryProps) {
  if (!team || team.length === 0) return null;

  // Count roles
  const roleCounts: Record<string, number> = {};
  team.forEach(member => {
    roleCounts[member.role] = (roleCounts[member.role] || 0) + 1;
  });

  // Check completeness and overflow
  let isComplete = true;
  let hasOverflow = false;
  const issues: string[] = [];

  Object.entries(IDEAL_COMPOSITION).forEach(([role, ideal]) => {
    const current = roleCounts[role] || 0;
    if (current < ideal) {
      isComplete = false;
      const missing = ideal - current;
      issues.push(`${missing} ${getRoleLabel(role as Role)} mancante${missing > 1 ? 'i' : ''}`);
    } else if (current > ideal) {
      hasOverflow = true;
      const extra = current - ideal;
      issues.push(`${extra} ${getRoleLabel(role as Role)} in più`);
    }
  });

  const idealTotal = Object.values(IDEAL_COMPOSITION).reduce((a, b) => a + b, 0);
  const completionPercentage = Math.min(100, (team.length / idealTotal) * 100);

  return (
    <div className="mt-3 pt-3 border-t border-zinc-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {Object.entries(roleCounts).map(([role, count]) => {
            const Icon = getRoleIcon(role as Role);
            const label = getRoleLabel(role as Role);
            const ideal = IDEAL_COMPOSITION[role as Role] || 0;
            const status = count < ideal ? 'under' : count > ideal ? 'over' : 'perfect';
            
            return (
              <div
                key={role}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs ${
                  status === 'perfect' 
                    ? 'bg-accent-success/10 text-accent-success' 
                    : status === 'over'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="font-medium">
                  {count}/{ideal} {label}
                </span>
              </div>
            );
          })}
          
          {/* Show missing roles */}
          {Object.entries(IDEAL_COMPOSITION).map(([role, ideal]) => {
            if (!roleCounts[role]) {
              const Icon = getRoleIcon(role as Role);
              const label = getRoleLabel(role as Role);
              return (
                <div
                  key={`missing-${role}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-red-50 text-red-600"
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span className="font-medium">0/{ideal} {label}</span>
                </div>
              );
            }
            return null;
          })}
        </div>

        {isComplete && !hasOverflow ? (
          <div className="flex items-center gap-1.5 text-accent-success">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium">Completo</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium">
              {hasOverflow ? 'Overflow' : 'Incompleto'}
            </span>
          </div>
        )}
      </div>

      {/* Completeness bar */}
      <div className="mt-2 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${
            isComplete && !hasOverflow ? 'bg-accent-success' : hasOverflow ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      
      {/* Issues list */}
      {issues.length > 0 && (
        <div className="mt-2 text-xs text-zinc-600">
          {issues.join(', ')}
        </div>
      )}
    </div>
  );
}
