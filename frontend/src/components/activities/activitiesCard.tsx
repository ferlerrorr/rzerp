import { Calendar, LucideIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../ui/card";
import { Section, Paragraph } from "../semantic";
import { cn } from "@/lib/utils";

export interface ActivityData {
  id: string;
  title: string;
  author: string;
  timeAgo: string;
  color?:
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "pink"
    | "indigo"
    | "teal"
    | "yellow"
    | "red";
}

interface ActivitiesCardProps {
  data: ActivityData[];
  title?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

const activityBgColors = {
  blue: "bg-blue-100",
  green: "bg-green-100",
  purple: "bg-purple-100",
  orange: "bg-orange-100",
  pink: "bg-pink-100",
  indigo: "bg-indigo-100",
  teal: "bg-teal-100",
  yellow: "bg-yellow-100",
  red: "bg-red-100",
};

interface ActivityItemProps {
  activity: ActivityData;
  isLast?: boolean;
}

function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const color = activity.color || "blue";

  return (
    <CardContent
      className={cn(
        "flex items-start gap-3 py-4 px-6",
        !isLast && "border-b border-gray-200"
      )}
    >
      <div
        className={cn(
          "h-2 w-2 rounded-full mt-2 flex-shrink-0",
          activityBgColors[color]
        )}
        aria-hidden="true"
      />
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{activity.title}</p>
        <Paragraph className="text-xs text-muted-foreground mt-1">
          <span className="font-semibold">{activity.author}</span>
          <span className="mx-1">-</span>
          {activity.timeAgo}
        </Paragraph>
      </div>
    </CardContent>
  );
}

export function ActivitiesCard({
  data,
  title = "Recent activities",
  description,
  icon: Icon = Calendar,
  className,
}: ActivitiesCardProps) {
  return (
    <Card className={cn("rounded-2xl", className)}>
      <CardHeader className="">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Icon className="w-4 h-4" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs text-muted-foreground mt-1">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <div className="-mt-4 max-h-[400px] overflow-y-auto scrollbar-thin">
        <Section aria-label="Activities list">
          {data.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              isLast={index === data.length - 1}
            />
          ))}
        </Section>
      </div>
    </Card>
  );
}
