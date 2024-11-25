"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { AreaChartDash } from "@/components/area-chart-dash"
import { BarChartComponent } from "@/components/bar-chart"
import { CardsCalendar } from "@/components/dash-comp/calendar-dash"
import { CardsDataTable } from "@/components/dash-comp/payments-table"
import { CardsReportIssue } from "@/components/dash-comp/report-issue"
import { CardsTeamMembers } from "@/components/dash-comp/team-members"
import { DynamicBreadcrumb } from "@/components/DynamicBreadcrumb"
import { MonthlyTrafficChart } from "@/components/monthly-traffic-chart"
import { RadialChartVisitor } from "@/components/radial-chart-visitor"
import RecentSales from "@/components/recent-sales"
import TotalEarningComp from "@/components/total-earning"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import * as React from "react"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

export default function Page() {
  const { isAuthenticated, isLoading, checkAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      if (!isLoading && !isAuthenticated) {
        const authResult = await checkAuth()
        if (!authResult) {
          router.push('/auth/login')
        }
      }
    }
    init()
  }, [isLoading, isAuthenticated, checkAuth, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0"><TotalEarningComp />
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="p-6 pt-0"><BarChartComponent /></div>
            <div className="p-6 pt-0"><AreaChartDash/></div>
            <div className="p-6 pt-0" ><RecentSales/></div>
          </div>

          <div className="grid auto-rows-min gap-4 md:grid-cols-1">
            <div className="p-6 pt-0"><MonthlyTrafficChart/></div>
          </div>

          <div className="grid auto-rows-min gap-4 md:grid-cols-2">
            <div className="p-6 pt-0"><CardsReportIssue/></div>
            <div className="p-6 pt-0"><CardsDataTable/></div>
          </div>

          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="p-6 pt-0"><RadialChartVisitor/></div>
            <div className="p-6 pt-0"><CardsTeamMembers/></div>
            <div className="p-6 pt-0"><CardsCalendar/></div>
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
