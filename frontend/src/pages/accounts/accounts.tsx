import { AppTabs } from "@/components/common/app-Tabs";
import { AccountPayableTab } from "./accountPayableTab";
import { AccountReceivableTab } from "./accountReceivableTab";

export function AccountsPage() {
  const tabs = [
    {
      value: "account-payable",
      label: "Account Payable",
      content: <AccountPayableTab />,
    },
    {
      value: "account-receivable",
      label: "Account Receivable",
      content: <AccountReceivableTab />,
    },
  ];

  return (
    <div className="mt-2 sm:mt-4 px-2 sm:px-0">
      <AppTabs
        className="mt-4"
        tabs={tabs}
        defaultValue="account-payable"
        tabsListClassName="sm:grid-cols-2"
      />
    </div>
  );
}
