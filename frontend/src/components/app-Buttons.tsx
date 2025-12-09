import { Funnel, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { ButtonProps } from "./ui/button";

interface AppButtonsProps {
  filter?: boolean;
  add?: boolean;
  filterLabel?: string;
  addLabel?: string;
  filterOrder?: number;
  addOrder?: number;
  onFilterClick?: () => void;
  onAddClick?: () => void;
  className?: string;
}

export function AppButtons({
  filter = true,
  add = true,
  filterLabel = "Filter",
  addLabel = "Add Employee",
  filterOrder = 2,
  addOrder = 1,
  onFilterClick,
  onAddClick,
  className,
}: AppButtonsProps) {
  const buttons = [];

  if (add) {
    buttons.push({
      id: "add",
      label: addLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onAddClick,
      order: addOrder,
    });
  }

  if (filter) {
    buttons.push({
      id: "filter",
      label: filterLabel,
      icon: Funnel,
      variant: "outline" as ButtonProps["variant"],
      onClick: onFilterClick,
      order: filterOrder,
    });
  }

  // Sort by order
  buttons.sort((a, b) => a.order - b.order);

  return (
    <div className={`flex gap-2 ${className || ""}`}>
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <Button
            key={button.id}
            variant={button.variant}
            onClick={button.onClick}
            className="text-xs sm:text-sm px-2 sm:px-4"
          >
            <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{button.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
