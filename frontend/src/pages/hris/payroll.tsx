import { AppButtons } from "@/components/app-Buttons";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef } from "@/components/table/appTable";

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

// Sample payroll employee data - This would typically come from an API/database
const payrollEmployees: PayrollEmployee[] = [
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
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex justify-end">
        <AppButtons
          filter={false}
          add={false}
          addOrder={1}
          leaveRequest={false}
          leaveRequestOrder={2}
          processPayroll={true}
          processPayrollOrder={1}
          processPayrollLabel="Process Payroll"
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
    </div>
  );
}
