import { AppButtons } from "@/components/app-Buttons";
import { AppSearch } from "@/components/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import {
  PurchaseOrderCard,
  PurchaseOrderItem,
} from "@/components/card/purchaseOrderCard";
import { ShoppingCart, Calendar, Package, CheckCircle2 } from "lucide-react";

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

const purchaseOrderCounts: PurchaseOrderCounts = {
  totalPOs: "3",
  pendingApproval: "1",
  totalValue: "₱48,750",
  received: "0",
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

const purchaseOrders: PurchaseOrder[] = [
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

export function PurchaseOrderPage() {
  const handleSendToVendor = (poId: string) => {
    console.log("Send to vendor:", poId);
  };

  const handleMarkAsReceived = (poId: string) => {
    console.log("Mark as received:", poId);
  };

  const handleApprove = (poId: string) => {
    console.log("Approve:", poId);
  };

  const handleReject = (poId: string) => {
    console.log("Reject:", poId);
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
    </div>
  );
}
