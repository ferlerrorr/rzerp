import { OverViewCard } from "@/components/card/overViewCard";
import { ChartBar, type BarChartData } from "@/components/charts/barChart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  UsersRound,
  Package,
  ShoppingCart,
  LucideIcon,
  PhilippinePeso,
  Star,
} from "lucide-react";

interface DashboardCardData {
  id: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor:
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "pink"
    | "indigo"
    | "teal"
    | "yellow";
  trend?: {
    value: string | number;
    label: string;
    color: "green" | "red" | "blue" | "yellow" | "orange" | "purple";
  };
}

// Sample data - This would typically come from an API/database
const dashboardCards: DashboardCardData[] = [
  {
    id: "1",
    title: "Total Employees",
    value: 100,
    icon: UsersRound,
    iconBgColor: "blue",
    trend: {
      value: 10,
      label: "from last month",
      color: "green",
    },
  },
  {
    id: "2",
    title: "Monthly Revenue",
    value: "45,231",
    icon: PhilippinePeso,
    iconBgColor: "green",
    trend: {
      value: 12.5,
      label: "from last month",
      color: "green",
    },
  },
  {
    id: "3",
    title: "Inventory Items",
    value: "1,234",
    icon: Package,
    iconBgColor: "purple",
    trend: {
      value: -5,
      label: "from last month",
      color: "red",
    },
  },
  {
    id: "4",
    title: "Orders Today",
    value: 42,
    icon: ShoppingCart,
    iconBgColor: "orange",
    trend: {
      value: 8,
      label: "from yesterday",
      color: "green",
    },
  },
];

// Helper function to generate daily data for multiple months
function generateDailyDataForMonths(
  startYear: number,
  startMonth: number,
  numberOfMonths: number,
  dataKey: string
): BarChartData[] {
  const data: BarChartData[] = [];

  // Generate varied data for each day
  const baseValues: Record<string, number[]> = {
    salesTarget: [
      72, 88, 65, 91, 85, 96, 78, 99, 82, 94, 76, 89, 93, 87, 84, 92, 79, 95,
      81, 90, 77, 88, 86, 91, 75, 89, 83, 94, 80, 92,
    ],
    orderFulfillment: [
      85, 97, 91, 99, 88, 95, 82, 98, 90, 96, 87, 99, 92, 94, 89, 97, 93, 98,
      86, 96, 91, 95, 88, 97, 85, 94, 90, 96, 87, 95,
    ],
  };

  const values = baseValues[dataKey] || baseValues.salesTarget;

  // Generate data for the specified number of months
  for (let monthOffset = 0; monthOffset < numberOfMonths; monthOffset++) {
    const year = startYear;
    const month = startMonth + monthOffset;
    const actualYear = year + Math.floor(month / 12);
    const actualMonth = month % 12;
    const daysInMonth = new Date(actualYear, actualMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(actualYear, actualMonth, day);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const valueIndex = (monthOffset * 31 + day - 1) % values.length;
      const baseValue = values[valueIndex];
      // Add deterministic variation based on day and month
      const variation = ((day + monthOffset * 7) % 7) - 3; // Cycle through -3 to 3
      const finalValue = Math.max(60, Math.min(100, baseValue + variation));

      data.push({
        period: dateStr,
        [dataKey]: finalValue,
      });
    }
  }

  return data;
}

// Get the latest 3 months of data (including current month and 2 previous months)
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();

// Generate daily data for the last 3 months
const salesTargetData: BarChartData[] = generateDailyDataForMonths(
  currentYear,
  currentMonth - 2, // Start 2 months ago
  3, // Generate 3 months of data
  "salesTarget"
);

const orderFulfillmentData: BarChartData[] = generateDailyDataForMonths(
  currentYear,
  currentMonth - 2, // Start 2 months ago
  3, // Generate 3 months of data
  "orderFulfillment"
);

const salesTargetConfig: ChartConfig = {
  salesTarget: {
    label: "Sales Target",
    color: "#AC80F7",
  },
};

const orderFulfillmentConfig: ChartConfig = {
  orderFulfillment: {
    label: "Order Fulfillment",
    color: "#AC80F7",
  },
};

export function DashboardPage() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {dashboardCards.map((card) => (
          <OverViewCard
            key={card.id}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconBgColor={card.iconBgColor}
            trend={card.trend}
          />
        ))}
        <OverViewCard
          title="Customer Satisfaction"
          value="4.5"
          icon={Star}
          iconBgColor="yellow"
          trend={{
            value: 0.3,
            label: "from last month",
            color: "green",
          }}
        />
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 h-[400px] sm:h-[400px] lg:h-[450px]">
          <div className="h-[400px]">
            <ChartBar
              data={salesTargetData}
              config={salesTargetConfig}
              title="Sales Target"
              value="87%"
              xAxisKey="period"
              xAxisFormatter={(value) => {
                // Return the full date format like "Dec 1", "Dec 2", etc.
                return value;
              }}
            />
          </div>
          <div className="h-[400px]">
            <ChartBar
              data={orderFulfillmentData}
              config={orderFulfillmentConfig}
              title="Order Fulfillment"
              value="95%"
              xAxisKey="period"
              xAxisFormatter={(value) => {
                // Return the full date format like "Dec 1", "Dec 2", etc.
                return value;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
