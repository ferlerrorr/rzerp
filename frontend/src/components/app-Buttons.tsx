import { Funnel, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { ButtonProps } from "./ui/button";

interface AppButtonsProps {
  filter?: boolean;
  add?: boolean;
  leaveRequest?: boolean;
  processPayroll?: boolean;
  addInvoice?: boolean;
  filterLabel?: string;
  addLabel?: string;
  leaveRequestLabel?: string;
  processPayrollLabel?: string;
  addInvoiceLabel?: string;
  filterOrder?: number;
  addOrder?: number;
  leaveRequestOrder?: number;
  processPayrollOrder?: number;
  addInvoiceOrder?: number;
  onFilterClick?: () => void;
  onAddClick?: () => void;
  onLeaveRequestClick?: () => void;
  onProcessPayrollClick?: () => void;
  onAddInvoiceClick?: () => void;
  className?: string;
}

export function AppButtons({
  filter = true,
  add = true,
  leaveRequest = false,
  processPayroll = false,
  addInvoice = false,
  filterLabel = "Filter",
  addLabel = "Add Employee",
  leaveRequestLabel = "File Leave Request",
  processPayrollLabel = "Process Payroll",
  addInvoiceLabel = "Add Invoice",
  filterOrder = 2,
  addOrder = 1,
  leaveRequestOrder = 3,
  processPayrollOrder = 4,
  addInvoiceOrder = 5,
  onFilterClick,
  onAddClick,
  onLeaveRequestClick,
  onProcessPayrollClick,
  onAddInvoiceClick,
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

  if (leaveRequest) {
    buttons.push({
      id: "leaveRequest",
      label: leaveRequestLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onLeaveRequestClick,
      order: leaveRequestOrder,
    });
  }

  if (processPayroll) {
    buttons.push({
      id: "processPayroll",
      label: processPayrollLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onProcessPayrollClick,
      order: processPayrollOrder,
    });
  }

  if (addInvoice) {
    buttons.push({
      id: "addInvoice",
      label: addInvoiceLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onAddInvoiceClick,
      order: addInvoiceOrder,
    });
  }

  // Sort by order
  buttons.sort((a, b) => a.order - b.order);

  return (
    <div className={`flex gap-2 ${className || ""}`}>
      {buttons.map((button) => {
        const Icon = button.icon;
        const isOutline = button.variant === "outline";
        return (
          <Button
            key={button.id}
            variant={button.variant}
            onClick={button.onClick}
            className={`text-xs sm:text-sm px-2 sm:px-4 transition-colors duration-200 ${
              isOutline
                ? "hover:bg-gray-100 hover:border-gray-300"
                : "hover:bg-gray-900 hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{button.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
