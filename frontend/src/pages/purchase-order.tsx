import { AppButtons } from "@/components/common/app-Buttons";
import { AppSearch } from "@/components/common/app-Serach";
import {
  PurchaseOrderCard,
  PurchaseOrderItem,
} from "@/components/card/purchaseOrderCard";
import { SimpleCard } from "@/components/card/simpleCard";
import { CreatePODialog } from "@/components/dialogs/create-po-dialog";
import { PurchaseOrderFormData } from "@/stores/purchaseOrder";
import { Calendar, CheckCircle2, Package, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface PurchaseOrderCounts {
  totalPOs: string;
  pendingApproval: string;
  totalValue: string;
  received: string;
}

interface PurchaseOrderCardConfig {
  title: string;
  dataKey: keyof PurchaseOrderCounts;
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
    | typeof ShoppingCart
    | typeof Calendar
    | typeof Package
    | typeof CheckCircle2;
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
  subtitle?: string;
}

// Default purchase orders
const defaultPurchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    poNumber: "PO-2024-001",
    status: "approved",
    vendor: "Tech Supplies Inc.",
    requestedBy: "Juan Dela Cruz",
    orderDate: "2024-12-01",
    expectedDelivery: "2024-12-15",
    totalAmount: "₱34,500",
    items: [
      {
        name: "Wireless Mouse",
        quantity: 50,
        unitPrice: 450,
        subtotal: 22500,
      },
      {
        name: "USB Cables",
        quantity: 100,
        unitPrice: 120,
        subtotal: 12000,
      },
    ],
    notes: "Urgent order for new office setup",
  },
  {
    id: "2",
    poNumber: "PO-2024-002",
    status: "ordered",
    vendor: "Office Depot PH",
    requestedBy: "Maria Santos",
    orderDate: "2024-12-03",
    expectedDelivery: "2024-12-10",
    totalAmount: "₱5,750",
    items: [
      {
        name: "A4 Paper",
        quantity: 20,
        unitPrice: 250,
        subtotal: 5000,
      },
      {
        name: "Pens",
        quantity: 50,
        unitPrice: 15,
        subtotal: 750,
      },
    ],
    notes: "Monthly supplies restock",
  },
  {
    id: "3",
    poNumber: "PO-2024-003",
    status: "pending",
    vendor: "Tech Supplies Inc.",
    requestedBy: "Pedro Reyes",
    orderDate: "2024-12-05",
    expectedDelivery: "2024-12-20",
    totalAmount: "₱8,500",
    items: [
      {
        name: "Laptop Chargers",
        quantity: 10,
        unitPrice: 850,
        subtotal: 8500,
      },
    ],
    notes: "Replacement chargers needed",
  },
];

// LocalStorage keys
const PURCHASE_ORDERS_STORAGE_KEY = "rzerp_purchase_orders";
const PO_COUNTER_KEY = "rzerp_po_counter";

// Helper functions for localStorage
const loadPurchaseOrdersFromStorage = (): PurchaseOrder[] => {
  try {
    const stored = localStorage.getItem(PURCHASE_ORDERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default purchase orders if no data exists
    savePurchaseOrdersToStorage(defaultPurchaseOrders);
    // Initialize counter
    if (!localStorage.getItem(PO_COUNTER_KEY)) {
      localStorage.setItem(PO_COUNTER_KEY, "3");
    }
    return defaultPurchaseOrders;
  } catch (error) {
    console.error("Error loading purchase orders from localStorage:", error);
    return defaultPurchaseOrders;
  }
};

const savePurchaseOrdersToStorage = (orders: PurchaseOrder[]) => {
  try {
    localStorage.setItem(PURCHASE_ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error("Error saving purchase orders to localStorage:", error);
  }
};

const getNextPOId = (): string => {
  try {
    const counter = parseInt(localStorage.getItem(PO_COUNTER_KEY) || "3", 10);
    const nextCounter = counter + 1;
    localStorage.setItem(PO_COUNTER_KEY, nextCounter.toString());
    return nextCounter.toString();
  } catch (error) {
    console.error("Error getting next PO ID:", error);
    return Date.now().toString();
  }
};

// Transform PurchaseOrderFormData to PurchaseOrder
const transformFormDataToPurchaseOrder = (
  formData: PurchaseOrderFormData
): PurchaseOrder => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const totalAmount = formData.items.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  // Transform items to match PurchaseOrderItem format
  const items: PurchaseOrderItem[] = formData.items.map((item) => ({
    name: item.productName.trim(),
    quantity: parseInt(item.quantity) || 0,
    unitPrice: parseFloat(item.unitPrice) || 0,
    subtotal: item.subtotal,
  }));

  return {
    id: getNextPOId(),
    poNumber: formData.poNumber.trim(),
    status: "pending", // New POs start as pending
    vendor: formData.vendor,
    requestedBy: formData.requestedBy.trim(),
    orderDate: formData.orderDate,
    expectedDelivery: formData.expectedDelivery,
    totalAmount: formatCurrency(totalAmount),
    items,
    notes: formData.notes.trim() || undefined,
  };
};

const purchaseOrderCardConfig: PurchaseOrderCardConfig[] = [
  {
    title: "Total POs",
    dataKey: "totalPOs",
    countColor: "black",
    bgColor: "bg-white",
    icon: ShoppingCart,
    iconBgColor: "blue",
    subtitle: "this month",
  },
  {
    title: "Pending Approval",
    dataKey: "pendingApproval",
    countColor: "orange",
    bgColor: "bg-white",
    icon: Calendar,
    iconBgColor: "orange",
    subtitle: "awaiting approval",
  },
  {
    title: "Total Value",
    dataKey: "totalValue",
    countColor: "black",
    bgColor: "bg-white",
    icon: Package,
    iconBgColor: "green",
    subtitle: "this month",
  },
  {
    title: "Received",
    dataKey: "received",
    countColor: "green",
    bgColor: "bg-white",
    icon: CheckCircle2,
    iconBgColor: "green",
    subtitle: "completed orders",
  },
];

interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: "approved" | "ordered" | "pending";
  vendor: string;
  requestedBy: string;
  orderDate: string;
  expectedDelivery: string;
  totalAmount: string;
  items: PurchaseOrderItem[];
  notes?: string;
}

export function PurchaseOrderTab() {
  // Load purchase orders from localStorage on mount
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() =>
    loadPurchaseOrdersFromStorage()
  );

  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);

  // Calculate purchase order counts dynamically
  const purchaseOrderCounts = useMemo(() => {
    const formatCurrency = (amount: number): string => {
      return `₱${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    const parseCurrency = (value: string) => {
      return parseFloat(value.replace(/[₱,]/g, "")) || 0;
    };

    const pendingApproval = purchaseOrders.filter(
      (po) => po.status === "pending"
    ).length;

    const received = purchaseOrders.filter(
      (po) => po.status === "ordered"
    ).length;

    // Get current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const totalPOsThisMonth = purchaseOrders.filter((po) => {
      const orderDate = new Date(po.orderDate);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    }).length;

    const totalValueThisMonth = purchaseOrders
      .filter((po) => {
        const orderDate = new Date(po.orderDate);
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, po) => sum + parseCurrency(po.totalAmount), 0);

    return {
      totalPOs: totalPOsThisMonth.toString(),
      pendingApproval: pendingApproval.toString(),
      totalValue: formatCurrency(totalValueThisMonth),
      received: received.toString(),
    };
  }, [purchaseOrders]);

  // Handle purchase order submission
  const handlePOSubmit = (data: PurchaseOrderFormData) => {
    try {
      // Transform form data to purchase order format
      const newPO = transformFormDataToPurchaseOrder(data);

      // Add new purchase order to the beginning of the list
      const updatedPOs = [newPO, ...purchaseOrders];

      // Save to localStorage
      savePurchaseOrdersToStorage(updatedPOs);

      // Update state to trigger re-render
      setPurchaseOrders(updatedPOs);

      // Show success toast
      toast.success("Purchase Order Created Successfully", {
        description: `PO ${newPO.poNumber} has been created and is pending approval.`,
        duration: 3000,
      });

      console.log("Purchase order created successfully:", newPO);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      // Show error toast
      toast.error("Failed to Create Purchase Order", {
        description:
          "An error occurred while creating the purchase order. Please try again.",
        duration: 4000,
      });
    }
  };

  const handleSendToVendor = (poId: string) => {
    try {
      const updatedPOs = purchaseOrders.map((po) =>
        po.id === poId ? { ...po, status: "ordered" as const } : po
      );
      savePurchaseOrdersToStorage(updatedPOs);
      setPurchaseOrders(updatedPOs);

      const po = purchaseOrders.find((p) => p.id === poId);
      toast.success("PO Sent to Vendor", {
        description: `PO ${po?.poNumber} has been sent to vendor.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error sending PO to vendor:", error);
      toast.error("Failed to Send PO to Vendor", {
        description: "An error occurred while sending the PO.",
        duration: 4000,
      });
    }
  };

  const handleMarkAsReceived = (poId: string) => {
    try {
      const updatedPOs = purchaseOrders.map((po) =>
        po.id === poId ? { ...po, status: "approved" as const } : po
      );
      savePurchaseOrdersToStorage(updatedPOs);
      setPurchaseOrders(updatedPOs);

      const po = purchaseOrders.find((p) => p.id === poId);
      toast.success("PO Marked as Received", {
        description: `PO ${po?.poNumber} has been marked as received.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error marking PO as received:", error);
      toast.error("Failed to Mark PO as Received", {
        description: "An error occurred while updating the PO.",
        duration: 4000,
      });
    }
  };

  const handleApprove = (poId: string) => {
    try {
      const updatedPOs = purchaseOrders.map((po) =>
        po.id === poId ? { ...po, status: "approved" as const } : po
      );
      savePurchaseOrdersToStorage(updatedPOs);
      setPurchaseOrders(updatedPOs);

      const po = purchaseOrders.find((p) => p.id === poId);
      toast.success("PO Approved", {
        description: `PO ${po?.poNumber} has been approved.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error approving PO:", error);
      toast.error("Failed to Approve PO", {
        description: "An error occurred while approving the PO.",
        duration: 4000,
      });
    }
  };

  const handleReject = (poId: string) => {
    try {
      // For now, we'll just remove rejected POs
      // In a real app, you might want to keep them with a "rejected" status
      const updatedPOs = purchaseOrders.filter((po) => po.id !== poId);
      savePurchaseOrdersToStorage(updatedPOs);
      setPurchaseOrders(updatedPOs);

      const po = purchaseOrders.find((p) => p.id === poId);
      toast.success("PO Rejected", {
        description: `PO ${po?.poNumber} has been rejected and removed.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error rejecting PO:", error);
      toast.error("Failed to Reject PO", {
        description: "An error occurred while rejecting the PO.",
        duration: 4000,
      });
    }
  };

  const handleViewDetails = (poId: string) => {
    console.log("View details:", poId);
  };

  const handlePrint = (poId: string) => {
    console.log("Print:", poId);
  };

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {purchaseOrderCardConfig.map((config) => (
          <SimpleCard
            key={config.dataKey}
            title={config.title}
            count={purchaseOrderCounts[config.dataKey]}
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
          createPO={true}
          createPOOrder={1}
          onCreatePOClick={() => setIsCreatePOOpen(true)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
        {purchaseOrders.map((po) => (
          <PurchaseOrderCard
            key={po.id}
            poNumber={po.poNumber}
            status={po.status}
            vendor={po.vendor}
            requestedBy={po.requestedBy}
            orderDate={po.orderDate}
            expectedDelivery={po.expectedDelivery}
            totalAmount={po.totalAmount}
            items={po.items}
            notes={po.notes}
            onSendToVendor={
              po.status === "approved"
                ? () => handleSendToVendor(po.id)
                : undefined
            }
            onMarkAsReceived={
              po.status === "ordered"
                ? () => handleMarkAsReceived(po.id)
                : undefined
            }
            onApprove={
              po.status === "pending" ? () => handleApprove(po.id) : undefined
            }
            onReject={
              po.status === "pending" ? () => handleReject(po.id) : undefined
            }
            onViewDetails={() => handleViewDetails(po.id)}
            onPrint={() => handlePrint(po.id)}
          />
        ))}
      </div>

      {/* Create PO Dialog */}
      <CreatePODialog
        open={isCreatePOOpen}
        onOpenChange={setIsCreatePOOpen}
        title="Create Purchase Order"
        onSubmit={handlePOSubmit}
      />
    </div>
  );
}
