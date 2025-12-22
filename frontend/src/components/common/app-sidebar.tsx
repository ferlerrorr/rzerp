import { useRouterState } from "@tanstack/react-router";
import {
  Building2,
  DollarSign,
  LayoutDashboard,
  Package,
  Shield,
  Store,
  Wallet,
  Settings,
} from "lucide-react";
import * as React from "react";
import { Link as RouterLink } from "@tanstack/react-router";

import { NavMain } from "@/components/navigation/nav-main";
import { NavUser } from "@/components/navigation/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { user } = useAuthStore();
  const { state } = useSidebar();
  const isActivePath = (path: string) => pathname.startsWith(path);
  const isCollapsed = state === "collapsed";

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
      className="!border-0 !border-r-0 !border-l-0 [&>div[data-sidebar='sidebar']]:!bg-transparent [&>div[data-sidebar='sidebar']]:!p-0"
      {...props}
    >
      <div className="flex h-full w-full">
        {/* Left Panel - Icons Only */}
        <div
          className={cn(
            "bg-[#202327] flex flex-col items-center py-2 sm:py-4 gap-2 justify-between flex-shrink-0",
            "w-12 sm:w-14 md:w-16"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            {/* Logo */}
            <div className="mb-2 sm:mb-4">
              <div className="flex aspect-square size-8 sm:size-10 items-center justify-center rounded-lg text-white bg-[#202A34]">
                <span className="text-sm sm:text-lg font-bold">RZ</span>
              </div>
            </div>

            {/* Icons */}
            {navMain.map((item) => {
              const Icon = item.icon;
              return (
                <RouterLink
                  key={item.title}
                  to={item.url}
                  className={cn(
                    "flex items-center justify-center rounded-lg transition-colors",
                    "w-8 h-8 sm:w-10 sm:h-10",
                    item.isActive
                      ? "bg-[#202A34] text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                  title={item.title}
                >
                  {Icon && <Icon className="size-4 sm:size-5" />}
                </RouterLink>
              );
            })}
          </div>

          {/* Settings Icon at Bottom */}
          <RouterLink
            to="/settings"
            className={cn(
              "flex items-center justify-center rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/10",
              "w-8 h-8 sm:w-10 sm:h-10"
            )}
            title="Settings"
          >
            <Settings className="size-4 sm:size-5" />
          </RouterLink>
        </div>

        {/* Right Panel - Menu Items */}
        <div
          className={cn(
            "bg-[#FFFFFF] flex flex-col transition-all duration-200 ease-linear overflow-hidden",
            isCollapsed
              ? "w-0 min-w-0 opacity-0"
              : "flex-1 min-w-0 w-full sm:min-w-[200px] sm:w-[200px] md:min-w-[241px] md:w-[241px] opacity-100"
          )}
        >
          <SidebarHeader className="bg-[#FFFFFF] "></SidebarHeader>

          <SidebarContent className="bg-[#FFFFFF] flex-1 overflow-y-auto">
            <div className="mt-6">
              <NavUser user={userData} />
              <NavMain items={navMain} />
            </div>
          </SidebarContent>

          <SidebarFooter className="bg-[#FFFFFF] flex flex-col">
            {/* Help Center Section */}
            <div className="px-2 sm:px-4 py-2 sm:py-4 ">
              <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                Help Center
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
                Please contact us for more questions.
              </p>
              <button className="w-full bg-[#29333D] text-white font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg hover:bg-[#202A34] transition-colors text-xs sm:text-sm">
                Contact Admin
              </button>
            </div>
          </SidebarFooter>
        </div>
      </div>
    </Sidebar>
  );
}
