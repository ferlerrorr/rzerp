import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";

export interface UserActivityCardProps {
  rank: number;
  userName: string;
  role: string;
  totalLogins: number;
  lastLogin: string;
  className?: string;
}

export function UserActivityCard({
  rank,
  userName,
  role,
  totalLogins,
  lastLogin,
  className,
}: UserActivityCardProps) {
  return (
    <Card
      className={cn(
        "bg-white border border-gray-200 hover:shadow-md transition-shadow",
        className
      )}
    >
      <CardContent className="p-2 sm:p-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
            <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 border border-white flex items-center justify-center">
              <span className="text-[9px] sm:text-[10px] font-semibold text-blue-600">
                #{rank}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                {userName}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                {role}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-900">
              {totalLogins} {totalLogins === 1 ? "login" : "logins"}
            </p>
            <p className="text-[9px] sm:text-[10px] text-gray-500">
              Last: {lastLogin}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
