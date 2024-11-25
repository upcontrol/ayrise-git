"use client"

import { TasksPage } from "./tasks-page"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function TasksPageWrapper() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <TasksPage />
    </QueryClientProvider>
  )
}