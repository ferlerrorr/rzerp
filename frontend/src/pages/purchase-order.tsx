import { AppButtons } from "@/components/common/app-Buttons";
import { AppSearch } from "@/components/common/app-Serach";
import {
  PurchaseOrderCard,
  PurchaseOrderItem,
} from "@/components/card/purchaseOrderCard";
import { SimpleCard } from "@/components/card/simpleCard";
import { CreatePODialog } from "@/components/dialogs/create-po-dialog";
import {
  usePurchaseOrderStore,
  PurchaseOrderFromAPI,
} from "@/stores/purchaseOrder";
import { useVendorStore } from "@/stores/vendor";
import { Calendar, CheckCircle2, Package, ShoppingCart } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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

// Purchase Order Data for display
interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: "approved" | "ordered" | "pending" | "received";
  vendor: string;
  requestedBy: string;
  orderDate: string;
  expectedDelivery: string;
  totalAmount: string;
  items: PurchaseOrderItem[];
  notes?: string;
}

// Transform API purchase order to display format
const transformApiPOToPO = (
  apiPO: PurchaseOrderFromAPI
): PurchaseOrder => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const totalAmount = parseFloat(apiPO.total_amount) || 0;

  // Transform items to match PurchaseOrderItem format
  const items: PurchaseOrderItem[] = apiPO.items.map((item) => ({
    name: item.product_name,
    quantity: item.quantity,
    unitPrice: parseFloat(item.unit_price) || 0,
    subtotal: parseFloat(item.subtotal) || 0,
  }));

  return {
    id: apiPO.id.toString(),
    poNumber: apiPO.po_number,
    status: apiPO.status,
    vendor: apiPO.vendor_name,
    requestedBy: apiPO.requested_by,
    orderDate: apiPO.order_date,
    expectedDelivery: apiPO.expected_delivery,
    totalAmount: formatCurrency(totalAmount),
    items,
    notes: apiPO.notes || undefined,
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

const PurchaseOrderCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-border p-4">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

export function PurchaseOrderTab() {
  const {
    purchaseOrders: apiPurchaseOrders,
    loading,
    error,
    fetchPurchaseOrders,
    updateStatus,
    deletePurchaseOrder,
  } = usePurchaseOrderStore();

  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
  
  // Fetch vendors for the dialog
  const { fetchVendors } = useVendorStore();
  
  useEffect(() => {
    // Set high per_page to get all vendors
    const { setFilters } = useVendorStore.getState();
    setFilters({ per_page: 1000 });
    fetchVendors();
  }, [fetchVendors]);

  // Fetch purchase orders on mount
  useEffect(() => {
    // Set high per_page to get all purchase orders
    const { setFilters } = usePurchaseOrderStore.getState();
    setFilters({ per_page: 1000 });
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  // Transform API purchase orders to display format
  const purchaseOrders = useMemo(() => {
    return apiPurchaseOrders.map(transformApiPOToPO);
  }, [apiPurchaseOrders]);

  // Calculate purchase order counts dynamically
  const purchaseOrderCounts = useMemo(() => {
    // If no purchase orders, return "0" for all counts
    if (purchaseOrders.length === 0) {
      return {
        totalPOs: "0",
        pendingApproval: "0",
        totalValue: "0",
        received: "0",
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

    const pendingApproval = purchaseOrders.filter(
      (po) => po.status === "pending"
    ).length;

    const received = purchaseOrders.filter(
      (po) => po.status === "received"
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
  const handlePOSubmit = async () => {
    // The dialog already handles the API call via the store
    // Just refresh the purchase orders list
    await fetchPurchaseOrders();
  };

  const handleSendToVendor = async (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      const apiPO = apiPurchaseOrders.find((p) => p.id.toString() === poId);
      if (apiPO) {
        const success = await updateStatus(apiPO.id, "ordered");
        if (success) {
          toast.success("PO Sent to Vendor", {
            description: `PO ${po.poNumber} has been sent to vendor.`,
            duration: 3000,
          });
        }
      }
    }
  };

  const handleMarkAsReceived = async (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      const apiPO = apiPurchaseOrders.find((p) => p.id.toString() === poId);
      if (apiPO) {
        const success = await updateStatus(apiPO.id, "received");
        if (success) {
          toast.success("PO Marked as Received", {
            description: `PO ${po.poNumber} has been marked as received.`,
            duration: 3000,
          });
        }
      }
    }
  };

  const handleApprove = async (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      const apiPO = apiPurchaseOrders.find((p) => p.id.toString() === poId);
      if (apiPO) {
        const success = await updateStatus(apiPO.id, "approved");
        if (success) {
          toast.success("PO Approved", {
            description: `PO ${po.poNumber} has been approved.`,
            duration: 3000,
          });
        }
      }
    }
  };

  const handleReject = async (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      const apiPO = apiPurchaseOrders.find((p) => p.id.toString() === poId);
      if (apiPO) {
        const success = await deletePurchaseOrder(apiPO.id);
        if (success) {
          toast.success("PO Rejected", {
            description: `PO ${po.poNumber} has been rejected and removed.`,
            duration: 3000,
          });
        }
      }
    }
  };

  const handleViewDetails = (poId: string) => {
    console.log("View details:", poId);
  };

  const handlePrint = (poId: string) => {
    console.log("Print:", poId);
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error("Failed to Load Purchase Orders", {
        description: error,
        duration: 4000,
      });
    }
  }, [error]);

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      {loading && purchaseOrders.length === 0 ? (
        <>
          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          
          {/* Skeleton Purchase Order Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
            {[...Array(6)].map((_, i) => (
              <PurchaseOrderCardSkeleton key={i} />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Always show cards */}
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

          {/* Always show purchase order cards */}
          {purchaseOrders.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500">No purchase orders found</p>
            </div>
          ) : (
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
          )}
        </>
      )}

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
