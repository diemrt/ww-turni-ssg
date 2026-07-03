import { Card, CardContent, CardHeader, Meter } from "@/components/ui";
import TeamMemberCard from "@/components/TeamMemberCard";
import TeamSummary from "@/components/TeamSummary";
import { formatDate } from "@/utils/dateFormatter";
import { getRoleIcon, roleLabels } from "@/utils/iconMapper";
import type { Role, Shift, TeamMember } from "@/types";

interface ShiftCardProps {
  shift: Shift;
  highlightName?: string;
  availableTeamMembers?: TeamMember[];
  /** Expected slot count per role (config.roleSlots) — drives the completeness meter. */
  roleSlots?: Record<Role, number>;
}

// Instrument display order for the lineup groups (falls back to config order
// when roleSlots omit a role entirely, every known role is still tried).
const ROLE_ORDER: Role[] = ["guitar", "bass", "drums", "vocals", "keyboard"];

export default function ShiftCard({ shift, highlightName, availableTeamMembers = [], roleSlots }: ShiftCardProps) {
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

  const totalExpected = roleSlots
    ? Object.values(roleSlots).reduce((sum, n) => sum + n, 0)
    : 0;

  const header = (
    <CardHeader className="flex-row items-start justify-between gap-3 border-b border-line p-5 pb-4 space-y-0">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-caption uppercase tracking-wide text-ink-400">
            {dayName}
          </span>
          {isToday && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-live-50 px-2 py-0.5 font-display text-caption uppercase tracking-wide text-live">
              <span className="h-1.5 w-1.5 rounded-full bg-live" aria-hidden="true" />
              Oggi
            </span>
          )}
        </div>
        <span className="font-mono text-mono-num text-ink-950">{dayNumber}</span>
      </div>

      <span className="pt-1 text-caption text-ink-400">
        {shift.team.length} {shift.team.length === 1 ? "membro" : "membri"}
      </span>
    </CardHeader>
  );

  // Show message if no team assigned
  if (!shift.team || shift.team.length === 0) {
    return (
      <Card className={`overflow-hidden rounded-lg2 border-line bg-surface shadow-card ${isPast ? 'opacity-70' : ''}`}>
        {header}
        <CardContent className="p-5 pt-4">
          <p className="text-sm italic text-ink-400">Nessun turno assegnato</p>
        </CardContent>
      </Card>
    );
  }

  // Group assignments by role, once per instrument, in ROLE_ORDER — this is
  // the core "Call Sheet" change: the role label appears once per group,
  // never repeated as a per-person badge.
  const groupedByRole = ROLE_ORDER
    .map(role => ({ role, members: shift.team.filter(member => member.role === role) }))
    .filter(group => group.members.length > 0);

  return (
    <Card className={`overflow-hidden rounded-lg2 border-line bg-surface shadow-card ${isPast ? 'opacity-70' : ''}`}>
      {header}

      <CardContent className="flex flex-col gap-4 p-5 pt-4">
        <div className="flex flex-col gap-3">
          {groupedByRole.map(({ role, members }) => {
            const Icon = getRoleIcon(role);
            return (
              <div key={role} className="flex flex-col gap-1.5 sm:flex-row sm:gap-3">
                <div className="flex items-center gap-1.5 font-display text-caption text-ink-600 sm:w-24 sm:shrink-0 sm:pt-1">
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
                  <span>{roleLabels[role]}</span>
                </div>
                <div className="flex flex-1 flex-wrap gap-2">
                  {members.map((member, idx) => (
                    <TeamMemberCard
                      key={`${member.name}-${role}-${idx}`}
                      memberName={member.name}
                      color={getMemberColor(member.name, member.color)}
                      isHighlighted={highlightName === member.name}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <TeamSummary team={shift.team} roleSlots={roleSlots ?? ({} as Record<Role, number>)} />

        {totalExpected > 0 && (
          <div className="border-t border-line pt-3">
            <Meter value={shift.team.length} max={totalExpected} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
