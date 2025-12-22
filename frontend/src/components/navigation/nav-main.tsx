"use client";

import { type LucideIcon } from "lucide-react";
import { Link as RouterLink } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-gray-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1 sm:mb-2">
        Overview
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              isActive={item.isActive}
              className={cn(
                "w-full justify-start gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-colors",
                item.isActive
                  ? "bg-[#29333D] text-white hover:bg-[#29333D]"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <RouterLink
                to={item.url}
                className="flex items-center gap-2 sm:gap-3 w-full"
              >
                {item.icon && (
                  <item.icon className="size-4 sm:size-5 flex-shrink-0" />
                )}
                <span className="font-medium text-xs sm:text-sm truncate">
                  {item.title}
                </span>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
