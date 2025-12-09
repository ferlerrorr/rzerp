import * as React from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  ShoppingCart,
  Store,
  Shield,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { useAuthStore } from "@/stores/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { user } = useAuthStore();

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      title: "HRIS",
      url: "/hris",
      icon: Building2,
      isActive: pathname === "/hris",
    },
    {
      title: "Finance",
      url: "/finance",
      icon: DollarSign,
      isActive: pathname === "/finance",
    },
    {
      title: "Account Payable",
      url: "/account-payable",
      icon: ArrowDownLeft,
      isActive: pathname === "/account-payable",
    },
    {
      title: "Account Receivable",
      url: "/account-receivable",
      icon: ArrowUpRight,
      isActive: pathname === "/account-receivable",
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
      isActive: pathname === "/inventory",
    },
    {
      title: "Purchase order",
      url: "/purchase-order",
      icon: ShoppingCart,
      isActive: pathname === "/purchase-order",
    },
    {
      title: "Vendors",
      url: "/vendors",
      icon: Store,
      isActive: pathname === "/vendors",
    },
    {
      title: "Access Control",
      url: "/access-control",
      icon: Shield,
      isActive: pathname === "/access-control",
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
