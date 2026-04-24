import type React from "react"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <div className="flex">
          <div className="fixed left-0 top-0 h-screen z-30">
            <DashboardSidebar />
          </div>
          <main className="flex-1 ml-64">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  )
}
