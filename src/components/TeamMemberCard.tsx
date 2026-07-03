import { getRoleIcon, getRoleLabel } from "@/utils/iconMapper";
import { personColor } from "@/utils/personColor";
import type { Role } from "@/types";

interface TeamMemberCardProps {
  memberName: string;
  role: Role;
  color?: string;
  isHighlighted?: boolean;
}

export default function TeamMemberCard({ memberName, role, color = 'gray', isHighlighted = false }: TeamMemberCardProps) {
  const Icon = getRoleIcon(role);
  const roleLabel = getRoleLabel(role);
  const colors = personColor(color);

  return (
    <div
      className={`group relative flex items-center justify-between gap-3 p-3.5 rounded-xl ${colors.tint} shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] overflow-hidden ${
        isHighlighted ? "ring-4 ring-slate-700 ring-offset-2 scale-105" : ""
      }`}
      role="listitem"
      aria-label={`${memberName} - ${roleLabel}`}
    >
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center gap-3 relative z-10">
        <div className={`p-2 ${colors.dot} text-white rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
        </div>
        <span className={`font-medium text-sm ${colors.text}`}>{memberName}</span>
      </div>

      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors.dot} text-white relative z-10`}>
        {roleLabel}
      </span>
    </div>
  );
}
