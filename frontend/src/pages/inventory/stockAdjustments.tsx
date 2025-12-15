import { AppButtons } from "@/components/common/app-Buttons";
import { AppSearch } from "@/components/common/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import { Clock, CheckCircle2, FileEdit, Eye, Edit, Trash2 } from "lucide-react";

interface StockAdjustmentCounts {
  pendingApproval: string;
  approved: string;
  totalAdjustments: string;
}

interface StockAdjustmentCardConfig {
  title: string;
  dataKey: keyof StockAdjustmentCounts;
  countColor:
    | "default"
    | "green"
    | "blue"
    | "black"
    | "orange"
    | "red"
    | "purple";
  bgColor: string;
  icon: typeof Clock | typeof CheckCircle2 | typeof FileEdit;
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

const stockAdjustmentCounts: StockAdjustmentCounts = {
  pendingApproval: "1",
  approved: "2",
  totalAdjustments: "3",
};

const stockAdjustmentCardConfig: StockAdjustmentCardConfig[] = [
  {
    title: "Pending Approval",
    dataKey: "pendingApproval",
    countColor: "orange",
    bgColor: "bg-white",
    icon: Clock,
    iconBgColor: "orange",
  },
  {
    title: "Approved",
    dataKey: "approved",
    countColor: "green",
    bgColor: "bg-white",
    icon: CheckCircle2,
    iconBgColor: "green",
  },
  {
    title: "Total Adjustments",
    dataKey: "totalAdjustments",
    countColor: "black",
    bgColor: "bg-white",
    icon: FileEdit,
    iconBgColor: "indigo",
  },
];

interface StockAdjustment {
  id: string;
  date: string;
  product: string;
  oldQty: number;
  newQty: number;
  difference: number;
  reason: string;
  status: "Pending Approval" | "Approved" | "Rejected";
}

const stockAdjustments: StockAdjustment[] = [
  {
    id: "1",
    date: "2024-12-15",
    product: "Laptop Pro 15",
    oldQty: 10,
    newQty: 12,
    difference: 2,
    reason: "Found additional stock",
    status: "Pending Approval",
  },
  {
    id: "2",
    date: "2024-12-14",
    product: "Wireless Mouse",
    oldQty: 50,
    newQty: 48,
    difference: -2,
    reason: "Damaged items found",
    status: "Approved",
  },
  {
    id: "3",
    date: "2024-12-13",
    product: "Keyboard Mechanical",
    oldQty: 20,
    newQty: 18,
    difference: -2,
    reason: "Physical count discrepancy",
    status: "Approved",
  },
  {
    id: "4",
    date: "2024-12-12",
    product: "Monitor 27inch",
    oldQty: 15,
    newQty: 15,
    difference: 0,
    reason: "Verification count",
    status: "Rejected",
  },
  {
    id: "5",
    date: "2024-12-11",
    product: "USB-C Cable",
    oldQty: 100,
    newQty: 105,
    difference: 5,
    reason: "Unrecorded returns",
    status: "Approved",
  },
];

const stockAdjustmentColumns: ColumnDef<StockAdjustment>[] = [
  {
    header: "Date",
    accessor: "date",
  },
  {
    header: "Product",
    accessor: "product",
    className: "font-medium",
  },
  {
    header: "Old Qty",
    accessor: "oldQty",
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    header: "New Qty",
    accessor: "newQty",
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    header: "Difference",
    accessor: "difference",
    cell: (row) => {
      const diff = row.difference;
      const isPositive = diff > 0;
      return (
        <span
          className={
            isPositive
              ? "text-green-600 font-semibold"
              : diff < 0
              ? "text-red-600 font-semibold"
              : "text-gray-600 font-semibold"
          }
        >
          {isPositive ? "+" : ""}
          {diff}
        </span>
      );
    },
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    header: "Reason",
    accessor: "reason",
  },
  {
    header: "Status",
    accessor: "status",
    useBadge: true,
    badgeVariantMap: {
      "Pending Approval": "warning",
      Approved: "success",
      Rejected: "error",
    },
    className: "text-center",
    headerClassName: "text-center",
  },
];

const stockAdjustmentActions: ActionItem<StockAdjustment>[] = [
  {
    label: "View",
    icon: Eye,
    onClick: (adjustment) => {
      console.log("View adjustment:", adjustment);
    },
  },
  {
    label: "Edit",
    icon: Edit,
    onClick: (adjustment) => {
      console.log("Edit adjustment:", adjustment);
    },
  },
  {
    label: "Delete",
    icon: Trash2,
    onClick: (adjustment) => {
      console.log("Delete adjustment:", adjustment);
    },
    variant: "destructive",
  },
];

export function StockAdjustmentsTab() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stockAdjustmentCardConfig.map((config) => (
          <SimpleCard
            key={config.dataKey}
            title={config.title}
            count={stockAdjustmentCounts[config.dataKey]}
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
        <AppButtons filter={true} add={false} />
      </div>
      <div className="w-full">
        <AppTable
          data={stockAdjustments}
          columns={stockAdjustmentColumns}
          actions={stockAdjustmentActions}
          itemsPerPage={5}
          minWidth="1400px"
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
