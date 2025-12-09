import { ReactNode } from "react"
import { AppSidebar } from "../app-sidebar"
import { SidebarProvider, SidebarInset } from "../ui/sidebar"
import { SiteHeader } from "../navbar"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

