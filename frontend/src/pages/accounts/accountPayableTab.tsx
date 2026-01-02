import { AddInvoiceDialog } from "@/components/dialogs/add-invoice-dialog";
import { AppButtons } from "@/components/common/app-Buttons";
import { AppSearch } from "@/components/common/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { ActionItem, AppTable, ColumnDef } from "@/components/table/appTable";
import {
  useInvoiceStore,
  InvoiceFromAPI,
} from "@/stores/invoice";
import { useVendorStore } from "@/stores/vendor";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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

// Invoice Data for display
interface Invoice {
  id: string;
  invoiceNumber: string;
  vendor: string;
  description: string;
  invoiceDate: string;
  dueDate: string;
  amount: string;
  status: "Pending" | "Approved" | "Paid" | "Overdue";
}

// Transform API invoice to display format
const transformApiInvoiceToInvoice = (
  apiInvoice: InvoiceFromAPI
): Invoice => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const amount = parseFloat(apiInvoice.amount) || 0;

  return {
    id: apiInvoice.id.toString(),
    invoiceNumber: apiInvoice.invoice_number,
    vendor: apiInvoice.vendor.name,
    description: apiInvoice.description,
    invoiceDate: apiInvoice.invoice_date,
    dueDate: apiInvoice.due_date,
    amount: formatCurrency(amount),
    status: apiInvoice.status,
  };
};

const accountPayableCardConfig: AccountPayableCardConfig[] = [
  {
    title: "Total Payable",
    dataKey: "totalPayable",
    countColor: "black",
    bgColor: "bg-white",
    icon: DollarSign,
    iconBgColor: "orange",
    subtitle: "pending invoices",
  },
  {
    title: "Overdue",
    dataKey: "overdue",
    countColor: "red",
    bgColor: "bg-white",
    icon: AlertCircle,
    iconBgColor: "red",
    subtitle: "overdue bills",
  },
  {
    title: "Paid This Month",
    dataKey: "paidThisMonth",
    countColor: "green",
    bgColor: "bg-white",
    icon: CheckCircle2,
    iconBgColor: "green",
    subtitle: "paid invoices",
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
      Approved: "info",
      Paid: "success",
      Overdue: "error",
    },
    className: "text-center",
    headerClassName: "text-center",
  },
];

// Skeleton components
const CardSkeleton = () => (
  <div className="bg-white rounded-lg border border-border p-4">
    <div className="flex items-center justify-between mb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="h-8 w-32 mb-2" />
    <Skeleton className="h-3 w-40" />
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white rounded-lg border border-border p-4">
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  </div>
);

export function AccountPayableTab() {
  const {
    invoices: apiInvoices,
    loading,
    error,
    fetchInvoices,
    deleteInvoice,
    approveInvoice,
    payInvoice,
  } = useInvoiceStore();

  const {
    vendors: apiVendors,
    fetchVendors,
  } = useVendorStore();

  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);

  // Fetch invoices and vendors on mount
  useEffect(() => {
    // Set high per_page to get all invoices
    const { setFilters: setInvoiceFilters } = useInvoiceStore.getState();
    setInvoiceFilters({ per_page: 1000 });
    fetchInvoices();
    
    // Set high per_page to get all vendors
    const { setFilters: setVendorFilters } = useVendorStore.getState();
    setVendorFilters({ per_page: 1000 });
    fetchVendors();
  }, [fetchInvoices, fetchVendors]);

  // Transform API invoices to display format
  const invoices = useMemo(() => {
    return apiInvoices.map(transformApiInvoiceToInvoice);
  }, [apiInvoices]);

  // Transform API vendors for dialog
  const vendors = useMemo(() => {
    return apiVendors.map((vendor) => ({
      id: vendor.id.toString(),
      name: vendor.company_name,
    }));
  }, [apiVendors]);

  // Calculate account payable counts dynamically
  const accountPayableCounts = useMemo(() => {
    // If no invoices, return "0" for all counts
    if (invoices.length === 0) {
      return {
        totalPayable: "0",
        overdue: "0",
        paidThisMonth: "0",
        dueThisWeek: "0",
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

    const totalPayable = invoices
      .filter((inv) => inv.status !== "Paid")
      .reduce((sum, inv) => sum + parseCurrency(inv.amount), 0);

    const overdue = invoices
      .filter((inv) => inv.status === "Overdue")
      .reduce((sum, inv) => sum + parseCurrency(inv.amount), 0);

    const paidThisMonth = invoices
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

    const today = new Date();
    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);

    const dueThisWeek = invoices.filter((inv) => {
      if (inv.status === "Paid") return false;
      const dueDate = new Date(inv.dueDate);
      return dueDate >= today && dueDate <= weekFromNow;
    }).length;

    return {
      totalPayable: formatCurrency(totalPayable),
      overdue: formatCurrency(overdue),
      paidThisMonth: formatCurrency(paidThisMonth),
      dueThisWeek: dueThisWeek.toString(),
    };
  }, [invoices]);

  // Update card config with dynamic subtitles
  const accountPayableCardConfigWithSubtitle = useMemo(() => {
    // If no invoices, return subtitles with "0"
    if (invoices.length === 0) {
      return accountPayableCardConfig.map((config) => {
        if (config.dataKey === "totalPayable") {
          return { ...config, subtitle: "0 pending invoices" };
        } else if (config.dataKey === "overdue") {
          return { ...config, subtitle: "0 overdue bills" };
        } else if (config.dataKey === "paidThisMonth") {
          return { ...config, subtitle: "0 paid invoices" };
        } else {
          return { ...config, subtitle: "0 invoices due soon" };
        }
      });
    }

    const pendingCount = invoices.filter(
      (inv) => inv.status === "Pending"
    ).length;
    const overdueCount = invoices.filter(
      (inv) => inv.status === "Overdue"
    ).length;
    const paidCount = invoices.filter((inv) => inv.status === "Paid").length;

    return accountPayableCardConfig.map((config) => {
      if (config.dataKey === "totalPayable") {
        return { ...config, subtitle: `${pendingCount} pending invoices` };
      } else if (config.dataKey === "overdue") {
        return { ...config, subtitle: `${overdueCount} overdue bills` };
      } else if (config.dataKey === "paidThisMonth") {
        return { ...config, subtitle: `${paidCount} paid invoices` };
      } else {
        return { ...config, subtitle: "invoices due soon" };
      }
    });
  }, [invoices]);

  // Handle invoice submission
  const handleInvoiceSubmit = async () => {
    // The dialog already handles the API call via the store
    // Just refresh the invoices list
    await fetchInvoices();
  };

  // Handle delete invoice
  const handleDeleteInvoice = async (invoice: Invoice) => {
    const result = await deleteInvoice(parseInt(invoice.id));
    if (result) {
      toast.success("Invoice Deleted", {
        description: `Invoice ${invoice.invoiceNumber} has been deleted.`,
        duration: 3000,
      });
    }
  };

  // Handle approve invoice
  const handleApproveInvoice = async (invoice: Invoice) => {
    const result = await approveInvoice(parseInt(invoice.id));
    if (result) {
      toast.success("Invoice Approved", {
        description: `Invoice ${invoice.invoiceNumber} has been approved.`,
        duration: 3000,
      });
    }
  };

  // Handle pay invoice
  const handlePayInvoice = async (invoice: Invoice) => {
    const result = await payInvoice(parseInt(invoice.id));
    if (result) {
      toast.success("Invoice Paid", {
        description: `Invoice ${invoice.invoiceNumber} has been marked as paid.`,
        duration: 3000,
      });
    }
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error("Failed to Load Invoices", {
        description: error,
        duration: 4000,
      });
    }
  }, [error]);

  // Update actions based on invoice status
  const invoiceActions = useMemo(() => {
    return (invoice: Invoice): ActionItem<Invoice>[] => {
      // Paid and Overdue: Only View
      if (invoice.status === "Paid" || invoice.status === "Overdue") {
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

      // Approved: Pay and View
      if (invoice.status === "Approved") {
        return [
          {
            label: "View",
            icon: Eye,
            onClick: (inv) => {
              console.log("View invoice:", inv);
            },
          },
          {
            label: "Pay",
            icon: CreditCard,
            onClick: handlePayInvoice,
          },
        ];
      }

      // Pending: Approve, View, Edit, Delete
      return [
        {
          label: "View",
          icon: Eye,
          onClick: (inv) => {
            console.log("View invoice:", inv);
          },
        },
        {
          label: "Edit",
          icon: Edit,
          onClick: (inv) => {
            console.log("Edit invoice:", inv);
          },
        },
        {
          label: "Approve",
          icon: CheckCircle2,
          onClick: handleApproveInvoice,
        },
        {
          label: "Delete",
          icon: Trash2,
          onClick: handleDeleteInvoice,
          variant: "destructive",
        },
      ];
    };
  }, [invoices]);

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      {loading && invoices.length === 0 ? (
        <>
          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          
          {/* Skeleton Table */}
          <TableSkeleton />
        </>
      ) : (
        <>
          {/* Always show cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accountPayableCardConfigWithSubtitle.map((config) => (
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
          
          {/* Always show search and button */}
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
              onAddInvoiceClick={() => setIsAddInvoiceOpen(true)}
            />
          </div>
          
          {/* Always show table */}
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
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">No invoices</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Invoice Dialog */}
      <AddInvoiceDialog
        open={isAddInvoiceOpen}
        onOpenChange={setIsAddInvoiceOpen}
        title="Add Invoice"
        onSubmit={handleInvoiceSubmit}
        vendors={vendors}
      />
    </div>
  );
}
