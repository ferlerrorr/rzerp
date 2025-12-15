import { AppTabs } from "@/components/common/app-Tabs";
import { PurchaseOrderTab } from "./purchaseOrderTab";
import { VendorsTab } from "./vendorsTab";

export function VendorsPage() {
  const tabs = [
    {
      value: "vendors",
      label: "Vendors",
      content: <VendorsTab />,
    },
    {
      value: "purchase-order",
      label: "Purchase Order",
      content: <PurchaseOrderTab />,
    },
  ];

  return (
    <div className="mt-2 sm:mt-4 px-2 sm:px-0">
      <AppTabs
        className="mt-4"
        tabs={tabs}
        defaultValue="vendors"
        tabsListClassName="sm:grid-cols-2"
      />
    </div>
  );
}
