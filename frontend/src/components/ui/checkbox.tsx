import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "onChange"> {
  checked?: boolean | "indeterminate"
  onCheckedChange?: (checked: boolean | "indeterminate") => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked)
      }
    }

    // Extract check color from className if present
    const checkColorClass = className?.includes("check-black") ? "text-black" : "text-primary-foreground"

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            checked === true && !className?.includes("!bg-white") && "bg-primary border-primary",
            checked === "indeterminate" && !className?.includes("!bg-white") && "bg-primary border-primary",
            className
          )}
          checked={checked === true}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        {checked === true && (
          <Check className={cn("absolute h-3 w-3 pointer-events-none", checkColorClass)} />
        )}
        {checked === "indeterminate" && (
          <div className={cn("absolute h-0.5 w-2 pointer-events-none", checkColorClass.replace("text-", "bg-"))} />
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }

