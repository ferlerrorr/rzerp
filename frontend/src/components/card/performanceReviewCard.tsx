import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

interface PerformanceReviewCardProps {
  employeeName: string;
  reviewPeriod: string;
  department: string;
  role: string;
  rating: number;
  ratingText: string;
  avatarUrl?: string;
}

const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) {
    return "text-green-600";
  } else if (rating >= 4.0) {
    return "text-blue-600";
  } else if (rating >= 3.5) {
    return "text-orange-600";
  } else {
    return "text-red-600";
  }
};

const getInitials = (name: string): string => {
  const words = name.trim().split(" ");
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  } else {
    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  }
};

const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-teal-500",
  ];
  const index = name.length % colors.length;
  return colors[index];
};

export function PerformanceReviewCard({
  employeeName,
  reviewPeriod,
  department,
  role,
  rating,
  ratingText,
  avatarUrl,
}: PerformanceReviewCardProps) {
  return (
    <Card className="border border-gray-200">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={employeeName} />
            <AvatarFallback
              className={cn(
                "text-white text-xs font-semibold",
                getAvatarColor(employeeName)
              )}
            >
              {getInitials(employeeName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              {employeeName} - {reviewPeriod}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {department} • {role}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-center">
            <p className={cn("text-xl font-bold", getRatingColor(rating))}>
              {rating}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{ratingText}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
