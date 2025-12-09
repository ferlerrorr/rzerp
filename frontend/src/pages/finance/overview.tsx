import { SimpleCard } from "@/components/card/simpleCard";
import { IncomeStatement } from "@/components/card/incomeStatement";
import { BalanceSheet } from "@/components/card/balanceSheet";
import { DollarSign, TrendingUp } from "lucide-react";

interface OverviewData {
  total_assets: string;
  total_liabilities: string;
  total_revenue: string;
  net_income: string;
}

interface OverviewCardConfig {
  title: string;
  dataKey: keyof OverviewData;
  subtitle: string;
  countColor: "default" | "green" | "blue" | "black" | "orange" | "red";
  icon: typeof DollarSign | typeof TrendingUp;
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
}

// Sample data - This would typically come from an API/database
const overviewData: OverviewData = {
  total_assets: "₱2,180,000",
  total_liabilities: "₱750,000",
  total_revenue: "₱2,800,000",
  net_income: "₱1,157,150",
};

// Card configuration - maps to dummy data
const overviewCardConfig: OverviewCardConfig[] = [
  {
    title: "Total Assets",
    dataKey: "total_assets",
    subtitle: "Current assets",
    countColor: "black",
    icon: TrendingUp,
    iconBgColor: "blue",
  },
  {
    title: "Total Liabilities",
    dataKey: "total_liabilities",
    subtitle: "Current liabilities",
    countColor: "black",
    icon: TrendingUp,
    iconBgColor: "orange",
  },
  {
    title: "Total Revenue",
    dataKey: "total_revenue",
    subtitle: "+12.5% from last month",
    countColor: "black",
    icon: DollarSign,
    iconBgColor: "green",
  },
  {
    title: "Net Income",
    dataKey: "net_income",
    subtitle: "+18.3% from last month",
    countColor: "black",
    icon: DollarSign,
    iconBgColor: "purple",
  },
];

// Income Statement Data
const incomeStatementItems = [
  {
    label: "Revenue",
    amount: "₱2,800,000",
    isNegative: false,
    isNetIncome: false,
    isSubtotal: false,
  },
  {
    label: "Cost of Goods Sold",
    amount: "₱980,000",
    isNegative: true,
    isNetIncome: false,
    isSubtotal: false,
  },
  {
    label: "Gross Profit",
    amount: "₱1,820,000",
    isNegative: false,
    isNetIncome: false,
    isSubtotal: true,
  },
  {
    label: "Operating Expenses",
    amount: "₱662,850",
    isNegative: true,
    isNetIncome: false,
    isSubtotal: false,
  },
  {
    label: "Net Income",
    amount: "₱1,157,150",
    isNegative: false,
    isNetIncome: true,
    isSubtotal: true,
  },
];

// Balance Sheet Data
const balanceSheetSections = [
  {
    title: "Assets",
    items: [
      {
        label: "Current Assets",
        amount: "₱2,180,000",
        isTotal: false,
      },
    ],
  },
  {
    title: "Liabilities",
    items: [
      {
        label: "Current Liabilities",
        amount: "₱750,000",
        isTotal: false,
      },
    ],
  },
  {
    title: "Equity",
    items: [
      {
        label: "Capital",
        amount: "₱1,000,000",
        isTotal: false,
      },
      {
        label: "Retained Earnings",
        amount: "₱430,000",
        isTotal: false,
      },
    ],
  },
];

export function OverviewTab() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {overviewCardConfig.map((card) => (
          <SimpleCard
            key={card.dataKey}
            title={card.title}
            count={overviewData[card.dataKey]}
            subtitle={card.subtitle}
            countColor={card.countColor}
            icon={card.icon}
            iconBgColor={card.iconBgColor}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
        <IncomeStatement items={incomeStatementItems} />
        <BalanceSheet sections={balanceSheetSections} />
      </div>
    </div>
  );
}
