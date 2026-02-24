import { getRoleIcon } from "@/utils/iconMapper";
import type { Role, TeamMember } from "@/types";

interface TeamMemberCardProps {
  memberName: string;
  role: Role;
  teamMember: TeamMember;
}

const colorMap: Record<string, string> = {
  yellow: "bg-team-yellow text-gray-900",
  blue: "bg-team-blue text-white",
  green: "bg-team-green text-white",
  red: "bg-team-red text-white",
  orange: "bg-team-orange text-white",
  pink: "bg-team-pink text-white",
  purple: "bg-team-purple text-white",
  cyan: "bg-team-cyan text-white",
  brown: "bg-team-brown text-white",
  gray: "bg-team-gray text-white",
};

export default function TeamMemberCard({ memberName, role, teamMember }: TeamMemberCardProps) {
  const Icon = getRoleIcon(role);
  const colorClass = colorMap[teamMember.color] || "bg-gray-500 text-white";

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg ${colorClass} shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-fade-in`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium text-sm">{memberName}</span>
    </div>
  );
}
