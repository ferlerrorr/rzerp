import { useState, useMemo } from "react";
import { toast } from "sonner";
import { AppButtons } from "@/components/common/app-Buttons";
import { SimpleCard } from "@/components/card/simpleCard";
import { Card, CardContent } from "@/components/ui/card";
import { CreateBudgetDialog } from "@/components/dialogs/create-budget-dialog";
import { BudgetFormData } from "@/stores/budget";
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

// Budget Category interface
interface BudgetCategory {
  id: string;
  title: string;
  actualSpending: number;
  budgetedAmount: number;
  usedColor: "green" | "orange" | "red";
  period: string;
  description?: string;
}

// Default budget categories
const defaultBudgetCategories: BudgetCategory[] = [
  {
    id: "1",
    title: "Salaries & Wages",
    actualSpending: 524350,
    budgetedAmount: 1500000,
    usedColor: "green",
    period: "2024",
  },
  {
    id: "2",
    title: "Operating Expenses",
    actualSpending: 138500,
    budgetedAmount: 800000,
    usedColor: "green",
    period: "2024",
  },
  {
    id: "3",
    title: "Marketing",
    actualSpending: 280000,
    budgetedAmount: 500000,
    usedColor: "green",
    period: "2024",
  },
  {
    id: "4",
    title: "IT & Technology",
    actualSpending: 350000,
    budgetedAmount: 400000,
    usedColor: "orange",
    period: "2024",
  },
  {
    id: "5",
    title: "Rent & Utilities",
    actualSpending: 350000,
    budgetedAmount: 300000,
    usedColor: "red",
    period: "2024",
  },
];

// LocalStorage keys
const BUDGET_CATEGORIES_STORAGE_KEY = "rzerp_budget_categories";
const BUDGET_COUNTER_KEY = "rzerp_budget_counter";

// Helper functions for localStorage
const loadBudgetCategoriesFromStorage = (): BudgetCategory[] => {
  try {
    const stored = localStorage.getItem(BUDGET_CATEGORIES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default categories if no data exists
    saveBudgetCategoriesToStorage(defaultBudgetCategories);
    // Initialize counter
    if (!localStorage.getItem(BUDGET_COUNTER_KEY)) {
      localStorage.setItem(BUDGET_COUNTER_KEY, "5");
    }
    return defaultBudgetCategories;
  } catch (error) {
    console.error("Error loading budget categories from localStorage:", error);
    return defaultBudgetCategories;
  }
};

const saveBudgetCategoriesToStorage = (categories: BudgetCategory[]) => {
  try {
    localStorage.setItem(
      BUDGET_CATEGORIES_STORAGE_KEY,
      JSON.stringify(categories)
    );
  } catch (error) {
    console.error("Error saving budget categories to localStorage:", error);
  }
};

const getNextBudgetId = (): string => {
  try {
    const counter = parseInt(
      localStorage.getItem(BUDGET_COUNTER_KEY) || "5",
      10
    );
    const nextCounter = counter + 1;
    localStorage.setItem(BUDGET_COUNTER_KEY, nextCounter.toString());
    return nextCounter.toString();
  } catch (error) {
    console.error("Error getting next budget ID:", error);
    return Date.now().toString();
  }
};

// Transform BudgetFormData to BudgetCategory
const transformFormDataToBudgetCategory = (
  formData: BudgetFormData
): BudgetCategory => {
  const budgetedAmount = parseFloat(formData.budgetedAmount) || 0;
  const actualSpending = 0; // New budgets start with 0 actual spending

  // Determine color based on percentage (will be green initially since spending is 0)
  const usedColor: "green" | "orange" | "red" = "green";

  return {
    id: getNextBudgetId(),
    title: formData.category.trim(),
    actualSpending,
    budgetedAmount,
    usedColor,
    period: formData.period.trim(),
    description: formData.description.trim() || undefined,
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
  // Load budget categories from localStorage on mount
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(
    () => loadBudgetCategoriesFromStorage()
  );

  const [isCreateBudgetOpen, setIsCreateBudgetOpen] = useState(false);

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

  // Handle budget submission
  const handleBudgetSubmit = (data: BudgetFormData) => {
    try {
      // Transform form data to budget category format
      const newBudgetCategory = transformFormDataToBudgetCategory(data);

      // Add new budget category to the list
      const updatedCategories = [newBudgetCategory, ...budgetCategories];

      // Save to localStorage
      saveBudgetCategoriesToStorage(updatedCategories);

      // Update state to trigger re-render
      setBudgetCategories(updatedCategories);

      // Show success toast
      toast.success("Budget Created Successfully", {
        description: `Budget for ${data.category} has been created.`,
        duration: 3000,
      });

      console.log("Budget created successfully:", newBudgetCategory);
    } catch (error) {
      console.error("Error creating budget:", error);
      // Show error toast
      toast.error("Failed to Create Budget", {
        description:
          "An error occurred while creating the budget. Please try again.",
        duration: 4000,
      });
    }
  };

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
