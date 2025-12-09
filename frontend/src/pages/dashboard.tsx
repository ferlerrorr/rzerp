import {
  ActivitiesCard,
  type ActivityData,
} from "@/components/activities/activitiesCard";
import { OverViewCard } from "@/components/card/overViewCard";
import {
  ChartBarMixed,
  type ProgressData,
} from "@/components/charts/barChartMixed";
import {
  UsersRound,
  Package,
  ShoppingCart,
  LucideIcon,
  PhilippinePeso,
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

// Sample progress data - This would typically come from an API/database
const progressData: ProgressData[] = [
  {
    id: "1",
    label: "Sales Target",
    value: 85,
    color: "blue",
  },
  {
    id: "2",
    label: "Order Fulfillment",
    value: 92,
    color: "green",
  },
  {
    id: "3",
    label: "Customer Satisfaction",
    value: 78,
    color: "purple",
  },
];

// Sample activities data - This would typically come from an API/database
const activitiesData: ActivityData[] = [
  {
    id: "1",
    title: "New employee onboarded",
    author: "HR Team",
    timeAgo: "2 hours ago",
    color: "blue",
  },
  {
    id: "2",
    title: "Purchase order approved",
    author: "Finance Team",
    timeAgo: "4 hours ago",
    color: "green",
  },
  {
    id: "3",
    title: "Inventory stock updated",
    author: "Warehouse Team",
    timeAgo: "6 hours ago",
    color: "purple",
  },
  {
    id: "4",
    title: "New vendor added",
    author: "Procurement Team",
    timeAgo: "1 day ago",
    color: "orange",
  },
  {
    id: "5",
    title: "Monthly report generated",
    author: "Admin",
    timeAgo: "2 days ago",
    color: "indigo",
  },
  {
    id: "6",
    title: "Customer feedback received",
    author: "Support Team",
    timeAgo: "3 days ago",
    color: "teal",
  },
  {
    id: "7",
    title: "Product shipment dispatched",
    author: "Logistics Team",
    timeAgo: "4 days ago",
    color: "pink",
  },
  {
    id: "8",
    title: "Quality check completed",
    author: "QA Team",
    timeAgo: "5 days ago",
    color: "yellow",
  },
  {
    id: "9",
    title: "System backup completed",
    author: "IT Team",
    timeAgo: "1 week ago",
    color: "blue",
  },
  {
    id: "10",
    title: "Budget review meeting scheduled",
    author: "Finance Team",
    timeAgo: "1 week ago",
    color: "green",
  },
  {
    id: "11",
    title: "New product category created",
    author: "Product Team",
    timeAgo: "1 week ago",
    color: "purple",
  },
  {
    id: "12",
    title: "Security audit completed",
    author: "Security Team",
    timeAgo: "2 weeks ago",
    color: "red",
  },
];

export function DashboardPage() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <ChartBarMixed
          data={progressData}
          title="Monthly Performance"
          description="Current progress overview"
          footer={{
            trend: {
              value: 5.2,
              label: "Trending up by",
              color: "green",
            },
            note: "Showing current performance metrics",
          }}
        />
        <ActivitiesCard
          data={activitiesData}
          title="Recent Activities"
          description="Latest updates and notifications"
        />
      </div>
    </div>
  );
}
