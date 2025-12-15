import { DynamicBreadcrumb } from "@/components/breadcrumb/dynamic-breadcrumb";
import { SiteHeader } from "@/components/navbar/site-header";
import { AppSidebar } from "@/components/common/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useMemo } from "react";
import { Heading, Paragraph } from "@/components/semantic/index";

// Minimal pending screen shown while beforeLoad is resolving
function PendingScreen() {
  return (
    <div className="grid place-items-center h-screen bg-neutral-50">
      <div className="h-6 w-6 rounded-full border-2 border-neutral-300 border-t-transparent animate-spin" />
    </div>
  );
}

function RootComponent() {
  const location = useLocation();
  const scrollableRef = useRef<HTMLDivElement>(null);

  // Scroll to top when route changes
  useEffect(() => {
    // Scroll the scrollable container if it exists
    if (scrollableRef.current) {
      scrollableRef.current.scrollTop = 0;
    }
    // Also scroll window to top for routes without sidebar
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Page title and description mapping
  const pageInfo = useMemo(() => {
    const pages: Record<string, { title: string; description?: string }> = {
      "/dashboard": {
        title: "Dashboard",
        description: "Welcome to your dashboard!",
      },
      "/hris": {
        title: "Human Resource Information System",
        description: "Comprehensive HR management for your organization",
      },
      "/finance": {
        title: "Finance",
        description: "Manage financial transactions and reports",
      },
      "/account-payable": {
        title: "Account Payable",
        description: "Track and manage money owed to suppliers and vendors",
      },
      "/account-receivable": {
        title: "Account Receivable",
        description: "Track and manage money owed by customers",
      },
      "/inventory": {
        title: "Inventory",
        description: "Manage product inventory and stock levels",
      },
      "/purchase-order": {
        title: "Purchase Order",
        description: "Create and manage purchase orders",
      },
      "/vendors": {
        title: "Vendors",
        description: "Manage vendor information and relationships",
      },
      "/access-control": {
        title: "Access Control",
        description: "Manage user permissions and access rights",
      },
      "/accounts": {
        title: "Accounts",
        description: "Manage payables and receivables in one place",
      },
      "/settings": {
        title: "Settings",
        description: "Application settings and configuration",
      },
      "/users": {
        title: "User Management",
        description: "Manage system users and their roles",
      },
    };

    // Find matching route
    for (const [route, info] of Object.entries(pages)) {
      if (location.pathname.startsWith(route)) {
        return info;
      }
    }
    return null;
  }, [location.pathname]);

  // Check if current route should have sidebar and navbar
  const routesWithSidebar = [
    "/dashboard",
    "/hris",
    "/finance",
    "/account-payable",
    "/account-receivable",
    "/accounts",
    "/inventory",
    "/purchase-order",
    "/vendors",
    "/access-control",
    "/settings",
    "/users",
  ];

  const shouldShowSidebar = routesWithSidebar.some((route) =>
    location.pathname.startsWith(route)
  );

  // If it's a route that should have sidebar and navbar, render with them
  if (shouldShowSidebar) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          {/* Sidebar */}
          <AppSidebar />

          {/* Main Content Area */}
          <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden bg-gray-50">
            <SiteHeader />

            <main className="flex-1 p-4 md:p-8 min-h-0 overflow-hidden">
              <div
                ref={scrollableRef}
                className="bg-white rounded-3xl shadow-sm h-full w-full overflow-auto p-5 sm:p-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <DynamicBreadcrumb />
                {pageInfo && (
                  <div className="mt-4 mb-6">
                    <Heading level={1} className="text-lg font-semibold">
                      {pageInfo.title}
                    </Heading>
                    {pageInfo.description && (
                      <Paragraph className="text-xs text-muted-foreground">
                        {pageInfo.description}
                      </Paragraph>
                    )}
                  </div>
                )}
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </div>
        <Toaster />
      </SidebarProvider>
    );
  }

  // For public routes (/, /auth/login, /auth/register), render without sidebar/navbar
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

export const Route = createRootRoute({
  wrapInSuspense: true,
  pendingComponent: PendingScreen,
  pendingMs: 0,
  component: RootComponent,
});
