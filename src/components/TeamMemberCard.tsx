import { getRoleIcon, getRoleLabel } from "@/utils/iconMapper";
import type { Role } from "@/types";

interface TeamMemberCardProps {
  memberName: string;
  role: Role;
  color?: string;
  isHighlighted?: boolean;
}

const colorMap: Record<string, { bg: string; bgGradient: string; text: string; badge: string }> = {
  yellow: { 
    bg: "bg-team-yellow/90", 
    bgGradient: "from-team-yellow/80 to-team-yellow/90",
    text: "text-amber-900", 
    badge: "bg-amber-900/10 text-amber-900" 
  },
  blue: { 
    bg: "bg-team-blue/90", 
    bgGradient: "from-team-blue/80 to-team-blue/90",
    text: "text-white", 
    badge: "bg-white/20 text-white" 
  },
  green: { 
    bg: "bg-team-green/90", 
    bgGradient: "from-team-green/80 to-team-green/90",
    text: "text-white", 
    badge: "bg-white/20 text-white" 
  },
  red: { 
    bg: "bg-team-red/90", 
    bgGradient: "from-team-red/80 to-team-red/90",
    text: "text-white", 
    badge: "bg-white/20 text-white" 
  },
  orange: { 
    bg: "bg-team-orange/90", 
    bgGradient: "from-team-orange/80 to-team-orange/90",
    text: "text-white", 
    badge: "bg-white/20 text-white" 
  },
  pink: { 
    bg: "bg-team-pink/90", 
    bgGradient: "from-team-pink/80 to-team-pink/90",
    text: "text-white", 
    badge: "bg-white/20 text-white" 
  },
  purple: { 
    bg: "bg-team-purple/90", 
    bgGradient: "from-team-purple/80 to-team-purple/90",
    text: "text-white", 
    badge: "bg-white/20 text-white" 
  },
  cyan: { 
    bg: "bg-team-cyan/90", 
    bgGradient: "from-team-cyan/80 to-team-cyan/90",
    text: "text-white", 
    badge: "bg-white/20 text-white" 
  },
  brown: { 
    bg: "bg-team-brown/90", 
    bgGradient: "from-team-brown/80 to-team-brown/90",
    text: "text-white", 
    badge: "bg-white/20 text-white" 
  },
  gray: { 
    bg: "bg-team-gray/90", 
    bgGradient: "from-team-gray/80 to-team-gray/90",
    text: "text-white", 
    badge: "bg-white/20 text-white" 
  },
};

export default function TeamMemberCard({ memberName, role, color = 'gray', isHighlighted = false }: TeamMemberCardProps) {
  const Icon = getRoleIcon(role);
  const roleLabel = getRoleLabel(role);
  const colors = colorMap[color] || {
    bg: "bg-zinc-500/90", 
    bgGradient: "from-zinc-400/80 to-zinc-500/90",
    text: "text-white", 
    badge: "bg-white/20 text-white" 
  };

  return (
    <div
      className={`group relative flex items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-br ${colors.bgGradient} shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] overflow-hidden ${
        isHighlighted ? "ring-4 ring-slate-700 ring-offset-2 scale-105" : ""
      }`}
      role="listitem"
      aria-label={`${memberName} - ${roleLabel}`}
    >
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-center gap-3 relative z-10">
        <div className={`p-2 ${colors.badge} rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
        </div>
        <span className={`font-medium text-sm ${colors.text}`}>{memberName}</span>
      </div>
      
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors.badge} relative z-10`}>
        {roleLabel}
      </span>
    </div>
  );
}
