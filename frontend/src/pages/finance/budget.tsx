import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { AppButtons } from "@/components/common/app-Buttons";
import { SimpleCard } from "@/components/card/simpleCard";
import { Card, CardContent } from "@/components/ui/card";
import { CreateBudgetDialog } from "@/components/dialogs/create-budget-dialog";
import {
  useBudgetStore,
  BudgetFromAPI,
} from "@/stores/budget";
import { Skeleton } from "@/components/ui/skeleton";
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

// Budget Category interface for display
interface BudgetCategory {
  id: string;
  title: string;
  actualSpending: number;
  budgetedAmount: number;
  usedColor: "green" | "orange" | "red";
  period: string;
  description?: string;
}

// Transform API budget to display format
const transformApiBudgetToBudgetCategory = (
  apiBudget: BudgetFromAPI
): BudgetCategory => {
  const budgetedAmount = parseFloat(apiBudget.budgeted_amount) || 0;
  const actualSpending = parseFloat(apiBudget.actual_spending) || 0;
  
  // Determine color based on percentage
  const percentage = budgetedAmount > 0 
    ? (actualSpending / budgetedAmount) * 100 
    : 0;
  
  let usedColor: "green" | "orange" | "red" = "green";
  if (percentage >= 100) {
    usedColor = "red";
  } else if (percentage >= 80) {
    usedColor = "orange";
  }

  return {
    id: apiBudget.id.toString(),
    title: apiBudget.category,
    actualSpending,
    budgetedAmount,
    usedColor,
    period: apiBudget.period,
    description: apiBudget.description || undefined,
  };
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

// Skeleton Components
const CardSkeleton = () => (
  <div className="w-auto p-4 rounded-2xl border border-[#EFEFEF] bg-white flex flex-col gap-2">
    <div className="flex flex-row items-center justify-between">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-11 w-11 rounded-full" />
    </div>
    <Skeleton className="h-8 w-20" />
  </div>
);

function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString("en-US")}`;
}

function BudgetCategoryItem({
  title,
  actualSpending,
  budgetedAmount,
  usedColor,
}: {
  title: string;
  actualSpending: number;
  budgetedAmount: number;
  usedColor: "green" | "orange" | "red";
}) {
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
    <div className="">
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
  const {
    budgets: apiBudgets,
    loading,
    error,
    fetchBudgets,
  } = useBudgetStore();

  const [isCreateBudgetOpen, setIsCreateBudgetOpen] = useState(false);

  // Fetch budgets on mount
  useEffect(() => {
    // Set high per_page to get all budgets
    const { setFilters } = useBudgetStore.getState();
    setFilters({ per_page: 1000 });
    fetchBudgets();
  }, [fetchBudgets]);

  // Transform API budgets to display format
  const budgetCategories = useMemo(() => {
    return apiBudgets.map(transformApiBudgetToBudgetCategory);
  }, [apiBudgets]);

  // Calculate budget counts dynamically
  const budgetCounts = useMemo(() => {
    const totalBudget = budgetCategories.reduce(
      (sum, cat) => sum + cat.budgetedAmount,
      0
    );
    const actualSpending = budgetCategories.reduce(
      (sum, cat) => sum + cat.actualSpending,
      0
    );
    const remaining = Math.max(0, totalBudget - actualSpending);

    // If no budgets, return "0" instead of formatted currency
    if (budgetCategories.length === 0) {
      return {
        totalBudget: "0",
        actualSpending: "0",
        remaining: "0",
      };
    }

    const formatCurrency = (amount: number): string => {
      return `₱${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    return {
      totalBudget: formatCurrency(totalBudget),
      actualSpending: formatCurrency(actualSpending),
      remaining: formatCurrency(remaining),
    };
  }, [budgetCategories]);

  // Calculate subtitle percentages
  const budgetCardConfigWithSubtitle = useMemo(() => {
    // If no budgets, return subtitles with "0"
    if (budgetCategories.length === 0) {
      return budgetCardConfig.map((config) => {
        if (config.dataKey === "totalBudget") {
          return { ...config, subtitle: "Annual budget" };
        } else if (config.dataKey === "actualSpending") {
          return { ...config, subtitle: "0% of budget" };
        } else {
          return { ...config, subtitle: "0% remaining" };
        }
      });
    }

    const totalBudget = budgetCategories.reduce(
      (sum, cat) => sum + cat.budgetedAmount,
      0
    );
    const actualSpending = budgetCategories.reduce(
      (sum, cat) => sum + cat.actualSpending,
      0
    );
    const remaining = Math.max(0, totalBudget - actualSpending);

    const spendingPercentage =
      totalBudget > 0 ? Math.round((actualSpending / totalBudget) * 100) : 0;
    const remainingPercentage =
      totalBudget > 0 ? Math.round((remaining / totalBudget) * 100) : 0;

    return budgetCardConfig.map((config) => {
      if (config.dataKey === "totalBudget") {
        return { ...config, subtitle: "Annual budget" };
      } else if (config.dataKey === "actualSpending") {
        return { ...config, subtitle: `${spendingPercentage}% of budget` };
      } else {
        return { ...config, subtitle: `${remainingPercentage}% remaining` };
      }
    });
  }, [budgetCategories]);

  // Update category colors based on spending percentage
  const budgetCategoriesWithColor = useMemo(() => {
    return budgetCategories.map((category) => {
      const percentage =
        category.budgetedAmount > 0
          ? (category.actualSpending / category.budgetedAmount) * 100
          : 0;

      let usedColor: "green" | "orange" | "red" = "green";
      if (percentage >= 100) {
        usedColor = "red";
      } else if (percentage >= 80) {
        usedColor = "orange";
      }

      return {
        ...category,
        usedColor,
      };
    });
  }, [budgetCategories]);

  // Handle budget submission - just refresh the list
  const handleBudgetSubmit = async () => {
    // The dialog already handles the API call via the store
    // Just refresh the budgets list
    await fetchBudgets();
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error("Failed to Load Budgets", {
        description: error,
        duration: 4000,
      });
    }
  }, [error]);

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
          onCreateBudgetClick={() => setIsCreateBudgetOpen(true)}
        />
      </div>

      {loading && budgetCategories.length === 0 ? (
        <>
          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          
          {/* Skeleton Category List */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-6" />
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {!loading && budgetCategories.length === 0 && !error && (
            <>
              {/* Show cards with "0" when no data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgetCardConfigWithSubtitle.map((config) => (
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
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">No budgets found. Create your first budget to get started.</p>
              </div>
            </>
          )}

          {budgetCategories.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgetCardConfigWithSubtitle.map((config) => (
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
                      {budgetCategoriesWithColor.map((category) => (
                        <BudgetCategoryItem
                          key={category.id}
                          title={category.title}
                          actualSpending={category.actualSpending}
                          budgetedAmount={category.budgetedAmount}
                          usedColor={category.usedColor}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </>
      )}

      {/* Create Budget Dialog */}
      <CreateBudgetDialog
        open={isCreateBudgetOpen}
        onOpenChange={setIsCreateBudgetOpen}
        title="Create Budget"
        onSubmit={handleBudgetSubmit}
      />
    </div>
  );
}
