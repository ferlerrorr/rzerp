import { useState, useMemo } from "react";
import { toast } from "sonner";
import { AppButtons } from "@/components/app-Buttons";
import { AppSearch } from "@/components/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import { CreateInvoiceDialog } from "@/components/create-invoice-dialog";
import { RecordPaymentDialog } from "@/components/record-payment-dialog";
import { ReceivableInvoiceFormData } from "@/stores/receivableInvoice";
import {
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Eye,
  CreditCard,
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

// Default invoices
const defaultInvoices: Invoice[] = [
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

// LocalStorage keys
const RECEIVABLE_INVOICES_STORAGE_KEY = "rzerp_receivable_invoices";
const RECEIVABLE_INVOICE_COUNTER_KEY = "rzerp_receivable_invoice_counter";

// Helper functions for localStorage
const loadInvoicesFromStorage = (): Invoice[] => {
  try {
    const stored = localStorage.getItem(RECEIVABLE_INVOICES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default invoices if no data exists
    saveInvoicesToStorage(defaultInvoices);
    // Initialize counter
    if (!localStorage.getItem(RECEIVABLE_INVOICE_COUNTER_KEY)) {
      localStorage.setItem(RECEIVABLE_INVOICE_COUNTER_KEY, "5");
    }
    return defaultInvoices;
  } catch (error) {
    console.error("Error loading invoices from localStorage:", error);
    return defaultInvoices;
  }
};

const saveInvoicesToStorage = (invoices: Invoice[]) => {
  try {
    localStorage.setItem(
      RECEIVABLE_INVOICES_STORAGE_KEY,
      JSON.stringify(invoices)
    );
  } catch (error) {
    console.error("Error saving invoices to localStorage:", error);
  }
};

const getNextInvoiceId = (): string => {
  try {
    const counter = parseInt(
      localStorage.getItem(RECEIVABLE_INVOICE_COUNTER_KEY) || "5",
      10
    );
    const nextCounter = counter + 1;
    localStorage.setItem(
      RECEIVABLE_INVOICE_COUNTER_KEY,
      nextCounter.toString()
    );
    return nextCounter.toString();
  } catch (error) {
    console.error("Error getting next invoice ID:", error);
    return Date.now().toString();
  }
};

// Calculate invoice status based on due date and balance
const calculateInvoiceStatus = (
  dueDate: string,
  balance: number,
  amount: number
): "Pending" | "Paid" | "Overdue" | "Partial" => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (balance === 0) {
    return "Paid";
  }

  if (balance < amount) {
    return "Partial";
  }

  if (due < today) {
    return "Overdue";
  }

  return "Pending";
};

// Transform ReceivableInvoiceFormData to Invoice
const transformFormDataToInvoice = (
  formData: ReceivableInvoiceFormData
): Invoice => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const amount = parseFloat(formData.amount) || 0;
  const status = calculateInvoiceStatus(formData.dueDate, amount, amount);

  return {
    id: getNextInvoiceId(),
    invoiceNumber: formData.invoiceNumber.trim(),
    customer: formData.customer.trim(),
    description: formData.description.trim(),
    invoiceDate: formData.invoiceDate,
    dueDate: formData.dueDate,
    amount: formatCurrency(amount),
    balance: formatCurrency(amount),
    status,
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

export function AccountReceivablePage() {
  // Load invoices from localStorage on mount
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadInvoicesFromStorage()
  );

  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState<Invoice | null>(null);

  // Calculate account receivable counts dynamically
  const accountReceivableCounts = useMemo(() => {
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

  // Handle invoice submission
  const handleInvoiceSubmit = (data: ReceivableInvoiceFormData) => {
    try {
      // Transform form data to invoice format
      const newInvoice = transformFormDataToInvoice(data);

      // Add new invoice to the beginning of the list
      const updatedInvoices = [newInvoice, ...invoices];

      // Save to localStorage
      saveInvoicesToStorage(updatedInvoices);

      // Update state to trigger re-render
      setInvoices(updatedInvoices);

      // Show success toast
      toast.success("Invoice Created Successfully", {
        description: `Invoice ${newInvoice.invoiceNumber} has been created.`,
        duration: 3000,
      });

      console.log("Invoice created successfully:", newInvoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      // Show error toast
      toast.error("Failed to Create Invoice", {
        description:
          "An error occurred while creating the invoice. Please try again.",
        duration: 4000,
      });
    }
  };

  // Handle record payment
  const handleRecordPayment = (invoiceId: string, paymentAmount: number) => {
    try {
      const formatCurrency = (amount: number) => {
        return `₱${amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      };

      const parseCurrency = (value: string) => {
        return parseFloat(value.replace(/[₱,]/g, "")) || 0;
      };

      const updatedInvoices = invoices.map((inv) => {
        if (inv.id === invoiceId) {
          const currentBalance = parseCurrency(inv.balance);
          const newBalance = Math.max(0, currentBalance - paymentAmount);
          const totalAmount = parseCurrency(inv.amount);

          let newStatus: "Pending" | "Paid" | "Overdue" | "Partial" = "Pending";
          if (newBalance === 0) {
            newStatus = "Paid";
          } else if (newBalance < totalAmount) {
            newStatus = "Partial";
          } else {
            // Recalculate status based on due date
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const due = new Date(inv.dueDate);
            due.setHours(0, 0, 0, 0);
            newStatus = due < today ? "Overdue" : "Pending";
          }

          return {
            ...inv,
            balance: formatCurrency(newBalance),
            status: newStatus,
          };
        }
        return inv;
      });

      saveInvoicesToStorage(updatedInvoices);
      setInvoices(updatedInvoices);

      const invoice = invoices.find((inv) => inv.id === invoiceId);
      toast.success("Payment Recorded", {
        description: `Payment of ${formatCurrency(
          paymentAmount
        )} recorded for invoice ${invoice?.invoiceNumber}.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to Record Payment", {
        description: "An error occurred while recording the payment.",
        duration: 4000,
      });
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
  }, [invoices]);

  return (
    <div>
      <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-base font-semibold text-gray-900">
            Account Receivable
          </h1>
        </div>
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
        </div>
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
