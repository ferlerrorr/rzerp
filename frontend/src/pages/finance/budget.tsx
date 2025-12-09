import { AppButtons } from "@/components/app-Buttons";
import { SimpleCard } from "@/components/card/simpleCard";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetCounts {
  totalBudget: string;
  actualSpending: string;
  remaining: string;
}

interface BudgetCardConfig {
  title: string;
  dataKey: keyof BudgetCounts;
  countColor:
    | "default"
    | "green"
    | "blue"
    | "black"
    | "orange"
    | "red"
    | "purple";
  bgColor: string;
  icon: typeof Wallet | typeof TrendingDown | typeof TrendingUp;
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
  subtitle: string;
}

const budgetCounts: BudgetCounts = {
  totalBudget: "₱3,500,000",
  actualSpending: "₱1,642,850",
  remaining: "₱1,857,150",
};

const budgetCardConfig: BudgetCardConfig[] = [
  {
    title: "Total Budget",
    dataKey: "totalBudget",
    countColor: "black",
    bgColor: "bg-white",
    icon: Wallet,
    iconBgColor: "gray",
    subtitle: "Annual budget",
  },
  {
    title: "Actual Spending",
    dataKey: "actualSpending",
    countColor: "orange",
    bgColor: "bg-white",
    icon: TrendingDown,
    iconBgColor: "orange",
    subtitle: "47% of budget",
  },
  {
    title: "Remaining",
    dataKey: "remaining",
    countColor: "green",
    bgColor: "bg-white",
    icon: TrendingUp,
    iconBgColor: "green",
    subtitle: "53% remaining",
  },
];

interface BudgetCategory {
  title: string;
  actualSpending: number;
  budgetedAmount: number;
  usedColor: "green" | "orange" | "red";
}

const budgetCategories: BudgetCategory[] = [
  {
    title: "Salaries & Wages",
    actualSpending: 524350,
    budgetedAmount: 1500000,
    usedColor: "green",
  },
  {
    title: "Operating Expenses",
    actualSpending: 138500,
    budgetedAmount: 800000,
    usedColor: "green",
  },
  {
    title: "Marketing",
    actualSpending: 280000,
    budgetedAmount: 500000,
    usedColor: "green",
  },
  {
    title: "IT & Technology",
    actualSpending: 350000,
    budgetedAmount: 400000,
    usedColor: "orange",
  },
  {
    title: "Rent & Utilities",
    actualSpending: 350000,
    budgetedAmount: 300000,
    usedColor: "red",
  },
];

function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString("en-US")}`;
}

function BudgetCategoryItem({
  title,
  actualSpending,
  budgetedAmount,
  usedColor,
}: BudgetCategory) {
  const percentage = Math.round((actualSpending / budgetedAmount) * 100);
  const remaining = Math.max(0, budgetedAmount - actualSpending);
  const total = budgetedAmount;
  const usedPercentage = total > 0 ? (actualSpending / total) * 100 : 0;
  const balancePercentage = total > 0 ? (remaining / total) * 100 : 0;

  const percentageColorClass =
    usedColor === "green"
      ? "text-green-600"
      : usedColor === "orange"
      ? "text-orange-600"
      : "text-red-600";

  const usedColors = {
    green: "bg-green-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <span className={cn("text-sm font-semibold", percentageColorClass)}>
          {percentage}%
        </span>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Actual Spending: {formatCurrency(actualSpending)}</span>
        <span>Budgeted Amount: {formatCurrency(budgetedAmount)}</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden flex bg-gray-200">
        {usedPercentage > 0 && (
          <div
            className={cn(
              usedColors[usedColor],
              "h-full transition-all duration-300"
            )}
            style={{ width: `${Math.min(usedPercentage, 100)}%` }}
          />
        )}
        {balancePercentage > 0 && (
          <div
            className="bg-gray-200 h-full transition-all duration-300"
            style={{ width: `${balancePercentage}%` }}
          />
        )}
      </div>
    </div>
  );
}

export function BudgetTab() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-base font-semibold text-gray-900">
          Budget Management
        </h1>
        <AppButtons
          filter={false}
          add={false}
          filterOrder={1}
          addOrder={2}
          createBudget={true}
          createBudgetOrder={3}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetCardConfig.map((config) => (
          <SimpleCard
            key={config.dataKey}
            title={config.title}
            count={budgetCounts[config.dataKey]}
            subtitle={config.subtitle}
            countColor={config.countColor}
            icon={config.icon}
            iconBgColor={config.iconBgColor}
            className={config.bgColor}
          />
        ))}
      </div>
      <div className="mt-4">
        <Card className="bg-white">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-6">
              Budget vs Actual by Category
            </h2>
            <div className="space-y-6">
              {budgetCategories.map((category) => (
                <BudgetCategoryItem key={category.title} {...category} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
