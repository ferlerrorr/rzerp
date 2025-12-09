import { AppButtons } from "@/components/app-Buttons";
import { AppSearch } from "@/components/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import {
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

interface AccountPayableCounts {
  totalPayable: string;
  overdue: string;
  paidThisMonth: string;
  dueThisWeek: string;
}

interface AccountPayableCardConfig {
  title: string;
  dataKey: keyof AccountPayableCounts;
  countColor:
    | "default"
    | "green"
    | "blue"
    | "black"
    | "orange"
    | "red"
    | "purple";
  bgColor: string;
  icon:
    | typeof DollarSign
    | typeof AlertCircle
    | typeof CheckCircle2
    | typeof Calendar;
  iconBgColor:
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "pink"
    | "indigo"
    | "teal"
    | "yellow"
    | "gray"
    | "red";
  subtitle: string;
}

const accountPayableCounts: AccountPayableCounts = {
  totalPayable: "₱265,000",
  overdue: "₱45,000",
  paidThisMonth: "₱8,500",
  dueThisWeek: "5",
};

const accountPayableCardConfig: AccountPayableCardConfig[] = [
  {
    title: "Total Payable",
    dataKey: "totalPayable",
    countColor: "black",
    bgColor: "bg-white",
    icon: DollarSign,
    iconBgColor: "orange",
    subtitle: "2 pending invoices",
  },
  {
    title: "Overdue",
    dataKey: "overdue",
    countColor: "red",
    bgColor: "bg-white",
    icon: AlertCircle,
    iconBgColor: "red",
    subtitle: "1 overdue bills",
  },
  {
    title: "Paid This Month",
    dataKey: "paidThisMonth",
    countColor: "green",
    bgColor: "bg-white",
    icon: CheckCircle2,
    iconBgColor: "green",
    subtitle: "1 paid invoices",
  },
  {
    title: "Due This Week",
    dataKey: "dueThisWeek",
    countColor: "blue",
    bgColor: "bg-white",
    icon: Calendar,
    iconBgColor: "blue",
    subtitle: "invoices due soon",
  },
];

interface Invoice {
  id: string;
  invoiceNumber: string;
  vendor: string;
  description: string;
  invoiceDate: string;
  dueDate: string;
  amount: string;
  status: "Pending" | "Paid" | "Overdue";
}

const invoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    vendor: "ABC Supplies Co.",
    description: "Office supplies and equipment",
    invoiceDate: "2024-12-01",
    dueDate: "2024-12-15",
    amount: "₱125,000",
    status: "Pending",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    vendor: "XYZ Services Inc.",
    description: "Professional consulting services",
    invoiceDate: "2024-11-20",
    dueDate: "2024-12-05",
    amount: "₱45,000",
    status: "Overdue",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    vendor: "Tech Solutions Ltd.",
    description: "Software licensing and support",
    invoiceDate: "2024-12-05",
    dueDate: "2024-12-20",
    amount: "₱95,000",
    status: "Pending",
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    vendor: "Office Rentals Corp.",
    description: "Monthly office rent",
    invoiceDate: "2024-11-15",
    dueDate: "2024-11-30",
    amount: "₱8,500",
    status: "Paid",
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-005",
    vendor: "Marketing Agency",
    description: "Digital marketing campaign",
    invoiceDate: "2024-12-10",
    dueDate: "2024-12-25",
    amount: "₱140,000",
    status: "Pending",
  },
];

const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    header: "Invoice #",
    accessor: "invoiceNumber",
    className: "font-medium",
  },
  {
    header: "Vendor",
    accessor: "vendor",
  },
  {
    header: "Description",
    accessor: "description",
  },
  {
    header: "Invoice Date",
    accessor: "invoiceDate",
  },
  {
    header: "Due Date",
    accessor: "dueDate",
  },
  {
    header: "Amount",
    accessor: "amount",
    className: "font-semibold",
  },
  {
    header: "Status",
    accessor: "status",
    useBadge: true,
    badgeVariantMap: {
      Pending: "warning",
      Paid: "success",
      Overdue: "error",
    },
    className: "text-center",
    headerClassName: "text-center",
  },
];

const invoiceActions: ActionItem<Invoice>[] = [
  {
    label: "View",
    icon: Eye,
    onClick: (invoice) => {
      console.log("View invoice:", invoice);
    },
  },
  {
    label: "Edit",
    icon: Edit,
    onClick: (invoice) => {
      console.log("Edit invoice:", invoice);
    },
  },
  {
    label: "Delete",
    icon: Trash2,
    onClick: (invoice) => {
      console.log("Delete invoice:", invoice);
    },
    variant: "destructive",
  },
];

export function AccountPayablePage() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accountPayableCardConfig.map((config) => (
          <SimpleCard
            key={config.dataKey}
            title={config.title}
            count={accountPayableCounts[config.dataKey]}
            subtitle={config.subtitle}
            countColor={config.countColor}
            icon={config.icon}
            iconBgColor={config.iconBgColor}
            className={config.bgColor}
          />
        ))}
      </div>
      <div className="flex flex-row sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mt-1">
        {/* Left side: Search and Filter */}
        <div className="flex flex-row sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center flex-1 w-full sm:w-auto">
          <div className="flex-1 w-full sm:max-w-[20rem] min-w-0">
            <AppSearch />
          </div>
        </div>
        {/* Right side: Add Button */}

        <AppButtons
          filter={false}
          add={false}
          addInvoice={true}
          addInvoiceOrder={1}
        />
      </div>
      <div className="w-full">
        <AppTable
          data={invoices}
          columns={invoiceColumns}
          actions={invoiceActions}
          itemsPerPage={5}
          minWidth="1200px"
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
