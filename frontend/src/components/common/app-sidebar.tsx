import { useRouterState } from "@tanstack/react-router";
import {
  Building2,
  DollarSign,
  LayoutDashboard,
  Package,
  Shield,
  Store,
  Wallet,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/navigation/nav-main";
import { NavUser } from "@/components/navigation/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { user } = useAuthStore();
  const isActivePath = (path: string) => pathname.startsWith(path);

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: isActivePath("/dashboard"),
    },
    {
      title: "HRIS",
      url: "/hris",
      icon: Building2,
      isActive: isActivePath("/hris"),
    },
    {
      title: "Finance",
      url: "/finance",
      icon: DollarSign,
      isActive: isActivePath("/finance"),
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: Wallet,
      isActive: isActivePath("/accounts"),
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
      isActive: isActivePath("/inventory"),
    },
    {
      title: "Vendors",
      url: "/vendors",
      icon: Store,
      isActive: isActivePath("/vendors"),
    },
    {
      title: "Access Control",
      url: "/access-control",
      icon: Shield,
      isActive: isActivePath("/access-control"),
    },
  ];

  const userData = user
    ? {
        name: user.name || "User",
        email: user.email || "",
        avatar: "",
      }
    : {
        name: "Guest",
        email: "",
        avatar: "",
      };

  return (
    <Sidebar
      collapsible="icon"
      className="!border-0 !border-r-0 !border-l-0 [&>div[data-sidebar='sidebar']]:!bg-white"
      {...props}
    >
      <SidebarHeader className="bg-white">
        <div className="flex items-center gap-2  py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">RZ Ecommerce</span>
            <span className="truncate text-xs">
              Enterprise Resource Planning
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="bg-white">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
