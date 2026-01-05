import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { AppButtons } from "@/components/common/app-Buttons";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import { PayrollProcessingDialog } from "@/components/dialogs/payroll-processing-dialog";
import {
  usePayrollStore,
  PayrollFormData,
  PayrollEntryFromAPI,
} from "@/stores/payroll";
import { Eye, Edit } from "lucide-react";
import { useEmployeeStore } from "@/stores/employee";

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

// Sample data removed - using computed data from payrollRuns instead (see payrollData useMemo below)

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

// Transform PayrollEntryFromAPI to display format
const transformPayrollEntry = (entry: PayrollEntryFromAPI) => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return {
    id: entry.id.toString(),
    employee: entry.employee?.name || `Employee ${entry.employee_id}`,
    basicSalary: formatCurrency(entry.basic_salary),
    allowances: formatCurrency(entry.allowances),
    ot: formatCurrency(entry.overtime_pay),
    grossPay: formatCurrency(entry.gross_pay),
    deductions: formatCurrency(entry.total_deductions),
    netPay: formatCurrency(entry.net_pay),
    status: entry.is_approved ? "Processed" : "Pending",
  };
};

// Table column definitions
const payrollColumns: ColumnDef<ReturnType<typeof transformPayrollEntry>>[] = [
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
  const {
    payrollRuns,
    payrollEntries,
    loading,
    error,
    fetchPayrollRuns,
    fetchPayrollEntries,
  } = usePayrollStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const [isProcessPayrollOpen, setIsProcessPayrollOpen] = useState(false);
  const [selectedRunId] = useState<number | null>(null);

  useEffect(() => {
    fetchPayrollRuns();
    fetchEmployees();
  }, [fetchPayrollRuns, fetchEmployees]);

  useEffect(() => {
    if (selectedRunId) {
      fetchPayrollEntries(selectedRunId);
    }
  }, [selectedRunId, fetchPayrollEntries]);

  // Calculate payroll data for cards
  const payrollData = useMemo(() => {
    const totalGross = payrollRuns.reduce((sum, r) => sum + r.total_gross, 0);
    const totalDeductions = payrollRuns.reduce((sum, r) => sum + r.total_deductions, 0);
    const totalNet = payrollRuns.reduce((sum, r) => sum + r.total_net, 0);
    const totalEmployees = payrollRuns.reduce((sum, r) => sum + r.employee_count, 0);
    const processedCount = payrollRuns.filter((r) => r.status === "approved").length;
    const processingStatus = payrollRuns.length > 0
      ? `${Math.round((processedCount / payrollRuns.length) * 100)}%`
      : "0%";

    return {
      total_monthly_payroll: `₱${totalGross.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      total_deductions: `₱${totalDeductions.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      net_payroll: `₱${totalNet.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      processing_status: processingStatus,
      employees_count: `${totalEmployees} employees`,
    };
  }, [payrollRuns]);

  // Transform payroll entries for table
  const payrollEmployees = useMemo(() => {
    return payrollEntries.map(transformPayrollEntry);
  }, [payrollEntries]);

  // Get employee options for payroll processing
  const employeesForPayroll = useMemo(() => {
    return employees.map((emp: any) => ({
      id: emp.id.toString(),
      name: `${emp.first_name} ${emp.last_name}`,
      salary: emp.monthly_salary || "0",
    }));
  }, [employees]);

  // Handle payroll processing submission
  const handlePayrollSubmit = async (_data: PayrollFormData) => {
    // This would create a payroll run - simplified for now
    toast.success("Payroll Processing", {
      description: "Payroll processing initiated.",
      duration: 3000,
    });
    setIsProcessPayrollOpen(false);
  };

  // Table action items
  const payrollActions: ActionItem<ReturnType<typeof transformPayrollEntry>>[] = [
    {
      label: "View",
      icon: Eye,
      onClick: (record) => {
        console.log("View payroll:", record);
      },
    },
    {
      label: "Edit",
      icon: Edit,
      onClick: (record) => {
        console.log("Edit payroll:", record);
      },
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
      {error && (
        <div className="bg-destructive/15 text-destructive border border-destructive/50 rounded-md p-4">
          {error}
        </div>
      )}

      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading payroll data...</p>
          </div>
        ) : (
          <AppTable
            data={payrollEmployees}
            columns={payrollColumns}
            actions={payrollActions}
            itemsPerPage={5}
            caption="Payroll records for current period"
            minWidth="1000px"
            getRowId={(row) => row.id}
          />
        )}
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
