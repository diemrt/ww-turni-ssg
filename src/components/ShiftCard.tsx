import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TeamMemberCard from "@/components/TeamMemberCard";
import TeamSummary from "@/components/TeamSummary";
import { formatDate } from "@/utils/dateFormatter";
import type { Shift, TeamMember } from "@/types";
import { Calendar } from "lucide-react";

interface ShiftCardProps {
  shift: Shift;
  highlightName?: string;
  availableTeamMembers?: TeamMember[];
}

export default function ShiftCard({ shift, highlightName, availableTeamMembers = [] }: ShiftCardProps) {
  const { dayName, dayNumber } = formatDate(shift.date);
  
  // Helper function to get color from availableTeamMembers
  const getMemberColor = (memberName: string, providedColor?: string): string => {
    // If color is already provided in the shift data, use it
    if (providedColor) return providedColor;
    
    // Otherwise, lookup from availableTeamMembers
    const teamMember = availableTeamMembers.find(m => m.name === memberName);
    return teamMember?.color || 'gray';
  };
  
  // Check if this is today
  const isToday = new Date(shift.date).toDateString() === new Date().toDateString();
  
  // Check if shift is in the past
  const isPast = new Date(shift.date) < new Date(new Date().setHours(0, 0, 0, 0));

  // Show message if no team assigned
  if (!shift.team || shift.team.length === 0) {
    return (
      <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-zinc-300" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <Calendar className="w-5 h-5 text-zinc-400" />
            </div>
            <CardTitle className="font-display text-xl text-zinc-800">
              {dayName} {dayNumber}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-500 text-sm italic">Nessun turno assegnato</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white border-zinc-200 shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden hover:-translate-y-1 ${
      isPast ? 'opacity-60' : ''
    }`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${
        isToday 
          ? 'bg-gradient-to-b from-accent-success to-accent-info animate-pulse' 
          : 'bg-gradient-to-b from-slate-600 to-slate-400'
      }`} />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${
              isToday 
                ? 'bg-accent-success/10 group-hover:bg-accent-success/20' 
                : 'bg-slate-100 group-hover:bg-slate-200'
            }`}>
              <Calendar className={`w-5 h-5 ${isToday ? 'text-accent-success' : 'text-slate-600'}`} />
            </div>
            <div>
              <CardTitle className="font-display text-xl text-zinc-800 tracking-tight">
                {dayName} {dayNumber}
              </CardTitle>
              {isToday && (
                <span className="text-xs font-semibold text-accent-success uppercase tracking-wide">
                  Oggi
                </span>
              )}
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-full">
            {shift.team.length} {shift.team.length === 1 ? "membro" : "membri"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent mb-3" />
        {shift.team.map((member, idx) => {
          return (
            <div 
              key={`${member.name}-${member.role}-${idx}`}
              className="animate-slide-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <TeamMemberCard
                memberName={member.name}
                role={member.role}
                color={getMemberColor(member.name, member.color)}
                isHighlighted={highlightName === member.name}
              />
            </div>
          );
        })}
        
        <TeamSummary team={shift.team} />
      </CardContent>
    </Card>
  );
}
