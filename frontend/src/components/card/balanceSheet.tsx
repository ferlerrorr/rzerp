import { Card, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";

interface BalanceSheetItem {
  label: string;
  amount: string;
  isTotal?: boolean;
}

interface BalanceSheetSection {
  title: string;
  items: BalanceSheetItem[];
}

interface BalanceSheetProps {
  title?: string;
  sections: BalanceSheetSection[];
  className?: string;
}

export function BalanceSheet({
  title = "Balance Sheet Summary",
  sections,
  className,
}: BalanceSheetProps) {
  const sectionColors = [
    "bg-blue-50/50 border-blue-100",
    "bg-orange-50/50 border-orange-100",
    "bg-purple-50/50 border-purple-100",
  ];

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
                sectionColors[sectionIndex % sectionColors.length]
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
                      item.isTotal &&
                        "border-t border-gray-200/50 pt-2.5 mt-2 bg-white/40"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm transition-colors duration-150",
                        item.isTotal
                          ? "font-semibold text-gray-900"
                          : "text-gray-700"
                      )}
                    >
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold transition-colors duration-150",
                        item.isTotal ? "text-gray-900" : "text-gray-800"
                      )}
                    >
                      {item.amount}
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

