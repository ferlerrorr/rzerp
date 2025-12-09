import { Card, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";

interface IncomeStatementItem {
  label: string;
  amount: string;
  isNegative?: boolean;
  isNetIncome?: boolean;
  isSubtotal?: boolean;
}

interface IncomeStatementProps {
  title?: string;
  items: IncomeStatementItem[];
  className?: string;
}

export function IncomeStatement({
  title = "Income Statement (P&L)",
  items,
  className,
}: IncomeStatementProps) {
  // Group items into logical sections (Revenue, Expenses, Net Income)
  const revenueItems: IncomeStatementItem[] = [];
  const expenseItems: IncomeStatementItem[] = [];
  const netIncomeItem: IncomeStatementItem[] = [];

  items.forEach((item) => {
    if (item.isNetIncome) {
      netIncomeItem.push(item);
    } else if (item.isNegative) {
      expenseItems.push(item);
    } else if (item.isSubtotal && !item.isNetIncome) {
      // Subtotals that aren't net income go to expenses (like Gross Profit)
      expenseItems.push(item);
    } else {
      revenueItems.push(item);
    }
  });

  const sections = [
    {
      title: "Revenue",
      items: revenueItems,
      color: "bg-blue-50/50 border-blue-100",
    },
    {
      title: "Expenses",
      items: expenseItems,
      color: "bg-orange-50/50 border-orange-100",
    },
    {
      title: "Net Income",
      items: netIncomeItem,
      color: "bg-purple-50/50 border-purple-100",
    },
  ].filter((section) => section.items.length > 0);

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-base font-semibold text-gray-900 mb-4">
          {title}
        </CardTitle>
      </CardHeader>
      <div className="flex-1 flex flex-col min-h-0 px-6 pb-4">
        <div className="flex-1 flex flex-col space-y-3 overflow-y-auto">
          {sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className={cn(
                "rounded-lg border p-3 transition-all duration-200 flex-shrink-0",
                section.color
              )}
            >
              <h4 className="text-sm font-semibold text-gray-900 mb-2.5 pb-1.5 border-b border-gray-200/50">
                {section.title}
              </h4>
              <div className="space-y-2 mt-2">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={cn(
                      "flex justify-between items-center py-1.5 px-2 rounded-md transition-colors duration-150",
                      "hover:bg-white/60",
                      (item.isSubtotal || item.isNetIncome) &&
                        "border-t border-gray-200/50 pt-2.5 mt-2 bg-white/40"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm transition-colors duration-150",
                        item.isSubtotal || item.isNetIncome
                          ? "font-semibold text-gray-900"
                          : "text-gray-700"
                      )}
                    >
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold transition-colors duration-150",
                        item.isNetIncome
                          ? "text-green-600"
                          : item.isNegative
                          ? "text-red-600"
                          : item.isSubtotal
                          ? "text-gray-900"
                          : "text-gray-800"
                      )}
                    >
                      {item.isNegative ? `(${item.amount})` : item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
