import { ReportCard } from "@/components/card/reportCard";

interface FinancialReport {
  id: string;
  title: string;
  description: string;
}

const financialReports: FinancialReport[] = [
  {
    id: "1",
    title: "Income Statement (P&L)",
    description:
      "Detailed profit and loss statement with revenue, expenses, and net income",
  },
  {
    id: "2",
    title: "Balance Sheet",
    description:
      "Complete overview of assets, liabilities, and equity at a specific point in time",
  },
  {
    id: "3",
    title: "Cash Flow Statement",
    description:
      "Track cash inflows and outflows from operating, investing, and financing activities",
  },
  {
    id: "4",
    title: "General Ledger",
    description:
      "Comprehensive record of all financial transactions organized by account",
  },
  {
    id: "5",
    title: "Trial Balance",
    description:
      "Summary of all account balances to verify accounting equation accuracy",
  },
  {
    id: "6",
    title: "Journal Entries",
    description:
      "Chronological record of all accounting transactions with debits and credits",
  },
];

export function FinancialReportsTab() {
  const handleGenerateReport = (reportId: string) => {
    console.log("Generate report:", reportId);
    // Handle report generation
  };

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-base font-semibold text-gray-900">
          Financial Reports
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
        {financialReports.map((report) => (
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
