"use client";

import { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { usePayrollStore, PayrollFormData } from "@/stores/payroll";

export interface PayrollProcessingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onSubmit?: (data: PayrollFormData) => void;
  employees?: Array<{ id: string; name: string; salary: string; position?: string }>;
}

export function PayrollProcessingDialog({
  open,
  onOpenChange,
  title = "Process Payroll",
  onSubmit,
  employees = [],
}: PayrollProcessingDialogProps) {
  const {
    formData,
    errors,
    updateField,
    setIsOpen,
    validateForm,
    resetForm,
    calculateGrossPay,
    calculateTotalDeductions,
    calculateNetPay,
  } = usePayrollStore();

  // Sync dialog open state with store
  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  // Get selected employee details
  const selectedEmployee = useMemo(() => {
    return employees.find((emp) => emp.id === formData.employeeId);
  }, [employees, formData.employeeId]);

  // Auto-populate basic salary when employee is selected (only once)
  useEffect(() => {
    if (selectedEmployee && !formData.basicSalary && formData.employeeId) {
      // Extract numeric value from salary string (e.g., "₱45,000" -> "45000")
      const salaryValue = selectedEmployee.salary
        .replace(/[₱$,]/g, "")
        .trim();
      updateField("basicSalary", salaryValue);
      updateField("employeeName", selectedEmployee.name);

      // Auto-calculate contributions based on basic salary
      const basicSalaryNum = parseFloat(salaryValue) || 0;
      
      // SSS Contribution (typically 11% of basic salary, capped)
      const sssContribution = Math.min(basicSalaryNum * 0.11, 1800).toFixed(2);
      updateField("sssContribution", sssContribution);

      // PhilHealth Contribution (typically 3% of basic salary)
      const philHealthContribution = (basicSalaryNum * 0.03).toFixed(2);
      updateField("philHealthContribution", philHealthContribution);

      // Pag-IBIG Contribution (typically ₱200 or 2% of basic salary, whichever is lower)
      const pagIbigContribution = Math.min(basicSalaryNum * 0.02, 200).toFixed(2);
      updateField("pagIbigContribution", pagIbigContribution);

      // Withholding Tax (simplified calculation - 20% of taxable income)
      const taxableIncome = basicSalaryNum;
      const withholdingTax = (taxableIncome * 0.20).toFixed(2);
      updateField("withholdingTax", withholdingTax);
    }
    // Only run when employeeId changes, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.employeeId]);

  const handleChange = (field: keyof PayrollFormData, value: string) => {
    updateField(field, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
      onOpenChange(false);
      resetForm();
    }
  };

  const grossPay = calculateGrossPay();
  const totalDeductions = calculateTotalDeductions();
  const netPay = calculateNetPay();

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          <div className="px-6 py-4 space-y-6">
            {/* Payroll Month and Employee Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payrollMonth" className="text-sm">
                  Payroll Month <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="payrollMonth"
                  type="month"
                  value={formData.payrollMonth}
                  onChange={(e) => handleChange("payrollMonth", e.target.value)}
                  className={errors.payrollMonth ? "border-destructive" : ""}
                />
                {errors.payrollMonth && (
                  <p className="text-xs text-destructive">
                    {errors.payrollMonth}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee" className="text-sm">
                  Employee <span className="text-destructive">*</span>
                </Label>
                {selectedEmployee ? (
                  <div className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/30">
                    <span className="text-sm font-medium text-foreground">
                      {formData.employeeName}
                      {selectedEmployee.position && ` - ${selectedEmployee.position}`}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateField("employeeId", "");
                        updateField("employeeName", "");
                        updateField("basicSalary", "");
                        updateField("allowances", "");
                        updateField("overtimePay", "");
                        updateField("sssContribution", "");
                        updateField("philHealthContribution", "");
                        updateField("pagIbigContribution", "");
                        updateField("withholdingTax", "");
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={formData.employeeId}
                    onValueChange={(value) => {
                      const employee = employees.find((emp) => emp.id === value);
                      if (employee) {
                        handleChange("employeeId", value);
                        handleChange("employeeName", employee.name);
                      }
                    }}
                  >
                    <SelectTrigger
                      className={errors.employeeId ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.employeeId && (
                  <p className="text-xs text-destructive">{errors.employeeId}</p>
                )}
              </div>
            </div>

            {/* Show earnings and deductions only when employee is selected */}
            {selectedEmployee && (
              <>
                <Separator />

                {/* Earnings Section */}
                <div className="rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Earnings
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-foreground">
                        Basic Salary
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {formatCurrency(parseFloat(formData.basicSalary) || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-foreground">
                        Allowances
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {formatCurrency(parseFloat(formData.allowances) || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-foreground">
                        Overtime Pay
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {formatCurrency(parseFloat(formData.overtimePay) || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-blue-200 dark:border-blue-800">
                      <span className="text-sm font-semibold text-foreground">
                        Gross Pay
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(grossPay)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Deductions Section */}
                <div className="rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Deductions
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-foreground">
                        SSS Contribution
                      </span>
                      <span className="text-sm font-medium text-destructive">
                        -{formatCurrency(parseFloat(formData.sssContribution) || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-foreground">
                        PhilHealth Contribution
                      </span>
                      <span className="text-sm font-medium text-destructive">
                        -{formatCurrency(parseFloat(formData.philHealthContribution) || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-foreground">
                        Pag-IBIG Contribution
                      </span>
                      <span className="text-sm font-medium text-destructive">
                        -{formatCurrency(parseFloat(formData.pagIbigContribution) || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-foreground">
                        Withholding Tax
                      </span>
                      <span className="text-sm font-medium text-destructive">
                        -{formatCurrency(parseFloat(formData.withholdingTax) || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-orange-200 dark:border-orange-800">
                      <span className="text-sm font-semibold text-foreground">
                        Total Deductions
                      </span>
                      <span className="text-sm font-semibold text-destructive">
                        -{formatCurrency(totalDeductions)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Net Pay */}
                <div className="rounded-lg p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-foreground">
                      Net Pay
                    </span>
                    <span className="text-lg font-bold text-green-700 dark:text-green-400">
                      {formatCurrency(netPay)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30 flex-col sm:flex-row gap-2 sm:gap-3 rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            variant="default"
            disabled={!selectedEmployee}
          >
            Process Payroll
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

