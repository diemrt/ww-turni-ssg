import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TeamMemberCard from "@/components/TeamMemberCard";
import { formatDate } from "@/utils/dateFormatter";
import type { Shift, TeamMember } from "@/types";

interface ShiftCardProps {
  shift: Shift;
  availableMembers: TeamMember[];
}

export default function ShiftCard({ shift, availableMembers }: ShiftCardProps) {
  const { dayName, dayNumber } = formatDate(shift.date);

  // Find team member data for each assigned member
  const getTeamMemberData = (memberName: string) => {
    return availableMembers.find((m) => m.name === memberName);
  };

  // Show message if no team assigned
  if (!shift.team || shift.team.length === 0) {
    return (
      <Card className="bg-white border-gray-200 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">
            {dayName} {dayNumber}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm italic">Nessun turno assegnato</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-200 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">
          {dayName} {dayNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {shift.team.map((member, idx) => {
          const teamMemberData = getTeamMemberData(member.memberName);
          if (!teamMemberData) return null;
          
          return (
            <TeamMemberCard
              key={`${member.memberName}-${member.role}-${idx}`}
              memberName={member.memberName}
              role={member.role}
              teamMember={teamMemberData}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
