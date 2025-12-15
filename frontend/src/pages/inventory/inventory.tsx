import { AppTabs } from "@/components/common/app-Tabs";
import { ProductTab } from "./product";
import { StockMovementsTab } from "./stockMovements";
import { StockAdjustmentsTab } from "./stockAdjustments";
import { LowStockAlertsTab } from "./lowStockAlerts";
import { WarehouseTab } from "./warehouse";
import { ReportsTab } from "./reports";

export function InventoryPage() {
  const tabs = [
    {
      value: "product",
      label: "Product",
      content: <ProductTab />,
    },
    {
      value: "stock-movements",
      label: "Stock Movements",
      content: <StockMovementsTab />,
    },
    {
      value: "stock-adjustments",
      label: "Stock Adjustments",
      content: <StockAdjustmentsTab />,
    },
    {
      value: "low-stock-alerts",
      label: "Low Stock Alerts",
      content: <LowStockAlertsTab />,
    },
    {
      value: "warehouse",
      label: "Warehouse",
      content: <WarehouseTab />,
    },
    {
      value: "reports",
      label: "Reports",
      content: <ReportsTab />,
    },
  ];

  return (
    <div className="mt-2 sm:mt-4 px-2 sm:px-0">
      <AppTabs
        className="mt-4"
        tabs={tabs}
        defaultValue="product"
        tabsListClassName="sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
      />
    </div>
  );
}
