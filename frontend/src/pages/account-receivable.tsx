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

interface AccountReceivableCounts {
  totalReceivable: string;
  overdue: string;
  collectedThisMonth: string;
  avgCollectionTime: string;
}

interface AccountReceivableCardConfig {
  title: string;
  dataKey: keyof AccountReceivableCounts;
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

const accountReceivableCounts: AccountReceivableCounts = {
  totalReceivable: "₱570,000",
  overdue: "₱125,000",
  collectedThisMonth: "₱85,000",
  avgCollectionTime: "18 days",
};

const accountReceivableCardConfig: AccountReceivableCardConfig[] = [
  {
    title: "Total Receivable",
    dataKey: "totalReceivable",
    countColor: "black",
    bgColor: "bg-white",
    icon: DollarSign,
    iconBgColor: "blue",
    subtitle: "3 outstanding invoices",
  },
  {
    title: "Overdue",
    dataKey: "overdue",
    countColor: "red",
    bgColor: "bg-white",
    icon: AlertCircle,
    iconBgColor: "red",
    subtitle: "1 overdue invoices",
  },
  {
    title: "Collected This Month",
    dataKey: "collectedThisMonth",
    countColor: "green",
    bgColor: "bg-white",
    icon: CheckCircle2,
    iconBgColor: "green",
    subtitle: "1 paid invoices",
  },
  {
    title: "Avg. Collection Time",
    dataKey: "avgCollectionTime",
    countColor: "purple",
    bgColor: "bg-white",
    icon: Calendar,
    iconBgColor: "purple",
    subtitle: "average payment time",
  },
];

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  description: string;
  invoiceDate: string;
  dueDate: string;
  amount: string;
  balance: string;
  status: "Pending" | "Paid" | "Overdue" | "Partial";
}

const invoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    customer: "ABC Corporation",
    description: "Software licensing and support",
    invoiceDate: "2024-12-01",
    dueDate: "2024-12-15",
    amount: "₱200,000",
    balance: "₱200,000",
    status: "Pending",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    customer: "XYZ Industries",
    description: "Professional consulting services",
    invoiceDate: "2024-11-20",
    dueDate: "2024-12-05",
    amount: "₱125,000",
    balance: "₱125,000",
    status: "Overdue",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    customer: "Tech Solutions Ltd.",
    description: "Monthly retainer services",
    invoiceDate: "2024-12-05",
    dueDate: "2024-12-20",
    amount: "₱245,000",
    balance: "₱245,000",
    status: "Pending",
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    customer: "Global Enterprises",
    description: "Product delivery and installation",
    invoiceDate: "2024-11-15",
    dueDate: "2024-11-30",
    amount: "₱85,000",
    balance: "₱0",
    status: "Paid",
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-005",
    customer: "Startup Inc.",
    description: "Custom development project",
    invoiceDate: "2024-12-10",
    dueDate: "2024-12-25",
    amount: "₱150,000",
    balance: "₱75,000",
    status: "Partial",
  },
];

const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    header: "Invoice #",
    accessor: "invoiceNumber",
    className: "font-medium",
  },
  {
    header: "Customer",
    accessor: "customer",
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
    header: "Balance",
    accessor: "balance",
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
      Partial: "info",
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

export function AccountReceivablePage() {
  return (
    <div>
      <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-base font-semibold text-gray-900">
            Account Receivable
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accountReceivableCardConfig.map((config) => (
            <SimpleCard
              key={config.dataKey}
              title={config.title}
              count={accountReceivableCounts[config.dataKey]}
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
            addInvoice={false}
            createInvoice={true}
            createInvoiceOrder={1}
            createInvoiceLabel="Create Invoice"
            addOrder={2}
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
    </div>
  );
}
