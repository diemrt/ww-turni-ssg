import { Chip } from "@/components/ui";
import { isPersonColorName } from "@/utils/personColor";

interface TeamMemberCardProps {
  memberName: string;
  color?: string;
  /** True when this member matches the active QuickFilter selection. */
  isHighlighted?: boolean;
}

/**
 * Renders a single team member as a "Call Sheet" chip: color dot + tinted
 * background carrying dark ink text (never a saturated fill with white
 * text). The role is intentionally NOT shown here — ShiftCard groups chips
 * under a single instrument label per role, so repeating it per person
 * would duplicate information.
 */
export default function TeamMemberCard({ memberName, color = 'gray', isHighlighted = false }: TeamMemberCardProps) {
  const personColorName = isPersonColorName(color) ? color : 'gray';

  return (
    <Chip
      color={personColorName}
      label={memberName}
      role="listitem"
      aria-label={memberName}
      className={isHighlighted ? "ring-2 ring-brand-600 ring-offset-1" : ""}
    />
  );
}
