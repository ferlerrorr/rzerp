import { Funnel, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonProps } from "@/components/ui/button";

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
  addProduct?: boolean;
  newAdjustment?: boolean;
  addWarehouse?: boolean;
  createPO?: boolean;
  addVendor?: boolean;
  addUser?: boolean;
  addRole?: boolean;
  exportLogs?: boolean;
  filterLabel?: string;
  addLabel?: string;
  leaveRequestLabel?: string;
  processPayrollLabel?: string;
  addInvoiceLabel?: string;
  addAccountLabel?: string;
  newJournalEntryLabel?: string;
  createBudgetLabel?: string;
  createInvoiceLabel?: string;
  addProductLabel?: string;
  newAdjustmentLabel?: string;
  addWarehouseLabel?: string;
  createPOLabel?: string;
  addVendorLabel?: string;
  addUserLabel?: string;
  addRoleLabel?: string;
  exportLogsLabel?: string;
  filterOrder?: number;
  addOrder?: number;
  leaveRequestOrder?: number;
  processPayrollOrder?: number;
  addInvoiceOrder?: number;
  addAccountOrder?: number;
  newJournalEntryOrder?: number;
  createBudgetOrder?: number;
  createInvoiceOrder?: number;
  addProductOrder?: number;
  newAdjustmentOrder?: number;
  addWarehouseOrder?: number;
  createPOOrder?: number;
  addVendorOrder?: number;
  addUserOrder?: number;
  addRoleOrder?: number;
  exportLogsOrder?: number;
  onFilterClick?: () => void;
  onAddClick?: () => void;
  onLeaveRequestClick?: () => void;
  onProcessPayrollClick?: () => void;
  onAddInvoiceClick?: () => void;
  onAddAccountClick?: () => void;
  onNewJournalEntryClick?: () => void;
  onCreateBudgetClick?: () => void;
  onCreateInvoiceClick?: () => void;
  onAddProductClick?: () => void;
  onNewAdjustmentClick?: () => void;
  onAddWarehouseClick?: () => void;
  onCreatePOClick?: () => void;
  onAddVendorClick?: () => void;
  onAddUserClick?: () => void;
  onAddRoleClick?: () => void;
  onExportLogsClick?: () => void;
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
  addProduct = false,
  newAdjustment = false,
  addWarehouse = false,
  createPO = false,
  addVendor = false,
  addUser = false,
  addRole = false,
  exportLogs = false,
  filterLabel = "Filter",
  addLabel = "Add Employee",
  leaveRequestLabel = "File Leave Request",
  processPayrollLabel = "Process Payroll",
  addInvoiceLabel = "Add Invoice",
  addAccountLabel = "Add Account",
  newJournalEntryLabel = "New Journal Entry",
  createBudgetLabel = "Create Budget",
  createInvoiceLabel = "Create Invoice",
  addProductLabel = "Add Product",
  newAdjustmentLabel = "New Adjustment",
  addWarehouseLabel = "Add Warehouse",
  createPOLabel = "Create PO",
  addVendorLabel = "Add Vendor",
  addUserLabel = "Add User",
  addRoleLabel = "Add Role",
  exportLogsLabel = "Export Logs",
  filterOrder = 2,
  addOrder = 1,
  leaveRequestOrder = 3,
  processPayrollOrder = 4,
  addInvoiceOrder = 5,
  addAccountOrder = 6,
  newJournalEntryOrder = 7,
  createBudgetOrder = 8,
  createInvoiceOrder = 9,
  addProductOrder = 10,
  newAdjustmentOrder = 1,
  addWarehouseOrder = 11,
  createPOOrder = 12,
  addVendorOrder = 13,
  addUserOrder = 14,
  addRoleOrder = 15,
  exportLogsOrder = 16,
  onFilterClick,
  onAddClick,
  onLeaveRequestClick,
  onProcessPayrollClick,
  onAddInvoiceClick,
  onAddAccountClick,
  onNewJournalEntryClick,
  onCreateBudgetClick,
  onCreateInvoiceClick,
  onAddProductClick,
  onNewAdjustmentClick,
  onAddWarehouseClick,
  onCreatePOClick,
  onAddVendorClick,
  onAddUserClick,
  onAddRoleClick,
  onExportLogsClick,
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

  if (addProduct) {
    buttons.push({
      id: "addProduct",
      label: addProductLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onAddProductClick,
      order: addProductOrder,
    });
  }

  if (newAdjustment) {
    buttons.push({
      id: "newAdjustment",
      label: newAdjustmentLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onNewAdjustmentClick,
      order: newAdjustmentOrder,
    });
  }

  if (addWarehouse) {
    buttons.push({
      id: "addWarehouse",
      label: addWarehouseLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onAddWarehouseClick,
      order: addWarehouseOrder,
    });
  }

  if (createPO) {
    buttons.push({
      id: "createPO",
      label: createPOLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onCreatePOClick,
      order: createPOOrder,
    });
  }

  if (addVendor) {
    buttons.push({
      id: "addVendor",
      label: addVendorLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onAddVendorClick,
      order: addVendorOrder,
    });
  }

  if (addUser) {
    buttons.push({
      id: "addUser",
      label: addUserLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onAddUserClick,
      order: addUserOrder,
    });
  }

  if (addRole) {
    buttons.push({
      id: "addRole",
      label: addRoleLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onAddRoleClick,
      order: addRoleOrder,
    });
  }

  if (exportLogs) {
    buttons.push({
      id: "exportLogs",
      label: exportLogsLabel,
      icon: Plus,
      variant: "default" as ButtonProps["variant"],
      onClick: onExportLogsClick,
      order: exportLogsOrder,
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
