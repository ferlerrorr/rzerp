import { SimpleCard } from "@/components/card/simpleCard";
import { UserActivityCard } from "@/components/card/userActivityCard";
import { Users, LogIn, Clock, Activity } from "lucide-react";

interface ActivityCounts {
  activeSessions: string;
  loginAttempts24h: string;
  avgSessionDuration: string;
  totalUsers: string;
}

interface ActivityCardConfig {
  title: string;
  dataKey: keyof ActivityCounts;
  countColor:
    | "default"
    | "green"
    | "blue"
    | "black"
    | "orange"
    | "red"
    | "purple";
  bgColor: string;
  icon: typeof Users | typeof LogIn | typeof Clock | typeof Activity;
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
  subtitle?: string;
}

const activityCounts: ActivityCounts = {
  activeSessions: "5",
  loginAttempts24h: "127",
  avgSessionDuration: "3.2 hrs",
  totalUsers: "25",
};

const activityCardConfig: ActivityCardConfig[] = [
  {
    title: "Active Sessions",
    dataKey: "activeSessions",
    countColor: "green",
    bgColor: "bg-white",
    icon: Users,
    iconBgColor: "green",
    subtitle: "Currently logged in",
  },
  {
    title: "Login Attempts (24h)",
    dataKey: "loginAttempts24h",
    countColor: "black",
    bgColor: "bg-white",
    icon: LogIn,
    iconBgColor: "blue",
    subtitle: "23 failed attempts",
  },
  {
    title: "Avg Session Duration",
    dataKey: "avgSessionDuration",
    countColor: "blue",
    bgColor: "bg-white",
    icon: Clock,
    iconBgColor: "blue",
    subtitle: "Average per user",
  },
  {
    title: "Total Users",
    dataKey: "totalUsers",
    countColor: "black",
    bgColor: "bg-white",
    icon: Activity,
    iconBgColor: "purple",
  },
];

interface UserActivity {
  id: string;
  rank: number;
  userName: string;
  role: string;
  totalLogins: number;
  lastLogin: string;
}

const userActivities: UserActivity[] = [
  {
    id: "1",
    rank: 1,
    userName: "Juan Dela Cruz",
    role: "admin",
    totalLogins: 245,
    lastLogin: "2024-12-07 09:30",
  },
  {
    id: "2",
    rank: 2,
    userName: "Maria Santos",
    role: "manager",
    totalLogins: 198,
    lastLogin: "2024-12-10 08:15",
  },
  {
    id: "3",
    rank: 3,
    userName: "Pedro Reyes",
    role: "editor",
    totalLogins: 156,
    lastLogin: "2024-12-10 10:20",
  },
  {
    id: "4",
    rank: 4,
    userName: "Ana Garcia",
    role: "user",
    totalLogins: 134,
    lastLogin: "2024-12-09 14:45",
  },
  {
    id: "5",
    rank: 5,
    userName: "Carlos Mendoza",
    role: "viewer",
    totalLogins: 98,
    lastLogin: "2024-12-10 07:30",
  },
];

export function UserActivityTab() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <h1 className="text-base font-semibold text-gray-900">
        User Activity Monitoring
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activityCardConfig.map((config) => (
          <SimpleCard
            key={config.dataKey}
            title={config.title}
            count={activityCounts[config.dataKey]}
            subtitle={config.subtitle}
            countColor={config.countColor}
            icon={config.icon}
            iconBgColor={config.iconBgColor}
            className={config.bgColor}
          />
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:gap-4 mt-2 border border-gray-200 rounded-2xl p-4">
        <h2 className="text-sm sm:text-base font-semibold text-gray-800">
          Most Active Users
        </h2>
        <div className="space-y-2 sm:space-y-3">
          {userActivities.map((activity) => (
            <UserActivityCard
              key={activity.id}
              rank={activity.rank}
              userName={activity.userName}
              role={activity.role}
              totalLogins={activity.totalLogins}
              lastLogin={activity.lastLogin}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
