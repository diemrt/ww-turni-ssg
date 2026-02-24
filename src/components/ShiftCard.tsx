import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TeamMemberCard from "@/components/TeamMemberCard";
import { formatDate } from "@/utils/dateFormatter";
import type { Shift } from "@/types";

interface ShiftCardProps {
  shift: Shift;
}

export default function ShiftCard({ shift }: ShiftCardProps) {
  const { dayName, dayNumber } = formatDate(shift.date);

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
          return (
            <TeamMemberCard
              key={`${member.memberName}-${member.role}-${idx}`}
              memberName={member.memberName}
              role={member.role}
              color={member.color}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
