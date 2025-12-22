"use client";

import {
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const getUserInitials = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    } else {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
  };

  const getAvatarColor = (name: string) => {
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

  return (
    <SidebarMenu className="px-2">
      <SidebarGroupLabel className="text-gray-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider ">
        Account
      </SidebarGroupLabel>
      <SidebarMenuItem>
        <div className="bg-[#29333D] text-white rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 w-full flex items-center gap-2 sm:gap-3">
          <div
            className={`h-7 w-7 sm:h-8 sm:w-8 ${getAvatarColor(
              user.name
            )} rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <span className="text-white text-[10px] sm:text-xs font-semibold">
              {getUserInitials(user.name)}
            </span>
          </div>
          <div className="grid flex-1 text-left text-xs sm:text-sm leading-tight min-w-0">
            <span className="truncate font-semibold text-white">
              {user.name}
            </span>
            <span className="truncate text-[10px] sm:text-xs text-white/70 hidden sm:block">
              {user.email || `@${user.name.toLowerCase().replace(/\s+/g, "")}`}
            </span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
