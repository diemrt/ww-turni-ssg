import * as React from "react"
import { cn } from "@/lib/utils"

export interface MeterProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Current progress value (will be clamped to [0, max]). */
  value: number
  /** Maximum value. A `max <= 0` renders an empty, inert meter. */
  max: number
  /** Override the "value/max" mono label shown next to the track. */
  label?: string
}

const Meter = React.forwardRef<HTMLDivElement, MeterProps>(
  ({ className, value, max, label, ...props }, ref) => {
    const safeMax = Number.isFinite(max) && max > 0 ? max : 0
    const clampedValue = safeMax === 0 ? 0 : Math.min(Math.max(value, 0), safeMax)
    const percent = safeMax === 0 ? 0 : (clampedValue / safeMax) * 100
    const isFull = safeMax > 0 && clampedValue >= safeMax

    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
        <div
          role="meter"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={safeMax}
          className="h-2 flex-1 overflow-hidden rounded-pill bg-ink-800/10"
        >
          <div
            className={cn(
              "h-full rounded-pill transition-all",
              isFull ? "bg-positive" : "bg-brand-600"
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="font-mono text-xs text-ink-600">
          {label ?? `${clampedValue}/${safeMax}`}
        </span>
      </div>
    )
  }
)
Meter.displayName = "Meter"

export { Meter }
