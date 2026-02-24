import { getRoleIcon, getRoleLabel } from "@/utils/iconMapper";
import type { Role } from "@/types";
import { AlertCircle } from "lucide-react";

interface TeamSummaryProps {
  team: Array<{ memberName: string; role: Role; color: string }>;
}

export default function TeamSummary({ team }: TeamSummaryProps) {
  if (!team || team.length === 0) return null;

  // Count roles
  const roleCounts: Record<string, number> = {};
  team.forEach(member => {
    roleCounts[member.role] = (roleCounts[member.role] || 0) + 1;
  });

  // Check if team is complete (at least 1 of each main role)
  const expectedRoles: Role[] = ['guitar', 'drums', 'vocals'];
  const missingRoles = expectedRoles.filter(role => !roleCounts[role]);
  const isComplete = missingRoles.length === 0;

  return (
    <div className="mt-3 pt-3 border-t border-zinc-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {Object.entries(roleCounts).map(([role, count]) => {
            const Icon = getRoleIcon(role as Role);
            const label = getRoleLabel(role as Role);
            return (
              <div
                key={role}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 rounded-md text-xs text-zinc-700"
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="font-medium">
                  {count} {label}
                </span>
              </div>
            );
          })}
        </div>

        {!isComplete && (
          <div className="flex items-center gap-1.5 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Incompleto</span>
          </div>
        )}
      </div>

      {/* Completeness bar */}
      <div className="mt-2 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${
            isComplete ? 'bg-accent-success' : 'bg-amber-500'
          }`}
          style={{ width: `${(team.length / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
