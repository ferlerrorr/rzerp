import { AppButtons } from "@/components/common/app-Buttons";
import { AppSearch } from "@/components/common/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { CreateInvoiceDialog } from "@/components/dialogs/create-invoice-dialog";
import { RecordPaymentDialog } from "@/components/dialogs/record-payment-dialog";
import { ActionItem, AppTable, ColumnDef } from "@/components/table/appTable";
import {
  useReceivableInvoiceStore,
  ReceivableInvoiceFromAPI,
} from "@/stores/receivableInvoice";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Eye,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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

// Invoice Data for display
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

// Transform API invoice to display format
const transformApiReceivableInvoiceToInvoice = (
  apiInvoice: ReceivableInvoiceFromAPI
): Invoice => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const amount = parseFloat(apiInvoice.amount) || 0;
  const balance = parseFloat(apiInvoice.balance) || 0;

  return {
    id: apiInvoice.id.toString(),
    invoiceNumber: apiInvoice.invoice_number,
    customer: apiInvoice.customer.company_name,
    description: apiInvoice.description,
    invoiceDate: apiInvoice.invoice_date,
    dueDate: apiInvoice.due_date,
    amount: formatCurrency(amount),
    balance: formatCurrency(balance),
    status: apiInvoice.status,
  };
};

const accountReceivableCardConfig: AccountReceivableCardConfig[] = [
  {
    title: "Total Receivable",
    dataKey: "totalReceivable",
    countColor: "black",
    bgColor: "bg-white",
    icon: DollarSign,
    iconBgColor: "blue",
    subtitle: "outstanding invoices",
  },
  {
    title: "Overdue",
    dataKey: "overdue",
    countColor: "red",
    bgColor: "bg-white",
    icon: AlertCircle,
    iconBgColor: "red",
    subtitle: "overdue invoices",
  },
  {
    title: "Collected This Month",
    dataKey: "collectedThisMonth",
    countColor: "green",
    bgColor: "bg-white",
    icon: CheckCircle2,
    iconBgColor: "green",
    subtitle: "paid invoices",
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

// Skeleton components
const CardSkeleton = () => (
  <div className="bg-white rounded-lg border border-border p-6">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
    <Skeleton className="h-8 w-24 mb-2" />
    <Skeleton className="h-3 w-40" />
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white rounded-lg border border-border overflow-hidden">
    <div className="p-4 space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  </div>
);

export function AccountReceivableTab() {
  const {
    receivableInvoices,
    loading,
    fetchReceivableInvoices,
    recordPayment,
  } = useReceivableInvoiceStore();

  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState<Invoice | null>(null);

  // Fetch invoices on mount
  useEffect(() => {
    fetchReceivableInvoices();
  }, [fetchReceivableInvoices]);

  // Transform API invoices to display format
  const invoices = useMemo(() => {
    return receivableInvoices.map(transformApiReceivableInvoiceToInvoice);
  }, [receivableInvoices]);

  // Calculate account receivable counts dynamically
  const accountReceivableCounts = useMemo(() => {
    if (invoices.length === 0) {
      return {
        totalReceivable: "0",
        overdue: "0",
        collectedThisMonth: "0",
        avgCollectionTime: "0 days",
      };
    }

    const formatCurrency = (amount: number): string => {
      return `₱${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    const parseCurrency = (value: string) => {
      return parseFloat(value.replace(/[₱,]/g, "")) || 0;
    };

    const totalReceivable = invoices
      .filter((inv) => inv.status !== "Paid")
      .reduce((sum, inv) => sum + parseCurrency(inv.balance), 0);

    const overdue = invoices
      .filter((inv) => inv.status === "Overdue")
      .reduce((sum, inv) => sum + parseCurrency(inv.balance), 0);

    const collectedThisMonth = invoices
      .filter((inv) => {
        if (inv.status !== "Paid") return false;
        const paidDate = new Date(inv.invoiceDate);
        const now = new Date();
        return (
          paidDate.getMonth() === now.getMonth() &&
          paidDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, inv) => sum + parseCurrency(inv.amount), 0);

    // Calculate average collection time (simplified - using days between invoice and due date for paid invoices)
    const paidInvoices = invoices.filter((inv) => inv.status === "Paid");
    const avgCollectionTime =
      paidInvoices.length > 0
        ? Math.round(
            paidInvoices.reduce((sum, inv) => {
              const invoiceDate = new Date(inv.invoiceDate);
              const dueDate = new Date(inv.dueDate);
              const days = Math.ceil(
                (dueDate.getTime() - invoiceDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              return sum + days;
            }, 0) / paidInvoices.length
          )
        : 0;

    return {
      totalReceivable: formatCurrency(totalReceivable),
      overdue: formatCurrency(overdue),
      collectedThisMonth: formatCurrency(collectedThisMonth),
      avgCollectionTime: `${avgCollectionTime} days`,
    };
  }, [invoices]);

  // Update card config with dynamic subtitles
  const accountReceivableCardConfigWithSubtitle = useMemo(() => {
    const outstandingCount = invoices.filter(
      (inv) => inv.status !== "Paid"
    ).length;
    const overdueCount = invoices.filter(
      (inv) => inv.status === "Overdue"
    ).length;
    const paidCount = invoices.filter((inv) => inv.status === "Paid").length;

    return accountReceivableCardConfig.map((config) => {
      if (config.dataKey === "totalReceivable") {
        return {
          ...config,
          subtitle: `${outstandingCount} outstanding invoices`,
        };
      } else if (config.dataKey === "overdue") {
        return { ...config, subtitle: `${overdueCount} overdue invoices` };
      } else if (config.dataKey === "collectedThisMonth") {
        return { ...config, subtitle: `${paidCount} paid invoices` };
      } else {
        return { ...config, subtitle: "average payment time" };
      }
    });
  }, [invoices]);

  // Handle invoice submission (refresh after creation)
  const handleInvoiceSubmit = () => {
    fetchReceivableInvoices();
  };

  // Handle record payment
  const handleRecordPayment = async (invoiceId: string, paymentAmount: number) => {
    const success = await recordPayment(parseInt(invoiceId), paymentAmount);
    if (success) {
      setIsRecordPaymentOpen(false);
      setSelectedInvoiceForPayment(null);
    }
  };

  // Handle open record payment dialog
  const handleOpenRecordPayment = (invoice: Invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setIsRecordPaymentOpen(true);
  };

  // Update actions based on invoice status
  const invoiceActions = useMemo(() => {
    return (invoice: Invoice): ActionItem<Invoice>[] => {
      // Paid: Only View
      if (invoice.status === "Paid") {
        return [
          {
            label: "View",
            icon: Eye,
            onClick: (inv) => {
              console.log("View invoice:", inv);
            },
          },
        ];
      }

      // Pending, Partial, Overdue: Record Payment and View
      return [
        {
          label: "View",
          icon: Eye,
          onClick: (inv) => {
            console.log("View invoice:", inv);
          },
        },
        {
          label: "Record Payment",
          icon: CreditCard,
          onClick: handleOpenRecordPayment,
        },
      ];
    };
  }, []);

  if (loading && invoices.length === 0) {
    return (
      <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accountReceivableCardConfigWithSubtitle.map((config) => (
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
          onCreateInvoiceClick={() => setIsCreateInvoiceOpen(true)}
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
        {invoices.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No invoices found
          </div>
        )}
      </div>

      {/* Create Invoice Dialog */}
      <CreateInvoiceDialog
        open={isCreateInvoiceOpen}
        onOpenChange={setIsCreateInvoiceOpen}
        title="Create Invoice"
        onSubmit={handleInvoiceSubmit}
      />

      {/* Record Payment Dialog */}
      <RecordPaymentDialog
        open={isRecordPaymentOpen}
        onOpenChange={setIsRecordPaymentOpen}
        invoice={selectedInvoiceForPayment}
        onRecordPayment={handleRecordPayment}
      />
    </div>
  );
}
