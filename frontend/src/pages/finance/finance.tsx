import { AppTabs } from "@/components/app-Tabs";
import { OverviewTab } from "./overview";
import { GeneralLedgerTab } from "./generalLedger";
import { JournalEntriesTab } from "./journalEntries";
import { FinancialReportsTab } from "./financialReports";
import { BudgetTab } from "./budget";
import { TasBirTab } from "./tasBir";

export function FinancePage() {
  const tabs = [
    {
      value: "overview",
      label: "Overview",
      content: <OverviewTab />,
    },
    {
      value: "general-ledger",
      label: "General Ledger",
      content: <GeneralLedgerTab />,
    },
    {
      value: "journal-entries",
      label: "Journal Entries",
      content: <JournalEntriesTab />,
    },
    {
      value: "financial-reports",
      label: "Financial Reports",
      content: <FinancialReportsTab />,
    },
    {
      value: "budget",
      label: "Budget",
      content: <BudgetTab />,
    },
    {
      value: "tas-bir",
      label: "TAS & BIR",
      content: <TasBirTab />,
    },
  ];

  return (
    <div className="mt-2 sm:mt-4 px-2 sm:px-0">
      <AppTabs
        className="mt-4"
        tabs={tabs}
        defaultValue="overview"
        tabsListClassName="sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
      />
    </div>
  );
}
