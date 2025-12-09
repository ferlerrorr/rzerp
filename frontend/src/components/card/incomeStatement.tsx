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
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900 mb-4">
          {title}
        </CardTitle>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex justify-between items-center py-1.5",
                item.isSubtotal && "border-t border-gray-200 pt-3 mt-2"
              )}
            >
              <span
                className={cn(
                  "text-sm",
                  item.isSubtotal || item.isNetIncome
                    ? "font-semibold text-gray-900"
                    : "text-gray-700"
                )}
              >
                {item.label}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  item.isNetIncome
                    ? "text-green-600"
                    : item.isNegative
                    ? "text-red-600"
                    : "text-gray-900"
                )}
              >
                {item.isNegative ? `(${item.amount})` : item.amount}
              </span>
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  );
}
