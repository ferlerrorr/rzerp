import { useState, useMemo } from "react";
import { toast } from "sonner";
import { AppButtons } from "@/components/common/app-Buttons";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import { PayrollProcessingDialog } from "@/components/dialogs/payroll-processing-dialog";
import { PayrollFormData } from "@/stores/payroll";
import { Eye, Edit, CheckCircle2, XCircle, Clock } from "lucide-react";

interface PayrollData {
  total_monthly_payroll: string;
  total_deductions: string;
  net_payroll: string;
  processing_status: string;
  employees_count: string;
}

interface PayrollCardConfig {
  title: string;
  dataKey: keyof PayrollData;
  subtitle: string;
  countColor: "default" | "green" | "blue" | "black" | "orange";
}

// Sample data - This would typically come from an API/database
const payrollData: PayrollData = {
  total_monthly_payroll: "₱5,234,500",
  total_deductions: "₱1,250,000",
  net_payroll: "₱3,984,500",
  processing_status: "100%",
  employees_count: "127 employees",
};

// Card configuration - maps to dummy data
const payrollCardConfig: PayrollCardConfig[] = [
  {
    title: "Total Monthly Payroll",
    dataKey: "total_monthly_payroll",
    subtitle: "127 employees",
    countColor: "black",
  },
  {
    title: "Total Deductions",
    dataKey: "total_deductions",
    subtitle: "All contributions",
    countColor: "orange",
  },
  {
    title: "Net Payroll",
    dataKey: "net_payroll",
    subtitle: "After deductions",
    countColor: "green",
  },
  {
    title: "Processing Status",
    dataKey: "processing_status",
    subtitle: "All processed",
    countColor: "blue",
  },
];

// Payroll Employee interface
interface PayrollEmployee {
  id: string;
  employee: string;
  basicSalary: string;
  allowances: string;
  ot: string;
  grossPay: string;
  deductions: string;
  netPay: string;
  status: string;
}

// LocalStorage keys
const PAYROLL_EMPLOYEES_STORAGE_KEY = "rzerp_payroll_employees";
const PAYROLL_COUNTER_KEY = "rzerp_payroll_counter";

// Default payroll employee data - This would typically come from an API/database
const defaultPayrollEmployees: PayrollEmployee[] = [
  {
    id: "PR001",
    employee: "John Doe",
    basicSalary: "₱50,000",
    allowances: "₱5,000",
    ot: "₱3,000",
    grossPay: "₱58,000",
    deductions: "₱8,000",
    netPay: "₱50,000",
    status: "Processed",
  },
  {
    id: "PR002",
    employee: "Jane Smith",
    basicSalary: "₱45,000",
    allowances: "₱4,500",
    ot: "₱2,500",
    grossPay: "₱52,000",
    deductions: "₱7,200",
    netPay: "₱44,800",
    status: "Processed",
  },
  {
    id: "PR003",
    employee: "Mike Johnson",
    basicSalary: "₱40,000",
    allowances: "₱4,000",
    ot: "₱2,000",
    grossPay: "₱46,000",
    deductions: "₱6,400",
    netPay: "₱39,600",
    status: "Pending",
  },
  {
    id: "PR004",
    employee: "Sarah Williams",
    basicSalary: "₱42,000",
    allowances: "₱4,200",
    ot: "₱2,200",
    grossPay: "₱48,400",
    deductions: "₱6,720",
    netPay: "₱41,680",
    status: "Processed",
  },
  {
    id: "PR005",
    employee: "David Brown",
    basicSalary: "₱38,000",
    allowances: "₱3,800",
    ot: "₱1,800",
    grossPay: "₱43,600",
    deductions: "₱6,080",
    netPay: "₱37,520",
    status: "Processed",
  },
  {
    id: "PR006",
    employee: "Emily Davis",
    basicSalary: "₱48,000",
    allowances: "₱4,800",
    ot: "₱3,200",
    grossPay: "₱56,000",
    deductions: "₱8,400",
    netPay: "₱47,600",
    status: "Processed",
  },
  {
    id: "PR007",
    employee: "Robert Wilson",
    basicSalary: "₱55,000",
    allowances: "₱5,500",
    ot: "₱3,500",
    grossPay: "₱64,000",
    deductions: "₱9,600",
    netPay: "₱54,400",
    status: "Processed",
  },
  {
    id: "PR008",
    employee: "Lisa Anderson",
    basicSalary: "₱41,000",
    allowances: "₱4,100",
    ot: "₱2,100",
    grossPay: "₱47,200",
    deductions: "₱6,560",
    netPay: "₱40,640",
    status: "Pending",
  },
  {
    id: "PR009",
    employee: "Michael Chen",
    basicSalary: "₱46,000",
    allowances: "₱4,600",
    ot: "₱3,000",
    grossPay: "₱53,600",
    deductions: "₱7,840",
    netPay: "₱45,760",
    status: "Processed",
  },
  {
    id: "PR010",
    employee: "Jessica Taylor",
    basicSalary: "₱39,000",
    allowances: "₱3,900",
    ot: "₱1,900",
    grossPay: "₱44,800",
    deductions: "₱6,240",
    netPay: "₱38,560",
    status: "Processed",
  },
];

// Helper functions for localStorage
const loadPayrollEmployeesFromStorage = (): PayrollEmployee[] => {
  try {
    const stored = localStorage.getItem(PAYROLL_EMPLOYEES_STORAGE_KEY);
    if (stored) {
      const employees = JSON.parse(stored);
      return sortPayrollEmployeesById(employees);
    }
    const sortedDefault = sortPayrollEmployeesById(defaultPayrollEmployees);
    savePayrollEmployeesToStorage(sortedDefault);
    if (!localStorage.getItem(PAYROLL_COUNTER_KEY)) {
      localStorage.setItem(PAYROLL_COUNTER_KEY, "10");
    }
    return sortedDefault;
  } catch (error) {
    console.error("Error loading payroll employees from localStorage:", error);
    return sortPayrollEmployeesById(defaultPayrollEmployees);
  }
};

// Sort payroll employees by status priority (Pending → Failed → Processed), then by ID
const sortPayrollEmployeesById = (
  employees: PayrollEmployee[]
): PayrollEmployee[] => {
  const statusPriority: Record<string, number> = {
    Pending: 1,
    Failed: 2,
    Processed: 3,
  };

  return [...employees].sort((a, b) => {
    // First sort by status priority
    const priorityA = statusPriority[a.status] || 999;
    const priorityB = statusPriority[b.status] || 999;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // If same status, sort by ID
    const numA = parseInt(a.id.replace("PR", ""), 10);
    const numB = parseInt(b.id.replace("PR", ""), 10);
    return numA - numB;
  });
};

const savePayrollEmployeesToStorage = (employees: PayrollEmployee[]) => {
  try {
    localStorage.setItem(
      PAYROLL_EMPLOYEES_STORAGE_KEY,
      JSON.stringify(employees)
    );
  } catch (error) {
    console.error("Error saving payroll employees to localStorage:", error);
  }
};

const getNextPayrollId = (): string => {
  try {
    const counter = parseInt(
      localStorage.getItem(PAYROLL_COUNTER_KEY) || "10",
      10
    );
    const nextCounter = counter + 1;
    localStorage.setItem(PAYROLL_COUNTER_KEY, nextCounter.toString());
    return `PR${nextCounter.toString().padStart(3, "0")}`;
  } catch (error) {
    console.error("Error getting next payroll ID:", error);
    return `PR${Date.now()}`;
  }
};

// Load employees from employees page localStorage
const loadEmployeesForPayroll = (): Array<{
  id: string;
  name: string;
  salary: string;
  position?: string;
}> => {
  try {
    const stored = localStorage.getItem("rzerp_employees");
    if (stored) {
      const employees = JSON.parse(stored);
      return employees.map(
        (emp: {
          id: string;
          name: string;
          salary: string;
          position?: string;
        }) => ({
          id: emp.id,
          name: emp.name,
          salary: emp.salary,
          position: emp.position,
        })
      );
    }
    return [];
  } catch (error) {
    console.error("Error loading employees for payroll:", error);
    return [];
  }
};

// Transform PayrollFormData to PayrollEmployee
const transformFormDataToPayrollEmployee = (
  formData: PayrollFormData
): PayrollEmployee => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const basicSalary = parseFloat(formData.basicSalary) || 0;
  const allowances = parseFloat(formData.allowances) || 0;
  const overtimePay = parseFloat(formData.overtimePay) || 0;
  const grossPay = basicSalary + allowances + overtimePay;
  const sss = parseFloat(formData.sssContribution) || 0;
  const philHealth = parseFloat(formData.philHealthContribution) || 0;
  const pagIbig = parseFloat(formData.pagIbigContribution) || 0;
  const tax = parseFloat(formData.withholdingTax) || 0;
  const totalDeductions = sss + philHealth + pagIbig + tax;
  const netPay = grossPay - totalDeductions;

  return {
    id: getNextPayrollId(),
    employee: formData.employeeName,
    basicSalary: formatCurrency(basicSalary),
    allowances: formatCurrency(allowances),
    ot: formatCurrency(overtimePay),
    grossPay: formatCurrency(grossPay),
    deductions: formatCurrency(totalDeductions),
    netPay: formatCurrency(netPay),
    status: "Pending", // Start as Pending, then change to Processed when finalized
  };
};

// Table column definitions
const payrollColumns: ColumnDef<PayrollEmployee>[] = [
  {
    header: "Employee",
    accessor: "employee",
    className: "font-medium",
  },
  {
    header: "Basic Salary",
    accessor: "basicSalary",
  },
  {
    header: "Allowances",
    accessor: "allowances",
  },
  {
    header: "OT",
    accessor: "ot",
  },
  {
    header: "Gross Pay",
    accessor: "grossPay",
  },
  {
    header: "Deductions",
    accessor: "deductions",
  },
  {
    header: "Net Pay",
    accessor: "netPay",
  },
  {
    header: "Status",
    accessor: "status",
    useBadge: true,
    badgeVariantMap: {
      Processed: "success",
      Pending: "warning",
      Failed: "error",
    },
    className: "text-center",
    headerClassName: "text-center",
  },
];

// Table action items - will be defined inside component to use handlers

// Government Contributions Data
interface ContributionsData {
  sss_contributions: string;
  philhealth_contributions: string;
  pagibig_contributions: string;
}

interface ContributionsCardConfig {
  title: string;
  dataKey: keyof ContributionsData;
  subtitle: string;
  countColor: "default" | "green" | "blue" | "black" | "orange";
  iconImage: string;
  iconSize?: "sm" | "md" | "lg";
}

// Sample contributions data - This would typically come from an API/database
const contributionsData: ContributionsData = {
  sss_contributions: "₱228,600",
  philhealth_contributions: "₱171,450",
  pagibig_contributions: "₱25,400",
};

// Contributions card configuration
const contributionsCardConfig: ContributionsCardConfig[] = [
  {
    title: "SSS Contributions",
    dataKey: "sss_contributions",
    subtitle: "Employee + Employer share",
    countColor: "black",
    iconImage: "/sss.jpg",
    iconSize: "lg",
  },
  {
    title: "PhilHealth Contributions",
    dataKey: "philhealth_contributions",
    subtitle: "Employee + Employer share",
    countColor: "black",
    iconImage: "/philhealth.jpg",
    iconSize: "lg",
  },
  {
    title: "Pag-IBIG Contributions",
    dataKey: "pagibig_contributions",
    subtitle: "Employee + Employer share",
    countColor: "black",
    iconImage: "/pag-ibig.png",
  },
];

export function PayrollTab() {
  // Load payroll employees from localStorage on mount
  const [payrollEmployees, setPayrollEmployees] = useState<PayrollEmployee[]>(
    () => loadPayrollEmployeesFromStorage()
  );

  const [isProcessPayrollOpen, setIsProcessPayrollOpen] = useState(false);

  // Load employees for payroll processing
  const employeesForPayroll = useMemo(() => {
    return loadEmployeesForPayroll();
  }, []);

  // Handle payroll processing submission
  const handlePayrollSubmit = (data: PayrollFormData) => {
    try {
      // Transform form data to payroll employee format
      const newPayrollEmployee = transformFormDataToPayrollEmployee(data);

      // Add new payroll employee and sort by status priority
      const updatedEmployees = sortPayrollEmployeesById([
        newPayrollEmployee,
        ...payrollEmployees,
      ]);

      // Save to localStorage
      savePayrollEmployeesToStorage(updatedEmployees);

      // Update state to trigger re-render
      setPayrollEmployees(updatedEmployees);

      // Show success toast
      toast.success("Payroll Created Successfully", {
        description: `Payroll for ${data.employeeName} has been created and is pending processing.`,
        duration: 3000,
      });

      console.log("Payroll processed successfully:", newPayrollEmployee);
    } catch (error) {
      console.error("Error processing payroll:", error);
      // Show error toast
      toast.error("Failed to Process Payroll", {
        description:
          "An error occurred while processing the payroll. Please try again.",
        duration: 4000,
      });
    }
  };

  // Handle mark as processed
  const handleMarkAsProcessed = (record: PayrollEmployee) => {
    try {
      const updatedEmployees = sortPayrollEmployeesById(
        payrollEmployees.map((emp) =>
          emp.id === record.id ? { ...emp, status: "Processed" } : emp
        )
      );

      // Save to localStorage
      savePayrollEmployeesToStorage(updatedEmployees);

      // Update state to trigger re-render
      setPayrollEmployees(updatedEmployees);

      // Show success toast
      toast.success("Payroll Status Updated", {
        description: `Payroll ${record.id} for ${record.employee} has been marked as Processed.`,
        duration: 3000,
      });

      console.log("Payroll status updated to Processed:", record.id);
    } catch (error) {
      console.error("Error updating payroll status:", error);
      toast.error("Failed to Update Status", {
        description:
          "An error occurred while updating the payroll status. Please try again.",
        duration: 4000,
      });
    }
  };

  // Handle mark as pending
  const handleMarkAsPending = (record: PayrollEmployee) => {
    try {
      const updatedEmployees = sortPayrollEmployeesById(
        payrollEmployees.map((emp) =>
          emp.id === record.id ? { ...emp, status: "Pending" } : emp
        )
      );

      // Save to localStorage
      savePayrollEmployeesToStorage(updatedEmployees);

      // Update state to trigger re-render
      setPayrollEmployees(updatedEmployees);

      // Show success toast
      toast.success("Payroll Status Updated", {
        description: `Payroll ${record.id} for ${record.employee} has been marked as Pending.`,
        duration: 3000,
      });

      console.log("Payroll status updated to Pending:", record.id);
    } catch (error) {
      console.error("Error updating payroll status:", error);
      toast.error("Failed to Update Status", {
        description:
          "An error occurred while updating the payroll status. Please try again.",
        duration: 4000,
      });
    }
  };

  // Handle mark as failed
  const handleMarkAsFailed = (record: PayrollEmployee) => {
    try {
      const updatedEmployees = sortPayrollEmployeesById(
        payrollEmployees.map((emp) =>
          emp.id === record.id ? { ...emp, status: "Failed" } : emp
        )
      );

      // Save to localStorage
      savePayrollEmployeesToStorage(updatedEmployees);

      // Update state to trigger re-render
      setPayrollEmployees(updatedEmployees);

      // Show success toast
      toast.success("Payroll Status Updated", {
        description: `Payroll ${record.id} for ${record.employee} has been marked as Failed.`,
        duration: 3000,
      });

      console.log("Payroll status updated to Failed:", record.id);
    } catch (error) {
      console.error("Error updating payroll status:", error);
      toast.error("Failed to Update Status", {
        description:
          "An error occurred while updating the payroll status. Please try again.",
        duration: 4000,
      });
    }
  };

  // Table action items
  const payrollActions: ActionItem<PayrollEmployee>[] = [
    {
      label: "View",
      icon: Eye,
      onClick: (record) => {
        console.log("View payroll:", record);
        // Handle view action
      },
    },
    {
      label: "Edit",
      icon: Edit,
      onClick: (record) => {
        console.log("Edit payroll:", record);
        // Handle edit action
      },
    },
    {
      label: "Mark as Processed",
      icon: CheckCircle2,
      onClick: handleMarkAsProcessed,
    },
    {
      label: "Mark as Pending",
      icon: Clock,
      onClick: handleMarkAsPending,
    },
    {
      label: "Mark as Failed",
      icon: XCircle,
      onClick: handleMarkAsFailed,
      variant: "destructive",
    },
  ];

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-base font-semibold text-gray-900">
          Payroll Management
        </h1>
        <AppButtons
          filter={false}
          add={false}
          addOrder={1}
          leaveRequest={false}
          leaveRequestOrder={2}
          processPayroll={true}
          processPayrollOrder={1}
          processPayrollLabel="Process Payroll"
          onProcessPayrollClick={() => setIsProcessPayrollOpen(true)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {payrollCardConfig.map((card) => (
          <SimpleCard
            key={card.dataKey}
            title={card.title}
            count={payrollData[card.dataKey]}
            subtitle={card.subtitle}
            countColor={card.countColor}
          />
        ))}
      </div>
      <div className="w-full">
        <AppTable
          data={payrollEmployees}
          columns={payrollColumns}
          actions={payrollActions}
          itemsPerPage={5}
          caption="Payroll records for current period"
          minWidth="1000px"
          getRowId={(row) => row.id}
        />
      </div>
      <div className="w-full rounded-3xl p-4">
        <h1 className="text-base font-semibold mb-4">
          Government Contributions Summary (Philippines)
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {contributionsCardConfig.map((card) => (
            <SimpleCard
              key={card.dataKey}
              title={card.title}
              count={contributionsData[card.dataKey]}
              subtitle={card.subtitle}
              countColor={card.countColor}
              iconImage={card.iconImage}
              iconSize={card.iconSize}
            />
          ))}
        </div>
      </div>

      {/* Payroll Processing Dialog */}
      <PayrollProcessingDialog
        open={isProcessPayrollOpen}
        onOpenChange={setIsProcessPayrollOpen}
        title="Process Payroll"
        onSubmit={handlePayrollSubmit}
        employees={employeesForPayroll}
      />
    </div>
  );
}
