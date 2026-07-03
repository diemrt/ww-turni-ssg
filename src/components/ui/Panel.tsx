import * as React from "react"
import { cn } from "@/lib/utils"

export interface PanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, title, description, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg2 border border-line bg-surface shadow-card",
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="border-b border-line px-5 py-4">
          {title && (
            <h3 className="font-display text-heading text-ink-950">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-ink-600">{description}</p>
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
)
Panel.displayName = "Panel"

export { Panel }
