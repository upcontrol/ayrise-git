import { Metadata } from "next"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import { Separator } from "@/registry/new-york/ui/separator"
import { DynamicBreadcrumb } from "@/components/DynamicBreadcrumb"

export const metadata: Metadata = {
  title: "Forms",
  description: "Advanced form example using react-hook-form and Zod.",
}

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <>
      <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background">
          <div className="flex flex-1 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb />
          </div>
        </header>
        <div className="mx-auto max-w-4xl p-6">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">
              Manage your account settings and set e-mail preferences.
            </p>
          </div>
          <Separator className="my-6" />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
    </>
  )
}
