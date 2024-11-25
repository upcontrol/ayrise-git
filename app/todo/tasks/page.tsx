import { Metadata } from "next"
import { TasksPageWrapper } from "@/components/tasks/tasks-page-wrapper"
import { AppSidebar } from "@/components/app-sidebar"
import { DynamicBreadcrumb } from "@/components/DynamicBreadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export const metadata: Metadata = {
  title: "Tasks",
  description: "A task and issue tracking system.",
}

export default function TasksRoute() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <TasksPageWrapper />
        </div>
      </SidebarInset>
    </SidebarProvider>
  
  

  )
}