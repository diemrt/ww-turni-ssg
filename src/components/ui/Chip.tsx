import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { personColor, type PersonColorName } from "@/utils/personColor"

const chipVariants = cva(
  "inline-flex max-w-full items-center gap-1.5 rounded-pill px-2.5 py-1 text-sm font-medium text-ink-800",
  {
    variants: {
      tone: {
        person: "",
        neutral: "bg-ink-800/5",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {
  /** One of the 10 named person colors; renders a dot + tinted background. */
  color?: PersonColorName
  /** Convenience text prop; falls back to `children` when omitted. */
  label?: React.ReactNode
}

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, color, label, tone, children, ...props }, ref) => {
    const swatch = color ? personColor(color) : null
    const resolvedTone = tone ?? (swatch ? "person" : "neutral")

    return (
      <span
        ref={ref}
        className={cn(chipVariants({ tone: resolvedTone }), swatch?.tint, className)}
        {...props}
      >
        {swatch && (
          <span
            className={cn("h-2 w-2 shrink-0 rounded-full", swatch.dot)}
            aria-hidden="true"
          />
        )}
        <span className="truncate">{label ?? children}</span>
      </span>
    )
  }
)
Chip.displayName = "Chip"

export { Chip, chipVariants }
