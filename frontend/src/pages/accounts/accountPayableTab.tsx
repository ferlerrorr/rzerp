import { AddInvoiceDialog, Vendor } from "@/components/dialogs/add-invoice-dialog";
import { AppButtons } from "@/components/common/app-Buttons";
import { AppSearch } from "@/components/common/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { ActionItem, AppTable, ColumnDef } from "@/components/table/appTable";
import { InvoiceFormData } from "@/stores/invoice";
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
import { useMemo, useState } from "react";
import { toast } from "sonner";

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

// Default vendors
const defaultVendors: Vendor[] = [
  { id: "1", name: "ABC Supplies Co." },
  { id: "2", name: "XYZ Services Inc." },
  { id: "3", name: "Tech Solutions Ltd." },
  { id: "4", name: "Office Rentals Corp." },
  { id: "5", name: "Marketing Agency" },
];

// LocalStorage keys
const INVOICES_STORAGE_KEY = "rzerp_invoices";
const INVOICE_COUNTER_KEY = "rzerp_invoice_counter";
const VENDORS_STORAGE_KEY = "rzerp_vendors";

// Helper functions for localStorage
const loadInvoicesFromStorage = (): Invoice[] => {
  try {
    const stored = localStorage.getItem(INVOICES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default invoices if no data exists
    saveInvoicesToStorage(defaultInvoices);
    // Initialize counter
    if (!localStorage.getItem(INVOICE_COUNTER_KEY)) {
      localStorage.setItem(INVOICE_COUNTER_KEY, "5");
    }
    return defaultInvoices;
  } catch (error) {
    console.error("Error loading invoices from localStorage:", error);
    return defaultInvoices;
  }
};

const saveInvoicesToStorage = (invoices: Invoice[]) => {
  try {
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
  } catch (error) {
    console.error("Error saving invoices to localStorage:", error);
  }
};

const getNextInvoiceId = (): string => {
  try {
    const counter = parseInt(
      localStorage.getItem(INVOICE_COUNTER_KEY) || "5",
      10
    );
    const nextCounter = counter + 1;
    localStorage.setItem(INVOICE_COUNTER_KEY, nextCounter.toString());
    return nextCounter.toString();
  } catch (error) {
    console.error("Error getting next invoice ID:", error);
    return Date.now().toString();
  }
};

// Load vendors from localStorage
const loadVendorsFromStorage = (): Vendor[] => {
  try {
    const stored = localStorage.getItem(VENDORS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default vendors if no data exists
    saveVendorsToStorage(defaultVendors);
    return defaultVendors;
  } catch (error) {
    console.error("Error loading vendors from localStorage:", error);
    return defaultVendors;
  }
};

const saveVendorsToStorage = (vendors: Vendor[]) => {
  try {
    localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(vendors));
  } catch (error) {
    console.error("Error saving vendors to localStorage:", error);
  }
};

// Calculate invoice status based on due date
const calculateInvoiceStatus = (
  dueDate: string
): "Pending" | "Approved" | "Paid" | "Overdue" => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  // For now, we'll set new invoices as "Pending"
  // Status can be changed manually later via actions
  if (due < today) {
    return "Overdue";
  }
  return "Pending";
};

// Transform InvoiceFormData to Invoice
const transformFormDataToInvoice = (
  formData: InvoiceFormData,
  vendors: Vendor[]
): Invoice => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const vendor = vendors.find((v) => v.id === formData.vendorId);
  const amount = parseFloat(formData.amount) || 0;
  const status = calculateInvoiceStatus(formData.dueDate);

  return {
    id: getNextInvoiceId(),
    invoiceNumber: formData.invoiceNumber.trim(),
    vendor: vendor?.name || "Unknown Vendor",
    description: formData.description.trim(),
    invoiceDate: formData.invoiceDate,
    dueDate: formData.dueDate,
    amount: formatCurrency(amount),
    status,
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
  status: "Pending" | "Approved" | "Paid" | "Overdue";
}

// Default invoices
const defaultInvoices: Invoice[] = [
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
      Approved: "info",
      Paid: "success",
      Overdue: "error",
    },
    className: "text-center",
    headerClassName: "text-center",
  },
];

export function AccountPayableTab() {
  // Load invoices from localStorage on mount
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadInvoicesFromStorage()
  );

  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);

  // Load vendors for invoice dialog
  const vendors = useMemo(() => {
    return loadVendorsFromStorage();
  }, []);

  // Calculate account payable counts dynamically
  const accountPayableCounts = useMemo(() => {
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
  const handleInvoiceSubmit = (data: InvoiceFormData) => {
    try {
      // Transform form data to invoice format
      const newInvoice = transformFormDataToInvoice(data, vendors);

      // Add new invoice to the beginning of the list
      const updatedInvoices = [newInvoice, ...invoices];

      // Save to localStorage
      saveInvoicesToStorage(updatedInvoices);

      // Update state to trigger re-render
      setInvoices(updatedInvoices);

      // Show success toast
      toast.success("Invoice Added Successfully", {
        description: `Invoice ${newInvoice.invoiceNumber} has been added.`,
        duration: 3000,
      });

      console.log("Invoice added successfully:", newInvoice);
    } catch (error) {
      console.error("Error adding invoice:", error);
      // Show error toast
      toast.error("Failed to Add Invoice", {
        description:
          "An error occurred while adding the invoice. Please try again.",
        duration: 4000,
      });
    }
  };

  // Handle delete invoice
  const handleDeleteInvoice = (invoice: Invoice) => {
    try {
      const updatedInvoices = invoices.filter((inv) => inv.id !== invoice.id);
      saveInvoicesToStorage(updatedInvoices);
      setInvoices(updatedInvoices);

      toast.success("Invoice Deleted", {
        description: `Invoice ${invoice.invoiceNumber} has been deleted.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to Delete Invoice", {
        description: "An error occurred while deleting the invoice.",
        duration: 4000,
      });
    }
  };

  // Handle approve invoice
  const handleApproveInvoice = (invoice: Invoice) => {
    try {
      const updatedInvoices = invoices.map((inv) =>
        inv.id === invoice.id ? { ...inv, status: "Approved" as const } : inv
      );
      saveInvoicesToStorage(updatedInvoices);
      setInvoices(updatedInvoices);

      toast.success("Invoice Approved", {
        description: `Invoice ${invoice.invoiceNumber} has been approved.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error approving invoice:", error);
      toast.error("Failed to Approve Invoice", {
        description: "An error occurred while approving the invoice.",
        duration: 4000,
      });
    }
  };

  // Handle pay invoice
  const handlePayInvoice = (invoice: Invoice) => {
    try {
      const updatedInvoices = invoices.map((inv) =>
        inv.id === invoice.id ? { ...inv, status: "Paid" as const } : inv
      );
      saveInvoicesToStorage(updatedInvoices);
      setInvoices(updatedInvoices);

      toast.success("Invoice Paid", {
        description: `Invoice ${invoice.invoiceNumber} has been marked as paid.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error paying invoice:", error);
      toast.error("Failed to Pay Invoice", {
        description: "An error occurred while marking the invoice as paid.",
        duration: 4000,
      });
    }
  };

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
