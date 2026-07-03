import { Chip } from "@/components/ui";
import { cn } from "@/lib/utils";
import { isPersonColorName } from "@/utils/personColor";

interface TeamMemberCardProps {
  memberName: string;
  color?: string;
  /** True when this member matches the active QuickFilter selection. */
  isHighlighted?: boolean;
  /**
   * True when a QuickFilter name is active and this member is NOT the
   * match — dims the chip so the highlighted person's own services read as
   * the focal point of the card.
   */
  isDimmed?: boolean;
}

/**
 * Renders a single team member as a "Call Sheet" chip: color dot + tinted
 * background carrying dark ink text (never a saturated fill with white
 * text). The role is intentionally NOT shown here — ShiftCard groups chips
 * under a single instrument label per role, so repeating it per person
 * would duplicate information.
 */
export default function TeamMemberCard({ memberName, color = 'gray', isHighlighted = false, isDimmed = false }: TeamMemberCardProps) {
  const personColorName = isPersonColorName(color) ? color : 'gray';

  return (
    <Chip
      color={personColorName}
      label={memberName}
      role="listitem"
      aria-label={memberName}
      className={cn(
        isHighlighted && "ring-2 ring-brand-600 ring-offset-1",
        isDimmed && "opacity-50"
      )}
    />
  );
}
