"use client";

import * as React from "react";
import {
  TrendingUp,
  LucideIcon,
  ChevronDown,
  CalendarIcon,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { type DateRange } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const description = "A bar chart";

export interface BarChartData {
  [key: string]: string | number;
}

interface ChartBarProps {
  data: BarChartData[];
  config: ChartConfig;
  title?: string;
  value?: string | number;
  xAxisKey: string;
  xAxisFormatter?: (value: string) => string;
  filters?: string[];
  footer?: {
    trend?: {
      value: string | number;
      label: string;
      icon?: LucideIcon;
      color?: "green" | "red" | "blue" | "yellow" | "orange" | "purple";
    };
    note?: string;
  };
  className?: string;
}

// Bar color from Figma design
const BAR_COLOR = "#AC80F7";

const trendColors = {
  green: "text-green-500",
  red: "text-red-500",
  blue: "text-blue-500",
  yellow: "text-yellow-500",
  orange: "text-orange-500",
  purple: "text-purple-500",
};

export function ChartBar({
  data,
  config,
  title = "Performance Metrics",
  value,
  xAxisKey,
  xAxisFormatter,
  filters = [],
  footer,
  className,
}: ChartBarProps) {
  const TrendIcon = footer?.trend?.icon || TrendingUp;
  const trendColor = footer?.trend?.color || "green";

  // Get all data keys except the xAxisKey
  const dataKeys = Object.keys(config).filter((key) => key !== xAxisKey);

  // Date range state - default to undefined (shows monthly aggregated data)
  // When a date range is selected, shows daily data for that range
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined
  );

  // Function to get the latest month range (current month)
  const getLatestMonthRange = (): DateRange => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return {
      from: new Date(year, month, 1),
      to: new Date(year, month + 1, 0), // Last day of current month
    };
  };

  // Function to go to latest month
  const goToLatestMonth = () => {
    setDateRange(getLatestMonthRange());
  };

  // Filter and aggregate data based on selected date range
  const filteredData = React.useMemo(() => {
    // If no date range selected, aggregate data by month
    if (!dateRange?.from || !dateRange?.to) {
      const monthlyData: Record<string, Record<string, number[]>> = {};

      data.forEach((item) => {
        const periodStr = String(item[xAxisKey]);
        const parts = periodStr.trim().split(" ");

        if (parts.length >= 2) {
          const monthName = parts[0];
          // Use month as key (e.g., "Nov", "Dec")
          const monthKey = monthName;

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {};
            dataKeys.forEach((key) => {
              monthlyData[monthKey][key] = [];
            });
          }

          // Collect all values for each data key in this month
          dataKeys.forEach((key) => {
            const value = Number(item[key]);
            if (!isNaN(value)) {
              monthlyData[monthKey][key].push(value);
            }
          });
        }
      });

      // Calculate average for each month and create aggregated data
      const monthMap: Record<string, number> = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Sept: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };

      const aggregated = Object.entries(monthlyData).map(
        ([monthName, monthValues]) => {
          const aggregatedItem: BarChartData = {
            period: monthName,
          };

          dataKeys.forEach((key) => {
            // Calculate average of values for this month and data key
            const values = monthValues[key] || [];
            const avgValue =
              values.length > 0
                ? Math.round(
                    values.reduce((sum, val) => sum + val, 0) / values.length
                  )
                : 0;
            aggregatedItem[key] = avgValue;
          });

          return aggregatedItem;
        }
      );

      // Sort by month order
      return aggregated.sort((a, b) => {
        const monthA = monthMap[a.period as string] ?? 12;
        const monthB = monthMap[b.period as string] ?? 12;
        return monthA - monthB;
      });
    }

    // Normalize date range to start of day for comparison
    const rangeStart = new Date(dateRange.from);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(dateRange.to);
    rangeEnd.setHours(23, 59, 59, 999);

    return data.filter((item) => {
      const periodStr = String(item[xAxisKey]);

      // Parse format like "Dec 1" or "Nov 15"
      const parts = periodStr.trim().split(" ");
      if (parts.length >= 2) {
        const monthName = parts[0];
        const day = parseInt(parts[1], 10);

        // Map month names to numbers
        const monthMap: Record<string, number> = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Sept: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };

        const month = monthMap[monthName];
        if (month !== undefined && !isNaN(day) && day > 0 && day <= 31) {
          // Try to use the year from dateRange, or current year
          let year = rangeStart.getFullYear();
          const parsedDate = new Date(year, month, day);

          // If the parsed date is before the range start, it might be from the previous year
          // or if it's after the range end, it might be from the next year
          if (parsedDate < rangeStart) {
            // Try next year
            const nextYearDate = new Date(year + 1, month, day);
            if (nextYearDate <= rangeEnd) {
              return nextYearDate >= rangeStart && nextYearDate <= rangeEnd;
            }
          } else if (parsedDate > rangeEnd) {
            // Try previous year
            const prevYearDate = new Date(year - 1, month, day);
            if (prevYearDate >= rangeStart) {
              return prevYearDate >= rangeStart && prevYearDate <= rangeEnd;
            }
          }

          // Check if date is within range
          return parsedDate >= rangeStart && parsedDate <= rangeEnd;
        }
      }

      // If we can't parse, include it (fallback)
      return true;
    });
  }, [data, dateRange, xAxisKey, dataKeys]);

  return (
    <Card
      className={cn(
        "border border-[#EDECFC] rounded-2xl p-6 flex flex-col gap-3 h-full min-h-0",
        className
      )}
    >
      <CardHeader className="p-0 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-sm font-semibold text-[#505050] leading-[1.22]">
            {title}
          </CardTitle>
          {value && (
            <div className="text-xl font-semibold text-[#505050] leading-[1.22]">
              {value}
            </div>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-9 px-3 border border-[rgba(236,236,236,0.9)] bg-white hover:bg-gray-50",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>All Data (Monthly)</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from || new Date()}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className="rounded-lg border-0"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      {filters && filters.length > 0 && (
        <div className="flex flex-row items-center justify-center gap-4 flex-wrap">
          {filters.map((filter, index) => (
            <button
              key={index}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(236,236,236,0.9)] bg-white hover:bg-gray-50 transition-colors"
              style={{
                minWidth: index === filters.length - 1 ? "auto" : "129px",
                height: "40px",
              }}
            >
              <span
                className="text-sm font-semibold leading-[1.22]"
                style={{ color: "#515151" }}
              >
                {filter}
              </span>
              <ChevronDown className="w-5 h-5" style={{ color: "#515151" }} />
            </button>
          ))}
        </div>
      )}
      <CardContent className="p-0 flex-1 min-h-0 overflow-hidden">
        {dateRange &&
        dateRange.from &&
        dateRange.to &&
        filteredData.length === 0 ? (
          // Show no data message when date range is selected but no data found
          <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
            <div className="text-center">
              <p className="text-sm font-medium text-[#505050] mb-1">
                No data for this period
              </p>
              <p className="text-xs text-[#767676]">
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </p>
            </div>
            <Button
              onClick={goToLatestMonth}
              variant="outline"
              className="h-9 px-4 border border-[rgba(236,236,236,0.9)] bg-white hover:bg-gray-50"
            >
              Go to Latest Month
            </Button>
          </div>
        ) : (
          <ChartContainer config={config} className="w-full h-full min-h-0">
            <BarChart
              accessibilityLayer
              data={filteredData}
              margin={{
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} stroke="#F4F4F5" />
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tickFormatter={xAxisFormatter || ((value) => value)}
                tick={{
                  fill: "#CFCFCF",
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "Instrument Sans",
                }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              {dataKeys.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={BAR_COLOR}
                  radius={[0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      {footer && (
        <CardFooter className="flex-col items-start gap-2 text-sm p-0">
          {footer.trend && (
            <div className="flex gap-2 leading-none font-medium">
              <span>{footer.trend.label}</span>{" "}
              <span className={cn(trendColors[trendColor])}>
                {typeof footer.trend.value === "number" &&
                footer.trend.value > 0
                  ? "+"
                  : ""}
                {footer.trend.value}
              </span>{" "}
              <TrendIcon className={cn("h-4 w-4", trendColors[trendColor])} />
            </div>
          )}
          {footer.note && (
            <div className="text-muted-foreground leading-none">
              {footer.note}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
