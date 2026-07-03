import { Card, CardContent, CardHeader, Meter } from "@/components/ui";
import TeamMemberCard from "@/components/TeamMemberCard";
import TeamSummary from "@/components/TeamSummary";
import { formatDate, getTodayDateString } from "@/utils/dateFormatter";
import { getRoleIcon, roleLabels } from "@/utils/iconMapper";
import type { Role, Shift, TeamMember } from "@/types";

interface ShiftCardProps {
  shift: Shift;
  highlightName?: string;
  availableTeamMembers?: TeamMember[];
  /** Expected slot count per role (config.roleSlots) — drives the completeness meter. */
  roleSlots?: Record<Role, number>;
  /**
   * "hero" promotes this card to the "Prossimo servizio" treatment: larger,
   * elevated (shadow-raised), brand-accented eyebrow. Defaults to the normal
   * ticket card used for the rest of the list.
   */
  variant?: "default" | "hero";
}

// Instrument display order for the lineup groups (falls back to config order
// when roleSlots omit a role entirely, every known role is still tried).
const ROLE_ORDER: Role[] = ["guitar", "bass", "drums", "vocals", "keyboard"];

export default function ShiftCard({ shift, highlightName, availableTeamMembers = [], roleSlots, variant = "default" }: ShiftCardProps) {
  const { dayName, dayNumber } = formatDate(shift.date);
  const isHero = variant === "hero";

  // Helper function to get color from availableTeamMembers
  const getMemberColor = (memberName: string, providedColor?: string): string => {
    // If color is already provided in the shift data, use it
    if (providedColor) return providedColor;

    // Otherwise, lookup from availableTeamMembers
    const teamMember = availableTeamMembers.find(m => m.name === memberName);
    return teamMember?.color || 'gray';
  };

  // Today/past are derived from date-only string comparison (both this and
  // shift.date are "YYYY-MM-DD"), never from Date object comparisons — that
  // keeps the result stable regardless of the viewer's timezone.
  const today = getTodayDateString();
  const isToday = shift.date === today;
  const isPast = shift.date < today;

  // "Tu suoni" personalization: the role the QuickFilter's selected person
  // plays in THIS shift, if they're assigned to it at all. This is the
  // signature Call Sheet moment — everything else in the card is emphasis
  // (ribbon) or de-emphasis (dimming) built on top of this one lookup.
  const isFiltering = Boolean(highlightName);
  const userAssignment = highlightName
    ? shift.team?.find(member => member.name === highlightName)
    : undefined;
  const userRole = userAssignment?.role;
  const isUserShift = Boolean(userAssignment);
  // Shifts are never hard-filtered out — the selected person's own services
  // are emphasized (ribbon + full opacity) while every other shift is
  // dimmed, so the whole month stays visible. The hero ("Prossimo
  // servizio") is exempt: it's the next service for the group regardless of
  // who's asking, so it keeps its normal treatment.
  const isDeemphasized = !isHero && isFiltering && !isUserShift;

  const totalExpected = roleSlots
    ? Object.values(roleSlots).reduce((sum, n) => sum + n, 0)
    : 0;

  const cardToneClass = isHero
    ? "border-brand-600/30 shadow-raised ring-1 ring-brand-600/15"
    : `border-line shadow-card ${isPast || isDeemphasized ? "opacity-70" : ""}`;

  const ribbon = isUserShift && userRole ? (
    <div
      className={`flex items-center gap-2 bg-live font-display text-caption uppercase tracking-wide text-ink-950 ${isHero ? "px-6 py-2.5" : "px-5 py-2"}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink-950" aria-hidden="true" />
      Tu suoni: {roleLabels[userRole]}
    </div>
  ) : null;

  const header = (
    <CardHeader className={`flex-row items-start justify-between gap-3 border-b border-line space-y-0 ${isHero ? "p-6 pb-5" : "p-5 pb-4"}`}>
      <div className="flex flex-col gap-1">
        {isHero && (
          <span className="font-display text-caption uppercase tracking-wide text-brand-600">
            Prossimo servizio
          </span>
        )}
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
        <span className={`font-mono text-ink-950 ${isHero ? "text-4xl sm:text-5xl" : "text-mono-num"}`}>{dayNumber}</span>
      </div>

      <span className="pt-1 text-caption text-ink-400">
        {shift.team.length} {shift.team.length === 1 ? "membro" : "membri"}
      </span>
    </CardHeader>
  );

  // Show message if no team assigned
  if (!shift.team || shift.team.length === 0) {
    return (
      <Card className={`overflow-hidden rounded-lg2 bg-surface ${cardToneClass}`}>
        {ribbon}
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
    <Card className={`overflow-hidden rounded-lg2 bg-surface ${cardToneClass}`}>
      {ribbon}
      {header}

      <CardContent className={`flex flex-col gap-4 ${isHero ? "p-6 pt-4" : "p-5 pt-4"}`}>
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
                      isDimmed={isFiltering && highlightName !== member.name}
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
