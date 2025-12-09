import { ReportCard } from "@/components/card/reportCard";

interface InventoryReport {
  id: string;
  title: string;
  description: string;
}

const inventoryReports: InventoryReport[] = [
  {
    id: "1",
    title: "Stock Level Report",
    description:
      "Comprehensive report showing current stock levels for all products across warehouses",
  },
  {
    id: "2",
    title: "Stock Movement Report",
    description:
      "Track all stock movements including stock in, stock out, and transfers between warehouses",
  },
  {
    id: "3",
    title: "Low Stock Alert Report",
    description:
      "List of all products that are below reorder level and require immediate attention",
  },
  {
    id: "4",
    title: "Inventory Valuation Report",
    description:
      "Calculate total inventory value based on cost and current stock levels",
  },
  {
    id: "5",
    title: "Stock Adjustment Report",
    description:
      "Detailed record of all stock adjustments with reasons and approval status",
  },
  {
    id: "6",
    title: "Warehouse Utilization Report",
    description:
      "Overview of warehouse capacity, current utilization, and available space",
  },
];

export function ReportsTab() {
  const handleGenerateReport = (reportId: string) => {
    console.log("Generate inventory report:", reportId);
    // Handle report generation
  };

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-base font-semibold text-gray-900">
          Inventory Reports
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
        {inventoryReports.map((report) => (
          <ReportCard
            key={report.id}
            title={report.title}
            description={report.description}
            onGenerate={() => handleGenerateReport(report.id)}
          />
        ))}
      </div>
    </div>
  );
}
