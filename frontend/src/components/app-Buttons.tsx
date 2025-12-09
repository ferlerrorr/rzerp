import { Funnel, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { ButtonProps } from "./ui/button";

interface AppButtonsProps {
  filter?: boolean;
  add?: boolean;
  leaveRequest?: boolean;
  processPayroll?: boolean;
  addInvoice?: boolean;
  addAccount?: boolean;
  newJournalEntry?: boolean;
  createBudget?: boolean;
  createInvoice?: boolean;
  filterLabel?: string;
  addLabel?: string;
  leaveRequestLabel?: string;
  processPayrollLabel?: string;
  addInvoiceLabel?: string;
  addAccountLabel?: string;
  newJournalEntryLabel?: string;
  createBudgetLabel?: string;
  createInvoiceLabel?: string;
  filterOrder?: number;
  addOrder?: number;
  leaveRequestOrder?: number;
  processPayrollOrder?: number;
  addInvoiceOrder?: number;
  addAccountOrder?: number;
  newJournalEntryOrder?: number;
  createBudgetOrder?: number;
  createInvoiceOrder?: number;
  onFilterClick?: () => void;
  onAddClick?: () => void;
  onLeaveRequestClick?: () => void;
  onProcessPayrollClick?: () => void;
  onAddInvoiceClick?: () => void;
  onAddAccountClick?: () => void;
  onNewJournalEntryClick?: () => void;
  onCreateBudgetClick?: () => void;
  onCreateInvoiceClick?: () => void;
  className?: string;
}

export function AppButtons({
  filter = true,
  add = true,
  leaveRequest = false,
  processPayroll = false,
  addInvoice = false,
  addAccount = false,
  newJournalEntry = false,
  createBudget = false,
  createInvoice = false,
  filterLabel = "Filter",
  addLabel = "Add Employee",
  leaveRequestLabel = "File Leave Request",
  processPayrollLabel = "Process Payroll",
  addInvoiceLabel = "Add Invoice",
  addAccountLabel = "Add Account",
  newJournalEntryLabel = "New Journal Entry",
  createBudgetLabel = "Create Budget",
  createInvoiceLabel = "Create Invoice",
  filterOrder = 2,
  addOrder = 1,
  leaveRequestOrder = 3,
  processPayrollOrder = 4,
  addInvoiceOrder = 5,
  addAccountOrder = 6,
  newJournalEntryOrder = 7,
  createBudgetOrder = 8,
  createInvoiceOrder = 9,
  onFilterClick,
  onAddClick,
  onLeaveRequestClick,
  onProcessPayrollClick,
  onAddInvoiceClick,
  onAddAccountClick,
  onNewJournalEntryClick,
  onCreateBudgetClick,
  onCreateInvoiceClick,
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

  if (addAccount) {
    buttons.push({
      id: "addAccount",
      label: addAccountLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onAddAccountClick,
      order: addAccountOrder,
    });
  }

  if (newJournalEntry) {
    buttons.push({
      id: "newJournalEntry",
      label: newJournalEntryLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onNewJournalEntryClick,
      order: newJournalEntryOrder,
    });
  }

  if (createBudget) {
    buttons.push({
      id: "createBudget",
      label: createBudgetLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onCreateBudgetClick,
      order: createBudgetOrder,
    });
  }

  if (createInvoice) {
    buttons.push({
      id: "createInvoice",
      label: createInvoiceLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onCreateInvoiceClick,
      order: createInvoiceOrder,
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
            size="sm"
            onClick={button.onClick}
            className={`text-xs px-2 py-1 h-8 transition-colors duration-200 ${
              isOutline
                ? "hover:bg-gray-100 hover:border-gray-300"
                : "hover:bg-gray-900 hover:text-white"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{button.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
