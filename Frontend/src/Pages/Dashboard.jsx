import { AppSidebar } from "@/components/app-sidebar"

import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"

import React from 'react'
import { Outlet } from 'react-router-dom'; // Import Outlet

const Dashboard = () => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 justify-between">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />

                    </div>
                    <div className="px-4">
                        <ThemeToggle />
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-4">
                    {/* Render nested route content here */}
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
export default Dashboard;
